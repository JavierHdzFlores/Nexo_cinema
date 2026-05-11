from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from typing import Optional
import datetime

class Sala(Base):
    __tablename__ = "salas"
    id_sala = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, index=True)
    capacidad = Column(Integer, nullable=False)
    estado = Column(String(20), default="Disponible") # Disponible, En limpieza, Evento Privado
    tipo = Column(String(20)) # VIP, IMAX, Tradicional

    # NUEVO: Efecto espejo hacia Evento
    eventos = relationship("Evento", back_populates="sala")

    # ==========================================
    # RESPONSABILIDADES (Diagrama CU-02)
    # ==========================================
    def verificarBoletosVendidos(self, db, fecha_inicio, fecha_fin) -> bool:
        """
        Responsabilidad: Validar si hay boletos vendidos en un rango de tiempo
        Retorna True si existen boletos vendidos, False si está libre.
        """
        from sqlalchemy import inspect
        if not db:
            return False
            
        eventos_sala = db.query(Evento).filter(
            Evento.id_sala == self.id_sala,
            Evento.fecha_hora_inicio < fecha_fin,
            Evento.fecha_hora_fin > fecha_inicio
        ).all()
        
        for evento in eventos_sala:
            ventas = db.query(Venta).filter(Venta.id_evento == evento.id_evento).all()
            if len(ventas) > 0:
                return True
        return False

    def cambiarEstado(self, nuevoEstado: str) -> None:
        """Responsabilidad: Mantener estado de disponibilidad"""
        self.estado = nuevoEstado

    def bloquearParaTaquilla(self) -> None:
        """Bloquea la sala estableciendo estado a Evento Privado"""
        self.cambiarEstado("Evento Privado")

    # ==========================================
    # RESPONSABILIDADES (Diagrama CU-01)
    # ==========================================
    def validarEmpalmes(self, db, fecha_inicio, fecha_fin) -> bool:
        """
        Responsabilidad CU-01: Validar empalmes de horario.
        Retorna True si hay un evento empalmado.
        """
        if not db:
            return False
            
        empalmes = db.query(Evento).filter(
            Evento.id_sala == self.id_sala,
            Evento.fecha_hora_inicio < fecha_fin,
            Evento.fecha_hora_fin > fecha_inicio
        ).all()
        return len(empalmes) > 0



class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), unique=True, index=True)
    password = Column(String(255), nullable=False)
    tipo_usuario = Column(String(50)) # Columna discriminadora

    __mapper_args__ = {
        "polymorphic_identity": "usuario",
        "polymorphic_on": tipo_usuario,
    }

class Cliente(Usuario):
    __tablename__ = "clientes"
    id_cliente = Column(Integer, ForeignKey("usuarios.id_usuario"), primary_key=True)
    rfc = Column(String(13), nullable=True, unique=True, index=True)
    codigo_postal = Column(String(10), nullable=True)
    puntos_monedero = Column(Integer, default=0)
    
    # NUEVO: Efecto espejo hacia las tablas que usan Cliente
    ventas = relationship("Venta", back_populates="cliente")
    facturas_individuales = relationship("FacturaIndividual", back_populates="cliente")
    facturas_eventos = relationship("FacturaEvento", back_populates="cliente")

    __mapper_args__ = {"polymorphic_identity": "cliente"}
    
    def validarDatosFiscales(self) -> dict:
        errores = []
        if not self.rfc or len(self.rfc) != 13:
            errores.append("RFC debe tener exactamente 13 caracteres")
        if not self.correo or '@' not in self.correo:
            errores.append("Correo electrónico inválido")
        if not self.codigo_postal or len(self.codigo_postal) < 5:
            errores.append("Código postal debe tener al menos 5 dígitos")
        if not self.nombre or len(self.nombre) < 3:
            errores.append("Nombre debe tener al menos 3 caracteres")
        
        return {
            "valido": len(errores) == 0,
            "errores": errores
        }
    
    def obtenerResumenCompras(self) -> dict:
        total = sum(venta.total for venta in self.ventas)
        return {
            "id_cliente": self.id_cliente,
            "nombre": self.nombre,
            "total_comprado": total,
            "cantidad_compras": len(self.ventas)
        }

