


'use client';

import { useState, useEffect } from 'react';

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
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      {/* Header */}
      <div className="text-center max-w-3xl mb-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-6">
          Nexo Cinema
        </h1>
        <p className="text-xl text-gray-300 mb-10">
          Panel de Administración - Finanzas y Reportes
        </p>
      </div>

      {/* Secciones Principales */}
      <div className="w-full max-w-4xl">
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setActiveSection('factura')}
            className={`px-6 py-3 mx-2 rounded-lg font-semibold transition-all duration-300 ${
              activeSection === 'factura'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📄 Generar Factura
          </button>
          <button
            onClick={() => setActiveSection('ventas')}
            className={`px-6 py-3 mx-2 rounded-lg font-semibold transition-all duration-300 ${
              activeSection === 'ventas'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📊 Consultar Ventas
          </button>
        </div>

        {/* Contenido de Generar Factura */}
        {activeSection === 'factura' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
            {/* Sub-tabs para tipos de factura */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setActiveTab('individual')}
                className={`px-4 py-2 mx-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'individual'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Factura Individual
              </button>
              <button
                onClick={() => setActiveTab('evento')}
                className={`px-4 py-2 mx-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'evento'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Factura de Evento
              </button>
            </div>

            {/* Formulario Individual */}
            {activeTab === 'individual' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-red-400">Crear Factura Individual</h2>
                <p className="text-gray-400 mb-6">Genera facturas para servicios específicos</p>

                <form onSubmit={handleCreateIndividual} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-300 mb-1">Tipo de Servicio *</label>
                    <input
                      type="text"
                      value={individual.tipo_servicio}
                      onChange={(e) => setIndividual({ ...individual, tipo_servicio: e.target.value })}
                      placeholder="Ej: Entrada VIP, Combo Dulcería, Operación..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-300 mb-1">ID Cliente (opcional)</label>
                      <input
                        type="number"
                        value={individual.id_cliente}
                        onChange={(e) => setIndividual({ ...individual, id_cliente: e.target.value })}
                        placeholder="ID del cliente"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-red-300 mb-1">ID Venta (opcional)</label>
                      <input
                        type="number"
                        value={individual.id_venta}
                        onChange={(e) => setIndividual({ ...individual, id_venta: e.target.value })}
                        placeholder="ID de la venta"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-red-300 mb-1">ID Gerente *</label>
                    <input
                      type="number"
                      value={individual.id_gerente}
                      onChange={(e) => setIndividual({ ...individual, id_gerente: e.target.value })}
                      placeholder="ID del gerente autorizado"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                    }`}
                  >
                    {loading ? 'Generando...' : 'Crear Factura Individual'}
                  </button>
                </form>
              </div>
            )}

            {/* Formulario Evento */}
            {activeTab === 'evento' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-red-400">Crear Factura de Evento</h2>
                <p className="text-gray-400 mb-6">Facturación para proyecciones y eventos privados</p>

                <form onSubmit={handleCreateEvento} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-300 mb-1">ID Evento *</label>
                    <input
                      type="number"
                      value={evento.id_evento}
                      onChange={(e) => setEvento({ ...evento, id_evento: e.target.value })}
                      placeholder="ID del evento"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-300 mb-1">ID Cliente (opcional)</label>
                      <input
                        type="number"
                        value={evento.id_cliente}
                        onChange={(e) => setEvento({ ...evento, id_cliente: e.target.value })}
                        placeholder="ID del cliente"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-red-300 mb-1">ID Gerente *</label>
                      <input
                        type="number"
                        value={evento.id_gerente}
                        onChange={(e) => setEvento({ ...evento, id_gerente: e.target.value })}
                        placeholder="ID del gerente autorizado"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                    }`}
                  >
                    {loading ? 'Generando...' : 'Crear Factura de Evento'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Contenido de Consultar Ventas */}
        {activeSection === 'ventas' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Consultar Ventas</h2>
            <p className="text-gray-400 mb-6">Módulo en desarrollo - Próximamente disponible</p>
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500">Aquí podrás consultar y analizar todas las ventas realizadas en el sistema.</p>
          </div>
        )}

        {/* Mensaje */}
        {mensaje && (
          <div
            className={`mt-6 p-4 rounded-lg font-semibold ${
              mensaje.includes('✓')
                ? 'bg-green-900 border border-green-700 text-green-300'
                : 'bg-red-900 border border-red-700 text-red-300'
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>
    </main>
  );
}

