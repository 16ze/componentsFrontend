# Galerie d'Images avec Lazy Loading et Modals

## Prompt utilisé pour générer ce composant

```
Crée une galerie d'images avancée avec Next.js qui comprend:
1) Chargement d'images optimisé avec Image de Next.js et lazy loading via intersection observer
2) Trois types de mises en page (grille, mosaïque, spotlight) avec class-variance-authority
3) Filtrage par catégorie et recherche par texte
4) Modal de visualisation (Dialog shadcn/UI) avec navigation entre images
5) Fonctionnalités de zoom et téléchargement dans la modal
6) Animation d'apparition avec framer-motion pour une expérience utilisateur fluide
7) État de chargement avec Skeleton pour une meilleure UX
8) Support du thème clair/sombre complet
9) Responsive design avec différentes dispositions pour mobile et desktop
10) Messages d'état vide et gestion des erreurs

La galerie doit être performante, accessible et offrir une expérience utilisateur premium avec des micro-interactions.
```

## Architecture du composant

```
📁 image-gallery/
  📁 app/
    📁 gallery/
      📄 page.jsx           # Page de galerie intégrant le composant
  📁 components/
    📁 gallery/
      📄 ImageGallery.jsx   # Composant principal de galerie
      📄 GalleryItem.jsx    # Élément individuel (inclus dans ImageGallery)
      📄 ImageModal.jsx     # Modal de visualisation (inclus dans ImageGallery)
  📁 lib/
    📁 utils/
      📄 gallery-utils.js   # Utilitaires pour la galerie
  📁 styles/
    📄 gallery.css          # Styles spécifiques (spotlight layout)
```

## Flux de données

1. Les images sont chargées avec des données simulées (en production, connectez à votre API ou CMS)
2. L'utilisateur peut filtrer par catégorie et rechercher par texte
3. Le lazy loading charge les images uniquement lorsqu'elles sont visibles
4. Au clic sur une image, une modal s'ouvre avec navigation, zoom et téléchargement
5. L'interface s'adapte automatiquement au thème clair/sombre et à la taille d'écran

## Dépendances requises

- Next.js 15.x
- React 19.x
- Tailwind CSS 3.4.x
- shadcn/ui (Dialog, Card, Button, etc.)
- class-variance-authority
- framer-motion
- react-intersection-observer
- next-themes
- lucide-react (icônes)

## Comment implémenter

1. Assurez-vous d'avoir shadcn/ui configuré dans votre projet
2. Installez les dépendances: `npm install class-variance-authority framer-motion react-intersection-observer`
3. Copiez les composants dans les dossiers correspondants
4. Ajoutez les styles CSS nécessaires pour le layout spotlight
5. Créez une page gallery qui importe et utilise le composant ImageGallery

## Personnalisation

Vous pouvez facilement personnaliser:

- Les catégories d'images et les filtres
- Les dispositions de grille via class-variance-authority
- Les animations d'apparition et de transition
- Les fonctionnalités de la modal (ajout de partage, favoris, etc.)
- Les sources d'images (connexion à votre API ou CMS)
