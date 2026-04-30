import { Film } from "lucide-react";

// SVGs nativos para no depender de si la librería quita los logos de marcas
const SocialIcons = [
  {
    name: "Instagram",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    )
  },
  {
    name: "Twitter",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
      </svg>
    )
  },
  {
    name: "Youtube",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
      </svg>
    )
  },
  {
    name: "Facebook",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.39-4h-4.2V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    )
  }
];

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 mt-20 pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Columna 1: Marca y Redes */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#ff4e50] to-[#f9a825] flex items-center justify-center">
                <Film size={18} className="text-white" />
              </div>
              <span 
                className="text-xl text-white tracking-widest"
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.1em" }}
              >
                NEXO CINEMA
              </span>
            </div>
            <p 
              className="text-white/50 text-sm mb-8 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              La experiencia cinematográfica más inmersiva de México. Vive el cine como nunca antes.
            </p>
            <div className="flex gap-4">
              {SocialIcons.map((social) => (
                <a 
                  key={social.name} 
                  href="#" 
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#f9a825] hover:text-black transition-all duration-300"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2: Cine */}
          <div>
            <h4 
              className="text-white font-bold mb-6 uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
            >
              Cine
            </h4>
            <ul className="space-y-4 text-sm text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>
              {['Cartelera', 'Próximamente', 'Horarios', 'Cines', 'Formatos'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Servicios */}
          <div>
            <h4 
              className="text-white font-bold mb-6 uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
            >
              Servicios
            </h4>
            <ul className="space-y-4 text-sm text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>
              {['Membresías', 'Gift Cards', 'Empresas', 'Festivales', 'Prensa'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Ayuda */}
          <div>
            <h4 
              className="text-white font-bold mb-6 uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
            >
              Ayuda
            </h4>
            <ul className="space-y-4 text-sm text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>
              {['Centro de ayuda', 'Reembolsos', 'Privacidad', 'Términos', 'Contacto'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Barra inferior (Copyright) */}
        <div 
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <p>© 2026 Nexo Cinema. Todos los derechos reservados.</p>
          <p>Todos los sistemas operativos</p>
        </div>
      </div>
    </footer>
  );
}