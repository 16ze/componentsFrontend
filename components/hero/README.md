# Composant Hero

Le composant Hero est un composant flexible et configurable pour créer des sections d'en-tête attractives sur votre site. Il prend en charge plusieurs variations, des appels à l'action (CTA) configurables et des animations.

## Fonctionnalités

- Variations multiples : image de fond, vidéo, animation
- Call-to-action configurable avec tracking de conversion
- Support d'animations au défilement avec Framer Motion
- Adaptation responsive avec breakpoints précis
- Configurations flexibles pour le texte et la mise en page

## Installation

Assurez-vous que les dépendances nécessaires sont installées :

```bash
npm install framer-motion react-intersection-observer
```

## Utilisation

```tsx
import { Hero } from "@/components/hero/Hero";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <Hero
      variant="image"
      title="Titre principal accrocheur"
      subtitle="Un sous-titre pour introduire votre marque"
      description="Description plus détaillée de votre offre ou de votre mission, qui permet aux visiteurs de comprendre rapidement ce que vous proposez."
      backgroundImage="/images/hero-bg.jpg"
      ctaButtons={[
        {
          label: "Commencer",
          href: "/contact",
          trackingId: "hero-cta-start",
        },
        {
          label: "En savoir plus",
          href: "/a-propos",
          variant: "outline",
          icon: <ArrowRight className="h-4 w-4" />,
        },
      ]}
    />
  );
}
```

## Variantes

### Image de fond

```tsx
<Hero
  variant="image"
  title="Avec image de fond"
  backgroundImage="/images/background.jpg"
  backgroundOpacity={0.8}
  overlay={true}
  overlayColor="rgba(0, 0, 0, 0.5)"
  // ...autres props
/>
```

### Vidéo de fond

```tsx
<Hero
  variant="video"
  title="Avec vidéo de fond"
  videoUrl="/videos/background.mp4"
  videoThumbnail="/images/video-poster.jpg"
  // ...autres props
/>
```

### Animation de fond

```tsx
<Hero
  variant="animation"
  title="Avec animation de fond"
  animationData={animationDataObject}
  // ...autres props
/>
```

## API - Props

| Propriété          | Type                              | Default              | Description                                    |
| ------------------ | --------------------------------- | -------------------- | ---------------------------------------------- |
| variant            | "image" \| "video" \| "animation" | "image"              | Type de fond du hero                           |
| title              | string                            | -                    | Titre principal (obligatoire)                  |
| subtitle           | string                            | -                    | Sous-titre optionnel                           |
| description        | string                            | -                    | Description détaillée                          |
| backgroundImage    | string \| StaticImageData         | -                    | Image de fond (pour variant="image")           |
| backgroundOpacity  | number                            | 0.7                  | Opacité de l'image/vidéo de fond (0-1)         |
| videoUrl           | string                            | -                    | URL de la vidéo (pour variant="video")         |
| videoThumbnail     | string \| StaticImageData         | -                    | Image de prévisualisation vidéo                |
| animationData      | any                               | -                    | Données d'animation (pour variant="animation") |
| ctaButtons         | CtaButton[]                       | []                   | Boutons d'appel à l'action                     |
| textAlignment      | "left" \| "center" \| "right"     | "center"             | Alignement du texte                            |
| textColor          | string                            | "text-white"         | Couleur du texte (classes Tailwind)            |
| containerClassName | string                            | -                    | Classes CSS additionnelles pour le conteneur   |
| fullHeight         | boolean                           | true                 | Hero en pleine hauteur ou hauteur partielle    |
| overlay            | boolean                           | true                 | Ajouter un overlay sur le fond                 |
| overlayColor       | string                            | "rgba(0, 0, 0, 0.4)" | Couleur de l'overlay                           |

### Type CtaButton

```ts
type CtaButton = {
  label: string; // Texte du bouton
  href: string; // Lien du bouton
  variant?: "default" | "outline" | "secondary" | "ghost"; // Variante visuelle
  size?: "default" | "sm" | "lg"; // Taille du bouton
  icon?: ReactNode; // Icône optionnelle
  trackingId?: string; // ID pour le tracking des conversions
};
```

## Responsive

Le composant Hero est entièrement responsive:

- Sur mobile: texte plus petit, mise en page optimisée
- Sur tablette: taille moyenne pour les textes et boutons
- Sur desktop: mise en page complète avec espacements optimaux

## Accessibilité

Le composant est conçu avec l'accessibilité en tête:

- Contrastes adéquats pour la lisibilité
- Structure sémantique avec headings appropriés
- Support de la navigation au clavier pour les CTA
