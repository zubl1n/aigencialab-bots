"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function LeadPopup() {
  const [isVisible,   setIsVisible]   = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    // No mostrar si ya fue cerrado en esta sesión
    const dismissed = localStorage.getItem("leadPopupDismissed");
    if (dismissed) return;

    // Mostrar después de 8 segundos
    const timer = setTimeout(() => setIsVisible(true), 8000);

    // Exit intent en desktop (mouse sale por arriba)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isVisible) setIsVisible(true);
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("leadPopupDismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email   = (formData.get("email")   as string).trim();
    const company = (formData.get("company") as string).trim();

    try {
      // Usa el schema REAL de la tabla leads:
      //   company (requerido), email (string), source, offer, score
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          email,
          source: "popup_landing",
          offer:  "auditoria_gratis_14dias",
          score:  50,   // warm lead por defecto
          notes:  "Lead capturado via popup de exit-intent/timer en landing",
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.duplicate) {
        setError("No se pudo procesar tu solicitud. Intenta de nuevo.");
        setIsLoading(false);
        return;
      }

      // Éxito (incluso si el email ya existía)
      setIsSubmitted(true);
      setTimeout(handleClose, 3500);
    } catch {
      setError("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Oferta de auditoría gratuita"
    >
      {/* Modal container */}
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{
          background: "#0F0F1A",
          border: "1px solid rgba(124,58,237,0.3)",
          boxShadow: "0 0 60px rgba(124,58,237,0.18), 0 25px 50px rgba(0,0,0,0.6)",
          animation: "popup-in 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Close button */}
        <button
          id="lead-popup-close"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {!isSubmitted ? (
          <>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-purple-500/20">
              🎁 Oferta limitada — Solo esta semana
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 leading-snug">
              Descubre cuánto puede<br />
              <span style={{ color: "#A855F7" }}>ahorrar tu negocio con IA</span>
            </h2>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Auditoría gratuita de automatización <strong className="text-gray-300">+ 14 días</strong> de
              agente IA activo, sin tarjeta de crédito.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3" id="lead-popup-form">
              <div>
                <input
                  id="lead-popup-email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@empresa.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
                />
              </div>
              <div>
                <input
                  id="lead-popup-company"
                  name="company"
                  type="text"
                  required
                  placeholder="Nombre de tu empresa"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                id="lead-popup-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isLoading
                    ? "rgba(124,58,237,0.7)"
                    : "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  boxShadow: isLoading ? "none" : "0 0 20px rgba(124,58,237,0.35)",
                }}
              >
                {isLoading ? "Enviando…" : "Quiero mi auditoría gratuita →"}
              </button>
            </form>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5 mt-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">✓ Sin tarjeta</span>
              <span className="flex items-center gap-1">✓ Respuesta en 24h</span>
              <span className="flex items-center gap-1">✓ 14 días incluidos</span>
            </div>

            {/* Soft dismiss */}
            <button
              onClick={handleClose}
              className="mt-4 text-xs text-gray-700 hover:text-gray-500 transition-colors w-full text-center"
            >
              No me interesa ahorrar tiempo ahora
            </button>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">
              ¡Listo! Te contactamos pronto
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Revisaremos tu empresa y te enviamos los resultados
              de la auditoría en <strong className="text-gray-300">menos de 24 horas</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Keyframe animation via style tag */}
      <style>{`
        @keyframes popup-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
