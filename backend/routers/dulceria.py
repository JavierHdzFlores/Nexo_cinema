from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from datetime import datetime

# Router para el Módulo 2B: Ventas (Dulcería y Lealtad) - Miguel (CU-05, CU-06)
router = APIRouter(
    prefix="/dulceria",
    tags=["Dulcería y Lealtad"]
)

@router.get("/productos", response_model=list[schemas.ArticuloDulceriaResponse])
def obtener_catalogo_productos(db: Session = Depends(get_db)):
    """
    Paso 2 del CU-05: El sistema muestra el catálogo de productos disponibles.
    """
    productos = db.query(models.ArticuloDulceria).all()
    return productos

@router.get("/seed")
def seed_base_datos(db: Session = Depends(get_db)):
    """Ruta temporal para inicializar la base de datos de dulcería"""
    from seed_dulceria import seed_dulceria
    try:
        seed_dulceria()
        return {"mensaje": "Base de datos inicializada correctamente con productos y combos."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# GESTOR MONEDERO (Clase controladora para CU-06)
# Implementa las responsabilidades del Diagrama CRC:
#   - validar existencia y estado de la cuenta
#   - mostrar saldo disponible y equivalencias
#   - calcular el 5% de puntos a acumular (Regla 2)
#   - coordinar actualización si hay canje
# ============================================================================
class GestorMonedero:
    def __init__(self, db: Session):
        self.db = db
        self._saldo_anterior: int = 0  # Para el comprobante del Ticket

    def validarCuenta(self, id_cliente: int) -> models.Monedero | None:
        """
        Flujo CU-06 Paso 2: buscarCuenta(id).
        Retorna el monedero si es válido y activo.
        Diferencia explícitamente entre 'inexistente' y 'bloqueado' (E2).
        """
        monedero = self.db.query(models.Monedero).filter(
            models.Monedero.id_cliente == id_cliente
        ).first()

        if not monedero:
            raise LookupError("inexistente")
        if monedero.estado == "Vencida":
            raise LookupError("vencida")
        if monedero.estado == "Bloqueada":
            raise LookupError("bloqueada")
        return monedero

    def procesarCanje(self, monedero: models.Monedero, monto: int, ticket: models.Ticket = None) -> int:
        """
        Flujo CU-06 Paso 6, Opción Canjear.
        Retorna los puntos canjeados realmente descontados.
        """
        self._saldo_anterior = monedero.consultarSaldo()
        puntos_a_descontar = min(monto, self._saldo_anterior)  # Nunca por debajo de 0

        monedero.actualizarSaldo(puntos_a_descontar, "Canje")

        transaccion = models.TransaccionPuntos(
            id_monedero=monedero.id_monedero,
            monto=puntos_a_descontar,
            tipo="Canje"
        )
        transaccion.registrar(
            self.db, 
            s1=self._saldo_anterior, 
            mov=puntos_a_descontar, 
            s2=monedero.consultarSaldo(), 
            ticket=ticket
        )

        return puntos_a_descontar

    def aplicarReglaPuntos(self, monedero: models.Monedero, montoCompra: float, ticket: models.Ticket = None) -> int:
        """
        Regla de Negocio 2 (CU-06): acumular el 5% del monto pagado en efectivo.
        Flujo CU-06 Paso 6, Opción Acumular.
        """
        self._saldo_anterior = monedero.consultarSaldo()
        puntos_ganados = int(montoCompra * 0.05)

        if puntos_ganados > 0:
            monedero.actualizarSaldo(puntos_ganados, "Acumular")

            transaccion = models.TransaccionPuntos(
                id_monedero=monedero.id_monedero,
                monto=puntos_ganados,
                tipo="Acumulacion"
            )
            transaccion.registrar(
                self.db, 
                s1=self._saldo_anterior, 
                mov=puntos_ganados, 
                s2=monedero.consultarSaldo(), 
                ticket=ticket
            )

        return puntos_ganados

    def coordinarFinalizacion(self) -> None:
        """
        Flujo CU-06 Paso 8: finalizarProceso().
        Persiste todos los cambios del monedero en la DB.
        """
        self.db.commit()

    def generarComprobanteMonedero(
        self,
        monedero: models.Monedero,
        tipo: str,
        puntos_movimiento: int
    ) -> schemas.MovimientoMonederoResponse:
        """
        Ticket.generarDetalle(saldoAnt, mov, saldoNvo) — Diagrama 4 CU-06.
        Construye el comprobante de puntos para el Ticket final.
        """
        saldo_nuevo = monedero.consultarSaldo()
        mov_signed = puntos_movimiento if tipo == "Acumulacion" else -puntos_movimiento
        return schemas.MovimientoMonederoResponse(
            tipo_movimiento=tipo,
            saldo_anterior=self._saldo_anterior,
            puntos_movimiento=mov_signed,
            saldo_nuevo=saldo_nuevo,
        )


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/monedero/{id_cliente}/saldo")
def consultar_saldo_monedero(id_cliente: int, db: Session = Depends(get_db)):
    """
    CU-06 Pasos 1-3: solicitarValidacion → buscarCuenta → retornarSaldo.
    Diferencia errores: inexistente (404) vs bloqueada (403).
    """
    gestor = GestorMonedero(db)
    try:
        monedero = gestor.validarCuenta(id_cliente)
    except LookupError as e:
        codigo = 403 if str(e) in ["bloqueada", "vencida"] else 404
        mensaje = "Cuenta vencida por expiración." if str(e) == "vencida" else f"Cuenta {str(e)}"
        raise HTTPException(
            status_code=codigo,
            detail=mensaje
        )
    return {"id_cliente": id_cliente, "saldoPuntos": monedero.consultarSaldo()}


@router.post("/vender", response_model=schemas.VentaDulceriaResponse)
def vender_dulceria(venta_req: schemas.VentaDulceriaRequest, db: Session = Depends(get_db)):
    """
    CU-05: Registrar venta, descontar inventario y procesar pago.
    CU-06: Acumular o canjear puntos al finalizar.
    """
    gestor = GestorMonedero(db)

    try:
        # ── 1. Iniciar Venta ──
        nueva_venta = models.Venta(total=0.0, metodo_pago=venta_req.metodo_pago)
        nueva_venta.iniciarVenta() # Estado: "Iniciada"
        if venta_req.id_cliente:
            nueva_venta.id_cliente = venta_req.id_cliente
        if venta_req.id_evento:
            nueva_venta.id_evento = venta_req.id_evento
            
        db.add(nueva_venta)
        db.flush() # ATOMICIDAD: Flush en lugar de commit para no cerrar la transacción

        detalles_venta = []

        # ── 2. Carga de productos y descuento de inventario ──
        for item in venta_req.detalles:
            articulo = db.query(models.ArticuloDulceria).filter(
                models.ArticuloDulceria.id_articulo == item.id_articulo
            ).first()
            if not articulo:
                raise HTTPException(status_code=404, detail=f"Artículo {item.id_articulo} no encontrado")

            # Diagrama 7: agregarDetalle(articulo, cant) -> calcularSubtotal()
            detalle = nueva_venta.agregarDetalle(articulo, item.cantidad)
            detalles_venta.append(detalle)
            db.add(detalle)

            if isinstance(articulo, models.ProductoIndividual):
                for receta in articulo.receta:
                    insumo = receta.insumo
                    cant_necesaria = receta.cantidad_requerida * item.cantidad
                    try:
                        insumo.descontarStock(cant_necesaria)
                        log_mov = models.LogMovimiento(
                            id_insumo=insumo.id_insumo,
                            accion=f"Venta #{nueva_venta.id_venta} - {articulo.nombre}"
                        )
                        db.add(log_mov) # Se omite guardarRegistro para mantener la transacción abierta
                    except ValueError as e:
                        raise HTTPException(status_code=400, detail=str(e))

            elif isinstance(articulo, models.Combo):
                for combo_prod in articulo.productos_combo:
                    prod_ind = combo_prod.producto
                    cant_prod_total = combo_prod.cantidad * item.cantidad
                    for receta in prod_ind.receta:
                        insumo = receta.insumo
                        cant_necesaria = receta.cantidad_requerida * cant_prod_total
                        try:
                            insumo.descontarStock(cant_necesaria)
                            log_mov = models.LogMovimiento(
                                id_insumo=insumo.id_insumo,
                                accion=f"Venta #{nueva_venta.id_venta} - Combo: {articulo.nombre}"
                            )
                            db.add(log_mov)
                        except ValueError as e:
                            raise HTTPException(status_code=400, detail=str(e))

        # Diagrama 7: calcularTotal()
        total_calculado = nueva_venta.calcularTotal(detalles_venta)
        db.flush()

        # ── Generación temprana del Ticket ──
        import uuid
        ticket = models.Ticket(
            id_venta=nueva_venta.id_venta,
            folio_fiscal=f"TICK-{uuid.uuid4().hex[:8].upper()}"
        )
        db.add(ticket)
        db.flush()

        # ── 3. Procesamiento del Monedero (CU-06) ──
        comprobante_monedero: schemas.MovimientoMonederoResponse | None = None

        if venta_req.id_cliente:
            try:
                monedero = gestor.validarCuenta(venta_req.id_cliente)

                if venta_req.usar_puntos and venta_req.puntos_a_usar and venta_req.puntos_a_usar > 0:
                    puntos_canjeados = gestor.procesarCanje(monedero, venta_req.puntos_a_usar, ticket)
                    descuento = float(min(puntos_canjeados, int(total_calculado)))
                    nueva_venta.total = max(0.0, total_calculado - descuento)
                    comprobante_monedero = gestor.generarComprobanteMonedero(monedero, "Canje", puntos_canjeados)
                else:
                    puntos_acumulados = gestor.aplicarReglaPuntos(monedero, nueva_venta.total, ticket)
                    comprobante_monedero = gestor.generarComprobanteMonedero(monedero, "Acumulacion", puntos_acumulados)

            except LookupError as e:
                pass
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))

        # ── 4. Procesar Pago (autorizarPago) ──
        nueva_venta.procesarPago() # Estado: "PendienteDePago"
        nuevo_pago = models.Pago(id_venta=nueva_venta.id_venta, monto=nueva_venta.total)
        if not nuevo_pago.autorizarPago():
            raise HTTPException(status_code=400, detail="Pago rechazado por el sistema")
        db.add(nuevo_pago)

        # ── 5. Registrar Venta (Estado final y Ticket) ──
        nueva_venta.registrarVenta() # Estado: "Finalizada"
        
        # ── 6. COMMIT ATÓMICO FINAL ──
        # Persiste el inventario, los puntos y el ticket en el mismo milisegundo
        db.commit()
        db.refresh(ticket)
        
        ticket.generarPDF()
        ticket.imprimir()

        return schemas.VentaDulceriaResponse(
            id_venta=nueva_venta.id_venta,
            total=nueva_venta.total,
            estado=nueva_venta.estado,
            mensaje="Venta registrada exitosamente.",
            monedero=comprobante_monedero
        )

    except HTTPException as http_exc:
        # Capturamos excepciones controladas y hacemos ROLLBACK seguro
        db.rollback()
        raise http_exc
    except Exception as e:
        # Fallo crítico de integridad (ej: constraint fail, db bloqueada)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transacción abortada: {str(e)}")