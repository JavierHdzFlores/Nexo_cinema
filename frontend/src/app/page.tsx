import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      {/* Contenedor Principal */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-6">
          Nexo Cinema
        </h1>
        <p className="text-xl text-gray-300 mb-10">
          Sistema Integral para la Gestión de Cines y Eventos Privados.
          Selecciona tu módulo para comenzar a trabajar.
        </p>

        {/* Cuadrícula de Módulos (Botones) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Módulo 1: Javier */}
          <Link href="/cartelera" className="block p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-purple-900 hover:border-purple-500 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-2">🎬 Cartelera</h2>
            <p className="text-gray-400 text-sm">Gestión de eventos y horarios</p>
          </Link>

          {/* Módulo 2A: Luis Diego */}
          <Link href="/taquilla" className="block p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-blue-900 hover:border-blue-500 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-2">🎟️ Taquilla</h2>
            <p className="text-gray-400 text-sm">Venta de boletos</p>
          </Link>

          {/* Módulo 2B: Miguel */}
          <Link href="/dulceria" className="block p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-yellow-900 hover:border-yellow-500 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-2">🍿 Dulcería</h2>
            <p className="text-gray-400 text-sm">Ventas y lealtad</p>
          </Link>

          {/* Módulo 3: Eduardo Raúl */}
          <Link href="/operaciones" className="block p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-green-900 hover:border-green-500 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-2">🧹 Operaciones</h2>
            <p className="text-gray-400 text-sm">Salas y limpieza</p>
          </Link>

          {/* Módulo 4: Luis Eduardo */}
          <Link href="/admin" className="block p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-red-900 hover:border-red-500 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-2">📊 Admin</h2>
            <p className="text-gray-400 text-sm">Finanzas y reportes</p>
          </Link>

        </div>
      </div>
    </main>
  );
}