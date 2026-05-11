'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Film, LogOut, BarChart3, Users, Package, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<'resumen' | 'ventas' | 'inventario' | 'turnos'>('resumen');

  // Datos simulados
  const stats = [
    { label: 'Ventas del Día', value: '$2,450.00', icon: BarChart3, color: '#f9a825' },
    { label: 'Transacciones', value: '24', icon: Users, color: '#ff4e50' },
    { label: 'Inventario Bajo', value: '3 productos', icon: AlertCircle, color: '#ff6b6b' },
    { label: 'Turno Actual', value: '8h 32m', icon: Clock, color: '#4ade80' },
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
            <span className="text-white/40 text-sm font-medium">Dashboard Staff</span>
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
            Bienvenido, Staff
          </h1>
          <p className="text-white/40 font-light">
            Panel de control para gestión operacional y reportes.
          </p>
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
          {[
            { id: 'resumen', label: 'Resumen', icon: BarChart3 },
            { id: 'ventas', label: 'Ventas', icon: Users },
            { id: 'inventario', label: 'Inventario', icon: Package },
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

        {/* ── Contenido de Resumen ── */}
        {activeTab === 'resumen' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Últimas Transacciones */}
              <div className="lg:col-span-2 p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-xl font-semibold text-white mb-6">Últimas Transacciones</h2>
                <div className="space-y-4">
                  {[
                    { id: 'V001', cliente: 'Juan Pérez', monto: '$125.00', hora: '14:30', tipo: 'Venta' },
                    { id: 'V002', cliente: 'María García', monto: '$89.50', hora: '14:15', tipo: 'Venta' },
                    { id: 'V003', cliente: 'Carlos López', monto: '$200.00', hora: '13:50', tipo: 'Evento' },
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

              {/* Meta del Día */}
              <div className="p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-xl font-semibold text-white mb-6">Meta del Día</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-white/60">Ventas</span>
                      <span className="text-sm font-semibold text-[#f9a825]">65%</span>
                    </div>
                    <div className="w-full h-2 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ background: '#f9a825', width: '65%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-white/60">Atención</span>
                      <span className="text-sm font-semibold text-[#4ade80]">100%</span>
                    </div>
                    <div className="w-full h-2 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ background: '#4ade80', width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-white/60">Satisfacción</span>
                      <span className="text-sm font-semibold text-[#8884d8]">92%</span>
                    </div>
                    <div className="w-full h-2 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ background: '#8884d8', width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Contenido de Ventas ── */}
        {activeTab === 'ventas' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-xl font-semibold text-white mb-6">Reportes de Ventas</h2>
            <p className="text-white/40 text-sm">Módulo de ventas en desarrollo. Acceda a reportes detallados desde el panel de administración.</p>
          </motion.div>
        )}

        {/* ── Contenido de Inventario ── */}
        {activeTab === 'inventario' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-xl font-semibold text-white mb-6">Gestión de Inventario</h2>
            <div className="space-y-4">
              {[
                { nombre: 'Palomitas', stock: 12, alerta: false },
                { nombre: 'Refrescos', stock: 5, alerta: true },
                { nombre: 'Dulces', stock: 8, alerta: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.nombre}</p>
                    {item.alerta && <p className="text-xs text-[#ff6b6b]">Stock bajo</p>}
                  </div>
                  <span className="text-sm font-semibold text-white/60">{item.stock} unidades</span>
                </div>
              ))}
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
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    turno.estado === 'Activo' 
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
