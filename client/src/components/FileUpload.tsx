import { useCallback, useState } from 'react';
import { Upload, Cloud, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Assure-toi que ce composant existe, sinon utilise <button> standard
import { useToast } from '@/hooks/use-toast'; // Si tu as un système de toast, sinon retire

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // Optionnel

  // --- FONCTION MAGIQUE : Appel au serveur ---
  const handleAutoDownload = async () => {
    setIsLoading(true);
    try {
      // 1. Appel à notre nouvelle route Node.js
      const response = await fetch('/api/pulsoweb/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: "AUTO" }) // Tu pourras changer ça pour une date précise plus tard
      });

      if (!response.ok) throw new Error("Erreur lors du téléchargement");

      // 2. On récupère le texte CSV
      const csvContent = await response.text();

      // 3. On crée un "Faux Fichier" pour que ton appli croie que l'utilisateur a uploadé un fichier
      const today = new Date().toISOString().split('T')[0];
      const file = new File([csvContent], `Mali_Meteo_${today}.csv`, { type: "text/csv" });

      // 4. On l'envoie à ton application !
      onFileSelect(file);
      
      // Petit message de succès (si tu as toast)
      toast({ title: "Succès", description: "Données Pulsonic récupérées !" });

    } catch (error) {
      console.error(error);
      alert("Erreur: Impossible de récupérer les données Pulsonic.");
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------------

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-8 px-6">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-soft mb-6">
          <Cloud className="w-8 h-8 text-primary/60" />
        </div>
        <h2 className="text-3xl font-display font-medium mb-3 text-slate-800">Bienvenue</h2>
        <p className="text-slate-500 font-light text-lg">
          Importez vos données pour générer le bulletin
        </p>
      </div>

      {/* ZONE DE DRAG & DROP CLASSIQUE */}
      <label 
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "flex flex-col items-center justify-center w-full aspect-square md:aspect-[4/3] rounded-[2rem] cursor-pointer transition-all duration-500 mb-6",
          "bg-white border-2 border-dashed border-slate-100",
          "hover:border-primary/30 hover:shadow-soft hover:scale-[1.02]",
          "group animate-in zoom-in-95 duration-700 delay-150 fill-mode-backwards"
        )}
      >
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 p-5 rounded-2xl bg-secondary/50 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <Upload className="w-6 h-6" />
          </div>
          <p className="mb-2 text-lg font-medium text-slate-700">
            Sélectionner un fichier
          </p>
          <p className="text-sm text-slate-400 font-light max-w-[200px]">
            Glissez votre fichier CSV ou cliquez pour explorer
          </p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept=".csv,.txt"
          onChange={handleChange}
        />
      </label>

      {/* --- NOUVEAU BOUTON MAGIQUE --- */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">OU</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <button
        onClick={handleAutoDownload}
        disabled={isLoading}
        className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-800 text-white py-4 rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connexion à Pulsonic en cours...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Téléchargement Automatique (Pulsoweb)
          </>
        )}
      </button>
      {/* ----------------------------- */}

    </div>
  );
}