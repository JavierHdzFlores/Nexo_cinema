'use client';

/**
 * layout.tsx — DulceriaLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Actúa como el CONTROLADOR principal del módulo (CU-05 + CU-06).
 * Implementa la Máquina de Estados del Diagrama 6 (CU-05):
 *   Iniciada → EnCarga → ValidandoStock → PendienteDePago → Finalizada / Cancelada
 *
 * Provee el CartContext con las funciones del GestorMonedero (CU-06).
 * La estructura de carpetas sigue el patrón:
 *   layout.tsx   → Controlador + Contexto + Shell visual
 *   page.tsx     → Vista "Inicio" (artículos destacados)
 *   [category]/  → Vista dinámica de catálogo por categoría
 *   components/  → Componentes aislados y reutilizables
 *   types.ts     → Contratos de tipos (schemas del backend)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Film } from 'lucide-react';
import type { OperacionMonedero } from './components/LoyaltyPanel';

import { CartSummary } from './components/CartSummary';
import { LoyaltyPanel } from './components/LoyaltyPanel';
import { PaymentModal } from './components/PaymentModal';

import type {
  CartItem,
  ArticuloDulceriaResponse,
  EstadoVenta,
  VentaDulceriaRequest,
  VentaDulceriaResponse,
  MonederoSaldoResponse,
} from './types';

const API_URL = 'http://127.0.0.1:8000/dulceria';

/* ─── Contexto del Carrito (accesible desde cualquier página hija) ─── */
interface CartContextType {
  carrito: CartItem[];
  agregarProducto: (producto: ArticuloDulceriaResponse) => void;
  restarProducto: (id: number) => void;
  eliminarProducto: (id: number) => void;
  limpiarCarrito: () => void;
  // Nuevos campos para sincronizar el summary con el monedero
  operacion: OperacionMonedero;
  puntosDisponibles: number;
  idCliente: number | null;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de DulceriaLayout');
  return ctx;
};



