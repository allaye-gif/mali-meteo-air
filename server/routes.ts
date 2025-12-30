import express, { type Express } from "express"; // Modification ici pour importer 'express' complet
import { createServer, type Server } from "http";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// --- Configuration pour __dirname en ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// -------------------------------------------------

export async function registerRoutes(app: Express): Promise<Server> {

  // --- AJOUT CRUCIAL : Permet au serveur de lire le JSON envoyé par le site ---
  app.use(express.json()); 
  // --------------------------------------------------------------------------

  // Route API pour lancer le téléchargement automatique
  app.post("/api/pulsoweb/fetch", async (req, res) => {
    try {
      console.log("🚀 Réception demande de téléchargement...");
      
      // Maintenant req.body devrait fonctionner !
      const dateCible = req.body.date || "AUTO";
      
      console.log(`📅 Date cible reçue: ${dateCible}`);
      console.log("🛠️ Lancement du worker Python...");

      // Chemin absolu vers le script Python
      const scriptPath = path.join(__dirname, "pulsonic_worker.py");
      
      // Construction de la commande
      // On passe la date comme argument au script Python
      const command = `python "${scriptPath}" "${dateCible}"`;

      // Exécution du script 
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Erreur exécution Python: ${error.message}`);
          console.error(`Détails stderr: ${stderr}`);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur interne lors de l'exécution du script Python.",
            details: stderr
          });
        }

        // Si le script a réussi
        if (stdout && stdout.length > 50) {
            console.log("✅ Données reçues du Python ! Taille:", stdout.length);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="pulsonic_${dateCible}.csv"`);
            return res.send(stdout);
        } else {
            console.error("⚠️ Le script a fini sans erreur mais le CSV semble vide.");
            return res.status(500).json({ 
                success: false, 
                message: "Le script n'a pas renvoyé de données valides.",
                details: stderr 
            });
        }
      });

    } catch (e: any) {
      console.error("Erreur générale:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}