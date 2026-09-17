export default function HeroSection({ dark, onNavigate }) {
  return (
    <div className="relative h-[480px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1920"
        alt="Minería aurífera a cielo abierto"
        className="hero-image-animated absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? 'linear-gradient(135deg, rgba(13,11,97,.93) 0%, rgba(41,70,105,.8) 50%, rgba(13,11,97,.96) 100%)'
            : 'linear-gradient(135deg, rgba(13,11,97,.82) 0%, rgba(71,139,141,.66) 50%, rgba(13,11,97,.86) 100%)',
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