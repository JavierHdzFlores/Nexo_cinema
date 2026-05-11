"use client";

import { useState } from "react"; // <-- ¡Esta era la línea que faltaba!
import { Navbar } from "./components/Navbar";
import { HeroCarousel } from "./components/HeroCarousel";
import { MovieGrid } from "./components/MovieGrid"; 
import { Footer } from "./components/Footer"; 
import { LoginModal}  from "./components/LoginModal";

export default function Home() {
  // Aquí controlamos si el modal se muestra o no
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  return (
    <main className="min-h-screen bg-[#080b14] text-white selection:bg-[#f9a825] selection:text-black">

      {/* --- EJEMPLO DE BOTÓN PARA ABRIRLO --- */}
      {/* Normalmente este botón iría adentro de tu Navbar */}
      <div className="p-6 flex justify-end max-w-[1400px] mx-auto">
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="bg-[#E50914] text-white px-6 py-2 rounded-xl font-bold tracking-widest uppercase hover:bg-red-700 transition-colors"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Iniciar Sesión
        </button>
      </div>

      {/* 1. Nuestro menú de navegación superior */}
      <Navbar />

      {/* 2. El carrusel principal de películas */}
      <HeroCarousel />

      {/* 3. Nuestra sección de Cartelera y Horarios */}
      <MovieGrid />

      <div className="h-screen flex items-center justify-center">
        <h1 className="text-white/20 text-4xl font-bold">CONTENIDO DE NEXO CINEMA</h1>
      </div>

      {/* 2. Lo colocamos hasta abajo */}
      <Footer />

      {/* Montamos el modal al final. 
        Le pasamos el estado isOpen y la función para cerrarlo.
      */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </main>
  );
}