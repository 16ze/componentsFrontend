# Composant Timeline

Un composant flexible pour afficher des événements chronologiques ou un parcours, avec support pour différentes orientations, contenus multimédias, et animations au défilement.

## Fonctionnalités

- Deux orientations : verticale (classique) et horizontale (séquence)
- Points de timeline interactifs avec animations au défilement
- Support pour contenu multimédia (images, vidéos, intégrations)
- Vue détaillée expandable pour chaque élément
- Mise en évidence d'événements importants
- Design responsive et adaptatif
- Hautement personnalisable via les props

## Installation

Assurez-vous que les dépendances nécessaires sont installées :

```bash
npm install framer-motion
```

## Utilisation basique

```tsx
import { Timeline } from "@/components/timeline/Timeline";
import { CalendarIcon, RocketIcon, TrophyIcon } from "lucide-react";

// Exemple de données Timeline
const timelineItems = [
  {
    id: "1",
    title: "Fondation de l'entreprise",
    date: "Janvier 2010",
    description: "Création de l'entreprise par les trois fondateurs.",
    icon: <CalendarIcon className="h-4 w-4 text-white" />,
    media: {
      type: "image",
      url: "/images/timeline/fondation.jpg",
      caption: "Les fondateurs lors du lancement",
    },
  },
  {
    id: "2",
    title: "Expansion internationale",
    date: "Mars 2015",
    description:
      "Ouverture des premiers bureaux internationaux à Londres et New York.",
    icon: <RocketIcon className="h-4 w-4 text-white" />,
    highlighted: true,
  },
  {
    id: "3",
    title: "Récompense de l'industrie",
    date: "Novembre 2018",
    description: "Obtention du prix d'excellence dans notre domaine.",
    icon: <TrophyIcon className="h-4 w-4 text-white" />,
    links: [
      {
        label: "Voir le prix",
        url: "/recompenses/2018",
      },
    ],
  },
];

export default function HistoireSection() {
  return (
    <Timeline
      items={timelineItems}
      title="Notre histoire"
      description="Découvrez les moments clés qui ont façonné notre entreprise"
      alternating={true}
      enableExpandedView={true}
    />
  );
}
```

## Variations

### Timeline Verticale (par défaut)

```tsx
<Timeline
  items={timelineItems}
  orientation="vertical"
  alternating={true} // Éléments alternés gauche/droite sur grand écran
/>
```

### Timeline Horizontale

```tsx
<Timeline items={timelineItems} orientation="horizontal" />
```

### Timeline Verticale sans alternance

```tsx
<Timeline
  items={timelineItems}
  orientation="vertical"
  alternating={false} // Tous les éléments à droite
/>
```

### Ordre inversé

```tsx
<Timeline
  items={timelineItems}
  reverseOrder={true} // Du plus récent au plus ancien
/>
```

## Personnalisation visuelle

```tsx
<Timeline
  items={timelineItems}
  connectorColor="bg-blue-200" // Couleur des lignes connectrices
  dotColor="bg-blue-500" // Couleur des points (peut être remplacée par item)
  className="bg-gray-50 rounded-lg p-8" // Classes pour le conteneur
/>
```

## Contenu multimédia

Chaque élément de timeline peut contenir un média (image, vidéo ou intégration) :

```tsx
const itemWithMedia = {
  id: "1",
  title: "Événement avec image",
  date: "2020",
  description: "Description...",
  media: {
    type: "image", // 'image', 'video', ou 'embed'
    url: "/images/event.jpg",
    caption: "Légende optionnelle",
  },
};

// Item avec vidéo
const itemWithVideo = {
  id: "2",
  title: "Événement avec vidéo",
  date: "2021",
  description: "Description...",
  media: {
    type: "video",
    url: "/videos/event.mp4",
  },
};

// Item avec intégration (iframe)
const itemWithEmbed = {
  id: "3",
  title: "Événement avec intégration",
  date: "2022",
  description: "Description...",
  media: {
    type: "embed",
    url: "https://www.youtube.com/embed/VIDEO_ID",
  },
};
```

## Animations

Vous pouvez contrôler les animations au défilement :

```tsx
<Timeline
  items={timelineItems}
  animateEntries={true} // Activer les animations
  animationDistance={50} // Distance de déplacement en pixels
  animationDuration={0.5} // Durée en secondes
/>
```

## Vue expandable

Vous pouvez permettre aux utilisateurs de développer/réduire les détails de chaque élément :

```tsx
<Timeline
  items={timelineItems}
  enableExpandedView={true}
  defaultExpandedIds={["1"]} // IDs des éléments ouverts par défaut
/>
```

## API - Props

| Propriété            | Type                       | Default       | Description                                     |
| -------------------- | -------------------------- | ------------- | ----------------------------------------------- |
| items                | TimelineItem[]             | -             | Tableau des éléments (obligatoire)              |
| orientation          | "vertical" \| "horizontal" | "vertical"    | Orientation de la timeline                      |
| title                | string                     | -             | Titre de la section                             |
| description          | string                     | -             | Description de la section                       |
| alternating          | boolean                    | true          | Alterner les éléments (mode vertical seulement) |
| connectorColor       | string                     | "bg-gray-200" | Classe CSS pour la couleur des connecteurs      |
| dotColor             | string                     | "bg-primary"  | Classe CSS pour la couleur des points           |
| animateEntries       | boolean                    | true          | Animer les éléments au défilement               |
| animationDistance    | number                     | 50            | Distance de déplacement pour l'animation        |
| animationDuration    | number                     | 0.5           | Durée de l'animation en secondes                |
| className            | string                     | -             | Classes CSS additionnelles pour le conteneur    |
| reverseOrder         | boolean                    | false         | Inverser l'ordre des éléments                   |
| enableDotInteraction | boolean                    | true          | Activer l'interaction avec les points           |
| enableExpandedView   | boolean                    | true          | Permettre de développer/réduire les détails     |
| defaultExpandedIds   | string[]                   | []            | IDs des éléments ouverts par défaut             |

### Type TimelineItem

```ts
interface TimelineItem {
  id: string;
  title: string;
  date: string;
  description: string;
  icon?: ReactNode;
  customDot?: ReactNode;
  dotColor?: string;
  media?: TimelineMedia;
  links?: Array<{
    label: string;
    url: string;
    external?: boolean;
  }>;
  highlighted?: boolean;
}

type TimelineMedia = {
  type: "image" | "video" | "embed";
  url: string | StaticImageData;
  caption?: string;
  width?: number;
  height?: number;
};
```

## Accessibilité

Le composant est conçu avec l'accessibilité en tête :

- Structure sémantique avec ordre chronologique maintenu
- Support pour la navigation au clavier
- Éléments interactifs clairement indiqués
- Contraste adéquat pour la lisibilité
