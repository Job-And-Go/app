# Utiliser une image Node.js officielle
FROM node:18-alpine

# Installer les dépendances nécessaires
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Backend
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
RUN npm install
COPY backend/ .
RUN npm run build
RUN ls -la dist/  # Vérifier le contenu du dossier dist

# Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Exposer le port de l'application
EXPOSE 5000

# Démarrer l'application
WORKDIR /app/backend
ENV NODE_PATH=./dist
CMD ["npm", "start"]
