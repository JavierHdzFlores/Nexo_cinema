from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta

from database import get_db
from models import Evento, ProyeccionPublica, Asiento, Boleto, Venta, Cotizacion, Sala
import schemas

router = APIRouter(
    prefix="/api/taquilla",
    tags=["Taquilla y Cotizaciones"]
)

from procesador_venta import ValidadorTransaccion, ProcesadorVenta
from models import BloqueoAsiento
# ==========================================
# CU-04: ENDPOINTS DE CONSULTA (Frontend)
# ==========================================

@router.get("/funciones")
def listar_funciones(db: Session = Depends(get_db)):
    """Paso 1: El Taquillero selecciona la función deseada."""
    funciones = db.query(ProyeccionPublica).all()
    return [
        {
            "id": f.id_evento,
            "pelicula": f.pelicula_obj.titulo if f.pelicula_obj else "Desconocida",
            "clasificacion": f.pelicula_obj.clasificacion if f.pelicula_obj else "",
            "duracion_minutos": f.pelicula_obj.duracion_minutos if f.pelicula_obj else None,
            "fecha_hora_inicio": f.fecha_hora_inicio,
            "precio_boleto": f.precio_boleto,
            "id_sala": f.id_sala,
            "sala_nombre": f.sala.nombre if f.sala else "Sin sala",
            "sala_tipo": f.sala.tipo if f.sala else None,
            "sala_capacidad": f.sala.capacidad if f.sala else None,
            "imagen_url": f.pelicula_obj.imagen_url if f.pelicula_obj else ""
        }
        for f in funciones
    ]

@router.get("/eventos/{id_evento}/asientos")
def obtener_mapa_asientos(id_evento: int, db: Session = Depends(get_db)):
    """
    Paso 2: El sistema muestra el mapa de asientos con estado actual.
    Evalúa en tiempo real: disponible, ocupado o bloqueado.
    Implementa Excepción E2 (lazy): limpia bloqueos expirados antes de responder.
    """
    evento = db.query(Evento).filter(Evento.id_evento == id_evento).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")

    # Limpiar bloqueos expirados (E2)
    ValidadorTransaccion.limpiar_bloqueos_expirados(db)

    asientos = db.query(Asiento).filter(Asiento.id_sala == evento.id_sala).order_by(Asiento.numero).all()
    
    # Boletos ya vendidos para este evento
    boletos = db.query(Boleto.id_asiento).filter(Boleto.id_evento == id_evento).all()
    ids_vendidos = {b.id_asiento for b in boletos}
    
    # Bloqueos activos para este evento
    bloqueos = db.query(BloqueoAsiento).filter(
        BloqueoAsiento.id_evento == id_evento,
        BloqueoAsiento.fecha_expiracion > datetime.utcnow()
    ).all()
    bloqueos_map = {b.id_asiento: b.id_cliente_temp for b in bloqueos}

    mapa = []
    for asiento in asientos:
        if asiento.id_asiento in ids_vendidos:
            estado = "ocupado"
        elif asiento.id_asiento in bloqueos_map:
            estado = "bloqueado"
        else:
            estado = "disponible"
        
        mapa.append({
            "id_asiento": asiento.id_asiento,
            "numero": asiento.numero,
            "estado": estado,
            "bloqueado_por": bloqueos_map.get(asiento.id_asiento)
        })

    return {"id_evento": id_evento, "id_sala": evento.id_sala, "asientos": mapa}


# CU-04: VENDER BOLETOS EN TAQUILLA (Y BLOQUEOS)
# ==========================================

@router.post("/bloquear", status_code=status.HTTP_200_OK)
def bloquear_asientos_temporal(datos: schemas.BloqueoAsientosRequest, db: Session = Depends(get_db)):
    """
    PASO 4: El sistema bloquea temporalmente los asientos.
    """
    evento = db.query(Evento).filter(Evento.id_evento == datos.id_evento).first()
    if not ValidadorTransaccion.verificar_tipo_evento(evento):
        raise HTTPException(status_code=400, detail="Evento inválido para venta de boletos.")

    ValidadorTransaccion.validar_integridad_asientos(db, datos.ids_asientos, evento.id_sala)

    # Excepción E1: Asiento seleccionado por otro usuario
    if not ValidadorTransaccion.checar_disponibilidad_real(db, datos.ids_asientos, datos.id_evento, datos.id_cliente_temp):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Excepción E1: Uno o más asientos ya no están disponibles."
        )

    # Crear los bloqueos temporales por 5 minutos
    expiracion = datetime.utcnow() + timedelta(minutes=5)
    for id_asiento in datos.ids_asientos:
        # Usar UPSERT logic o eliminar bloqueos expirados primero
        db.query(BloqueoAsiento).filter(
            BloqueoAsiento.id_evento == datos.id_evento,
            BloqueoAsiento.id_asiento == id_asiento
        ).delete()
        
        nuevo_bloqueo = BloqueoAsiento(
            id_evento=datos.id_evento,
            id_asiento=id_asiento,
            fecha_expiracion=expiracion,
            id_cliente_temp=datos.id_cliente_temp
        )
        db.add(nuevo_bloqueo)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Error de concurrencia al bloquear.")

    return {"mensaje": "Asientos bloqueados exitosamente por 5 minutos.", "expira_en_minutos": 5}


