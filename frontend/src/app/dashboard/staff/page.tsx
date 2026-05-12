'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Film, LogOut, BarChart3, Users, Package, Calendar, Clock, AlertCircle, Ticket } from 'lucide-react';
import { useRouter } from "next/navigation";

interface Usuario{
  nombre: string;
  correo: string;
  puesto:  string;
  turno: string;
}

export default function StaffDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ventas' | 'turnos' | 'inventario'>('ventas');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPuesto, setUserPuesto] = useState<string | null>(null);
  const [inventario, setInventario] = useState<any[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newProduct, setNewProduct] = useState({ nombre: '', precio: 0, stock_actual: 0 });
  const [updateData, setUpdateData] = useState({ id_articulo: 0, cantidad: 0, motivo: 'compra' });

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const fetchInventario = async () => {
    try {
      const res = await fetch("http://localhost:8000/dulceria/productos");
      const data = await res.json();
      setInventario(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };
  useEffect(() => {
    // Esta función se ejecuta apenas carga la página
    const obtenerPerfil = async () => {
      try {
        // 1. Buscamos el token en el almacenamiento local
        const token = localStorage.getItem("token");

        // Si no hay token, lo mandamos de patitas a la calle (al login)
        if (!token) {
          router.push("/");
          return;
        }

        // 2. Hacemos la petición al backend (ajusta la URL a tu endpoint)
        const respuesta = await fetch("http://localhost:8000/api/auth/meEmpleado", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // AQUÍ ESTÁ LA MAGIA: Le mandamos el token al backend
            "Authorization": `Bearer ${token}` 
          },
        });

        if (!respuesta.ok) {
          // Si el token expiró o es inválido, lo sacamos
          localStorage.removeItem("token");
          router.push("/");
          throw new Error("Sesión inválida");
        }

        // 3. Guardamos los datos reales en el estado
        const datos = await respuesta.json();
        setUsuario(datos);
        
        // 4. Actualizamos el rol y puesto del usuario
        if (datos.tipo_usuario) {
          setUserRole(datos.tipo_usuario);
        }
        if (datos.puesto) {
          setUserPuesto(datos.puesto.toLowerCase());
        }

      } catch (error) {
        console.error("Error al obtener perfil:", error);
      } finally {
        setCargando(false); // Quitamos la pantalla de carga
      }
    };

    obtenerPerfil();
  }, [router]);


  useEffect(() => {
    //relizamos una peticion al backend
    if (typeof window !== "undefined") {
      const role = localStorage.getItem('role');
      setUserRole(role);
      const puesto = localStorage.getItem('puesto');
      setUserPuesto(puesto ? puesto.toLowerCase() : null);
      if (puesto?.toLowerCase() === 'almacenista') {
        setActiveTab('inventario');
        fetchInventario();
      } else if (role === 'gerente'|| 'Gerente') {
        setActiveTab('turnos');
      }
    }
  }, []);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:8000/dulceria/productos/${updateData.id_articulo}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: updateData.cantidad, motivo: updateData.motivo })
      });
      fetchInventario();
      alert("Stock actualizado");
      setUpdateData({ id_articulo: 0, cantidad: 0, motivo: 'compra' });
    } catch (e) { alert("Error al actualizar"); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:8000/dulceria/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProduct, stock_minimo: 10, tipo_articulo: 'producto_individual' })
      });
      setIsAddingNew(false);
      setNewProduct({ nombre: '', precio: 0, stock_actual: 0 });
      fetchInventario();
      alert("Producto agregado");
    } catch (e) { alert("Error al agregar producto"); }
  };

  // Datos simulados
  const stats = userPuesto === 'almacenista' ? [
    { label: 'Eficiencia', value: '98%', icon: AlertCircle, color: '#4ade80' },
    { label: 'Turno Actual', value: 'Activo', icon: Clock, color: '#8884d8' },
  ] : [
    { label: 'Ventas de Hoy', value: '$1,250.00', icon: BarChart3, color: '#f9a825' },
    { label: 'Atenciones Realizadas', value: '18', icon: Users, color: '#ff4e50' },
    { label: 'Eficiencia', value: '98%', icon: AlertCircle, color: '#4ade80' },
    { label: 'Turno Actual', value: 'Activo', icon: Clock, color: '#8884d8' },
  ];

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
            <span className="text-white/40 text-sm font-medium">Dashboard {usuario?.puesto}</span>
          </Link>

          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* ═════════ BODY ═════════ */}
      <main className="max-w-[1800px] mx-auto px-8 py-12">
        {/* Título */}
        <div className="mb-12">
          <h1
            className="text-5xl font-semibold text-white mb-2"
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.05em' }}
          >
            Bienvenido, {usuario?.nombre}
          </h1>
          <p className="text-white/40 font-light mb-8">
            Panel de control para gestión operacional.
          </p>

          {/* ── Accesos Rápidos ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Empleados (Taquilla, Dulcería) o Gerentes */}
            {(usuario?.puesto === 'empleado' && userPuesto !== 'almacenista') && (
              <>
                <Link href="/taquilla" className="flex flex-col items-center justify-center p-6 rounded-2xl transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #ff4e50, #E50914)', boxShadow: '0 8px 30px rgba(229,9,20,0.3)' }}>
                  <Ticket size={32} className="text-white mb-3" />
                  <span className="text-white font-semibold tracking-wider uppercase text-sm font-sans">Taquilla</span>
                </Link>
                
                <Link href="/dulceria" className="flex flex-col items-center justify-center p-6 rounded-2xl transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f9a825, #ffb94a)', boxShadow: '0 8px 30px rgba(249,168,37,0.3)' }}>
                  <Package size={32} className="text-black mb-3" />
                  <span className="text-black font-semibold tracking-wider uppercase text-sm font-sans">Dulcería</span>
                </Link>
              </>
            )}

            {/* Solo Gerentes */}
            {usuario?.puesto === 'Gerente' && (
              <>
                <Link href="/renta" className="flex flex-col items-center justify-center p-6 rounded-2xl transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', boxShadow: '0 8px 30px rgba(74,222,128,0.3)' }}>
                  <Calendar size={32} className="text-black mb-3" />
                  <span className="text-black font-semibold tracking-wider uppercase text-sm font-sans">Renta de sala</span>
                </Link>
                
                <Link href="/corporativos" className="flex flex-col items-center justify-center p-6 rounded-2xl transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #8884d8, #6366f1)', boxShadow: '0 8px 30px rgba(136,132,216,0.3)' }}>
                  <Users size={32} className="text-white mb-3" />
                  <span className="text-white font-semibold tracking-wider uppercase text-sm font-sans">Corporativo</span>
                </Link>
                
                <Link href="/admin" className="flex flex-col items-center justify-center p-6 rounded-2xl transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}>
                  <BarChart3 size={32} className="text-white mb-3" />
                  <span className="text-white font-semibold tracking-wider uppercase text-sm font-sans">Panel Admin (Ventas y Facturas)</span>
                </Link>

                <Link href="/funciones" className="flex flex-col items-center justify-center p-6 rounded-2xl transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f9a825, #ffb94a)', boxShadow: '0 8px 30px rgba(249,168,37,0.3)' }}>
                  <Package size={32} className="text-black mb-3" />
                  <span className="text-black font-semibold tracking-wider uppercase text-sm font-sans">Programar nueva funcion</span>
                </Link>
              </>
            )}

            {/* Solo Almacenistas */}
            {usuario?.puesto === 'almacenista' && (
              <button onClick={() => setActiveTab('inventario')} className="flex flex-col items-center justify-center p-6 rounded-2xl transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #f9a825, #ffb94a)', boxShadow: '0 8px 30px rgba(249,168,37,0.3)' }}>
                <Package size={32} className="text-black mb-3" />
                <span className="text-black font-semibold tracking-wider uppercase text-sm font-sans">Ingresar Inventario</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Cards de Estadísticas ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-white/8 hover:border-white/15 transition-all"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${stat.color}15` }}
                  >
                    <Icon size={20} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Tabs de Secciones ── */}
        <nav className="flex items-center gap-1 p-1 rounded-xl w-fit mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Para el almacenista, mostramos solo la pestaña de Inventario */}
          {userPuesto === 'almacenista' && (
            <button
              onClick={() => setActiveTab('inventario')}
              className="relative px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              style={{ color: activeTab === 'inventario' ? '#000' : 'rgba(255,255,255,0.4)' }}
            >
              {activeTab === 'inventario' && (
                <motion.span
                  layoutId="staff-tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                />
              )}
              <Package size={16} className="relative z-10" />
              <span className="relative z-10">Inventario DB</span>
            </button>
          )}

          {/* Para el resto de empleados o gerentes */}
          {usuario?.puesto !== 'almacenista' && [
            ...(usuario?.puesto === 'gerente' ? [] : [{ id: 'ventas', label: 'Ventas de Hoy', icon: Users }]),
            { id: 'turnos', label: 'Mis Turnos', icon: Calendar }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="relative px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                style={{ color: isActive ? '#000' : 'rgba(255,255,255,0.4)' }}
              >
                {isActive && (
                  <motion.span
                    layoutId="staff-tab-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Contenido de Ventas ── */}
        {activeTab === 'ventas' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-xl font-semibold text-white mb-6">Ventas de Hoy y Atenciones Realizadas</h2>
              <div className="space-y-4">
                {[
                  { id: 'V001', cliente: 'Juan Pérez', monto: '$125.00', hora: '14:30', tipo: 'Taquilla' },
                  { id: 'V002', cliente: 'María García', monto: '$89.50', hora: '14:15', tipo: 'Dulcería' },
                  { id: 'V003', cliente: 'Carlos López', monto: '$200.00', hora: '13:50', tipo: 'Taquilla' },
                  { id: 'V004', cliente: 'Ana Torres', monto: '$45.00', hora: '13:10', tipo: 'Dulcería' },
                ].map((trans, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{trans.cliente}</p>
                      <p className="text-xs text-white/40">{trans.tipo} • {trans.hora}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#f9a825]">{trans.monto}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Contenido de Inventario (Solo Almacenistas) ── */}
        {activeTab === 'inventario' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Tabla de Inventario Actual */}
            <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Inventario Actual</h2>
                <button onClick={() => setIsAddingNew(!isAddingNew)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-white/10 hover:bg-white/20 text-white">
                  {isAddingNew ? 'Cancelar' : '+ Nuevo Producto'}
                </button>
              </div>

              {isAddingNew && (
                <form className="mb-8 p-4 rounded-xl border border-[#f9a825]/30 bg-[#f9a825]/5 space-y-4" onSubmit={handleAddProduct}>
                  <h3 className="text-lg font-medium text-[#f9a825]">Agregar Nuevo Producto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Nombre</label>
                      <input type="text" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} className="w-full bg-[#080b14] border border-white/10 rounded-lg p-2 text-white" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Precio</label>
                      <input type="number" step="0.01" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: parseFloat(e.target.value)})} className="w-full bg-[#080b14] border border-white/10 rounded-lg p-2 text-white" required />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Stock Inicial</label>
                      <input type="number" value={newProduct.stock_actual} onChange={e => setNewProduct({...newProduct, stock_actual: parseInt(e.target.value)})} className="w-full bg-[#080b14] border border-white/10 rounded-lg p-2 text-white" required />
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-[#f9a825] text-black rounded-lg font-semibold text-sm">Guardar Nuevo Producto</button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Stock Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventario.map((item) => (
                      <tr key={item.id_articulo} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">{item.id_articulo}</td>
                        <td className="px-4 py-3 font-medium text-white">{item.nombre}</td>
                        <td className="px-4 py-3">${item.precio}</td>
                        <td className="px-4 py-3">
                          <span className={item.stock_actual < item.stock_minimo ? "text-red-400 font-bold" : "text-green-400"}>
                            {item.stock_actual}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {inventario.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-3 text-center text-white/40">No hay productos en el inventario.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formulario de Modificación de Stock */}
            <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-xl font-semibold text-white mb-6">Ajustar Stock Existente</h2>
              <form className="space-y-6" onSubmit={handleUpdateStock}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Producto</label>
                    <select value={updateData.id_articulo} onChange={e => setUpdateData({...updateData, id_articulo: parseInt(e.target.value)})} className="w-full bg-[#080b14] border border-white/10 rounded-lg p-3 text-white focus:border-[#f9a825]" required>
                      <option value={0}>Seleccionar producto...</option>
                      {inventario.map(item => (
                        <option key={item.id_articulo} value={item.id_articulo}>{item.nombre} (Stock: {item.stock_actual})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Cantidad</label>
                    <input type="number" value={updateData.cantidad} onChange={e => setUpdateData({...updateData, cantidad: parseInt(e.target.value)})} className="w-full bg-[#080b14] border border-white/10 rounded-lg p-3 text-white focus:border-[#f9a825]" min="1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Movimiento</label>
                    <select value={updateData.motivo} onChange={e => setUpdateData({...updateData, motivo: e.target.value})} className="w-full bg-[#080b14] border border-white/10 rounded-lg p-3 text-white focus:border-[#f9a825]">
                      <option value="compra">Agregar (+)</option>
                      <option value="merma">Descontar / Merma (-)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={updateData.id_articulo === 0} className="w-full md:w-auto px-8 py-3 rounded-lg font-semibold text-black transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100" style={{ background: 'linear-gradient(135deg, #f9a825, #ffb94a)' }}>
                  <Package size={18} />
                  Actualizar Stock
                </button>
              </form>
            </div>

          </motion.div>
        )}

        {/* ── Contenido de Turnos ── */}
        {activeTab === 'turnos' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-xl font-semibold text-white mb-6">Mis Turnos</h2>
            <div className="space-y-4">
              {[
                { fecha: 'Hoy', hora: '09:00 - 17:00', estado: 'Activo' },
                { fecha: 'Mañana', hora: '17:00 - 01:00', estado: 'Programado' },
                { fecha: '12 May', hora: '09:00 - 17:00', estado: 'Programado' },
              ].map((turno, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{turno.fecha}</p>
                    <p className="text-xs text-white/40">{turno.hora}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${turno.estado === 'Activo'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-white/60'
                    }`}>
                    {turno.estado}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
