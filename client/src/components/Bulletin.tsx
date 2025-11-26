import { useRef, useState } from 'react';
import { DailySummary, getAQILabel } from '@/lib/air-quality';
import { Download, MapPin, Activity, Info, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';

interface BulletinProps {
  data: DailySummary;
  onReset: () => void;
}

// Custom soft colors for AQI (hardcoded for safety with html2canvas)
const getSoftAQIColor = (aqi: number) => {
  if (aqi <= 50) return "#8DA399"; // Sage
  if (aqi <= 100) return "#E6C76C"; // Soft Yellow
  if (aqi <= 150) return "#E6A573"; // Soft Orange
  if (aqi <= 200) return "#D68585"; // Soft Red
  if (aqi <= 300) return "#A890B0"; // Soft Purple
  return "#7A5C61"; // Soft Maroon
};

const getSoftAQIBg = (aqi: number) => {
  if (aqi <= 50) return "#F1F7F4"; 
  if (aqi <= 100) return "#FCFBF4"; 
  if (aqi <= 150) return "#FCF6F2"; 
  if (aqi <= 200) return "#FCF2F2"; 
  if (aqi <= 300) return "#F6F2F8"; 
  return "#F3F0F1"; 
};

export function Bulletin({ data, onReset }: BulletinProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    
    try {
      // Force a small delay to ensure fonts render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#FDFCF8', // Match soft-bg
        logging: false,
        useCORS: true,
        // Remove unsupported features if any
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 size in px at 72dpi is approx 595 x 842
      // We'll just fit the image
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // Scaled down for PDF view
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Bulletin-Bamako-${data.date.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const mainColor = getSoftAQIColor(data.cityAverageAQI);
  const mainBg = getSoftAQIBg(data.cityAverageAQI);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-full sticky top-6 z-50 shadow-soft border border-white/50 max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={onReset}
          className="hover:bg-secondary/50 rounded-full px-6 text-muted-foreground"
        >
          Nouveau Fichier
        </Button>
        <Button 
          onClick={handleDownload} 
          disabled={isGenerating}
          className="gap-2 rounded-full px-6 shadow-none hover:opacity-90 transition-opacity text-white"
          style={{ backgroundColor: mainColor }}
        >
          {isGenerating ? "Génération..." : (
            <>
              <Download className="w-4 h-4" />
              Télécharger PDF
            </>
          )}
        </Button>
      </div>

      {/* Main Content to Capture */}
      <div className="flex justify-center">
        <div 
          ref={contentRef} 
          className="bg-[#FDFCF8] p-12 md:p-16 w-full max-w-[800px] text-slate-700 relative overflow-hidden"
        >
          {/* Decorative Background Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

          {/* Header */}
          <header className="text-center mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium tracking-widest uppercase text-slate-400">Bulletin Officiel</span>
            </div>
            
            <h1 className="text-5xl font-display font-medium text-slate-800 mb-4 tracking-tight">
              Qualité de l'Air
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-slate-500">
              <p className="flex items-center gap-2 text-sm uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                Bamako, Mali
              </p>
              <div className="w-px h-4 bg-slate-200" />
              <p className="font-mono text-sm">
                {data.date}
              </p>
            </div>
          </header>

          {/* Main Card */}
          <div 
            className="rounded-[2.5rem] p-10 mb-16 text-center relative overflow-hidden shadow-card"
            style={{ backgroundColor: mainBg }}
          >
            <div className="relative z-10">
              <h2 className="text-slate-500 mb-6 text-lg font-medium">Indice Global</h2>
              
              <div className="flex justify-center items-baseline gap-2 mb-4">
                <span 
                  className="text-8xl font-display font-bold tracking-tighter"
                  style={{ color: mainColor }}
                >
                  {data.cityAverageAQI}
                </span>
                <span className="text-xl text-slate-400 font-medium">AQI</span>
              </div>
              
              <div 
                className="text-3xl font-display font-medium mb-6"
                style={{ color: mainColor }}
              >
                {getAQILabel(data.cityAverageAQI)}
              </div>
              
              <p className="text-slate-600 max-w-md mx-auto leading-relaxed text-lg font-light">
                {data.cityAverageAQI <= 50 ? "L'air est pur et frais. Profitez de vos activités extérieures sans risque." :
                 data.cityAverageAQI <= 100 ? "Qualité acceptable. Une légère vigilance est recommandée pour les plus sensibles." :
                 "L'air est chargé. Privilégiez les activités calmes et limitez l'exposition extérieure."}
              </p>
            </div>
          </div>

          {/* Stations */}
          <div className="mb-16 relative z-10">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-xl font-display text-slate-800">Données par Station</h3>
              <Wind className="w-5 h-5 text-slate-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.stations.map((station, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-6 rounded-3xl border border-slate-50 shadow-card hover:shadow-soft transition-shadow"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="font-medium text-slate-700 truncate pr-4 text-lg" title={station.name}>
                      {station.name.replace('ML_', '').replace(/_/g, ' ').replace('Qualité Air', '').replace('QA', '')}
                    </h4>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSoftAQIColor(station.aqi) }}
                    />
                  </div>

                  <div className="space-y-4">
                    <PollutantRow label="NO2" value={station.maxNO2} unit="ppb" />
                    <PollutantRow label="SO2" value={station.maxSO2} unit="ppb" />
                    <PollutantRow label="CO" value={station.maxCO / 1000} unit="ppm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center border-t border-slate-100 pt-10">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                 <Info className="w-5 h-5 text-slate-300" />
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Ce bulletin est généré automatiquement à partir des données du réseau de surveillance de Bamako. 
              Les indices sont calculés sur la base des maxima horaires.
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}

function PollutantRow({ label, value, unit }: { label: string, value: number, unit: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400 font-medium">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-medium text-slate-700">{value.toFixed(1)}</span>
        <span className="text-[10px] text-slate-300">{unit}</span>
      </div>
    </div>
  );
}
