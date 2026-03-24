# backend/main.py
from fastapi import FastAPI
from database import engine, Base
import models # Importamos nuestros modelos

# Esta línea es la MAGIA: Crea todas las tablas en MySQL automáticamente
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nexo Cinema API",
    description="API conectada a MySQL",
    version="1.0.0"
)

@app.get("/")
def ruta_raiz():
    return {"mensaje": "¡Base de datos conectada e inicializada!"}