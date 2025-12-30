# 1. On part d'une base Node.js
FROM node:20-slim

# 2. INSTALLATION DES OUTILS (Python + CURL)
# On ajoute 'curl' à la liste des installations
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 3. On installe les librairies Python
RUN pip3 install pandas requests --break-system-packages

# 4. Configuration Node.js
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# On construit le site
RUN npm run build

# 5. On copie le script Python DANS le dossier final
RUN cp server/pulsonic_worker.py dist/

# 6. Démarrage
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "start"]