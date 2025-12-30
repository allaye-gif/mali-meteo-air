# On utilise une image Linux légère avec Node.js 20
FROM node:20-slim

# --- INSTALLATION DE PYTHON ---
# On installe Python 3, pip et les outils nécessaires
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# On installe les librairies Python utilisées par ton script
RUN pip3 install pandas requests --break-system-packages

# --- CONFIGURATION NODE.JS ---
WORKDIR /app

# On copie les fichiers de config
COPY package*.json ./

# On installe les dépendances du site
RUN npm install

# On copie tout le reste du code
COPY . .

# On construit le site (Frontend + Backend)
# Cela va créer le dossier 'dist'
RUN npm run build

# --- CORRECTION CRUCIALE ICI ---
# On copie manuellement le script Python dans le dossier 'dist' pour qu'il soit avec le serveur
RUN cp server/pulsonic_worker.py dist/
# -------------------------------

# --- DÉMARRAGE ---
ENV PORT=5000
EXPOSE 5000

# La commande de démarrage
CMD ["npm", "start"]