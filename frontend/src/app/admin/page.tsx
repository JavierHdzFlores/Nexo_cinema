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

        {/* Contenido de Consultar Ventas */}
        {activeSection === 'ventas' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-2xl flex flex-col items-center justify-center text-center mt-8"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <BarChart3 size={32} className="text-white/40" />
            </div>
            <h2 className="text-2xl font-medium text-white mb-2">Consultar Ventas</h2>
            <p className="text-white/40 max-w-md">
              Módulo en desarrollo. Próximamente podrás consultar y analizar todas las ventas realizadas en el sistema con gráficas y exportación.
            </p>
          </motion.div>
        )}

        {/* Mensaje */}
        {mensaje && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-3"
            style={{ 
              background: mensaje.includes('✓') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: mensaje.includes('✓') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: mensaje.includes('✓') ? '#4ade80' : '#f87171'
            }}
          >
            {mensaje}
          </motion.div>
        )}
      </main>
    </div>
  );
}
