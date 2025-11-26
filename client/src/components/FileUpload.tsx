import { useCallback } from 'react';
import { Upload, FileText, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
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

      <label 
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "flex flex-col items-center justify-center w-full aspect-square md:aspect-[4/3] rounded-[2rem] cursor-pointer transition-all duration-500",
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
    </div>
  );
}
