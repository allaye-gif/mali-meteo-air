# 1. On part d'une base Node.js
FROM node:20-slim

# 2. INSTALLATION PYTHON (Mise à jour)
# On ajoute 'python-is-python3' pour que la commande "python" fonctionne
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

# 3. On installe les librairies nécessaires
RUN pip3 install pandas requests --break-system-packages

# 4. Configuration Node.js
WORKDIR /app

# On copie et installe les dépendances
COPY package*.json ./
RUN npm install

# On copie tout le code
COPY . .

# On construit le site (crée le dossier 'dist')
RUN npm run build

# --- LA CORRECTION EST ICI ---
# On copie le script Python DANS le dossier final 'dist' pour que le serveur le trouve
RUN cp server/pulsonic_worker.py dist/
# -----------------------------

# 5. Démarrage
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "start"]