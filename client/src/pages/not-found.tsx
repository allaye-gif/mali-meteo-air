import { Link } from 'wouter';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-900 mb-4">404</h1>
        <p className="text-2xl font-medium text-slate-600 mb-2">Page non trouvée</p>
        <p className="text-slate-500 mb-8">La page que vous recherchez n'existe pas.</p>
        
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
