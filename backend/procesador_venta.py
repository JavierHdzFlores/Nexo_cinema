from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from models import Evento, ProyeccionPublica, Asiento, Boleto, BloqueoAsiento, Venta
from datetime import datetime, timedelta

# ==========================================
# DIAGRAMA 4: ValidadorTransaccion (Service)
# ==========================================
class ValidadorTransaccion:
    
    @staticmethod
    def verificar_tipo_evento(evento: Evento) -> bool:
        """Valida que el evento sea Proyección Pública y no Evento Privado."""
        if not evento or not isinstance(evento, ProyeccionPublica):
            return False
        return True

    @staticmethod
    def validar_integridad_asientos(db: Session, ids_asientos: List[int], id_sala_evento: int) -> List[Asiento]:
        """
        Verifica que los asientos existan y pertenezcan a la sala del evento.
        Retorna la lista de objetos Asiento si todo es correcto.
        """
        asientos = db.query(Asiento).filter(Asiento.id_asiento.in_(ids_asientos)).all()
        if len(asientos) != len(ids_asientos):
            raise HTTPException(status_code=404, detail="Uno o más asientos no existen en el sistema.")
            
        for asiento in asientos:
            if asiento.id_sala != id_sala_evento:
                raise HTTPException(status_code=400, detail=f"El asiento {asiento.numero} no pertenece a la sala de esta función.")
        
        return asientos

    @staticmethod
    def checar_disponibilidad_real(db: Session, ids_asientos: List[int], id_evento: int, id_cliente_temp: str = None) -> bool:
        """
        (Integrado con CU-04 Lógica de Bloqueo)
        Verifica que los asientos no estén VENDIDOS.
        También verifica que no estén BLOQUEADOS temporalmente por OTRO usuario.
        """
        # 1. ¿Ya están vendidos? (Boletos definitivos)
        boletos_vendidos = db.query(Boleto).filter(
            Boleto.id_evento == id_evento,
            Boleto.id_asiento.in_(ids_asientos)
        ).all()
        
        if boletos_vendidos:
            return False
            
        # 2. Limpiar bloqueos expirados en general (Lazy evaluation para E2)
        ValidadorTransaccion.limpiar_bloqueos_expirados(db)
        
        # 3. ¿Están bloqueados por otro usuario y el bloqueo sigue vigente?
        bloqueos_ajenos = db.query(BloqueoAsiento).filter(
            BloqueoAsiento.id_evento == id_evento,
            BloqueoAsiento.id_asiento.in_(ids_asientos),
            BloqueoAsiento.id_cliente_temp != id_cliente_temp,
            BloqueoAsiento.fecha_expiracion > datetime.utcnow()
        ).all()
        
        if bloqueos_ajenos:
            return False
            
        return True

    @staticmethod
    def limpiar_bloqueos_expirados(db: Session) -> None:
        """Implementación Excepción E2: Libera automáticamente asientos."""
        ahora = datetime.utcnow()
        db.query(BloqueoAsiento).filter(BloqueoAsiento.fecha_expiracion <= ahora).delete()
        db.commit()

# ==========================================
# DIAGRAMA 4: ProcesadorVenta (Logic)
# ==========================================
class ProcesadorVenta:
    
    @staticmethod
    def calcular_total(cantidad_asientos: int, precio_boleto: float) -> float:
        """Calcula el gran total de la venta de boletos."""
        return cantidad_asientos * precio_boleto

    @staticmethod
    def generar_boletos_lote(db: Session, id_venta: int, id_evento: int, asientos_list: List[Asiento], precio_boleto: float) -> None:
        """Genera las entidades de Boleto para ocupar permanentemente los asientos."""
        for asiento in asientos_list:
            nuevo_boleto = Boleto(
                id_venta=id_venta,
                id_evento=id_evento,
                id_asiento=asiento.id_asiento,
                precio_final=precio_boleto
            )
            db.add(nuevo_boleto)
            
    @staticmethod
    def limpiar_bloqueos_propios(db: Session, id_evento: int, ids_asientos: List[int], id_cliente_temp: str) -> None:
        """Después de la venta exitosa, se eliminan los bloqueos temporales del usuario."""
        db.query(BloqueoAsiento).filter(
            BloqueoAsiento.id_evento == id_evento,
            BloqueoAsiento.id_asiento.in_(ids_asientos),
            BloqueoAsiento.id_cliente_temp == id_cliente_temp
        ).delete()

    @staticmethod
    def manejar_error_concurrencia(e: IntegrityError) -> HTTPException:
        """
        Traducción de excepción de BD a error HTTP.
        (Excepción crítica de concurrencia real a nivel ACID).
        """
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Excepción de concurrencia: Uno o más asientos ya no están disponibles."
        )