/* ═══════════════════════════════════════════════════════════════════════════
   LAYOUT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DulceriaLayout({ children }: { children: ReactNode }) {


  /* ── Carrito (estado EnCarga) ── */
  const [carrito, setCarrito] = useState<CartItem[]>([]);

  // ── Persistencia del Carrito (Mejora) ──
  useEffect(() => {
    const savedCart = localStorage.getItem('nexo_cart');
    if (savedCart) {
      try {
        setCarrito(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexo_cart', JSON.stringify(carrito));
  }, [carrito]);

  const agregarProducto = (producto: ArticuloDulceriaResponse) => {
    if (estadoVenta === 'Iniciada') setEstadoVenta('EnCarga');
    setCarrito(prev => {
      const itemExistente = prev.find(item => item.id_articulo === producto.id_articulo);
      
      // Validación de stock (Mejora)
      const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
      if (cantidadActual >= producto.stock_actual) {
        // Podríamos mostrar un toast aquí
        return prev;
      }

      if (itemExistente) {
        return prev.map(item =>
          item.id_articulo === producto.id_articulo
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1, subtotal: producto.precio }];
    });
  };

  const restarProducto = (id: number) => {
    setCarrito(prev => {
      const item = prev.find(i => i.id_articulo === id);
      if (!item) return prev;
      if (item.cantidad === 1) return prev.filter(i => i.id_articulo !== id);
      const nueva_cant = item.cantidad - 1;
      return prev.map(i =>
        i.id_articulo === id
          ? { ...i, cantidad: nueva_cant, subtotal: parseFloat((nueva_cant * i.precio).toFixed(2)) }
          : i
      );
    });
  };

  const eliminarProducto = (id: number) =>
    setCarrito(prev => prev.filter(i => i.id_articulo !== id));

  const limpiarCarrito = () => {
    setCarrito([]);
    if (estadoVenta === 'EnCarga') setEstadoVenta('Iniciada');
  };

  /* ── Monedero (CU-06: GestorMonedero) ── */
  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [puntosDisponibles, setPuntosDisponibles] = useState(0);
  const [operacion, setOperacion] = useState<OperacionMonedero>('acumular');
  const [isConsultandoMonedero, setIsConsultandoMonedero] = useState(false);
  const [errorCuenta, setErrorCuenta] = useState<string | null>(null);

  const handleValidarCuenta = async (id: string) => {
    setIsConsultandoMonedero(true);
    setErrorCuenta(null);
    try {
      const res = await fetch(`${API_URL}/monedero/${id}/saldo`);
      const data: MonederoSaldoResponse = await res.json();
      if (res.status === 403) {
        setErrorCuenta((data as any).detail || 'Cuenta inactiva. Contacte al administrador.');
        return;
      }
      if (res.status === 404) {
        setErrorCuenta('No existe un monedero para ese ID.');
        return;
      }
      if (!res.ok) {
        setErrorCuenta('Error al validar la cuenta.');
        return;
      }
      setIdCliente(data.id_cliente);
      setPuntosDisponibles(data.saldoPuntos);
      setOperacion('acumular');
    } catch {
      setErrorCuenta('Error de conexión con el servidor.');
    } finally {
      setIsConsultandoMonedero(false);
    }
  };

  const handleLimpiarCuenta = () => {
    setIdCliente(null);
    setPuntosDisponibles(0);
    setOperacion('acumular');
    setErrorCuenta(null);
  };

  /* ── Máquina de estados (Diagrama 6 CU-05) ── */
  const [estadoVenta, setEstadoVenta] = useState<EstadoVenta>('Iniciada');
  const [respuestaVenta, setRespuestaVenta] = useState<VentaDulceriaResponse | null>(null);
  const [idEvento, setIdEvento] = useState<number | ''>('');

  // ── Auto-fill del ID de Evento desde la URL (Mejora UX) ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ev = params.get('evento');
      if (ev && !isNaN(Number(ev))) {
        setIdEvento(Number(ev));
      }
    }
  }, []);

  const subtotal = carrito.reduce((acc, i) => acc + i.subtotal, 0);
  const descuentoPuntos = (operacion === 'canjear' && idCliente)
    ? Math.min(puntosDisponibles, subtotal)
    : 0;
  const granTotal = Math.max(0, subtotal - descuentoPuntos);

  /* Transición: EnCarga → ValidandoStock → PendienteDePago */
  const handleSolicitarCobro = () => {
    if (carrito.length === 0) return;
    setEstadoVenta('ValidandoStock');
    // Simulación del tiempo de validación de inventario (Requerimiento: < 2 segundos)
    setTimeout(() => setEstadoVenta('PendienteDePago'), 900);
  };

  /* Transición: PendienteDePago → Pagada → Finalizada (POST /dulceria/vender) */
  const handleProcesarPago = async (metodoPago: string) => {
    // La API centraliza todo, pero a nivel UI pasamos por "Pagada" si tiene éxito
    setEstadoVenta('PendienteDePago');

    const body: VentaDulceriaRequest = {
      id_cliente: idCliente ?? undefined,
      id_evento: idEvento !== '' ? Number(idEvento) : undefined,
      metodo_pago: metodoPago,
      usar_puntos: operacion === 'canjear',
      puntos_a_usar: descuentoPuntos,
      detalles: carrito.map(i => ({ id_articulo: i.id_articulo, cantidad: i.cantidad })),
    };

    try {
      const res = await fetch(`${API_URL}/vender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: VentaDulceriaResponse = await res.json();

      if (res.ok) {
        setEstadoVenta('Pagada');

        // Simulación rápida de emisión de ticket (Diagrama 6: Pagada -> Finalizada)
        setTimeout(() => {
          setRespuestaVenta(data);
          setEstadoVenta('Finalizada');
          // Actualizar saldo local con el comprobante devuelto por el backend
          if (idCliente && data.monedero) {
            setPuntosDisponibles(data.monedero.saldo_nuevo);
          }
        }, 800);
      } else {
        const errorMsg = (data as any).detail || 'Error desconocido';
        alert(`Error del sistema: ${errorMsg}`);
        setEstadoVenta('EnCarga'); // E1 / E2: volver para corregir la orden
      }
    } catch {
      alert('Error de conexión. Intente nuevamente.');
      setEstadoVenta('PendienteDePago');
    }
  };

  /* Transición: Finalizada / Cancelada → Iniciada (nueva venta) */
  const handleResetVenta = () => {
    setCarrito([]);
    setOperacion('acumular');
    setEstadoVenta('Iniciada');
    setRespuestaVenta(null);
    setIdEvento('');
  };

  /* ─────────────────────────────────────────────────────────── RENDER ─── */
  return (
    <CartContext.Provider value={{ 
      carrito, 
      agregarProducto, 
      restarProducto, 
      eliminarProducto, 
      limpiarCarrito,
      operacion,
      puntosDisponibles,
      idCliente
    }}>
      <div className="min-h-screen text-white" style={{ background: '#080b14' }}>

        {/* ═════════ HEADER ═════════ */}
        <header
          className="sticky top-0 z-40 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,11,20,0.95)', backdropFilter: 'blur(20px)' }}
        >
          <div className="max-w-[1800px] mx-auto px-8 h-16 flex items-center justify-between gap-8">

            {/* Logo / Breadcrumb */}
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
            </Link>

            {/* Panel Monedero (CU-06 inline en header) */}
            <div className="flex-1 max-w-xl">
              <LoyaltyPanel
                idCliente={idCliente}
                puntosDisponibles={puntosDisponibles}
                operacion={operacion}
                setOperacion={setOperacion}
                onValidarCuenta={handleValidarCuenta}
                onLimpiarCuenta={handleLimpiarCuenta}
                isLoading={isConsultandoMonedero}
                errorCuenta={errorCuenta}
              />
            </div>

            {/* Indicador de estado de la venta */}
            <div className="shrink-0 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: estadoVenta === 'Iniciada' ? 'rgba(255,255,255,0.15)'
                    : estadoVenta === 'EnCarga' ? '#f9a825'
                      : estadoVenta === 'Finalizada' ? '#22c55e'
                        : '#ff4e50',
                }}
              />
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                {estadoVenta}
              </span>
            </div>

          </div>
        </header>

        {/* ═════════ BODY ═════════ */}
        <div className="max-w-[1800px] mx-auto flex">

          {/* IZQUIERDA: Navegación + Contenido */}
          <main className="flex-1 min-w-0">



            {/* Contenido de la ruta activa */}
            <div className="p-8">
              {children}
            </div>
          </main>

          {/* DERECHA: Ticket / CartSummary */}
          <CartSummary
            total={subtotal}
            descuentoPuntos={descuentoPuntos}
            granTotal={granTotal}
            idEvento={idEvento}
            setIdEvento={setIdEvento}
            onClearCart={limpiarCarrito}
            onCheckout={handleSolicitarCobro}
          />
        </div>

        {/* ═════════ MODAL DE PAGO (Máquina de estados) ═════════ */}
        <PaymentModal
          estado={estadoVenta}
          total={subtotal}
          descuentoPuntos={descuentoPuntos}
          granTotal={granTotal}
          respuesta={respuestaVenta}
          onConfirmarPago={handleProcesarPago}
          onCancelar={handleResetVenta}
        />

      </div>
    </CartContext.Provider>
  );
}