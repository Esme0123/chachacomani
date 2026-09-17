import { useState } from 'react'
import { RippleOverlay, ElectricCard, GlowCard } from './Effects.jsx'

export default function DocumentCard({ card, dark, onNavigate }) {
  const [hovered, setHovered] = useState(false)
  const esReglamento = card.title === 'Reglamento Interno'
  const abrir = () => onNavigate(esReglamento ? 'reglamento' : 'en-desarrollo')

  const contenido = (
    <div
      className="relative w-full h-[400px] min-h-[400px] [perspective:1000px] group cursor-pointer card-lift"
      onClick={abrir}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

        {/* ───────── FRENTE ───────── */}
        <div
          className={`card-front absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col items-center justify-between gap-3 p-6 rounded-2xl overflow-hidden ${dark ? 'bg-[#294669]' : 'bg-white'}`}
          style={{ color: dark ? '#ffffff' : '#0D0B61' }}
        >
          {/* Icon ring */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shrink-0"
            style={{
              background: hovered ? `${card.color}28` : `${card.color}10`,
              border: `2px solid ${card.color}${hovered ? 'cc' : '50'}`,
              boxShadow: hovered ? `0 0 22px ${card.color}55` : 'none',
            }}
          >
            {card.icon}
          </div>

          {/* Title */}
          <h3
            className="font-display font-bold text-center text-[15px] leading-tight"
            style={{ color: dark ? (card.featured ? '#F6FF99' : '#ffffff') : '#0D0B61' }}
          >
            {card.title}
            {card.featured && (
              <span className="ml-2 text-[10px] bg-[#E4D329] text-[#0D0B61] px-1.5 py-0.5 rounded align-middle font-sans">
                ★ Principal
              </span>
            )}
          </h3>

          {/* Desc (carbón oscuro en modo claro) */}
          <p className="text-[11px] text-center leading-relaxed"
            style={{ color: dark ? 'rgba(167,227,153,0.72)' : '#334155' }}>
            {card.desc}
          </p>

          {/* Chapter badge (ámbar constrastado en modo claro) */}
          <div
            className={`px-3 py-0.5 rounded-full font-mono text-[11px] transition-all duration-300 ${
              dark
                ? 'bg-[#E4D329]/15 text-[#E4D329] border border-[#E4D329]/50'
                : 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
            }`}
          >
            {card.chapter}
          </div>

          {/* Detail area (ripple on hover) */}
          <div
            className="relative w-full rounded-lg overflow-hidden transition-all duration-300"
            style={{
              height: hovered ? 56 : 40,
              background: `linear-gradient(135deg, ${card.color}12, ${card.color}22)`,
            }}
          >
            {hovered && <RippleOverlay x={50} y={50} ringColor={`${card.color}60`} />}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-8 h-8 rounded font-display font-bold text-xs flex items-center justify-center"
                style={{ border: `1px solid ${card.color}66`, color: card.color }}
              >
                {String(card.id).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Ver button (alta legibilidad en modo claro) */}
          <button
            onClick={abrir}
            className={`w-full py-2 rounded-lg font-display text-sm tracking-wider transition-all duration-300 ${
              dark
                ? 'font-semibold'
                : 'border-2 border-[#0D0B61] text-[#0D0B61] bg-slate-50 hover:bg-[#0D0B61] hover:text-white font-bold'
            }`}
            style={dark ? { background: `${card.color}18`, color: '#E4D329', border: `1px solid ${card.color}55` } : undefined}
          >
            Ver
          </button>
        </div>

        {/* ───────── REVERSO ───────── */}
        <div className="card-back absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D0B61] via-[#294669] to-[#0D0B61]">
          {card.imagen && (
            <img
              src={card.imagen}
              alt={card.title}
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl brightness-[.6] contrast-[1.15] saturate-[.9]"
            />
          )}
          <div className="absolute inset-0 bg-[#0D0B61]/80 backdrop-blur-[2px] rounded-2xl" />
          {/* Rejilla vectorial sutil (malla minera) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Halo dorado central */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 26%, rgba(228,211,41,.16), transparent 60%)' }}
          />

          <div className="relative z-10 h-full flex flex-col items-center justify-between gap-4 p-6 text-center">
            {/* Ícono central con borde reluciente */}
            <div className="flex items-center justify-center flex-1">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${card.color}26, ${card.color}0d)`,
                  border: `2px solid ${card.color}`,
                  boxShadow: `0 0 26px ${card.color}66, inset 0 0 16px ${card.color}33`,
                }}
              >
                {card.icon}
              </div>
            </div>

            <span className="font-mono text-[10px] tracking-widest text-[#E4D329] border border-[#E4D329]/50 rounded-full px-3 py-1 whitespace-nowrap">
              {esReglamento ? 'DOCUMENTO OFICIAL' : 'SECCIÓN EN DESARROLLO'}
            </span>
            <h3 className="font-display font-bold text-white text-lg leading-tight">{card.title}</h3>
            <p className="text-[#A7E399] text-xs leading-relaxed opacity-90">
              {esReglamento
                ? 'Normativa integral disponible en el portal de lectura protegida de la Cooperativa.'
                : 'Sección en desarrollo. Este documento normativo estará disponible próximamente.'}
            </p>
            <button
              onClick={abrir}
              className="px-5 py-2 rounded-lg font-display font-bold text-xs tracking-wider text-[#0D0B61] transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#E4D329,#F6FF99)', boxShadow: '0 4px 20px rgba(228,211,41,.45)' }}
            >
              {esReglamento ? 'Ver Documento' : '🚧 En Desarrollo'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )

  return card.effect === 'electric'
    ? <ElectricCard dark={dark} featured={card.featured}>{contenido}</ElectricCard>
    : <GlowCard dark={dark}>{contenido}</GlowCard>
}