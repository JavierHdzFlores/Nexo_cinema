import sys
sys.path.append('.')
from backend.database import SessionLocal
from backend.models import ArticuloDulceria
db = SessionLocal()
try:
    print(db.query(ArticuloDulceria).all())
except Exception as e:
    import traceback
    traceback.print_exc()
