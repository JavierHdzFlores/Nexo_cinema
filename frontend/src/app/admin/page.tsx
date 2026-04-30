'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Film, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<'factura' | 'ventas'>('factura');
  const [activeTab, setActiveTab] = useState<'individual' | 'evento'>('individual');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Estado para Factura Individual
  const [individual, setIndividual] = useState({
    tipo_servicio: '',
    id_cliente: '',
    id_venta: '',
    id_gerente: '1', // Default gerente ID
  });

  // Estado para Factura de Evento
  const [evento, setEvento] = useState({
    id_evento: '',
    id_cliente: '',
    id_gerente: '1', // Default gerente ID
  });

  // Estado para Reporte de Ventas (CU-10)
  const [consulta, setConsulta] = useState({
    id_gerente: '1',
    id_cine: '1',
    fechaInicio: '',
    fechaFin: '',
    tipoGrafica: 'Barras'
  });
  const [datosReporte, setDatosReporte] = useState<any>(null);

  const handleCreateIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      const payload = {
        tipo_servicio: individual.tipo_servicio,
        id_cliente: individual.id_cliente ? parseInt(individual.id_cliente) : null,
        id_venta: individual.id_venta ? parseInt(individual.id_venta) : null,
        id_gerente: parseInt(individual.id_gerente),
      };

      const response = await fetch('http://localhost:8001/finanzas/facturas/individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje(`✓ Factura individual creada: #${data.id_factura}`);
        setIndividual({
          tipo_servicio: '',
          id_cliente: '',
          id_venta: '',
          id_gerente: '1',
        });
      } else {
        const error = await response.json();
        setMensaje(`✗ Error: ${error.detail || 'Error al crear la factura'}`);
      }
    } catch (error) {
      setMensaje('✗ Error de conexión con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      const payload = {
        id_evento: parseInt(evento.id_evento),
        id_cliente: evento.id_cliente ? parseInt(evento.id_cliente) : null,
        id_gerente: parseInt(evento.id_gerente),
      };

      const response = await fetch('http://localhost:8001/finanzas/facturas/evento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje(`✓ Factura de evento creada: #${data.id_factura}`);
        setEvento({
          id_evento: '',
          id_cliente: '',
          id_gerente: '1',
        });
      } else {
        const error = await response.json();
        setMensaje(`✗ Error: ${error.detail || 'Error al crear la factura'}`);
      }
    } catch (error) {
      setMensaje('✗ Error de conexión con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultarVentas = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    setDatosReporte(null);

    if (new Date(consulta.fechaInicio) >= new Date(consulta.fechaFin)) {
      setMensaje('✗ Error: La fecha de inicio debe ser anterior a la fecha de fin');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        id_gerente: parseInt(consulta.id_gerente),
        id_cine: parseInt(consulta.id_cine),
        fechaInicio: new Date(consulta.fechaInicio).toISOString(),
        fechaFin: new Date(consulta.fechaFin).toISOString(),
        tipoGrafica: consulta.tipoGrafica
      };

      const response = await fetch('http://localhost:8001/finanzas/reportes/generar-reporte-ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setDatosReporte(data.reporte);
        setMensaje(`✓ Reporte de ventas generado`);
      } else {
        const error = await response.json();
        setMensaje(`✗ Error: ${error.detail || 'Error al generar reporte'}`);
      }
    } catch (error) {
      setMensaje('✗ Error de conexión con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-[#ff4e50] selection:text-white" style={{ background: '#080b14' }}>
      {/* ═════════ HEADER ═════════ */}
      <header
        className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(8,11,20,0.95)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-[1800px] mx-auto px-8 h-16 flex items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
            >
              <Film size={14} className="text-white" />
            </div>
            <span
              className="text-white tracking-widest select-none"
              style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '18px', letterSpacing: '0.12em' }}
            >
              NEXO CINEMA
            </span>
            <span className="text-white/20 text-sm font-light">/</span>
            <span className="text-white/40 text-sm font-medium">Panel de Administración</span>
          </Link>
        </div>
      </header>

      {/* ═════════ BODY ═════════ */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Titulo */}
        <div className="mb-10 text-center">
          <h1
            className="text-4xl md:text-5xl font-semibold text-white mb-2"
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.05em' }}
          >
            Finanzas y Reportes
          </h1>
          <p className="text-white/40 font-light">
            Administración centralizada de facturación y análisis de ventas.
          </p>
        </div>

        {/* Mensaje Global */}
        {mensaje && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-8 p-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-3"
            style={{ 
              background: mensaje.includes('✓') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: mensaje.includes('✓') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: mensaje.includes('✓') ? '#4ade80' : '#f87171'
            }}
          >
            {mensaje}
          </motion.div>
        )}

        {/* ── Tabs de filtro instantáneo (Section) ── */}
        <nav className="flex items-center gap-1 p-1 rounded-xl w-fit mx-auto mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'factura', label: 'Generar Factura', icon: FileText },
            { id: 'ventas', label: 'Consultar Ventas', icon: BarChart3 }
          ].map(sec => {
            const isActive = activeSection === sec.id;
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => { setActiveSection(sec.id as any); setMensaje(''); }}
                className="relative px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{ color: isActive ? '#000' : 'rgba(255,255,255,0.4)' }}
              >
                {isActive && (
                  <motion.span
                    layoutId="admin-section-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{sec.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Contenido de Generar Factura */}
        {activeSection === 'factura' && (
          <div 
            className="p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Sub-tabs para tipos de factura */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
              {[
                { id: 'individual', label: 'Factura Individual' },
                { id: 'evento', label: 'Factura de Evento' }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setMensaje(''); }}
                    className={`text-sm font-medium tracking-wide transition-colors ${
                      isActive ? 'text-[#ff4e50]' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Formulario Individual */}
            {activeTab === 'individual' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-medium text-white mb-2">Crear Factura Individual</h2>
                <p className="text-sm text-white/40 mb-8">Genera facturas para servicios específicos de clientes.</p>

                <form onSubmit={handleCreateIndividual} className="space-y-6">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">Tipo de Servicio *</label>
                    <input
                      type="text"
                      value={individual.tipo_servicio}
                      onChange={(e) => setIndividual({ ...individual, tipo_servicio: e.target.value })}
                      placeholder="Ej: Entrada VIP, Combo Dulcería, Operación..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50]/50 focus:ring-1 focus:ring-[#ff4e50]/50 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID Cliente (opcional)</label>
                      <input
                        type="number"
                        min="1"
                        value={individual.id_cliente}
                        onChange={(e) => setIndividual({ ...individual, id_cliente: e.target.value })}
                        placeholder="Ej. 101"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50]/50 focus:ring-1 focus:ring-[#ff4e50]/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID Venta (opcional)</label>
                      <input
                        type="number"
                        min="1"
                        value={individual.id_venta}
                        onChange={(e) => setIndividual({ ...individual, id_venta: e.target.value })}
                        placeholder="Ej. 505"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50]/50 focus:ring-1 focus:ring-[#ff4e50]/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID Gerente *</label>
                    <input
                      type="number"
                        min="1"
                      value={individual.id_gerente}
                      onChange={(e) => setIndividual({ ...individual, id_gerente: e.target.value })}
                      placeholder="ID del gerente autorizado"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50]/50 focus:ring-1 focus:ring-[#ff4e50]/50 transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide text-[#080b14] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                  >
                    {loading ? 'Procesando...' : 'Emitir Factura Individual'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Formulario Evento */}
            {activeTab === 'evento' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-medium text-white mb-2">Crear Factura de Evento</h2>
                <p className="text-sm text-white/40 mb-8">Facturación para proyecciones y eventos privados.</p>

                <form onSubmit={handleCreateEvento} className="space-y-6">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID Evento *</label>
                    <input
                      type="number"
                        min="1"
                      value={evento.id_evento}
                      onChange={(e) => setEvento({ ...evento, id_evento: e.target.value })}
                      placeholder="Ej. 10"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50]/50 focus:ring-1 focus:ring-[#ff4e50]/50 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID Cliente (opcional)</label>
                      <input
                        type="number"
                        min="1"
                        value={evento.id_cliente}
                        onChange={(e) => setEvento({ ...evento, id_cliente: e.target.value })}
                        placeholder="Ej. 101"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50]/50 focus:ring-1 focus:ring-[#ff4e50]/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID Gerente *</label>
                      <input
                        type="number"
                        min="1"
                        value={evento.id_gerente}
                        onChange={(e) => setEvento({ ...evento, id_gerente: e.target.value })}
                        placeholder="ID del gerente autorizado"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50]/50 focus:ring-1 focus:ring-[#ff4e50]/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide text-[#080b14] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                  >
                    {loading ? 'Procesando...' : 'Emitir Factura de Evento'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        )}

        {/* MÓDULO: CONSULTAR VENTAS */}
        {activeSection === 'ventas' && (
          <div 
            className="p-8 rounded-2xl flex flex-col h-full"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
              <BarChart3 className="text-[#f9a825]" size={24} />
              <h2 className="text-xl font-medium text-white">Consultar Reportes de Ventas</h2>
            </div>
            
            <form onSubmit={handleConsultarVentas} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID Gerente *</label>
                  <input
                    type="number"
                        min="1"
                    value={consulta.id_gerente}
                    onChange={(e) => setConsulta({ ...consulta, id_gerente: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#f9a825]/50 focus:ring-1 focus:ring-[#f9a825]/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID Cine *</label>
                  <input
                    type="number"
                        min="1"
                    value={consulta.id_cine}
                    onChange={(e) => setConsulta({ ...consulta, id_cine: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#f9a825]/50 focus:ring-1 focus:ring-[#f9a825]/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    value={consulta.fechaInicio}
                    onChange={(e) => setConsulta({ ...consulta, fechaInicio: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#f9a825]/50 focus:ring-1 focus:ring-[#f9a825]/50 transition-all [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">Fecha Fin *</label>
                  <input
                    type="datetime-local"
                    value={consulta.fechaFin}
                    onChange={(e) => setConsulta({ ...consulta, fechaFin: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#f9a825]/50 focus:ring-1 focus:ring-[#f9a825]/50 transition-all [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">Tipo de Gráfica</label>
                <select
                  value={consulta.tipoGrafica}
                  onChange={(e) => setConsulta({ ...consulta, tipoGrafica: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#f9a825]/50 focus:ring-1 focus:ring-[#f9a825]/50 transition-all appearance-none"
                >
                  <option value="Barras" className="bg-[#080b14]">Barras</option>
                  <option value="Lineas" className="bg-[#080b14]">Líneas</option>
                  <option value="Pastel" className="bg-[#080b14]">Pastel</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide text-[#080b14] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                style={{ background: 'linear-gradient(135deg, #f9a825, #ff4e50)' }}
              >
                {loading ? 'Consultando...' : 'Generar Reporte'}
              </button>
            </form>

            {datosReporte && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-4"
              >
                <h3 className="text-lg font-medium text-[#f9a825]">Resultados del Reporte</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Ventas Totales</p>
                    <p className="text-2xl font-semibold text-white">${datosReporte.datos?.totalVentas?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Cantidad Transacciones</p>
                    <p className="text-2xl font-semibold text-white">{datosReporte.datos?.cantidadVentas || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Ocupación</p>
                    <p className="text-2xl font-semibold text-white">{datosReporte.ocupacion || 0}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Rentabilidad</p>
                    <p className="text-2xl font-semibold text-white">{datosReporte.rentabilidad || 0}%</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
