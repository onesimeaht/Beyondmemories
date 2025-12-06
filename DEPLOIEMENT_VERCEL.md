# 🚀 Guide de Déploiement - Beyondmemories sur Vercel

Ce guide vous explique comment déployer votre application **Beyondmemories** (Frontend React + Backend Laravel) sur **Vercel**.

---

## 📋 Prérequis

1. **Compte Vercel** : [Créer un compte gratuit](https://vercel.com/signup)
2. **Repository GitHub** : Votre code doit être sur GitHub
3. **Vercel CLI** (optionnel) : `npm install -g vercel`

---

## 🎯 Architecture de Déploiement

- **Frontend React** : Déployé sur Vercel (domaine principal)
- **Backend Laravel** : Déployé sur Vercel (sous-domaine API ou projet séparé)

---

## 📦 Partie 1 : Déployer le Frontend

### Étape 1 : Préparer les variables d'environnement

1. Créer un fichier `.env` dans le dossier `frontend/` :
```bash
cd frontend
cp .env.example .env
```

2. Modifier le `.env` :
```env
VITE_API_URL=https://votre-backend.vercel.app/api
```
*(Vous mettrez l'URL réelle après avoir déployé le backend)*

### Étape 2 : Déployer sur Vercel

**Option A : Via l'interface Web**

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Importer votre repository GitHub
3. Configurer le projet :
   - **Framework Preset** : Vite
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   
4. Ajouter les variables d'environnement :
   - `VITE_API_URL` = `https://votre-backend.vercel.app/api`

5. Cliquer sur **Deploy**

**Option B : Via CLI**

```bash
cd frontend
vercel --prod
```

### Étape 3 : Récupérer l'URL du Frontend

Après le déploiement, notez l'URL (ex: `https://beyondmemories.vercel.app`)

---

## 🔧 Partie 2 : Déployer le Backend Laravel

### Étape 1 : Générer APP_KEY

```bash
cd backend
php artisan key:generate --show
```

Copiez la clé générée (ex: `base64:xxxxxxxxxxxxx`)

### Étape 2 : Déployer sur Vercel

**Option A : Via l'interface Web**

1. Créer un **nouveau projet** sur Vercel
2. Importer le même repository
3. Configurer :
   - **Framework Preset** : Other
   - **Root Directory** : `backend`
   - **Build Command** : `composer install --no-dev --optimize-autoloader`
   - **Output Directory** : *(laisser vide)*

4. Ajouter les variables d'environnement :
   ```
   APP_NAME=Beyondmemories
   APP_ENV=production
   APP_KEY=base64:votre-clé-générée
   APP_DEBUG=false
   APP_URL=https://votre-backend.vercel.app
   FRONTEND_URL=https://beyondmemories.vercel.app
   
   LOG_CHANNEL=stderr
   SESSION_DRIVER=cookie
   CACHE_DRIVER=array
   QUEUE_CONNECTION=sync
   
   DB_CONNECTION=sqlite
   FILESYSTEM_DISK=public
   ```

5. Cliquer sur **Deploy**

**Option B : Via CLI**

```bash
cd backend
vercel --prod
```

### Étape 3 : Récupérer l'URL du Backend

Notez l'URL (ex: `https://beyondmemories-api.vercel.app`)

---

## 🔄 Partie 3 : Lier Frontend et Backend

### Mettre à jour le Frontend

1. Retourner sur le projet Frontend dans Vercel
2. Aller dans **Settings → Environment Variables**
3. Modifier `VITE_API_URL` :
   ```
   VITE_API_URL=https://beyondmemories-api.vercel.app/api
   ```
4. **Redéployer** le frontend :
   - Aller dans **Deployments**
   - Cliquer sur les 3 points du dernier déploiement
   - Sélectionner **Redeploy**

### Mettre à jour le Backend

1. Retourner sur le projet Backend dans Vercel
2. Aller dans **Settings → Environment Variables**
3. Vérifier/Modifier `FRONTEND_URL` :
   ```
   FRONTEND_URL=https://beyondmemories.vercel.app
   ```
4. Redéployer si nécessaire

---

## ⚠️ Limitations de Vercel pour Laravel

### 1. Stockage de fichiers
**Problème** : Vercel est serverless, les fichiers uploadés ne persistent pas entre les déploiements.

**Solutions** :
- **Option A (Recommandée)** : Utiliser un service de stockage cloud
  - **Cloudinary** (gratuit jusqu'à 25GB) - Recommandé pour les images
  - **AWS S3**
  - **DigitalOcean Spaces**
  
- **Option B** : Déployer le backend sur un serveur traditionnel
  - **Railway.app** (base de données + stockage)
  - **Heroku**
  - **DigitalOcean App Platform**

### 2. Base de données SQLite
**Problème** : SQLite ne fonctionne pas bien en serverless.

**Solutions** :
- Utiliser **PostgreSQL** sur :
  - [Supabase](https://supabase.com) (gratuit)
  - [Neon](https://neon.tech) (gratuit)
  - [Railway](https://railway.app)

### Configuration pour PostgreSQL :

1. Créer une base de données sur Supabase/Neon
2. Mettre à jour les variables d'environnement dans Vercel :
```env
DB_CONNECTION=pgsql
DB_HOST=votre-host.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=votre-password
```

3. Installer le driver PostgreSQL :
```bash
cd backend
composer require doctrine/dbal
```

---

## 🎨 Alternative Recommandée : Frontend Vercel + Backend Railway

Pour éviter les limitations du serverless :

### Backend sur Railway

1. Aller sur [railway.app](https://railway.app)
2. Créer un nouveau projet
3. Déployer depuis GitHub (dossier `backend`)
4. Railway créera automatiquement une base PostgreSQL
5. Ajouter les variables d'environnement
6. Le stockage persistera entre les déploiements ✅

### Frontend reste sur Vercel
- Modifier `VITE_API_URL` pour pointer vers Railway
- Exemple : `https://beyondmemories-backend.up.railway.app/api`

---

## 🧪 Tester le Déploiement

1. **Tester l'API** :
```bash
curl https://votre-backend.vercel.app/api/memories
```

2. **Tester le Frontend** :
   - Ouvrir `https://votre-frontend.vercel.app`
   - Essayer d'uploader une image
   - Vérifier la timeline

---

## 🔐 Sécurité Post-Déploiement

1. **APP_DEBUG** doit être `false` en production
2. **APP_ENV** doit être `production`
3. Configurer un domaine personnalisé dans Vercel
4. Activer HTTPS (automatique sur Vercel)

---

## 📝 Commandes Utiles

### Redéployer depuis la CLI
```bash
# Frontend
cd frontend && vercel --prod

# Backend
cd backend && vercel --prod
```

### Voir les logs
```bash
vercel logs [deployment-url]
```

### Supprimer un projet
```bash
vercel remove [project-name]
```

---

## 🆘 Dépannage

### Erreur 500 sur le backend
- Vérifier les logs : `vercel logs`
- Vérifier que `APP_KEY` est défini
- Vérifier les permissions du storage

### CORS errors
- Vérifier `FRONTEND_URL` dans le backend
- Vérifier que le middleware Cors est actif

### Images ne s'affichent pas
- Problème de stockage serverless
- Solution : Migrer vers Cloudinary ou Railway

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel PHP Runtime](https://github.com/vercel-community/php)
- [Railway Documentation](https://docs.railway.app)
- [Cloudinary Laravel](https://cloudinary.com/documentation/laravel_integration)

---

## ✅ Checklist de Déploiement

- [ ] Repository GitHub à jour
- [ ] Variables d'environnement configurées
- [ ] APP_KEY généré
- [ ] Frontend déployé sur Vercel
- [ ] Backend déployé (Vercel ou Railway)
- [ ] URLs mises à jour (VITE_API_URL + FRONTEND_URL)
- [ ] CORS configuré correctement
- [ ] Test d'upload de fichiers
- [ ] Base de données configurée (PostgreSQL recommandé)
- [ ] Stockage cloud configuré (si fichiers uploadés)

---

**Bon déploiement ! 🚀**
