'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Search, CheckCircle2 } from 'lucide-react';
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
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setPeliculas(data);
      } catch (error) {
        console.error('Error cargando películas:', error);
        // Fallback para pruebas
        setPeliculas([{
          id_pelicula: 1,
          titulo: 'Avatar: El Sentido del Agua',
          director: 'James Cameron',
          duracion_minutos: 192,
          clasificacion: 'PG-13',
          genero: 'Ciencia Ficción',
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchPeliculas();
  }, []);

  // Función de selección robusta
  const handleSelect = (id: number) => {
    // Aseguramos que guardamos el ID y limpiamos posibles errores
    setFormData({ 
      ...formData, 
      id_pelicula: id 
    });
  };

  const filteredPeliculas = peliculas.filter(p =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.director.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Buscamos la película seleccionada basándonos en el ID del formData
  const selectedPelicula = peliculas.find(p => p.id_pelicula === formData.id_pelicula);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Film size={28} className="text-[#ff4e50]" />
          Selecciona una Película
        </h2>
        <p className="text-gray-400 text-sm">
          CU-01: Programación de Función. Elige el título para calcular el bloque horario.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Buscar película..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-[#f9a825] transition-all"
        />
      </div>

      {/* Vista Previa de Selección */}
      <AnimatePresence mode="wait">
        {selectedPelicula && (
          <motion.div
            key={selectedPelicula.id_pelicula}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-gradient-to-r from-[#ff4e50]/20 to-[#f9a825]/20 border border-[#ff4e50]/50"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#f9a825] font-bold mb-1">Película Seleccionada</p>
                <p className="text-xl font-bold text-white">{selectedPelicula.titulo}</p>
              </div>
              <CheckCircle2 className="text-[#f9a825]" size={24} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grilla */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <p className="text-gray-500">Cargando catálogo...</p>
        ) : (
          filteredPeliculas.map((pelicula) => {
            const isSelected = formData.id_pelicula === pelicula.id_pelicula;
            return (
              <button
                key={pelicula.id_pelicula}
                type="button" // Evita que se comporte como submit
                onClick={() => handleSelect(pelicula.id_pelicula)}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  isSelected
                    ? 'border-[#f9a825] bg-[#f9a825]/10 shadow-[0_0_15px_rgba(249,168,37,0.2)]'
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className={`font-bold ${isSelected ? 'text-[#f9a825]' : 'text-white'}`}>
                  {pelicula.titulo}
                </p>
                <p className="text-xs text-gray-500 mt-1">{pelicula.duracion_minutos} min • {pelicula.clasificacion}</p>
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}