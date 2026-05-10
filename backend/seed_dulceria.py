"""
seed_dulceria.py — Siembra catálogo completo de Dulcería (CU-05) + Monederos (CU-06).
Borra la BD antes de correr si hay errores de esquema.

Uso:
    rm -f nexo_cinema.db
    ./.venv/bin/python seed_dulceria.py
"""
import datetime
from database import SessionLocal, engine
from models import Base, Cliente, ProductoIndividual, Combo, Monedero


def seed():
    print("=" * 60)
    print("  NEXO CINEMA — Dulcería & Monedero Seed (Completo)")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ─── 1. PALOMITAS ─────────────────────────────────────────
        print("\n🫙 Palomitas...")
        palomitas = [
            ProductoIndividual(nombre="Palomitas Grandes Mantequilla",    precio=85.00,  stock_actual=100, stock_minimo=20),
            ProductoIndividual(nombre="Palomitas Extra Grandes Caramelo", precio=110.00, stock_actual=80,  stock_minimo=15),
            ProductoIndividual(nombre="Palomitas Medianas Mantequilla",   precio=65.00,  stock_actual=120, stock_minimo=25),
        ]
        db.add_all(palomitas)
        db.commit()
        print(f"  ✅ {len(palomitas)} palomitas creadas.")

        # ─── 2. BEBIDAS ───────────────────────────────────────────
        print("\n🥤 Bebidas...")
        bebidas = [
            ProductoIndividual(nombre="Refresco Grande (Cola)",         precio=65.00, stock_actual=150, stock_minimo=30),
            ProductoIndividual(nombre="Refresco Mediano (Manzana)",     precio=55.00, stock_actual=100, stock_minimo=20),
            ProductoIndividual(nombre="Agua Natural 600ml",             precio=30.00, stock_actual=200, stock_minimo=40),
            ProductoIndividual(nombre="Jugo de Naranja Natural",        precio=50.00, stock_actual=60,  stock_minimo=15),
            ProductoIndividual(nombre="Limonada con Chía",              precio=45.00, stock_actual=50,  stock_minimo=10),
        ]
        db.add_all(bebidas)
        db.commit()
        print(f"  ✅ {len(bebidas)} bebidas creadas.")

        # ─── 3. SNACKS ────────────────────────────────────────────
        print("\n🌮 Snacks salados...")
        snacks = [
            ProductoIndividual(nombre="Nachos con Queso y Jalapeños",   precio=75.00, stock_actual=60, stock_minimo=15),
            ProductoIndividual(nombre="Hot Dog Tradicional",            precio=60.00, stock_actual=50, stock_minimo=10),
            ProductoIndividual(nombre="Pizza Pepperoni (porción)",      precio=80.00, stock_actual=40, stock_minimo=10),
            ProductoIndividual(nombre="Papas a la Francesa",            precio=55.00, stock_actual=70, stock_minimo=15),
        ]
        db.add_all(snacks)
        db.commit()
        print(f"  ✅ {len(snacks)} snacks creados.")

        # ─── 4. DULCES ────────────────────────────────────────────
        print("\n🍬 Dulces y chocolates...")
        dulces = [
            ProductoIndividual(nombre="Chocolate en Barra (Obscuro)",   precio=45.00, stock_actual=80, stock_minimo=20),
            ProductoIndividual(nombre="Chocolate en Barra (Leche)",     precio=40.00, stock_actual=90, stock_minimo=20),
            ProductoIndividual(nombre="Gomitas Ositos 100g",            precio=35.00, stock_actual=100, stock_minimo=25),
            ProductoIndividual(nombre="Galletas Oreo (paquete)",        precio=30.00, stock_actual=80,  stock_minimo=20),
            ProductoIndividual(nombre="Dulces surtidos 200g",           precio=50.00, stock_actual=60,  stock_minimo=15),
        ]
        db.add_all(dulces)
        db.commit()
        print(f"  ✅ {len(dulces)} dulces creados.")

        # ─── 5. COMBOS ────────────────────────────────────────────
        print("\n🍿 Combos...")
        combos = [
            Combo(nombre="Combo Pareja (2 Refrescos + 1 Palomitas Gdes)",   precio=195.00, stock_actual=100, stock_minimo=10),
            Combo(nombre="Combo Nachos (2 Refrescos Med + 2 Nachos)",        precio=240.00, stock_actual=80,  stock_minimo=10),
            Combo(nombre="Combo Mega Familiar (4 Refrescos + 2 Palomitas)", precio=350.00, stock_actual=50,  stock_minimo=5),
            Combo(nombre="Combo Dulce (Palomitas Med + 2 Chocolates)",       precio=155.00, stock_actual=60,  stock_minimo=10),
        ]
        db.add_all(combos)
        db.commit()
        print(f"  ✅ {len(combos)} combos creados.")

        # ─── 6. CLIENTES + MONEDERO (CU-06) ──────────────────────
        print("\n🎫 Clientes y Monederos de prueba...")
        clientes_data = [
            {"nombre": "Juan Pérez",   "correo": "juan@nexo.mx",  "puntos": 500, "rfc": "JUPR900101XYZ"},
            {"nombre": "María López",  "correo": "maria@nexo.mx", "puntos": 80,  "rfc": "MALO850101ABC"},
            {"nombre": "Carlos Ruiz",  "correo": "carlos@nexo.mx","puntos": 0,   "rfc": "CARU950201DEF"},
        ]
        for c in clientes_data:
            cliente = Cliente(
                nombre=c["nombre"],
                correo=c["correo"],
                password="nexo1234",
                rfc=c["rfc"],
                codigo_postal="06600",
                puntos_monedero=c["puntos"],
            )
            db.add(cliente)
            db.flush()
            monedero = Monedero(
                id_cliente=cliente.id_cliente,
                saldo_puntos=c["puntos"],
                estado="Operativa",
                fecha_vencimiento=datetime.datetime(2027, 12, 31),
            )
            db.add(monedero)
            print(f"  ✅ {c['nombre']} (ID: {cliente.id_cliente}) — {c['puntos']} pts")
        db.commit()

        total = len(palomitas) + len(bebidas) + len(snacks) + len(dulces) + len(combos)
        print(f"\n{'=' * 60}")
        print(f"  🎉 ¡Listo! {total} artículos + 3 clientes con Monedero")
        print(f"{'=' * 60}")

    except Exception as e:
        db.rollback()
        import traceback
        print(f"\n❌ Error: {e}")
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
