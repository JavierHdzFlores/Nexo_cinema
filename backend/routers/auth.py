from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario, Empleado, Gerente
import schemas
from passlib.context import CryptContext

# NUEVAS IMPORTACIONES PARA JWT
from datetime import datetime, timedelta, timezone
import jwt

# ==========================================
# CONFIGURACIÓN DEL JWT
# ==========================================
# En un proyecto ya en producción, esta clave va oculta en un archivo .env
SECRET_KEY = "Nexo_Cinema_Super_Secreta_Key_12345!" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120 # La "pulsera" durará 2 horas (120 minutos)

def crear_token_acceso(data: dict, expires_delta: timedelta | None = None):
    """Fábrica de pulseras VIP (JWT)"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    # Aquí se genera la firma criptográfica usando tu SECRET_KEY
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ==========================================
# ROUTER
# ==========================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
        
    # 4. Validar contraseña con Passlib
    if not pwd_context.verify(credenciales.password, usuario.password):
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    # 5. Extraer el puesto si es necesario
    puesto_staff = None
    if isinstance(usuario, Empleado):
        puesto_staff = usuario.puesto

    # 6. ¡GENERAR EL JWT REAL!
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # El payload: Lo que va escrito dentro de la pulsera
    token_data = {
        "sub": str(usuario.id_usuario), # "sub" (subject) es el estándar para el ID
        "tipo": usuario.tipo_usuario
    }
    
    access_token = crear_token_acceso(
        data=token_data, 
        expires_delta=access_token_expires
    )

    # 7. Regresar los datos al frontend
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario_id": usuario.id_usuario,
        "nombre": usuario.nombre,
        "tipo_usuario": usuario.tipo_usuario,
        "puesto": puesto_staff
    }