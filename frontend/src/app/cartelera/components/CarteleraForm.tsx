import React, { useState, useRef, useEffect } from "react";
import { Film, Calendar, Clock, Banknote, ShieldAlert, CheckCircle2, Search, ChevronDown } from "lucide-react";
import { CarteleraFormData, Pelicula, Sala } from "../types";

interface Props {
  formData: CarteleraFormData;
  setFormData: React.Dispatch<React.SetStateAction<CarteleraFormData>>;
  peliculas: Pelicula[];
  salas: Sala[];
  onSimular: () => void;
  onCancel: () => void;
}

export function CarteleraForm({ formData, setFormData, peliculas, salas, onSimular, onCancel }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener tipos únicos de las salas del backend
  const tiposUnicos = Array.from(new Set(salas.map(s => s.tipo))).filter(Boolean);
  // Sala actualmente seleccionada
  const salaSeleccionada = salas.find(s => s.id_sala === formData.id_sala);
  // Tipo activo (el del sala seleccionada, o el primero disponible)
  const tipoActivo = salaSeleccionada?.tipo || tiposUnicos[0] || "";
  // Salas del tipo activo
  const salasDelTipo = salas.filter(s => s.tipo === tipoActivo);

  const peliculaSeleccionada = peliculas.find(p => p.id_pelicula === formData.id_pelicula);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "precio_boleto") {
      let val = Number(value);
      if (val < 0) val = 0;
      if (val > 1000) val = 1000;
      setFormData(prev => ({ ...prev, [name]: val }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: ["id_sala", "id_pelicula"].includes(name) ? Number(value) : value,
    }));
  };

  const HORA_APERTURA = 10;
  const CIERRE_OPERATIVO_MINUTOS = 25 * 60; 

  const timeSlots = [];
  for (let i = HORA_APERTURA; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      if (peliculaSeleccionada) {
        const minutosInicio = (i * 60) + j;
        const minutosFinEstimado = minutosInicio + peliculaSeleccionada.duracion_minutos + 30; 
        if (minutosFinEstimado > CIERRE_OPERATIVO_MINUTOS) continue; 
      }
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      const time24 = `${hour}:${minute}`;
      const isPM = i >= 12;
      const hour12 = i > 12 ? i - 12 : (i === 0 ? 12 : i);
      const ampm = isPM ? 'PM' : 'AM';
      timeSlots.push({ value: time24, label: `${hour12.toString().padStart(2, '0')}:${minute} ${ampm}` });
    }
  }

  // Salas hardcodeadas eliminadas — ahora vienen del backend vía props
  const inputClass = "w-full bg-[#0a0a0a]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600 autofill:bg-[#0a0a0a] autofill:text-white";
  const peliculasFiltradas = peliculas.filter(p => p.titulo.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      <h2 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
        <Film className="w-5 h-5 text-amber-500" />
        Datos de la Función
      </h2>

      <form className="grid grid-cols-1 gap-6" onSubmit={(e) => e.preventDefault()}>
        
        {/* BUSCADOR DE PELÍCULAS (COMBOBOX) */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Película del Catálogo</label>
          <div 
            className={`relative group bg-[#0a0a0a]/80 border ${isDropdownOpen ? 'border-amber-500/50 ring-1 ring-amber-500/50' : 'border-white/10'} rounded-2xl flex items-center cursor-pointer transition-all`}
            onClick={() => setIsDropdownOpen(true)}
          >
            <Search className={`w-4 h-4 ml-4 ${isDropdownOpen ? 'text-amber-500' : 'text-zinc-600'}`} />
            <input
              type="text"
              placeholder="Buscar película..."
              value={isDropdownOpen ? searchQuery : (peliculaSeleccionada?.titulo || "")}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              className="w-full bg-transparent pl-3 pr-10 py-4 text-white focus:outline-none placeholder:text-zinc-600"
            />
            <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-4 pointer-events-none" />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-50 top-[80px] left-0 w-full bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
              {peliculasFiltradas.length > 0 ? (
                peliculasFiltradas.map(p => (
                  <button
                    key={p.id_pelicula}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, id_pelicula: p.id_pelicula }));
                      setSearchQuery("");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors ${formData.id_pelicula === p.id_pelicula ? 'bg-amber-500/10' : ''}`}
                  >
                    {p.imagen_url && <img src={p.imagen_url} alt={p.titulo} className="w-8 h-12 object-cover rounded shadow-md" />}
                    <div>
                      <p className={`font-medium ${formData.id_pelicula === p.id_pelicula ? 'text-amber-400' : 'text-white'}`}>{p.titulo}</p>
                      <p className="text-xs text-zinc-500">Duración: {p.duracion_minutos} min</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-zinc-500 text-sm">No se encontraron películas.</div>
              )}
            </div>
          )}
        </div>

        {/* RESUMEN DE LA PELÍCULA */}
        {peliculaSeleccionada && !isDropdownOpen && (
          <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
            {peliculaSeleccionada.imagen_url && (
              <img src={peliculaSeleccionada.imagen_url} alt="Poster" className="w-20 h-28 object-cover rounded-xl shadow-lg" />
            )}
            <div className="flex flex-col justify-center gap-2">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" /> CLASIFICACIÓN {peliculaSeleccionada.clasificacion}
              </p>
              <p className="text-sm text-zinc-300 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" /> Duración oficial: {peliculaSeleccionada.duracion_minutos} min
              </p>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{peliculaSeleccionada.sinopsis}</p>
            </div>
          </div>
        )}

        {/* SELECCIÓN DE SALA (Agrupada por formato — datos dinámicos del backend) */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Formato de Sala</label>
          
          {/* Fila de Tipos — generada dinámicamente desde la BD */}
          <div className="flex flex-wrap gap-2">
            {tiposUnicos.map((tipo) => {
              const isActive = tipoActivo === tipo;
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => {
                    // Al cambiar de tipo, selecciona la primera sala de ese tipo
                    const primera = salas.find(s => s.tipo === tipo);
                    if (primera) setFormData(prev => ({ ...prev, id_sala: primera.id_sala }));
                  }}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold tracking-widest uppercase transition-all ${
                    isActive
                      ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : "bg-[#0a0a0a] border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300"
                  }`}
                >
                  {tipo}
                </button>
              );
            })}
          </div>

          {/* Grid de número de Sala — solo salas del tipo seleccionado */}
          {salasDelTipo.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 pt-1">
              {salasDelTipo.map((sala) => {
                const isSelected = formData.id_sala === sala.id_sala;
                // Extrae el número desde el nombre (ej "Sala 9" → 9)
                const numero = sala.nombre.replace(/\D/g, "");
                return (
                  <button
                    key={sala.id_sala}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, id_sala: sala.id_sala }))}
                    title={`${sala.nombre} — ${sala.capacidad} asientos`}
                    className={`relative flex flex-col items-center justify-center aspect-square rounded-xl border transition-all duration-200 group ${
                      isSelected 
                        ? "bg-gradient-to-b from-amber-500/15 to-amber-900/20 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]" 
                        : "bg-[#0a0a0a]/60 border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.04]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,1)]" />
                    )}
                    <span className={`text-xl font-black tabular-nums leading-none transition-colors ${
                      isSelected ? "text-amber-500" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}>
                      {numero}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm py-4 text-center">No hay salas de este tipo registradas.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Fecha</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                min={today}
                onChange={handleInputChange}
                className={`${inputClass} cursor-pointer`}
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Hora de Inicio</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Clock className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
              </div>
              <select
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleInputChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="" disabled className="bg-[#0a0a0a]">Selecciona un horario...</option>
                {timeSlots.map(slot => (
                  <option key={`start-${slot.value}`} value={slot.value} className="bg-[#0a0a0a]">
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Precio Boleto General ($)</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Banknote className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500" />
            </div>
            <input
              type="number"
              name="precio_boleto"
              value={formData.precio_boleto || ""}
              onChange={handleInputChange}
              min="0"
              max="1000"
              className={inputClass}
              placeholder="Ej. 120.00"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-white/5 mt-2">
          <button
            type="button"
            onClick={onSimular}
            className="flex-1 bg-amber-500/5 text-amber-500 border border-amber-500/30 font-bold py-4 px-6 rounded-2xl hover:bg-amber-500 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            VALIDAR HORARIO
            <CheckCircle2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-red-500/5 hover:bg-red-500/20 text-red-400 font-medium rounded-2xl transition-colors border border-red-500/20 uppercase tracking-widest text-xs"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
