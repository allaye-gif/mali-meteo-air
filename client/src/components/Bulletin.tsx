import { useRef } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Printer, Activity, AlertTriangle, Info, ThermometerSun, Wind, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoMaliMeteo from '@assets/generated_images/mali_meteo_real_logo.png';

interface BulletinProps {
  data: DailySummary;
  onReset: () => void;
}

const COLORS = {
  good: '#22c55e',     
  moderate: '#eab308', 
  unhealthySens: '#f97316', 
  unhealthy: '#ef4444', 
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
      {/* Toolbar - Hidden in print */}
      <div className="flex gap-4 my-6 sticky top-4 z-50 bg-white/95 backdrop-blur p-3 rounded-full shadow-lg border no-print">
        <Button variant="outline" onClick={onReset} className="rounded-full" data-testid="button-new">
          Nouveau
        </Button>
        <Button onClick={handlePrint} className="bg-blue-900 hover:bg-blue-800 text-white rounded-full gap-2" data-testid="button-print">
          <Printer className="w-4 h-4" />
          Imprimer / PDF
        </Button>
      </div>

      {/* A4 Document */}
      <div id="bulletin-wrapper" className="shadow-2xl mb-16 bg-white">
        <div 
          ref={contentRef}
          id="bulletin-content"
          className="bg-white text-slate-800 flex flex-col"
          style={{ width: '210mm', minHeight: '297mm', padding: '8mm 10mm', boxSizing: 'border-box' }}
        >
          {/* HEADER */}
          <header className="flex justify-between items-center border-b-2 border-blue-900 pb-3 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-white flex-shrink-0">
              <img src={logoMaliMeteo} alt="Mali Météo" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 text-center px-4">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">République du Mali</p>
              <p className="text-[8px] italic text-slate-400 mb-1">Un Peuple - Un But - Une Foi</p>
              <h1 className="text-xl font-bold text-blue-900 uppercase leading-tight">Bulletin Qualité de l'Air</h1>
              <span className="text-[9px] font-semibold text-blue-600 uppercase">Zone de Bamako</span>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-[9px] uppercase text-slate-400 mb-0.5">Date</p>
              <p className="font-bold text-base text-blue-900">{data.date}</p>
              <p className="text-[8px] text-slate-400 mt-0.5">Validité: 24h</p>
            </div>
          </header>

          {/* SUMMARY */}
          <section className="mb-4 flex bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
            <div className="w-28 p-3 flex flex-col items-center justify-center border-r border-slate-200 bg-white">
              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Indice Global</p>
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md"
                style={{ backgroundColor: getStatusColor(data.cityMaxAQI) }}
              >
                {data.cityMaxAQI}
              </div>
              <p className="font-bold text-[10px] uppercase mt-1" style={{ color: getStatusColor(data.cityMaxAQI) }}>
                {getAQILabel(data.cityMaxAQI)}
              </p>
            </div>
            <div className="flex-1 p-3">
              <h3 className="font-bold text-blue-900 uppercase text-[10px] mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Synthèse
              </h3>
              <p className="text-[9px] text-slate-600 leading-relaxed">
                L'indice de qualité de l'air atteint <strong className="text-blue-900">{data.cityMaxAQI}</strong> (qualité <strong style={{ color: getStatusColor(data.cityMaxAQI) }}>{getAQILabel(data.cityMaxAQI).toLowerCase()}</strong>).
                Le polluant majoritaire est le <strong className="bg-slate-200 px-1 rounded">{data.stations.find(s => s.aqi === data.cityMaxAQI)?.mainPollutant || 'PM'}</strong>.
              </p>
            </div>
          </section>

          {/* TABLE */}
          <section className="mb-4 flex-1">
            <h3 className="font-bold text-blue-900 uppercase text-[9px] mb-2 flex items-center gap-1 border-b border-slate-200 pb-1">
              <Wind className="w-3 h-3" /> Concentrations Maximales par Station
            </h3>
            <table className="w-full text-[9px] border-collapse border border-slate-300 rounded overflow-hidden">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="p-1.5 text-left font-semibold">Station</th>
                  <th className="p-1.5 text-center font-semibold border-l border-slate-600">NO2<br/><span className="font-normal opacity-70 text-[7px]">ppb</span></th>
                  <th className="p-1.5 text-center font-semibold border-l border-slate-600">SO2<br/><span className="font-normal opacity-70 text-[7px]">ppb</span></th>
                  <th className="p-1.5 text-center font-semibold border-l border-slate-600">CO<br/><span className="font-normal opacity-70 text-[7px]">ppb</span></th>
                  <th className="p-1.5 text-center font-semibold border-l border-slate-600">O3<br/><span className="font-normal opacity-70 text-[7px]">ppb</span></th>
                  <th className="p-1.5 text-center font-semibold border-l border-slate-600">PM2.5<br/><span className="font-normal opacity-70 text-[7px]">µg/m³</span></th>
                  <th className="p-1.5 text-center font-semibold border-l border-slate-600">PM10<br/><span className="font-normal opacity-70 text-[7px]">µg/m³</span></th>
                  <th className="p-1.5 text-center font-bold border-l border-slate-600 bg-blue-800">AQI</th>
                </tr>
              </thead>
              <tbody>
                {data.stations.map((s, i) => (
                  <tr key={i} className="odd:bg-white even:bg-slate-50 border-t border-slate-200">
                    <td className="p-1.5 font-semibold text-slate-700">
                      {s.name.replace('ML_', '').replace(/_/g, ' ').replace('Qualité Air', '').replace('QA', '').trim()}
                    </td>
                    <td className="p-1.5 text-center border-l border-slate-200">{s.maxNO2.toFixed(0)}</td>
                    <td className="p-1.5 text-center border-l border-slate-200">{s.maxSO2.toFixed(0)}</td>
                    <td className="p-1.5 text-center border-l border-slate-200">{s.maxCO.toFixed(0)}</td>
                    <td className="p-1.5 text-center border-l border-slate-200">{s.maxO3.toFixed(0)}</td>
                    <td className="p-1.5 text-center border-l border-slate-200">{s.maxPM25.toFixed(0)}</td>
                    <td className="p-1.5 text-center border-l border-slate-200">{s.maxPM10.toFixed(0)}</td>
                    <td className="p-1.5 text-center font-bold border-l border-slate-200">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(s.aqi) }} />
                        {s.aqi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* BOTTOM SECTION */}
          <div className="mt-auto space-y-3">
            {/* Eco Tip */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-3">
              <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-800 text-[9px] uppercase">Geste Eco-Citoyen</p>
                <p className="text-[8px] text-emerald-700">Privilégiez le covoiturage ou les transports en commun pour réduire la pollution.</p>
              </div>
            </div>

            {/* Legend + Advice */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                <h4 className="font-bold text-slate-600 uppercase text-[8px] mb-1.5 flex items-center gap-1 border-b pb-1">
                  <Info className="w-2.5 h-2.5" /> Légende AQI
                </h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {[
                    { l: 'Bonne (0-50)', c: COLORS.good },
                    { l: 'Modérée (51-100)', c: COLORS.moderate },
                    { l: 'Médiocre (101-150)', c: COLORS.unhealthySens },
                    { l: 'Mauvaise (151-200)', c: COLORS.unhealthy },
                    { l: 'Très Mauv. (201-300)', c: COLORS.veryUnhealthy },
                    { l: 'Danger (300+)', c: COLORS.hazardous },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.c }} />
                      <span className="text-[7px] text-slate-600">{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                <h4 className="font-bold text-orange-800 uppercase text-[8px] mb-1.5 flex items-center gap-1 border-b border-orange-200 pb-1">
                  <ThermometerSun className="w-2.5 h-2.5" /> Recommandations
                </h4>
                <div className="space-y-1">
                  <div>
                    <p className="text-[7px] font-bold text-orange-700 uppercase flex items-center gap-0.5">
                      <Activity className="w-2 h-2" /> Population Générale
                    </p>
                    <p className="text-[7px] text-slate-600 pl-2 border-l border-orange-200">{advice.general}</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-bold text-orange-700 uppercase flex items-center gap-0.5">
                      <AlertTriangle className="w-2 h-2" /> Personnes Vulnérables
                    </p>
                    <p className="text-[7px] text-slate-600 pl-2 border-l border-orange-200">{advice.sensitive}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center border-t-2 border-blue-900 pt-2">
              <p className="font-bold text-blue-900 text-[9px] uppercase">Agence Nationale de la Météorologie (MALI MÉTÉO)</p>
              <p className="text-[8px] text-slate-500">Bamako, Mali • Tél: (+223) 20 20 20 20 • www.malimeteo.ml</p>
              <p className="text-[7px] text-slate-400 mt-0.5 italic">
                Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </footer>
          </div>

        </div>
      </div>
    </div>
  );
}
