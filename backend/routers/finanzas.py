"""
MÓDULO DE FINANZAS - Generación y Gestión de Facturas
======================================================
Implementa endpoints para la creación, consulta y generación de PDFs de facturas
basado en el diagrama UML con clases y responsabilidades definidas.

Clases:
- Factura: Clase base
- FacturaIndividual: Factura para servicios individuales
- FacturaEvento: Factura para eventos
- FacturaPDF: Gestión de PDFs

Responsables: Luis Eduardo (CU-09, CU-10)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
import models

# ============================================================================
# CONFIGURACIÓN DEL ROUTER
# ============================================================================

router = APIRouter(
    prefix="/finanzas",
    tags=["finanzas"],
    responses={404: {"description": "No encontrado"}}
)

# ============================================================================
# MODELOS PYDANTIC PARA VALIDACIÓN
# ============================================================================

class FacturaIndividualCreate(BaseModel):
    """Schema para crear una factura individual."""
    tipo_servicio: str
    id_cliente: Optional[int] = None
    id_venta: Optional[int] = None
    id_gerente: int  # OBLIGATORIO: Gerente que genera la factura


class FacturaEventoCreate(BaseModel):
    """Schema para crear una factura de evento."""
    id_evento: int
    id_cliente: Optional[int] = None
    id_gerente: int  # OBLIGATORIO: Gerente que genera la factura


class FacturaUpdate(BaseModel):
    """Schema para actualizar estado de factura."""
    estado: str


class ClienteValidateRequest(BaseModel):
    """Schema para validar datos fiscales del cliente."""
    id_cliente: int


class FacturaConfirmarRequest(BaseModel):
    """Schema para confirmar factura (requiere gerente)."""
    id_gerente: int


# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def factura_to_dict(factura: models.Factura) -> dict:
    """
    Convierte una factura a diccionario para respuesta JSON.
    Incluye información específica según el tipo de factura.
    """
    resultado = {
        "id_factura": factura.id_factura,
        "fecha": factura.fecha,
        "total": factura.total,
        "estado": factura.estado,
        "tipo_factura": factura.tipo_factura,
    }
    
    # Información específica de FacturaIndividual
    if isinstance(factura, models.FacturaIndividual):
        resultado.update({
            "tipo_servicio": factura.tipo_servicio,
            "id_cliente": factura.id_cliente,
            "id_venta": factura.id_venta,
            "cliente": {
                "id": factura.cliente.id_cliente,
                "nombre": factura.cliente.nombre
            } if factura.cliente else None,
        })
    
    # Información específica de FacturaEvento
    elif isinstance(factura, models.FacturaEvento):
        resultado.update({
            "nombre_evento": factura.nombre_evento,
            "id_evento": factura.id_evento,
            "evento": {
                "id": factura.evento.id_evento,
                "tipo": factura.evento.tipo_evento
            } if factura.evento else None,
        })
    
    # Información del PDF si existe
    if factura.factura_pdf is not None:
        resultado["pdf"] = {
            "id_pdf": factura.factura_pdf.id_pdf,
            "archivo": factura.factura_pdf.archivo,
            "fecha_generacion": factura.factura_pdf.fecha_generacion,
        }
    else:
        resultado["pdf"] = None
    
    return resultado


def get_factura(db: Session, factura_id: int) -> Optional[models.Factura]:
    """Obtiene una factura por ID."""
    return db.query(models.Factura).filter(
        models.Factura.id_factura == factura_id
    ).first()


# ============================================================================
# ENDPOINTS - LISTADO Y CONSULTA
# ============================================================================

@router.get("/facturas", response_description="Lista de todas las facturas")
def listar_facturas(
    db: Session = Depends(get_db),
    estado: Optional[str] = Query(None, description="Filtrar por estado")
):
    """
    Lista todas las facturas del sistema.
    Opcionalmente filtra por estado.
    
    Estados válidos: pendiente, pagada, cancelada
    """
    query = db.query(models.Factura)
    
    if estado:
        query = query.filter(models.Factura.estado == estado)
    
    facturas = query.all()
    return [factura_to_dict(f) for f in facturas]


@router.get("/facturas/{factura_id}", response_description="Detalle de una factura")
def obtener_factura(factura_id: int, db: Session = Depends(get_db)):
    """Obtiene los detalles de una factura específica por su ID."""
    factura = get_factura(db, factura_id)
    if factura is None:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return factura_to_dict(factura)


@router.get("/facturas/tipo/{tipo}", response_description="Facturas por tipo")
def listar_facturas_por_tipo(
    tipo: str,
    db: Session = Depends(get_db)
):
    """
    Lista facturas según su tipo.
    
    Tipos válidos: factura_individual, factura_evento
    """
    facturas = db.query(models.Factura).filter(
        models.Factura.tipo_factura == tipo
    ).all()
    
    if not facturas:
        raise HTTPException(
            status_code=404,
            detail=f"No hay facturas del tipo '{tipo}'"
        )
    
    return [factura_to_dict(f) for f in facturas]


# ============================================================================
# ENDPOINTS - CREACIÓN DE FACTURAS
# ============================================================================

@router.post("/facturas/individual", response_description="Factura individual creada")
def crear_factura_individual(
    payload: FacturaIndividualCreate,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva factura individual.
    Solo un gerente puede crear facturas.
    
    Responsabilidades:
    - Validar existencia del gerente (OBLIGATORIO)
    - Validar existencia de cliente (si se proporciona)
    - Validar existencia de venta (si se proporciona)
    - Asociar cliente y venta mediante métodos de la clase
    - Registrar factura en la base de datos
    - Generar PDF automáticamente
    """
    # Validar que el gerente existe (OBLIGATORIO)
    gerente = db.get(models.Gerente, payload.id_gerente)
    if gerente is None:
        raise HTTPException(
            status_code=404,
            detail=f"Gerente con ID {payload.id_gerente} no encontrado o no autorizado"
        )
    
    # Crear la factura individual con el gerente
    factura = models.FacturaIndividual(
        tipo_servicio=payload.tipo_servicio,
        id_gerente=payload.id_gerente
    )
    
    # Validar y asociar cliente si se proporciona ID
    if payload.id_cliente is not None:
        cliente = db.get(models.Cliente, payload.id_cliente)
        if cliente is None:
            raise HTTPException(
                status_code=404,
                detail=f"Cliente con ID {payload.id_cliente} no encontrado"
            )
        factura.asociarCliente(cliente)
        
        # Validar datos fiscales del cliente
        validacion = cliente.validarDatosFiscales()
        if not validacion["valido"]:
            raise HTTPException(
                status_code=400,
                detail=f"Datos fiscales del cliente inválidos: {', '.join(validacion['errores'])}"
            )
    
    # Validar y asociar venta si se proporciona ID
    if payload.id_venta is not None:
        venta = db.get(models.Venta, payload.id_venta)
        if venta is None:
            raise HTTPException(
                status_code=404,
                detail=f"Venta con ID {payload.id_venta} no encontrada"
            )
        factura.asociarVentas(venta)
    
    # Registrar factura
    factura.registrarFactura(db)
    
    # Generar PDF
    factura.generarPDF()
    
    # Persistir PDF en BD
    db.add(factura.factura_pdf)
    db.commit()
    db.refresh(factura)
    
    return factura_to_dict(factura)


