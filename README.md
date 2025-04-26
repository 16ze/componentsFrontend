# Structure complète du projet

Voici la structure complète du projet avec tous les composants organisés par fonctionnalité. Cette structure suit les conventions de Next.js App Router et les meilleures pratiques d'organisation de code.

```
📁 modern-nextjs-components/
  📁 app/
    📁 admin/
      📁 dashboard/
        📄 page.jsx           # Dashboard Admin
    📁 booking/
        📄 page.jsx           # Page de réservation
    📁 contact/
        📄 page.jsx           # Page de contact
    📁 gallery/
        📄 page.jsx           # Page de galerie d'images
    📄 layout.jsx             # Layout racine avec la navigation

  📁 components/
    📁 admin/
      📁 dashboard/
        # Composants du dashboard inclus dans page.jsx

    📁 booking/
      📄 BookingCalendar.jsx  # Calendrier de réservation
      📄 BookingForm.jsx      # Formulaire de détails

    📁 contact/
      📄 ContactForm.jsx      # Formulaire de contact

    📁 gallery/
      📄 ImageGallery.jsx     # Galerie d'images

    📁 layout/
      📄 MainNavigation.jsx   # Navigation principale

    📁 ui/
      # Composants shadcn/ui importés

  📁 hooks/
    # Hooks personnalisés pour les différents composants

  📁 lib/
    📁 utils/
      📄 utils.js             # Utilitaires partagés
      📄 cn.js                # Fonction utilitaire pour les classes conditionnelles
    📁 validation/
      # Schémas de validation zod

  📁 stores/
    📄 bookingStore.js        # Store Zustand pour les réservations

  📁 styles/
    📄 gallery.css            # Styles spécifiques pour la galerie
    📄 globals.css            # Styles globaux et configuration Tailwind

  📁 types/
    # Types TypeScript (si TypeScript est utilisé)

  📁 public/
    # Images et autres fichiers statiques

  📁 prompts/
    📄 booking-system.md      # Prompt utilisé pour le système de réservation
    📄 admin-dashboard.md     # Prompt utilisé pour le dashboard admin
    📄 contact-form.md        # Prompt utilisé pour le formulaire de contact
    📄 navigation.md          # Prompt utilisé pour la navigation
    📄 image-gallery.md       # Prompt utilisé pour la galerie d'images

  📄 README.md                # Documentation principale du projet
  📄 package.json             # Dépendances et scripts
  📄 tailwind.config.js       # Configuration Tailwind CSS
  📄 next.config.js           # Configuration Next.js
```

## Comment organiser les fichiers

1. **Structure par fonctionnalité**: Les composants sont organisés par fonctionnalité, pas par type. Cela permet de garder tout le code lié à une fonction particulière au même endroit.

2. **App Router**: La structure suit le modèle App Router de Next.js 15.x, avec des dossiers représentant les routes et des fichiers `page.jsx` pour les pages.

3. **Composants modulaires**: Chaque composant principal est subdivisé en sous-composants plus petits pour maintenir la lisibilité et faciliter la maintenance.

4. **Stores centralisés**: Les stores Zustand sont regroupés dans un dossier dédié pour faciliter la gestion d'état global.

5. **Hooks personnalisés**: Les logiques réutilisables sont extraites dans des hooks personnalisés.

6. **Documentation des prompts**: Chaque composant est accompagné du prompt utilisé pour le générer, facilitant les futures extensions ou modifications.

## Conventions de nommage

- Les noms de composants utilisent la convention PascalCase (ex: `BookingCalendar.jsx`)
- Les noms de hooks commencent par "use" (ex: `useBookingStore.js`)
- Les noms de fichiers utilitaires utilisent le kebab-case (ex: `date-utils.js`)
- Les pages dans le dossier `app` utilisent `page.jsx` comme nom de fichier

## Dépendances principales

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "sonner": "^1.2.0",
    "recharts": "^2.9.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.292.0",
    "next-themes": "^0.2.1",
    "react-intersection-observer": "^9.5.0"
  }
}
```

## Installation des composants shadcn/ui requis

```bash
npx shadcn-ui@latest add button card input calendar tabs select sheet dialog avatar badge skeleton switch form
```

Cette structure de projet fournit une base solide et bien organisée pour développer des applications Next.js complexes avec une architecture modulaire et maintenable.
