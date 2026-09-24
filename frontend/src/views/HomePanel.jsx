import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import HeroSection from '../components/HeroSection.jsx'
import DocumentCard from '../components/DocumentCard.jsx'
import { Ballpit } from '../components/Effects.jsx'
import { CARDS } from '../data/landingData.js'

export default function HomePanel({ dark, onNavigate, onToggleTheme }) {
  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'bg-[#060440]' : 'bg-slate-50'}`}>
      <Header dark={dark} onNavigate={onNavigate} onToggleTheme={onToggleTheme} />
      <HeroSection dark={dark} onNavigate={onNavigate} />

      <section className="relative flex-1 py-16 px-6">
        <Ballpit dense={dark} />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className={`font-display font-bold text-4xl mb-2 tracking-wide ${dark ? 'text-white' : 'text-[#0D0B61]'}`}>
              DOCUMENTOS NORMATIVOS
            </h2>
            <p className={`font-body text-sm max-w-lg mx-auto ${dark ? 'text-[#48B3AF]' : 'text-[#294669]'}`}>
              Biblioteca completa de reglamentos y estatutos vigentes de la Cooperativa
            </p>
            <div className="mt-4 w-28 h-px mx-auto"
              style={{ background: 'linear-gradient(90deg, transparent, #E4D329, transparent)' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {CARDS.map(card => (
              <DocumentCard key={card.id} card={card} dark={dark} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}