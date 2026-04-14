// frontend/src/app/page.tsx
'use client'; // Necesario para la interactividad del dropdown de perfil

import { useState } from 'react';
import Link from 'next/link';

// Componentes de iconos rápidos (puedes usar librerías como Heroicons)
const Icons = {
  Dashboard: () => <span className="text-xl">📊</span>,
  Schedule: () => <span className="text-xl">📅</span>,
  Movies: () => <span className="text-xl">🎬</span>,
  Sales: () => <span className="text-xl">🎟️</span>,
  Staff: () => <span className="text-xl">👥</span>,
  Settings: () => <span className="text-xl">⚙️</span>,
  Search: () => <span className="text-xl">🔍</span>,
  Bell: () => <span className="text-xl">🔔</span>,
  User: () => <span className="text-xl">👤</span>,
};

// Rutas de navegación basadas en la estructura que creamos
const navItems = [
  { name: 'Dashboard', href: '/', icon: Icons.Dashboard },
  { name: 'Schedule', href: '/cartelera', icon: Icons.Schedule },
  { name: 'Movies', href: '/cartelera/peliculas', icon: Icons.Movies },
  { name: 'Sales', href: '/taquilla', icon: Icons.Sales },
  { name: 'Staff', href: '/operaciones/personal', icon: Icons.Staff },
  { name: 'Settings', href: '/admin/configuracion', icon: Icons.Settings },
];

export default function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    // CONTENEDOR PRINCIPAL - Fondo oscuro (como tus imágenes)
    <div className="min-h-screen bg-[#111827] text-white flex">
      
      {/* 1. SIDEBAR (Replica de image_0.png) */}
      <aside className="w-64 bg-[#1f2937] p-6 flex flex-col border-r border-gray-700">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-10 text-center">
          Nexo Cinema
        </h1>
        <nav className="space-y-4 flex-grow">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} 
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                item.name === 'Dashboard' ? 'bg-[#374151] text-purple-400' : 'hover:bg-[#374151]'
              }`}>
              <item.icon />
              <span className="font-medium text-gray-100">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* CONTENIDO DERECHO */}
      <main className="flex-1 flex flex-col">
        
        {/* 2. HEADER (Replica de image_2.png) */}
        <header className="bg-[#1f2937] p-4 flex items-center justify-between border-b border-gray-700">
          {/* Búsqueda */}
          <div className="relative w-1/3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Search /></span>
            <input type="text" placeholder="Search..." className="w-full bg-[#374151] rounded-full py-2 pl-10 pr-4 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          {/* Iconos de usuario */}
          <div className="flex items-center gap-6 relative">
            <button className="text-gray-400 hover:text-white"><Icons.Bell /></button>
            
            {/* Dropdown de Perfil - Javier Flores */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white text-lg">J</div>
              <div>
                <p className="font-semibold text-gray-100">Javier Flores</p>
                <p className="text-sm text-gray-400">Admin</p>
              </div>
            </div>

            {/* Menú Dropdown (image_2.png detail) */}
            {profileOpen && (
              <div className="absolute right-0 top-14 w-48 bg-[#1f2937] rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                <Link href="/perfil" className="block px-4 py-2 hover:bg-[#374151]">View Profile</Link>
                <Link href="/configuracion" className="block px-4 py-2 hover:bg-[#374151]">Settings</Link>
                <hr className="border-gray-700 my-1" />
                <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#374151]">Log out</button>
              </div>
            )}
          </div>
        </header>

        {/* 3. CONTENIDO PRINCIPAL (Replica de image_0.png) */}
        <div className="flex-1 p-8 space-y-8">
          <h2 className="text-4xl font-bold text-gray-100">Welcome, Javier!</h2>

          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[ { title: 'Active Movies', value: 12 }, { title: 'Total Shows Today', value: 34 }, { title: 'Bookings', value: 215 }, { title: 'Revenue (MXN)', value: '$18,450' }
            ].map((card) => (
              <div key={card.title} className="bg-[#1f2937] p-6 rounded-2xl shadow-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">{card.title}</p>
                <p className="text-4xl font-extrabold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Sección inferior - Horario del día */}
          <section className="bg-[#1f2937] p-6 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-100 mb-6">Today's Schedule</h3>
            <div className="text-gray-400 italic">Aquí Javier programará la tabla de funciones (CU-01).</div>
          </section>
        </div>
      </main>
    </div>
  );
}