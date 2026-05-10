from database import SessionLocal
from models import Sala

db = SessionLocal()
nuevas_salas = [
    Sala(nombre="Sala 2", capacidad=50, tipo="Tradicional"),
    Sala(nombre="Sala 3", capacidad=50, tipo="Tradicional"),
    Sala(nombre="Sala 4", capacidad=50, tipo="Tradicional"),
    Sala(nombre="Sala 5", capacidad=50, tipo="Tradicional"),
    Sala(nombre="Sala 6", capacidad=50, tipo="Tradicional"),
    Sala(nombre="Sala 7", capacidad=50, tipo="Tradicional"),
    Sala(nombre="Sala 8", capacidad=30, tipo="VIP"),
    Sala(nombre="Sala 9", capacidad=30, tipo="VIP"),
    Sala(nombre="Sala 10", capacidad=70, tipo="Macro XE"),
    Sala(nombre="Sala 11", capacidad=40, tipo="4DX")
]

for s in nuevas_salas:
    exist = db.query(Sala).filter(Sala.nombre == s.nombre).first()
    if not exist:
        db.add(s)

db.commit()
db.close()
print("Salas agregadas")
