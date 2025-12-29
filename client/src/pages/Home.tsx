import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Bulletin } from '@/components/Bulletin';
import { BulletinModern } from '@/components/BulletinModern';
import { parseCSV, DailySummary } from '@/lib/air-quality';
import { useToast } from '@/hooks/use-toast';
import { Wind, MapPin, Palette, RefreshCw } from 'lucide-react';
import logoMaliMeteo from '@assets/generated_images/mali_meteo_real_logo.png';

type DesignType = 'classic' | 'modern';

export default function Home() {
  const [data, setData] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<DesignType>('modern');
  const { toast } = useToast();
  
  const toggleDesign = () => {
    setSelectedDesign(prev => prev === 'classic' ? 'modern' : 'classic');
    toast({
      title: "Design changé",
      description: `Passage au design ${selectedDesign === 'classic' ? 'Moderne' : 'Classique'}`,
    });
  };

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    try {
      const result = await parseCSV(file);
      if (result) {
        await new Promise(r => setTimeout(r, 600));
        setData(result);
        toast({
          title: "Analyse terminée",
          description: `Bulletin généré pour le ${result.date}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Fichier vide",
          description: "Impossible de lire les données.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Format de fichier non reconnu.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 text-foreground font-sans">
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {!data && (
          <header className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-100 shadow-lg bg-white flex items-center justify-center">
                <img src={logoMaliMeteo} alt="Mali Météo" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
              Générateur de Bulletin Qualité de l'Air
            </h1>
            <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              Zone de Bamako, Mali
            </p>
          </header>
        )}
        
        <main className="flex-1 flex flex-col items-center justify-center w-full">
          {loading ? (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="relative">
                <Wind className="w-12 h-12 text-blue-400 animate-pulse" />
              </div>
              <p className="mt-4 text-slate-500 font-medium text-sm">Analyse des données...</p>
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              {/* Design Selector */}
              <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs text-slate-500 mb-3 font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Choisissez votre design :
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedDesign('classic')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedDesign === 'classic' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    data-testid="design-classic"
                  >
                    <div className="w-full h-12 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">MALI MÉTÉO</span>
                    </div>
                    <p className={`text-sm font-semibold ${selectedDesign === 'classic' ? 'text-blue-700' : 'text-slate-700'}`}>
                      Design Classique
                    </p>
                    <p className="text-[10px] text-slate-500">Tableau détaillé</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedDesign('modern')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedDesign === 'modern' 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    data-testid="design-modern"
                  >
                    <div className="w-full h-12 bg-gradient-to-r from-amber-800 to-amber-600 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">MALI MÉTÉO</span>
                    </div>
                    <p className={`text-sm font-semibold ${selectedDesign === 'modern' ? 'text-amber-700' : 'text-slate-700'}`}>
                      Design Moderne
                    </p>
                    <p className="text-[10px] text-slate-500">Grille polluants</p>
                  </button>
                </div>
              </div>

              <FileUpload onFileSelect={handleFileSelect} />
              
              <div className="text-center p-4 bg-white/60 backdrop-blur rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-2 font-medium">Stations supportées :</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['BKO Qualité Air 1', 'Université', 'Lassa', 'Sotuba'].map(s => (
                    <span key={s} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-3">
                  Polluants : NO2, SO2, CO, O3, PM2.5, PM10
                </p>
              </div>
            </div>
          ) : (
            selectedDesign === 'classic' 
              ? <Bulletin data={data} onReset={handleReset} onToggleDesign={toggleDesign} />
              : <BulletinModern data={data} onReset={handleReset} onToggleDesign={toggleDesign} />
          )}
        </main>
        
        <footer className="text-center py-6">
          <p className="text-xs text-slate-400">Mali Météo - Agence Nationale de la Météorologie</p>
        </footer>
      </div>
    </div>
  );
}
