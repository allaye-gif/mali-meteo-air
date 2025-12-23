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

const AQI_COLORS = {
  good: '#6FBF73',
  moderate: '#F2B94C',
  unhealthySens: '#F28B50',
  unhealthy: '#E56D64',
  veryUnhealthy: '#B25AA7',
  hazardous: '#7B3F85',
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
    <div className="flex flex-col items-center bg-[#F5F0EB] min-h-screen p-8">
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

          #bulletin-content, #bulletin-content * {
            visibility: visible;
          }

          #bulletin-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 210mm;
            height: 297mm;
            padding: 15mm !important;
            margin: 0 !important;
            background: white;
            z-index: 9999;
            transform: scale(0.95);
            transform-origin: top left;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
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
          #bulletin-content {
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
        <Button onClick={handlePrint} className="bg-[#4B2A17] hover:bg-[#3A2012] text-white rounded-full gap-2" data-testid="button-print-modern">
          <Printer className="w-4 h-4" />
          Imprimer / Enregistrer PDF
        </Button>
      </div>

      <div className="shadow-[0_12px_40px_rgba(75,42,23,0.08)] mb-20 bg-white rounded-lg overflow-hidden">
        <div 
          ref={contentRef}
          id="bulletin-content"
          className="relative text-[#3D3D3D] flex flex-col p-[15mm] box-border"
        >
          {/* HEADER - Bronze/Brown Theme */}
          <header className="bg-gradient-to-r from-[#4B2A17] to-[#6C3B1F] text-[#F6E6D0] p-5 flex justify-between items-center rounded-xl mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
                <img src={logoMaliMeteo} alt="Mali Météo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide text-white">MALI MÉTÉO</h1>
                <p className="text-xs opacity-90 uppercase tracking-wider">Bulletin Qualité de l'Air de Bamako</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase opacity-70 mb-1">Date du Relevé</p>
              <p className="text-3xl font-bold text-white">{data.date}</p>
              <span className="text-[10px] bg-[#6FBF73] text-white px-3 py-1 rounded-full uppercase font-semibold inline-flex items-center gap-1 mt-1 shadow-sm">
                <CheckCircle className="w-3 h-3" /> Validité: 24H
              </span>
            </div>
          </header>

          {/* ALERT BANNER - Clay/Warm Yellow */}
          <div className="bg-[#F3CDA4] text-[#7A4A21] text-center py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl mb-4">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Alerte : Qualité de l'Air {getAQILabel(data.cityMaxAQI)} (AQI: {data.cityMaxAQI})
            </span>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* AQI + Pollutants Grid */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              {/* Left: AQI Display */}
              <div className="bg-[#FDF7F0] rounded-2xl p-5 border border-[#EDE5DC] shadow-[0_4px_20px_rgba(75,42,23,0.04)]">
                <p className="text-center text-sm text-[#6B5A4E] mb-1">Indice de Qualité de l'Air (AQI)</p>
                <p className="text-center text-xs text-[#8C7B6F] mb-3">Valeur maximale mesurée</p>
                
                <div className="text-center mb-4">
                  <span 
                    className="text-7xl font-bold inline-block leading-none"
                    style={{ color: getStatusColor(data.cityMaxAQI) }}
                  >
                    {data.cityMaxAQI}
                  </span>
                  <p 
                    className="text-lg font-bold uppercase mt-2"
                    style={{ color: getStatusColor(data.cityMaxAQI) }}
                  >
                    {getAQILabel(data.cityMaxAQI)}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(data.cityMaxAQI) }} />
                    <span className="text-[#5A4A3F]"><strong>Polluant Critique :</strong> {mainPollutant}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#4B2A17]" />
                    <span className="text-[#5A4A3F]"><strong>Station :</strong> {mainStation?.name.replace('ML_', '').replace(/_/g, ' ').replace('QA', '').trim()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-[#8C7B6F]" />
                    <span className="text-[#5A4A3F]"><strong>Concentration Maximale :</strong> {getConcentration()}</span>
                  </div>
                </div>
              </div>

              {/* Right: Pollutants Grid */}
              <div>
                <h3 className="text-sm font-bold text-[#4B2A17] uppercase mb-3 flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Polluants Surveillés
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {pollutantData.map((pollutant) => {
                    const isMain = pollutant.key === mainPollutant;
                    const IconComponent = pollutant.icon;
                    return (
                      <div 
                        key={pollutant.key}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isMain 
                            ? 'bg-[#E8F4F8] border-[#4B8CA8]' 
                            : 'bg-[#FDF7F0] border-[#EDE5DC]'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 mx-auto mb-1.5 ${isMain ? 'text-[#4B8CA8]' : 'text-[#A89888]'}`} />
                        <p className={`font-bold text-sm ${isMain ? 'text-[#4B8CA8]' : 'text-[#5A4A3F]'}`}>{pollutant.key}</p>
                        <p className="text-[9px] text-[#8C7B6F]">{pollutant.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Health Recommendations */}
            <div className="bg-[#FDF7F0] rounded-2xl p-4 border border-[#EDE5DC] shadow-[0_4px_20px_rgba(75,42,23,0.04)] mb-5">
              <h3 className="text-sm font-bold text-[#4B2A17] uppercase mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Recommandations Santé
              </h3>
              <div className="space-y-2 text-xs">
                <p>
                  <strong className="text-[#4B2A17]">Population Générale :</strong>{' '}
                  <span className="text-[#5A4A3F]">{advice.general}</span>
                </p>
                <p>
                  <strong className="text-[#4B2A17]">Groupes sensibles :</strong>{' '}
                  <span className="text-[#5A4A3F]">{advice.sensitive}</span>
                </p>
              </div>
            </div>

            {/* AQI Scale */}
            <div className="mb-5">
              <h3 className="text-[10px] font-bold text-[#6B5A4E] uppercase mb-2 flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Échelle de Qualité de l'Air (AQI)
              </h3>
              <div className="flex rounded-xl overflow-hidden text-[8px] font-semibold text-white">
                <div className="flex-1 py-2 text-center" style={{ backgroundColor: AQI_COLORS.good }}>Bonne (0-50)</div>
                <div className="flex-1 py-2 text-center" style={{ backgroundColor: AQI_COLORS.moderate }}>Modérée (51-100)</div>
                <div className="flex-1 py-2 text-center" style={{ backgroundColor: AQI_COLORS.unhealthySens }}>Peu Saine GS (101-150)</div>
                <div className="flex-1 py-2 text-center" style={{ backgroundColor: AQI_COLORS.unhealthy }}>Peu Saine (151-200)</div>
                <div className="flex-1 py-2 text-center" style={{ backgroundColor: AQI_COLORS.veryUnhealthy }}>Très Peu Saine (201-300)</div>
                <div className="flex-1 py-2 text-center" style={{ backgroundColor: AQI_COLORS.hazardous }}>Dangereuse (301-500)</div>
              </div>
            </div>

            {/* Understanding Section */}
            <div className="bg-[#F8F5F2] rounded-2xl border border-[#EDE5DC] p-4">
              <h3 className="text-xs font-bold text-[#4B2A17] uppercase mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Comprendre Notre Bulletin
              </h3>
              <div className="grid grid-cols-3 gap-4 text-[10px]">
                <div className="bg-white rounded-xl p-3 border border-[#EDE5DC] shadow-[0_2px_8px_rgba(75,42,23,0.03)]">
                  <p className="font-bold text-[#4B2A17] mb-1.5 flex items-center gap-1">
                    <ChevronUp className="w-3 h-3 text-[#4B8CA8]" /> AQI (Score central)
                  </p>
                  <p className="text-[#6B5A4E] leading-relaxed">
                    Indique la gravité de la pollution maximale mesurée. Plus le chiffre est élevé (jusqu'à 500), plus l'air est potentiellement nocif pour la santé.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#EDE5DC] shadow-[0_2px_8px_rgba(75,42,23,0.03)]">
                  <p className="font-bold text-[#4B2A17] mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#F28B50]" /> Polluant Critique
                  </p>
                  <p className="text-[#6B5A4E] leading-relaxed">
                    C'est la substance (particules fines, ozone, etc.) dont la concentration est la plus élevée et qui donne le score AQI de la journée.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#EDE5DC] shadow-[0_2px_8px_rgba(75,42,23,0.03)]">
                  <p className="font-bold text-[#4B2A17] mb-1.5 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#6FBF73]" /> Recommandations
                  </p>
                  <p className="text-[#6B5A4E] leading-relaxed">
                    Suivez-les strictement pour minimiser votre exposition et protéger les groupes sensibles (enfants, personnes âgées, etc.).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-auto text-center border-t-2 border-[#4B2A17] pt-3">
            <p className="font-bold text-[#4B2A17] text-[11px] uppercase">
              Agence Nationale de la Météorologie (MALI MÉTÉO)
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
