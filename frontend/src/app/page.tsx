"use client";

import { useState } from "react"; // <-- ¡Esta era la línea que faltaba!
import { Navbar } from "./components/Navbar";
import { HeroCarousel } from "./components/HeroCarousel";
import { MovieGrid } from "./components/MovieGrid"; 
import { Footer } from "./components/Footer"; 
import { LoginModal}  from "./components/LoginModal";

export default function Home() {

  
  return (
    <main className="min-h-screen bg-[#080b14] text-white selection:bg-[#f9a825] selection:text-black">



      {/* 1. Nuestro menú de navegación superior */}
      <Navbar />

      {/* 2. El carrusel principal de películas */}
      <HeroCarousel />

      {/* 3. Nuestra sección de Cartelera y Horarios */}
      <MovieGrid />


      {/* 2. Lo colocamos hasta abajo */}
      <Footer />

      {/* Montamos el modal al final. 
        Le pasamos el estado isOpen y la función para cerrarlo.
      */}
      
    </main>
  );
}