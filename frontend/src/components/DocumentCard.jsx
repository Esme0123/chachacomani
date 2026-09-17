import { useState } from 'react'
import { RippleOverlay, ElectricCard, GlowCard } from './Effects.jsx'

export default function DocumentCard({ card, dark, onNavigate }) {
  const [hovered, setHovered] = useState(false)
  const esReglamento = card.title === 'Reglamento Interno'
  const abrir = () => onNavigate(esReglamento ? 'reglamento' : 'en-desarrollo')

  const contenido = (
    <div
      className="relative group h-[380px] min-h-[380px] cursor-pointer card-lift"
      onClick={abrir}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

        {/* ───────── FRENTE ───────── */}
        <div
          className={`card-front absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-between gap-3 p-6 rounded-2xl overflow-hidden ${dark ? 'bg-[#294669]' : 'bg-white'}`}
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

          {/* Desc */}
          <p className="text-[11px] text-center leading-relaxed"
            style={{ color: dark ? 'rgba(167,227,153,0.72)' : 'rgba(41,70,105,0.78)' }}>
            {card.desc}
          </p>

          {/* Chapter badge */}
          <div
            className="px-3 py-0.5 rounded-full font-mono text-[11px] transition-all duration-300"
            style={{
              background: hovered ? `${card.color}22` : 'transparent',
              border: `1px solid ${card.color}55`,
              color: card.color,
            }}
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

          {/* Ver button */}
          <button
            onClick={abrir}
            className="w-full py-2 rounded-lg font-display font-semibold text-sm tracking-wider transition-all duration-300"
            style={{
              background: `${card.color}18`,
              color: dark ? '#E4D329' : '#0D0B61',
              border: `1px solid ${card.color}55`,
            }}
          >
            Ver
          </button>
        </div>

        {/* ───────── REVERSO ───────── */}
        <div className="card-back absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D0B61] via-[#294669] to-[#080640]">
          {card.img && (
            <img
              src={card.img}
              alt={card.title}
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = 'none')}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, rgba(13,11,97,.50) 0%, rgba(8,6,64,.9) 100%)' }}
          />

          <div className="relative z-10 h-full flex flex-col items-center justify-between gap-3 p-6 text-center">
            <span className="text-4xl drop-shadow-lg">{card.icon}</span>
            <span className="font-mono text-[10px] tracking-widest text-[#E4D329] border border-[#E4D329]/50 rounded-full px-3 py-1 whitespace-nowrap">
              DOCUMENTO OFICIAL
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