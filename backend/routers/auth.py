from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario, Empleado, Gerente
import schemas

# Nota: En un entorno real, la verificación de password usa passlib (bcrypt).
# Aquí te pongo la lógica base para que conectes rápido.

router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)

@router.post("/login", response_model=schemas.TokenResponse)
def login_staff(credenciales: schemas.LoginRequest, db: Session = Depends(get_db)):
    # 1. Buscamos al usuario por correo
    usuario = db.query(Usuario).filter(Usuario.correo == credenciales.correo).first()
    
    # 2. Verificamos que exista
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
        
    # 3. Verificamos que sea parte del Staff (Empleado o Gerente), no cliente
    if usuario.tipo_usuario not in ["empleado", "gerente"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Solo personal autorizado."
        )
        
    # 4. Validar contraseña (OJO: aquí deberías usar verify de passlib con hashes)
    # Por ahora asumo que vas a hacer pruebas, pero esto debe cambiar a hash.
    if usuario.password != credenciales.password:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    # 5. Extraer el puesto si es necesario
    puesto_staff = None
    if isinstance(usuario, Empleado):
        puesto_staff = usuario.puesto

    # 6. Generar el Token (Aquí después meteremos la lógica de JWT)
    # Por ahora devolvemos la estructura para que Next.js ya pueda trabajar
    return {
        "access_token": "token_falso_para_pruebas_12345", # Aquí irá tu JWT real
        "token_type": "bearer",
        "usuario_id": usuario.id_usuario,
        "nombre": usuario.nombre,
        "tipo_usuario": usuario.tipo_usuario,
        "puesto": puesto_staff
    }