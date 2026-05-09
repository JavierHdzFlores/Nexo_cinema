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
# ESQUEMAS PARA GESTIÓN DE CARTELERA (CU-01)
# ==========================================

class ProyeccionPublicaCreate(BaseModel):
    """Esquema para cuando el Supervisor programa una nueva función"""
    id_sala: int
    nombre: str # Ej: "Estreno Spiderman"
    fecha_hora_inicio: datetime
    pelicula: str
    clasificacion: Optional[str] = None
    precio_boleto: float
    duracion_minutos: int

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
# ==========================================
# ESQUEMAS PARA TAQUILLA (CU-04)
# ==========================================
class BloqueoAsientosRequest(BaseModel):
    id_evento: int
    ids_asientos: list[int]
    id_cliente_temp: str  # Un UUID o string generado en el frontend para rastrear quién bloqueó

class VentaTaquillaRequest(BaseModel):
    id_evento: int
    ids_asientos: list[int]
    metodo_pago: str
    id_cliente_temp: str  # Debe coincidir con el que bloqueó
    id_taquillero: Optional[int] = None
    id_cliente: Optional[int] = None

class VentaTaquillaResponse(BaseModel):
    id_venta: int
    total: float
    estado: str
    mensaje: str
    boletos_generados: int

# Para listar funciones en la cartelera del taquillero
class FuncionTaquillaResponse(BaseModel):
    id: int
    pelicula: str
    fecha_hora_inicio: datetime
    precio_boleto: float

    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS PARA EVENTOS PRIVADOS (CU-02)
# ==========================================
class EventoPrivadoCreate(BaseModel):
    id_sala: int
    nombre_evento: str
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    organizador: str
    motivo: str
    req_microfonos: bool = False
    req_catering: bool = False
    req_iluminacion: bool = False
    costo_base_hora: float = 1000.0  # El precio que le cobren por hora a la sala

# ==========================================
# ESQUEMAS PARA COTIZACIONES (CU-03)
# ==========================================
class CotizacionCreate(BaseModel):
    nombre_cliente: str
    id_sala: int
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    asistentes: int
    paquete_dulceria: str  # Ej: "Basico", "Premium", "VIP"
    costo_base_hora: float = 1000.0 # Precio de la sala por hora