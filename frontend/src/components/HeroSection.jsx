import { useState } from 'react'

const HERO_MAIN = 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1920&q=80'
const HERO_ALT = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1920&q=80'

export default function HeroSection({ dark, onNavigate }) {
  const [heroStage, setHeroStage] = useState(0) // 0 = principal, 1 = alternativa, 2 = oculta

  const heroImg = heroStage === 0 ? HERO_MAIN : heroStage === 1 ? HERO_ALT : null

  return (
    <div className="relative h-[480px] overflow-hidden bg-gradient-to-br from-[#0D0B61] via-[#294669] to-[#0D0B61]">
      {/* Imagen HD de minería con respaldo antierrores */}
      {heroImg && (
        <img
          src={heroImg}
          alt="Minería aurífera de la Cooperativa Chachacomani"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            setHeroStage(s => Math.min(s + 1, 2))
          }}
        />
      )}

      {/* Capa de degradado oscuro para resaltar el texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D0B61]/90 via-[#0D0B61]/75 to-[#294669]/60 z-0" />

      {/* Rejilla sutil + halo dorado decorativo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: dark
            ? 'radial-gradient(circle at 50% 130%, rgba(228,211,41,.14), transparent 55%), linear-gradient(135deg, rgba(13,11,97,.25), rgba(8,6,64,.5))'
            : 'radial-gradient(circle at 50% 130%, rgba(228,211,41,.18), transparent 55%), linear-gradient(135deg, rgba(13,11,97,.2), rgba(13,11,97,.5))',
        }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 gap-4">
        <h1 className="font-display font-bold text-white text-5xl md:text-6xl leading-none tracking-widest">
          COOPERATIVA MINERA
        </h1>
        <h2 className="font-display font-semibold text-[#E4D329] text-lg md:text-2xl tracking-[0.2em]">
          AURÍFERA NEVADO CHACHACOMANI R.L.
        </h2>

        <p className="font-body text-[#A7E399] text-sm max-w-xl leading-relaxed opacity-90">
          Accede a toda la normativa legal vigente: estatutos, reglamentos internos
          y procedimientos institucionales de la Cooperativa.
        </p>

        <div className="flex gap-4 flex-wrap justify-center mt-2">
          <button
            onClick={() => onNavigate('reglamento')}
            className="font-display font-bold tracking-widest px-8 py-3 rounded-lg text-[#0D0B61] transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg,#E4D329,#F6FF99)',
              boxShadow: '0 4px 28px rgba(228,211,41,.5)',
            }}
          >
            EXPLORAR NORMATIVA
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="font-display font-bold tracking-widest px-8 py-3 rounded-lg text-white border border-[#48B3AF] hover:bg-[#48B3AF]/18 transition-all duration-300"
          >
            INICIAR SESIÓN
          </button>
        </div>
      </div>
    </div>
  )
}