class Empleado(Usuario):
    __tablename__ = "empleados"
    id_empleado = Column(Integer, ForeignKey("usuarios.id_usuario"), primary_key=True)
    puesto = Column(String(50))
    turno = Column(String(50))

    __mapper_args__ = {"polymorphic_identity": "empleado"}


class Gerente(Empleado):
    __tablename__ = "gerentes"
    id_gerente = Column(Integer, ForeignKey("empleados.id_empleado"), primary_key=True)
    matricula = Column(String(20), unique=True, index=True, nullable=False)
    
    # NUEVO: Efecto espejo hacia Factura
    facturas_generadas = relationship("Factura", back_populates="gerente")
    reportes_generados = relationship("ReporteVentas", back_populates="gerente")

    __mapper_args__ = {"polymorphic_identity": "gerente"}

    def consultarReportes(self) -> list:
        return self.reportes_generados

    def visualizarGraficas(self, reporte: "ReporteVentas") -> dict:
        return {
            "tipo": reporte.tipoGrafica,
            "datos": reporte.generarReporte()
        }
    
    def generarFactura(self, tipo_factura: str, datos: dict, db=None):
        if tipo_factura == 'individual':
            factura = FacturaIndividual(
                tipo_servicio=datos.get('tipo_servicio'),
                id_cliente=datos.get('id_cliente'),
                id_venta=datos.get('id_venta'),
                id_gerente=self.id_gerente
            )
        elif tipo_factura == 'evento':
            factura = FacturaEvento(
                nombre_evento=datos.get('nombre_evento'),
                id_evento=datos.get('id_evento'),
                id_cliente=datos.get('id_cliente'),
                id_gerente=self.id_gerente
            )
        else:
            raise ValueError(f"Tipo de factura desconocido: {tipo_factura}")
        
        if db is not None:
            db.add(factura)
            db.commit()
            db.refresh(factura)
        
        return factura
    
    def confirmarFactura(self, factura_id: int, db=None) -> bool:
        if db is None:
            return False
        
        factura = db.query(Factura).filter(Factura.id_factura == factura_id).first()
        if factura is None:
            return False
        
        factura.estado = "confirmada"
        db.commit()
        db.refresh(factura)
        return True

class VendedorDulceria(Empleado):
    __tablename__ = "vendedores_dulceria"
    id_vendedor = Column(Integer, ForeignKey("empleados.id_empleado"), primary_key=True)
    caja_asignada = Column(Integer, nullable=True)

    __mapper_args__ = {"polymorphic_identity": "vendedor_dulceria"}



class Evento(Base):
    __tablename__ = "eventos"
    id_evento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sala = Column(Integer, ForeignKey("salas.id_sala"))
    nombre = Column(String(150), nullable=False)
    fecha_hora_inicio = Column(DateTime, default=datetime.datetime.now, nullable=False)
    fecha_hora_fin = Column(DateTime)
    tipo_evento = Column(String(50)) 

    # Relaciones actualizadas a back_populates
    sala = relationship("Sala", back_populates="eventos")
    ventas = relationship("Venta", back_populates="evento")
    factura_evento = relationship("FacturaEvento", uselist=False, back_populates="evento")

    __mapper_args__ = {
        "polymorphic_identity": "evento",
        "polymorphic_on": tipo_evento,
    }
    
    def obtenerResumenVenta(self) -> dict:
        from sqlalchemy import inspect
        total_ventas = 0.0
        cantidad_ventas = 0
        try:
            ventas = inspect(self).session.query(Venta).filter(
                Venta.id_evento == self.id_evento
            ).all() if hasattr(inspect(self), 'session') else []
            
            total_ventas = sum(v.total for v in ventas)
            cantidad_ventas = len(ventas)
        except:
            pass
        
        return {
            "id_evento": self.id_evento,
            "nombre_evento": self.nombre,
            "fecha": self.fecha_hora_inicio,
            "cantidad_ventas": cantidad_ventas,
            "total_ventas": total_ventas,
            "promedio_venta": total_ventas / cantidad_ventas if cantidad_ventas > 0 else 0.0,
            "tipo_evento": self.tipo_evento
        }

# ==========================================
# CATÁLOGO DE PELÍCULAS (Base de la Cartelera Inteligente)
# ==========================================
class Pelicula(Base):
    __tablename__ = "peliculas"
    id_pelicula = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(150), nullable=False, unique=True)
    sinopsis = Column(String(500), nullable=True)
    clasificacion = Column(String(10), nullable=False) # A, B, B15, C
    duracion_minutos = Column(Integer, nullable=False)
    imagen_url = Column(String(255), nullable=True)
    
    # Efecto espejo a proyecciones
    proyecciones = relationship("ProyeccionPublica", back_populates="pelicula_obj")


