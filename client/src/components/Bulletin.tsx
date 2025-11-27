import { useRef } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Download, Printer, Activity, AlertTriangle, Info, ThermometerSun, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulletinProps {
  data: DailySummary;
  onReset: () => void;
}

const COLORS = {
  good: '#4ade80',     
  moderate: '#facc15', 
  unhealthySens: '#fb923c', 
  unhealthy: '#f87171', 
  veryUnhealthy: '#a855f7', 
  hazardous: '#be123c', 
};

const getStatusColor = (aqi: number) => {
  if (aqi <= 50) return COLORS.good;
  if (aqi <= 100) return COLORS.moderate;
  if (aqi <= 150) return COLORS.unhealthySens;
  if (aqi <= 200) return COLORS.unhealthy;
  if (aqi <= 300) return COLORS.veryUnhealthy;
  return COLORS.hazardous;
};

export function Bulletin({ data, onReset }: BulletinProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const advice = getHealthAdvice(data.cityMaxAQI);

  return (
    <div className="flex flex-col items-center bg-slate-100 min-h-screen">
      <style>{`
        @media print {
          @page { margin: 0; size: A4; }
          body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #bulletin-content { 
            width: 210mm !important; 
            min-height: 297mm !important; 
            margin: 0 !important; 
            padding: 10mm !important; 
            box-shadow: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .no-print { display: none !important; }
          /* Hide other elements */
          body > *:not(#root) { display: none; }
        }
      `}</style>
      
      {/* Toolbar */}
      <div className="flex gap-4 my-8 sticky top-4 z-50 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg border no-print">
        <Button variant="outline" onClick={onReset} className="rounded-full">
          Nouveau
        </Button>
        <Button onClick={handlePrint} className="bg-blue-900 hover:bg-blue-800 text-white rounded-full gap-2">
          <Printer className="w-4 h-4" />
          Imprimer / Sauvegarder PDF
        </Button>
      </div>

      {/* A4 Document Container */}
      <div className="shadow-2xl mb-20 overflow-hidden bg-white">
        <div 
          ref={contentRef}
          id="bulletin-content"
          className="w-[210mm] h-[297mm] bg-white relative text-slate-800 flex flex-col p-[15mm] box-border"
        >
          {/* HEADER */}
          <header className="flex justify-between items-start border-b-2 border-blue-900 pb-4 mb-4">
            <div className="w-1/4 flex flex-col items-center justify-center">
               {/* Logo MALI METEO */}
               <div className="w-20 h-20 bg-blue-900 rounded-full flex flex-col items-center justify-center text-white mb-2 shadow-sm">
                  <span className="text-[8px] uppercase tracking-wider opacity-80">Agence</span>
                  <span className="font-bold text-lg leading-none">MALI</span>
                  <span className="font-bold text-lg leading-none">MÉTÉO</span>
               </div>
            </div>
            
            <div className="w-2/4 text-center pt-2">
              <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">République du Mali</h2>
              <h3 className="text-[10px] italic text-slate-400 mb-3">Un Peuple - Un But - Une Foi</h3>
              <h1 className="text-2xl font-bold text-blue-900 uppercase font-serif leading-tight">Bulletin Quotidien<br/>Qualité de l'Air</h1>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-2 px-3 py-1 bg-blue-50 rounded-full inline-block">
                Zone de Bamako
              </div>
            </div>

            <div className="w-1/4 text-right pt-4">
              <div className="text-[10px] uppercase text-slate-400 mb-1">Date du relevé</div>
              <div className="font-bold text-lg text-blue-900 border-l-4 border-blue-900 pl-3">
                {data.date}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">Validité: 24h</div>
            </div>
          </header>

          {/* SUMMARY */}
          <section className="mb-6">
            <div className="flex items-stretch bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="w-1/3 p-4 flex flex-col items-center justify-center bg-white border-r border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Indice Global</div>
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md mb-2 relative"
                  style={{ backgroundColor: getStatusColor(data.cityMaxAQI) }}
                >
                  {data.cityMaxAQI}
                  {data.cityMaxAQI > 100 && <AlertTriangle className="absolute -top-1 -right-1 w-6 h-6 text-red-600 bg-white rounded-full p-1" />}
                </div>
                <div className="font-bold text-sm uppercase" style={{ color: getStatusColor(data.cityMaxAQI) }}>
                  {getAQILabel(data.cityMaxAQI)}
                </div>
              </div>
              <div className="w-2/3 p-5 flex flex-col justify-center">
                <h3 className="font-bold text-blue-900 uppercase mb-2 text-xs flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Synthèse
                </h3>
                <p className="text-xs text-slate-700 text-justify leading-relaxed">
                  L'indice de qualité de l'air (AQI) atteint un maximum de <strong>{data.cityMaxAQI}</strong>. 
                  La qualité de l'air est qualifiée de <strong>{getAQILabel(data.cityMaxAQI).toLowerCase()}</strong>.
                  Le polluant majoritaire observé sur le réseau est : <strong>{data.stations.find(s => s.aqi === data.cityMaxAQI)?.mainPollutant}</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* DATA TABLE */}
          <section className="mb-6 flex-grow">
            <h3 className="font-bold text-blue-900 uppercase mb-3 text-xs border-b border-slate-200 pb-1 flex items-center gap-2">
              <Wind className="w-4 h-4" />
              Détails du Réseau de Surveillance (Concentrations Max)
            </h3>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="p-2 text-left font-medium">Station</th>
                    <th className="p-2 text-center font-medium border-l border-blue-800">NO2<br/><span className="opacity-70 text-[8px]">ppb</span></th>
                    <th className="p-2 text-center font-medium border-l border-blue-800">SO2<br/><span className="opacity-70 text-[8px]">ppb</span></th>
                    <th className="p-2 text-center font-medium border-l border-blue-800">CO<br/><span className="opacity-70 text-[8px]">ppb</span></th>
                    <th className="p-2 text-center font-medium border-l border-blue-800">O3<br/><span className="opacity-70 text-[8px]">ppb</span></th>
                    <th className="p-2 text-center font-medium border-l border-blue-800">PM2.5<br/><span className="opacity-70 text-[8px]">µg/m³</span></th>
                    <th className="p-2 text-center font-medium border-l border-blue-800">PM10<br/><span className="opacity-70 text-[8px]">µg/m³</span></th>
                    <th className="p-2 text-center font-bold border-l border-blue-800 bg-blue-800">AQI</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stations.map((s, i) => (
                    <tr key={i} className="text-slate-700 odd:bg-white even:bg-slate-50 border-b border-slate-100 last:border-0">
                      <td className="p-2 font-medium truncate max-w-[100px]" title={s.name}>
                        {s.name.replace('ML_', '').replace(/_/g, ' ').replace('Qualité Air', '').replace('QA', '')}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxNO2.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxSO2.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxCO.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxO3.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxPM25.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxPM10.toFixed(0)}</td>
                      <td className="p-2 text-center font-bold border-l border-slate-200">
                        <div className="flex items-center justify-center gap-1">
                           <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(s.aqi) }} />
                           {s.aqi}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* LEGEND & ADVICE GRID */}
          <div className="grid grid-cols-2 gap-6 mb-6">
             {/* Legend */}
             <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-700 uppercase mb-3 text-[10px] flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  Légende AQI
                </h3>
                <div className="space-y-1.5">
                  {[
                    { l: 'Bonne (0-50)', c: COLORS.good },
                    { l: 'Modérée (51-100)', c: COLORS.moderate },
                    { l: 'Médiocre (101-150)', c: COLORS.unhealthySens },
                    { l: 'Mauvaise (151-200)', c: COLORS.unhealthy },
                    { l: 'Très Mauvaise (201-300)', c: COLORS.veryUnhealthy },
                    { l: 'Dangereuse (300+)', c: COLORS.hazardous },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-8 h-2 rounded-full" style={{ backgroundColor: item.c }} />
                      <span className="text-[9px] text-slate-500 uppercase font-medium">{item.l}</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Advice */}
             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 uppercase mb-3 text-[10px] flex items-center gap-2">
                  <ThermometerSun className="w-3 h-3" />
                  Recommandations
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-blue-800 block mb-0.5">Population</span>
                    <p className="text-[10px] text-slate-600 leading-tight">{advice.general}</p>
                  </div>
                  <div className="h-px bg-blue-200 w-full" />
                  <div>
                    <span className="text-[9px] font-bold uppercase text-blue-800 block mb-0.5">Sensibles</span>
                    <p className="text-[10px] text-slate-600 leading-tight">{advice.sensitive}</p>
                  </div>
                </div>
             </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-auto text-center border-t-2 border-blue-900 pt-4">
            <div className="flex justify-center gap-6 mb-2">
               {['NO2', 'SO2', 'CO', 'O3', 'PM2.5', 'PM10'].map(p => (
                 <span key={p} className="text-[8px] font-mono text-slate-400 bg-slate-50 px-1 rounded border border-slate-100">{p}</span>
               ))}
            </div>
            <p className="font-bold text-blue-900 text-[10px] uppercase">Agence Nationale de la Météorologie (MALI MÉTÉO)</p>
            <p className="text-[8px] text-slate-500 mt-1">
              Siège Social : Bamako, Mali • Tél : (+223) 20 20 20 20 • www.malimeteo.ml
            </p>
            <p className="text-[7px] text-slate-300 mt-2 italic">
              Généré le {new Date().toLocaleDateString()} - Document provisoire sous réserve de validation.
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
