"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

import { FuncionCard } from "./components/FuncionCard";
import { MapaAsientos } from "./components/MapaAsientos";
import { ResumenCompra } from "./components/ResumenCompra";
import { TicketExito } from "./components/TicketExito";

/* ═══════════════════════════════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════════════════════════════ */
interface Funcion {
  id: number;
  pelicula: string;
  clasificacion: string;
  fecha_hora_inicio: string;
  precio_boleto: number;
  id_sala: number;
  sala_nombre: string;
  imagen_url?: string;
}

interface AsientoInfo {
  id_asiento: number;
  numero: string;
  estado: "disponible" | "ocupado" | "bloqueado";
  bloqueado_por: string | null;
}

type Paso = "seleccion_funcion" | "mapa_asientos" | "resumen" | "resultado";

const API = "http://localhost:8000/api/taquilla";

/* ═══════════════════════════════════════════════════════════════
   UTILIDADES
   ═══════════════════════════════════════════════════════════════ */
function generarIdCliente(): string {
  return "cli_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    weekday: "short", day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
export default function TaquillaPage() {
  const idClienteRef = useRef(generarIdCliente());
  const [paso, setPaso] = useState<Paso>("seleccion_funcion");

  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [funcionSeleccionada, setFuncionSeleccionada] = useState<Funcion | null>(null);

  const [asientos, setAsientos] = useState<AsientoInfo[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  const [tiempoRestante, setTiempoRestante] = useState(300);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [resultado, setResultado] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/funciones`)
      .then((r) => r.json())
      .then(setFunciones)
      .catch(() => setError("No se pudo conectar al servidor."));
  }, []);

  const cargarMapa = useCallback(async (idEvento: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/eventos/${idEvento}/asientos`);
      const data = await res.json();
      setAsientos(data.asientos || []);
    } catch {
      setError("Error al cargar el mapa de asientos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleAsiento = (asiento: AsientoInfo) => {
    if (asiento.estado === "ocupado") return;
    if (asiento.estado === "bloqueado" && asiento.bloqueado_por !== idClienteRef.current) return;

    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(asiento.id_asiento)) {
        next.delete(asiento.id_asiento);
      } else {
        next.add(asiento.id_asiento);
      }
      return next;
    });
  };

  const bloquearAsientos = async () => {
    if (!funcionSeleccionada || seleccionados.size === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/bloquear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_evento: funcionSeleccionada.id,
          ids_asientos: Array.from(seleccionados),
          id_cliente_temp: idClienteRef.current,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "No se pudieron bloquear los asientos.");
        await cargarMapa(funcionSeleccionada.id);
        setSeleccionados(new Set());
        return;
      }
      setPaso("resumen");
      setTiempoRestante(300);
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setError("El tiempo para completar la compra ha expirado.");
            setPaso("mapa_asientos");
            setSeleccionados(new Set());
            if (funcionSeleccionada) cargarMapa(funcionSeleccionada.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Error de conexión al bloquear asientos.");
    } finally {
      setLoading(false);
    }
  };

  const confirmarVenta = async () => {
    if (!funcionSeleccionada) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/vender`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_evento: funcionSeleccionada.id,
          ids_asientos: Array.from(seleccionados),
          metodo_pago: metodoPago,
          id_cliente_temp: idClienteRef.current,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Error al procesar la venta.");
        return;
      }
      const data = await res.json();
      setResultado(data);
      setPaso("resultado");
      if (timerRef.current) clearInterval(timerRef.current);
    } catch {
      setError("Error de conexión al confirmar la venta.");
    } finally {
      setLoading(false);
    }
  };

  const cancelarCompra = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSeleccionados(new Set());
    setPaso("mapa_asientos");
    setError(null);
    if (funcionSeleccionada) cargarMapa(funcionSeleccionada.id);
  };

  const nuevaVenta = () => {
    idClienteRef.current = generarIdCliente();
    setFuncionSeleccionada(null);
    setSeleccionados(new Set());
    setAsientos([]);
    setResultado(null);
    setError(null);
    setPaso("seleccion_funcion");
  };

  const totalBoletos = seleccionados.size;
  const precioTotal = funcionSeleccionada ? totalBoletos * funcionSeleccionada.precio_boleto : 0;
  
  const asientosSeleccionadosNombres = asientos
    .filter((a) => seleccionados.has(a.id_asiento))
    .map((a) => a.numero)
    .join(", ");

  return (
    <main className="min-h-screen text-white bg-[#030213]" style={{ fontFamily: "var(--font-inter)" }}>
      {/* ═══ HEADER CORPORATIVO ═══ */}
      <header className="sticky top-0 z-50 border-b border-white/10 px-8 py-5 flex items-center justify-between"
        style={{ background: "rgba(3,2,19,0.85)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(249,168,37,0.3)]" style={{ background: "linear-gradient(135deg, #2a0800, #030213)" }}>
            <span className="text-2xl">🎟️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-white"
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.1em" }}>
              NEXO <span style={{ color: "#f9a825" }}>CINEMA</span>
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
              Terminal Taquilla POS
            </p>
          </div>
        </div>
        {paso !== "seleccion_funcion" && paso !== "resultado" && (
          <button onClick={nuevaVenta}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg border transition-all text-gray-300 border-gray-700 hover:border-gray-500 hover:text-white"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            Anular Operación
          </button>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ═══ ERROR BANNER ═══ */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }} animate={{ opacity: 1, height: "auto", mb: 24 }} exit={{ opacity: 0, height: 0, mb: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl border flex items-center justify-between shadow-lg"
                style={{ background: "rgba(255,78,80,0.1)", borderColor: "rgba(255,78,80,0.3)", color: "#ff4e50" }}>
                <span className="font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  {error}
                </span>
                <button onClick={() => setError(null)} className="opacity-70 hover:opacity-100 transition-opacity">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════
            PASO 1: SELECCIÓN DE FUNCIÓN
           ═══════════════════════════════════════════════════════ */}
        {paso === "seleccion_funcion" && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em", fontSize: "2rem" }}>
                  Cartelera Disponible
                </h2>
                <p className="text-sm text-gray-500">Seleccione la función solicitada por el cliente.</p>
              </div>
            </div>

            {funciones.length === 0 && !loading ? (
              <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                <p className="text-gray-400">El sistema no detecta funciones programadas para hoy.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {funciones.map((f) => (
                  <FuncionCard 
                    key={f.id} 
                    funcion={f} 
                    onClick={(funcion) => {
                      setFuncionSeleccionada(funcion);
                      cargarMapa(funcion.id);
                      setPaso("mapa_asientos");
                    }} 
                    formatearFecha={formatearFecha} 
                  />
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════════════
            PASO 2-3: MAPA DE ASIENTOS
           ═══════════════════════════════════════════════════════ */}
        {paso === "mapa_asientos" && funcionSeleccionada && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-32">
            
            {/* Cabecera de Función Elegida */}
            <div className="mb-10 p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6"
              style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.02), transparent)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div>
                <p className="text-[10px] text-[#f9a825] uppercase tracking-[0.2em] font-bold mb-1">Función en Curso</p>
                <p className="text-2xl font-bold text-white tracking-tight">{funcionSeleccionada.pelicula}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {formatearFecha(funcionSeleccionada.fecha_hora_inicio)} · Sala: <span className="text-white">{funcionSeleccionada.sala_nombre}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Costo Unitario</p>
                <p className="text-3xl font-bold text-white">${funcionSeleccionada.precio_boleto.toFixed(2)}</p>
              </div>
            </div>

            <MapaAsientos 
              asientos={asientos}
              seleccionados={seleccionados}
              toggleAsiento={toggleAsiento}
              idCliente={idClienteRef.current}
              loading={loading}
            />

            {/* Panel Flotante Inferior de Compra */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl flex items-center justify-between rounded-2xl px-8 py-5 border shadow-2xl z-40 transition-all"
              style={{ 
                background: "rgba(10,10,15,0.95)", 
                backdropFilter: "blur(20px)",
                borderColor: totalBoletos > 0 ? "rgba(249,168,37,0.3)" : "rgba(255,255,255,0.1)",
                boxShadow: totalBoletos > 0 ? "0 20px 40px -10px rgba(0,0,0,0.8), 0 0 30px rgba(249,168,37,0.15)" : "0 20px 40px -10px rgba(0,0,0,0.8)"
              }}>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Selección Actual</p>
                <p className="text-xl font-bold">
                  {totalBoletos > 0 ? (
                    <span className="text-white">
                      {totalBoletos} Asiento{totalBoletos > 1 ? "s" : ""} <span className="text-gray-600 mx-2">|</span> <span style={{ color: "#f9a825" }}>${precioTotal.toFixed(2)}</span>
                    </span>
                  ) : (
                    <span className="text-gray-600 text-base">Ningún asiento seleccionado</span>
                  )}
                </p>
              </div>
              <button
                disabled={totalBoletos === 0 || loading}
                onClick={bloquearAsientos}
                className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed text-black"
                style={{
                  background: totalBoletos > 0 ? "linear-gradient(135deg, #f9a825, #ff4e50)" : "rgba(255,255,255,0.2)",
                  color: totalBoletos > 0 ? "#000" : "rgba(255,255,255,0.4)",
                  boxShadow: totalBoletos > 0 ? "0 5px 15px rgba(249,168,37,0.4)" : "none"
                }}>
                {loading ? "Reservando..." : "Bloquear y Pagar"}
              </button>
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════════════
            PASO 5-6: RESUMEN Y CONFIRMACIÓN
           ═══════════════════════════════════════════════════════ */}
        {paso === "resumen" && funcionSeleccionada && (
          <ResumenCompra 
            funcionSeleccionada={funcionSeleccionada}
            tiempoRestante={tiempoRestante}
            totalBoletos={totalBoletos}
            precioTotal={precioTotal}
            asientosSeleccionadosNombres={asientosSeleccionadosNombres}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            loading={loading}
            cancelarCompra={cancelarCompra}
            confirmarVenta={confirmarVenta}
            formatearFecha={formatearFecha}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            PASO 8-10: RESULTADO (BOLETOS GENERADOS)
           ═══════════════════════════════════════════════════════ */}
        {paso === "resultado" && resultado && (
          <TicketExito resultado={resultado} nuevaVenta={nuevaVenta} />
        )}
      </div>
    </main>
  );
}