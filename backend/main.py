# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models # Importamos nuestros modelos
from routers.finanzas import router as finanzas_router
from routers import cartelera
from routers import auth

# Crea todas las tablas en MySQL automáticamente
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nexo Cinema API",
    description="API conectada a MySQL",
    version="1.0.0"
)

# Configurar CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(finanzas_router)

app = FastAPI(title="Nexo Cinema API")

app.include_router(cartelera.router)

@app.get("/")
def ruta_raiz():
    return {"mensaje": "¡Base de datos conectada e inicializada!"}

#incluir router de autenticación
app.include_router(auth.router)