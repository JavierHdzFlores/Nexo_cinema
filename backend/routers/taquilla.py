from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from datetime import datetime

router = APIRouter(
    prefix="/taquilla",
    tags=["taquilla"]
)

# IMPLEMENTACIÓN: Diagrama de Secuencia y Casos de Uso
@router.post("/vender", response_model=schemas.VentaTaquillaResponse)
def registrar_venta_taquilla(datos_venta: schemas.VentaTaquillaRequest, db: Session = Depends(get_db)):
    
    # 1. Mensaje de consulta (Secuencia): Verificar el Evento
    evento = db.query(models.Evento).filter(models.Evento.id_evento == datos_venta.id_evento).first()
    if not evento:
        raise HTTPException(status_code=404, detail="El evento/función no existe")

    # 2. IMPLEMENTACIÓN: Diagrama de Estados (Validación de Asientos)
    asientos = db.query(models.Asiento).filter(models.Asiento.id_asiento.in_(datos_venta.ids_asientos)).all()
    
    if len(asientos) != len(datos_venta.ids_asientos):
        raise HTTPException(status_code=404, detail="Uno o más asientos no encontrados")

    for asiento in asientos:
        # Solo permitimos la transición de 'Disponible' a 'Ocupado'
        if asiento.estado != "Disponible":
            raise HTTPException(
                status_code=400, 
                detail=f"Asiento {asiento.numero} no disponible (Estado actual: {asiento.estado})"
            )

    # 3. Responsabilidad: Cálculo del total
    total_venta = len(asientos) * evento.precio_boleto
    
    nueva_venta = models.Venta(
        id_empleado=datos_venta.id_taquillero,
        fecha_venta=datetime.now(),
        total=total_venta,
        metodo_pago=datos_venta.metodo_pago
    )
    
    try:
        db.add(nueva_venta)
        db.flush() 

        # 4. Diagrama de Comportamiento: Generar boletos y cambiar estados
        for asiento in asientos:
            asiento.estado = "Ocupado" # Cambio de Estado
            
            nuevo_boleto = models.Boleto(
                id_venta=nueva_venta.id_venta,
                id_evento=evento.id_evento,
                id_asiento=asiento.id_asiento,
                precio_final=evento.precio_boleto
            )
            db.add(nuevo_boleto)

        db.commit()
        db.refresh(nueva_venta)
        return nueva_venta

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en la transacción: {str(e)}")

@router.get("/cartelera", response_model=list[schemas.FuncionTaquillaResponse])
def consultar_cartelera(db: Session = Depends(get_db)):
    # Simula el Diagrama de Comunicación para obtener funciones activas
    return db.query(models.Evento).all()