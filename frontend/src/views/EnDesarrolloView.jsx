const ICONOS_MINERIA = [
  { icon: '⛑️', delay: '0s' },
  { icon: '⛏️', delay: '0.3s' },
  { icon: '🪙', delay: '0.6s' },
  { icon: '🚂', delay: '0.9s' },
  { icon: '✨', delay: '1.2s' },
]

export default function EnDesarrolloView({ onVolver }) {
  const documentos = [
    { title: 'Estatuto Orgánico', icon: '⚖️', color: '#E4D329' },
    { title: 'Reglamento Disciplinario', icon: '📋', color: '#48B3AF' },
    { title: 'Conciliación y Arbitraje', icon: '🤝', color: '#A7E399' },
    { title: 'Reglamento Electoral', icon: '🗳️', color: '#476EAE' },
    { title: 'Seguridad e Higiene', icon: '⛑️', color: '#48B3AF' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0D0B61]">
      {/* Botón Volver al Inicio */}
      <div className="w-full border-b border-[#294669] bg-[#0D0B61]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          <button
            onClick={onVolver}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E4D329] hover:text-[#F6FF99] hover:bg-[#294669]/80 px-3 py-1.5 rounded-lg bg-[#294669] border border-[#478B8D] transition-all"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>

      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(160deg, #0D0B61 0%, #160f3d 40%, #294669 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(228,211,41,.14), transparent 40%),' +
            'radial-gradient(circle at 80% 15%, rgba(72,179,175,.16), transparent 40%),' +
            'radial-gradient(circle at 50% 85%, rgba(167,227,153,.12), transparent 45%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        {/* Iconos de minería flotantes */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10">
          {ICONOS_MINERIA.map((m, i) => (
            <span
              key={i}
              className="text-4xl md:text-5xl animate-float-bob"
              style={{ animationDelay: m.delay }}
            >
              {m.icon}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E4D329]/55 bg-[#E4D329]/10 font-mono text-[#E4D329] text-[11px] tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E4D329] animate-pulse" />
          COOPERATIVA MINERA AURÍFERA
        </span>

        <h1 className="font-display font-bold text-white text-4xl md:text-5xl tracking-widest mt-5">
          SECCIÓN EN DESARROLLO
        </h1>

        <p className="font-body text-[#A7E399] text-sm md:text-base max-w-xl leading-relaxed mt-5">
          La Cooperativa Minera Aurífera Nevado Chachacomani R.L. se encuentra preparando
          la digitalización de este documento normativo. Por la presente, se comunica a las
          asociadas y asociados que su publicación estará disponible próximamente en
          cumplimiento del Reglamento Interno y la Ley General de Cooperativas N° 356.
        </p>

        {/* Documentos en preparación */}
        <div className="w-full max-w-2xl mt-10 space-y-3">
          <div className="font-mono text-[10px] tracking-widest text-[#48B3AF] text-left px-2">
            DOCUMENTOS EN PREPARACIÓN
          </div>
          {documentos.map(doc => (
            <div
              key={doc.title}
              className="flex items-center gap-4 rounded-2xl border border-[#294669]/60 bg-[#080640]/70 backdrop-blur-sm px-5 py-3.5 text-left"
            >
              <span
                className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg"
                style={{ background: `${doc.color}1a`, border: `1px solid ${doc.color}55` }}
              >
                {doc.icon}
              </span>
              <span className="flex-1 font-display font-semibold text-sm text-white">{doc.title}</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#F6FF99] border border-[#E4D329]/40 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4D329] animate-pulse" />
                En Desarrollo
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onVolver}
          className="mt-12 inline-flex items-center gap-2 font-display font-bold tracking-widest px-8 py-3 rounded-lg text-[#0D0B61] transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{
            background: 'linear-gradient(135deg,#E4D329,#F6FF99)',
            boxShadow: '0 4px 28px rgba(228,211,41,.5)',
          }}
        >
          ← VOLVER AL INICIO
        </button>
      </div>
    </div>
  )
}