class ProyeccionPublica(Evento):
    __tablename__ = "proyecciones_publicas"
    id_proyeccion = Column(Integer, ForeignKey("eventos.id_evento"), primary_key=True)
    id_pelicula = Column(Integer, ForeignKey("peliculas.id_pelicula"), nullable=False)
    precio_boleto = Column(Float, nullable=False)
    
    # Relación al catálogo maestro
    pelicula_obj = relationship("Pelicula", back_populates="proyecciones")

    __mapper_args__ = {"polymorphic_identity": "proyeccion_publica"}

    # ==========================================
    # RESPONSABILIDADES (Diagramas CU-01)
    # ==========================================
    @property
    def tiempo_limpieza(self) -> int:
        return 30

    def calcularHoraFin(self) -> datetime.datetime:
        """Calcula la hora de fin sumando duración de película + limpieza"""
        if not self.pelicula_obj or not self.fecha_hora_inicio:
            return None
        return self.fecha_hora_inicio + datetime.timedelta(minutes=self.pelicula_obj.duracion_minutos + self.tiempo_limpieza)

    def registrarFuncion(self, db) -> None:
        """Responsabilidad: Habilitar venta de boletos (Persistir en BD)"""
        db.add(self)
        db.commit()
        db.refresh(self)

    def mostrarResumen(self) -> str:
        """Muestra el resumen de la función"""
        return f"Función de {self.pelicula_obj.titulo} el {self.fecha_hora_inicio} en Sala {self.id_sala}"

class EventoPrivado(Evento):
    __tablename__ = "eventos_privados"
    id_evento_privado = Column(Integer, ForeignKey("eventos.id_evento"), primary_key=True)
    organizador = Column(String(100))
    motivo = Column(String(200))
    costo_renta = Column(Float, nullable=False)
    
    # NUEVOS CAMPOS (CU-02: Servicios Adicionales)
    req_microfonos = Column(Boolean, default=False)
    req_catering = Column(Boolean, default=False)
    req_iluminacion = Column(Boolean, default=False)

    __mapper_args__ = {"polymorphic_identity": "evento_privado"}

    # ==========================================
    # RESPONSABILIDADES (Diagrama CU-02)
    # ==========================================
    def agregarServicio(self, servicio: str) -> None:
        """Agrega un servicio adicional marcando el flag correspondiente"""
        if servicio == "microfonos":
            self.req_microfonos = True
        elif servicio == "catering":
            self.req_catering = True
        elif servicio == "iluminacion":
            self.req_iluminacion = True
            
    def calcularCostoTotal(self) -> float:
        """Calcula el costo total (renta base + servicios adicionales)"""
        total = self.costo_renta
        if self.req_microfonos:
            total += 500
        if self.req_catering:
            total += 3500
        if self.req_iluminacion:
            total += 1200
        return total
        
    def generarOrdenCobro(self) -> None:
        """Genera el proceso de cobro. Implementado en el router y pdf_utils"""
        pass

# ==========================================
# ACTUALIZACIÓN EN LA TABLA VENTA
# ==========================================
class Venta(Base):
    __tablename__ = "ventas"
    id_venta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), nullable=True)
    id_empleado = Column(Integer, ForeignKey("empleados.id_empleado"), nullable=True) # NUEVO
    fecha_venta = Column(DateTime, default=datetime.datetime.now, nullable=False)
    total = Column(Float, nullable=False)
    metodo_pago = Column(String(50), nullable=False) # NUEVO: Efectivo, Tarjeta, etc.
    estado = Column(String(20), default="Completada") # NUEVO
    
    cliente = relationship("Cliente", back_populates="ventas")
    evento = relationship("Evento", back_populates="ventas")
    factura_individual = relationship("FacturaIndividual", uselist=False, back_populates="venta")   
    boletos = relationship("Boleto", back_populates="venta") # NUEVO

    # ── Diagrama 4 (Clases Detallado): +flush_para_id() ──
    def flush_para_id(self, db) -> None:
        """Sincroniza la venta con BD para obtener el ID antes del commit final"""
        db.add(self)
        db.flush()

    # Métodos de Estado (Máquina de Estados)
    def iniciarVenta(self):
        self.estado = "Iniciada"
        
    def agregarDetalle(self, articulo, cantidad: int):
        detalle = DetalleVenta(
            id_venta=self.id_venta,
            id_articulo=articulo.id_articulo,
            cantidad=cantidad,
            articulo=articulo
        )
        detalle.calcularSubtotal()
        return detalle

    def calcularTotal(self, detalles: list) -> float:
        self.total = sum(detalle.subtotal for detalle in detalles)
        return self.total
        
    def procesarPago(self):
        self.estado = "PendienteDePago"
        
    def registrarVenta(self):
        self.estado = "Finalizada"

