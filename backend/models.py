# backend/models.py
from sqlalchemy import Column, Integer, String
from database import Base



class Sala(Base):
    __tablename__ = "salas"  # Nombre de la tabla en MySQL

    id_sala = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, index=True)
    capacidad = Column(Integer, nullable=False)
    estado = Column(String(20), default="Disponible") # Disponible, En limpieza, Evento Privado
    tipo = Column(String(20)) # VIP, IMAX, Tradicional