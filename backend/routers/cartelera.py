from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Ajusta las importaciones según tu estructura
from database import get_db # Asumo que tienes una dependencia que genera la sesión
from models import ProyeccionPublica
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