@router.post("/vender", response_model=schemas.VentaTaquillaResponse, status_code=status.HTTP_201_CREATED)
def registrar_venta_taquilla(datos_venta: schemas.VentaTaquillaRequest, db: Session = Depends(get_db)):
    # 1. Validaciones base (Diagrama 4)
    evento = db.query(Evento).filter(Evento.id_evento == datos_venta.id_evento).first()
    if not ValidadorTransaccion.verificar_tipo_evento(evento):
        raise HTTPException(status_code=400, detail="Evento inválido para venta de boletos.")

    asientos = ValidadorTransaccion.validar_integridad_asientos(db, datos_venta.ids_asientos, evento.id_sala)

    # 2. Validar Disponibilidad final
    if not ValidadorTransaccion.checar_disponibilidad_real(db, datos_venta.ids_asientos, datos_venta.id_evento, datos_venta.id_cliente_temp):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Excepción E1: Uno o más asientos ya no están disponibles."
        )

    # 3. Cálculo del total y creación de la transacción
    total_venta = ProcesadorVenta.calcular_total(len(asientos), evento.precio_boleto)
    
    nueva_venta = Venta(
        id_empleado=datos_venta.id_taquillero,
        id_cliente=datos_venta.id_cliente,
        id_evento=evento.id_evento,
        fecha_venta=datetime.utcnow(),
        total=total_venta,
        metodo_pago=datos_venta.metodo_pago,
        estado="Completada"
    )
    
    try:
        # 4. Flush para obtener ID (Diagrama 4)
        nueva_venta.flush_para_id(db)

        # 5. Generar boletos
        ProcesadorVenta.generar_boletos_lote(db, nueva_venta.id_venta, evento.id_evento, asientos, evento.precio_boleto)
        
        # 6. Limpiar bloqueos que poseía este cliente para esta venta
        ProcesadorVenta.limpiar_bloqueos_propios(db, evento.id_evento, datos_venta.ids_asientos, datos_venta.id_cliente_temp)

        db.commit() # Si otro hilo intenta vender el mismo asiento sin bloqueo, chocará aquí.
        db.refresh(nueva_venta)
        
        return {
            "id_venta": nueva_venta.id_venta,
            "total": nueva_venta.total,
            "estado": nueva_venta.estado,
            "mensaje": "Venta procesada y asientos ocupados exitosamente.",
            "boletos_generados": len(asientos)
        }

    except IntegrityError as e:
        db.rollback()
        raise ProcesadorVenta.manejar_error_concurrencia(e)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en la transacción: {str(e)}")


# ==========================================
# CU-03: COTIZAR PAQUETES CORPORATIVOS
# ==========================================
# Diagrama 7 (Paquetes):  <<Controlador>> TaquillaRouter
#   usa_para_validar   → <<Validación>>       Pydantic_Schemas  (CotizacionCreate)
#   persiste_datos     → <<Persistencia>>     SQLAlchemy_Models  (Cotizacion)
#   requiere_sesion    → <<Infraestructura>>  Database_Session   (get_db)

from procesador_costos import ProcesadorCostos


# ── Diagrama 5: -verificar_disponibilidad(id_sala, inicio, fin) : List<Sala> ──
def _verificar_disponibilidad(id_sala: int, inicio: datetime, fin: datetime, db: Session) -> list:
    """
    Método privado del controlador.
    Diagrama 2 (Secuencia): filter(Evento.id_sala == id_sala) → Validación de disponibilidad.
    Diagrama 6 (Estados): Sub-estado 'Validando' dentro de 'Pendiente'.
    
    Retorna None si la sala está libre, o la lista de salas sugeridas si hay empalme.
    """
    empalme = db.query(Evento).filter(
        Evento.id_sala == id_sala,
        Evento.fecha_hora_inicio < fin,
        Evento.fecha_hora_fin > inicio
    ).first()

    if not empalme:
        return None  # Sala disponible

    # Diagrama 2 (Secuencia): query(Sala).notin_(ocupadas) → Sugerencias[]
    salas_ocupadas = db.query(Evento.id_sala).filter(
        Evento.fecha_hora_inicio < fin,
        Evento.fecha_hora_fin > inicio
    ).subquery()

    salas_disponibles = db.query(Sala).filter(Sala.id_sala.notin_(salas_ocupadas)).all()
    return [{"id_sala": s.id_sala, "nombre": s.nombre} for s in salas_disponibles]


