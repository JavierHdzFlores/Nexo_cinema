from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta # <-- NUEVO: Para sumar los minutos de duración y limpieza

# Ajusta las importaciones según tu estructura
from database import get_db 
from models import ProyeccionPublica, Evento # <-- NUEVO: Importamos Evento para checar empalmes
import schemas

router = APIRouter(
    prefix="/api/cartelera",
    tags=["Cartelera"]
)

@router.get("/", response_model=List[schemas.ProyeccionPublicaResponse])
def obtener_cartelera(db: Session = Depends(get_db)):
    """
    Obtiene todas las proyecciones públicas (películas en cartelera)
    """
    proyecciones = db.query(ProyeccionPublica).all()
    
    if not proyecciones:
        raise HTTPException(status_code=404, detail="No hay películas en cartelera")
        
    return proyecciones


# ==========================================
# POST: PROGRAMAR NUEVA FUNCIÓN (CU-01)
# ==========================================
@router.post("/proyeccion", status_code=status.HTTP_201_CREATED)
def programar_funcion(funcion: schemas.ProyeccionPublicaCreate, db: Session = Depends(get_db)):
    """
    Permite al Supervisor programar una nueva función evitando empalmes.
    Calcula automáticamente el tiempo de limpieza.
    """
    # 1. Calcular la hora de fin (Duración de la peli + 30 min de limpieza)
    tiempo_total_minutos = funcion.duracion_minutos + 30
    fecha_hora_fin_calculada = funcion.fecha_hora_inicio + timedelta(minutes=tiempo_total_minutos)

    # 2. Validar empalmes en la misma sala (Regla de negocio / Excepción E1)
    # La fórmula mágica: Un empalme ocurre si un evento existente en la sala
    # empieza ANTES de que termine el nuevo, Y termina DESPUÉS de que empiece el nuevo.
    empalme = db.query(Evento).filter(
        Evento.id_sala == funcion.id_sala,
        Evento.fecha_hora_inicio < fecha_hora_fin_calculada,
        Evento.fecha_hora_fin > funcion.fecha_hora_inicio
    ).first()

    if empalme:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflicto de horario: La sala está ocupada o en limpieza en ese intervalo"
        )

    # 3. Si no hay empalme, crear la nueva proyección
    nueva_proyeccion = ProyeccionPublica(
        id_sala=funcion.id_sala,
        nombre=funcion.nombre,
        fecha_hora_inicio=funcion.fecha_hora_inicio,
        fecha_hora_fin=fecha_hora_fin_calculada, # <- Insertamos la fecha que el backend calculó
        pelicula=funcion.pelicula,
        clasificacion=funcion.clasificacion,
        precio_boleto=funcion.precio_boleto,
        duracion_minutos=funcion.duracion_minutos
    )

    # 4. Guardar en BD
    db.add(nueva_proyeccion)
    db.commit()
    db.refresh(nueva_proyeccion)

    return {
        "mensaje": "Función programada exitosamente y habilitada para venta",
        "id_proyeccion": nueva_proyeccion.id_evento,
        "horario_inicio": nueva_proyeccion.fecha_hora_inicio,
        "horario_fin_con_limpieza": nueva_proyeccion.fecha_hora_fin
    }

@router.post("/renta-sala", status_code=status.HTTP_201_CREATED)
def rentar_sala_privada(renta: schemas.EventoPrivadoCreate, db: Session = Depends(get_db)):
    """
    CU-02: Gestionar Renta de Sala (Evento Privado)
    Bloquea la sala y calcula el total basado en horas y servicios.
    """
    # 1. Buscar si hay eventos que se empalman en ese horario
    empalmes = db.query(Evento).filter(
        Evento.id_sala == renta.id_sala,
        Evento.fecha_hora_inicio < renta.fecha_hora_fin,
        Evento.fecha_hora_fin > renta.fecha_hora_inicio
    ).all()

    # 2. Excepción E1: Validar que no haya boletos vendidos
    if empalmes:
        for evento in empalmes:
            # Si el evento empalmado tiene ventas registradas, lanzamos el error crítico
            if len(evento.ventas) > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Imposible rentar: Existen boletos vendidos para una función en este horario."
                )
        
        # Si hay empalme pero SIN boletos (una función vacía), igual la bloqueamos por precaución
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La sala ya tiene funciones programadas en este horario."
        )

    # 3. Calcular el costo de la renta (Precio por hora + Servicios Adicionales)
    diferencia_horas = (renta.fecha_hora_fin - renta.fecha_hora_inicio).total_seconds() / 3600
    costo_total = diferencia_horas * renta.costo_base_hora

    # Precios fijos de ejemplo para los servicios adicionales
    if renta.req_microfonos: costo_total += 500.0
    if renta.req_catering: costo_total += 3500.0
    if renta.req_iluminacion: costo_total += 1200.0

    # 4. Registrar el evento privado
    nuevo_evento = EventoPrivado(
        id_sala=renta.id_sala,
        nombre=renta.nombre_evento,
        fecha_hora_inicio=renta.fecha_hora_inicio,
        fecha_hora_fin=renta.fecha_hora_fin,
        organizador=renta.organizador,
        motivo=renta.motivo,
        costo_renta=costo_total,
        req_microfonos=renta.req_microfonos,
        req_catering=renta.req_catering,
        req_iluminacion=renta.req_iluminacion
    )

    # 5. Cambiar el estado de la sala a "Evento Privado" (Postcondición)
    sala = db.query(Sala).filter(Sala.id_sala == renta.id_sala).first()
    if sala:
        sala.estado = "Evento Privado"

    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)

    return {
        "mensaje": "Sala rentada y bloqueada exitosamente",
        "id_evento": nuevo_evento.id_evento,
        "desglose_cobro": {
            "horas_rentadas": round(diferencia_horas, 2),
            "costo_servicios_adicionales": costo_total - (diferencia_horas * renta.costo_base_hora),
            "gran_total": costo_total
        }
    }