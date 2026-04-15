import { Navbar } from "./components/Navbar";
import { HeroCarousel } from "./components/HeroCarousel";
import { MovieGrid } from "./components/MovieGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080b14] text-white selection:bg-[#f9a825] selection:text-black">
      {/* 1. Nuestro menú de navegación superior */}
      <Navbar />

      {/* 2. El carrusel principal de películas */}
      <HeroCarousel />

      {/* 3. Nuestra sección de Cartelera y Horarios */}
      <MovieGrid />

      {/* Aquí iremos agregando las siguientes secciones (Cartelera, Ofertas, Footer, etc.) */}
    </main>
  );
}