from database import SessionLocal, engine
from models import Base, Sala, Asiento, ProyeccionPublica
from datetime import datetime, timedelta

def seed_taquilla():
    print("Iniciando carga de datos para Taquilla (CU-04)...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Crear una Sala si no existe
        sala = db.query(Sala).filter(Sala.nombre == "Sala 1 IMAX").first()
        if not sala:
            sala = Sala(nombre="Sala 1 IMAX", capacidad=50, estado="Disponible", tipo="IMAX")
            db.add(sala)
            db.commit()
            db.refresh(sala)
            print(f"✅ Sala creada: {sala.nombre} (ID: {sala.id_sala})")

            # 2. Crear Asientos para la sala (Filas A a E, Asientos 1 a 10)
            filas = ['A', 'B', 'C', 'D', 'E']
            asientos = []
            for fila in filas:
                for numero in range(1, 11):
                    asientos.append(Asiento(id_sala=sala.id_sala, numero=f"{fila}{numero}"))
            
            db.add_all(asientos)
            db.commit()
            print(f"✅ {len(asientos)} asientos creados para la {sala.nombre}.")
        else:
            print(f"ℹ️ La {sala.nombre} ya existe.")

        # 3. Crear Funciones (Proyecciones Públicas)
        funciones_existentes = db.query(ProyeccionPublica).count()
        if funciones_existentes == 0:
            ahora = datetime.utcnow()
            
            f1 = ProyeccionPublica(
                id_sala=sala.id_sala,
                nombre="Dune: Parte Dos - Estreno",
                pelicula="Dune: Parte Dos",
                fecha_hora_inicio=ahora + timedelta(hours=2),
                fecha_hora_fin=ahora + timedelta(hours=5),
                tipo_evento="proyeccion_publica",
                clasificacion="B15",
                precio_boleto=120.00,
                duracion_minutos=166,
                imagen_url="https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400&h=600"
            )
            
            f2 = ProyeccionPublica(
                id_sala=sala.id_sala,
                nombre="Spider-Man: Across the Spider-Verse",
                pelicula="Spider-Man: Across the Spider-Verse",
                fecha_hora_inicio=ahora + timedelta(hours=6),
                fecha_hora_fin=ahora + timedelta(hours=8, minutes=20),
                tipo_evento="proyeccion_publica",
                clasificacion="A",
                precio_boleto=90.00,
                duracion_minutos=140,
                imagen_url="https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=400&h=600"
            )

            f3 = ProyeccionPublica(
                id_sala=sala.id_sala,
                nombre="Oppenheimer - Función Especial",
                pelicula="Oppenheimer",
                fecha_hora_inicio=ahora + timedelta(days=1, hours=1),
                fecha_hora_fin=ahora + timedelta(days=1, hours=4),
                tipo_evento="proyeccion_publica",
                clasificacion="C",
                precio_boleto=150.00,
                duracion_minutos=180,
                imagen_url="https://images.unsplash.com/photo-1533613220915-609f661a6fe1?auto=format&fit=crop&q=80&w=400&h=600"
            )

            db.add_all([f1, f2, f3])
            db.commit()
            print("✅ Funciones creadas exitosamente en la cartelera.")
        else:
            print(f"ℹ️ Ya existen {funciones_existentes} funciones en la base de datos.")

    except Exception as e:
        print(f"❌ Error al poblar base de datos: {e}")
        db.rollback()
    finally:
        db.close()
        print("Carga finalizada.")

if __name__ == "__main__":
    seed_taquilla()
