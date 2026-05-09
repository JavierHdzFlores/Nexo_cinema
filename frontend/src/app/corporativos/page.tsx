"use client";

import React, { useState, useEffect } from "react";

interface CotizacionFormData {
  nombre_cliente: string;
  id_sala: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  asistentes: number;
  paquete_dulceria: string;
  costo_base_hora: number;
}

interface CotizacionResponse {
  mensaje: string;
  id_cotizacion: number;
  valida_hasta: string;
  desglose: {
    costo_sala: number;
    costo_dulceria: number;
    gran_total: number;
  };
}

export default function CorporativosPage() {
  const [formData, setFormData] = useState<CotizacionFormData>({
    nombre_cliente: "",
    id_sala: 1,
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    asistentes: 0,
    paquete_dulceria: "Ninguno",
    costo_base_hora: 1500.0, // Default cost per hour
  });

  const [simulacion, setSimulacion] = useState<any>(null);
  const [resultadoFinal, setResultadoFinal] = useState<CotizacionResponse | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["id_sala", "asistentes", "costo_base_hora"].includes(name) ? Number(value) : value,
    }));
  };

  // Simulación en el frontend antes de guardar en la BD
  const simularCotizacion = () => {
    setError(null);
    if (!formData.fecha || !formData.hora_inicio || !formData.hora_fin) {
      setError("Por favor completa las fechas y horarios.");
      return;
    }

    const start = new Date(`${formData.fecha}T${formData.hora_inicio}:00`);
    const end = new Date(`${formData.fecha}T${formData.hora_fin}:00`);

    if (end <= start) {
      setError("La hora de fin debe ser posterior a la de inicio.");
      return;
    }

    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const costo_sala = diffHours * formData.costo_base_hora;

    let precioPP = 0;
    if (formData.paquete_dulceria.toLowerCase() === "basico") precioPP = 150;
    else if (formData.paquete_dulceria.toLowerCase() === "premium") precioPP = 250;
    else if (formData.paquete_dulceria.toLowerCase() === "vip") precioPP = 400;

    const costo_dulceria = precioPP * formData.asistentes;
    const total = costo_sala + costo_dulceria;

    setSimulacion({
      costo_sala,
      costo_dulceria,
      total,
      horas: diffHours,
    });
  };

  const generarCotizacionFinal = async () => {
    setError(null);
    setLoading(true);
    
    const start = new Date(`${formData.fecha}T${formData.hora_inicio}:00`);
    const end = new Date(`${formData.fecha}T${formData.hora_fin}:00`);

    const payload = {
      nombre_cliente: formData.nombre_cliente,
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
        if (data.detail && data.detail.mensaje) {
          setError(data.detail); // Object with message and suggestions
        } else {
          setError(data.detail || "Error al procesar la cotización.");
        }
      } else {
        setResultadoFinal(data);
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (confirm("¿Estás seguro de que deseas cancelar la operación?")) {
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
    <div className="min-h-screen bg-black/95 text-zinc-100 p-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-amber-500/20 pb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bebas text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-wider">
              NEXO CINEMA CORPORATIVO
            </h1>
            <p className="text-zinc-400 mt-2 text-sm tracking-wide">
              Módulo de Coordinador de Eventos • Cotizador de Salas
            </p>
          </div>
          <div className="h-12 w-12 rounded-full border border-amber-500/30 flex items-center justify-center bg-amber-500/10">
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Formulario */}
          <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20"></div>
            
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Datos del Evento
            </h2>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Nombre del Cliente Corporativo</label>
                <input
                  type="text"
                  name="nombre_cliente"
                  value={formData.nombre_cliente}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600"
                  placeholder="Ej. Empresa SA de CV"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Sala a Rentar</label>
                  <select
                    name="id_sala"
                    value={formData.id_sala}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>Sala {s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Costo Base / Hora ($)</label>
                  <input
                    type="number"
                    name="costo_base_hora"
                    value={formData.costo_base_hora}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Inicio</label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Fin</label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Número de Asistentes</label>
                  <input
                    type="number"
                    name="asistentes"
                    value={formData.asistentes}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Paquetes de Dulcería</label>
                  <select
                    name="paquete_dulceria"
                    value={formData.paquete_dulceria}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  >
                    <option value="Ninguno">Ninguno</option>
                    <option value="Basico">Básico ($150 p/p)</option>
                    <option value="Premium">Premium ($250 p/p)</option>
                    <option value="VIP">VIP ($400 p/p)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-zinc-800/50 mt-6">
                <button
                  type="button"
                  onClick={simularCotizacion}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-lg transition-colors border border-zinc-700"
                >
                  Simular Cotización
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-3 rounded-lg transition-colors border border-red-500/20"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          {/* Panel Lateral: Resultados y Errores */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Errores / Excepciones (E1) */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-200 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <div>
                    <h3 className="font-semibold text-red-400 text-lg mb-1">Conflicto de Disponibilidad</h3>
                    <p className="text-sm opacity-90">{typeof error === "string" ? error : error.mensaje}</p>
                    
                    {error.salas_sugeridas && error.salas_sugeridas.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-red-500/20">
                        <p className="text-xs font-medium text-red-300 uppercase tracking-wider mb-2">Salas Disponibles Sugeridas:</p>
                        <div className="flex flex-wrap gap-2">
                          {error.salas_sugeridas.map((s: any) => (
                            <button
                              key={s.id_sala}
                              onClick={() => {
                                setFormData(prev => ({...prev, id_sala: s.id_sala}));
                                setError(null);
                              }}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 rounded border border-red-500/30 text-sm transition-colors"
                            >
                              {s.nombre || `Sala ${s.id_sala}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Resultado Final (Éxito) */}
            {resultadoFinal && !error && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-emerald-100 shadow-xl animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3 mb-4 border-b border-emerald-500/20 pb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-400 text-lg">Cotización Guardada</h3>
                    <p className="text-xs opacity-80">ID: #{resultadoFinal.id_cotizacion.toString().padStart(5, '0')}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-200/70">Válida hasta:</span>
                    <span className="font-medium">{new Date(resultadoFinal.valida_hasta).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200/70">Costo Sala:</span>
                    <span className="font-medium">${resultadoFinal.desglose.costo_sala.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200/70">Costo Dulcería:</span>
                    <span className="font-medium">${resultadoFinal.desglose.costo_dulceria.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-emerald-500/20 mt-3">
                    <span className="font-bold text-emerald-400">GRAN TOTAL:</span>
                    <span className="font-bold text-emerald-400 text-xl">${resultadoFinal.desglose.gran_total.toLocaleString()} MXN</span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel de Simulación */}
            {simulacion && !resultadoFinal && !error && (
              <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-6 relative">
                <h3 className="text-amber-500 font-bebas text-2xl tracking-wide mb-6">Presupuesto Simulado</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400">Renta de Sala ({simulacion.horas} horas)</span>
                    <span className="text-white font-medium">${simulacion.costo_sala.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400">Dulcería ({formData.asistentes} pax - {formData.paquete_dulceria})</span>
                    <span className="text-white font-medium">${simulacion.costo_dulceria.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 mt-4">
                    <span className="text-lg font-bold text-amber-500">Costo Total Estimado</span>
                    <span className="text-3xl font-bebas text-amber-500">${simulacion.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={generarCotizacionFinal}
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 px-6 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                        Generar Cotización y Guardar
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-zinc-500 mt-4">
                    Las cotizaciones no reservan la sala hasta que el cliente realice el pago.
                  </p>
                </div>
              </div>
            )}

            {!simulacion && !resultadoFinal && !error && (
              <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <p className="text-zinc-500 max-w-xs">
                  Llena los datos del evento y haz clic en "Simular Cotización" para ver un desglose de los costos.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
