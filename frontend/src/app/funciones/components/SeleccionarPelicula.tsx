'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Film, Search } from 'lucide-react';
import { FuncionFormData, Pelicula } from '../types';

interface SeleccionarPeliculaProps {
  formData: FuncionFormData;
  setFormData: (data: FuncionFormData) => void;
}

export function SeleccionarPelicula({ formData, setFormData }: SeleccionarPeliculaProps) {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPeliculas = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/cartelera/peliculas');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setPeliculas(data);
      } catch (error) {
        console.error('Error cargando películas:', error);
        // Fallback a datos mock en caso de error
        setPeliculas([
          {
            id_pelicula: 1,
            titulo: 'Avatar: El Sentido del Agua',
            director: 'James Cameron',
            duracion_minutos: 192,
            clasificacion: 'PG-13',
            genero: 'Ciencia Ficción',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPeliculas();
  }, []);

  const filteredPeliculas = peliculas.filter(p =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.genero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPelicula = peliculas.find(p => p.id_pelicula === formData.id_pelicula);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Film size={28} className="text-[#ff4e50]" />
          Selecciona una Película
        </h2>
        <p className="text-gray-400 text-sm">
          Elige la película que deseas programar. El sistema usará la duración para calcular horarios.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Buscar por título, director o género..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#f9a825] focus:ring-1 focus:ring-[#f9a825]/20 transition-all"
        />
      </div>

      {/* Película Seleccionada */}
      {selectedPelicula && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-[#ff4e50]/10 to-[#f9a825]/10 border border-[#ff4e50]/30"
        >
          <p className="text-xs uppercase tracking-widest text-[#f9a825] font-bold mb-2">✓ Seleccionada</p>
          <p className="text-lg font-bold text-white mb-1">{selectedPelicula.titulo}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <p>📽️ Director: {selectedPelicula.director}</p>
            <p>⏱️ Duración: {selectedPelicula.duracion_minutos} min</p>
            <p>🎭 Género: {selectedPelicula.genero}</p>
            <p>🏷️ Clasificación: {selectedPelicula.clasificacion}</p>
          </div>
        </motion.div>
      )}

      {/* Grilla de Películas */}
      <div>
        <h3 className="text-sm uppercase tracking-widest font-bold text-white/60 mb-4">
          {filteredPeliculas.length} Películas Disponibles
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-4">
            {filteredPeliculas.map((pelicula) => (
              <motion.button
                key={pelicula.id_pelicula}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({ ...formData, id_pelicula: pelicula.id_pelicula })}
                className={`p-4 rounded-xl text-left transition-all ${
                  formData.id_pelicula === pelicula.id_pelicula
                    ? 'bg-gradient-to-br from-[#ff4e50] to-[#f9a825] text-black border border-transparent'
                    : 'bg-black/30 border border-white/10 text-white hover:border-[#f9a825]/50'
                }`}
              >
                <p className="font-bold text-sm mb-1">{pelicula.titulo}</p>
                <p className="text-xs opacity-75 mb-2">{pelicula.director}</p>
                <div className="flex justify-between items-center text-xs">
                  <span>{pelicula.duracion_minutos} min</span>
                  <span className="px-2 py-1 rounded bg-black/40">{pelicula.clasificacion}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {filteredPeliculas.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <p>No se encontraron películas con ese término de búsqueda.</p>
        </div>
      )}
    </motion.div>
  );
}
