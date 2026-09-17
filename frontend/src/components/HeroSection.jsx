export default function HeroSection({ dark, onNavigate }) {
  return (
    <div className="relative h-[480px] overflow-hidden bg-gradient-to-br from-[#0D0B61] via-[#294669] to-[#0D0B61]">
      {/* Patrón de rejilla sutil estilo malla minera */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Overlay radial + vineta para profundidad */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: dark
            ? 'radial-gradient(circle at 50% 130%, rgba(228,211,41,.14), transparent 55%), linear-gradient(135deg, rgba(13,11,97,.35), rgba(8,6,64,.72))'
            : 'radial-gradient(circle at 50% 130%, rgba(228,211,41,.18), transparent 55%), linear-gradient(135deg, rgba(13,11,97,.3), rgba(13,11,97,.7))',
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