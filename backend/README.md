# Backend API pour Components Frontend

Ce projet fournit une API RESTful complète pour le projet Components Frontend, y compris des fonctionnalités de réservation, gestion de galerie d'images, formulaire de contact et administration.

## Fonctionnalités

- 🔐 **Authentification** : JWT, récupération de mot de passe
- 📅 **Réservation** : gestion des rendez-vous, vérification de disponibilité
- 🖼️ **Galerie** : upload et gestion d'images
- 📝 **Contact** : traitement des formulaires de contact
- 👑 **Administration** : panel d'administration sécurisé

## Démarrage Rapide

### Prérequis

- Node.js (v14+)
- MongoDB
- npm ou yarn

### Installation

1. Cloner le dépôt

   ```
   git clone https://github.com/16ze/componentsFrontend.git
   cd components-frontend/backend
   ```

2. Installer les dépendances

   ```
   npm install
   ```

3. Configurer les variables d'environnement

   ```
   cp .env.example .env
   ```

   Ensuite, modifiez le fichier `.env` avec vos paramètres.

4. Démarrer le serveur
   ```
   npm run dev
   ```

## Structure du Projet

```
backend/
├── config/         # Configuration de l'application
├── controllers/    # Contrôleurs pour chaque fonctionnalité
├── middleware/     # Middleware (auth, validation, etc.)
├── models/         # Modèles Mongoose
├── routes/         # Routes de l'API
├── services/       # Services métier
├── uploads/        # Fichiers uploadés
├── utils/          # Utilitaires
├── server.js       # Point d'entrée de l'application
```

## API Endpoints

### Authentification

- `POST /api/admin/login` - Connexion administrateur
- `POST /api/admin/register` - Inscription (admin uniquement)
- `GET /api/admin/profile` - Profil utilisateur
- `PUT /api/admin/profile` - Mise à jour du profil
- `POST /api/admin/forgot-password` - Récupération de mot de passe
- `POST /api/admin/reset-password/:token` - Réinitialisation de mot de passe

### Réservation

- `GET /api/booking` - Liste des réservations
- `GET /api/booking/available` - Créneaux disponibles
- `GET /api/booking/:id` - Détails d'une réservation
- `POST /api/booking` - Créer une réservation
- `PUT /api/booking/:id` - Mettre à jour une réservation
- `DELETE /api/booking/:id` - Supprimer une réservation

### Contact

- `POST /api/contact` - Soumettre un formulaire de contact
- `GET /api/contact` - Liste des messages (admin)
- `GET /api/contact/:id` - Détails d'un message
- `PUT /api/contact/:id` - Mettre à jour un message
- `DELETE /api/contact/:id` - Supprimer un message

### Galerie

- `GET /api/gallery` - Liste des images
- `GET /api/gallery/:id` - Détails d'une image
- `POST /api/gallery` - Uploader une image
- `PUT /api/gallery/:id` - Mettre à jour une image
- `DELETE /api/gallery/:id` - Supprimer une image

### Administration

- `GET /api/admin/dashboard-stats` - Statistiques du tableau de bord

## Sécurité

- Validation des entrées utilisateur avec Joi
- Protection CORS
- Sécurité des headers avec Helmet
- Rate limiting pour prévenir les attaques par force brute
- Sanitisation des données pour prévenir les injections
- Gestion sécurisée des mots de passe avec bcrypt
- Authentification basée sur JSON Web Tokens (JWT)

## Développement

### Tests

```
npm test
```

### Linting

```
npm run lint
```

### Production

```
npm start
```

## Licence

Ce projet est sous licence MIT.
