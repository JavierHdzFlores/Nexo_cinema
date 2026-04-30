"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, User, Menu, X, Film } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(8, 11, 20, 0.92)"
          : "linear-gradient(to bottom, rgba(8,11,20,0.95) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff4e50, #f9a825)" }}>
            <Film size={18} className="text-white" />
          </div>
          <span
            className="text-white tracking-widest select-none"
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "22px", letterSpacing: "0.15em" }}
          >
            NEXO CINEMA
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Inicio", "Cartelera", "Próximamente", "Cines", "Ofertas"].map((item, i) => (
            <Link
              key={i}
              href="#" // TODO: Actualizar con las rutas reales, ej: href={`/${item.toLowerCase()}`}
              className="text-sm transition-colors duration-200 relative group"
              style={{ color: i === 0 ? "#f9a825" : "rgba(255,255,255,0.7)", fontFamily: "'Inter', sans-serif" }}
            >
              {item}
              {i === 0 && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ background: "#f9a825" }} />
              )}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: "rgba(249, 168, 37, 0.6)" }} />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/10" style={{ color: "rgba(255,255,255,0.7)" }}>
            <Search size={18} />
          </button>
          <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-full relative transition-colors duration-200 hover:bg-white/10" style={{ color: "rgba(255,255,255,0.7)" }}>
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2" style={{ background: "#f9a825", borderColor: "#080b14" }} />
          </button>
          <button
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <User size={14} />
            Iniciar Sesión
          </button>
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: "rgba(8,11,20,0.98)", backdropFilter: "blur(20px)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {["Inicio", "Cartelera", "Próximamente", "Cines", "Ofertas"].map((item, i) => (
                <Link key={i} href="#" className="text-white/80 text-sm py-2 border-b border-white/5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {item}
                </Link>
              ))}
              <button className="flex items-center gap-2 text-white/80 text-sm py-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                <User size={14} /> Iniciar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}