# ==========================================
# NUEVAS TABLAS: ASIENTO Y BOLETO (CU-04)
# ==========================================
class Asiento(Base):
    __tablename__ = "asientos"
    id_asiento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sala = Column(Integer, ForeignKey("salas.id_sala"), nullable=False)
    numero = Column(String(10), nullable=False) # Ej: A1, G5
    
    sala = relationship("Sala")

class Boleto(Base):
    __tablename__ = "boletos"
    id_boleto = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), nullable=False)
    id_asiento = Column(Integer, ForeignKey("asientos.id_asiento"), nullable=False)
    precio_final = Column(Float, nullable=False)
    
    venta = relationship("Venta", back_populates="boletos")
    evento = relationship("Evento")
    asiento = relationship("Asiento")

    # REGLA DE NEGOCIO: Evitar duplicidad de asientos en tiempo real
    __table_args__ = (
        UniqueConstraint('id_evento', 'id_asiento', name='uix_evento_asiento'),
    )

class BloqueoAsiento(Base):
    """
    Entidad adicional requerida por Regla de Negocio 1 y 2.
    Maneja el bloqueo temporal durante la selección concurrente (Excepciones E1 y E2).
    """
    __tablename__ = "bloqueos_asientos"
    id_bloqueo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), nullable=False)
    id_asiento = Column(Integer, ForeignKey("asientos.id_asiento"), nullable=False)
    fecha_expiracion = Column(DateTime, nullable=False)
    # Identificador de sesión o cliente para saber quién lo bloqueó
    id_cliente_temp = Column(String(100), nullable=False) 

    evento = relationship("Evento")
    asiento = relationship("Asiento")

    __table_args__ = (
        UniqueConstraint('id_evento', 'id_asiento', name='uix_bloqueo_evento_asiento'),
    )

# ============================================================================
# MÓDULO DE FACTURACIÓN
# ============================================================================

class Factura(Base):
    __tablename__ = "facturas"
    id_factura = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_gerente = Column(Integer, ForeignKey("gerentes.id_gerente"), nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.now, nullable=False)
    total = Column(Float, default=0.0, nullable=False)
    estado = Column(String(50), default="pendiente", nullable=False)
    tipo_factura = Column(String(50), nullable=False) 
    
    factura_pdf = relationship(
        "FacturaPDF",
        uselist=False,
        back_populates="factura",
        cascade="all, delete-orphan",
        foreign_keys="FacturaPDF.factura_id"
    )
    
    # Relación actualizada a back_populates
    gerente = relationship("Gerente", back_populates="facturas_generadas")
    
    __mapper_args__ = {
        "polymorphic_identity": "factura",
        "polymorphic_on": tipo_factura,
    }
    
    def calcularTotal(self) -> float:
        return float(self.total or 0.0)
    
    def registrarFactura(self, db=None):
        if db is not None:
            db.add(self)
            db.commit()
            db.refresh(self)
        return self
    
    def generarPDF(self, carpeta: str = "pdfs"):
        if self.factura_pdf is None:
            self.factura_pdf = FacturaPDF(factura=self)
        self.factura_pdf.crearPDF()
        self.factura_pdf.guardarPDF(carpeta)
        return self.factura_pdf


