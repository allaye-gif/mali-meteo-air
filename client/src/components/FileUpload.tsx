import { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
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
    <div 
      className="w-full max-w-xl mx-auto mt-10 px-4"
    >
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold font-display mb-2 text-slate-800">Générateur de Bulletin</h2>
        <p className="text-slate-500">Chargez votre fichier CSV quotidien pour générer le rapport</p>
      </div>

      <label 
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer",
          "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all duration-300",
          "group animate-in zoom-in-95 duration-500 delay-150 fill-mode-backwards"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className="mb-4 p-4 rounded-full bg-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <p className="mb-2 text-lg font-medium text-slate-700">
            Glissez-déposez votre fichier CSV ici
          </p>
          <p className="text-sm text-slate-400">
            ou cliquez pour parcourir vos fichiers
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-white px-4 py-2 rounded-full border shadow-sm">
            <FileText className="w-3 h-3" />
            <span>Format accepté : .csv, .txt</span>
          </div>
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
