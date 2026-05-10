import React from 'react';
import { motion } from 'motion/react';

interface Funcion {
  pelicula: string;
  fecha_hora_inicio: string;
  sala_nombre: string;
  sala_tipo?: string;
  precio_boleto: number;
}

interface ResumenCompraProps {
  funcionSeleccionada: Funcion;
  tiempoRestante: number;
  totalBoletos: number;
  precioTotal: number;
  asientosSeleccionadosNombres: string;
  metodoPago: string;
  setMetodoPago: (metodo: string) => void;
  loading: boolean;
  cancelarCompra: () => void;
  confirmarVenta: () => void;
  formatearFecha: (iso: string) => string;
}

export function ResumenCompra({
  funcionSeleccionada,
  tiempoRestante,
  totalBoletos,
  precioTotal,
  asientosSeleccionadosNombres,
  metodoPago,
  setMetodoPago,
  loading,
  cancelarCompra,
  confirmarVenta,
  formatearFecha
}: ResumenCompraProps) {
  
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  const timerColor = tiempoRestante < 60 ? "text-[#ff4e50] animate-pulse" : "text-[#f9a825]";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      
      {/* Timer de Bloqueo (Regla de Negocio: Excepción E2) */}
      <div className="text-center mb-8 bg-black/40 p-6 rounded-2xl border border-white/5">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Tiempo restante de reserva</p>
        <p className={`text-6xl font-bold font-mono ${timerColor}`} style={{ textShadow: "0 0 20px currentColor" }}>
          {String(minutos).padStart(2, "0")}:{String(segundos).padStart(2, "0")}
        </p>
        <p className="text-xs text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed">
          Los asientos seleccionados están bloqueados temporalmente. Si el temporizador expira, se liberarán.
        </p>
      </div>

      {/* Ticket de Resumen */}
      <div className="rounded-2xl border overflow-hidden relative" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.1)" }}>
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #ff4e50, #f9a825)" }}></div>
        
        <div className="p-8 border-b border-white/5">
          <h3 className="text-xs font-semibold text-[#f9a825] uppercase tracking-[0.2em] mb-4">Resumen de Transacción</h3>
          <p className="text-2xl font-bold mb-1 tracking-tight text-white">{funcionSeleccionada.pelicula}</p>
          <p className="text-sm text-gray-400">
            {formatearFecha(funcionSeleccionada.fecha_hora_inicio)} · {funcionSeleccionada.sala_nombre}
            {funcionSeleccionada.sala_tipo && funcionSeleccionada.sala_tipo !== "Tradicional" && (
              <span className="ml-2 text-[8px] bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded border border-white/10">
                {funcionSeleccionada.sala_tipo}
              </span>
            )}
          </p>
        </div>

        <div className="p-8 border-b border-white/5 space-y-4">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-400">Asientos</span>
            <span className="font-mono text-white tracking-widest bg-white/5 px-3 py-1 rounded-md">
              {asientosSeleccionadosNombres}
            </span>
          </div>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-400">Boletos</span>
            <span className="font-mono text-white text-lg">{totalBoletos} x ${funcionSeleccionada.precio_boleto.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-8 border-b border-white/5 bg-black/20">
          <div className="flex justify-between items-end">
            <span className="text-sm text-gray-400 uppercase tracking-widest">Total a pagar</span>
            <span className="text-4xl font-bold" style={{ color: "#f9a825" }}>${precioTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div className="p-8 border-b border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-[0.1em] mb-4">Seleccione Método de Pago</p>
          <div className="grid grid-cols-3 gap-3">
            {["Efectivo", "Tarjeta", "Transferencia"].map((m) => {
              const active = metodoPago === m;
              return (
                <button key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-[#ff4e50]/20 text-white border border-[#ff4e50]/50"
                      : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones */}
        <div className="p-8 flex gap-4 bg-black/40">
          <button onClick={cancelarCompra}
            className="flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-widest border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button onClick={confirmarVenta} disabled={loading}
            className="flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-black transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f9a825, #ff4e50)", boxShadow: "0 0 20px rgba(249,168,37,0.3)" }}>
            {loading ? "Procesando..." : "Confirmar Pago"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
