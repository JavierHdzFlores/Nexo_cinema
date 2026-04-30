from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Sala, Insumo, MovimientoInventario, AlertaStock
import schemas


router = APIRouter(
    prefix="/api/operaciones",
    tags=["Operaciones"]
    )



@router.put("/{id_sala}/estado", response_model=schemas.SalaResponse)
def actualizar_estado_sala(
    id_sala: int,
    datos: schemas.SalaEstadoUpdate,
    db: Session = Depends(get_db)
):
    """
    CU-07: Actualizar estado de sala con registro de limpieza
    """

    sala = db.query(Sala).filter(Sala.id_sala == id_sala).first()

    if not sala:
        raise HTTPException(status_code=404, detail="Sala no encontrada")

    estado_actual = sala.estado

    # 🔍 Validación según tu diagrama
    if estado_actual == "En limpieza" and datos.estado == "Disponible":

        # 1. Cambiar estado
        sala.estado = "Disponible"

        # 2. Crear registro de limpieza
        registro = RegistroLimpieza(
            id_sala=sala.id_sala,
            fecha_fin=datetime.datetime.utcnow()
        )

        db.add(registro)

    else:
        # Cambio normal (otros casos)
        estados_validos = ["Disponible", "En limpieza", "Evento Privado"]

        if datos.estado not in estados_validos:
            raise HTTPException(
                status_code=400,
                detail=f"Estado inválido: {estados_validos}"
            )

        sala.estado = datos.estado

    # Guardar cambios
    db.commit()
    db.refresh(sala)

    return sala


@router.post("/entrada", response_model=schemas.InsumoResponse)
def registrar_entrada(
    datos: schemas.InventarioEntrada,
    db: Session = Depends(get_db)
):
    """
    CU-08: Registrar entrada de inventario
    """

    # 1. Validar insumo
    insumo = db.query(Insumo).filter(Insumo.id_insumo == datos.id_insumo).first()

    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no existe")

    # 2. Validar cantidad
    if datos.cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")

    # 3. Actualizar stock
    insumo.actualizar_stock(datos.cantidad)

    # 4. Crear movimiento
    movimiento = MovimientoInventario(
        id_insumo=insumo.id_insumo,
        tipo="entrada",
        cantidad=datos.cantidad
    )

    db.add(movimiento)

    # 5. Verificar stock mínimo
    if insumo.stock_actual < insumo.stock_minimo:

        alerta = AlertaStock(
            id_insumo=insumo.id_insumo,
            mensaje=f"Stock bajo para {insumo.nombre}"
        )

        db.add(alerta)

    # 6. Guardar todo
    db.commit()
    db.refresh(insumo)

    return insumo