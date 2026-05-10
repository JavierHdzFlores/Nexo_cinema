'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Film, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<'factura' | 'ventas'>('factura');
  const [activeTab, setActiveTab] = useState<'individual' | 'evento' | 'datos_fiscales'>('individual');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Estado para actualización fiscal
  const [showFiscalForm, setShowFiscalForm] = useState(false);
  const [fiscalData, setFiscalData] = useState({ id_cliente: '', rfc: '', codigo_postal: '' });
  
  // Estado para mostrar factura generada
  const [facturaGenerada, setFacturaGenerada] = useState<any>(null);

  // Estado para la pestaña de Datos Fiscales
  const [checkClienteId, setCheckClienteId] = useState('');
  const [clienteFiscalInfo, setClienteFiscalInfo] = useState<any>(null);

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

      const response = await fetch('http://localhost:8000/finanzas/facturas/individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setFacturaGenerada(data);
        setMensaje(`✓ Factura individual creada: #${data.id_factura}`);
        setIndividual({
          tipo_servicio: '',
          id_cliente: '',
          id_venta: '',
          id_gerente: '1',
        });
      } else {
        const error = await response.json();
        if (error.detail && error.detail.includes("Datos fiscales")) {
           setShowFiscalForm(true);
           setFiscalData(prev => ({ ...prev, id_cliente: individual.id_cliente }));
           setMensaje('Atención: El cliente no cuenta con datos fiscales completos.');
        } else {
           setMensaje(`✗ Error: ${error.detail || 'Error al crear la factura'}`);
        }
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

      const response = await fetch('http://localhost:8000/finanzas/facturas/evento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setFacturaGenerada(data);
        setMensaje(`✓ Factura de evento creada: #${data.id_factura}`);
        setEvento({
          id_evento: '',
          id_cliente: '',
          id_gerente: '1',
        });
      } else {
        const error = await response.json();
        if (error.detail && error.detail.includes("Datos fiscales")) {
           setShowFiscalForm(true);
           setFiscalData(prev => ({ ...prev, id_cliente: evento.id_cliente }));
           setMensaje('Atención: El cliente no cuenta con datos fiscales completos.');
        } else {
           setMensaje(`✗ Error: ${error.detail || 'Error al crear la factura'}`);
        }
      }
    } catch (error) {
      setMensaje('✗ Error de conexión con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFiscales = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/usuarios/cliente/${fiscalData.id_cliente}/fiscales`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfc: fiscalData.rfc,
          codigo_postal: fiscalData.codigo_postal
        })
      });
      if (res.ok) {
         setMensaje('✓ Datos fiscales actualizados. Por favor, intenta generar la factura nuevamente.');
         setShowFiscalForm(false);
         setFiscalData({ id_cliente: '', rfc: '', codigo_postal: '' });
      } else {
         const err = await res.json();
         setMensaje(`✗ Error al actualizar: ${err.detail}`);
      }
    } catch (e) {
      setMensaje('✗ Error de conexión al actualizar datos fiscales.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckFiscales = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    setClienteFiscalInfo(null);
    try {
      const res = await fetch(`http://localhost:8000/finanzas/cliente/${checkClienteId}/validar-datos-fiscales`, {
        method: 'POST',
      });
      if (res.ok) {
         const data = await res.json();
         setClienteFiscalInfo(data);
      } else {
         const err = await res.json();
         setMensaje(`✗ Error: ${err.detail}`);
      }
    } catch (e) {
      setMensaje('✗ Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFiscalesTab = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/usuarios/cliente/${checkClienteId}/fiscales`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfc: fiscalData.rfc,
          codigo_postal: fiscalData.codigo_postal
        })
      });
      if (res.ok) {
         setMensaje('✓ Datos fiscales actualizados correctamente.');
         setClienteFiscalInfo(null);
         setFiscalData({ id_cliente: '', rfc: '', codigo_postal: '' });
         setCheckClienteId('');
      } else {
         const err = await res.json();
         setMensaje(`✗ Error al actualizar: ${err.detail}`);
      }
    } catch (e) {
      setMensaje('✗ Error de conexión al actualizar datos fiscales.');
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
        fechaInicio: new Date(consulta.fechaInicio).toISOString(),
        fechaFin: new Date(consulta.fechaFin).toISOString(),
        tipoGrafica: consulta.tipoGrafica
      };

      const response = await fetch('http://localhost:8000/finanzas/reportes/generar-reporte-ventas', {
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
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
              {[
                { id: 'individual', label: 'Factura Individual' },
                { id: 'evento', label: 'Factura de Evento' },
                { id: 'datos_fiscales', label: 'Agregar Datos Fiscales' }
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
                    disabled={loading || showFiscalForm}
                    className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide text-[#080b14] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                  >
                    {loading ? 'Procesando...' : 'Emitir Factura de Evento'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Formulario Verificación de Datos Fiscales */}
            {activeTab === 'datos_fiscales' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xl font-medium text-white mb-2">Verificar / Agregar Datos Fiscales</h2>
                <p className="text-sm text-white/40 mb-8">Verifica si un cliente tiene sus datos fiscales completos antes de facturar.</p>

                <form onSubmit={handleCheckFiscales} className="flex gap-4 items-end mb-8">
                  <div className="flex-1">
                    <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">ID del Cliente *</label>
                    <input
                      type="number"
                      min="1"
                      value={checkClienteId}
                      onChange={(e) => setCheckClienteId(e.target.value)}
                      placeholder="Ej. 1"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50]/50 focus:ring-1 focus:ring-[#ff4e50]/50 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl font-medium tracking-wide text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Buscando...' : 'Verificar'}
                  </button>
                </form>

                {clienteFiscalInfo && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-6 rounded-xl border border-white/10 bg-white/5">
                    <h3 className="text-lg font-medium text-white mb-2">Cliente: {clienteFiscalInfo.cliente.nombre}</h3>
                    
                    {clienteFiscalInfo.validacion.valido ? (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                        <p className="font-medium flex items-center gap-2">✓ El cliente ya cuenta con datos fiscales completos.</p>
                        <ul className="mt-2 text-sm text-green-400/80">
                          <li>RFC: {clienteFiscalInfo.cliente.rfc}</li>
                          <li>C.P.: {clienteFiscalInfo.cliente.codigo_postal}</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-[#ff4e50]/10 border border-[#ff4e50]/20">
                        <p className="font-medium text-[#ff4e50] mb-4">El cliente NO tiene datos fiscales completos. Faltan los siguientes datos:</p>
                        
                        <form onSubmit={handleUpdateFiscalesTab} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-1 block">RFC *</label>
                              <input
                                type="text"
                                value={fiscalData.rfc || clienteFiscalInfo.cliente.rfc || ''}
                                onChange={(e) => setFiscalData({ ...fiscalData, rfc: e.target.value })}
                                placeholder="Ej: JUPR900101XYZ"
                                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50] transition-all"
                                required
                                minLength={13}
                                maxLength={13}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-1 block">Código Postal *</label>
                              <input
                                type="text"
                                value={fiscalData.codigo_postal || clienteFiscalInfo.cliente.codigo_postal || ''}
                                onChange={(e) => setFiscalData({ ...fiscalData, codigo_postal: e.target.value })}
                                placeholder="Ej: 12345"
                                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50] transition-all"
                                required
                                minLength={5}
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 px-6 py-2.5 rounded-lg font-medium text-[#080b14] w-full disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                          >
                            {loading ? 'Guardando...' : 'Guardar Datos Fiscales'}
                          </button>
                        </form>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Formulario de Datos Fiscales */}
            {showFiscalForm && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 rounded-xl border border-[#ff4e50]/50 bg-[#ff4e50]/10">
                <h3 className="text-lg font-medium text-[#ff4e50] mb-2">Completar Datos Fiscales</h3>
                <p className="text-sm text-white/70 mb-4">El cliente {fiscalData.id_cliente} necesita actualizar su información para poder facturar.</p>
                <form onSubmit={handleUpdateFiscales} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-1 block">RFC *</label>
                      <input
                        type="text"
                        value={fiscalData.rfc}
                        onChange={(e) => setFiscalData({ ...fiscalData, rfc: e.target.value })}
                        placeholder="Ej: JUPR900101XYZ"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50] transition-all"
                        required
                        minLength={13}
                        maxLength={13}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-1 block">Código Postal *</label>
                      <input
                        type="text"
                        value={fiscalData.codigo_postal}
                        onChange={(e) => setFiscalData({ ...fiscalData, codigo_postal: e.target.value })}
                        placeholder="Ej: 12345"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#ff4e50] transition-all"
                        required
                        minLength={5}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowFiscalForm(false)}
                      className="px-6 py-2.5 rounded-lg font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#ff4e50] hover:bg-[#ff4e50]/80 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar y Continuar'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Vista de Factura Generada */}
            {facturaGenerada && !showFiscalForm && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #ff4e50, #f9a825)' }}></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "'Bebas Neue', cursive" }}>FACTURA #{facturaGenerada.id_factura}</h3>
                    <p className="text-sm text-white/50">{new Date(facturaGenerada.fecha).toLocaleString()}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider">
                    {facturaGenerada.estado}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-white/40 uppercase text-xs mb-1">Tipo</p>
                    <p className="text-white font-medium capitalize">{facturaGenerada.tipo_factura.replace('_', ' ')}</p>
                  </div>
                  {facturaGenerada.cliente && (
                    <div>
                      <p className="text-white/40 uppercase text-xs mb-1">Cliente</p>
                      <p className="text-white font-medium">{facturaGenerada.cliente.nombre} (ID: {facturaGenerada.cliente.id})</p>
                    </div>
                  )}
                  {facturaGenerada.tipo_servicio && (
                    <div className="col-span-2">
                      <p className="text-white/40 uppercase text-xs mb-1">Concepto / Servicio</p>
                      <p className="text-white font-medium">{facturaGenerada.tipo_servicio}</p>
                    </div>
                  )}
                  {facturaGenerada.evento && (
                    <div className="col-span-2">
                      <p className="text-white/40 uppercase text-xs mb-1">Evento</p>
                      <p className="text-white font-medium">{facturaGenerada.nombre_evento} (ID: {facturaGenerada.evento.id})</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center mb-6">
                  <span className="text-white/70 uppercase text-xs font-bold tracking-widest">Total a Pagar</span>
                  <span className="text-3xl font-bold text-[#f9a825]">${facturaGenerada.total.toFixed(2)}</span>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const content = `==================================================\nFACTURA #${facturaGenerada.id_factura}\n==================================================\nFecha: ${new Date(facturaGenerada.fecha).toLocaleString()}\nEstado: ${facturaGenerada.estado.toUpperCase()}\nTotal: $${facturaGenerada.total.toFixed(2)}\n==================================================\n${facturaGenerada.tipo_factura === 'factura_individual' ? 'TIPO: Factura Individual\nServicio: ' + facturaGenerada.tipo_servicio : 'TIPO: Factura de Evento\nEvento: ' + facturaGenerada.nombre_evento}\n${facturaGenerada.cliente ? 'Cliente: ' + facturaGenerada.cliente.nombre : ''}\n==================================================`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `factura_${facturaGenerada.id_factura}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    <FileText size={18} /> Descargar PDF (TXT)
                  </button>
                  <button 
                    onClick={() => setFacturaGenerada(null)}
                    className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white/70 rounded-xl font-medium transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={consulta.fechaInicio}
                    onChange={(e) => setConsulta({ ...consulta, fechaInicio: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#f9a825]/50 focus:ring-1 focus:ring-[#f9a825]/50 transition-all [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2 block">Fecha Fin *</label>
                  <input
                    type="date"
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

                {/* CONTENEDOR DE GRÁFICA */}
                <div className="mt-8 h-80 w-full bg-black/20 rounded-xl border border-white/5 p-4">
                  {datosReporte.datos?.tipoGrafica === 'Barras' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosReporte.datos?.detalle || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="fecha" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                        <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#080b14', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Legend />
                        <Bar dataKey="total" fill="#f9a825" name="Ventas ($)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {datosReporte.datos?.tipoGrafica === 'Lineas' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={datosReporte.datos?.detalle || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="fecha" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                        <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                        <Tooltip contentStyle={{ backgroundColor: '#080b14', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#f9a825" strokeWidth={3} name="Ventas ($)" dot={{ fill: '#ff4e50', strokeWidth: 2, r: 6 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {datosReporte.datos?.tipoGrafica === 'Pastel' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip contentStyle={{ backgroundColor: '#080b14', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Legend />
                        <Pie
                          data={datosReporte.datos?.detalle || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={110}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="total"
                          nameKey="fecha"
                          label={({ fecha, percent }) => `${fecha} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {(datosReporte.datos?.detalle || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={['#f9a825', '#ff4e50', '#8884d8', '#82ca9d'][index % 4]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
