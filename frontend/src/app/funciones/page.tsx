'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, ChevronRight, ChevronLeft } from 'lucide-react';
// IMPORTANTE: Asegúrate de tener Pelicula y Sala exportados en tu archivo types.ts
import { FuncionFormData, FuncionResponse, Pelicula, Sala } from './types';

import { SeleccionarPelicula } from './components/SeleccionarPelicula';
import { SeleccionarSala } from './components/SeleccionarSala';
import { DefinirFecha } from './components/DefinirFecha';
import { ResumenFuncion } from './components/ResumenFuncion';
import { FuncionExito } from './components/FuncionExito';

export default function FuncionesPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<FuncionResponse | null>(null);

  // Estados para guardar los datos reales de la base de datos
  const [dbPeliculas, setDbPeliculas] = useState<Pelicula[]>([]);
  const [dbSalas, setDbSalas] = useState<Sala[]>([]);

  const [formData, setFormData] = useState<FuncionFormData>({
    id_pelicula: 0,
    id_sala: 0,
    fecha: '',
    hora_inicio: '',
    duracion_limpieza: 30,
  });

  // Descargar catálogos al iniciar la página
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [resPeliculas, resSalas] = await Promise.all([
          fetch('http://localhost:8000/api/cartelera/peliculas'),
          fetch('http://localhost:8000/api/cartelera/salas')
        ]);
        
        if (resPeliculas.ok) {
          const dataPeliculas = await resPeliculas.json();
          setDbPeliculas(dataPeliculas);
        }
        
        if (resSalas.ok) {
          const dataSalas = await resSalas.json();
          setDbSalas(dataSalas);
        }
      } catch (err) {
        console.error('Error cargando los catálogos:', err);
      }
    };

    fetchCatalogos();
  }, []);

  // Buscar los objetos seleccionados EN LOS DATOS DE LA DB
  const pelicula = dbPeliculas.find((p) => p.id_pelicula === formData.id_pelicula);
  const sala = dbSalas.find((s) => s.id_sala === formData.id_sala);

  const validateStep = (currentStep: number): boolean => {
    setError(null);

    if (currentStep === 1 && formData.id_pelicula === 0) {
      setError('Por favor, selecciona una película para continuar.');
      return false;
    } 
    if (currentStep === 2 && formData.id_sala === 0) {
      setError('Debes seleccionar una sala disponible para continuar.');
      return false;
    } 
    if (currentStep === 3 && (!formData.fecha || !formData.hora_inicio)) {
      setError('Por favor, completa la fecha y hora de inicio.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError(null);

    try {
      if (!pelicula) {
        setError('Película no válida o no encontrada.');
        return;
      }

      const payload = {
        id_pelicula: formData.id_pelicula,
        id_sala: formData.id_sala,
        fecha_hora_inicio: `${formData.fecha}T${formData.hora_inicio}:00`,
        precio_boleto: 150, // Valor por defecto
      };

      const response = await fetch('http://localhost:8000/api/cartelera/proyeccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al guardar la función');
        return;
      }

      const data = await response.json();

      const resultadoFinal: FuncionResponse = {
        id_evento: data.id_proyeccion,
        id_pelicula: formData.id_pelicula,
        id_sala: formData.id_sala,
        titulo_pelicula: pelicula.titulo,
        nombre_sala: sala?.nombre || `Sala ${formData.id_sala}`,
        fecha_hora_inicio: data.horario_inicio,
        fecha_hora_fin: data.horario_fin_con_limpieza,
        duracion_limpieza: formData.duracion_limpieza,
        estado: 'Programada',
        mensaje: data.mensaje || 'Función programada correctamente.',
      };

      setResultado(resultadoFinal);
      setStep(4);
    } catch (err) {
      setError('Error de conexión. Verifica que el servidor esté en línea.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Película', 'Sala', 'Fecha y Hora', 'Confirmar'];

  return (
    <main className="min-h-screen bg-[#030213] text-white pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Premium */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#f9a825]/10 to-transparent border border-[#f9a825]/20 text-[#f9a825] text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Film size={16} />
            Programación de Funciones
          </motion.div>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '2px' }}
          >
            Programa una <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4e50] to-[#f9a825]">Nueva Función</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Selecciona película, sala, fecha y hora. El sistema calcula automáticamente el horario completo incluida la limpieza.
          </p>
        </div>

        {/* Stepper Premium */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-12 relative max-w-3xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#ff4e50] to-[#f9a825] -z-10 -translate-y-1/2 transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[1, 2, 3].map((s, index) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                    step === s
                      ? 'bg-gradient-to-br from-[#ff4e50] to-[#f9a825] text-black shadow-[0_0_20px_rgba(249,168,37,0.4)] scale-110'
                      : step > s
                      ? "bg-[#f9a825]/20 text-[#f9a825] border border-[#f9a825]/50"
                      : 'bg-black/60 border border-white/10 text-gray-500 backdrop-blur-md'
                  }`}
                >
                  {s}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest font-bold hidden md:block absolute -bottom-6 whitespace-nowrap transition-colors ${
                    step >= s ? 'text-[#f9a825]' : 'text-gray-600'
                  }`}
                >
                  {stepTitles[index]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Contenido Principal con Animaciones */}
        <div className="relative min-h-[500px] mb-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SeleccionarPelicula formData={formData} setFormData={setFormData} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SeleccionarSala formData={formData} setFormData={setFormData} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <DefinirFecha formData={formData} setFormData={setFormData} />
                <div className="border-t border-white/10 pt-8">
                  <ResumenFuncion formData={formData} pelicula={pelicula} sala={sala} />
                </div>
              </motion.div>
            )}

            {step === 4 && resultado && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <FuncionExito resultado={resultado} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Errores */}
        <AnimatePresence>
          {error && step < 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones de Navegación */}
        {step < 4 && (
          <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-4">
            <button
              disabled={step === 1 || loading}
              onClick={() => {
                setError(null);
                setStep(step - 1);
              }}
              className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-0 transition-all flex items-center gap-2 group"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Atrás
            </button>

            <button
              disabled={loading}
              onClick={step === 3 ? handleSubmit : handleNext}
              className="group px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-[#ff4e50] to-[#f9a825] text-black shadow-lg hover:shadow-[0_0_20px_rgba(249,168,37,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              {loading
                ? 'Procesando...'
                : step === 3
                ? 'Confirmar y Guardar'
                : 'Siguiente Paso'}
              {step < 3 && !loading && (
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}