@router.post("/facturas/evento", response_description="Factura de evento creada")
def crear_factura_evento(
    payload: FacturaEventoCreate,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva factura de evento.
    Solo un gerente puede crear facturas.
    
    Responsabilidades:
    - Validar existencia del gerente (OBLIGATORIO)
    - Validar existencia del evento
    - Seleccionar evento mediante método de la clase
    - Generar factura del evento (calcular total)
    - Registrar factura en la base de datos
    - Generar PDF automáticamente
    """
    # Validar que el gerente existe (OBLIGATORIO)
    gerente = db.get(models.Gerente, payload.id_gerente)
    if gerente is None:
        raise HTTPException(
            status_code=404,
            detail=f"Gerente con ID {payload.id_gerente} no encontrado o no autorizado"
        )
    
    # Validar que el evento existe
    evento = db.get(models.Evento, payload.id_evento)
    if evento is None:
        raise HTTPException(
            status_code=404,
            detail=f"Evento con ID {payload.id_evento} no encontrado"
        )
    
    # Crear factura de evento con el gerente
    factura = models.FacturaEvento(
        id_gerente=payload.id_gerente,
        id_cliente=payload.id_cliente
    )
    
    # Seleccionar evento
    factura.seleccionarEvento(evento)
    
    # Generar factura del evento (calcula el total)
    factura.generarFacturaEvento()
    
    # Registrar factura
    factura.registrarFactura(db)
    
    # Generar PDF
    factura.generarPDF()
    
    # Persistir PDF en BD
    db.add(factura.factura_pdf)
    db.commit()
    db.refresh(factura)
    
    return factura_to_dict(factura)


# ============================================================================
# ENDPOINTS - ACTUALIZACIÓN Y GESTIÓN
# ============================================================================

@router.put("/facturas/{factura_id}", response_description="Factura actualizada")
def actualizar_estado_factura(
    factura_id: int,
    payload: FacturaUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza el estado de una factura.
    
    Estados válidos: pendiente, pagada, cancelada
    """
    factura = get_factura(db, factura_id)
    if factura is None:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    
    estados_validos = ["pendiente", "pagada", "cancelada"]
    if payload.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Válidos: {', '.join(estados_validos)}"
        )
    
    factura.estado = payload.estado
    db.commit()
    db.refresh(factura)
    
    return factura_to_dict(factura)


