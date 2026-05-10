"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, RotateCcw, FileText } from "lucide-react";

import { CotizacionFormData, CotizacionResponse, SimulacionData } from "./types";
import { CotizacionForm } from "./components/CotizacionForm";
import { CotizacionSimulacion } from "./components/CotizacionSimulacion";
import { CotizacionExito } from "./components/CotizacionExito";
import { CotizacionError } from "./components/CotizacionError";

export default function CorporativosPage() {
  const [formData, setFormData] = useState<CotizacionFormData>({
    nombre_cliente: "",
    id_sala: 1,
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    asistentes: 0,
    paquete_dulceria: "Ninguno",
    costo_base_hora: 1500,
  });

  const [simulacion, setSimulacion] = useState<SimulacionData | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<CotizacionResponse | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // CU-03: Paso 4 - Validar datos de cliente e ingresos
  const simularCotizacion = () => {
    setError(null);
    setResultadoFinal(null);

    // 1. Validaciones Básicas de Captura
    if (!formData.nombre_cliente.trim()) {
      setError("Por favor ingresa el nombre de la empresa o cliente corporativo.");
      return;
    }
    if (!formData.fecha || !formData.hora_inicio || !formData.hora_fin) {
      setError("Las fechas y horarios son obligatorios para generar una cotización.");
      return;
    }

    // 2. Validaciones Temporales y de Negocio
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizamos a media noche
    
    // Parseo cuidadoso asegurando la zona horaria local
    const [year, month, day] = formData.fecha.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    
    if (selectedDate < today) {
      setError("No se pueden agendar eventos corporativos en fechas pasadas.");
      return;
    }

    const start = new Date(`${formData.fecha}T${formData.hora_inicio}:00`);
    const end = new Date(`${formData.fecha}T${formData.hora_fin}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("El formato de fecha u hora es inválido.");
      return;
    }

    if (end <= start) {
      setError("Conflicto de agenda: La hora de fin debe ser estrictamente posterior a la de inicio.");
      return;
    }

    // 3. Validación de Horario Operativo (Regla de negocio: Cine opera de 10:00 a 23:59)
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    if (startHour < 10 || endHour > 23.98) {
      setError("El horario solicitado está fuera de servicio. Las salas solo se rentan entre las 10:00 y las 23:59 hrs.");
      return;
    }

    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // 4. Validación de Duración (Mínimo 1 hora, máximo 14h continuas)
    if (diffHours < 1) {
      setError("La renta de la sala debe ser por un mínimo de 1.0 hora.");
      return;
    }

    if (diffHours > 14) {
      setError("Para eventos mayores a 14 horas continuas, comuníquese directamente con la gerencia comercial.");
      return;
    }

    // CU-03: Paso 7 - Cálculos masivos (Con encapsulamiento lógico de precios base)
    const costo_sala = diffHours * formData.costo_base_hora;

    let precioPP = 0;
    switch (formData.paquete_dulceria) {
      case "Basico": precioPP = 150; break;
      case "Premium": precioPP = 250; break;
      case "VIP": precioPP = 400; break;
      default: precioPP = 0;
    }

    const costo_dulceria = precioPP * formData.asistentes;
    const total = costo_sala + costo_dulceria;

    const horasFormateadas = Number.isInteger(diffHours) 
      ? `${diffHours} hora${diffHours === 1 ? '' : 's'}`
      : `${diffHours.toFixed(1)} horas`;

    setSimulacion({
      costo_sala,
      costo_dulceria,
      total,
      horas: horasFormateadas,
    });
  };

  // CU-03: Paso 8 y 9 - Generar cotización final y almacenar en el sistema
  const generarCotizacionFinal = async () => {
    setError(null);
    setLoading(true);
    
    const start = new Date(`${formData.fecha}T${formData.hora_inicio}:00`);
    const end = new Date(`${formData.fecha}T${formData.hora_fin}:00`);

    const payload = {
      nombre_cliente: formData.nombre_cliente.trim(),
      id_sala: formData.id_sala,
      fecha_hora_inicio: start.toISOString(),
      fecha_hora_fin: end.toISOString(),
      asistentes: formData.asistentes,
      paquete_dulceria: formData.paquete_dulceria,
      costo_base_hora: formData.costo_base_hora,
    };

    try {
      const res = await fetch("http://localhost:8000/api/taquilla/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Excepción E1: La sala no se encuentra disponible (Manejo de errores del backend)
        if (data.detail && data.detail.mensaje) {
          setError(data.detail);
        } else {
          setError(data.detail || "Ocurrió un error inesperado al procesar la cotización.");
        }
        setSimulacion(null);
      } else {
        setResultadoFinal(data);
      }
    } catch (err) {
      setError("Error de red: No se pudo establecer conexión con el servidor maestro de Nexo Cinema.");
      setSimulacion(null);
    } finally {
      setLoading(false);
    }
  };

  // Flujo alternativo S1: Cancelar operación
  const resetForm = () => {
    // S1.1 y S1.2: Confirmación y reinicio
    if (confirm("¿Estás seguro de que deseas cancelar la operación? Se perderán los datos actuales.")) {
      setFormData({
        nombre_cliente: "",
        id_sala: 1,
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        asistentes: 0,
        paquete_dulceria: "Ninguno",
        costo_base_hora: 1500.0,
      });
      setSimulacion(null);
      setResultadoFinal(null);
      setError(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center bg-[#030213] text-zinc-100 font-sans selection:bg-amber-500/30 overflow-x-hidden relative py-12">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl w-full mx-auto px-6 relative z-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-[0_0_15px_rgba(249,168,37,0.1)]">
                <Building2 className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em]">Coordinación de Eventos</span>
            </div>
            <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-wider leading-none">
              NEXO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">CORPORATIVO</span>
            </h1>
            <p className="text-zinc-500 mt-2 text-sm max-w-md">
              Generador de presupuestos para renta de infraestructura y servicios integrales de catering masivo.
            </p>
          </div>
          
          <button 
            onClick={resetForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nueva Cotización
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario Modular */}
          <div className="lg:col-span-7">
            <CotizacionForm 
              formData={formData} 
              setFormData={setFormData} 
              onSimular={simularCotizacion}
              onCancel={resetForm}
            />
          </div>

          {/* Columna Derecha: Manejador de Estados (Simulación, Éxito, Errores) */}
          <aside className="lg:col-span-5 space-y-6 sticky top-24 self-start">
            <AnimatePresence mode="wait">
              
              {/* E1. Excepción: Sala no disponible / Error de Validación */}
              {error && (
                <CotizacionError key="error" error={error} setFormData={setFormData} setError={setError} />
              )}

              {/* Éxito: Cotización guardada en sistema */}
              {resultadoFinal && !error && (
                <CotizacionExito key="exito" resultado={resultadoFinal} />
              )}

              {/* Simulación: Vista previa antes de confirmar */}
              {simulacion && !resultadoFinal && !error && (
                <CotizacionSimulacion key="simulacion" simulacion={simulacion} formData={formData} onGenerar={generarCotizacionFinal} loading={loading} />
              )}

              {/* Estado Inicial: Esperando datos */}
              {!simulacion && !resultadoFinal && !error && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] bg-white/[0.01] border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-zinc-700" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 tracking-tight">Panel de Presupuesto</h3>
                  <p className="text-zinc-500 text-sm max-w-[240px] leading-relaxed">
                    Complete la configuración del evento a la izquierda para generar una estimación de costos en tiempo real.
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
