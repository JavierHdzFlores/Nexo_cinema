"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film, RotateCcw } from "lucide-react";
import { CarteleraFormData, SimulacionCartelera, CarteleraExitoData, Pelicula, Sala } from "./types";
import { CarteleraForm } from "./components/CarteleraForm";
import { CarteleraSimulacion } from "./components/CarteleraSimulacion";
import { CarteleraError } from "./components/CarteleraError";
import { CarteleraExito } from "./components/CarteleraExito";

export default function CarteleraPage() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  
  const [formData, setFormData] = useState<CarteleraFormData>({
    id_pelicula: 0,
    precio_boleto: 100,
    id_sala: 1,
    fecha: "",
    hora_inicio: "",
  });

  const [simulacion, setSimulacion] = useState<SimulacionCartelera | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<CarteleraExitoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [resPeliculas, resSalas] = await Promise.all([
          fetch("http://localhost:8000/api/cartelera/peliculas"),
          fetch("http://localhost:8000/api/cartelera/salas"),
        ]);
        if (resPeliculas.ok) setPeliculas(await resPeliculas.json());
        if (resSalas.ok) {
          const data: Sala[] = await resSalas.json();
          setSalas(data);
          // Inicializa id_sala con la primera sala disponible
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, id_sala: data[0].id_sala }));
          }
        }
      } catch (e) {
        console.error("Error fetching catalog", e);
      }
    };
    fetchCatalog();
  }, []);

  const resetForm = () => {
    if (window.confirm("¿Seguro que deseas descartar la programación actual? (Flujo S1)")) {
      setFormData({
        id_pelicula: 0,
        precio_boleto: 100.0,
        id_sala: 1,
        fecha: "",
        hora_inicio: "",
      });
      setSimulacion(null);
      setResultadoFinal(null);
      setError(null);
    }
  };

  const simularProyeccion = () => {
    setError(null);

    if (!formData.id_pelicula || !formData.fecha || !formData.hora_inicio) {
      setError("Por favor completa los campos obligatorios: Película, Fecha y Hora de inicio.");
      return;
    }

    const peliculaSel = peliculas.find(p => p.id_pelicula === formData.id_pelicula);
    if (!peliculaSel) return;

    // Calcular hora de fin aproximada (Front-end preview)
    const [h, m] = formData.hora_inicio.split(":").map(Number);
    const start = new Date(formData.fecha);
    start.setHours(h, m, 0);

    // Fin pelicula = start + duracion
    const finPelicula = new Date(start.getTime() + peliculaSel.duracion_minutos * 60000);
    // Fin limpieza = fin pelicula + 30 mins
    const finLimpieza = new Date(finPelicula.getTime() + 30 * 60000);

    const formatTime24 = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    setSimulacion({
      hora_fin_pelicula: formatTime24(finPelicula),
      hora_fin_limpieza: formatTime24(finLimpieza),
    });
  };

  const confirmarProyeccion = async () => {
    setLoading(true);
    setError(null);

    // ISO string for backend: YYYY-MM-DDTHH:MM:SS
    const fechaHoraInicio = `${formData.fecha}T${formData.hora_inicio}:00`;

    const payload = {
      id_sala: formData.id_sala,
      id_pelicula: formData.id_pelicula,
      fecha_hora_inicio: fechaHoraInicio,
      precio_boleto: formData.precio_boleto,
    };

    try {
      const response = await fetch("http://localhost:8000/api/cartelera/proyeccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Excepción E1: Empalme de horarios
        throw new Error(data.detail || "Error desconocido al programar la función.");
      }

      setResultadoFinal({
        id_proyeccion: data.id_proyeccion,
        horario_inicio: data.horario_inicio,
        horario_fin_con_limpieza: data.horario_fin_con_limpieza,
        mensaje: data.mensaje
      });

    } catch (err: any) {
      setError(err.message);
      setSimulacion(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-[#030213] text-zinc-100 font-sans selection:bg-amber-500/30 overflow-x-hidden relative py-12">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl w-full mx-auto px-6 relative z-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-[0_0_15px_rgba(249,168,37,0.1)]">
                <Film className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em]">Supervisión de Proyección</span>
            </div>
            <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-wider leading-none">
              CARTELERA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">INTELIGENTE</span>
            </h1>
            <p className="text-zinc-500 mt-2 text-sm max-w-md">
              Módulo de programación de funciones con prevención algorítmica de empalmes y gestión automática de limpieza.
            </p>
          </div>
          
          <button 
            onClick={resetForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar Formulario
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario de Cartelera */}
          <div className="lg:col-span-7">
            <CarteleraForm 
              formData={formData} 
              setFormData={setFormData} 
              peliculas={peliculas}
              salas={salas}
              onSimular={simularProyeccion}
              onCancel={resetForm}
            />
          </div>

          {/* Columna Derecha: Manejador de Estados (Simulación, Éxito, Errores E1) */}
          <aside className="lg:col-span-5 space-y-6 sticky top-24 self-start">
            <AnimatePresence mode="wait">
              
              {/* E1. Excepción: Empalme detectado por Backend */}
              {error && (
                <CarteleraError key="error" error={error} setFormData={setFormData} setError={setError} />
              )}

              {/* Éxito: Función programada */}
              {resultadoFinal && !error && (
                <CarteleraExito key="exito" resultado={resultadoFinal} />
              )}

              {/* Simulación: Vista previa antes de confirmar */}
              {simulacion && !resultadoFinal && !error && (
                <CarteleraSimulacion 
                  key="simulacion" 
                  simulacion={simulacion} 
                  formData={formData} 
                  peliculaSeleccionada={peliculas.find(p => p.id_pelicula === formData.id_pelicula)}
                  onGenerar={confirmarProyeccion} 
                  loading={loading} 
                />
              )}

              {/* Estado Inicial */}
              {!simulacion && !resultadoFinal && !error && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-[400px] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Film className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h3 className="font-bebas text-2xl text-zinc-500 tracking-wider mb-2">ESPERANDO DATOS DE FUNCIÓN</h3>
                  <p className="text-zinc-600 text-sm max-w-xs">
                    Completa la información de la película y horario en el panel izquierdo para previsualizar el bloque de proyección y limpieza.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
          
        </div>
      </div>
    </main>
  );
}