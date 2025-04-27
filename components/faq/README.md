# Composant FAQ (Foire Aux Questions)

Un composant sophistiqué pour afficher les questions fréquemment posées avec des fonctionnalités avancées comme la recherche instantanée, le groupement par catégories, et une prise en charge complète du SEO.

## Fonctionnalités

- Animation d'ouverture/fermeture fluide pour les accordéons
- Recherche instantanée dans l'ensemble des questions et réponses
- Groupement par catégories avec système d'onglets
- Génération automatique de la table des matières
- Support SEO avec Schema.org pour les FAQ
- Possibilité d'ouvrir un seul accordéon à la fois ou plusieurs
- Navigation par ancres vers des questions spécifiques
- Design responsive et adaptatif

## Installation

Assurez-vous que les dépendances nécessaires sont installées :

```bash
npm install framer-motion
```

## Utilisation basique

```tsx
import { FAQ } from "@/components/faq/FAQ";

// Exemple de données FAQ
const faqItems = [
  {
    id: "1",
    question: "Comment puis-je créer un compte ?",
    answer:
      "Pour créer un compte, cliquez sur le bouton \"S'inscrire\" en haut à droite de la page d'accueil.",
  },
  {
    id: "2",
    question: "Quels sont les délais de livraison ?",
    answer:
      "Les délais de livraison varient entre 3 et 5 jours ouvrés selon votre localisation.",
  },
  // Ajoutez d'autres questions...
];

export default function FAQSection() {
  return (
    <FAQ
      items={faqItems}
      title="Questions fréquemment posées"
      description="Retrouvez les réponses aux questions les plus courantes"
    />
  );
}
```

## Groupement par catégories

```tsx
// Exemple de données FAQ avec catégories
const faqItems = [
  {
    id: "1",
    question: "Comment puis-je créer un compte ?",
    answer: "...",
    category: "Compte",
  },
  {
    id: "2",
    question: "Comment réinitialiser mon mot de passe ?",
    answer: "...",
    category: "Compte",
  },
  {
    id: "3",
    question: "Quels modes de paiement acceptez-vous ?",
    answer: "...",
    category: "Paiement",
  },
];

// Utilisation avec catégories prédéfinies
const categories = [
  {
    id: "all",
    name: "Toutes les questions",
    items: faqItems,
  },
  {
    id: "compte",
    name: "Compte",
    description: "Questions concernant la gestion de votre compte",
    items: faqItems.filter((item) => item.category === "Compte"),
  },
  {
    id: "paiement",
    name: "Paiement",
    items: faqItems.filter((item) => item.category === "Paiement"),
  },
];

<FAQ
  items={faqItems}
  categories={categories}
  useCategoryTabs={true}
  showCategoryDescription={true}
/>;
```

## Options avancées

### Table des matières

La table des matières est générée automatiquement lorsqu'il y a plus de 3 questions :

```tsx
<FAQ items={faqItems} generateTableOfContents={true} />
```

### Gestion des accordéons

Vous pouvez configurer le type d'accordéon (un seul ouvert à la fois ou plusieurs) :

```tsx
// Un seul accordéon ouvert à la fois
<FAQ
  items={faqItems}
  accordionType="single"
/>

// Plusieurs accordéons peuvent être ouverts simultanément
<FAQ
  items={faqItems}
  accordionType="multiple"
/>

// Éléments ouverts par défaut
<FAQ
  items={faqItems}
  defaultOpen={['1', '3']} // IDs des éléments à ouvrir par défaut
/>
```

### Personnalisation visuelle

```tsx
<FAQ
  items={faqItems}
  className="bg-gray-50"
  itemClassName="border-2"
  activeItemClassName="border-blue-500 bg-blue-50"
  animationDuration={500} // Durée de l'animation en ms
/>
```

## SEO avec Schema.org

Le composant génère automatiquement des balises Schema.org pour les FAQ, ce qui améliore le référencement et permet l'affichage enrichi dans les résultats de recherche :

```tsx
<FAQ items={faqItems} enableSchemaMarkup={true} />
```

## API - Props

| Propriété               | Type                   | Default                        | Description                                     |
| ----------------------- | ---------------------- | ------------------------------ | ----------------------------------------------- |
| items                   | FAQItem[]              | -                              | Tableau des questions (obligatoire)             |
| categories              | FAQCategory[]          | -                              | Catégories de questions (optionnel)             |
| title                   | string                 | "Questions fréquemment posées" | Titre de la section                             |
| description             | string                 | -                              | Description de la section                       |
| searchPlaceholder       | string                 | "Rechercher une question..."   | Placeholder du champ de recherche               |
| useCategoryTabs         | boolean                | true                           | Utiliser des onglets pour les catégories        |
| generateTableOfContents | boolean                | true                           | Générer une table des matières                  |
| enableSchemaMarkup      | boolean                | true                           | Générer les balises Schema.org pour SEO         |
| className               | string                 | -                              | Classes CSS additionnelles pour le conteneur    |
| itemClassName           | string                 | -                              | Classes CSS pour les éléments de l'accordéon    |
| activeItemClassName     | string                 | -                              | Classes CSS pour l'élément actif de l'accordéon |
| animationDuration       | number                 | 300                            | Durée de l'animation en millisecondes           |
| defaultOpen             | string[]               | []                             | IDs des éléments ouverts par défaut             |
| accordionType           | "single" \| "multiple" | "multiple"                     | Type d'accordéon (un seul ou plusieurs ouverts) |
| showCategoryDescription | boolean                | true                           | Afficher la description des catégories          |

### Types

```tsx
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQCategory {
  id: string;
  name: string;
  description?: string;
  items: FAQItem[];
}
```

## Accessibilité

Le composant respecte les bonnes pratiques d'accessibilité :

- Attributs ARIA appropriés pour les accordéons
- Possibilité de naviguer au clavier
- Contraste suffisant pour la lisibilité
- Ancres pour naviguer directement vers une question spécifique
