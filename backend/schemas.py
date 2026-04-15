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
# ESQUEMAS PARA AUTENTICACIÓN / LOGIN
# ==========================================

class LoginRequest(BaseModel):
    correo: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    usuario_id: int
    nombre: str
    tipo_usuario: str
    puesto: Optional[str] = None # Por si es empleado

# ==========================================
# ESQUEMAS PARA CREACIÓN DE USUARIOS (STAFF)
# ==========================================

class EmpleadoCreate(BaseModel):
    nombre: str
    correo: str
    password: str
    puesto: str
    turno: str

class GerenteCreate(BaseModel):
    nombre: str
    correo: str
    password: str
    matricula: str