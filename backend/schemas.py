from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ==========================================
# ESQUEMAS PARA EVENTOS Y CARTELERA
# ==========================================

class EventoBase(BaseModel):
    nombre: str
    fecha_hora_inicio: datetime
    fecha_hora_fin: Optional[datetime] = None

class ProyeccionPublicaResponse(EventoBase):
    id_evento: int
    pelicula: str
    clasificacion: Optional[str] = None
    precio_boleto: float

    # Esto permite que Pydantic lea directamente desde el modelo de SQLAlchemy
    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS PARA USUARIOS / CLIENTES (Ejemplo para cuando los necesites)
# ==========================================

class ClienteResponse(BaseModel):
    id_cliente: int
    nombre: str
    correo: str
    rfc: Optional[str] = None
    puntos_monedero: int

    class Config:
        from_attributes = True