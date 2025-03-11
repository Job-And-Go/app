# Job-Go
This project connects students with individuals or businesses for paid tasks or vacant job opportunities. It acts as an intermediary, ensuring students access clear information on flexible jobs without direct employment. This initiative addresses a key need by providing a tailored solution to the broader issue.


# Job And GO - Documentation

## 📋 Description
Job And GO est une application de recherche d'emploi disponible sur web et mobile, permettant aux utilisateurs de gérer leur recherche d'emploi de manière efficace et organisée.

## 🏗️ Architecture
L'application repose sur une architecture moderne en trois parties :

### Backend
- **Technologies** :
  - Node.js avec TypeScript
  - PostgreSQL via Supabase
  - Docker pour la conteneurisation
  - Tests unitaires
  - Variables d'environnement pour la configuration

### Frontend Web
- **Technologies** :
  - Next.js (Framework React)
  - TypeScript
  - Tailwind CSS pour le styling
  - ESLint pour le linting
  - Architecture modulaire avec dossier `src/`

### Application Mobile
- **Technologies** :
  - React Native avec Expo
  - TypeScript
  - Support Android et iOS

## 🚀 Fonctionnalités principales

### 1. **Gestion des utilisateurs**
   - Inscription/Connexion via Supabase
   - Profil utilisateur
   - Gestion des préférences

### 2. **Recherche d'emploi**
   - Recherche avancée
   - Filtres personnalisés
   - Sauvegarde des offres favorites

### 3. **Suivi des candidatures**
   - Tableau de bord des candidatures
   - Statut des candidatures
   - Historique des postulations

### 4. **Intégration LTI 1.3 avec Moodle**
L’application peut être intégrée aux plateformes éducatives compatibles LTI (ex. : Moodle, Toledo) pour permettre aux étudiants d’accéder aux offres d’emploi directement depuis leur espace de cours.

#### 📌 **Configuration de Moodle**
1. Activer **LTI 1.3** dans Moodle
2. Ajouter l’application en tant qu’outil externe :
   - **URL d’activation** : `/lti-launch`
   - **Client ID** : généré par Moodle
   - **Redirection OAuth2** : `/auth/callback`
   - **Méthode d’authentification** : LTI 1.3

#### ⚙️ **Configuration Backend**
Installation des dépendances :
```bash
npm install express jsonwebtoken body-parser axios
```
Ajout d’un endpoint LTI 1.3 :
```typescript
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

app.post("/lti-launch", (req, res) => {
  const id_token = req.body.id_token;
  if (!id_token) return res.status(400).send("Token LTI manquant");
  
  try {
    const payload = jwt.decode(id_token);
    console.log("Connexion LTI réussie :", payload);
    res.send(`Bienvenue ${payload.name} !`);
  } catch (error) {
    res.status(400).send("Erreur de validation LTI");
  }
});

app.listen(3000, () => console.log("Serveur LTI en ligne sur http://localhost:3000"));
```

#### 📡 **Intégration avec Supabase**
Synchronisation des utilisateurs LTI avec la base de données :
```typescript
import { supabase } from "./supabaseClient";

async function syncUserWithLTI(ltiUserId: string, email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ lti_id: ltiUserId, email });

  if (error) console.error("Erreur LTI-Supabase :", error);
  return data;
}
```

## 🛠️ Configuration technique

### Prérequis
- Node.js
- npm ou yarn
- Docker (pour le backend)
- Expo CLI (pour le mobile)

### Installation

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Frontend Web**
```bash
cd frontend-web
npm install
npm run dev
```

**Application Mobile**
```bash
cd frontend-mobile
npm install
expo start
```

## 🔒 Sécurité
- Utilisation de variables d'environnement (.env)
- Authentification sécurisée avec Supabase et LTI 1.3
- Configuration sécurisée avec Docker

## 🔄 CI/CD
- Configuration Git
- Tests automatisés
- Docker pour le déploiement

## 📱 Compatibilité
- **Web** : Tous les navigateurs modernes
- **Mobile** : iOS et Android via React Native

## 🎯 Bonnes pratiques
- TypeScript pour la sécurité du typage
- ESLint pour la qualité du code
- Architecture modulaire
- Tests unitaires
- Documentation du code

---

Cette documentation est basée sur l'analyse de la structure du projet et des intégrations. Pour plus de détails spécifiques ou des instructions avancées, n'hésitez pas à demander !

