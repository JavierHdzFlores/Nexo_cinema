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

# ==========================================
# ESQUEMAS PARA SALAS
# ==========================================

class SalaEstadoUpdate(BaseModel):
    estado: str

class SalaResponse(BaseModel):
    id_sala: int
    nombre: str
    capacidad: int
    estado: str
    tipo: str

    class Config:
        from_attributes = True


# ==========================================
# ESQUEMAS PARA SALAS
# ==========================================

class InventarioEntrada(BaseModel):
    id_insumo: int
    cantidad: int

class InsumoResponse(BaseModel):
    id_insumo: int
    nombre: str
    stock_actual: int
    stock_minimo: int

    class Config:
        from_attributes = True