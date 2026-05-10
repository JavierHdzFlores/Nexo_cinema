"""
seed_all.py — Script maestro de datos para Nexo Cinema
=======================================================
Ejecuta TODOS los seeds en el orden correcto con la
configuración definitiva del cine:

  10 salas:
    · Sala 1       — IMAX      (150 asientos)
    · Salas 2–8    — Tradicional (50 asientos c/u → 7 salas)
    · Salas 9–10   — VIP        (30 asientos c/u → 2 salas)

Uso:
    cd backend
    .venv/bin/python seeds/seed_all.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
import models   # noqa — asegura que todas las tablas estén mapeadas

def run():
    print("\n" + "=" * 60)
    print("  NEXO CINEMA — Seed Maestro (Configuración Definitiva)")
    print("=" * 60 + "\n")

    # Recrea todas las tablas desde cero
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Base de datos reiniciada.\n")

    db = SessionLocal()
    try:
        _seed_salas(db)
        _seed_asientos(db)
        _seed_peliculas(db)
        _seed_funciones_demo(db)
        _seed_dulceria(db)
        _seed_clientes(db)
        print("\n" + "=" * 60)
        print("  🎉 ¡Nexo Cinema listo para usar!")
        print("=" * 60 + "\n")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error fatal: {e}")
        import traceback; traceback.print_exc()
    finally:
        db.close()


# ──────────────────────────────────────────────
# 1. SALAS
# ──────────────────────────────────────────────
def _seed_salas(db):
    print("🏛️  Creando salas...")
    config = [
        {"nombre": "Sala 1",  "capacidad": 150, "tipo": "IMAX"},
        {"nombre": "Sala 2",  "capacidad": 50,  "tipo": "Tradicional"},
        {"nombre": "Sala 3",  "capacidad": 50,  "tipo": "Tradicional"},
        {"nombre": "Sala 4",  "capacidad": 50,  "tipo": "Tradicional"},
        {"nombre": "Sala 5",  "capacidad": 50,  "tipo": "Tradicional"},
        {"nombre": "Sala 6",  "capacidad": 50,  "tipo": "Tradicional"},
        {"nombre": "Sala 7",  "capacidad": 50,  "tipo": "Tradicional"},
        {"nombre": "Sala 8",  "capacidad": 50,  "tipo": "Tradicional"},
        {"nombre": "Sala 9",  "capacidad": 30,  "tipo": "VIP"},
        {"nombre": "Sala 10", "capacidad": 30,  "tipo": "VIP"},
    ]
    for c in config:
        sala = models.Sala(nombre=c["nombre"], capacidad=c["capacidad"], tipo=c["tipo"])
        db.add(sala)
    db.commit()
    print(f"   → 10 salas creadas (1 IMAX · 7 Tradicional · 2 VIP)\n")


# ──────────────────────────────────────────────
# 2. ASIENTOS
# ──────────────────────────────────────────────
def _seed_asientos(db):
    print("💺  Generando asientos...")
    letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    salas = db.query(models.Sala).order_by(models.Sala.id_sala).all()
    total = 0
    for sala in salas:
        cols = 10
        generados = 0
        fila = 0
        while generados < sala.capacidad:
            por_fila = min(cols, sala.capacidad - generados)
            for col in range(1, por_fila + 1):
                db.add(models.Asiento(id_sala=sala.id_sala, numero=f"{letras[fila]}{col}"))
                generados += 1
            fila += 1
        total += generados
    db.commit()
    print(f"   → {total} asientos generados en 10 salas\n")


# ──────────────────────────────────────────────
# 3. CATÁLOGO DE PELÍCULAS
# ──────────────────────────────────────────────
def _seed_peliculas(db):
    print("🎬  Cargando catálogo de películas...")
    catalogo = [
        models.Pelicula(
            titulo="Dune: Parte Dos",
            sinopsis="Paul Atreides se une a los Fremen en su cruzada de venganza contra los conspiradores que destruyeron a su familia.",
            clasificacion="B15",
            duracion_minutos=165,
            imagen_url="https://image.tmdb.org/t/p/w600_and_h900_bestv2/8b8R8l88ILliNa22vRoASNV1n1PN.jpg"
        ),
        models.Pelicula(
            titulo="Spider-Man: Across the Spider-Verse",
            sinopsis="Miles Morales se catapulta a través del Multiverso donde conoce a un equipo de Spider-Personas.",
            clasificacion="A",
            duracion_minutos=140,
            imagen_url="https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg"
        ),
        models.Pelicula(
            titulo="Oppenheimer",
            sinopsis="La historia del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.",
            clasificacion="C",
            duracion_minutos=180,
            imagen_url="https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
        ),
        models.Pelicula(
            titulo="Super Mario Bros. La Película",
            sinopsis="Un plomero es transportado a un mundo de fantasía donde deberá salvar a su hermano.",
            clasificacion="A",
            duracion_minutos=92,
            imagen_url="https://image.tmdb.org/t/p/w600_and_h900_bestv2/qNBAXBIQlnOFiAwgP6kHlX5dY.jpg"
        ),
        models.Pelicula(
            titulo="John Wick 4",
            sinopsis="John Wick descubre un camino para derrotar a la Alta Mesa, pero antes debe enfrentarse a sus aliados.",
            clasificacion="C",
            duracion_minutos=169,
            imagen_url="https://image.tmdb.org/t/p/w600_and_h900_bestv2/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg"
        ),
    ]
    for p in catalogo:
        db.add(p)
    db.commit()
    print(f"   → {len(catalogo)} películas en el catálogo maestro\n")


# ──────────────────────────────────────────────
# 4. FUNCIONES DE DEMO (para Taquilla)
# ──────────────────────────────────────────────
def _seed_funciones_demo(db):
    import datetime
    print("📅  Creando funciones de cartelera para demo...")
    hoy = datetime.datetime.now().replace(second=0, microsecond=0)

    funciones = [
        # Sala 1 IMAX — Dune 2
        models.ProyeccionPublica(
            id_sala=1, id_pelicula=1, nombre="Dune: Parte Dos — IMAX",
            fecha_hora_inicio=hoy.replace(hour=14, minute=0),
            fecha_hora_fin=hoy.replace(hour=16, minute=45),
            tipo_evento="proyeccion_publica", precio_boleto=200.00
        ),
        # Sala 2 Tradicional — Spider-Man
        models.ProyeccionPublica(
            id_sala=2, id_pelicula=2, nombre="Spider-Man: Across the Spider-Verse",
            fecha_hora_inicio=hoy.replace(hour=16, minute=30),
            fecha_hora_fin=hoy.replace(hour=18, minute=50),
            tipo_evento="proyeccion_publica", precio_boleto=100.00
        ),
        # Sala 3 Tradicional — Oppenheimer
        models.ProyeccionPublica(
            id_sala=3, id_pelicula=3, nombre="Oppenheimer",
            fecha_hora_inicio=hoy.replace(hour=18, minute=0),
            fecha_hora_fin=hoy.replace(hour=21, minute=0),
            tipo_evento="proyeccion_publica", precio_boleto=110.00
        ),
        # Sala 9 VIP — Super Mario
        models.ProyeccionPublica(
            id_sala=9, id_pelicula=4, nombre="Super Mario Bros. — VIP",
            fecha_hora_inicio=hoy.replace(hour=12, minute=0),
            fecha_hora_fin=hoy.replace(hour=13, minute=32),
            tipo_evento="proyeccion_publica", precio_boleto=180.00
        ),
    ]
    for f in funciones:
        db.add(f)
    db.commit()
    print(f"   → {len(funciones)} funciones creadas (IMAX · Tradicional · VIP)\n")


# ──────────────────────────────────────────────
# 5. DULCERÍA
# ──────────────────────────────────────────────
def _seed_dulceria(db):
    print("🍿  Cargando productos de Dulcería...")

    def producto(nombre, precio, stock=50, descripcion=""):
        return models.ProductoIndividual(
            nombre=nombre, precio=precio,
            stock_actual=stock, stock_minimo=10,
            descripcion=descripcion if hasattr(models.ArticuloDulceria, 'descripcion') else None
        )

    productos = [
        models.ProductoIndividual(nombre="Palomitas Chicas",   precio=55.0,  stock_actual=100, stock_minimo=10),
        models.ProductoIndividual(nombre="Palomitas Medianas", precio=75.0,  stock_actual=100, stock_minimo=10),
        models.ProductoIndividual(nombre="Palomitas Grandes",  precio=95.0,  stock_actual=100, stock_minimo=10),
        models.ProductoIndividual(nombre="Refresco Chico",     precio=40.0,  stock_actual=80,  stock_minimo=10),
        models.ProductoIndividual(nombre="Refresco Grande",    precio=60.0,  stock_actual=80,  stock_minimo=10),
        models.ProductoIndividual(nombre="Agua Natural",       precio=30.0,  stock_actual=80,  stock_minimo=10),
        models.ProductoIndividual(nombre="Café Americano",     precio=50.0,  stock_actual=50,  stock_minimo=5),
        models.ProductoIndividual(nombre="Nachos con Queso",   precio=80.0,  stock_actual=60,  stock_minimo=10),
        models.ProductoIndividual(nombre="Hot Dog",            precio=75.0,  stock_actual=40,  stock_minimo=5),
        models.ProductoIndividual(nombre="Pretzels",           precio=65.0,  stock_actual=50,  stock_minimo=10),
        models.ProductoIndividual(nombre="Papas Fritas",       precio=70.0,  stock_actual=50,  stock_minimo=10),
        models.ProductoIndividual(nombre="M&Ms",               precio=50.0,  stock_actual=60,  stock_minimo=10),
        models.ProductoIndividual(nombre="Skittles",           precio=45.0,  stock_actual=60,  stock_minimo=10),
        models.ProductoIndividual(nombre="Snickers",           precio=40.0,  stock_actual=60,  stock_minimo=10),
    ]
    for p in productos:
        db.add(p)
    db.commit()
    print(f"   → {len(productos)} productos en Dulcería\n")


# ──────────────────────────────────────────────
# 6. CLIENTES CON MONEDERO
# ──────────────────────────────────────────────
def _seed_clientes(db):
    print("👤  Creando clientes de prueba...")
    clientes_data = [
        {"nombre": "Juan Pérez",   "correo": "juan@nexo.com",   "puntos": 500},
        {"nombre": "María López",  "correo": "maria@nexo.com",  "puntos": 80},
        {"nombre": "Carlos Ruiz",  "correo": "carlos@nexo.com", "puntos": 0},
    ]
    for c in clientes_data:
        cliente = models.Cliente(
            nombre=c["nombre"],
            correo=c["correo"],
            password="nexo1234",
            puntos_monedero=c["puntos"]
        )
        db.add(cliente)
    db.commit()
    print(f"   → {len(clientes_data)} clientes con monedero\n")


if __name__ == "__main__":
    run()
