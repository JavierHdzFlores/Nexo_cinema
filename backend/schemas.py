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
# ESQUEMA INVENTARIO 
# ==========================================
class InventarioEntrada(BaseModel):
    id_insumo: int
    cantidad: int

class InsumoResponse(BaseModel):
    id_insumo: int
    nombre: str
    stock_actual: int
    stock_minimo: int
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

class ClienteCreate(BaseModel):
    nombre: str
    correo: str
    password: str
    rfc: Optional[str] = None
    codigo_postal: Optional[str] = None
    

# ==========================================
# ESQUEMAS PARA DULCERÍA Y LEALTAD (CU-05, CU-06)
# ==========================================

class ArticuloDulceriaResponse(BaseModel):
    id_articulo: int
    nombre: str
    precio: float
    tipo_articulo: str

    class Config:
        from_attributes = True

class DetalleVentaRequest(BaseModel):
    id_articulo: int
    cantidad: int

class VentaDulceriaRequest(BaseModel):
    id_cliente: Optional[int] = None
    detalles: list[DetalleVentaRequest]
    usar_puntos: bool = False
    puntos_a_usar: Optional[int] = 0

class MovimientoMonederoResponse(BaseModel):
    """
    Representa el comprobante de puntos del Ticket (CU-06).
    Diagrama 4: Ticket.generarDetalle(saldoAnt, mov, saldoNvo)
    """
    tipo_movimiento: str          # "Acumulacion" | "Canje" | "Sin movimiento"
    saldo_anterior: int
    puntos_movimiento: int        # positivo = acumulación, negativo = canje
    saldo_nuevo: int

class VentaDulceriaResponse(BaseModel):
    id_venta: int
    total: float
    estado: str
    mensaje: str
    # CU-06: Comprobante de monedero (Optional — solo si hubo cliente identificado)
    monedero: Optional[MovimientoMonederoResponse] = None
# Representa el Diagrama de Clases con Responsabilidades (Entrada)
class VentaTaquillaRequest(BaseModel):
    id_taquillero: int
    id_evento: int  
    ids_asientos: list[int]
    metodo_pago: str

# Representa el Diagrama de Comunicación (Salida)
class VentaTaquillaResponse(BaseModel):
    id_venta: int
    id_empleado: int
    fecha_venta: datetime
    total: float
    metodo_pago: str

    class Config:
        from_attributes = True

# Para listar funciones en la cartelera del taquillero
class FuncionTaquillaResponse(BaseModel):
    id: int
    pelicula: str
    fecha_hora_inicio: datetime
    precio_boleto: float

    class Config:
        from_attributes = True