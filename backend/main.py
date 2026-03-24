from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

# 1. Inicializamos la aplicación
app = FastAPI(
    title="Nexo Cinema API",
    description="API para la gestión del cine, eventos y cartelera",
    version="1.0.0"
)

# 2. CREAMOS EL CONTRATO (Clase Modelo)
# Esto garantiza que siempre se envíen y reciban estos datos exactos
class Sala(BaseModel):
    id_sala: int
    nombre: str
    capacidad: int
    estado: str  # Ejemplo: "Disponible", "En limpieza", "Evento Privado"
    tipo: str

# 3. Creamos el Endpoint (La ruta web)
@app.get("/api/salas", response_model=List[Sala])
def obtener_salas():
    # Por ahora devolvemos datos "quemados" (mock). 
    # Más adelante, aquí nos conectaremos a la base de datos SQL.
    lista_de_salas = [
        {"id_sala": 1, "nombre": "Sala 1 3D", "capacidad": 100, "estado": "Disponible", "tipo": "3D"},
        {"id_sala": 2, "nombre": "Sala 2 VIP", "capacidad": 50, "estado": "En limpieza", "tipo": "VIP"},
        {"id_sala": 3, "nombre": "Sala 3 MacroXE", "capacidad": 200, "estado": "Evento Privado", "tipo": "Tradicional"}
    ]
    return lista_de_salas