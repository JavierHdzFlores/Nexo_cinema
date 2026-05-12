'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Film, LogOut, Heart, Ticket, Zap, User, Clock } from 'lucide-react';
import { MovieGrid } from "./components/MovieGrid"; 
import { useRouter } from "next/navigation";
  //definimos los datos que esperamos del backend

interface Usuario{
  nombre: string;
  correo: string;
  monedero: number;
  rfc: string;
}
export default function ClienteDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'resumen' | 'compras' | 'reservas' | 'puntos'>('resumen');

  // Datos simulados
  const stats = [
    { label: 'Puntos Disponibles', value: '1,250', icon: Zap, color: '#f9a825' },
    { label: 'Películas Vistas', value: '12', icon: Ticket, color: '#ff4e50' },
    { label: 'Reservas Activas', value: '2', icon: Clock, color: '#4ade80' },
    { label: 'Favoritas', value: '8', icon: Heart, color: '#ff6b6b' },
  ];

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

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
        const respuesta = await fetch("http://localhost:8000/api/auth/me", {
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

      } catch (error) {
        console.error("Error al obtener perfil:", error);
      } finally {
        setCargando(false); // Quitamos la pantalla de carga
      }
    };

    obtenerPerfil();
  }, [router]);

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
            <span className="text-white/40 text-sm font-medium">Mi Cuenta</span>
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
        {/* Encabezado */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1
              className="text-5xl font-semibold text-white mb-2"
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.05em' }}
            >
              Mi Perfil
            </h1>
            <p className="text-white/40 font-light">
              Gestiona tus reservas, puntos y preferencias.
            </p>
          </div>
          <Link href="/cartelera"
            className="px-6 py-3 rounded-xl font-medium text-[#080b14] transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}>
            Ver Cartelera
          </Link>
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
                className="p-6 rounded-xl border border-white/8 hover:border-white/15 transition-all cursor-pointer hover:scale-105"
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
            { id: 'resumen', label: 'Resumen' },
            { id: 'compras', label: 'Mis Compras' },
            { id: 'reservas', label: 'Mis Reservas' },
            { id: 'puntos', label: 'Monedero' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="relative px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: isActive ? '#000' : 'rgba(255,255,255,0.4)' }}
              >
                {isActive && (
                  <motion.span
                    layoutId="cliente-tab-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Contenido de Resumen ── */}
        {activeTab === 'resumen' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información Personal */}
              <div className="lg:col-span-2 p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Mi Información</h2>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10 text-white/60">
                    Editar
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(249,168,37,0.2)' }}>
                      <User size={24} style={{ color: '#f9a825' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Nombre Completo</p>
                      <p className="text-white font-medium">{usuario?.nombre}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">Correo Electrónico</p>
                    <p className="text-white">{usuario?.correo}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.01)' }}>
                      <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">rfc</p>
                      <p className="text-white">{usuario?.rfc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accesos Rápidos */}
              <div className="p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-xl font-semibold text-white mb-6">Accesos Rápidos</h2>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-lg text-left font-medium transition-colors hover:bg-white/10 text-white/80"
                    style={{ background: 'rgba(255,255,255,0.01)' }}>
                    Cambiar Contraseña
                  </button>
                  <button className="w-full p-4 rounded-lg text-left font-medium transition-colors hover:bg-white/10 text-white/80"
                    style={{ background: 'rgba(255,255,255,0.01)' }}>
                    Historial de Transacciones
                  </button>
                  <button className="w-full p-4 rounded-lg text-left font-medium transition-colors hover:bg-white/10 text-white/80"
                    style={{ background: 'rgba(255,255,255,0.01)' }}>
                    Preferencias
                  </button>
                  <button className="w-full p-4 rounded-lg text-left font-medium transition-colors hover:bg-white/10 text-white/80"
                    style={{ background: 'rgba(255,255,255,0.01)' }}>
                    Contactar Soporte
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Contenido de Compras ── */}
        {activeTab === 'compras' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-xl font-semibold text-white mb-6">Mis Compras</h2>
            <div className="space-y-4">
              {[
                { id: 'CMP001', fecha: '10 May 2025', items: 'Entrada Regular x2 + Combo', monto: '$145.00', estado: 'Completada' },
                { id: 'CMP002', fecha: '08 May 2025', items: 'Entrada VIP', monto: '$89.99', estado: 'Completada' },
                { id: 'CMP003', fecha: '05 May 2025', items: 'Combo Dulcería Grande', monto: '$54.50', estado: 'Completada' },
              ].map((compra, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-white">{compra.items}</p>
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">{compra.estado}</span>
                    </div>
                    <p className="text-xs text-white/40">{compra.fecha} • ID: {compra.id}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#f9a825]">{compra.monto}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Contenido de Reservas ── */}
        {activeTab === 'reservas' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-xl font-semibold text-white mb-6">Mis Reservas Activas</h2>
            <div className="space-y-4">
              {[
                { pelicula: 'Dune: Parte Dos', fecha: '15 May 2025', hora: '19:30', sala: 'Sala 1', entradas: 2, estado: 'Confirmada' },
                { pelicula: 'The Matrix Reloaded', fecha: '18 May 2025', hora: '21:00', sala: 'Sala 3', entradas: 1, estado: 'Confirmada' },
              ].map((reserva, i) => (
                <div key={i} className="p-4 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{reserva.pelicula}</p>
                      <p className="text-xs text-white/40 mt-1">{reserva.fecha} • {reserva.hora}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-400">{reserva.estado}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{reserva.sala} • {reserva.entradas} entrada(s)</span>
                    <button className="text-white/40 hover:text-white transition-colors">Descargar Ticket</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Contenido de Monedero ── */}
        {activeTab === 'puntos' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Saldo de Puntos */}
              <div className="lg:col-span-2 p-8 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(249,168,37,0.1), rgba(255,78,80,0.05))', border: '1px solid rgba(249,168,37,0.2)' }}>
                <h2 className="text-xl font-semibold text-white mb-6">Mi Monedero de Puntos</h2>
                <div className="p-6 rounded-xl mb-6" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(249,168,37,0.3)' }}>
                  <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Saldo Disponible</p>
                  <p className="text-5xl font-bold text-[#f9a825]">1,250</p>
                  <p className="text-xs text-white/40 mt-2">Equivalente a $62.50</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Historial de Movimientos</h3>
                    {[
                      { tipo: '+250 pts', desc: 'Compra de Entrada Regular', fecha: '10 May' },
                      { tipo: '-100 pts', desc: 'Canje en Combo Dulcería', fecha: '08 May' },
                      { tipo: '+500 pts', desc: 'Promoción Cumpleaños', fecha: '01 May' },
                    ].map((mov, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg text-sm"
                        style={{ background: 'rgba(255,255,255,0.01)' }}>
                        <div className="flex-1">
                          <p className="text-white/80">{mov.desc}</p>
                          <p className="text-xs text-white/40">{mov.fecha}</p>
                        </div>
                        <span className={mov.tipo.startsWith('+') ? 'text-green-400 font-semibold' : 'text-[#f9a825] font-semibold'}>
                          {mov.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cómo Usar Puntos */}
              <div className="p-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Cómo Usar Puntos</h2>
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <p className="font-medium text-white/80">50 pts</p>
                    <p className="text-xs text-white/40">Descuento en Entrada</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <p className="font-medium text-white/80">100 pts</p>
                    <p className="text-xs text-white/40">Combo Dulcería Gratis</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <p className="font-medium text-white/80">250 pts</p>
                    <p className="text-xs text-white/40">Entrada VIP Gratis</p>
                  </div>
                  <button className="w-full mt-4 py-2 rounded-lg font-medium transition-all"
                    style={{ background: 'linear-gradient(135deg, #ff4e50, #f9a825)', color: '#000' }}>
                    Canjear Puntos
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <MovieGrid />
      </main>
    </div>
  );
}
