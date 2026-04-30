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

# ==========================================
# CU-04: VENDER BOLETOS EN TAQUILLA
# ==========================================
@router.post("/vender", response_model=schemas.VentaTaquillaResponse, status_code=status.HTTP_201_CREATED)
def registrar_venta_taquilla(datos_venta: schemas.VentaTaquillaRequest, db: Session = Depends(get_db)):
    # 1. Verificar que el evento exista y sea una Proyección Pública
    evento = db.query(Evento).filter(Evento.id_evento == datos_venta.id_evento).first()
    if not evento:
        raise HTTPException(status_code=404, detail="El evento no existe.")
        
    if not isinstance(evento, ProyeccionPublica):
        raise HTTPException(status_code=400, detail="No se pueden vender boletos individuales para eventos privados.")

    # 2. Verificar que los asientos existan y pertenezcan a la sala del evento
    asientos = db.query(Asiento).filter(Asiento.id_asiento.in_(datos_venta.ids_asientos)).all()
    if len(asientos) != len(datos_venta.ids_asientos):
        raise HTTPException(status_code=404, detail="Uno o más asientos no existen en el sistema.")
        
    for asiento in asientos:
        if asiento.id_sala != evento.id_sala:
            raise HTTPException(status_code=400, detail=f"El asiento {asiento.numero} no pertenece a la sala de esta función.")

    # 3. Validar Disponibilidad (Excepción E1: Asiento seleccionado por otro usuario)
    boletos_vendidos = db.query(Boleto).filter(
        Boleto.id_evento == evento.id_evento,
        Boleto.id_asiento.in_(datos_venta.ids_asientos)
    ).all()
    
    if boletos_vendidos:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Uno o más asientos ya no están disponibles."
        )

    # 4. Cálculo del total y creación de la transacción
    total_venta = len(asientos) * evento.precio_boleto
    
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
        db.add(nueva_venta)
        db.flush() # Empuja la venta para obtener el id_venta

        # 5. Generar boletos y "Bloquear/Ocupar" permanentemente los asientos
        for asiento in asientos:
            nuevo_boleto = Boleto(
                id_venta=nueva_venta.id_venta,
                id_evento=evento.id_evento,
                id_asiento=asiento.id_asiento,
                precio_final=evento.precio_boleto
            )
            db.add(nuevo_boleto)

        db.commit() # Si otro hilo intenta vender el mismo asiento, chocará aquí gracias al UniqueConstraint
        db.refresh(nueva_venta)
        
        return {
            "id_venta": nueva_venta.id_venta,
            "total": nueva_venta.total,
            "estado": nueva_venta.estado,
            "mensaje": "Venta procesada y asientos ocupados exitosamente.",
            "boletos_generados": len(asientos)
        }

    except IntegrityError:
        # Excepción crítica de concurrencia: Alguien nos ganó el asiento en milisegundos
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Excepción de concurrencia: Uno o más asientos ya no están disponibles."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en la transacción: {str(e)}")


# ==========================================
# CU-03: COTIZAR PAQUETES CORPORATIVOS
# ==========================================
@router.post("/cotizacion", status_code=status.HTTP_201_CREATED)
def generar_cotizacion(cotizacion: schemas.CotizacionCreate, db: Session = Depends(get_db)):
    """
    Genera un presupuesto digital sin reservar/bloquear la sala.
    """
    empalmes = db.query(Evento).filter(
        Evento.id_sala == cotizacion.id_sala,
        Evento.fecha_hora_inicio < cotizacion.fecha_hora_fin,
        Evento.fecha_hora_fin > cotizacion.fecha_hora_inicio
    ).first()

    if empalmes:
        salas_ocupadas = db.query(Evento.id_sala).filter(
            Evento.fecha_hora_inicio < cotizacion.fecha_hora_fin,
            Evento.fecha_hora_fin > cotizacion.fecha_hora_inicio
        ).subquery()

        salas_disponibles = db.query(Sala).filter(Sala.id_sala.notin_(salas_ocupadas)).all()
        sugerencias = [{"id_sala": s.id_sala, "nombre": s.nombre} for s in salas_disponibles]

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "mensaje": "La sala no está disponible en el horario solicitado.",
                "salas_sugeridas": sugerencias
            }
        )

    diferencia_horas = (cotizacion.fecha_hora_fin - cotizacion.fecha_hora_inicio).total_seconds() / 3600
    costo_sala = diferencia_horas * cotizacion.costo_base_hora

    precio_por_persona = 0
    if cotizacion.paquete_dulceria.lower() == "basico":
        precio_por_persona = 150.0
    elif cotizacion.paquete_dulceria.lower() == "premium":
        precio_por_persona = 250.0
    elif cotizacion.paquete_dulceria.lower() == "vip":
        precio_por_persona = 400.0
    
    costo_dulceria = precio_por_persona * cotizacion.asistentes
    total_cotizacion = costo_sala + costo_dulceria
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
        total=total_cotizacion,
        fecha_vigencia=vigencia
    )

    db.add(nueva_cotizacion)
    db.commit()
    db.refresh(nueva_cotizacion)

    return {
        "mensaje": "Cotización generada exitosamente",
        "id_cotizacion": nueva_cotizacion.id_cotizacion,
        "valida_hasta": nueva_cotizacion.fecha_vigencia,
        "desglose": {
            "costo_sala": costo_sala,
            "costo_dulceria": costo_dulceria,
            "gran_total": total_cotizacion
        }
    }