# Composant Testimonials

Un composant flexible et configurable pour afficher des témoignages clients avec plusieurs options d'affichage et un support complet pour le SEO via les microdata Schema.org.

## Fonctionnalités

- Trois modes d'affichage : grille, liste et slider
- Carousel/slider avec navigation tactile
- Cartes de témoignage avec photo de profil, notation et informations sur l'auteur
- Animation d'entrée et de transition configurables
- Support complet pour les microdata Schema.org
- Entièrement responsive sur tous les appareils
- Hautement configurable via les props

## Installation

Assurez-vous que les dépendances nécessaires sont installées :

```bash
npm install framer-motion date-fns
```

## Utilisation

```tsx
import { Testimonials } from "@/components/testimonials/Testimonials";

// Données de témoignage
const testimonialData = [
  {
    id: "1",
    quote:
      "Ce produit a complètement transformé notre processus de travail. Nous avons gagné un temps précieux et augmenté notre productivité de 40%.",
    authorName: "Marie Dubois",
    authorTitle: "Directrice Marketing",
    authorCompany: "Entreprise XYZ",
    authorImage: "/images/testimonials/marie.jpg",
    rating: 5,
    date: "2023-05-15",
  },
  // Ajoutez d'autres témoignages...
];

export default function TestimonialsSection() {
  return (
    <Testimonials
      testimonials={testimonialData}
      title="Ce que nos clients disent"
      description="Découvrez les expériences de ceux qui nous font confiance au quotidien"
      displayMode="slider"
      showRatings={true}
      enableMicrodata={true}
      autoplay={true}
      autoplaySpeed={5000}
    />
  );
}
```

## Modes d'affichage

### Mode Grille

```tsx
<Testimonials
  testimonials={testimonialData}
  displayMode="grid"
  columns={3} // 1, 2, 3 ou 4 colonnes
/>
```

### Mode Liste

```tsx
<Testimonials testimonials={testimonialData} displayMode="list" />
```

### Mode Slider

```tsx
<Testimonials
  testimonials={testimonialData}
  displayMode="slider"
  enableNavigation={true}
  enablePagination={true}
  enableTouchDrag={true}
  autoplay={true}
  autoplaySpeed={5000}
/>
```

## Animations

Vous pouvez personnaliser les animations d'entrée pour chaque témoignage :

```tsx
<Testimonials
  testimonials={testimonialData}
  animationVariant="fade" // "fade", "slide", "scale" ou "none"
/>
```

## SEO et Microdata

Le composant prend en charge les microdata Schema.org pour améliorer le référencement :

```tsx
<Testimonials testimonials={testimonialData} enableMicrodata={true} />
```

Cela générera automatiquement les balises JSON-LD pour les témoignages, qui seront reconnues par les moteurs de recherche pour enrichir les résultats.

## Responsivité

Le composant s'adapte automatiquement à tous les appareils :

- Sur mobile : 1 colonne en mode grille, contrôles tactiles en mode slider
- Sur tablette : 2 colonnes en mode grille (si columns ≥ 2)
- Sur desktop : Jusqu'à 4 colonnes en mode grille (selon la valeur de columns)

## API - Props

| Propriété        | Type                                   | Default | Description                                      |
| ---------------- | -------------------------------------- | ------- | ------------------------------------------------ |
| testimonials     | Testimonial[]                          | -       | Tableau des témoignages à afficher (obligatoire) |
| title            | string                                 | -       | Titre de la section                              |
| description      | string                                 | -       | Description de la section                        |
| displayMode      | "grid" \| "list" \| "slider"           | "grid"  | Mode d'affichage des témoignages                 |
| columns          | 1 \| 2 \| 3 \| 4                       | 3       | Nombre de colonnes en mode grille                |
| showRatings      | boolean                                | true    | Afficher les évaluations (étoiles)               |
| showDates        | boolean                                | false   | Afficher les dates des témoignages               |
| enableMicrodata  | boolean                                | true    | Activer les microdata Schema.org                 |
| className        | string                                 | -       | Classes CSS additionnelles pour le conteneur     |
| itemClassName    | string                                 | -       | Classes CSS pour chaque carte de témoignage      |
| animationVariant | "fade" \| "slide" \| "scale" \| "none" | "fade"  | Type d'animation à l'entrée                      |
| autoplay         | boolean                                | false   | Défilement automatique en mode slider            |
| autoplaySpeed    | number                                 | 5000    | Vitesse du défilement en ms                      |
| enableNavigation | boolean                                | true    | Afficher les boutons de navigation               |
| enablePagination | boolean                                | true    | Afficher les indicateurs de pagination           |
| enableTouchDrag  | boolean                                | true    | Activer le défilement tactile                    |

### Type Testimonial

```ts
interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorImage?: string | StaticImageData;
  rating?: number; // étoiles sur 5
  date?: string;
  url?: string; // URL externe vers le témoignage complet
}
```

## Accessibilité

Le composant est conçu avec l'accessibilité en tête :

- Navigation au clavier disponible
- Attributs ARIA appropriés pour les contrôles de navigation
- Contraste suffisant pour la lisibilité
- Structure sémantique des contenus
