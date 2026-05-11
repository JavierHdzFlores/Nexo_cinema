from datetime import datetime


class ProcesadorCostos:
    """
    <<Lógica de Negocio>> CU-03: Cotizar Paquetes Corporativos.
    
    Encapsula toda la lógica de cálculo de costos para cotizaciones corporativas.
    Diagrama 5 (Clases detallado): Capa intermedia entre el Controlador y la Entidad.
    Diagrama 3 (Responsabilidades): <<Lógica>> CalculadoraCostos.
    Diagrama 4 (Colaboración): Componentes Calculo_Horas y Calculo_Dulceria.
    
    Flujo:  TaquillaRouter  →  "1. Solicita Cálculos"  →  ProcesadorCostos
            ProcesadorCostos →  "2. Setea Totales"       →  CotizacionModel
    """

    # Tarifas por persona según paquete de dulcería (regla de negocio)
    TARIFAS_DULCERIA = {
        "basico":  150.0,
        "premium": 250.0,
        "vip":     400.0,
    }

    # ── Diagrama 5: +obtener_diferencia_horas(inicio, fin) : float ──
    @staticmethod
    def obtener_diferencia_horas(inicio: datetime, fin: datetime) -> float:
        """Calcula la duración del evento en horas decimales."""
        return (fin - inicio).total_seconds() / 3600

    # ── Diagrama 5: +calcular_costo_sala(horas, precio_base) : float ──
    @staticmethod
    def calcular_costo_sala(horas: float, precio_base: float) -> float:
        """Costo de renta = horas × precio por hora."""
        return horas * precio_base

    # ── Diagrama 5: +determinar_tarifa_dulceria(paquete) : float ──
    @staticmethod
    def determinar_tarifa_dulceria(paquete: str) -> float:
        """Retorna el precio unitario por persona según el paquete seleccionado."""
        return ProcesadorCostos.TARIFAS_DULCERIA.get(paquete.lower(), 0.0)

    # ── Diagrama 5: +totalizar(c_sala, c_dulceria, asistentes) : float ──
    @staticmethod
    def totalizar(costo_sala: float, tarifa_dulceria: float, asistentes: int) -> float:
        """Suma el costo de sala + (tarifa unitaria de dulcería × asistentes)."""
        return costo_sala + (tarifa_dulceria * asistentes)
