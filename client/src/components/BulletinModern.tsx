import { useRef } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Printer, AlertTriangle, Cloud, Droplets, Wind, Flame, Activity, Info, ChevronUp, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoMaliMeteo from '@assets/generated_images/mali_meteo_real_logo.png';

interface BulletinModernProps {
  data: DailySummary;
  onReset: () => void;
  onToggleDesign?: () => void;
}

const getStatusColor = (aqi: number) => {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#a855f7';
  return '#dc2626';
};

const getStatusBgColor = (aqi: number) => {
  if (aqi <= 50) return 'bg-green-500';
  if (aqi <= 100) return 'bg-yellow-500';
  if (aqi <= 150) return 'bg-orange-400';
  if (aqi <= 200) return 'bg-orange-500';
  if (aqi <= 300) return 'bg-purple-500';
  return 'bg-red-600';
};

const pollutantIcons: Record<string, { icon: typeof Cloud; label: string }> = {
  'PM2.5': { icon: Cloud, label: 'Particules fines' },
  'PM10': { icon: Cloud, label: 'Particules inhalables' },
  'O3': { icon: Wind, label: 'Ozone' },
  'NO2': { icon: Flame, label: "Dioxyde d'azote" },
  'SO2': { icon: Droplets, label: 'Dioxyde de soufre' },
  'CO': { icon: Cloud, label: 'Monoxyde de carbone' },
};

