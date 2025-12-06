# Déploiement Docker - Beyondmemories

## 🚀 Options de déploiement

### Option 1: Railway.app (RECOMMANDÉ - Gratuit)

1. **Créer un compte sur Railway**
   - Visite https://railway.app
   - Connecte-toi avec GitHub

2. **Déployer le Backend**
   - Clique sur "New Project" → "Deploy from GitHub repo"
   - Sélectionne le repo `Beyondmemories`
   - Railway détectera automatiquement le Dockerfile
   - Configure:
     - Root Directory: `backend`
     - Variables d'environnement (Settings → Variables):
       ```
       APP_NAME=Beyondmemories
       APP_ENV=production
       APP_KEY=base64:Mun25Mg5Q5JeS3k37Dx1z44hvo8x5Bd6HcXgGoYU2nQ=
       APP_DEBUG=false
       APP_URL=https://ton-backend.railway.app
       FRONTEND_URL=https://ton-frontend.railway.app
       LOG_CHANNEL=stderr
       LOG_LEVEL=error
       DB_CONNECTION=sqlite
       SESSION_DRIVER=cookie
       CACHE_STORE=array
       ```
   - Clique sur "Generate Domain" pour obtenir une URL publique

3. **Déployer le Frontend**
   - Ajoute un nouveau service: "New" → "GitHub Repo"
   - Même repo, mais configure:
     - Root Directory: `frontend`
     - Variables d'environnement:
       ```
       VITE_API_URL=https://ton-backend.railway.app/api
       ```
   - Generate Domain pour le frontend

### Option 2: Render.com (Gratuit)

1. **Backend**
   - Va sur https://render.com
   - "New +" → "Web Service"
   - Connecte GitHub → Sélectionne le repo
   - Configure:
     - Name: `beyondmemories-backend`
     - Root Directory: `backend`
     - Environment: `Docker`
     - Plan: `Free`
     - Ajoute les variables d'environnement

2. **Frontend**
   - "New +" → "Static Site"
   - Configure:
     - Name: `beyondmemories-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
     - Ajoute la variable `VITE_API_URL`

### Option 3: Fly.io (Gratuit)

```bash
# Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# Backend
cd backend
fly launch --dockerfile Dockerfile --name beyondmemories-back
fly secrets set APP_KEY=base64:Mun25Mg5Q5JeS3k37Dx1z44hvo8x5Bd6HcXgGoYU2nQ=
fly deploy

# Frontend
cd ../frontend
fly launch --dockerfile Dockerfile --name beyondmemories-front
fly deploy
```

## 🧪 Test local avec Docker

```bash
# À la racine du projet
docker-compose up --build

# L'app sera accessible sur:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 📝 Notes importantes

### Limitations avec SQLite
- **SQLite ne persiste pas** sur les déploiements serverless
- Les données sont perdues à chaque redéploiement
- **Solution**: Migrer vers PostgreSQL (gratuit sur Railway/Render)

### Pour passer à PostgreSQL:

1. **Sur Railway**: Ajoute un service PostgreSQL
2. **Dans .env backend**, remplace:
   ```
   DB_CONNECTION=pgsql
   DB_HOST=<fourni-par-railway>
   DB_PORT=5432
   DB_DATABASE=railway
   DB_USERNAME=postgres
   DB_PASSWORD=<fourni-par-railway>
   ```

### Stockage des images
- Le dossier `storage/` est **éphémère** dans les conteneurs
- **Solution recommandée**: 
  - Cloudinary (gratuit 25GB)
  - AWS S3
  - DigitalOcean Spaces

## 🔧 Variables d'environnement requises

### Backend
```env
APP_NAME=Beyondmemories
APP_ENV=production
APP_KEY=base64:Mun25Mg5Q5JeS3k37Dx1z44hvo8x5Bd6HcXgGoYU2nQ=
APP_DEBUG=false
APP_URL=<url-backend-public>
FRONTEND_URL=<url-frontend-public>
LOG_CHANNEL=stderr
LOG_LEVEL=error
DB_CONNECTION=sqlite
SESSION_DRIVER=cookie
CACHE_STORE=array
```

### Frontend
```env
VITE_API_URL=<url-backend-public>/api
```

## 🚨 Troubleshooting

### Backend ne démarre pas
```bash
# Vérifier les logs
docker logs <container-id>

# Reconstruire
docker-compose build --no-cache backend
```

### Erreur de permissions
Le Dockerfile gère automatiquement les permissions avec `chown -R www-data:www-data`

### CORS errors
Vérifie que `FRONTEND_URL` dans le backend correspond exactement à l'URL frontend.
