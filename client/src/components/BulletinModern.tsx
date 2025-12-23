import { useRef } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Printer, AlertTriangle, Cloud, Droplets, Wind, Flame, Activity, Info, ChevronUp, Shield, MapPin, RefreshCw, CheckCircle, Sun, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoMaliMeteo from '@assets/generated_images/mali_meteo_real_logo.png';

interface BulletinModernProps {
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

const pollutantData = [
  { key: 'PM2.5', label: 'Particules fines', icon: Cloud },
  { key: 'PM10', label: 'Particules inhalables', icon: Cloud },
  { key: 'O3', label: 'Ozone', icon: Sun },
  { key: 'NO2', label: "Dioxyde d'azote", icon: Flame },
  { key: 'SO2', label: 'Dioxyde de soufre', icon: Droplets },
  { key: 'CO', label: 'Monoxyde de carbone', icon: Zap },
];

export function BulletinModern({ data, onReset, onToggleDesign }: BulletinModernProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeDate = data.date.replace(/[\/\\:*?"<>|]/g, '-');
    const filename = `Bulletin Qualité de l'air du ${safeDate}`;
    document.title = filename;

    setTimeout(() => {
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 500);
    }, 500);
  };

  const advice = getHealthAdvice(data.cityMaxAQI);
  const mainStation = data.stations.find(s => s.aqi === data.cityMaxAQI) || data.stations[0];
  const mainPollutant = mainStation?.mainPollutant || 'PM10';
  
  const getConcentration = () => {
    if (!mainStation) return '---';
    switch(mainPollutant) {
      case 'PM10': return `${mainStation.maxPM10.toFixed(0)} µg/m³`;
      case 'PM2.5': return `${mainStation.maxPM25.toFixed(0)} µg/m³`;
      case 'NO2': return `${mainStation.maxNO2.toFixed(0)} ppb`;
      case 'SO2': return `${mainStation.maxSO2.toFixed(0)} ppb`;
      case 'CO': return `${mainStation.maxCO.toFixed(0)} ppb`;
      case 'O3': return `${mainStation.maxO3.toFixed(0)} ppb`;
      default: return '---';
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-100 min-h-screen p-8">
      <style>{`
        @media print {
          @page { 
            size: A4; 
            margin: 0; 
          }
          
          html, body { 
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white;
            overflow: hidden !important;
          }

          body * {
            visibility: hidden;
          }

          #bulletin-modern-content, #bulletin-modern-content * {
            visibility: visible;
          }

          #bulletin-modern-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 210mm;
            height: 297mm;
            padding: 0 !important;
            margin: 0 !important;
            background: white;
            z-index: 9999;
            transform: scale(0.95);
            transform-origin: top left;
            display: flex;
            flex-direction: column;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
        }

        @media screen {
          #bulletin-modern-content {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            box-sizing: border-box;
          }
        }
      `}</style>

      <div className="flex gap-3 mb-8 sticky top-4 z-50 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg border no-print">
        <Button variant="outline" onClick={onReset} className="rounded-full" data-testid="button-new-modern">
          Nouveau
        </Button>
        {onToggleDesign && (
          <Button variant="outline" onClick={onToggleDesign} className="rounded-full gap-2" data-testid="button-toggle-design-modern">
            <RefreshCw className="w-4 h-4" />
            Design Classique
          </Button>
        )}
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full gap-2" data-testid="button-print-modern">
          <Printer className="w-4 h-4" />
          Imprimer / Enregistrer PDF
        </Button>
      </div>

      <div className="shadow-2xl mb-20 bg-white rounded-lg overflow-hidden">
        <div 
          ref={contentRef}
          id="bulletin-modern-content"
          className="relative text-slate-800 flex flex-col"
        >
          {/* HEADER - Blue Gradient */}
          <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
                <img src={logoMaliMeteo} alt="Mali Météo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">MALI MÉTÉO</h1>
                <p className="text-xs opacity-90 uppercase tracking-wider">Bulletin Qualité de l'Air de Bamako</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase opacity-70 mb-1">Date du Relevé</p>
              <p className="text-3xl font-bold">{data.date}</p>
              <span className="text-[10px] bg-green-500 px-3 py-1 rounded-full uppercase font-semibold inline-flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3" /> Validité: 24H
              </span>
            </div>
          </header>

          {/* ALERT BANNER */}
          <div className="bg-amber-400 text-amber-900 text-center py-2.5 px-4 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Alerte : Qualité de l'Air {getAQILabel(data.cityMaxAQI)} (AQI: {data.cityMaxAQI})
            </span>
          </div>

          {/* MAIN CONTENT */}
          <div className="p-6 flex-1">
            {/* AQI + Pollutants Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Left: AQI Display */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <p className="text-center text-sm text-slate-500 mb-1">Indice de Qualité de l'Air (AQI)</p>
                <p className="text-center text-xs text-slate-400 mb-4">Valeur maximale mesurée</p>
                
                <div className="text-center mb-5">
                  <span 
                    className="text-8xl font-bold inline-block leading-none"
                    style={{ color: getStatusColor(data.cityMaxAQI) }}
                  >
                    {data.cityMaxAQI}
                  </span>
                  <p 
                    className="text-xl font-bold uppercase mt-2"
                    style={{ color: getStatusColor(data.cityMaxAQI) }}
                  >
                    {getAQILabel(data.cityMaxAQI)}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(data.cityMaxAQI) }} />
                    <span className="text-slate-700"><strong>Polluant Critique :</strong> {mainPollutant}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    <span className="text-slate-700"><strong>Station :</strong> {mainStation?.name.replace('ML_', '').replace(/_/g, ' ').replace('QA', '').trim()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-700"><strong>Concentration Maximale :</strong> {getConcentration()}</span>
                  </div>
                </div>
              </div>

              {/* Right: Pollutants Grid */}
              <div>
                <h3 className="text-sm font-bold text-blue-600 uppercase mb-4 flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Polluants Surveillés
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {pollutantData.map((pollutant) => {
                    const isMain = pollutant.key === mainPollutant;
                    const IconComponent = pollutant.icon;
                    return (
                      <div 
                        key={pollutant.key}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          isMain 
                            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 mx-auto mb-2 ${isMain ? 'text-blue-600' : 'text-slate-400'}`} />
                        <p className={`font-bold text-base ${isMain ? 'text-blue-700' : 'text-slate-700'}`}>{pollutant.key}</p>
                        <p className="text-[10px] text-slate-500">{pollutant.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Health Recommendations */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
              <h3 className="text-sm font-bold text-blue-600 uppercase mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Recommandations Santé
              </h3>
              <div className="space-y-3 text-sm">
                <p>
                  <strong className="text-slate-800">Population Générale :</strong>{' '}
                  <span className="text-slate-600">{advice.general}</span>
                </p>
                <p>
                  <strong className="text-slate-800">Groupes sensibles :</strong>{' '}
                  <span className="text-slate-600">{advice.sensitive}</span>
                </p>
              </div>
            </div>

            {/* AQI Scale */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Échelle de Qualité de l'Air (AQI)
              </h3>
              <div className="flex rounded-xl overflow-hidden text-[9px] font-bold text-white shadow-sm">
                <div className="flex-1 py-2.5 text-center" style={{ backgroundColor: COLORS.good }}>Bonne (0-50)</div>
                <div className="flex-1 py-2.5 text-center text-slate-800" style={{ backgroundColor: COLORS.moderate }}>Modérée (51-100)</div>
                <div className="flex-1 py-2.5 text-center" style={{ backgroundColor: COLORS.unhealthySens }}>Peu Saine GS (101-150)</div>
                <div className="flex-1 py-2.5 text-center" style={{ backgroundColor: COLORS.unhealthy }}>Peu Saine (151-200)</div>
                <div className="flex-1 py-2.5 text-center" style={{ backgroundColor: COLORS.veryUnhealthy }}>Très Peu Saine (201-300)</div>
                <div className="flex-1 py-2.5 text-center" style={{ backgroundColor: COLORS.hazardous }}>Dangereuse (301-500)</div>
              </div>
            </div>

            {/* Understanding Section */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Comprendre Notre Bulletin
              </h3>
              <div className="grid grid-cols-3 gap-6 text-xs">
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <ChevronUp className="w-4 h-4 text-blue-500" /> AQI (Score central)
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Indique la gravité de la pollution maximale mesurée. Plus le chiffre est élevé (jusqu'à 500), plus l'air est potentiellement nocif pour la santé.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> Polluant Critique
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    C'est la substance (particules fines, ozone, etc.) dont la concentration est la plus élevée et qui donne le score AQI de la journée.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-500" /> Recommandations
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Suivez-les strictement pour minimiser votre exposition et protéger les groupes sensibles (enfants, personnes âgées, etc.).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="bg-slate-100 text-center py-4 border-t border-slate-200 mt-auto">
            <p className="text-xs font-bold text-slate-600 uppercase">
              Mali Météo - Agence Nationale de la Météorologie
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
