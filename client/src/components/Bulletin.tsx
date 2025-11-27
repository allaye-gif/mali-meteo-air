import { useRef, useState } from 'react';
import { DailySummary, getAQILabel, getHealthAdvice } from '@/lib/air-quality';
import { Download, Calendar, MapPin, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BulletinProps {
  data: DailySummary;
  onReset: () => void;
}

// Official colors for the bulletin
const COLORS = {
  primary: '#0056b3', // Official Blue
  secondary: '#f0f7ff', // Light Blue Bg
  text: '#333333',
  border: '#e2e8f0',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
};

export function Bulletin({ data, onReset }: BulletinProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    
    try {
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // High quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bulletin_Mali_Meteo_${data.date.replace(/\//g, '-')}.pdf`);
      
    } catch (err) {
      console.error("PDF Error", err);
      alert("Erreur de téléchargement. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine status color
  const getStatusColor = (aqi: number) => {
    if (aqi <= 50) return COLORS.success;
    if (aqi <= 100) return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <div className="flex flex-col items-center pb-20 animate-in fade-in duration-500">
      
      {/* Toolbar */}
      <div className="flex gap-4 mb-8 sticky top-4 z-50 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border">
        <Button variant="outline" onClick={onReset}>
          Nouveau fichier
        </Button>
        <Button onClick={handleDownload} disabled={isGenerating} className="bg-blue-700 hover:bg-blue-800 text-white">
          {isGenerating ? "Génération..." : "Télécharger PDF"}
        </Button>
      </div>

      {/* A4 Document Container */}
      <div className="shadow-2xl overflow-hidden bg-white">
        <div 
          ref={contentRef}
          className="w-[210mm] h-[297mm] bg-white relative text-slate-800 flex flex-col"
          style={{ padding: '15mm' }} // Standard margins
        >
          {/* 1. Official Header */}
          <header className="border-b-4 border-blue-800 pb-6 mb-8 flex justify-between items-start">
            <div className="w-1/3 text-center space-y-1">
              <div className="font-bold text-xs uppercase tracking-widest text-slate-500">République du Mali</div>
              <div className="text-[10px] italic font-serif text-slate-400">Un Peuple - Un But - Une Foi</div>
              
              {/* Logo Placeholder */}
              <div className="mt-4 flex justify-center">
                <div className="w-16 h-16 bg-blue-800 text-white rounded-full flex items-center justify-center font-bold text-xs text-center leading-tight">
                  MALI<br/>MÉTÉO
                </div>
              </div>
            </div>

            <div className="w-1/3 text-center pt-4">
              <h1 className="font-bold text-2xl text-blue-900 uppercase leading-tight mb-2">
                Bulletin Qualité<br/>de l'Air
              </h1>
              <div className="inline-block bg-blue-50 text-blue-800 px-3 py-1 rounded text-sm font-medium border border-blue-100">
                Bamako et Environs
              </div>
            </div>

            <div className="w-1/3 text-right space-y-2 pt-2">
              <div className="text-xs text-slate-500 uppercase">Date d'émission</div>
              <div className="font-mono font-bold text-lg border-2 border-slate-800 px-2 py-1 inline-block bg-slate-50">
                {data.date}
              </div>
              <div className="text-[10px] text-slate-400">N° {new Date().getFullYear()}-{Math.floor(Math.random() * 1000)}</div>
            </div>
          </header>

          {/* 2. Executive Summary */}
          <section className="mb-8 bg-slate-50 border border-slate-200 p-6 rounded-lg">
            <h2 className="text-sm font-bold text-blue-900 uppercase mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Info className="w-4 h-4" />
              Situation Globale
            </h2>
            
            <div className="flex items-center gap-8">
              {/* Big Indicator */}
              <div className="flex-shrink-0 text-center">
                <div 
                  className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold mb-2"
                  style={{ 
                    borderColor: getStatusColor(data.cityAverageAQI),
                    color: getStatusColor(data.cityAverageAQI),
                    backgroundColor: 'white'
                  }}
                >
                  {data.cityAverageAQI}
                </div>
                <div className="text-xs font-bold uppercase text-slate-500">Indice Ville</div>
              </div>

              <div className="flex-1">
                <div className="text-lg font-bold mb-1" style={{ color: getStatusColor(data.cityAverageAQI) }}>
                  Qualité de l'air : {getAQILabel(data.cityAverageAQI)}
                </div>
                <p className="text-sm text-slate-600 text-justify leading-relaxed">
                  L'indice global de la qualité de l'air pour la ville de Bamako est aujourd'hui de <strong>{data.cityAverageAQI}</strong>.
                  {data.cityAverageAQI <= 50 ? " Les conditions sont favorables pour toutes les activités." :
                   data.cityAverageAQI <= 100 ? " La qualité de l'air est acceptable. Une vigilance mineure est recommandée." :
                   " La qualité de l'air est dégradée. Il est conseillé de suivre les recommandations sanitaires ci-dessous."}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Stations Table */}
          <section className="mb-8 flex-1">
            <h2 className="text-sm font-bold text-blue-900 uppercase mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <MapPin className="w-4 h-4" />
              Relevés par Station de Surveillance
            </h2>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="p-3 text-left w-1/3">Station</th>
                  <th className="p-3 text-center">Polluant Dominant</th>
                  <th className="p-3 text-center">Indice (AQI)</th>
                  <th className="p-3 text-center">Niveau</th>
                </tr>
              </thead>
              <tbody>
                {data.stations.map((station, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-700">
                      {station.name.replace('ML_', '').replace(/_/g, ' ').replace('QA', '')}
                    </td>
                    <td className="p-3 text-center font-mono text-xs text-slate-500">
                      {station.mainPollutant}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800">
                      {station.aqi}
                    </td>
                    <td className="p-3 text-center">
                      <span 
                        className="inline-block px-2 py-1 rounded text-[10px] font-bold text-white uppercase min-w-[80px]"
                        style={{ backgroundColor: getStatusColor(station.aqi) }}
                      >
                        {getAQILabel(station.aqi)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 4. Recommendations */}
          <section className="mb-8">
             <h2 className="text-sm font-bold text-blue-900 uppercase mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <AlertTriangle className="w-4 h-4" />
              Recommandations Sanitaires
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-l-4 border-slate-200 border-l-blue-600 p-4 rounded shadow-sm">
                <h3 className="font-bold text-xs uppercase text-blue-800 mb-2">Population Générale</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                   {data.cityAverageAQI > 100 ? "Réduisez les activités physiques intenses en extérieur." : "Aucune restriction particulière. Aérez vos locaux."}
                </p>
              </div>
              <div className="bg-white border border-l-4 border-slate-200 border-l-red-500 p-4 rounded shadow-sm">
                <h3 className="font-bold text-xs uppercase text-red-700 mb-2">Personnes Sensibles</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                   {data.cityAverageAQI > 100 ? "Évitez les sorties aux heures de pointe. Consultez un médecin en cas de gêne." : "Surveillez l'apparition de symptômes respiratoires éventuels."}
                </p>
              </div>
            </div>
          </section>

          {/* 5. Footer */}
          <footer className="mt-auto pt-6 border-t-2 border-slate-800 text-center">
            <div className="flex justify-center gap-8 mb-4 text-xs font-bold text-blue-900 uppercase">
              <span>Agence Nationale de la Météorologie</span>
              <span>•</span>
              <span>Direction Technique</span>
              <span>•</span>
              <span>Département Environnement</span>
            </div>
            <p className="text-[10px] text-slate-400 max-w-lg mx-auto">
              Bulletin généré automatiquement par le système de gestion de la qualité de l'air (AQMS).
              Les données sont provisoires et sujettes à validation finale.
              <br/>BP: 1234 Bamako - Mali | Tél: +223 20 20 20 20 | Email: contact@malimeteo.ml
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
