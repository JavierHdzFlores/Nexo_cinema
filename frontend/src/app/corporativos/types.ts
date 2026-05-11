export interface CotizacionFormData {
  nombre_cliente: string;
  id_sala: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  asistentes: number;
  paquete_dulceria: string;
  costo_base_hora: number;
}

export interface CotizacionResponse {
  mensaje: string;
  id_cotizacion: number;
  valida_hasta: string;
  desglose: {
    costo_sala: number;
    costo_dulceria: number;
    gran_total: number;
  };
}

export interface SimulacionData {
  costo_sala: number;
  costo_dulceria: number;
  total: number;
  horas: string;
}
