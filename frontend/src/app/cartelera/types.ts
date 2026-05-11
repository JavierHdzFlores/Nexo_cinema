export interface Pelicula {
  id_pelicula: number;
  titulo: string;
  sinopsis: string;
  clasificacion: string;
  duracion_minutos: number;
  imagen_url: string;
}

export interface Sala {
  id_sala: number;
  nombre: string;
  capacidad: number;
  tipo: string;
  estado: string;
}

export interface CarteleraFormData {
  id_pelicula: number;
  precio_boleto: number;
  id_sala: number;
  fecha: string;
  hora_inicio: string;
}

export interface SimulacionCartelera {
  hora_fin_pelicula: string;
  hora_fin_limpieza: string;
}

export interface CarteleraExitoData {
  id_proyeccion: number;
  horario_inicio: string;
  horario_fin_con_limpieza: string;
  mensaje: string;
}
