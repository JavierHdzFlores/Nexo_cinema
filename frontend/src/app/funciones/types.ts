export interface Pelicula {
  id_pelicula: number;
  titulo: string;
  director: string;
  duracion_minutos: number;
  clasificacion: string;
  genero: string;
}

export interface Sala {
  id_sala: number;
  nombre: string;
  capacidad: number;
  tipo: string;
  estado: string;
}

export interface FuncionFormData {
  id_pelicula: number;
  id_sala: number;
  fecha: string;
  hora_inicio: string;
  hora_fin?: string;
  duracion_limpieza: number; // En minutos, siempre 30
}

export interface FuncionResponse {
  id_evento: number;
  id_pelicula: number;
  id_sala: number;
  titulo_pelicula: string;
  nombre_sala: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  duracion_limpieza: number;
  estado: string;
  mensaje: string;
}
