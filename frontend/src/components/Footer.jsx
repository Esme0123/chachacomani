export default function Footer({ dark = true }) {
  return (
    <footer className="bg-[#040332] text-white py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-[#0D0B61] text-base shrink-0"
            style={{ background: 'linear-gradient(135deg,#E4D329,#48B3AF)' }}
          >
            C
          </div>
          <div>
            <div className="font-display font-bold text-sm">COOPERATIVA MINERA AURÍFERA</div>
            <div className="font-display text-[#E4D329] text-[10px] tracking-[0.15em]">NEVADO CHACHACOMANI R.L.</div>
          </div>
        </div>

        <p className="font-display text-center text-[#48B3AF] text-sm tracking-wide max-w-md italic">
          "Por una minería sostenible y en armonía con nuestras comunidades"
        </p>

        <div className="text-right">
          <div className="font-mono text-[#294669] text-[10px] mt-0.5">© 2026 Todos los derechos reservados</div>
        </div>
      </div>
    </footer>
  )
}