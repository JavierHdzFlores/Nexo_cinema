from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta # <-- NUEVO: Para sumar los minutos de duración y limpieza

# Ajusta las importaciones según tu estructura
from database import get_db 
from models import ProyeccionPublica, Evento, Pelicula, EventoPrivado, Sala
import schemas
import pdf_utils

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

@router.get("/peliculas", response_model=List[schemas.PeliculaResponse])
def obtener_catalogo_peliculas(db: Session = Depends(get_db)):
    """
    Obtiene el catálogo maestro de películas para programar funciones
    """
    peliculas = db.query(Pelicula).all()
    if not peliculas:
        raise HTTPException(status_code=404, detail="No hay películas en el catálogo")
    return peliculas

@router.get("/salas", response_model=List[schemas.SalaResponse])
def obtener_salas(db: Session = Depends(get_db)):
    """
    Devuelve el catálogo de salas del cine.
    Compartido con Taquilla: ambos módulos referencian la misma tabla salas.
    """
    salas = db.query(Sala).order_by(Sala.id_sala).all()
    if not salas:
        raise HTTPException(status_code=404, detail="No hay salas registradas")
    return salas

from datetime import datetime
@router.get("/salas-disponibles", response_model=List[schemas.SalaResponse])
def obtener_salas_disponibles(inicio: str, fin: str, db: Session = Depends(get_db)):
    """
    Devuelve las salas que NO tienen eventos programados en el rango de tiempo indicado.
    """
    try:
        dt_inicio = datetime.fromisoformat(inicio)
        dt_fin = datetime.fromisoformat(fin)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use ISO format.")

    if dt_inicio >= dt_fin:
        raise HTTPException(status_code=400, detail="La hora de inicio debe ser anterior a la hora de fin.")

    # Buscar salas que tengan algún evento que se empalme
    salas_ocupadas = db.query(Evento.id_sala).filter(
        Evento.fecha_hora_inicio < dt_fin,
        Evento.fecha_hora_fin > dt_inicio
    ).distinct().all()
    
    ids_ocupados = [s[0] for s in salas_ocupadas]

    # Traer las salas que NO están en la lista de ocupadas
    if ids_ocupados:
        salas_disponibles = db.query(Sala).filter(~Sala.id_sala.in_(ids_ocupados)).order_by(Sala.id_sala).all()
    else:
        salas_disponibles = db.query(Sala).order_by(Sala.id_sala).all()

    return salas_disponibles



# ==========================================
# POST: PROGRAMAR NUEVA FUNCIÓN (CU-01)
# ==========================================
@router.post("/proyeccion", status_code=status.HTTP_201_CREATED)
def programar_funcion(funcion: schemas.ProyeccionPublicaCreate, db: Session = Depends(get_db)):
    """
    Permite al Supervisor programar una nueva función evitando empalmes.
    Implementado con POO estricto según diagramas CU-01.
    """
    # Buscar Sala y Película
    sala = db.query(Sala).filter(Sala.id_sala == funcion.id_sala).first()
    if not sala:
        raise HTTPException(status_code=404, detail="Sala no encontrada")

    pelicula_db = db.query(Pelicula).filter(Pelicula.id_pelicula == funcion.id_pelicula).first()
    if not pelicula_db:
        raise HTTPException(status_code=404, detail="La película seleccionada no existe en el catálogo")

    # 1. Instanciar la Función (Proyección)
    nueva_proyeccion = ProyeccionPublica(
        id_sala=funcion.id_sala,
        nombre=f"Función: {pelicula_db.titulo}",
        fecha_hora_inicio=funcion.fecha_hora_inicio,
        id_pelicula=funcion.id_pelicula,
        precio_boleto=funcion.precio_boleto
    )
    
    # Asignamos el objeto película para que la clase pueda usar sus datos
    nueva_proyeccion.pelicula_obj = pelicula_db

    # 2. Responsabilidad de Función: Calcular hora fin (duración + limpieza)
    nueva_proyeccion.fecha_hora_fin = nueva_proyeccion.calcularHoraFin()

    # 3. Responsabilidad de Sala: Validar empalmes de horario
    if sala.validarEmpalmes(db, nueva_proyeccion.fecha_hora_inicio, nueva_proyeccion.fecha_hora_fin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflicto de horario: La sala está ocupada o en limpieza en ese intervalo"
        )

    # 4. Responsabilidad de Función: Registrar función (Persistir y habilitar venta)
    nueva_proyeccion.registrarFuncion(db)

    # 5. Responsabilidad de Función: Mostrar resumen
    resumen_generado = nueva_proyeccion.mostrarResumen()

    return {
        "mensaje": "Función programada exitosamente y habilitada para venta",
        "resumen": resumen_generado,
        "id_proyeccion": nueva_proyeccion.id_evento,
        "horario_inicio": nueva_proyeccion.fecha_hora_inicio,
        "horario_fin_con_limpieza": nueva_proyeccion.fecha_hora_fin
    }

