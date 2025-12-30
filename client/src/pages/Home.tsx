import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Bulletin } from '@/components/Bulletin';
import { BulletinModern } from '@/components/BulletinModern';
import { parseCSV, DailySummary } from '@/lib/air-quality';
import { useToast } from '@/hooks/use-toast';
import { Wind, MapPin, Palette, CloudLightning, Sparkles, History, ArrowRight, Activity } from 'lucide-react';
import logoMaliMeteo from '@assets/generated_images/mali_meteo_real_logo.png';

type DesignType = 'classic' | 'modern';
type SourceMode = 'upload' | 'api';

export default function Home() {
  const [data, setData] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<DesignType>('modern');
  const [selectedDate, setSelectedDate] = useState("");
  const [mode, setMode] = useState<SourceMode>('upload');
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
        toast({ variant: "destructive", title: "Fichier vide", description: "Impossible de lire les données." });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur", description: "Format de fichier non reconnu." });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (forceDate: string | null = null) => {
    setLoading(true);
    const dateToSend = forceDate !== null ? forceDate : selectedDate;

    try {
      toast({ title: "Connexion Pulsoweb...", description: "Récupération des données en cours..." });
      
      const response = await fetch("/api/pulsoweb/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateToSend }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || "Erreur serveur");
      }

      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const fileName = `pulsonic_${dateToSend || 'auto'}.csv`;
      const file = new File([blob], fileName, { type: 'text/csv' });
      
      await handleFileSelect(file);

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: error.message || "Impossible de récupérer les données Pulsonic.",
      });
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setSelectedDate("");
  };

  return (
    // FOND D'ECRAN : Plus doux, on masque un peu plus l'image pour éviter le bruit visuel
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2851&auto=format&fit=crop')] bg-cover bg-center font-sans flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-0"></div>
      
      <div className="relative z-10 w-full max-w-6xl animate-in zoom-in-95 duration-700">
        
        {!data ? (
          // --- CADRE PRINCIPAL : Tout en rondeur et clarté ---
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/60 ring-1 ring-slate-100">
            
            {/* --- PARTIE GAUCHE : VERSION "SOFT & AIRY" --- 
                Fini le bloc sombre. Place à la lumière et aux dégradés subtils.
            */}
            <div className="w-full md:w-5/12 relative overflow-hidden flex flex-col justify-between p-10 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50">
              
              {/* Décoration d'arrière-plan très subtile (Formes organiques floues) */}
              <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-200/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Contenu de la colonne gauche */}
              <div className="relative z-10">
                <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-slate-100">
                  <img src={logoMaliMeteo} alt="Logo" className="w-20 h-20 object-contain" />
                </div>
                
                {/* Textes en couleurs sombres pour le contraste sur fond clair */}
                <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-slate-800">
                  Qualité de l'Air
                </h1>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-semibold shadow-sm">
                  <MapPin className="w-4 h-4 text-indigo-500" /> 
                  Bamako District
                </div>
              </div>

              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-slate-100/50 hover:bg-white transition-colors cursor-default">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-700 text-sm">Surveillance Continue</h3>
                            <p className="text-xs text-slate-500 mt-1">Données temps réel issues du réseau Pulsonic.</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-1 border-t border-slate-200 pt-6">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Plateforme Officielle</span>
                  <span className="text-sm font-semibold text-slate-600 tracking-wide">Mali Météo — Direction Générale</span>
                </div>
              </div>
            </div>

            {/* --- PARTIE DROITE : INTERFACE (Reste clean) --- */}
            <div className="w-full md:w-7/12 flex flex-col bg-white border-l border-slate-50">
              
              {/* ONGLETS : Très épurés */}
              <div className="flex border-b border-slate-100 p-2 gap-2">
                <button 
                  onClick={() => setMode('upload')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === 'upload' 
                    ? 'bg-slate-50 text-indigo-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Données du Jour
                </button>
                <button 
                  onClick={() => setMode('api')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === 'api' 
                    ? 'bg-slate-50 text-indigo-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Archives
                </button>
              </div>

              {/* CONTENU PRINCIPAL */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                {loading ? (
                   <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        <Wind className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-slate-800">Traitement...</h3>
                      <p className="text-slate-500 text-sm">Synchronisation des données en cours</p>
                   </div>
                ) : mode === 'upload' ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* BOUTON PRINCIPAL : Bleu indigo doux au lieu du noir agressif */}
                    <div>
                      <button 
                          onClick={() => handleConnect("")}
                          className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white p-1 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.99]"
                      >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                          <div className="bg-transparent rounded-xl py-6 flex flex-col items-center justify-center gap-2 relative z-10">
                             <CloudLightning className="w-8 h-8 mb-1 opacity-90" />
                             <span className="text-lg font-bold">Récupérer les données</span>
                             <span className="text-xs text-indigo-100 font-medium bg-white/20 px-3 py-1 rounded-full">Automatique (Aujourd'hui)</span>
                          </div>
                      </button>
                    </div>

                    <div className="relative flex items-center justify-center">
                       <div className="h-px bg-slate-100 w-full absolute"></div>
                       <span className="bg-white px-3 py-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider relative z-10">Ou importer manuellement</span>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all p-2">
                       <FileUpload onFileSelect={handleFileSelect} />
                    </div>

                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col justify-center">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-slate-800">Exploration Temporelle</h2>
                      <p className="text-slate-500 text-sm">Recherchez un bulletin antérieur directement sur le serveur.</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Choisir une date</label>
                      <input 
                        type="date" 
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 font-bold text-lg focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>

                    <button 
                        onClick={() => handleConnect(selectedDate)}
                        disabled={!selectedDate}
                        className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-xl font-bold text-lg shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-3 group"
                    >
                        Rechercher
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              {/* FOOTER : DESIGN SELECTOR */}
              <div className="bg-white p-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Style du bulletin
                </span>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                   <button onClick={() => setSelectedDesign('classic')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedDesign === 'classic' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Classique</button>
                   <button onClick={() => setSelectedDesign('modern')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedDesign === 'modern' ? 'bg-white text-amber-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Moderne</button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          // --- BULLETIN ---
          <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
             {selectedDesign === 'classic' 
                ? <Bulletin data={data} onReset={handleReset} onToggleDesign={toggleDesign} />
                : <BulletinModern data={data} onReset={handleReset} onToggleDesign={toggleDesign} />
             }
          </div>
        )}
        
        {!data && (
          <footer className="mt-8 text-center text-slate-400/80 text-xs font-medium">
             © 2025 Mali Météo • DIPM
          </footer>
        )}
      </div>
    </div>
  );
}