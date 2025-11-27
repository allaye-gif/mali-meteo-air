import { useRef } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Download, Printer, Activity, AlertTriangle, Info, ThermometerSun, Wind, Leaf, Bike, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoMaliMeteo from '@assets/Logo_Mali_Meteo_1764230835252.png';

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
          @page { 
            size: A4; 
            margin: 0; 
          }
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white;
          }
          /* Hide everything that is not the bulletin */
          body > *:not(#bulletin-wrapper-root) {
             display: none;
          }
          /* Make sure the wrapper is visible and takes full page */
          #bulletin-wrapper-root {
            display: block !important;
            width: 210mm;
            height: 297mm;
            overflow: hidden;
          }
          #bulletin-content {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 10mm !important; /* Reduced margin for print */
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      
      {/* Toolbar */}
      <div className="flex gap-4 my-8 sticky top-4 z-50 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg border no-print">
        <Button variant="outline" onClick={onReset} className="rounded-full">
          Nouveau
        </Button>
        <Button onClick={handlePrint} className="bg-blue-900 hover:bg-blue-800 text-white rounded-full gap-2">
          <Printer className="w-4 h-4" />
          Imprimer / Enregistrer PDF
        </Button>
      </div>

      {/* A4 Document Container */}
      {/* We add an ID to the root wrapper to target it specifically in print media */}
      <div id="bulletin-wrapper-root" className="shadow-2xl mb-20 overflow-hidden bg-white">
        <div 
          ref={contentRef}
          id="bulletin-content"
          className="w-[210mm] h-[297mm] bg-white relative text-slate-800 flex flex-col p-[15mm] box-border"
        >
          {/* HEADER - Reduced padding */}
          <header className="flex justify-between items-start border-b-2 border-blue-900 pb-3 mb-4">
            <div className="w-1/4 flex flex-col items-center justify-center">
               <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-white border border-slate-100">
                 <img 
                   src={logoMaliMeteo} 
                   alt="Logo MALI METEO" 
                   className="w-full h-full object-cover scale-110" 
                 />
               </div>
            </div>
            
            <div className="w-2/4 text-center pt-2">
              <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">République du Mali</h2>
              <h3 className="text-[10px] italic text-slate-400 mb-2">Un Peuple - Un But - Une Foi</h3>
              <h1 className="text-2xl font-bold text-blue-900 uppercase font-serif leading-tight mb-1">Bulletin<br/>Qualité de l'Air</h1>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-1 px-4 py-0.5 bg-blue-50 rounded-full inline-block border border-blue-100">
                Zone de Bamako
              </div>
            </div>

            <div className="w-1/4 text-right pt-4">
              <div className="text-[10px] uppercase text-slate-400 mb-1 font-medium">Date du relevé</div>
              <div className="font-bold text-lg text-blue-900 border-l-4 border-blue-900 pl-3">
                {data.date}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium flex justify-end items-center gap-1">
                <Activity className="w-3 h-3 text-green-500" /> Validité: 24h
              </div>
            </div>
          </header>

          {/* SUMMARY SECTION - Compacted */}
          <section className="mb-6">
            <div className="flex items-stretch bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="w-1/3 p-4 flex flex-col items-center justify-center border-r border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Indice Global</div>
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-2 relative z-10 border-4 border-white"
                    style={{ backgroundColor: getStatusColor(data.cityMaxAQI) }}
                  >
                    {data.cityMaxAQI}
                  </div>
                </div>
                <div className="font-bold text-sm uppercase tracking-tight" style={{ color: getStatusColor(data.cityMaxAQI) }}>
                  {getAQILabel(data.cityMaxAQI)}
                </div>
              </div>
              <div className="w-2/3 p-6 flex flex-col justify-center">
                <h3 className="font-bold text-blue-900 uppercase mb-2 text-xs flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Synthèse de la journée
                </h3>
                <p className="text-xs text-slate-700 text-justify leading-relaxed font-medium">
                  L'indice de qualité de l'air (AQI) atteint un maximum de <strong className="text-blue-900">{data.cityMaxAQI}</strong>. 
                  La qualité de l'air est qualifiée de <strong style={{ color: getStatusColor(data.cityMaxAQI) }}>{getAQILabel(data.cityMaxAQI).toLowerCase()}</strong>.
                  <br/>
                  Le polluant majoritaire observé est le <strong className="bg-slate-100 px-1 rounded text-slate-900">{data.stations.find(s => s.aqi === data.cityMaxAQI)?.mainPollutant}</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* DATA TABLE - Compacted */}
          <section className="mb-6 flex-grow">
            <h3 className="font-bold text-blue-900 uppercase mb-2 text-[10px] border-b border-slate-200 pb-1 flex items-center gap-2">
              <Wind className="w-3 h-3" />
              Détails du Réseau de Surveillance (Concentrations Max)
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2 text-left font-medium">Station</th>
                    <th className="p-2 text-center font-medium border-l border-slate-700">NO2<br/><span className="opacity-60 text-[8px]">ppb</span></th>
                    <th className="p-2 text-center font-medium border-l border-slate-700">SO2<br/><span className="opacity-60 text-[8px]">ppb</span></th>
                    <th className="p-2 text-center font-medium border-l border-slate-700">CO<br/><span className="opacity-60 text-[8px]">ppb</span></th>
                    <th className="p-2 text-center font-medium border-l border-slate-700">O3<br/><span className="opacity-60 text-[8px]">ppb</span></th>
                    <th className="p-2 text-center font-medium border-l border-slate-700">PM2.5<br/><span className="opacity-60 text-[8px]">µg/m³</span></th>
                    <th className="p-2 text-center font-medium border-l border-slate-700">PM10<br/><span className="opacity-60 text-[8px]">µg/m³</span></th>
                    <th className="p-2 text-center font-bold border-l border-slate-700 bg-blue-900">AQI</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stations.map((s, i) => (
                    <tr key={i} className="text-slate-700 odd:bg-white even:bg-slate-50 border-b border-slate-100 last:border-0 hover:bg-blue-50">
                      <td className="p-2 font-bold text-slate-800 truncate max-w-[100px]" title={s.name}>
                        {s.name.replace('ML_', '').replace(/_/g, ' ').replace('Qualité Air', '').replace('QA', '')}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxNO2.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxSO2.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxCO.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxO3.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxPM25.toFixed(0)}</td>
                      <td className="p-2 text-center border-l border-slate-200">{s.maxPM10.toFixed(0)}</td>
                      <td className="p-2 text-center font-bold border-l border-slate-200 bg-blue-50/30">
                        <div className="flex items-center justify-center gap-1">
                           <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: getStatusColor(s.aqi) }} />
                           {s.aqi}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ECO GESTE - Compacted */}
          <section className="mb-6 grid grid-cols-3 gap-3">
             <div className="col-span-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-700">
                   <Leaf className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-emerald-900 text-[10px] uppercase mb-0.5">Le Geste Eco-Citoyen</h3>
                   <p className="text-[9px] text-emerald-800 leading-tight">
                      Privilégiez le covoiturage ou les transports en commun. Une voiture en moins = moins de pollution.
                   </p>
                </div>
             </div>
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                <div className="flex gap-2 mb-1 text-blue-400">
                   <Bike className="w-4 h-4" />
                   <Car className="w-4 h-4 opacity-50" />
                </div>
                <div className="text-[9px] font-bold text-blue-800 uppercase">Mobilité Douce</div>
             </div>
          </section>

          {/* LEGEND & ADVICE GRID */}
          <div className="grid grid-cols-2 gap-6 mb-4">
             {/* Legend */}
             <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-700 uppercase mb-2 text-[10px] flex items-center gap-2 border-b pb-1">
                  <Info className="w-3 h-3" />
                  Légende AQI
                </h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                  {[
                    { l: 'Bonne (0-50)', c: COLORS.good },
                    { l: 'Modérée (51-100)', c: COLORS.moderate },
                    { l: 'Médiocre (101-150)', c: COLORS.unhealthySens },
                    { l: 'Mauvaise (151-200)', c: COLORS.unhealthy },
                    { l: 'Très Mauv. (201-300)', c: COLORS.veryUnhealthy },
                    { l: 'Danger (300+)', c: COLORS.hazardous },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.c }} />
                      <span className="text-[9px] text-slate-600 font-medium whitespace-nowrap">{item.l}</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Advice */}
             <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-orange-900 uppercase mb-2 text-[10px] flex items-center gap-2 border-b border-orange-200 pb-1">
                  <ThermometerSun className="w-3 h-3" />
                  Recommandations
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-orange-800 block mb-0.5">Population Générale</span>
                    <p className="text-[9px] text-slate-700 leading-tight pl-2 border-l-2 border-orange-200">{advice.general}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-orange-800 block mb-0.5">Personnes Vulnérables</span>
                    <p className="text-[9px] text-slate-700 leading-tight pl-2 border-l-2 border-orange-200">{advice.sensitive}</p>
                  </div>
                </div>
             </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-auto text-center border-t-4 border-blue-900 pt-4">
            <p className="font-bold text-blue-900 text-xs uppercase mb-0.5">Agence Nationale de la Météorologie (MALI MÉTÉO)</p>
            <p className="text-[9px] text-slate-500">
              Siège Social : Bamako, Mali • Tél : (+223) 20 20 20 20 • Site Web : www.malimeteo.ml
            </p>
            <p className="text-[8px] text-slate-400 mt-2 italic bg-slate-50 inline-block px-3 py-0.5 rounded-full">
              Bulletin généré le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
