import { useRef } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Printer, AlertTriangle, Cloud, Droplets, Factory, Activity, Shield, MapPin, RefreshCw, CheckCircle, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoMaliMeteo from '@assets/generated_images/mali_meteo_real_logo.png';

interface BulletinModernProps {
  data: DailySummary;
  onReset: () => void;
  onToggleDesign?: () => void;
}

const AQI_COLORS = {
  good: '#06B6D4',
  moderate: '#FBBF24',
  unhealthySens: '#F97316',
  unhealthy: '#EF4444',
  veryUnhealthy: '#8B5CF6',
  hazardous: '#78350F',
};

const getStatusColor = (aqi: number) => {
  if (aqi <= 50) return AQI_COLORS.good;
  if (aqi <= 100) return AQI_COLORS.moderate;
  if (aqi <= 150) return AQI_COLORS.unhealthySens;
  if (aqi <= 200) return AQI_COLORS.unhealthy;
  if (aqi <= 300) return AQI_COLORS.veryUnhealthy;
  return AQI_COLORS.hazardous;
};

const pollutantData = [
  { key: 'PM2.5', label: 'Particules fines', icon: Cloud },
  { key: 'PM10', label: 'Particules inhalables', icon: Cloud },
  { key: 'O3', label: 'Ozone', icon: Sun },
  { key: 'NO2', label: "Dioxyde d'azote", icon: Factory },
  { key: 'SO2', label: 'Dioxyde de soufre', icon: Droplets },
  { key: 'CO', label: 'Monoxyde de carbone', icon: User },
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
      
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
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
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center p-6" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          
          body { 
            margin: 0;
            padding: 0;
            background: #F4F7F9;
          }

          .no-print { display: none !important; }
          
          #root, .min-h-screen {
            margin: 0;
            padding: 0;
            background: #F4F7F9;
            height: auto;
            min-height: 0;
            display: block;
          }

          #bulletin-content {
            margin: 0 !important;
            padding: 4mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            border: none !important;
            position: absolute;
            top: 0;
            left: 0;
            background: #F4F7F9;
            overflow: visible;
            transform: scale(0.94);
            transform-origin: top left;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          section, .grid {
            page-break-inside: avoid;
          }
        }

        @media screen {
          #bulletin-content {
            width: 210mm;
            min-height: 296mm;
            background: #F4F7F9;
            margin: 0 auto;
            box-sizing: border-box;
          }
        }
      `}</style>

      <div className="flex gap-3 mb-6 sticky top-4 z-50 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg border no-print">
        <Button variant="outline" onClick={onReset} className="rounded-full" data-testid="button-new-modern">
          Nouveau
        </Button>
        {onToggleDesign && (
          <Button variant="outline" onClick={onToggleDesign} className="rounded-full gap-2" data-testid="button-toggle-design-modern">
            <RefreshCw className="w-4 h-4" />
            Design Classique
          </Button>
        )}
        <Button onClick={handlePrint} className="bg-[#1D70F2] hover:bg-[#1558CC] text-white rounded-full gap-2" data-testid="button-print-modern">
          <Printer className="w-4 h-4" />
          Imprimer / Enregistrer PDF
        </Button>
      </div>

      <div 
        ref={contentRef}
        id="bulletin-content"
        className="flex flex-col p-[8mm] box-border"
      >
        {/* HEADER - Bright Blue #1D70F2 */}
        <header className="bg-[#1D70F2] text-white p-4 flex justify-between items-center rounded-xl mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center shadow">
              <img src={logoMaliMeteo} alt="Mali Météo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">MALI MÉTÉO</h1>
              <p className="text-[10px] text-blue-100 uppercase tracking-wider">Bulletin Qualité de l'Air de Bamako</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase text-blue-200 mb-0.5">Date du Relevé</p>
            <p className="text-2xl font-bold">{data.date}</p>
            <span className="text-[9px] bg-[#10B981] text-white px-2 py-0.5 rounded-full uppercase font-semibold inline-flex items-center gap-1 mt-1">
              <CheckCircle className="w-2.5 h-2.5" strokeWidth={2} /> Validité: 24H
            </span>
          </div>
        </header>

        {/* ALERT BANNER - Dark Brown #78350F */}
        <div className="bg-[#78350F] text-white text-center py-2 px-4 flex items-center justify-center gap-2 rounded-xl mb-4">
          <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-bold text-xs uppercase tracking-wide">
            Alerte : Qualité de l'Air {getAQILabel(data.cityMaxAQI)} (AQI: {data.cityMaxAQI})
          </span>
        </div>

        {/* MAIN CONTENT - Two Column Layout */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* LEFT: Large AQI Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-center text-xs text-gray-500 mb-0.5">Indice de Qualité de l'Air (AQI)</p>
            <p className="text-center text-[10px] text-gray-400 mb-3">Valeur maximale mesurée</p>
            
            <div className="text-center mb-4">
              <span 
                className="text-7xl font-bold inline-block leading-none"
                style={{ color: '#78350F' }}
              >
                {data.cityMaxAQI}
              </span>
              <p 
                className="text-lg font-bold uppercase mt-1"
                style={{ color: '#78350F' }}
              >
                {getAQILabel(data.cityMaxAQI)}
              </p>
            </div>

            <div className="space-y-1.5 text-[10px] border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#78350F]" />
                <span className="text-gray-700"><strong>Polluant Critique :</strong> {mainPollutant}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#1D70F2]" strokeWidth={1.5} />
                <span className="text-gray-700"><strong>Station :</strong> {mainStation?.name.replace('ML_', '').replace(/_/g, ' ').replace('QA', '').trim()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
                <span className="text-gray-700"><strong>Concentration Max :</strong> {getConcentration()}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Pollutants Grid */}
          <div>
            <h3 className="text-xs font-bold text-[#1D70F2] uppercase mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
              Polluants Surveillés
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {pollutantData.map((pollutant) => {
                const isMain = pollutant.key === mainPollutant;
                const IconComponent = pollutant.icon;
                return (
                  <div 
                    key={pollutant.key}
                    className="bg-white p-2.5 rounded-xl text-center shadow-sm"
                    style={{
                      border: isMain ? '3px solid #78350F' : '1px solid #E5E7EB',
                      backgroundColor: isMain ? '#FEF3C7' : 'white'
                    }}
                  >
                    <IconComponent 
                      className={`w-5 h-5 mx-auto mb-1 ${isMain ? 'text-[#78350F]' : 'text-gray-500'}`} 
                      strokeWidth={1.25} 
                    />
                    <p className={`font-bold text-sm ${isMain ? 'text-[#78350F]' : 'text-gray-700'}`}>{pollutant.key}</p>
                    <p className="text-[8px] text-gray-500">{pollutant.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Health Recommendations */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-4">
          <h3 className="text-xs font-bold text-[#1D70F2] uppercase mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
            Recommandations Santé
          </h3>
          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <p>
              <strong className="text-gray-700">Population Générale :</strong>{' '}
              <span className="text-gray-600">{advice.general}</span>
            </p>
            <p>
              <strong className="text-gray-700">Groupes sensibles :</strong>{' '}
              <span className="text-gray-600">{advice.sensitive}</span>
            </p>
          </div>
        </div>

        {/* AQI Scale - Continuous Gradient */}
        <div className="mb-4">
          <h3 className="text-[9px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" strokeWidth={1.5} />
            Échelle de Qualité de l'Air (AQI)
          </h3>
          <div 
            className="h-5 rounded-full relative overflow-hidden"
            style={{
              background: `linear-gradient(90deg, ${AQI_COLORS.good} 0%, ${AQI_COLORS.good} 10%, ${AQI_COLORS.moderate} 20%, ${AQI_COLORS.moderate} 30%, ${AQI_COLORS.unhealthySens} 40%, ${AQI_COLORS.unhealthySens} 50%, ${AQI_COLORS.unhealthy} 60%, ${AQI_COLORS.unhealthy} 66%, ${AQI_COLORS.veryUnhealthy} 75%, ${AQI_COLORS.veryUnhealthy} 83%, ${AQI_COLORS.hazardous} 92%, ${AQI_COLORS.hazardous} 100%)`
            }}
          >
            <div className="absolute inset-0 flex text-[7px] font-bold text-white">
              <span className="flex-1 flex items-center justify-center drop-shadow">Bonne</span>
              <span className="flex-1 flex items-center justify-center text-gray-800 drop-shadow">Modérée</span>
              <span className="flex-1 flex items-center justify-center drop-shadow">Peu Saine GS</span>
              <span className="flex-1 flex items-center justify-center drop-shadow">Peu Saine</span>
              <span className="flex-1 flex items-center justify-center drop-shadow">Très Peu Saine</span>
              <span className="flex-1 flex items-center justify-center drop-shadow">Dangereuse</span>
            </div>
          </div>
          <div className="flex text-[7px] text-gray-500 mt-0.5">
            <span className="flex-1 text-center">0-50</span>
            <span className="flex-1 text-center">51-100</span>
            <span className="flex-1 text-center">101-150</span>
            <span className="flex-1 text-center">151-200</span>
            <span className="flex-1 text-center">201-300</span>
            <span className="flex-1 text-center">301-500</span>
          </div>
        </div>

        {/* Understanding Section - Compact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm mb-3">
          <h3 className="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1.5">
            <Activity className="w-3 h-3" strokeWidth={1.5} />
            Comprendre Notre Bulletin
          </h3>
          <div className="grid grid-cols-3 gap-2 text-[9px]">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-bold text-gray-700 mb-1">AQI (Score central)</p>
              <p className="text-gray-600 leading-tight">
                Indique la gravité de la pollution. Plus le chiffre est élevé, plus l'air est nocif.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-bold text-gray-700 mb-1">Polluant Critique</p>
              <p className="text-gray-600 leading-tight">
                Substance dont la concentration est la plus élevée et donne le score AQI.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-bold text-gray-700 mb-1">Recommandations</p>
              <p className="text-gray-600 leading-tight">
                Suivez-les pour minimiser votre exposition et protéger les groupes sensibles.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-auto text-center border-t-2 border-[#1D70F2] pt-2">
          <p className="font-bold text-[#1D70F2] text-[10px] uppercase">
            Agence Nationale de la Météorologie (MALI MÉTÉO)
          </p>
        </footer>

      </div>
    </div>
  );
}