class FacturaIndividual(Factura):
    __tablename__ = "facturas_individuales"
    id_factura = Column(Integer, ForeignKey("facturas.id_factura"), primary_key=True)
    tipo_servicio = Column(String(100), nullable=False)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=True)
    
    # Relaciones actualizadas a back_populates
    cliente = relationship("Cliente", back_populates="facturas_individuales")
    venta = relationship("Venta", uselist=False, back_populates="factura_individual")
    
    __mapper_args__ = {"polymorphic_identity": "factura_individual"}
    
    def asociarCliente(self, cliente: "Cliente"):
        self.cliente = cliente
        self.id_cliente = cliente.id_cliente if cliente else None
        return self
    
    def asociarVentas(self, venta: "Venta"):
        self.venta = venta
        self.id_venta = venta.id_venta if venta else None
        if venta is not None:
            self.total = float(venta.total or 0.0)
        return self


class FacturaEvento(Factura):
    __tablename__ = "facturas_eventos"
    id_factura = Column(Integer, ForeignKey("facturas.id_factura"), primary_key=True)
    nombre_evento = Column(String(100), nullable=False)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), nullable=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=True)
    
    # Relaciones actualizadas a back_populates
    evento = relationship("Evento", uselist=False, back_populates="factura_evento")
    cliente = relationship("Cliente", back_populates="facturas_eventos")
    
    __mapper_args__ = {"polymorphic_identity": "factura_evento"}
    
    def seleccionarEvento(self, evento: "Evento"):
        self.evento = evento
        self.id_evento = evento.id_evento if evento else None
        self.nombre_evento = evento.nombre if evento else self.nombre_evento
        return self
    
    def generarFacturaEvento(self):
        if self.evento is not None:
            precio = (
                getattr(self.evento, "precio_boleto", None) or
                getattr(self.evento, "costo_renta", None) or
                self.total
            )
            self.total = float(precio)
        return self


class FacturaPDF(Base):
    __tablename__ = "facturas_pdfs"
    id_pdf = Column(Integer, primary_key=True, index=True, autoincrement=True)
    factura_id = Column(Integer, ForeignKey("facturas.id_factura"), unique=True, nullable=False)
    archivo = Column(String(255), nullable=False)
    fecha_generacion = Column(DateTime, default=datetime.datetime.now, nullable=False)
    
    factura = relationship("Factura", back_populates="factura_pdf")
    
    def crearPDF(self) -> str:
        contenido = [
            f"{'=' * 50}",
            f"FACTURA #{self.factura.id_factura}",
            f"{'=' * 50}",
            f"Fecha: {self.factura.fecha.strftime('%d/%m/%Y %H:%M')}",
            f"Estado: {self.factura.estado.upper()}",
            f"Total: ${self.factura.total:.2f}",
            f"{'=' * 50}",
        ]
        if isinstance(self.factura, FacturaEvento):
            contenido.extend([
                f"TIPO: Factura de Evento",
                f"Evento: {self.factura.nombre_evento}",
            ])
        elif isinstance(self.factura, FacturaIndividual):
            contenido.extend([
                f"TIPO: Factura Individual",
                f"Servicio: {self.factura.tipo_servicio}",
            ])
            if self.factura.cliente:
                contenido.append(f"Cliente: {self.factura.cliente.nombre}")
        
        contenido.append(f"{'=' * 50}")
        self._contenido_pdf = "\n".join(contenido)
        return self._contenido_pdf
    
    def guardarPDF(self, carpeta: str = "pdfs") -> str:
        from pathlib import Path
        carpeta_path = Path(carpeta)
        carpeta_path.mkdir(parents=True, exist_ok=True)
        filename = f"factura_{self.factura_id or 'sinid'}.txt"
        archivo_path = carpeta_path / filename
        contenido = getattr(self, "_contenido_pdf", None) or self.crearPDF()
        archivo_path.write_text(contenido, encoding="utf-8")
        self.archivo = str(archivo_path)
        self.fecha_generacion = datetime.datetime.now()
        return self.archivo


# ============================================================================
# MÓDULO DE DULCERÍA Y LEALTAD (CU-05, CU-06)
# ============================================================================

class ArticuloDulceria(Base):
    __tablename__ = "articulos_dulceria"
    id_articulo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    precio = Column(Float, nullable=False)
    stock_actual = Column(Integer, nullable=False)
    stock_minimo = Column(Integer, default=10) # Para las alertas de inventario
    tipo_articulo = Column(String(50)) # Discriminador para herencia

    __mapper_args__ = {
        "polymorphic_identity": "articulo",
        "polymorphic_on": tipo_articulo,
    }
    
    def obtenerPrecio(self) -> float:
        return self.precio



