from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
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

    __mapper_args__ = {"polymorphic_identity": "gerente"}
    
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


class Evento(Base):
    __tablename__ = "eventos"
    id_evento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sala = Column(Integer, ForeignKey("salas.id_sala"))
    nombre = Column(String(150), nullable=False)
    fecha_hora_inicio = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
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

class ProyeccionPublica(Evento):
    __tablename__ = "proyecciones_publicas"
    id_proyeccion = Column(Integer, ForeignKey("eventos.id_evento"), primary_key=True)
    pelicula = Column(String(100), nullable=False)
    clasificacion = Column(String(10))
    precio_boleto = Column(Float, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "proyeccion_publica"}

class EventoPrivado(Evento):
    __tablename__ = "eventos_privados"
    id_evento_privado = Column(Integer, ForeignKey("eventos.id_evento"), primary_key=True)
    organizador = Column(String(100))
    motivo = Column(String(200))
    costo_renta = Column(Float, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "evento_privado"}


class Venta(Base):
    __tablename__ = "ventas"
    id_venta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=True)
    id_evento = Column(Integer, ForeignKey("eventos.id_evento"), nullable=True)
    fecha_venta = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    total = Column(Float, nullable=False)
    
    # Relaciones actualizadas a back_populates
    cliente = relationship("Cliente", back_populates="ventas")
    evento = relationship("Evento", back_populates="ventas")
    factura_individual = relationship("FacturaIndividual", uselist=False, back_populates="venta")   
    
    def obtenerDatosVenta(self) -> dict:
        return {
            "id_venta": self.id_venta,
            "id_cliente": self.id_cliente,
            "id_evento": self.id_evento,
            "fecha_venta": self.fecha_venta,
            "total": self.total,
            "cliente": {
                "nombre": self.cliente.nombre if self.cliente else None,
                "correo": self.cliente.correo if self.cliente else None,
                "rfc": self.cliente.rfc if self.cliente else None
            } if self.cliente else None,
            "evento": {
                "nombre": self.evento.nombre if self.evento else None,
                "tipo": self.evento.tipo_evento if self.evento else None,
                "fecha": self.evento.fecha_hora_inicio if self.evento else None
            } if self.evento else None
        }

# ============================================================================
# MÓDULO DE FACTURACIÓN
# ============================================================================

class Factura(Base):
    __tablename__ = "facturas"
    id_factura = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_gerente = Column(Integer, ForeignKey("gerentes.id_gerente"), nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
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
    fecha_generacion = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    
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
        self.fecha_generacion = datetime.datetime.utcnow()
        return self.archivo


class ProductoDulceria(Base):
    __tablename__ = "productos_dulceria"
    id_producto = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    precio = Column(Float, nullable=False)
    stock_actual = Column(Integer, nullable=False)
    stock_minimo = Column(Integer, default=10)