export function BulletinModern({ data, onReset, onToggleDesign }: BulletinModernProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeDate = data.date.replace(/[\/\\:*?"<>|]/g, '-');
    document.title = `Bulletin Qualité Air ${safeDate}`;
    setTimeout(() => {
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 500);
    }, 300);
  };

  const advice = getHealthAdvice(data.cityMaxAQI);
  const mainStation = data.stations.find(s => s.aqi === data.cityMaxAQI) || data.stations[0];
  const mainPollutant = mainStation?.mainPollutant || 'PM10';

  return (
    <div className="flex flex-col items-center bg-slate-100 min-h-screen">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          #root, .min-h-screen { margin: 0; padding: 0; background: white; height: auto; min-height: 0; display: block; }
          #bulletin-modern-content {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            position: absolute;
            top: 0;
            left: 0;
            background: white;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          section, .grid { page-break-inside: avoid; }
        }
      `}</style>

      <div className="flex gap-3 my-6 sticky top-4 z-50 bg-white/95 backdrop-blur p-3 rounded-full shadow-lg border no-print">
        <Button variant="outline" onClick={onReset} className="rounded-full" data-testid="button-new-modern">
          Nouveau
        </Button>
        {onToggleDesign && (
          <Button variant="outline" onClick={onToggleDesign} className="rounded-full gap-2" data-testid="button-toggle-design-modern">
            <RefreshCw className="w-4 h-4" />
            Design Classique
          </Button>
        )}
        <Button onClick={handlePrint} className="bg-amber-700 hover:bg-amber-800 text-white rounded-full gap-2" data-testid="button-print-modern">
          <Printer className="w-4 h-4" />
          Imprimer / PDF
        </Button>
      </div>

      <div className="shadow-2xl mb-16 bg-white rounded-xl overflow-hidden" style={{ width: '210mm' }}>
        <div ref={contentRef} id="bulletin-modern-content" className="flex flex-col" style={{ minHeight: '297mm' }}>
          
          {/* HEADER - Brown/Bronze Theme */}
          <header className="bg-gradient-to-r from-amber-800 to-amber-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                <img src={logoMaliMeteo} alt="Mali Météo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide">MALI MÉTÉO</h1>
                <p className="text-[10px] opacity-80 uppercase tracking-wider">Bulletin Qualité de l'Air de Bamako</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase opacity-70">Date du Relevé</p>
              <p className="text-2xl font-bold">{data.date}</p>
              <span className="text-[9px] bg-green-500 px-2 py-0.5 rounded-full uppercase font-semibold">
                ✓ Validité: 24H
              </span>
            </div>
          </header>

          {/* ALERT BANNER */}
          <div className={`${getStatusBgColor(data.cityMaxAQI)} text-white text-center py-2 px-4 flex items-center justify-center gap-2`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Alerte : Qualité de l'Air {getAQILabel(data.cityMaxAQI)} (AQI: {data.cityMaxAQI})
            </span>
          </div>

          {/* MAIN CONTENT */}
          <div className="p-5 flex-1">
            {/* AQI + Pollutants Grid */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              {/* Left: AQI Display */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <p className="text-center text-xs text-slate-500 uppercase tracking-wider mb-1">Indice de Qualité de l'Air (AQI)</p>
                <p className="text-center text-[10px] text-slate-400 mb-3">Valeur maximale mesurée</p>
                
                <div className="text-center mb-4">
                  <span 
                    className="text-7xl font-bold inline-block"
                    style={{ color: getStatusColor(data.cityMaxAQI) }}
                  >
                    {data.cityMaxAQI}
                  </span>
                  <p 
                    className="text-lg font-bold uppercase mt-1"
                    style={{ color: getStatusColor(data.cityMaxAQI) }}
                  >
                    {getAQILabel(data.cityMaxAQI)}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(data.cityMaxAQI) }} />
                    <span className="text-slate-600"><strong>Polluant Critique :</strong> {mainPollutant}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-600"><strong>Station :</strong> {mainStation?.name.replace('ML_', '').replace(/_/g, ' ').replace('QA', '').trim()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronUp className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600"><strong>Concentration Max :</strong> {
                      mainPollutant === 'PM10' ? `${mainStation?.maxPM10.toFixed(0)} µg/m³` :
                      mainPollutant === 'PM2.5' ? `${mainStation?.maxPM25.toFixed(0)} µg/m³` :
                      mainPollutant === 'NO2' ? `${mainStation?.maxNO2.toFixed(0)} ppb` :
                      mainPollutant === 'SO2' ? `${mainStation?.maxSO2.toFixed(0)} ppb` :
                      mainPollutant === 'CO' ? `${mainStation?.maxCO.toFixed(0)} ppb` :
                      `${mainStation?.maxO3.toFixed(0)} ppb`
                    }</span>
                  </div>
                </div>
              </div>

              {/* Right: Pollutants Grid */}
              <div>
                <h3 className="text-sm font-bold text-blue-600 uppercase mb-3 flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Polluants Surveillés
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['PM2.5', 'PM10', 'O3', 'NO2', 'SO2', 'CO'].map((pollutant) => {
                    const isMain = pollutant === mainPollutant;
                    const IconComponent = pollutantIcons[pollutant]?.icon || Cloud;
                    return (
                      <div 
                        key={pollutant}
                        className={`p-3 rounded-lg border text-center ${isMain ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <IconComponent className={`w-5 h-5 mx-auto mb-1 ${isMain ? 'text-blue-600' : 'text-slate-400'}`} />
                        <p className={`font-bold text-sm ${isMain ? 'text-blue-700' : 'text-slate-700'}`}>{pollutant}</p>
                        <p className="text-[9px] text-slate-500">{pollutantIcons[pollutant]?.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Health Recommendations */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
              <h3 className="text-sm font-bold text-blue-600 uppercase mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Recommandations Santé
              </h3>
              <div className="space-y-2 text-xs">
                <p>
                  <strong className="text-slate-700">Population Générale :</strong>{' '}
                  <span className="text-slate-600">{advice.general}</span>
                </p>
                <p>
                  <strong className="text-slate-700">Groupes sensibles :</strong>{' '}
                  <span className="text-slate-600">{advice.sensitive}</span>
                </p>
              </div>
            </div>

            {/* AQI Scale */}
            <div className="mb-5">
              <h3 className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Échelle de Qualité de l'Air (AQI)
              </h3>
              <div className="flex rounded-lg overflow-hidden text-[8px] font-semibold text-white">
                <div className="flex-1 bg-green-500 py-1.5 text-center">Bonne (0-50)</div>
                <div className="flex-1 bg-yellow-500 py-1.5 text-center text-slate-800">Modérée (51-100)</div>
                <div className="flex-1 bg-orange-400 py-1.5 text-center">Peu Saine GS (101-150)</div>
                <div className="flex-1 bg-orange-500 py-1.5 text-center">Peu Saine (151-200)</div>
                <div className="flex-1 bg-purple-500 py-1.5 text-center">Très Peu Saine (201-300)</div>
                <div className="flex-1 bg-red-600 py-1.5 text-center">Dangereuse (301-500)</div>
              </div>
            </div>

            {/* Understanding Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Comprendre Notre Bulletin
              </h3>
              <div className="grid grid-cols-3 gap-4 text-[10px]">
                <div>
                  <p className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <ChevronUp className="w-3 h-3" /> AQI (Score central)
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Indique la gravité de la pollution maximale mesurée. Plus le chiffre est élevé (jusqu'à 500), plus l'air est potentiellement nocif pour la santé.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Polluant Critique
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    C'est la substance (particules fines, ozone, etc.) dont la concentration est la plus élevée et qui donne le score AQI de la journée.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Recommandations
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Suivez-les strictement pour minimiser votre exposition et protéger les groupes sensibles (enfants, personnes âgées, etc.).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="bg-slate-100 text-center py-3 border-t border-slate-200 mt-auto">
            <p className="text-[10px] font-semibold text-slate-600 uppercase">
              Mali Météo - Agence Nationale de la Météorologie
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
