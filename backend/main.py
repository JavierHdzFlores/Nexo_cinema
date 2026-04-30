from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models 
from routers.finanzas import router as finanzas_router
from routers import cartelera, auth, usuarios, dulceria, taquilla 

# 1. CREACIÓN DE LA INSTANCIA (El "cerebro" de la API)
app = FastAPI(
    title="Nexo Cinema API",
    description="API conectada a MySQL",
    version="1.0.0"
)

# 2. INICIALIZACIÓN DE LA BASE DE DATOS
# Crea todas las tablas en MySQL automáticamente basándose en models.py
Base.metadata.create_all(bind=engine)

# 3. CONFIGURACIÓN DE SEGURIDAD (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. INCLUSIÓN DE RUTAS (Conectamos tus casos de uso)
app.include_router(finanzas_router)
app.include_router(cartelera.router)
app.include_router(dulceria.router) 
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(taquilla.router) 

@app.get("/")
def ruta_raiz():
    return {"mensaje": "¡Base de datos conectada e inicializada!"}