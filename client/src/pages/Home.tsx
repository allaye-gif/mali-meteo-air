import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Bulletin } from '@/components/Bulletin';
import { parseCSV, DailySummary } from '@/lib/air-quality';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    try {
      const result = await parseCSV(file);
      if (result) {
        setData(result);
        toast({
          title: "Fichier chargé avec succès",
          description: `Données traitées pour la date du ${result.date}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de lecture",
          description: "Le fichier semble vide ou mal formaté.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de traiter le fichier CSV.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-primary/20">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header - Only show on upload screen */}
        {!data && (
          <header className="flex justify-between items-center mb-12 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-display">
                A
              </div>
              <span className="font-display font-bold text-xl tracking-tight">AirQuality Bamako</span>
            </div>
          </header>
        )}

        <main className="flex-1 flex flex-col items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center animate-pulse">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Traitement des données...</p>
            </div>
          ) : !data ? (
            <FileUpload onFileSelect={handleFileSelect} />
          ) : (
            <Bulletin data={data} onReset={() => setData(null)} />
          )}
        </main>
        
        {!data && (
          <footer className="text-center text-slate-400 text-sm py-8">
            &copy; {new Date().getFullYear()} AirQuality Bamako. Système de surveillance environnementale.
          </footer>
        )}
      </div>
    </div>
  );
}