@router.post("/facturas/{factura_id}/generar_pdf", response_description="PDF generado")
def generar_pdf_factura(factura_id: int, db: Session = Depends(get_db)):
    """
    Genera o regenera el PDF de una factura existente.
    """
    factura = get_factura(db, factura_id)
    if factura is None:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    
    # Generar PDF
    factura.generarPDF()
    
    # Actualizar o crear registro en BD
    if factura.factura_pdf:
        db.merge(factura.factura_pdf)
    else:
        db.add(factura.factura_pdf)
    
    db.commit()
    db.refresh(factura)
    
    return {
        "mensaje": "PDF generado exitosamente",
        "factura": factura_to_dict(factura),
    }


@router.post("/facturas/{factura_id}/confirmar", response_description="Factura confirmada")
def confirmar_factura(
    factura_id: int,
    payload: FacturaConfirmarRequest,
    db: Session = Depends(get_db)
):
    """
    Confirma una factura existente.
    Solo un gerente puede confirmar facturas.
    Cambia el estado a 'confirmada'.
    """
    # Validar que el gerente existe
    gerente = db.get(models.Gerente, payload.id_gerente)
    if gerente is None:
        raise HTTPException(
            status_code=404,
            detail="Gerente no encontrado o no autorizado para confirmar"
        )
    
    # Usar el método del gerente para confirmar
    exito = gerente.confirmarFactura(factura_id, db)
    
    if not exito:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    
    factura = get_factura(db, factura_id)
    
    return {
        "mensaje": "Factura confirmada exitosamente",
        "factura": factura_to_dict(factura),
    }


@router.post("/cliente/{id_cliente}/validar-datos-fiscales", response_description="Validación de datos fiscales")
def validar_datos_fiscales_cliente(
    id_cliente: int,
    db: Session = Depends(get_db)
):
    """
    Valida que los datos fiscales de un cliente sean correctos.
    Retorna estatus y mensajes de validación.
    """
    cliente = db.get(models.Cliente, id_cliente)
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    validacion = cliente.validarDatosFiscales()
    
    return {
        "id_cliente": id_cliente,
        "validacion": validacion,
        "cliente": {
            "nombre": cliente.nombre,
            "rfc": cliente.rfc,
            "correo": cliente.correo,
            "codigo_postal": cliente.codigo_postal
        }
    }


@router.get("/evento/{id_evento}/resumen-venta", response_description="Resumen de venta del evento")
def obtener_resumen_venta_evento(
    id_evento: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene el resumen de venta de un evento específico.
    Incluye cantidad, total y promedio de ventas.
    """
    evento = db.get(models.Evento, id_evento)
    if evento is None:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    resumen = evento.obtenerResumenVenta()
    
    return resumen


@router.get("/venta/{id_venta}/datos", response_description="Datos de la venta")
def obtener_datos_venta(
    id_venta: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene los datos completos de una venta específica.
    Incluye información del cliente y evento asociados.
    """
    venta = db.get(models.Venta, id_venta)
    if venta is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    datos = venta.obtenerDatosVenta()
    
    return datos


# ============================================================================
# ENDPOINTS - REPORTES Y ESTADÍSTICAS
# ============================================================================

@router.get("/reportes/ventas-totales", response_description="Total de ventas")
def total_ventas(db: Session = Depends(get_db)):
    """Calcula el total de ventas de todas las facturas pagadas."""
    facturas = db.query(models.Factura).filter(
        models.Factura.estado == "pagada"
    ).all()
    
    total = sum(f.calcularTotal() for f in facturas)
    cantidad = len(facturas)
    
    return {
        "total_ventas": total,
        "cantidad_facturas": cantidad,
        "promedio": total / cantidad if cantidad > 0 else 0,
    }


@router.get("/reportes/por-tipo", response_description="Reportes por tipo de factura")
def reportes_por_tipo(db: Session = Depends(get_db)):
    """Genera reportes separados por tipo de factura."""
    facturas_individuales = db.query(models.FacturaIndividual).all()
    facturas_eventos = db.query(models.FacturaEvento).all()
    
    total_individual = sum(f.calcularTotal() for f in facturas_individuales)
    total_eventos = sum(f.calcularTotal() for f in facturas_eventos)
    
    return {
        "facturas_individuales": {
            "cantidad": len(facturas_individuales),
            "total": total_individual,
            "promedio": total_individual / len(facturas_individuales) if facturas_individuales else 0,
        },
        "facturas_eventos": {
            "cantidad": len(facturas_eventos),
            "total": total_eventos,
            "promedio": total_eventos / len(facturas_eventos) if facturas_eventos else 0,
        },
        "total_general": total_individual + total_eventos,
    }


@router.get("/reportes/por-estado", response_description="Reportes por estado")
def reportes_por_estado(db: Session = Depends(get_db)):
    """Genera reportes agrupados por estado de factura."""
    estados = ["pendiente", "pagada", "cancelada"]
    reportes = {}
    
    for estado in estados:
        facturas = db.query(models.Factura).filter(
            models.Factura.estado == estado
        ).all()
        
        total = sum(f.calcularTotal() for f in facturas)
        reportes[estado] = {
            "cantidad": len(facturas),
            "total": total,
        }
    
    return reportes