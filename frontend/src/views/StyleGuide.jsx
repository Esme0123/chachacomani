import { PALETTE } from '../data/landingData.js'
import { RippleOverlay, Ballpit } from '../components/Effects.jsx'

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-7">
      <div className="w-1 h-7 rounded-full bg-[#E4D329]" />
      <h2 className="font-display font-bold text-2xl text-[#48B3AF] tracking-widest">{children}</h2>
    </div>
  )
}

function EffectBox({ label, labelColor, children }) {
  return (
    <div className="bg-[#040332] rounded-2xl border border-[#294669]/35 p-6">
      <div className="font-mono text-[11px] mb-4" style={{ color: labelColor }}>{label}</div>
      <div className="text-center">{children}</div>
    </div>
  )
}

export default function StyleGuide({ onNavigate }) {
  const typeScale = [
    { tag: 'H1', css: '48px / 700', sample: 'COOPERATIVA MINERA AURÍFERA', font: "'Rajdhani', sans-serif", cls: 'text-5xl font-bold tracking-widest' },
    { tag: 'H2', css: '36px / 700', sample: 'Documentos Normativos', font: "'Rajdhani', sans-serif", cls: 'text-4xl font-bold tracking-wide' },
    { tag: 'H3', css: '24px / 600', sample: 'Estatuto Orgánico', font: "'Rajdhani', sans-serif", cls: 'text-2xl font-semibold tracking-wide' },
    { tag: 'H4', css: '18px / 600', sample: 'Artículo 12. De la Membresía', font: "'Rajdhani', sans-serif", cls: 'text-lg font-semibold' },
    { tag: 'Body', css: '14px / 400', sample: 'Marco legal que rige la estructura, organización y funcionamiento de la Cooperativa Minera Aurífera Nevado Chachacomani R.L.', font: "'Inter', sans-serif", cls: 'text-sm font-normal leading-relaxed' },
  ]

  return (
    <div className="min-h-screen bg-[#0D0B61] text-white pb-28">
      {/* Top bar */}
      <div className="bg-[#040332] border-b border-[#294669]/50 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#E4D329] tracking-widest">
            BIBLIOTECA DE COMPONENTES
          </h1>
          <p className="font-mono text-[#476EAE] text-[11px] mt-0.5">
            Sistema de Diseño — Cooperativa Minera Aurífera Nevado Chachacomani R.L. · v2026
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="font-display font-bold text-sm px-5 py-2 rounded-lg text-[#0D0B61] transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#E4D329,#F6FF99)' }}
        >
          ← Volver al Portal
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12 space-y-16">

        {/* 1. COLOR PALETTE */}
        <section>
          <SectionTitle>PALETA DE COLORES</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PALETTE.map(c => (
              <div key={c.hex} className="rounded-xl overflow-hidden border border-[#294669]/35">
                <div className="h-20" style={{ background: c.hex }} />
                <div className="bg-[#040332] px-3 py-3">
                  <div className="font-mono text-[11px] text-[#E4D329]">{c.hex}</div>
                  <div className="font-display font-semibold text-white text-sm">{c.name}</div>
                  <div className="font-mono text-[10px] text-[#476EAE]">{c.eng}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. TYPOGRAPHY */}
        <section>
          <SectionTitle>ESCALA TIPOGRÁFICA</SectionTitle>
          <div className="bg-[#040332] rounded-2xl border border-[#294669]/35 overflow-hidden divide-y divide-[#294669]/25">
            {typeScale.map(t => (
              <div key={t.tag} className="flex items-center gap-6 px-6 py-5">
                <div className="w-12 font-mono text-[11px] text-[#E4D329] shrink-0">{t.tag}</div>
                <div
                  className={`text-white flex-1 ${t.cls}`}
                  style={{ fontFamily: t.font }}
                >
                  {t.sample}
                </div>
                <div className="font-mono text-[10px] text-[#476EAE] shrink-0 text-right whitespace-nowrap">{t.css}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. BUTTON SYSTEM */}
        <section>
          <SectionTitle>SISTEMA DE BOTONES</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#040332] rounded-2xl border border-[#294669]/35 p-6 space-y-4">
              <div className="font-mono text-[11px] text-[#476EAE] mb-2">VARIANTES</div>
              {[
                { label: 'Ver (Primario)', style: { background: 'linear-gradient(135deg,#E4D329,#F6FF99)', boxShadow: '0 4px 20px rgba(228,211,41,.4)', color: '#0D0B61' } },
                { label: 'Ver (Secundario — outline)', style: { background: 'transparent', border: '1.5px solid #48B3AF', color: '#48B3AF' } },
                { label: 'Iniciar Sesión (formulario)', style: { background: 'linear-gradient(135deg,#E4D329,#48B3AF)', color: '#0D0B61', boxShadow: '0 4px 22px rgba(228,211,41,.3)' } },
                { label: 'Crear Cuenta (formulario)', style: { background: 'linear-gradient(135deg,#48B3AF,#A7E399)', color: '#0D0B61', boxShadow: '0 4px 22px rgba(72,179,175,.35)' } },
              ].map(b => (
                <button key={b.label} className="block w-full py-3 rounded-lg font-display font-bold tracking-wider text-sm" style={b.style}>
                  {b.label}
                </button>
              ))}
            </div>

            <div className="bg-[#040332] rounded-2xl border border-[#294669]/35 p-6">
              <div className="font-mono text-[11px] text-[#476EAE] mb-5">ESTADOS — Botón "Ver"</div>
              <div className="space-y-5">
                {[
                  { label: 'Normal', bg: '#E4D329', transform: 'none', shadow: 'none' },
                  { label: 'Hover', bg: 'linear-gradient(135deg,#E4D329,#F6FF99)', transform: 'translateY(-3px)', shadow: '0 6px 24px rgba(228,211,41,.55)' },
                  { label: 'Activo', bg: '#c8b820', transform: 'scale(0.96)', shadow: 'none' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-5">
                    <span className="font-mono text-[11px] text-[#476EAE] w-14 shrink-0">{s.label}</span>
                    <button
                      className="px-7 py-2 rounded-lg font-display font-bold text-sm text-[#0D0B61]"
                      style={{ background: s.bg, transform: s.transform, boxShadow: s.shadow }}
                    >
                      Ver
                    </button>
                    <span className="font-mono text-[10px] text-[#294669]">{s.transform !== 'none' ? s.transform : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. CARD DEFINITIONS */}
        <section>
          <SectionTitle>DEFINICIONES DE TARJETAS</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="font-mono text-[11px] text-[#E4D329] mb-3">ELECTRIC BORDER — Normal / Hover</div>
              <div className="electric-border-outer" style={{ borderRadius: '14px' }}>
                <div className="bg-[#0D0B61] rounded-[12px] p-5 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#E4D329]/10 border border-[#E4D329]/40 flex items-center justify-center text-xl">⚖️</div>
                  <div className="font-display font-bold text-white">Estatuto Orgánico</div>
                  <div className="text-[11px] text-[#A7E399]/72">Marco legal fundamental de la Cooperativa.</div>
                  <div className="font-mono text-[11px] text-[#E4D329] border border-[#E4D329]/30 rounded-full px-3 py-0.5 inline-block">VIII Capítulos</div>
                  <button className="block w-full py-2 rounded-lg font-display font-bold text-xs text-[#0D0B61]"
                    style={{ background: 'linear-gradient(135deg,#E4D329,#F6FF99)' }}>Ver</button>
                  <p className="font-mono text-[10px] text-[#476EAE] text-left">
                    Gradiente animado: #E4D329→#48B3AF→#0D0B61→#A7E399<br />
                    Padding: 2px · Border-radius: 14px outer / 12px inner<br />
                    Animación: electricRotate 2s + electricFlicker 3s
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="font-mono text-[11px] text-[#48B3AF] mb-3">BORDER GLOW — Normal / Hover</div>
              <div className="border-glow-card bg-[#080640] p-5 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#48B3AF]/10 border border-[#48B3AF]/40 flex items-center justify-center text-xl">📋</div>
                <div className="font-display font-bold text-white">Reglamento Disciplinario</div>
                <div className="text-[11px] text-[#A7E399]/72">Normas de conducta y procedimientos.</div>
                <div className="font-mono text-[11px] text-[#48B3AF] border border-[#48B3AF]/30 rounded-full px-3 py-0.5 inline-block">45 Artículos</div>
                <button className="block w-full py-2 rounded-lg font-display font-bold text-xs"
                  style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)', color: '#0D0B61' }}>Ver</button>
                <p className="font-mono text-[10px] text-[#476EAE] text-left">
                  box-shadow: ciclo #476EAE→#E4D329→#48B3AF<br />
                  border: 1.5px rgba(72,179,175,.6)<br />
                  Animación: glowCycle 4s ease-in-out infinite
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. EFFECTS LIBRARY */}
        <section>
          <SectionTitle>BIBLIOTECA DE EFECTOS</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <EffectBox label="ELECTRIC BORDER" labelColor="#E4D329">
              <div className="electric-border-outer mb-4 inline-block" style={{ borderRadius: '10px', padding: '2px' }}>
                <div className="bg-[#040332] rounded-[8px] px-6 py-3 font-display text-white text-sm">
                  Contenedor de Ejemplo
                </div>
              </div>
              <p className="font-mono text-[10px] text-[#476EAE] leading-relaxed">
                Gradiente lineal rotante (90°) con colores de paleta. Background-size: 200%. Pseudo-elemento ::before con blur: 10px crea el halo exterior. Doble animación: 2s linear + 3s flicker.
              </p>
            </EffectBox>

            <EffectBox label="BORDER GLOW" labelColor="#48B3AF">
              <div className="border-glow-card bg-[#040332] px-6 py-3 mb-4 inline-block">
                <span className="font-display text-white text-sm">Contenedor de Ejemplo</span>
              </div>
              <p className="font-mono text-[10px] text-[#476EAE] leading-relaxed">
                box-shadow multicolor que cicla entre azul cobalto (#476EAE), turquesa (#48B3AF) y dorado (#E4D329) con verde (#A7E399). Tres capas de sombra + inset sutil. 4s ease-in-out.
              </p>
            </EffectBox>

            <EffectBox label="RIPPLE DISTORTION" labelColor="#A7E399">
              <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#E4D329]/30 border border-[#E4D329]/50 flex items-center justify-center font-display text-[#E4D329] text-xs font-bold">
                  ⛏
                </div>
                <RippleOverlay x={50} y={50} />
              </div>
              <p className="font-mono text-[10px] text-[#476EAE] leading-relaxed">
                3 anillos concéntricos (80×80px) con animación scale(.4)→scale(2.8) + opacity 0.75→0. Delays: 0s, 0.85s, 1.7s. Activados por mousemove. Color: rgba(228,211,41,.55).
              </p>
            </EffectBox>

            <EffectBox label="BALLPIT" labelColor="#F6FF99">
              <div className="relative h-24 mb-4 rounded-xl overflow-hidden bg-[#0D0B61] border border-[#294669]/40">
                <Ballpit />
              </div>
              <p className="font-mono text-[10px] text-[#476EAE] leading-relaxed">
                22–30 esferas flotantes (8–50px) con posiciones y duraciones aleatorias. translateY(-130px) + scale(.8) + opacity → 0. Colores: todos los 8 valores de paleta. Duración: 4–12s.
              </p>
            </EffectBox>

          </div>
        </section>

      </div>
    </div>
  )
}