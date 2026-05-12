"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Film,
  User,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}



export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [role, setRole] = useState<"cliente" | "trabajador">("cliente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //evita que la pagina se recargue
    setLoading(true);
    setError('');

    try {
      // Seleccionar endpoint según el rol
      const endpoint = role === 'cliente'
        ? 'http://localhost:8000/api/auth/login/cliente'
        : 'http://localhost:8000/api/auth/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }

      const data = await response.json();

      //guardamos el token en localstore para mantener la seccion activa
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.tipo_usuario);
      if (data.puesto) {
        localStorage.setItem('puesto', data.puesto);
      } else {
        localStorage.removeItem('puesto');
      }

      onClose();

      // REDIRECCIÓN DEPENDIENDO DEL ROL
      if (data.tipo_usuario === 'empleado' || data.tipo_usuario === 'gerente') {
        router.push('/dashboard/staff');
      } else if (data.tipo_usuario === 'cliente') {
        router.push('/dashboard/cliente');
      } else {
        setError('Rol de usuario no reconocido');
      }

    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al conectar con el servidor');
    }
    finally {
      setLoading(false);
    }
  };
 
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            className="fixed inset-0 z z-[100]"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z- z-[100] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full flex overflow-hidden"
              style={{
                maxWidth: "960px",
                height: "clamp(520px, 88vh, 640px)",
                borderRadius: "24px",
                boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {/* ─── LEFT SIDE 60% ─── */}
              <div className="relative hidden md:flex flex-col justify-between overflow-hidden" style={{ width: "60%" }}>
                {/* BG Image */}
                <img
                  src="https://images.unsplash.com/photo-1593940256067-fb4acd831804?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
                  alt="Cinema interior"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(18,18,18,0.75) 0%, rgba(18,18,18,0.45) 40%, rgba(18,18,18,0.82) 100%)",
                  }}
                />
                {/* Red vignette bottom */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(229,9,20,0.18) 0%, transparent 50%)",
                  }}
                />

                {/* Top: Logo */}
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "#E50914", boxShadow: "0 4px 20px rgba(229,9,20,0.5)" }}
                    >
                      <Film size={20} className="text-white" />
                    </div>
                    <div>
                      <span
                        className="block text-white"
                        style={{
                          fontFamily: "'Bebas Neue', cursive",
                          fontSize: "22px",
                          letterSpacing: "0.18em",
                          lineHeight: 1,
                        }}
                      >
                        CINEMANAGER
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.45)",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "10px",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                        }}
                      >
                        Sistema de Gestión
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Welcome text */}
                <div className="relative z-10 p-8 pb-10">
                  {/* Decorative red line */}
                  <div
                    className="mb-5"
                    style={{
                      width: "40px",
                      height: "3px",
                      borderRadius: "2px",
                      background: "#E50914",
                      boxShadow: "0 0 12px rgba(229,9,20,0.7)",
                    }}
                  />
                  <h2
                    className="text-white mb-3"
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "clamp(28px, 3.5vw, 42px)",
                      letterSpacing: "0.04em",
                      lineHeight: 1.1,
                    }}
                  >
                    Tu Experiencia<br />Cinematográfica<br />
                    <span style={{ color: "#E50914" }}>Comienza Aquí</span>
                  </h2>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      lineHeight: 1.7,
                      maxWidth: "300px",
                    }}
                  >
                    Gestiona funciones, ventas, empleados y más desde un solo lugar.
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-6 mt-6">
                    {[
                      { value: "200+", label: "Cines" },
                      { value: "50K", label: "Funciones/mes" },
                      { value: "99.9%", label: "Disponibilidad" },
                    ].map((stat, i) => (
                      <div key={i}>
                        <p
                          className="text-white"
                          style={{
                            fontFamily: "'Bebas Neue', cursive",
                            fontSize: "20px",
                            letterSpacing: "0.05em",
                            lineHeight: 1,
                          }}
                        >
                          {stat.value}
                        </p>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "10px",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginTop: "2px",
                          }}
                        >
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─── RIGHT SIDE 40% ─── */}
              <div
                className="flex flex-col justify-center relative"
                style={{
                  width: "100%",
                  flex: "none",
                  ["--md-width" as string]: "40%",
                  background: "#121212",
                  padding: "clamp(28px, 5%, 52px)",
                }}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <X size={16} />
                </button>

                {/* Mobile logo */}
                <div className="flex md:hidden items-center gap-2 mb-6">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#E50914" }}
                  >
                    <Film size={16} className="text-white" />
                  </div>
                  <span
                    className="text-white"
                    style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "18px", letterSpacing: "0.15em" }}
                  >
                    CINEMANAGER
                  </span>
                </div>

                {/* Header */}
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} style={{ color: "#E50914" }} />
                    <span
                      style={{
                        color: "#E50914",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                      }}
                    >
                      Bienvenido de vuelta
                    </span>
                  </div>
                  <h1
                    className="text-white"
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "clamp(32px, 4vw, 40px)",
                      letterSpacing: "0.05em",
                      lineHeight: 1,
                    }}
                  >
                    Iniciar Sesión
                  </h1>
                </div>

                {/* Role Selector */}
                <div
                  className="flex p-1.5 rounded-2xl mb-7 gap-1"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {(
                    [
                      { key: "cliente", label: "Soy Cliente", Icon: User },
                      { key: "trabajador", label: "Soy Trabajador", Icon: Briefcase },
                    ] as const
                  ).map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      onClick={() => setRole(key)}
                      className="relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300"
                      style={{
                        color: role === key ? "#ffffff" : "rgba(255,255,255,0.35)",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {role === key && (
                        <motion.span
                          layoutId="roleTab"
                          className="absolute inset-0 rounded-xl"
                          style={{ background: "#E50914", boxShadow: "0 4px 16px rgba(229,9,20,0.4)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon size={13} className="relative z-10" />
                      <span className="relative z-10">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Email */}
                  <div className="relative">
                    <motion.div
                      animate={{
                        boxShadow: emailFocused
                          ? "0 0 0 2px rgba(229,9,20,0.5)"
                          : "0 0 0 1px rgba(255,255,255,0.09)",
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 rounded-xl px-4"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        height: "52px",
                      }}
                    >
                      <Mail
                        size={16}
                        style={{
                          color: emailFocused ? "#E50914" : "rgba(255,255,255,0.3)",
                          flexShrink: 0,
                          transition: "color 0.2s",
                        }}
                      />
                      <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        required
                        className="flex-1 bg-transparent outline-none"
                        style={{
                          color: "#ffffff",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "14px",
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <motion.div
                      animate={{
                        boxShadow: passwordFocused
                          ? "0 0 0 2px rgba(229,9,20,0.5)"
                          : "0 0 0 1px rgba(255,255,255,0.09)",
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 rounded-xl px-4"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        height: "52px",
                      }}
                    >
                      <Lock
                        size={16}
                        style={{
                          color: passwordFocused ? "#E50914" : "rgba(255,255,255,0.3)",
                          flexShrink: 0,
                          transition: "color 0.2s",
                        }}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        required
                        className="flex-1 bg-transparent outline-none"
                        style={{
                          color: "#ffffff",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "14px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
                        className="transition-colors hover:text-white"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </motion.div>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="relative flex items-center justify-center gap-2.5 rounded-xl overflow-hidden"
                    style={{
                      height: "52px",
                      background: loading
                        ? "rgba(229,9,20,0.5)"
                        : "#E50914",
                      boxShadow: loading
                        ? "none"
                        : "0 8px 28px rgba(229,9,20,0.45)",
                      color: "white",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      transition: "background 0.3s, box-shadow 0.3s",
                      marginTop: "4px",
                    }}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                      />
                    ) : (
                      <>
                        <span>Entrar</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Forgot password */}
                <div className="mt-4 text-center">
                  <a
                    href="#"
                    className="transition-colors duration-200 hover:text-white"
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <span style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif", fontSize: "11px" }}>
                    ó
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>

                {/* Register */}
                <p
                  className="mt-5 text-center"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: "13px" }}
                >
                  ¿No tienes cuenta?{" "}
                  <a
                    href="#"
                    className="transition-colors duration-200"
                    style={{ color: "#E50914", fontWeight: 600 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ff2030")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#E50914")}
                  >
                    Regístrate
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}