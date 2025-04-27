# Composant Team

Un composant flexible et puissant pour présenter votre équipe avec biographie déployable, liens sociaux, et fonctionnalités de filtrage avancées.

## Fonctionnalités

- Présentation en grille ou en liste
- Biographies déployables pour chaque membre
- Liens sociaux et contact directs
- Filtrage par département/expertise
- Recherche textuelle dans les profils
- Génération automatique des filtres de département
- Animations à l'apparition
- Design responsive
- Mise en évidence des membres importants

## Installation

Assurez-vous que les dépendances nécessaires sont installées :

```bash
npm install framer-motion
```

## Utilisation basique

```tsx
import { Team } from "@/components/team/Team";

// Exemple de données d'équipe
const teamMembers = [
  {
    id: "1",
    name: "Sophie Martin",
    role: "Directrice Générale",
    department: "Direction",
    bio: "Sophie a plus de 15 ans d'expérience dans le secteur et a fondé l'entreprise en 2010.",
    image: "/images/team/sophie-martin.jpg",
    email: "sophie@example.com",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/sophie-martin",
      },
    ],
    location: "Paris, France",
    featured: true,
  },
  {
    id: "2",
    name: "Thomas Durand",
    role: "Directeur Technique",
    department: "Technique",
    bio: "Responsable de toutes les innovations technologiques de l'entreprise.",
    image: "/images/team/thomas-durand.jpg",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/thomas-durand",
      },
      {
        platform: "github",
        url: "https://github.com/thomasdurand",
      },
    ],
  },
  // Ajoutez d'autres membres...
];

export default function NotrePage() {
  return (
    <Team
      members={teamMembers}
      title="Notre équipe"
      description="Découvrez les personnes talentueuses qui composent notre équipe"
      showFilters={true}
      layout="grid"
      columns={3}
    />
  );
}
```

## Options d'affichage

### Affichage en grille (par défaut)

```tsx
<Team
  members={teamMembers}
  layout="grid"
  columns={3} // 2, 3, ou 4 colonnes
/>
```

### Affichage en liste

```tsx
<Team
  members={teamMembers}
  layout="list" // Présentation verticale en liste
/>
```

## Filtrage par département

Le composant génère automatiquement des filtres de département à partir des données, mais vous pouvez aussi fournir une structure personnalisée :

```tsx
// Départements personnalisés
const departments = [
  {
    id: "all",
    name: "Tous",
    members: teamMembers,
  },
  {
    id: "direction",
    name: "Direction",
    description: "L'équipe de direction qui guide l'entreprise",
    members: teamMembers.filter((m) => m.department === "Direction"),
  },
  {
    id: "technique",
    name: "Équipe technique",
    members: teamMembers.filter((m) => m.department === "Technique"),
  },
];

<Team
  members={teamMembers}
  departments={departments}
  enableDepartmentFilter={true}
  initialDepartmentFilter="all"
/>;
```

## Recherche et filtrage

Vous pouvez activer ou désactiver les fonctionnalités de recherche et filtrage :

```tsx
<Team
  members={teamMembers}
  showFilters={true}
  enableSearch={true}
  enableDepartmentFilter={true}
/>
```

La recherche est effectuée sur les champs:

- Nom
- Rôle/poste
- Département
- Biographie
- Tags

## Personnalisation de l'affichage des membres

```tsx
<Team
  members={teamMembers}
  expandableBio={true} // Bio déployable ou toujours visible
  showSocialLinks={true} // Afficher les liens sociaux
  showEmail={true} // Afficher l'email
  showDepartment={true} // Afficher le département
  showLocation={true} // Afficher la localisation
/>
```

## Animations

Vous pouvez choisir différentes animations d'entrée pour les cartes de membres :

```tsx
<Team
  members={teamMembers}
  animationVariant="fade" // "fade", "slide", "scale" ou "none"
/>
```

## API - Props

| Propriété               | Type                                   | Default | Description                                  |
| ----------------------- | -------------------------------------- | ------- | -------------------------------------------- |
| members                 | TeamMember[]                           | -       | Tableau des membres (obligatoire)            |
| departments             | TeamDepartment[]                       | -       | Départements personnalisés (optionnel)       |
| title                   | string                                 | -       | Titre de la section                          |
| description             | string                                 | -       | Description de la section                    |
| showFilters             | boolean                                | true    | Afficher les filtres et la recherche         |
| layout                  | "grid" \| "list"                       | "grid"  | Mode d'affichage                             |
| columns                 | 2 \| 3 \| 4                            | 3       | Nombre de colonnes en mode grille            |
| expandableBio           | boolean                                | true    | Rendre les biographies déployables           |
| showSocialLinks         | boolean                                | true    | Afficher les liens sociaux                   |
| showEmail               | boolean                                | true    | Afficher les emails                          |
| showDepartment          | boolean                                | true    | Afficher les départements                    |
| showLocation            | boolean                                | true    | Afficher les localisations                   |
| className               | string                                 | -       | Classes CSS additionnelles pour le conteneur |
| memberClassName         | string                                 | -       | Classes CSS pour les cartes de membres       |
| animationVariant        | "fade" \| "slide" \| "scale" \| "none" | "fade"  | Type d'animation à l'entrée                  |
| enableSearch            | boolean                                | true    | Activer la recherche                         |
| enableDepartmentFilter  | boolean                                | true    | Activer le filtrage par département          |
| initialDepartmentFilter | string                                 | "all"   | ID du département sélectionné par défaut     |

### Types

```tsx
interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  image?: string | StaticImageData;
  email?: string;
  phone?: string;
  socialLinks?: SocialLink[];
  tags?: string[];
  location?: string;
  joinDate?: string;
  featured?: boolean;
}

interface SocialLink {
  platform:
    | "linkedin"
    | "twitter"
    | "github"
    | "instagram"
    | "facebook"
    | "youtube"
    | "website"
    | "email"
    | string;
  url: string;
  icon?: ReactNode;
}

interface TeamDepartment {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
}
```

## Accessibilité

Le composant respecte les bonnes pratiques d'accessibilité :

- Structure sémantique claire
- Support de la navigation au clavier
- Attributs title pour les liens
- Contraste suffisant pour la lisibilité