class Insumo(Base):
    __tablename__ = "insumos"

    id_insumo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    stock_actual = Column(Integer, nullable=False)
    stock_minimo = Column(Integer, default=10)

    def actualizar_stock(self, cantidad: int):
        self.stock_actual += cantidad

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id_movimiento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_insumo = Column(Integer, ForeignKey("insumos.id_insumo"))
    tipo = Column(String(20))  # entrada / salida
    cantidad = Column(Integer, nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.now)

    insumo = relationship("Insumo", backref="movimientos")

class AlertaStock(Base):
    __tablename__ = "alertas_stock"

    id_alerta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_insumo = Column(Integer, ForeignKey("insumos.id_insumo"))
    mensaje = Column(String(255))
    fecha = Column(DateTime, default=datetime.datetime.now)
    activa = Column(Boolean, default=True)

    insumo = relationship("Insumo", backref="alertas")


class ProductoIndividual(ArticuloDulceria):
    __tablename__ = "productos_individuales"
    id_producto = Column(Integer, ForeignKey("articulos_dulceria.id_articulo"), primary_key=True)
    
    # Relación con la tabla asociativa de la receta
    receta = relationship("RecetaInsumo", back_populates="producto", cascade="all, delete-orphan")

    __mapper_args__ = {"polymorphic_identity": "producto_individual"}
    
    def obtenerReceta(self) -> list:
        return self.receta

class Combo(ArticuloDulceria):
    __tablename__ = "combos_dulceria"
    id_combo = Column(Integer, ForeignKey("articulos_dulceria.id_articulo"), primary_key=True)
    
    # Relación con la tabla asociativa de productos en el combo
    productos_combo = relationship("ComboProducto", back_populates="combo", cascade="all, delete-orphan")

    __mapper_args__ = {"polymorphic_identity": "combo"}
    
    def obtenerProductos(self) -> list:
        return self.productos_combo

class InsumoDulceria(Base):
    __tablename__ = "insumos_dulceria"
    id_insumo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    stock_actual = Column(Float, nullable=False, default=0)
    unidad_medida = Column(String(50), nullable=False) # Ej. "gramos", "vasos"

    def validarDisponibilidad(self, cantRequerida: float) -> bool:
        return self.stock_actual >= cantRequerida

    def descontarStock(self, cant: float) -> None:
        if self.validarDisponibilidad(cant):
            self.stock_actual -= cant
        else:
            raise ValueError(f"Stock insuficiente de {self.nombre}")

# Clases Asociativas (Necesarias para base de datos relacional)
class RecetaInsumo(Base):
    """Asociación Muchos a Muchos entre ProductoIndividual e Insumo"""
    __tablename__ = "recetas_insumos"
    id_producto = Column(Integer, ForeignKey("productos_individuales.id_producto"), primary_key=True)
    id_insumo = Column(Integer, ForeignKey("insumos_dulceria.id_insumo"), primary_key=True)
    cantidad_requerida = Column(Float, nullable=False)
    
    producto = relationship("ProductoIndividual", back_populates="receta")
    insumo = relationship("InsumoDulceria")

class ComboProducto(Base):
    """Asociación Muchos a Muchos entre Combo y ProductoIndividual"""
    __tablename__ = "combos_productos"
    id_combo = Column(Integer, ForeignKey("combos_dulceria.id_combo"), primary_key=True)
    id_producto = Column(Integer, ForeignKey("productos_individuales.id_producto"), primary_key=True)
    cantidad = Column(Integer, nullable=False, default=1)
    
    combo = relationship("Combo", back_populates="productos_combo")
    producto = relationship("ProductoIndividual")

