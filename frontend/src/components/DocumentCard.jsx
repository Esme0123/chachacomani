import { useState } from 'react'
import { RippleOverlay, ElectricCard, GlowCard } from './Effects.jsx'

export default function DocumentCard({ card, dark, onNavigate }) {
  const [hovered, setHovered] = useState(false)
  const esReglamento = card.title === 'Reglamento Interno'
  const abrir = esReglamento ? () => onNavigate('reglamento') : undefined

  const inner = (
    <div
      className="relative group flex flex-col items-center gap-3 p-5 h-full cursor-pointer card-lift overflow-hidden"
      onClick={abrir}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fondo de imagen dinámico */}
      {card.img && (
        <img
          src={card.img}
          alt={card.title}
          loading="lazy"
          onError={e => (e.currentTarget.style.display = 'none')}
          className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110"
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 h-full w-full">
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
        style={{ color: card.featured ? '#F6FF99' : (dark ? '#ffffff' : '#0D0B61') }}
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
        className="mt-auto w-full py-2 rounded-lg font-display font-semibold text-sm tracking-wider transition-all duration-300"
        style={{
          background: hovered ? `linear-gradient(135deg, ${card.color}, ${card.color}aa)` : `${card.color}18`,
          color: hovered ? '#0D0B61' : card.color,
          border: `1px solid ${card.color}55`,
          boxShadow: hovered ? `0 4px 22px ${card.color}44` : 'none',
        }}
      >Ver
        </button>
      </div>
    </div>
  )

  return card.effect === 'electric'
    ? <ElectricCard dark={dark} featured={card.featured}>{inner}</ElectricCard>
    : <GlowCard dark={dark}>{inner}</GlowCard>
}