@router.post("/renta-sala", status_code=status.HTTP_201_CREATED)
def rentar_sala_privada(renta: schemas.EventoPrivadoCreate, db: Session = Depends(get_db)):
    """
    CU-02: Gestionar Renta de Sala (Evento Privado)
    Implementado con Programación Orientada a Objetos según Arquitectura
    """
    sala = db.query(Sala).filter(Sala.id_sala == renta.id_sala).first()
    if not sala:
        raise HTTPException(status_code=404, detail="Sala no encontrada")

    # 1. Responsabilidad de la Sala: Verificar boletos vendidos (Excepción E1)
    if sala.verificarBoletosVendidos(db, renta.fecha_hora_inicio, renta.fecha_hora_fin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imposible rentar: Existen boletos vendidos para una función en este horario."
        )

    # 2. Buscar empalmes generales (funciones sin boletos vendidos aún)
    empalmes = db.query(Evento).filter(
        Evento.id_sala == renta.id_sala,
        Evento.fecha_hora_inicio < renta.fecha_hora_fin,
        Evento.fecha_hora_fin > renta.fecha_hora_inicio
    ).all()
    if empalmes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La sala ya tiene funciones programadas en este horario."
        )

    # Calcular costo base por horas
    diferencia_horas = (renta.fecha_hora_fin - renta.fecha_hora_inicio).total_seconds() / 3600
    renta_base = diferencia_horas * renta.costo_base_hora

    # 3. Instanciar EventoPrivado (POO)
    nuevo_evento = EventoPrivado(
        id_sala=renta.id_sala,
        nombre=renta.nombre_evento,
        fecha_hora_inicio=renta.fecha_hora_inicio,
        fecha_hora_fin=renta.fecha_hora_fin,
        organizador=renta.organizador,
        motivo=renta.motivo,
        costo_renta=renta_base
    )

    # 4. Responsabilidad de EventoPrivado: Agregar Servicios Adicionales
    if renta.req_microfonos: nuevo_evento.agregarServicio("microfonos")
    if renta.req_catering: nuevo_evento.agregarServicio("catering")
    if renta.req_iluminacion: nuevo_evento.agregarServicio("iluminacion")

    # 5. Responsabilidad de EventoPrivado: Calcular costo total de renta
    costo_total = nuevo_evento.calcularCostoTotal()
    nuevo_evento.costo_renta = costo_total # Persistir el calculo

    # 6. Responsabilidad de Sala: Bloquearse para la venta pública
    sala.bloquearParaTaquilla()

    # 7. Persistir la transacción
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)

    # 8. Responsabilidad final (Generar Orden de Cobro en memoria simulada)
    nuevo_evento.generarOrdenCobro()

    return {
        "mensaje": "Sala rentada y bloqueada exitosamente",
        "id_evento": nuevo_evento.id_evento,
        "desglose_cobro": {
            "horas_rentadas": round(diferencia_horas, 2),
            "costo_servicios_adicionales": costo_total - renta_base,
            "gran_total": costo_total
        }
    }

@router.get("/renta-sala/{id_evento}/contrato-pdf")
def descargar_contrato_renta(id_evento: int, db: Session = Depends(get_db)):
    """
    CU-02 Especial: Generación de contrato de renta y factura especial en PDF.
    """
    evento = db.query(EventoPrivado).filter(EventoPrivado.id_evento == id_evento).first()
    
    if not evento:
        raise HTTPException(status_code=404, detail="Evento privado no encontrado")
        
    pdf_buffer = pdf_utils.generar_contrato_renta(evento)
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=contrato_renta_{id_evento}.pdf"}
    )