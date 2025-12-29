import { useRef } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Printer, Activity, AlertTriangle, Info, ThermometerSun, Wind, Leaf, Bike, Car, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoMaliMeteo from '@assets/generated_images/mali_meteo_real_logo.png';

interface BulletinProps {
  data: DailySummary;
  onReset: () => void;
  onToggleDesign?: () => void;
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

export function Bulletin({ data, onReset, onToggleDesign }: BulletinProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeDate = data.date.replace(/[\/\\:*?"<>|]/g, '-');
    const filename = `Bulletin Classique Qualité de l'air du ${safeDate}`;
    
    document.title = filename;

    setTimeout(() => {
      window.print();
      
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    }, 500);
  };

  const advice = getHealthAdvice(data.cityMaxAQI);

  return (
    <div className="flex flex-col items-center bg-slate-100 min-h-screen">
      <style>{`
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          
          body { 
            margin: 0;
            padding: 0;
            background: white;
          }

          .no-print { display: none !important; }
          
          #root, .min-h-screen {
            margin: 0;
            padding: 0;
            background: white;
            height: auto;
            min-height: 0;
            display: block;
          }

          #bulletin-content {
            margin: 0 !important;
            padding: 10mm 14mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            position: absolute;
            top: 0;
            left: 0;
            background: white;
            overflow: visible;
            transform: none !important;
          }

          #bulletin-wrapper {
            box-shadow: none !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        @media screen {
          #bulletin-content {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            box-sizing: border-box;
          }
        }
      `}</style>
      {/* Toolbar - Hidden in print */}
      <div className="flex gap-3 my-8 sticky top-4 z-50 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg border no-print">
        <Button variant="outline" onClick={onReset} className="rounded-full" data-testid="button-new">
          Nouveau
        </Button>
        {onToggleDesign && (
          <Button variant="outline" onClick={onToggleDesign} className="rounded-full gap-2" data-testid="button-toggle-design">
            <RefreshCw className="w-4 h-4" />
            Design Moderne
          </Button>
        )}
        <Button onClick={handlePrint} className="bg-blue-900 hover:bg-blue-800 text-white rounded-full gap-2" data-testid="button-print">
          <Printer className="w-4 h-4" />
          Imprimer / PDF
        </Button>
      </div>

      {/* A4 Document Container */}
      <div id="bulletin-wrapper" className="shadow-2xl mb-20 bg-white rounded-lg overflow-hidden">
        <div 
          ref={contentRef}
          id="bulletin-content"
          className="bg-white relative text-slate-800 flex flex-col justify-between p-[10mm_14mm] box-border"
        >
          {/* HEADER */}
          <header className="flex justify-between items-start border-b-2 border-blue-900 pb-3 mb-4">
            <div className="w-1/4 flex flex-col items-center justify-center">
               <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-white border border-slate-100 shadow-sm">
                 <img 
                   src={logoMaliMeteo} 
                   alt="Logo MALI METEO" 
                   className="w-full h-full object-cover scale-110" 
                 />
               </div>
            </div>
            
            <div className="w-2/4 text-center pt-1">
              <h2 className="text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">République du Mali</h2>
              <h3 className="text-[9px] italic text-slate-400 mb-1">Un Peuple - Un But - Une Foi</h3>
              <h1 className="text-2xl font-bold text-blue-900 uppercase font-serif leading-tight mb-1">Bulletin<br/>Qualité de l'Air</h1>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide px-3 py-0.5 bg-blue-50 rounded-full inline-block border border-blue-100">
                Zone de Bamako
              </div>
            </div>

            <div className="w-1/4 text-right pt-2">
              <div className="text-[9px] uppercase text-slate-400 mb-0.5 font-medium">Date du relevé</div>
              <div className="font-bold text-base text-blue-900 border-l-4 border-blue-900 pl-2">
                {data.date}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5 font-medium flex justify-end items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-green-500" /> Validité: 24h
              </div>
            </div>
          </header>

          {/* SUMMARY SECTION */}
          <section className="mb-5">
            <div className="flex items-stretch bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="w-1/3 p-3 flex flex-col items-center justify-center border-r border-slate-100">
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Indice Global</div>
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-1 relative z-10 border-4 border-white"
                    style={{ backgroundColor: getStatusColor(data.cityMaxAQI) }}
                  >
                    {data.cityMaxAQI}
                  </div>
                </div>
                <div className="font-bold text-base uppercase tracking-tight" style={{ color: getStatusColor(data.cityMaxAQI) }}>
                  {getAQILabel(data.cityMaxAQI)}
                </div>
              </div>
              <div className="w-2/3 p-4 flex flex-col justify-center">
                <h3 className="font-bold text-blue-900 uppercase mb-2 text-xs flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Synthèse de la journée
                </h3>
                <p className="text-xs text-slate-700 text-justify leading-relaxed font-medium">
                  L'indice de qualité de l'air (AQI) atteint un maximum de <strong className="text-blue-900">{data.cityMaxAQI}</strong> aujourd'hui. 
                  La qualité de l'air est qualifiée de <strong style={{ color: getStatusColor(data.cityMaxAQI) }}>{getAQILabel(data.cityMaxAQI).toLowerCase()}</strong>.
                </p>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                  Le polluant majoritaire observé sur le réseau de surveillance est le <strong className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">{data.criticalPollutant || 'PM10'}</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* DATA TABLE */}
          <section className="mb-5">
            <h3 className="font-bold text-blue-900 uppercase mb-2 text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5" />
              Détails du Réseau de Surveillance (Concentrations Max)
            </h3>
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
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
                    <tr key={i} className="text-slate-700 odd:bg-white even:bg-slate-50 border-b border-slate-100 last:border-0">
                      <td className="p-2 font-bold text-slate-800 truncate max-w-[110px]" title={s.name}>
                        {s.name.replace('ML_', '').replace(/_/g, ' ').replace('Qualité Air', '').replace('QA', '').trim()}
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

          {/* ECO GESTE */}
          <section className="mb-5 grid grid-cols-3 gap-3">
             <div className="col-span-2 bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-700">
                   <Leaf className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-emerald-900 text-[11px] uppercase mb-0.5">Le Geste Eco-Citoyen</h3>
                   <p className="text-[10px] text-emerald-800 leading-snug">
                      Privilégiez le covoiturage ou les transports en commun. Une voiture en moins = moins de pollution.
                   </p>
                </div>
             </div>
             <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col justify-center items-center text-center shadow-sm">
                <div className="flex gap-2 mb-1 text-blue-400">
                   <Bike className="w-5 h-5" />
                   <Car className="w-5 h-5 opacity-50" />
                </div>
                <div className="text-[10px] font-bold text-blue-800 uppercase">Mobilité Douce</div>
             </div>
          </section>

          {/* LEGEND & ADVICE GRID */}
          <div className="grid grid-cols-2 gap-4 mb-5">
             {/* Legend */}
             <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                <h3 className="font-bold text-slate-700 uppercase mb-2 text-[10px] flex items-center gap-1.5 border-b pb-2">
                  <Info className="w-3 h-3" />
                  Légende AQI (Indice de Qualité)
                </h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {[
                    { l: 'Bonne (0-50)', c: COLORS.good },
                    { l: 'Modérée (51-100)', c: COLORS.moderate },
                    { l: 'Médiocre (101-150)', c: COLORS.unhealthySens },
                    { l: 'Mauvaise (151-200)', c: COLORS.unhealthy },
                    { l: 'Très Mauv. (201-300)', c: COLORS.veryUnhealthy },
                    { l: 'Danger (300+)', c: COLORS.hazardous },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: item.c }} />
                      <span className="text-[9px] text-slate-600 font-medium">{item.l}</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Advice */}
             <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 shadow-sm">
                <h3 className="font-bold text-orange-900 uppercase mb-2 text-[10px] flex items-center gap-1.5 border-b border-orange-200 pb-2">
                  <ThermometerSun className="w-3 h-3" />
                  Recommandations
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-orange-800 block mb-0.5 flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" /> Population Générale
                    </span>
                    <p className="text-[9px] text-slate-700 leading-snug pl-3 border-l-2 border-orange-200">{advice.general}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-orange-800 block mb-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Personnes Vulnérables
                    </span>
                    <p className="text-[9px] text-slate-700 leading-snug pl-3 border-l-2 border-orange-200">{advice.sensitive}</p>
                  </div>
                </div>
             </div>
          </div>

          {/* FOOTER */}
          <footer className="text-center border-t-2 border-blue-900 pt-4">
            <p className="font-bold text-blue-900 text-[11px] uppercase">Agence Nationale de la Météorologie (MALI MÉTÉO)</p>
          </footer>

        </div>
      </div>
    </div>
  );
}
