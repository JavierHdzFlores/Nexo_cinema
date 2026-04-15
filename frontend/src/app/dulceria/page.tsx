'use client';

import React from 'react';
import { useCart } from './layout';
import Link from 'next/link';

export default function DulceriaMainPage() {
  const { agregarProducto } = useCart();

  // Ofertas simuladas
  const ofertas = [
    { id: 901, nombre: "Mega Combo Estreno", precio: 350, desc: "2 Palomitas G + 2 Refrescos G + 1 Nachos + 1 Dulce", icono: "🎬", tag: "Más Vendido" },
    { id: 902, nombre: "Lunes de Socios", precio: 180, desc: "Combo Pareja con 30% de Descuento", icono: "💳", tag: "Solo Hoy" },
  ];

  const quickActions = [
    { id: 201, nombre: "Palomitas G", precio: 95, icono: "🍿" },
    { id: 301, nombre: "Refresco G", precio: 85, icono: "🥤" },
    { id: 401, nombre: "Nachos", precio: 85, icono: "🧀" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      
      {/* 1. HERO BANNER - OFERTA PRINCIPAL */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 to-red-950 rounded-[3rem] p-10 shadow-2xl shadow-red-900/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-md space-y-4">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full">
              Promoción de Temporada
            </span>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">
              Combo <br /> <span className="text-black">Blockbuster</span>
            </h2>
            <p className="text-red-100 text-sm font-medium">
              Llévate el vaso coleccionable de la semana + Palomitas Grandes por un precio especial.
            </p>
            <button 
              onClick={() => agregarProducto(999, "Combo Blockbuster", 450)}
              className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all active:scale-95"
            >
              Agregar a la orden — $450
            </button>
          </div>
          
        </div>
       
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-500/20 rounded-full blur-3xl"></div>
      </section>

     
      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">Artículos Frecuentes</h3>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map(item => (
            <button 
              key={item.id}
              onClick={() => agregarProducto(item.id, item.nombre, item.precio)}
              className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icono}</span>
                <span className="font-bold text-sm uppercase">{item.nombre}</span>
              </div>
              <span className="font-mono font-bold text-red-500">${item.precio}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. GRID DE OFERTAS ESPECIALES */}
      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 ml-2">Ofertas del Día</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {ofertas.map(oferta => (
            <div 
              key={oferta.id}
              className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] p-8 flex gap-6 items-center group hover:border-zinc-700 transition-all"
            >
              <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                {oferta.icono}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{oferta.tag}</span>
                  <span className="text-xl font-black italic">${oferta.precio}</span>
                </div>
                <h4 className="text-lg font-bold text-white uppercase leading-none">{oferta.nombre}</h4>
                <p className="text-xs text-zinc-500">{oferta.desc}</p>
                <button 
                  onClick={() => agregarProducto(oferta.id, oferta.nombre, oferta.precio)}
                  className="mt-4 text-[10px] font-black uppercase text-white bg-zinc-800 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  + Agregar Promo
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOOTER DE MEMBRESÍA (CU-06 Puntos) */}
      <section className="bg-zinc-900/10 border-2 border-dashed border-zinc-900 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-xl text-yellow-500">⭐</div>
        <div>
          <h4 className="font-black uppercase tracking-tighter text-xl">¿Es Socio Nexo?</h4>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">
            Recuerda validar el ID del cliente para acumular puntos o aplicar descuentos especiales de monedero.
          </p>
        </div>
        <button className="text-xs font-bold text-zinc-400 hover:text-white underline underline-offset-4 transition-colors">
          Consultar puntos del cliente
        </button>
      </section>

    </div>
  );
}