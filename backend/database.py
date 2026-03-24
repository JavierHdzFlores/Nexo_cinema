from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL de conexión a MySQL
# Formato: "mysql+pymysql://usuario:contraseña@servidor:puerto/nombre_base_de_datos"
# EJEMPLO: Asumiendo que usan XAMPP o MySQL Workbench en local con el usuario "root"
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/nexocinema"

# Crear el motor de la base de datos
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Crear la fábrica de sesiones (para que cada consulta sea independiente)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase Base de la cual heredarán todos sus modelos (Tablas)
Base = declarative_base()

# Función de dependencia para que FastAPI use la base de datos de forma segura
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()