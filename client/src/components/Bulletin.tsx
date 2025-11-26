import { useRef } from 'react';
import { DailySummary, getAQIColor, getAQILabel } from '@/lib/air-quality';
import { Download, MapPin, Wind, Droplets, Activity, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BulletinProps {
  data: DailySummary;
  onReset: () => void;
}

export function Bulletin({ data, onReset }: BulletinProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    const canvas = await html2canvas(contentRef.current, {
      scale: 2, // Higher quality
      backgroundColor: '#f8fafc', // Match bg-background
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Bulletin-Air-Bamako-${data.date.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl sticky top-4 z-10 border shadow-sm">
        <Button variant="outline" onClick={onReset}>
          Nouveau Fichier
        </Button>
        <Button onClick={handleDownload} className="gap-2 bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4" />
          Télécharger PDF
        </Button>
      </div>

      {/* Main Content to Capture */}
      <div ref={contentRef} className="bg-slate-50 p-8 md:p-12 min-h-[1123px] w-full max-w-4xl mx-auto shadow-2xl rounded-none md:rounded-3xl text-slate-800">
        
        {/* Header */}
        <header className="flex justify-between items-end border-b-2 border-slate-200 pb-8 mb-12">
          <div>
            <div className="text-sm font-semibold tracking-widest text-primary uppercase mb-2">République du Mali</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-2">
              Bulletin Qualité de l'Air
            </h1>
            <p className="text-slate-500 text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Bamako, Mali
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Date du rapport</div>
            <div className="text-2xl font-bold font-mono text-slate-700">{data.date}</div>
          </div>
        </header>

        {/* Hero AQI */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Indice Global de la Ville
          </h2>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Circle Indicator */}
              <div 
                className="absolute inset-0 rounded-full opacity-20"
                style={{ backgroundColor: getAQIColor(data.cityAverageAQI) }}
              />
              <div 
                className="text-6xl font-bold font-display"
                style={{ color: getAQIColor(data.cityAverageAQI) }}
              >
                {data.cityAverageAQI}
              </div>
              <div className="absolute -bottom-4 bg-white px-4 py-1 rounded-full shadow-sm border text-sm font-medium uppercase tracking-wide">
                AQI
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Qualité de l'air</div>
              <div className="text-4xl font-bold mb-4" style={{ color: getAQIColor(data.cityAverageAQI) }}>
                {getAQILabel(data.cityAverageAQI)}
              </div>
              <p className="text-slate-600 leading-relaxed max-w-md">
                {data.cityAverageAQI <= 50 ? "La qualité de l'air est idéale pour les activités de plein air." :
                 data.cityAverageAQI <= 100 ? "Qualité de l'air acceptable. Cependant, les personnes très sensibles devraient limiter les efforts prolongés." :
                 "L'air est pollué. Il est recommandé de réduire les activités physiques intenses à l'extérieur, surtout pour les personnes sensibles."}
              </p>
            </div>
          </div>
        </div>

        {/* Station Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Détails par Station
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.stations.map((station, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-800 truncate pr-4" title={station.name}>
                    {station.name.replace('ML_', '').replace(/_/g, ' ')}
                  </h3>
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: getAQIColor(station.aqi) }}
                  >
                    AQI {station.aqi}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <PollutantStat label="NO2" value={station.maxNO2} unit="ppb" />
                  <PollutantStat label="SO2" value={station.maxSO2} unit="ppb" />
                  <PollutantStat label="CO" value={station.maxCO / 1000} unit="ppm" />
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 flex justify-between">
                  <span>Polluant dominant: <strong className="text-slate-600">{station.mainPollutant}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <footer className="bg-slate-100 rounded-2xl p-6 text-sm text-slate-500 flex items-start gap-4">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="mb-2">
              <strong>Note Technique:</strong> Les indices AQI sont calculés sur la base des concentrations maximales horaires observées.
              Les données proviennent du réseau de surveillance de la qualité de l'air de Bamako.
            </p>
            <p>
              Généré automatiquement par le système de surveillance AirQuality Bamako.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}

function PollutantStat({ label, value, unit }: { label: string, value: number, unit: string }) {
  return (
    <div className="text-center p-2 bg-slate-50 rounded-lg">
      <div className="text-xs font-medium text-slate-400 mb-1">{label}</div>
      <div className="font-mono font-semibold text-slate-700">
        {value.toFixed(1)}
        <span className="text-[10px] text-slate-400 ml-1 font-sans">{unit}</span>
      </div>
    </div>
  );
}
