export interface RentaFormData {
  nombre_evento: string;
  organizador: string;
  motivo: string;
  id_sala: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  costo_base_hora: number;
  req_microfonos: boolean;
  req_catering: boolean;
  req_iluminacion: boolean;
}

export interface RentaResponse {
  mensaje: string;
  id_evento: number;
  desglose_cobro: {
    horas_rentadas: number;
    costo_servicios_adicionales: number;
    gran_total: number;
  };
}

export interface Sala {
  id_sala: number;
  nombre: string;
  tipo: string;
  capacidad: number;
  estado: string;
}
