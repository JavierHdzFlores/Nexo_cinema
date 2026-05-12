"use client";

import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";

// Coincide exactamente con el return de tu def listar_funciones
export interface FuncionTaquilla {
  id: number;
  pelicula: string;
  clasificacion: string;
  duracion_minutos: number | null;
  fecha_hora_inicio: string;
  precio_boleto: number;
  id_sala: number;
  sala_nombre: string;
  sala_tipo: string | null;
  sala_capacidad: number | null;
  imagen_url: string;
}

export function MovieGrid() {
  const [funciones, setFunciones] = useState<FuncionTaquilla[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerFunciones = async () => {
      try {
        // Hacemos la petición a tu endpoint de Taquilla
        const respuesta = await fetch("http://localhost:8000/api/taquilla/funciones", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Si esta ruta requiere que el taquillero esté logueado, 
            // descomenta la siguiente línea y asegúrate de tener el token.
            // "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las funciones de la cartelera.");
        }

        const datos = await respuesta.json();
        setFunciones(datos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerFunciones();
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-[#f9a825] text-xl font-medium animate-pulse">
          Cargando cartelera de hoy... 🎬
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl text-center">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (funciones.length === 0) {
    return (
      <div className="text-center py-20 text-white/40">
        <p>No hay funciones programadas para hoy.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {funciones.map((funcion) => (
        <MovieCard key={`${funcion.id}-${funcion.fecha_hora_inicio}`} funcion={funcion} />
      ))}
    </div>
  );
}