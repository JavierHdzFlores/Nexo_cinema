from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Empleado, Gerente, Usuario
import schemas
from passlib.context import CryptContext

# Configuración para encriptar contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/api/usuarios",
    tags=["Gestión de Usuarios"]
)

def get_password_hash(password: str):
    return pwd_context.hash(password)

@router.post("/empleado", status_code=status.HTTP_201_CREATED)
def crear_empleado(empleado: schemas.EmpleadoCreate, db: Session = Depends(get_db)):
    # 1. Verificar si el correo ya existe en la tabla principal de usuarios
    usuario_existente = db.query(Usuario).filter(Usuario.correo == empleado.correo).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # 2. Crear la instancia de Empleado con la contraseña encriptada
    nuevo_empleado = Empleado(
        nombre=empleado.nombre,
        correo=empleado.correo,
        password=get_password_hash(empleado.password),
        puesto=empleado.puesto,
        turno=empleado.turno
    )

    # 3. Guardar en la base de datos
    db.add(nuevo_empleado)
    db.commit()
    db.refresh(nuevo_empleado)
    
    return {"mensaje": "Empleado creado exitosamente", "id": nuevo_empleado.id_empleado}


@router.post("/gerente", status_code=status.HTTP_201_CREATED)
def crear_gerente(gerente: schemas.GerenteCreate, db: Session = Depends(get_db)):
    # 1. Verificar correo
    usuario_existente = db.query(Usuario).filter(Usuario.correo == gerente.correo).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
        
    # 2. Verificar si la matrícula ya existe
    matricula_existente = db.query(Gerente).filter(Gerente.matricula == gerente.matricula).first()
    if matricula_existente:
        raise HTTPException(status_code=400, detail="La matrícula ya está en uso")

    # 3. Crear el Gerente
    nuevo_gerente = Gerente(
        nombre=gerente.nombre,
        correo=gerente.correo,
        password=get_password_hash(gerente.password),
        matricula=gerente.matricula
    )

    db.add(nuevo_gerente)
    db.commit()
    db.refresh(nuevo_gerente)
    
    return {"mensaje": "Gerente creado exitosamente", "id": nuevo_gerente.id_gerente}