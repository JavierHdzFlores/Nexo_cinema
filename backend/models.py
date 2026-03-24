from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Sala(Base):
    __tablename__ = "salas"
    id_sala = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, index=True)
    capacidad = Column(Integer, nullable=False)
    estado = Column(String(20), default="Disponible") # Disponible, En limpieza, Evento Privado
    tipo = Column(String(20)) # VIP, IMAX, Tradicional


class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), unique=True, index=True)
    password = Column(String(255), nullable=False)
    tipo_usuario = Column(String(50)) # Columna discriminadora

    # Configuración del Polimorfismo
    __mapper_args__ = {
        "polymorphic_identity": "usuario",
        "polymorphic_on": tipo_usuario,
    }

class Cliente(Usuario):
    __tablename__ = "clientes"
    id_cliente = Column(Integer, ForeignKey("usuarios.id_usuario"), primary_key=True)
    puntos_monedero = Column(Integer, default=0)
    
    __mapper_args__ = {"polymorphic_identity": "cliente"}

class Empleado(Usuario):
    __tablename__ = "empleados"
    id_empleado = Column(Integer, ForeignKey("usuarios.id_usuario"), primary_key=True)
    puesto = Column(String(50))
    turno = Column(String(50))

    __mapper_args__ = {"polymorphic_identity": "empleado"}


class Evento(Base):
    __tablename__ = "eventos"
    id_evento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sala = Column(Integer, ForeignKey("salas.id_sala"))
    fecha_hora_inicio = Column(DateTime, default=datetime.datetime.utcnow)
    fecha_hora_fin = Column(DateTime)
    tipo_evento = Column(String(50)) # Columna discriminadora

    # Relación con la sala
    sala = relationship("Sala")

    __mapper_args__ = {
        "polymorphic_identity": "evento",
        "polymorphic_on": tipo_evento,
    }

class ProyeccionPublica(Evento):
    __tablename__ = "proyecciones_publicas"
    id_proyeccion = Column(Integer, ForeignKey("eventos.id_evento"), primary_key=True)
    pelicula = Column(String(100), nullable=False)
    clasificacion = Column(String(10))
    precio_boleto = Column(Float, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "proyeccion_publica"}

class EventoPrivado(Evento):
    __tablename__ = "eventos_privados"
    id_evento_privado = Column(Integer, ForeignKey("eventos.id_evento"), primary_key=True)
    organizador = Column(String(100))
    motivo = Column(String(200))
    costo_renta = Column(Float, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "evento_privado"}


class Venta(Base):
    __tablename__ = "ventas"
    id_venta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=True)
    fecha_venta = Column(DateTime, default=datetime.datetime.utcnow)
    total = Column(Float, nullable=False)

class ProductoDulceria(Base):
    __tablename__ = "productos_dulceria"
    id_producto = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    precio = Column(Float, nullable=False)
    stock_actual = Column(Integer, nullable=False)
    stock_minimo = Column(Integer, default=10) # Para las alertas de inventario