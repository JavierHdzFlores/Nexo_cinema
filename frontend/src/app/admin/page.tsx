'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerOverlay}></div>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <span style={styles.logoEmoji}>🎬</span>
            </div>
            <div style={styles.logoText}>
              <h1 style={styles.title}>NEXO CINEMA</h1>
              <p style={styles.subtitle}>Generador de Facturas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('individual')}
            style={{
              ...styles.tab,
              ...(activeTab === 'individual' ? styles.tabActive : styles.tabInactive),
            }}
          >
            <span style={styles.tabIcon}></span>
            <div>
              <span style={styles.tabTitle}>Factura Individual</span>
              <span style={styles.tabDesc}>Servicios individuales</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('evento')}
            style={{
              ...styles.tab,
              ...(activeTab === 'evento' ? styles.tabActive : styles.tabInactive),
            }}
          >
            <span style={styles.tabIcon}></span>
            <div>
              <span style={styles.tabTitle}>Factura de Evento</span>
              <span style={styles.tabDesc}>Eventos y proyecciones</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'individual' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Crear Factura Individual</h2>
            <p style={styles.sectionDesc}>Genera facturas para servicios específicos</p>

            <form onSubmit={handleCreateIndividual} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Servicio *</label>
                <input
                  type="text"
                  value={individual.tipo_servicio}
                  onChange={(e) => setIndividual({ ...individual, tipo_servicio: e.target.value })}
                  placeholder="Ej: Entrada VIP, Combo Dulcería, Operación..."
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>ID Cliente (opcional)</label>
                  <input
                    type="number"
                    value={individual.id_cliente}
                    onChange={(e) => setIndividual({ ...individual, id_cliente: e.target.value })}
                    placeholder="ID del cliente"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>ID Venta (opcional)</label>
                  <input
                    type="number"
                    value={individual.id_venta}
                    onChange={(e) => setIndividual({ ...individual, id_venta: e.target.value })}
                    placeholder="ID de la venta"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>ID Gerente *</label>
                <input
                  type="number"
                  value={individual.id_gerente}
                  onChange={(e) => setIndividual({ ...individual, id_gerente: e.target.value })}
                  placeholder="ID del gerente autorizado"
                  style={styles.input}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
              >
                {loading ? ' Generando...' : ' Crear Factura Individual'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'evento' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Crear Factura de Evento</h2>
            <p style={styles.sectionDesc}>Facturación para proyecciones y eventos privados</p>

            <form onSubmit={handleCreateEvento} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ID Evento *</label>
                <input
                  type="number"
                  value={evento.id_evento}
                  onChange={(e) => setEvento({ ...evento, id_evento: e.target.value })}
                  placeholder="ID del evento"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>ID Cliente (opcional)</label>
                  <input
                    type="number"
                    value={evento.id_cliente}
                    onChange={(e) => setEvento({ ...evento, id_cliente: e.target.value })}
                    placeholder="ID del cliente"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>ID Gerente *</label>
                  <input
                    type="number"
                    value={evento.id_gerente}
                    onChange={(e) => setEvento({ ...evento, id_gerente: e.target.value })}
                    placeholder="ID del gerente autorizado"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
              >
                {loading ? ' Generando...' : ' Crear Factura de Evento'}
              </button>
            </form>
          </div>
        )}

        {mensaje && (
          <div
            style={{
              ...styles.message,
              ...(mensaje.includes('✓') ? styles.successMessage : styles.errorMessage),
            }}
          >
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = {
  container: {
    minHeight: '100vh',
    background: `
      radial-gradient(ellipse at top, rgba(229, 9, 20, 0.15) 0%, transparent 50%),
      linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)
    `,
    color: '#fff',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    overflowX: 'hidden',
  } as React.CSSProperties,

  header: {
    position: 'relative',
    background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '60px 30px',
    borderBottom: '3px solid #e50914',
    boxShadow: '0 10px 40px rgba(229, 9, 20, 0.3)',
    overflow: 'hidden',
  } as React.CSSProperties,

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(229, 9, 20, 0.1) 0%, transparent 50%, rgba(229, 9, 20, 0.05) 100%)',
    pointerEvents: 'none',
  } as React.CSSProperties,

  headerContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  } as React.CSSProperties,

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  } as React.CSSProperties,

  logoIcon: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #e50914 0%, #ff1a1a 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(229, 9, 20, 0.4)',
    border: '3px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,

  logoEmoji: {
    fontSize: '28px',
  } as React.CSSProperties,

  logoText: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '900',
    color: '#fff',
    textShadow: '0 4px 20px rgba(229, 9, 20, 0.5)',
    letterSpacing: '2px',
  } as React.CSSProperties,

  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    letterSpacing: '1px',
  } as React.CSSProperties,

  // Tabs
  tabsContainer: {
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(229, 9, 20, 0.2)',
  } as React.CSSProperties,

  tabs: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '0',
  } as React.CSSProperties,

  tab: {
    flex: 1,
    padding: '20px 30px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderBottom: '4px solid transparent',
  } as React.CSSProperties,

  tabActive: {
    background: 'rgba(229, 9, 20, 0.1)',
    borderBottom: '4px solid #e50914',
  } as React.CSSProperties,

  tabInactive: {
    background: 'transparent',
  } as React.CSSProperties,

  tabIcon: {
    fontSize: '24px',
  } as React.CSSProperties,

  tabTitle: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
  } as React.CSSProperties,

  tabDesc: {
    display: 'block',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '2px',
  } as React.CSSProperties,

  // Content
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 30px',
  } as React.CSSProperties,

  section: {
    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.9) 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(229, 9, 20, 0.2)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: '40px',
  } as React.CSSProperties,

  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    textShadow: '0 2px 10px rgba(229, 9, 20, 0.2)',
  } as React.CSSProperties,

  sectionDesc: {
    margin: '0 0 30px 0',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
  } as React.CSSProperties,

  // Form
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  } as React.CSSProperties,

  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  } as React.CSSProperties,

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e50914',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  input: {
    padding: '14px 16px',
    border: '2px solid rgba(229, 9, 20, 0.2)',
    borderRadius: '10px',
    fontSize: '15px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties,

  button: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #e50914 0%, #ff1a1a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 8px 25px rgba(229, 9, 20, 0.3)',
    marginTop: '10px',
  } as React.CSSProperties,

  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  } as React.CSSProperties,

  message: {
    marginTop: '30px',
    padding: '16px 20px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    border: '2px solid',
    animation: 'slideDown 0.3s ease',
  } as React.CSSProperties,

  successMessage: {
    background: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
    color: '#81C784',
  } as React.CSSProperties,

  errorMessage: {
    background: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#F44336',
    color: '#EF5350',
  } as React.CSSProperties,
};
