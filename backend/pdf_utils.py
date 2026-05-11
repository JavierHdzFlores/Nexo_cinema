import io
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generar_contrato_renta(evento):
    """Genera un PDF con el contrato y desglose de cobro para el evento privado."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Estilos básicos
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(colors.HexColor("#080b14"))
    c.drawString(50, height - 50, "NEXO CINEMA")

    c.setFont("Helvetica", 14)
    c.setFillColor(colors.HexColor("#f9a825"))
    c.drawString(50, height - 70, "CONTRATO DE RENTA DE SALA PRIVADA")

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 110, f"Folio del Evento: #{evento.id_evento}")
    c.drawString(50, height - 130, f"Organizador: {evento.organizador}")
    c.drawString(50, height - 150, f"Evento: {evento.nombre}")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 180, f"Sala Asignada: Sala {evento.id_sala}")
    c.drawString(50, height - 200, f"Fecha de Inicio: {evento.fecha_hora_inicio.strftime('%Y-%m-%d %H:%M')}")
    c.drawString(50, height - 220, f"Fecha de Fin: {evento.fecha_hora_fin.strftime('%Y-%m-%d %H:%M')}")

    # Separador
    c.setStrokeColor(colors.HexColor("#f9a825"))
    c.line(50, height - 240, width - 50, height - 240)

    # Desglose de servicios
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 270, "Desglose de Servicios y Costos:")
    
    c.setFont("Helvetica", 12)
    y_pos = height - 300
    
    # Costo base
    diferencia_horas = (evento.fecha_hora_fin - evento.fecha_hora_inicio).total_seconds() / 3600
    costo_servicios = 0
    if evento.req_microfonos: costo_servicios += 500
    if evento.req_catering: costo_servicios += 3500
    if evento.req_iluminacion: costo_servicios += 1200
    
    costo_base = evento.costo_renta - costo_servicios

    c.drawString(70, y_pos, f"- Renta de Sala ({round(diferencia_horas, 2)} horas):")
    c.drawRightString(width - 70, y_pos, f"${costo_base:,.2f}")
    y_pos -= 20

    if evento.req_microfonos:
        c.drawString(70, y_pos, "- Uso de Micrófonos:")
        c.drawRightString(width - 70, y_pos, "$500.00")
        y_pos -= 20
    if evento.req_catering:
        c.drawString(70, y_pos, "- Servicio de Catering:")
        c.drawRightString(width - 70, y_pos, "$3,500.00")
        y_pos -= 20
    if evento.req_iluminacion:
        c.drawString(70, y_pos, "- Iluminación Especial:")
        c.drawRightString(width - 70, y_pos, "$1,200.00")
        y_pos -= 20

    # Separador
    c.line(50, y_pos - 10, width - 50, y_pos - 10)
    y_pos -= 40

    # Total
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y_pos, "GRAN TOTAL:")
    c.setFillColor(colors.HexColor("#f9a825"))
    c.drawRightString(width - 70, y_pos, f"${evento.costo_renta:,.2f}")

    # Disclaimer
    c.setFillColor(colors.gray)
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, 50, "Este documento ampara la reserva exclusiva de la sala. Facturación por concepto de 'Renta de Sala'.")

    c.save()
    buffer.seek(0)
    return buffer
