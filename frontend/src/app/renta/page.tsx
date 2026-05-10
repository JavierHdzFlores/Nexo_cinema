"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { RentaFormData, RentaResponse } from "./types";

import { DefinirHorario } from "./components/DefinirHorario";
import { SeleccionarSala } from "./components/SeleccionarSala";
import { ServiciosAdicionales } from "./components/ServiciosAdicionales";
import { ResumenRenta } from "./components/ResumenRenta";
import { RentaExito } from "./components/RentaExito";

export default function RentaPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RentaResponse | null>(null);

  const [formData, setFormData] = useState<RentaFormData>({
    nombre_evento: "",
    organizador: "",
    motivo: "",
    id_sala: 0,
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    costo_base_hora: 2000,
    req_microfonos: false,
    req_catering: false,
    req_iluminacion: false,
  });

  const calculateTotal = () => {
    if (!formData.hora_inicio || !formData.hora_fin) return 0;
    const start = new Date(`2000-01-01T${formData.hora_inicio}`);
    const end = new Date(`2000-01-01T${formData.hora_fin}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 0) return 0;

    let total = diffHours * formData.costo_base_hora;
    if (formData.req_microfonos) total += 500;
    if (formData.req_catering) total += 3500;
    if (formData.req_iluminacion) total += 1200;
    return total;
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.fecha || !formData.hora_inicio || !formData.hora_fin) {
        setError("Por favor, selecciona la fecha y el horario del evento.");
        return false;
      }
      const start = new Date(`2000-01-01T${formData.hora_inicio}`);
      const end = new Date(`2000-01-01T${formData.hora_fin}`);
      if (end <= start) {
        setError("La hora de fin debe ser estrictamente posterior a la de inicio.");
        return false;
      }
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours < 1) {
        setError("La renta mínima es de 1 hora.");
        return false;
      }
      if (!formData.organizador.trim() || !formData.nombre_evento.trim()) {
        setError("Por favor, ingresa los detalles del organizador y del evento.");
        return false;
      }
    } else if (currentStep === 2) {
      if (formData.id_sala === 0) {
        setError("Debes seleccionar una sala disponible para continuar.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        fecha_hora_inicio: `${formData.fecha}T${formData.hora_inicio}:00`,
        fecha_hora_fin: `${formData.fecha}T${formData.hora_fin}:00`,
      };

      const response = await fetch("http://localhost:8000/api/cartelera/renta-sala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);
        setStep(4);
      } else {
        const err = await response.json();
        setError(err.detail || "Error al procesar la renta.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ["Horario y Detalles", "Selección de Sala", "Servicios y Pago", "Confirmación"];

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
            <ShieldCheck size={16} />
            Gestión de Eventos Privados
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}>
            Reserva de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4e50] to-[#f9a825]">Salas Nexo</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Bloquea espacios completos para tus eventos con validación en tiempo real y facturación automatizada.
          </p>
        </div>

        {/* Stepper Premium */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#ff4e50] to-[#f9a825] -z-10 -translate-y-1/2 transition-all duration-500 ease-out" 
              style={{ width: `${((step - 1) / 2) * 100}%` }} 
            />
            
            {[1, 2, 3].map((s, index) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                    step === s 
                      ? "bg-gradient-to-br from-[#ff4e50] to-[#f9a825] text-black shadow-[0_0_20px_rgba(249,168,37,0.4)] scale-110" 
                      : step > s
                      ? "bg-[#f9a825]/20 text-[#f9a825] border border-[#f9a825]/50"
                      : "bg-black/60 border border-white/10 text-gray-500 backdrop-blur-md"
                  }`}
                >
                  {s}
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-bold hidden md:block absolute -bottom-6 whitespace-nowrap transition-colors ${
                  step >= s ? "text-[#f9a825]" : "text-gray-600"
                }`}>
                  {stepTitles[index]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Contenido Principal con Animaciones */}
        <div className="relative min-h-[400px] mb-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DefinirHorario formData={formData} setFormData={setFormData} />
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
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2">
                  <ServiciosAdicionales formData={formData} setFormData={setFormData} />
                </div>
                <div className="lg:col-span-1">
                  {/* Para el resumen, necesitaríamos buscar el objeto sala completo si quisiéramos mostrarlo, 
                      pero como SeleccionarSala ya lo maneja por ID, enviaremos un placeholder o crearemos un 
                      estado global para selectedSala si fuera necesario. Aquí usaremos un mock simple para la vista 
                      ya que ID ya está guardado. */}
                  <ResumenRenta 
                    formData={formData} 
                    calculateTotal={calculateTotal} 
                    selectedSala={{ id_sala: formData.id_sala, nombre: `Sala ${formData.id_sala}`, tipo: "Exclusiva", capacidad: 0, estado: "" }}
                  />
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
                <RentaExito resultado={resultado} />
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
              onClick={() => { setError(null); setStep(step - 1); }}
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
              {loading ? "Procesando..." : step === 3 ? "Confirmar Reserva" : "Siguiente Paso"}
              {step < 3 && !loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
