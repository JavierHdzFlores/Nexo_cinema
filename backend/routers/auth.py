from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from database import get_db
from models import Usuario, Empleado, Gerente, Cliente
import schemas
from passlib.context import CryptContext

# NUEVAS IMPORTACIONES PARA JWT
from datetime import datetime, timedelta, timezone
import jwt

# Aquí le decimos a FastAPI cuál es la URL donde el usuario obtiene su token.
# Esto es más para la documentación de Swagger, pero es necesario.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login/cliente")
# ==========================================
# EL "CADENERO" (get_current_user)
# ==========================================
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión expirada o inválida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Extraemos el ID del 'sub' (que guardamos como string en el login)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Buscamos en la tabla Usuario (la base de todos)
    usuario = db.query(Usuario).filter(Usuario.id_usuario == int(user_id)).first()
    
    if usuario is None:
        raise credentials_exception
        
    return usuario
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

#login para staff
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

    # 5. Extraer el puesto si es empleado
    puesto_staff = getattr(usuario, 'puesto', None)

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

##login para clientes 

@router.post("/login/cliente", response_model=schemas.TokenResponse)
def login_cliente(credenciales: schemas.LoginRequest, db: Session = Depends(get_db)):
    #buscamos al usuario por su correo
    usuario  = db.query(Usuario).filter(Usuario.correo == credenciales.correo).first()
    #verificamos si el usuario existe y la contra es correcta
    if not usuario or not pwd_context.verify(credenciales.password, usuario.password):
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Correo y/o contraseña incorrecta" 
        )
    if usuario.tipo_usuario != "cliente":
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Este portal es exclusivo para clientes. Si formas parte del staff debes iniciar seccion en el panel administrativo" 
        )
    
    #generamos el jwt para el cliente
    access_token_expires = timedelta(minutes= ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data={
        "sub": str(usuario.id_usuario),
        "tipo": usuario.tipo_usuario
    }

    access_token =crear_token_acceso(
        data=token_data,
        expires_delta=access_token_expires
    )
    #regresar los datos 
    return{
        "access_token": access_token,
        "token_type": "bearer",
        "usuario_id": usuario.id_usuario,
        "nombre": usuario.nombre,
        "tipo_usuario": usuario.tipo_usuario,
        "puesto": None
    }

# ==========================================
# NUEVO ENDPOINT PARA TU DASHBOARD
# ==========================================
@router.get("/me", response_model=schemas.ClienteResponse)
async def leer_mi_perfil(usuario_actual: Usuario = Depends(get_current_user)):
    """Este es el que usará tu Next.js para quitar el nombre de 'Juan'"""
    return usuario_actual

@router.get("/meEmpleado", response_model=schemas.EmpleadoResponse)
async def leer_mi_perfil_empleado(usuario_actual: Usuario = Depends(get_current_user)):
    """Este endpoint retorna los datos del empleado con su puesto"""
    return usuario_actual