class DetalleVenta(Base):
    __tablename__ = "detalles_ventas"
    id_detalle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    id_articulo = Column(Integer, ForeignKey("articulos_dulceria.id_articulo"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)

    venta = relationship("Venta", backref="detalles_dulceria")
    articulo = relationship("ArticuloDulceria")
    
    def calcularSubtotal(self) -> float:
        if self.articulo:
            self.subtotal = self.articulo.obtenerPrecio() * self.cantidad
        return self.subtotal

class Pago(Base):
    __tablename__ = "pagos_dulceria"
    id_pago = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    monto = Column(Float, nullable=False)
    estado = Column(String(50), default="Aprobado")

    venta = relationship("Venta", backref="pago")
    
    def autorizarPago(self) -> bool:
        # Aquí podría ir validación con GestorPagosExterno
        self.estado = "Aprobado"
        return True

class LogMovimiento(Base):
    __tablename__ = "log_movimientos_inventario"
    id_log = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_insumo = Column(Integer, ForeignKey("insumos_dulceria.id_insumo"), nullable=False)
    accion = Column(String(200), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.now)

    insumo = relationship("InsumoDulceria")
    
    def guardarRegistro(self, db):
        db.add(self)
        db.commit()

class Ticket(Base):
    __tablename__ = "tickets_dulceria"
    id_ticket = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), unique=True, nullable=False)
    folio_fiscal = Column(String(100), unique=True, nullable=False)
    fecha_emision = Column(DateTime, default=datetime.datetime.now)

    # NUEVO: Detalle de Monedero en Ticket (Diagrama 6 Secuencia CU-06)
    saldo_anterior = Column(Integer, nullable=True)
    movimiento_puntos = Column(Integer, nullable=True)
    saldo_nuevo = Column(Integer, nullable=True)

    venta = relationship("Venta", backref="ticket")

    def generarPDF(self) -> str:
        return f"/pdfs/ticket_{self.folio_fiscal}.pdf"

    def generar(self, s1: int, mov: int, s2: int) -> None:
        self.saldo_anterior = s1
        self.movimiento_puntos = mov
        self.saldo_nuevo = s2

    def imprimir(self) -> None:
        pass

# ============================================================================
# CU-06: GESTIONAR PUNTOS (MONEDERO)
# ============================================================================

class Monedero(Base):
    __tablename__ = "monederos"
    id_monedero = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), unique=True, nullable=False)
    saldo_puntos = Column(Integer, default=0, nullable=False)
    fecha_vencimiento = Column(DateTime)
    estado = Column(String(50), default="Operativa") # "Operativa", "Vencida", "Bloqueada"

    # El Cliente "posee" 1 Monedero (backref crea la relación bidireccional sin tocar la clase Cliente)
    cliente = relationship("Cliente", backref="monedero_obj")

    def consultarSaldo(self) -> int:
        return self.saldo_puntos

    def validarSaldoSuficiente(self, monto: int) -> bool:
        return self.saldo_puntos >= monto

    def actualizarSaldo(self, monto: int, operacion: str) -> None:
        if operacion == "Canje":
            if self.validarSaldoSuficiente(monto):
                self.saldo_puntos -= monto
            else:
                raise ValueError("Saldo de puntos insuficiente")
        elif operacion == "Acumular":
            self.saldo_puntos += monto

    # Transiciones de Estado (Diagrama 7 Máquina de Estados CU-06)
    def expirarPlazo(self) -> None:
        self.estado = "Vencida"

    def detectarIrregularidad(self) -> None:
        self.estado = "Bloqueada"

    def desbloquearCuenta(self) -> None:
        self.estado = "Operativa"
        self.saldo_puntos = 0

    def reiniciarPuntos(self) -> None:
        self.estado = "Operativa"
        self.saldo_puntos = 0

class TransaccionPuntos(Base):
    __tablename__ = "transacciones_puntos"
    idTransaccion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_monedero = Column(Integer, ForeignKey("monederos.id_monedero"), nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.now)
    monto = Column(Integer, nullable=False)
    tipo = Column(String(50), nullable=False)

    monedero = relationship("Monedero", backref="historial_transacciones")

    def registrar(self, db, s1: int, mov: int, s2: int, ticket: Ticket = None) -> bool:
        db.add(self)
        
        # Secuencia CU-06: TransaccionPuntos invoca escribirEntrada() y generar()
        log = LogAuditoria()
        operacion_txt = f"{self.tipo} de {self.monto} pts. Saldo: {s1} -> {s2}"
        log.escribirEntrada(db, operacion_txt)
        
        if ticket:
            ticket.generar(s1, mov, s2)
            
        return True

class LogAuditoria(Base):
    __tablename__ = "log_auditoria_monedero"
    id_log = Column(Integer, primary_key=True, index=True, autoincrement=True)
    detalle = Column(String(255), nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.now)

    def escribirEntrada(self, db, detalle_txt: str) -> None:
        self.detalle = detalle_txt
        db.add(self)

# ============================================================================
# CU-10: CONSULTAR REPORTES DE VENTAS
# ============================================================================

