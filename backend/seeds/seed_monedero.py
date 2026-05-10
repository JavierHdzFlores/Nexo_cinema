import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import Cliente, Monedero
import passlib.hash as hashing

def seed_monederos():
    db = SessionLocal()
    try:
        if db.query(Cliente).first():
            print("Ya existen clientes en la base de datos.")
            return

        print("Creando clientes de prueba...")
        
        # Cliente 1: Con muchos puntos
        cliente1 = Cliente(
            nombre="Juan Pérez",
            correo="juan@cine.com",
            password=hashing.bcrypt.hash("password123"),
            rfc="JUPR900101XYZ",
            codigo_postal="12345",
            puntos_monedero=500
        )
        
        # Cliente 2: Con pocos puntos y estado activo
        cliente2 = Cliente(
            nombre="María López",
            correo="maria@cine.com",
            password=hashing.bcrypt.hash("password123"),
            rfc="MALO850101ABC",
            codigo_postal="54321",
            puntos_monedero=50
        )
        
        db.add_all([cliente1, cliente2])
        db.commit()
        db.refresh(cliente1)
        db.refresh(cliente2)
        
        print("Creando monederos para los clientes...")
        # Monedero 1 (Activo)
        monedero1 = Monedero(
            id_cliente=cliente1.id_cliente,
            saldo_puntos=500,
            estado="Activa"
        )
        
        # Monedero 2 (Activo)
        monedero2 = Monedero(
            id_cliente=cliente2.id_cliente,
            saldo_puntos=50,
            estado="Activa"
        )
        
        db.add_all([monedero1, monedero2])
        db.commit()

        print(f"¡Exito! Clientes creados.")
        print(f"ID Cliente 1: {cliente1.id_cliente} (Puntos: 500)")
        print(f"ID Cliente 2: {cliente2.id_cliente} (Puntos: 50)")

    except Exception as e:
        db.rollback()
        print(f"Error al cargar monederos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_monederos()
