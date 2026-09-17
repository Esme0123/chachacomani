export default function Header({ dark, onNavigate }) {
  return (
    <header className={`sticky top-0 z-40 ${dark
      ? 'bg-[#0D0B61]/90 backdrop-blur-sm border-b border-[#294669]/60'
      : 'bg-white/96 backdrop-blur-sm border-b border-[#294669]/18'
      }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-[#0D0B61] text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg,#E4D329,#48B3AF)' }}
          >
            C
          </div>
          <div>
            <div className={`font-display font-bold text-[13px] leading-tight tracking-wide ${dark ? 'text-white' : 'text-[#0D0B61]'}`}>
              COOPERATIVA MINERA AURÍFERA
            </div>
            <div className="font-display text-[#E4D329] text-[10px] tracking-[0.15em]">
              NEVADO CHACHACOMANI R.L.
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-5">
          <button
            onClick={() => onNavigate('home')}
            className="font-display font-semibold text-sm tracking-wide px-3 py-1.5 rounded-md bg-[#E4D329] text-[#0D0B61] hover:bg-[#F6FF99] transition-colors"
          >
            Inicio
          </button>
          <button
            onClick={() => onNavigate('reglamento')}
            className={`font-display font-medium text-sm tracking-wide transition-colors ${dark ? 'text-[#48B3AF] hover:text-[#A7E399]' : 'text-[#294669] hover:text-[#0D0B61]'
              }`}
          >
            Reglamento Interno
          </button>
          <button
            onClick={() => onNavigate('login')}
            className={`font-display font-semibold text-sm tracking-wide px-4 py-1.5 rounded-md border transition-all ${dark
                ? 'border-[#48B3AF] text-[#48B3AF] hover:bg-[#48B3AF]/12'
                : 'border-[#294669] text-[#294669] hover:bg-[#294669]/6'
              }`}
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  )
}