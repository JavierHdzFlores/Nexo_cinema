import sys
import os

# Asegurar que podemos importar desde backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import Base, ProductoIndividual, Combo, ComboProducto

def seed_dulceria():
    print("Iniciando carga de datos para dulcería...")
    
    # Crear las tablas si no existen (solo por si acaso)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar si ya hay datos para no duplicar
        if db.query(ProductoIndividual).first():
            print("Ya existen productos en la base de datos.")
            return

        print("Creando productos individuales...")
        
        # 1. Crear Productos Individuales
        palomitas_ch = ProductoIndividual(nombre="Palomitas Chicas", precio=50.0, stock_actual=100)
        palomitas_gd = ProductoIndividual(nombre="Palomitas Grandes", precio=85.0, stock_actual=100)
        refresco_ch = ProductoIndividual(nombre="Refresco Chico", precio=40.0, stock_actual=150)
        refresco_gd = ProductoIndividual(nombre="Refresco Grande", precio=65.0, stock_actual=150)
        nachos = ProductoIndividual(nombre="Nachos con Queso", precio=60.0, stock_actual=80)
        hotdog = ProductoIndividual(nombre="Hot Dog Clásico", precio=55.0, stock_actual=60)
        chocolate = ProductoIndividual(nombre="Chocolate en Barra", precio=35.0, stock_actual=200)

        productos = [palomitas_ch, palomitas_gd, refresco_ch, refresco_gd, nachos, hotdog, chocolate]
        db.add_all(productos)
        db.commit() # Guardamos para que se les asigne un ID
        
        for p in productos:
            db.refresh(p)

        print("Creando combos...")
        
        # 2. Crear Combos
        combo_pareja = Combo(nombre="Combo Pareja", precio=190.0, stock_actual=50)
        combo_infantil = Combo(nombre="Combo Infantil", precio=120.0, stock_actual=50)
        combo_nachos = Combo(nombre="Combo Nachos", precio=150.0, stock_actual=40)

        combos = [combo_pareja, combo_infantil, combo_nachos]
        db.add_all(combos)
        db.commit()
        
        for c in combos:
            db.refresh(c)

        print("Asignando productos a los combos...")
        
        # 3. Asignar productos a los combos usando la tabla asociativa
        
        # Combo Pareja: 1 Palomitas Grandes, 2 Refrescos Grandes
        db.add(ComboProducto(id_combo=combo_pareja.id_articulo, id_producto=palomitas_gd.id_articulo, cantidad=1))
        db.add(ComboProducto(id_combo=combo_pareja.id_articulo, id_producto=refresco_gd.id_articulo, cantidad=2))
        
        # Combo Infantil: 1 Palomitas Chicas, 1 Refresco Chico, 1 Chocolate
        db.add(ComboProducto(id_combo=combo_infantil.id_articulo, id_producto=palomitas_ch.id_articulo, cantidad=1))
        db.add(ComboProducto(id_combo=combo_infantil.id_articulo, id_producto=refresco_ch.id_articulo, cantidad=1))
        db.add(ComboProducto(id_combo=combo_infantil.id_articulo, id_producto=chocolate.id_articulo, cantidad=1))

        # Combo Nachos: 1 Nachos, 1 Refresco Grande
        db.add(ComboProducto(id_combo=combo_nachos.id_articulo, id_producto=nachos.id_articulo, cantidad=1))
        db.add(ComboProducto(id_combo=combo_nachos.id_articulo, id_producto=refresco_gd.id_articulo, cantidad=1))

        db.commit()
        
        print("¡Datos de dulcería cargados exitosamente!")

    except Exception as e:
        db.rollback()
        print(f"Error al cargar datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_dulceria()
