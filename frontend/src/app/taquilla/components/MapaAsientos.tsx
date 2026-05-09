import React from 'react';
import { motion } from 'motion/react';

interface AsientoInfo {
  id_asiento: number;
  numero: string;
  estado: "disponible" | "ocupado" | "bloqueado";
  bloqueado_por: string | null;
}

interface MapaAsientosProps {
  asientos: AsientoInfo[];
  seleccionados: Set<number>;
  toggleAsiento: (asiento: AsientoInfo) => void;
  idCliente: string;
  loading: boolean;
}

export function MapaAsientos({ asientos, seleccionados, toggleAsiento, idCliente, loading }: MapaAsientosProps) {
  // Agrupar asientos por fila
  const filas = asientos.reduce<Record<string, AsientoInfo[]>>((acc, a) => {
    const fila = a.numero.replace(/[0-9]/g, "");
    if (!acc[fila]) acc[fila] = [];
    acc[fila].push(a);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-20 text-[#f9a825] tracking-widest uppercase text-sm animate-pulse">Sincronizando Mapa...</div>;
  }

  return (
    <div className="w-full">
      {/* Leyenda */}
      <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md border" style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)" }}></span>
          Disponible
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md" style={{ background: "linear-gradient(135deg, #ff4e50, #f9a825)" }}></span>
          Tu selección
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md" style={{ background: "rgba(249,168,37,0.4)" }}></span>
          Bloqueado (Otro)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md" style={{ background: "rgba(255,78,80,0.4)" }}></span>
          Ocupado
        </div>
      </div>

      {/* Pantalla Curva Simbólica */}
      <div className="mb-12 text-center relative w-full max-w-2xl mx-auto">
        <div className="absolute inset-0 top-[-20px] blur-2xl opacity-20" style={{ background: "linear-gradient(90deg, transparent, #f9a825, transparent)" }}></div>
        <div 
          className="h-2 w-full mx-auto" 
          style={{ 
            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(249,168,37,0.8), rgba(255,255,255,0))",
            borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
            transform: "scaleY(2)"
          }}
        ></div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#f9a825]/60 mt-4">Pantalla</p>
      </div>

      {/* Grid de asientos */}
      <div className="flex flex-col items-center gap-3 mb-8 overflow-x-auto pb-4">
        {Object.entries(filas).sort().map(([fila, seats]) => (
          <div key={fila} className="flex items-center gap-1.5">
            <span className="w-6 text-right text-xs text-[#f9a825]/70 font-mono mr-4 select-none">{fila}</span>
            {seats
              .sort((a, b) => parseInt(a.numero.replace(/\D/g, "")) - parseInt(b.numero.replace(/\D/g, "")))
              .map((asiento) => {
                const isSelected = seleccionados.has(asiento.id_asiento);
                const isMine = asiento.bloqueado_por === idCliente;
                
                let style: React.CSSProperties = {
                  background: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#fff"
                };
                let cursor = "cursor-pointer";

                if (asiento.estado === "ocupado") {
                  style.background = "rgba(255,78,80,0.2)";
                  style.borderColor = "rgba(255,78,80,0.3)";
                  style.color = "rgba(255,255,255,0.3)";
                  cursor = "cursor-not-allowed";
                } else if (asiento.estado === "bloqueado" && !isMine) {
                  style.background = "rgba(249,168,37,0.2)";
                  style.borderColor = "rgba(249,168,37,0.3)";
                  style.color = "rgba(255,255,255,0.4)";
                  cursor = "cursor-not-allowed";
                } else if (isSelected) {
                  style.background = "linear-gradient(135deg, #ff4e50, #f9a825)";
                  style.borderColor = "transparent";
                  style.color = "#fff";
                  style.boxShadow = "0 0 10px rgba(249,168,37,0.4)";
                }

                return (
                  <motion.button 
                    key={asiento.id_asiento}
                    whileHover={asiento.estado === "disponible" || isMine ? { scale: 1.15, borderColor: "rgba(249,168,37,0.8)" } : {}}
                    whileTap={asiento.estado === "disponible" || isMine ? { scale: 0.9 } : {}}
                    onClick={() => toggleAsiento(asiento)}
                    className={`w-10 h-10 rounded-t-lg rounded-b-sm border text-[11px] font-mono font-bold transition-colors flex items-center justify-center ${cursor}`}
                    style={style}
                    title={`${asiento.numero} — ${asiento.estado}`}
                  >
                    {asiento.numero.replace(/[A-Z]/gi, "")}
                  </motion.button>
                );
              })}
            <span className="w-6 text-left text-xs text-[#f9a825]/70 font-mono ml-4 select-none">{fila}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
