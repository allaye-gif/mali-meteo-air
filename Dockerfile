# On utilise une image Linux légère avec Node.js 20
FROM node:20-slim

# --- INSTALLATION DE PYTHON ---
# On installe Python 3, pip et les outils nécessaires
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# On installe les librairies Python utilisées par ton script (pandas, requests)
# --break-system-packages est nécessaire sur les versions récentes de Debian/Python
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
# Cela va créer le dossier 'dist' que le serveur va servir
RUN npm run build

# --- DÉMARRAGE ---
# On utilise le port 5000 par défaut
ENV PORT=5000
EXPOSE 5000

# La commande de démarrage (utilise le script "start" de package.json)
CMD ["npm", "start"]