/**
 * types.ts
 * Interfaces TypeScript que mapean exactamente los esquemas Pydantic del backend:
 *   ArticuloDulceriaResponse, DetalleVentaRequest, VentaDulceriaRequest, VentaDulceriaResponse
 * Y el tipo EstadoVenta derivado del Diagrama de Estados UML (Diagrama 6 CU-05).
 */

// ── Backend schemas ────────────────────────────────────────────────────────

export interface ArticuloDulceriaResponse {
  id_articulo: number;
  nombre: string;
  precio: number;
  tipo_articulo: string; // 'combo' | 'producto_individual'
}

export interface DetalleVentaRequest {
  id_articulo: number;
  cantidad: number;
}

export interface VentaDulceriaRequest {
  id_cliente?: number;
  detalles: DetalleVentaRequest[];
  usar_puntos: boolean;
  puntos_a_usar?: number;
}

/** Comprobante de puntos — Ticket.generarDetalle() del CU-06 */
export interface MovimientoMonederoResponse {
  tipo_movimiento: 'Acumulacion' | 'Canje' | 'Sin movimiento';
  saldo_anterior: number;
  puntos_movimiento: number;   // positivo = acumulación, negativo = canje
  saldo_nuevo: number;
}

export interface VentaDulceriaResponse {
  id_venta: number;
  total: number;
  estado: string;
  mensaje: string;
  monedero?: MovimientoMonederoResponse;  // Opcional: solo si hubo cliente identificado
}

export interface MonederoSaldoResponse {
  id_cliente: number;
  saldoPuntos: number;
}

// ── Estado de la Venta (Máquina de Estados — Diagrama 6 CU-05) ────────────

export type EstadoVenta =
  | 'Iniciada'
  | 'EnCarga'
  | 'ValidandoStock'
  | 'PendienteDePago'
  | 'Pagada'
  | 'Finalizada'
  | 'Cancelada';

// ── Tipos de UI ────────────────────────────────────────────────────────────

/** Item en el carrito de venta activo (DetalleVenta en memoria) */
export interface CartItem extends ArticuloDulceriaResponse {
  cantidad: number;
  subtotal: number;
}
