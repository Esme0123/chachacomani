import React, { useState } from 'react';
import ReglamentoInternoView from './views/ReglamentoInternoView';

export default function App() {
  // Estado para saber qué documento se está leyendo
  const [docSeleccionado, setDocSeleccionado] = useState(null); // 'reglamento' | null

  // Si se selecciona el Reglamento Interno, se renderiza tu visor completo
  if (docSeleccionado === 'reglamento') {
    return <ReglamentoInternoView onVolver={() => setDocSeleccionado(null)} />;
  }

  // Si no hay documento seleccionado, muestra el Portal Principal de Figma
  return (
    <div className="min-h-screen bg-[#060440]">
      {/* Cabecera / Hero de Figma */}

      {/* Grilla de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta: Reglamento Interno */}
        <div
          onClick={() => setDocSeleccionado('reglamento')}
          className="cursor-pointer border-glow-card p-6"
        >
          <h3>Reglamento Interno</h3>
          <button>Ver documento →</button>
        </div>

        {/* Las demás tarjetas (Estatuto Orgánico, Electoral, etc.) */}
      </div>
    </div>
  );
}