# ── Diagrama 5: -notificar_error_empalme(sugerencias) : HTTPException ──
def _notificar_error_empalme(sugerencias: list):
    """
    Método privado del controlador.
    Diagrama 2 (Secuencia): 400 Bad Request + sugerencias → Taquillero.
    Diagrama 6 (Estados): Transición → 'Error' (sala_ocupada).
    """
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "mensaje": "La sala no está disponible en el horario solicitado.",
            "salas_sugeridas": sugerencias
        }
    )


# ── Diagrama 5: +generar_cotizacion(data: CotizacionCreate, db: Session) : dict ──
@router.post("/cotizacion", status_code=status.HTTP_201_CREATED)
def generar_cotizacion(cotizacion: schemas.CotizacionCreate, db: Session = Depends(get_db)):
    """
    Genera un presupuesto digital sin reservar/bloquear la sala.
    
    Diagrama 2 (Secuencia):  POST /cotizacion (JSON) → TaquillaRouter
    Diagrama 4 (Colaboración): 1: generar_cotizacion(data)
    Diagrama 6 (Estados):  post_cotizacion → Pendiente[Validando → Calculando → Generada]
    """

    # ─── FASE 1: Validando (Diagrama 6, sub-estado) ───
    sugerencias = _verificar_disponibilidad(
        cotizacion.id_sala, cotizacion.fecha_hora_inicio, cotizacion.fecha_hora_fin, db
    )
    if sugerencias is not None:
        _notificar_error_empalme(sugerencias)

    # ─── FASE 2: Calculando (Diagrama 6, sub-estado) ───
    # Diagrama 4: 3: total_seconds() / 3600 → Calculo_Horas
    horas = ProcesadorCostos.obtener_diferencia_horas(
        cotizacion.fecha_hora_inicio, cotizacion.fecha_hora_fin
    )
    costo_sala = ProcesadorCostos.calcular_costo_sala(horas, cotizacion.costo_base_hora)

    # Diagrama 4: 4: if(paquete == VIP) → Calculo_Dulceria
    tarifa_dulceria = ProcesadorCostos.determinar_tarifa_dulceria(cotizacion.paquete_dulceria)
    costo_dulceria = tarifa_dulceria * cotizacion.asistentes
    total = ProcesadorCostos.totalizar(costo_sala, tarifa_dulceria, cotizacion.asistentes)

    # ─── FASE 3: Generada (Diagrama 6, sub-estado) ───
    # Diagrama 5: ProcesadorCostos → "2. Setea Totales" → CotizacionModel
    vigencia = datetime.utcnow() + timedelta(days=15)

    nueva_cotizacion = Cotizacion(
        nombre_cliente=cotizacion.nombre_cliente,
        id_sala=cotizacion.id_sala,
        fecha_hora_inicio=cotizacion.fecha_hora_inicio,
        fecha_hora_fin=cotizacion.fecha_hora_fin,
        asistentes=cotizacion.asistentes,
        paquete_dulceria=cotizacion.paquete_dulceria,
        costo_sala=costo_sala,
        costo_dulceria=costo_dulceria,
        total=total,
        fecha_vigencia=vigencia
    )

    # Diagrama 4: 5: db.add(nueva_cotizacion) → MySQL
    # Diagrama 5: TaquillaRouter → "3. Persiste" → CotizacionModel
    nueva_cotizacion.crear_registro_db(db)

    # Diagrama 2 (Secuencia): 201 Created (Desglose Total) → Taquillero
    # Diagrama 4: 6: return JSON_Response
    return {
        "mensaje": "Cotización generada exitosamente",
        "id_cotizacion": nueva_cotizacion.id_cotizacion,
        "valida_hasta": nueva_cotizacion.fecha_vigencia,
        "desglose": {
            "costo_sala": costo_sala,
            "costo_dulceria": costo_dulceria,
            "gran_total": total
        }
    }