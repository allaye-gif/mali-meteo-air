import { useRef, useState } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Download, Printer, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BulletinProps {
  data: DailySummary;
  onReset: () => void;
}

const COLORS = {
  good: '#4ade80',     // Green
  moderate: '#facc15', // Yellow
  unhealthySens: '#fb923c', // Orange
  unhealthy: '#f87171', // Red
  veryUnhealthy: '#a855f7', // Purple
  hazardous: '#be123c', // Maroon
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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    
    try {
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 800));

      // Use html2canvas with specific settings for reliability
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff', // Ensure white background
        width: 794, // Exact A4 width in px at 96dpi
        height: 1123, // Exact A4 height in px at 96dpi
        windowWidth: 1200, // Ensure context is large enough
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bulletin_MALI_METEO_${data.date.replace(/\//g, '-')}.pdf`);
      
    } catch (err) {
      console.error("PDF Error", err);
      alert("Erreur lors de la création du PDF. Veuillez utiliser la fonction d'impression du navigateur (Ctrl+P) si le problème persiste.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const advice = getHealthAdvice(data.cityMaxAQI);

  return (
    <div className="flex flex-col items-center pb-20 bg-slate-100 min-h-screen pt-10">
      
      {/* Toolbar - No Print */}
      <div className="flex gap-4 mb-8 sticky top-4 z-50 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg border print:hidden">
        <Button variant="outline" onClick={onReset} className="rounded-full">
          Nouveau
        </Button>
        <Button variant="outline" onClick={handlePrint} className="rounded-full gap-2">
          <Printer className="w-4 h-4" />
          Imprimer
        </Button>
        <Button 
          onClick={handleDownload} 
          disabled={isGenerating} 
          className="bg-blue-900 hover:bg-blue-800 text-white rounded-full gap-2"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? "Génération..." : "Télécharger PDF"}
        </Button>
      </div>

      {/* A4 Document Container - Exactly 210mm x 297mm */}
      <div className="shadow-2xl print:shadow-none print:w-full print:h-full overflow-hidden bg-white">
        <div 
          ref={contentRef}
          className="w-[210mm] h-[297mm] bg-white relative text-slate-800 flex flex-col p-[15mm] box-border"
          id="bulletin-content"
        >
          {/* HEADER */}
          <header className="flex justify-between items-start border-b-2 border-blue-900 pb-4 mb-6">
            <div className="w-1/4 flex flex-col items-center justify-center">
               {/* Logo MALI METEO Simulation */}
               <div className="w-20 h-20 bg-blue-900 rounded-full flex flex-col items-center justify-center text-white mb-2">
                  <span className="text-[8px] uppercase tracking-wider">Agence</span>
                  <span className="font-bold text-lg leading-none">MALI</span>
                  <span className="font-bold text-lg leading-none">MÉTÉO</span>
               </div>
            </div>
            
            <div className="w-2/4 text-center pt-2">
              <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">République du Mali</h2>
              <h3 className="text-[10px] italic text-slate-400 mb-4">Un Peuple - Un But - Une Foi</h3>
              <h1 className="text-3xl font-bold text-blue-900 uppercase font-serif">Bulletin Qualité de l'Air</h1>
              <div className="text-sm font-medium text-blue-600 uppercase tracking-wide mt-1">Zone de Bamako</div>
            </div>

            <div className="w-1/4 text-right pt-2">
              <div className="border border-blue-900 p-2 inline-block text-center min-w-[100px]">
                <div className="text-[10px] uppercase text-slate-500">Date</div>
                <div className="font-bold text-lg text-blue-900">{data.date}</div>
              </div>
            </div>
          </header>

          {/* GLOBAL SITUATION */}
          <section className="mb-8">
            <div className="flex items-stretch bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              {/* Left: Indicator */}
              <div className="w-1/3 p-6 flex flex-col items-center justify-center border-r border-slate-200 bg-white">
                <div className="text-sm font-bold text-slate-500 uppercase mb-2">Indice Global (AQI)</div>
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-md mb-2"
                  style={{ backgroundColor: getStatusColor(data.cityMaxAQI) }}
                >
                  {data.cityMaxAQI}
                </div>
                <div className="font-bold text-lg" style={{ color: getStatusColor(data.cityMaxAQI) }}>
                  {getAQILabel(data.cityMaxAQI)}
                </div>
              </div>

              {/* Right: Text */}
              <div className="w-2/3 p-6 flex flex-col justify-center">
                <h3 className="font-bold text-blue-900 uppercase mb-2 text-sm">Synthèse de la journée</h3>
                <p className="text-sm text-slate-700 text-justify leading-relaxed">
                  L'indice de qualité de l'air (AQI) retenu pour la journée est de <strong>{data.cityMaxAQI}</strong>, correspondant à une qualité <strong>{getAQILabel(data.cityMaxAQI).toLowerCase()}</strong>.
                  Cet indice est calculé sur la base de la station enregistrant la concentration maximale de polluants.
                  <br/><br/>
                  Polluant majoritaire : <strong>{data.stations.find(s => s.aqi === data.cityMaxAQI)?.mainPollutant || "Mixte"}</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* STATIONS DATA */}
          <section className="mb-8 flex-grow">
            <h3 className="font-bold text-blue-900 uppercase mb-3 text-sm border-b border-slate-200 pb-1">
              Détails du Réseau de Surveillance
            </h3>
            <table className="w-full text-sm border-collapse border border-slate-200">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="border border-slate-200 p-3 text-left w-1/3">Station</th>
                  <th className="border border-slate-200 p-3 text-center">NO2 (max)</th>
                  <th className="border border-slate-200 p-3 text-center">SO2 (max)</th>
                  <th className="border border-slate-200 p-3 text-center">CO (max)</th>
                  <th className="border border-slate-200 p-3 text-center bg-slate-100 font-bold">AQI</th>
                </tr>
              </thead>
              <tbody>
                {data.stations.map((s, i) => (
                  <tr key={i} className="text-slate-700">
                    <td className="border border-slate-200 p-3 font-medium">
                      {s.name.replace('ML_', '').replace(/_/g, ' ').replace('Qualité Air', '').replace('QA', '')}
                    </td>
                    <td className="border border-slate-200 p-3 text-center">{s.maxNO2.toFixed(0)}</td>
                    <td className="border border-slate-200 p-3 text-center">{s.maxSO2.toFixed(0)}</td>
                    <td className="border border-slate-200 p-3 text-center">{s.maxCO.toFixed(0)}</td>
                    <td className="border border-slate-200 p-3 text-center font-bold relative">
                      <div 
                        className="absolute inset-1 opacity-20 rounded" 
                        style={{ backgroundColor: getStatusColor(s.aqi) }} 
                      />
                      <span className="relative z-10">{s.aqi}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-[10px] text-slate-400 mt-2 italic text-right">
              * Concentrations en ppb. NO2 (Dioxyde d'azote), SO2 (Dioxyde de soufre), CO (Monoxyde de carbone).
            </div>
          </section>

          {/* HEALTH ADVICE */}
          <section className="mb-8 bg-blue-50 border border-blue-100 p-5 rounded-lg">
            <h3 className="font-bold text-blue-900 uppercase mb-3 text-sm flex items-center gap-2">
              <Info className="w-4 h-4" />
              Avis de Santé Publique
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <span className="font-bold text-xs uppercase text-blue-800 block mb-1">Population Générale</span>
                <p className="text-sm text-slate-700">{advice.general}</p>
              </div>
              <div className="border-t border-blue-200 pt-3">
                <span className="font-bold text-xs uppercase text-blue-800 block mb-1">Personnes Vulnérables</span>
                <p className="text-sm text-slate-700">{advice.sensitive}</p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-auto pt-6 border-t-2 border-blue-900 text-center">
            <p className="font-bold text-blue-900 text-xs uppercase mb-1">Agence Nationale de la Météorologie (MALI MÉTÉO)</p>
            <p className="text-[10px] text-slate-500">
              Siège Social : Bamako, Mali • Tél : (+223) 20 20 20 20 • Site Web : www.malimeteo.ml
            </p>
            <p className="text-[8px] text-slate-400 mt-2">
              Document généré automatiquement le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}. 
              Ce bulletin est un document d'information provisoire.
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
