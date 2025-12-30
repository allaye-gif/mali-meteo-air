import { type Server } from "node:http";
import path from "path"; // <--- AJOUT
import { fileURLToPath } from "url"; // <--- AJOUT
import express, { type Express, type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

// --- Configuration pour ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// -------------------------------------

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

export default async function runApp(
  setup: (app: Express, server: Server) => Promise<void>,
) {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  await setup(app, server);

  // --- CONFIGURATION PRODUCTION (POUR RENDER) ---
  // Si on est en production, on sert les fichiers du site React (dossier dist)
  if (process.env.NODE_ENV === "production") {
    // On pointe vers le dossier dist à la racine du projet
    const distPath = path.join(process.cwd(), "dist");
    
    // 1. Servir les fichiers statiques (JS, CSS, Images)
    app.use(express.static(distPath));

    // 2. Pour toute route non-API, renvoyer index.html (pour que React gère la page)
    app.get("*", (_req, res) => {
      // Vérifier que ce n'est pas une requête API avant de renvoyer le HTML
      if (!_req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
    
    log(`Static files serving configured from: ${distPath}`);
  }
  // ----------------------------------------------

  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
}