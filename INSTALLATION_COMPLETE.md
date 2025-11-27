# 📋 PROJET COMPLET - GÉNÉRATEUR BULLETIN QUALITÉ DE L'AIR BAMAKO

## 🚀 INSTALLATION RAPIDE

### 1. PRÉREQUIS
- Node.js >= 18.0
- npm ou yarn

### 2. CLONER/CRÉER LA STRUCTURE
```bash
mkdir air-quality-bamako
cd air-quality-bamako
```

### 3. COPIER TOUS LES FICHIERS (voir ci-dessous)

### 4. INSTALLER LES DÉPENDANCES
```bash
npm install
```

### 5. LANCER LE PROJET
```bash
npm run dev:client
# Le serveur démarre sur http://localhost:5000
```

---

## 📁 STRUCTURE DU PROJET

```
air-quality-bamako/
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   └── Home.tsx
│   │   ├── components/
│   │   │   ├── Bulletin.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── ui/ (radix-ui components)
│   │   ├── lib/
│   │   │   ├── air-quality.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   └── hooks/
│   │       └── use-toast.ts
│   ├── public/
│   │   └── favicon.png
│   └── index.html
├── attached_assets/
│   └── Logo_Mali_Meteo_1764230835252.png (votre logo)
├── vite.config.ts
├── tsconfig.json
├── postcss.config.js
├── package.json
├── vite-plugin-meta-images.ts
└── .gitignore
```

---

## 📄 FICHIER 1: package.json

```json
{
  "name": "air-quality-bamako",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev:client": "vite dev --port 5000",
    "check": "tsc"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.60.5",
    "@types/papaparse": "^5.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^12.23.24",
    "html2canvas": "^1.4.1",
    "input-otp": "^1.4.2",
    "jspdf": "^3.0.4",
    "lucide-react": "^0.545.0",
    "next-themes": "^0.4.6",
    "papaparse": "^5.5.3",
    "react": "^19.2.0",
    "react-day-picker": "^9.11.1",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.66.0",
    "react-resizable-panels": "^2.1.9",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "wouter": "^3.3.5",
    "zod": "^3.25.76",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.0.4",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.14",
    "typescript": "5.6.3",
    "vite": "^7.1.9"
  }
}
```

---

## 📄 FICHIER 2: vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
```

---

## 📄 FICHIER 3: tsconfig.json

```json
{
  "include": ["client/src/**/*"],
  "exclude": ["node_modules", "build", "dist"],
  "compilerOptions": {
    "incremental": true,
    "noEmit": true,
    "module": "ESNext",
    "strict": true,
    "lib": ["esnext", "dom", "dom.iterable"],
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./client/src/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  }
}
```

---

## 📄 FICHIER 4: postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 📄 FICHIER 5: client/index.html

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />

    <meta property="og:title" content="AirQuality Bamako - Bulletin Automatisé" />
    <meta property="og:description" content="Génération automatique de bulletins qualité de l'air pour Bamako." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://replit.com/public/images/opengraph.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@replit" />
    <meta name="twitter:title" content="AirQuality Bamako - Bulletin Automatisé" />
    <meta name="twitter:description" content="Génération automatique de bulletins qualité de l'air pour Bamako." />
    <meta name="twitter:image" content="https://replit.com/public/images/opengraph.png" />

    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 📄 FICHIER 6: client/src/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 📄 FICHIERS SOURCE PRINCIPAUX

Les fichiers suivants sont dans le message précédent de ma réponse:

1. **client/src/lib/air-quality.ts** - Moteur de calcul AQI
2. **client/src/components/Bulletin.tsx** - Design du bulletin
3. **client/src/pages/Home.tsx** - Page d'accueil
4. **client/src/components/FileUpload.tsx** - Upload de fichiers
5. **client/src/App.tsx** - Application principale
6. **client/src/index.css** - Thème Soft

---

## 🎨 FICHIER 7: client/src/lib/queryClient.ts

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
```

---

## 🎨 FICHIER 8: client/src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 🎨 FICHIER 9: client/src/hooks/use-toast.ts

```typescript
import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<any[]>([]);

  const toast = useCallback(({ title, description, variant = "default" }: any) => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return { toast, toasts };
}
```

---

## ✅ INSTRUCTIONS D'INSTALLATION COMPLÈTES

### ÉTAPE 1: Créer la structure
```bash
mkdir air-quality-bamako
cd air-quality-bamako
```

### ÉTAPE 2: Copier les fichiers
1. Créez les dossiers:
   ```bash
   mkdir -p client/src/{components,pages,lib,hooks}
   mkdir -p client/public
   mkdir -p attached_assets
   ```

2. Copiez les fichiers de configuration à la racine:
   - `package.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `postcss.config.js`

3. Copiez les fichiers client:
   - `client/index.html`
   - `client/src/main.tsx`
   - `client/src/index.css`
   - `client/src/App.tsx`
   - `client/src/pages/Home.tsx`
   - `client/src/components/Bulletin.tsx`
   - `client/src/components/FileUpload.tsx`
   - `client/src/lib/air-quality.ts`
   - `client/src/lib/queryClient.ts`
   - `client/src/lib/utils.ts`
   - `client/src/hooks/use-toast.ts`

### ÉTAPE 3: Installer les composants UI Radix
```bash
npm run setup-ui
```

Ou créez les fichiers UI manuellement dans `client/src/components/ui/`:
- `button.tsx`
- `toaster.tsx`
- `tooltip.tsx`

### ÉTAPE 4: Ajouter votre logo
Placez votre fichier logo dans:
```
attached_assets/Logo_Mali_Meteo_1764230835252.png
```

### ÉTAPE 5: Lancer
```bash
npm install
npm run dev:client
```

**Accédez à: http://localhost:5000**

---

## 📝 POUR CRÉER LES FICHIERS UI RADIX

Créez `client/src/components/ui/button.tsx`:

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "px-4 py-2 rounded-lg font-medium transition-colors",
          variant === "default" && "bg-blue-900 text-white hover:bg-blue-800",
          variant === "outline" && "border border-slate-300 hover:bg-slate-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
```

---

## ✨ FICHIERS D'EXEMPLE CSV

Format attendu pour vos fichiers CSV:

```csv
date,NO2 (ML_Station1),SO2 (ML_Station1),CO (ML_Station1),O3 (ML_Station1),PM2.5 (ML_Station1),PM10 (ML_Station1),NO2 (ML_Station2),SO2 (ML_Station2),CO (ML_Station2),O3 (ML_Station2),PM2.5 (ML_Station2),PM10 (ML_Station2)
2024-11-27 10:00,45,20,2500,50,15,35,40,18,2300,48,30
2024-11-27 11:00,50,22,2600,55,16,40,42,20,2400,52,32
2024-11-27 12:00,55,25,2800,60,18,45,45,23,2600,56,35
```

---

## 🎯 À FAIRE APRÈS INSTALLATION

1. Remplacer le logo dans `attached_assets/`
2. Charger vos fichiers CSV
3. L'application génère le bulletin
4. Cliquer "Imprimer / Enregistrer PDF"
5. Sauvegarder le PDF

---

**Besoin d'aide? Tous les fichiers sont fournis ci-dessus. Bonne chance! 🚀**
