import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Bulletin } from '@/components/Bulletin';
import { parseCSV, DailySummary } from '@/lib/air-quality';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CloudDownload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [data, setData] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    try {
      const result = await parseCSV(file);
      if (result) {
        // Simulate a small delay for "processing" feel
        await new Promise(r => setTimeout(r, 800));
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

  const handlePulsoWebLoad = async () => {
    setLoading(true);
    try {
      // Call our backend proxy
      const response = await fetch('/api/pulsoweb/fetch', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        // In a real scenario, the backend would return the CSV content
        // For now, we simulate a successful fetch with mock data if the backend returns success
        // Or if the backend returns the CSV string, we parse it.
        
        toast({
          title: "Connexion réussie",
          description: "Récupération des données depuis PulsoWeb...",
        });

        // SIMULATION: If backend doesn't return real CSV yet, use a mock file
        // In production, 'result.csvContent' would be passed to parseCSV
        
        // Let's create a mock file for demonstration if real data isn't there
        const mockContent = `Station;NO2;SO2;CO;O3;PM2.5;PM10
BKO 1;140;436;3047;191;1;1
LASSA;51;0;800;38;2522;4881
SOTUBA;65;0;1533;26;2954;5936
BAMAKO-UNIVERSITE;87;0;2635;22;1170;3343`;
        
        const blob = new Blob([mockContent], { type: 'text/csv' });
        const file = new File([blob], `pulsoweb_export_${new Date().toISOString().split('T')[0]}.csv`, { type: 'text/csv' });
        
        const parsed = await parseCSV(file);
        if (parsed) {
           setData(parsed);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur PulsoWeb",
        description: "Impossible de récupérer les données (Vérifiez les identifiants backend).",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-700">
      
      {/* Subtle Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-secondary/40 blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-accent/20 blur-[100px] opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center w-full">
          {loading ? (
            <div className="flex flex-col items-center animate-in fade-in duration-700">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
              <p className="mt-6 text-slate-400 font-light tracking-wide uppercase text-xs">Analyse en cours...</p>
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-lg">
              <FileUpload onFileSelect={handleFileSelect} />
              
              <div className="relative w-full flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider">OU</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <Button 
                onClick={handlePulsoWebLoad}
                className="w-full h-14 bg-[#009EE0] hover:bg-[#008CC5] text-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 text-lg group"
              >
                <CloudDownload className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Charger depuis PulsoWeb
              </Button>
            </div>
          ) : (
            <Bulletin data={data} onReset={() => setData(null)} />
          )}
        </main>
        
        <footer className="text-center py-8 opacity-50 hover:opacity-100 transition-opacity duration-500">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-light">AirQuality Bamako</p>
        </footer>
      </div>
    </div>
  );
}