class Cine(Base):
    __tablename__ = "cines"
    idCine = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=False)

    reportes = relationship("ReporteVentas", back_populates="cine")

    def obtenerHistorialVentas(self, db) -> list:
        return db.query(Venta).all()
    
    def actualizarReporte(self, reporte: "ReporteVentas"):
        pass

class ReporteVentas(Base):
    __tablename__ = "reportes_ventas"
    idReporte = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cine = Column(Integer, ForeignKey("cines.idCine"))
    id_gerente = Column(Integer, ForeignKey("gerentes.id_gerente"))
    fechaInicio = Column(Date, nullable=True)
    fechaFin = Column(Date, nullable=True)
    tipoGrafica = Column(String(50))

    cine = relationship("Cine", back_populates="reportes")
    gerente = relationship("Gerente", back_populates="reportes_generados")

    def generarReporte(self, db=None) -> dict:
        if db is None:
            return {}
        
        query = db.query(Venta)
        if self.fechaInicio:
            query = query.filter(Venta.fecha_venta >= self.fechaInicio)
        if self.fechaFin:
            fin_dia = datetime.datetime.combine(self.fechaFin, datetime.time.max)
            query = query.filter(Venta.fecha_venta <= fin_dia)
            
        ventas = query.all()
        
        total = sum(v.total for v in ventas)
        
        from collections import defaultdict
        ventas_por_fecha = defaultdict(float)
        for v in ventas:
            dia = v.fecha_venta.strftime("%Y-%m-%d") if v.fecha_venta else "Desconocido"
            ventas_por_fecha[dia] += float(v.total or 0.0)
            
        detalle_grafica = [{"fecha": k, "total": v} for k, v in sorted(ventas_por_fecha.items())]
        
        return {
            "idReporte": self.idReporte,
            "fechaInicio": self.fechaInicio,
            "fechaFin": self.fechaFin,
            "tipoGrafica": self.tipoGrafica,
            "cantidadVentas": len(ventas),
            "totalVentas": total,
            "detalle": detalle_grafica
        }

    def calcularOcupacion(self, db) -> float:
        # Lógica para calcular ocupación basada en los boletos y funciones
        return 0.0

    def calcularRentabilidad(self) -> float:
        # Lógica para calcular rentabilidad
        return 0.0


# ============================================================================
# COTIZACION
# ============================================================================
class Cotizacion(Base):
    """
    CU-03: Almacena las cotizaciones de eventos corporativos.
    No reserva la sala hasta que se pague.
    """
    __tablename__ = "cotizaciones"
    id_cotizacion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_cliente = Column(String(100), nullable=False)
    id_sala = Column(Integer, ForeignKey("salas.id_sala"))
    fecha_hora_inicio = Column(DateTime, nullable=False)
    fecha_hora_fin = Column(DateTime, nullable=False)
    asistentes = Column(Integer, nullable=False)
    paquete_dulceria = Column(String(100))
    
    # Costos desglosados
    costo_sala = Column(Float, nullable=False)
    costo_dulceria = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    
    fecha_emision = Column(DateTime, default=datetime.datetime.now)
    fecha_vigencia = Column(DateTime, nullable=False)
    estado = Column(String(20), default="Pendiente") # Pendiente, Pagada, Vencida

    # Relación para poder acceder a los datos de la sala
    sala = relationship("Sala")

    # ── Diagrama 1 (Clases): +validar_vigencia() ──
    def validar_vigencia(self) -> bool:
        """
        Verifica si la cotización sigue vigente.
        Si ya expiró, transiciona el estado a 'Vencida' (Diagrama 6: vigencia_expirada).
        Retorna True si la cotización aún es válida.
        """
        if datetime.datetime.now() > self.fecha_vigencia:
            self.estado = "Vencida"
            return False
        return True

    # ── Diagrama 5 (Clases detallado): +crear_registro_db() : void ──
    def crear_registro_db(self, db) -> None:
        """Persiste la entidad de cotización en la base de datos."""
        db.add(self)
        db.commit()
        db.refresh(self)

    # ── Diagrama 6 (Máquina de Estados): Transiciones desde 'Pendiente' ──
    def pago_confirmado(self) -> None:
        """Transición: Pendiente → Pagada"""
        self.estado = "Pagada"

    def vigencia_expirada(self) -> None:
        """Transición: Pendiente → Vencida"""
        self.estado = "Vencida"