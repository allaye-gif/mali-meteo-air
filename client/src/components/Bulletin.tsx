import { useRef, useState } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Download, MapPin, Activity, Info, Bike, Home, Wind, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';

interface BulletinProps {
  data: DailySummary;
  onReset: () => void;
}

// Palette "Creative Soft"
const getSoftAQIColor = (aqi: number) => {
  if (aqi <= 50) return "#57B894"; // Vivid Soft Green
  if (aqi <= 100) return "#F4D35E"; // Warm Yellow
  if (aqi <= 150) return "#F0A202"; // Deep Orange
  if (aqi <= 200) return "#EE6055"; // Soft Red
  if (aqi <= 300) return "#AF4D98"; // Soft Purple
  return "#6B2737"; // Dark Maroon
};

const getSoftAQIBg = (aqi: number) => {
  if (aqi <= 50) return "#E8F7F2"; 
  if (aqi <= 100) return "#FEFBE8"; 
  if (aqi <= 150) return "#FEF5E6"; 
  if (aqi <= 200) return "#FDECEC"; 
  if (aqi <= 300) return "#F6ECF3"; 
  return "#EADADD"; 
};

export function Bulletin({ data, onReset }: BulletinProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 Vertical
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0; // Top align

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Bulletin-Air-Bamako-${data.date.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const mainColor = getSoftAQIColor(data.cityAverageAQI);
  const mainBg = getSoftAQIBg(data.cityAverageAQI);
  const advice = getHealthAdvice(data.cityAverageAQI);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* Toolbar */}
      <div className="flex justify-center items-center gap-4 sticky top-6 z-50">
        <Button 
          variant="secondary" 
          onClick={onReset}
          className="rounded-full px-6 shadow-sm hover:bg-white"
        >
          Nouveau
        </Button>
        <Button 
          onClick={handleDownload} 
          disabled={isGenerating}
          className="gap-2 rounded-full px-8 shadow-lg hover:shadow-xl transition-all text-white font-medium"
          style={{ backgroundColor: "#2D3748" }} // Neutral dark button
        >
          {isGenerating ? "Génération..." : "Télécharger l'affiche"}
        </Button>
      </div>

      {/* Canvas Container */}
      <div className="flex justify-center overflow-hidden">
        <div 
          ref={contentRef} 
          className="w-[595px] min-h-[842px] bg-white text-slate-800 relative shadow-2xl flex flex-col"
          // Fixed A4 width approx in px for screen (will be scaled for PDF)
          style={{ width: '595px', height: '842px' }} 
        >
          {/* Decorative Header Shape */}
          <div className="absolute top-0 left-0 w-full h-48 bg-[#F8F9FA] rounded-b-[3rem] -z-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: mainColor }} />
            <div className="absolute top-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: mainColor }} />
          </div>

          {/* Header Content */}
          <div className="relative z-10 px-10 pt-12 pb-6 text-center">
            <div className="uppercase tracking-[0.2em] text-[10px] font-bold text-slate-400 mb-2">
              République du Mali
            </div>
            <h1 className="font-display font-bold text-3xl text-slate-800 mb-2">
              Qualité de l'Air
            </h1>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1 rounded-full shadow-sm border border-slate-100 text-sm text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>Bamako</span>
              <span className="w-px h-3 bg-slate-200 mx-1" />
              <span className="font-medium text-slate-700">{data.date}</span>
            </div>
          </div>

          {/* Main AQI Indicator */}
          <div className="flex-1 flex flex-col items-center justify-center px-10">
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-[24px]" style={{ borderColor: mainBg }} />
              {/* Progress Ring (Simulated with CSS conic gradient would be complex for html2canvas, using solid color ring instead) */}
              <div className="absolute inset-0 rounded-full border-[24px] border-transparent border-t-[24px]" style={{ borderTopColor: mainColor, transform: 'rotate(-45deg)' }} />
              
              <div className="text-center">
                <div className="text-7xl font-display font-bold" style={{ color: mainColor }}>
                  {data.cityAverageAQI}
                </div>
                <div className="text-sm font-medium uppercase text-slate-400 tracking-widest mt-1">US AQI</div>
              </div>
            </div>

            <div className="text-center max-w-xs mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-3" style={{ color: mainColor }}>
                {getAQILabel(data.cityAverageAQI)}
              </h2>
              <p className="text-slate-500 leading-relaxed">
                {data.cityAverageAQI <= 50 ? "L'air est sain aujourd'hui. C'est le moment idéal pour sortir !" :
                 data.cityAverageAQI <= 100 ? "La qualité est moyenne. Aucune restriction particulière." :
                 "Attention, l'air est dégradé. Protégez les plus fragiles."}
              </p>
            </div>

            {/* Health Advice Cards */}
            <div className="w-full grid grid-cols-2 gap-4 mb-12">
              <AdviceCard 
                icon={<Bike className="w-5 h-5" />}
                title="Sport"
                desc={advice.sport}
                color={mainColor}
              />
              <AdviceCard 
                icon={<Home className="w-5 h-5" />}
                title="Maison"
                desc={advice.windows}
                color={mainColor}
              />
            </div>
          </div>

          {/* Bottom Station List */}
          <div className="bg-[#F8F9FA] px-10 py-8 rounded-t-[3rem]">
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
              Relevés par Station
            </h3>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {data.stations.map((station, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span className="text-sm font-medium text-slate-600 truncate w-24" title={station.name}>
                    {station.name.replace('ML_', '').split('_')[1] || station.name.slice(0,10)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{station.mainPollutant}</span>
                    <div 
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white min-w-[2rem] text-center"
                      style={{ backgroundColor: getSoftAQIColor(station.aqi) }}
                    >
                      {station.aqi}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-[10px] text-slate-400">
                <HeartPulse className="w-3 h-3" />
                <span>Protégez votre santé • AirQuality Bamako</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AdviceCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center">
      <div className="mb-2 p-2 rounded-full bg-opacity-10" style={{ backgroundColor: color, color: color }}>
        {icon}
      </div>
      <div className="font-bold text-slate-700 text-sm mb-1">{title}</div>
      <div className="text-xs text-slate-500 leading-tight">{desc}</div>
    </div>
  );
}
