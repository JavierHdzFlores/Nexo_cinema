# backend/seed.py
from database import SessionLocal
from models import Sala, Cliente, Empleado, ProyeccionPublica, EventoPrivado, ProductoDulceria
import datetime

def poblar_base_de_datos():
    db = SessionLocal()
    
    # Verificamos si ya hay salas para no duplicar datos si lo corres dos veces
    if db.query(Sala).first():
        print("⚠️ La base de datos ya tiene información. No se insertó nada nuevo.")
        db.close()
        return

    print("⏳ Insertando datos de prueba en Nexo Cinema...")

    # 1. Creamos Salas
    sala1 = Sala(nombre="Sala 1 IMAX", capacidad=150, estado="Disponible", tipo="IMAX")
    sala2 = Sala(nombre="Sala 2 VIP", capacidad=50, estado="En limpieza", tipo="VIP")
    
    # 2. Creamos Usuarios (Demostrando Herencia)
    cliente1 = Cliente(nombre="Juan Pérez", correo="juan@email.com", password="password_secreta", puntos_monedero=150)
    empleado1 = Empleado(nombre="Ana Gómez", correo="ana.gomez@nexocinema.com", password="password_secreta", puesto="Gerente", turno="Matutino")
    
    db.add_all([sala1, sala2, cliente1, empleado1])
    db.commit() # Guardamos para que MySQL les asigne un ID

    # 3. Creamos Eventos (Tu Core - Demostrando Polimorfismo)
    proyeccion = ProyeccionPublica(
        id_sala=sala1.id_sala, 
        pelicula="Spider-Man: Beyond the Spider-Verse", 
        clasificacion="B", 
        precio_boleto=85.00
    )
    
    evento_privado = EventoPrivado(
        id_sala=sala2.id_sala, 
        organizador="Escuela Secundaria Técnica 1", 
        motivo="Graduación Generación 2026", 
        costo_renta=5000.00,
        fecha_hora_inicio=datetime.datetime.utcnow() + datetime.timedelta(days=2) # Evento en 2 días
    )
    
    # 4. Creamos algo de Dulcería
    combo = ProductoDulceria(nombre="Combo Pareja (Palomitas Grandes + 2 Refrescos)", precio=250.00, stock_actual=100, stock_minimo=20)

    db.add_all([proyeccion, evento_privado, combo])
    db.commit()
    db.close()
    
    print("✅ ¡Datos inyectados con éxito! Ve a MySQL Workbench para comprobarlo.")

if __name__ == "__main__":
    poblar_base_de_datos()