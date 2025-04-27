# Guide d'Internationalisation et d'Accessibilité

Ce guide explique comment implémenter et utiliser les fonctionnalités d'internationalisation (i18n) et d'accessibilité (a11y) dans notre application.

## Table des matières

1. [Internationalisation (i18n)](#internationalisation-i18n)

   - [Structure des fichiers](#structure-des-fichiers-i18n)
   - [Utilisation des traductions](#utilisation-des-traductions)
   - [Formatage des dates et nombres](#formatage-des-dates-et-nombres)
   - [Pluralisation](#pluralisation)
   - [Support RTL](#support-rtl)
   - [Ajout d'une nouvelle langue](#ajout-dune-nouvelle-langue)

2. [Accessibilité (a11y)](#accessibilité-a11y)

   - [Principes d'accessibilité](#principes-daccessibilité)
   - [Composants accessibles](#composants-accessibles)
   - [Focus management](#focus-management)
   - [ARIA](#aria)
   - [Outils d'accessibilité avancés](#outils-daccessibilité-avancés)
   - [Tests d'accessibilité](#tests-daccessibilité)

3. [Internationalisation + Accessibilité](#internationalisation--accessibilité)
   - [Considérations culturelles](#considérations-culturelles)
   - [Formats internationaux](#formats-internationaux)

## Internationalisation (i18n)

### Structure des fichiers i18n

Notre système d'internationalisation utilise `next-intl` et est organisé comme suit:

```
app/
├── i18n/
│   ├── settings.ts       # Configuration i18n
│   └── messages/
│       ├── fr.json       # Traductions françaises
│       ├── en.json       # Traductions anglaises
│       ├── ar.json       # Traductions arabes (RTL)
│       └── ...
├── [locale]/
│   └── layout.tsx        # Layout avec support i18n
└── middleware.ts         # Middleware pour la détection de langue
```

### Utilisation des traductions

Pour utiliser les traductions dans un composant:

```tsx
"use client";

import { useTranslations } from "next-intl";

export function MonComposant() {
  // Obtenir la fonction de traduction pour un namespace spécifique
  const t = useTranslations("common");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
```

Pour les pages statiques (Server Components):

```tsx
import { getTranslations } from "next-intl/server";

export default async function MaPage() {
  const t = await getTranslations("common");

  return (
    <div>
      <h1>{t("title")}</h1>
    </div>
  );
}
```

### Formatage des dates et nombres

Pour formater des dates et nombres selon la locale:

```tsx
"use client";

import { useFormatter } from "next-intl";

export function DateExample() {
  const format = useFormatter();
  const date = new Date();
  const price = 1234.56;

  return (
    <div>
      <p>Date: {format.dateTime(date, { dateStyle: "full" })}</p>
      <p>
        Prix: {format.number(price, { style: "currency", currency: "EUR" })}
      </p>
    </div>
  );
}
```

### Pluralisation

Pour gérer la pluralisation dans les traductions:

```json
{
  "common": {
    "itemCount": "Aucun élément | Un élément | {count} éléments"
  }
}
```

```tsx
// Utilisation
t("common.itemCount", { count: 5 }); // "5 éléments"
```

### Support RTL

Notre application prend en charge les langues de droite à gauche (RTL) comme l'arabe et l'hébreu. Le layout applique automatiquement l'attribut `dir="rtl"` aux pages dans ces langues:

```tsx
// app/[locale]/layout.tsx
const dir = isRTL(locale) ? "rtl" : "ltr";

return (
  <html lang={locale} dir={dir}>
    {/* ... */}
  </html>
);
```

Pour les styles CSS:

```css
/* styles pour LTR */
.component {
  margin-left: 20px;
}

/* styles pour RTL */
[dir="rtl"] .component {
  margin-left: 0;
  margin-right: 20px;
}
```

### Ajout d'une nouvelle langue

Pour ajouter une nouvelle langue:

1. Créer un fichier JSON dans `app/i18n/messages/` (par exemple `de.json` pour l'allemand)
2. Ajouter le code de langue à la liste `locales` dans `app/i18n/settings.ts`
3. Si c'est une langue RTL, l'ajouter à la fonction `isRTL`

## Accessibilité (a11y)

### Principes d'accessibilité

Notre application suit les principes WCAG 2.1 niveau AA:

- **Perceptible**: l'information doit être présentée de manière à être perçue par tous les utilisateurs
- **Utilisable**: les composants d'interface doivent être utilisables par tous
- **Compréhensible**: l'information et l'interface doivent être compréhensibles
- **Robuste**: le contenu doit être suffisamment robuste pour fonctionner avec les technologies d'assistance

### Composants accessibles

Nos composants sont construits pour être accessibles par défaut:

- Contraste suffisant des couleurs (ratio minimum de 4.5:1)
- Texte redimensionnable (jusqu'à 200%)
- Alternatives textuelles pour les éléments non-textuels
- Structure HTML sémantique
- Navigation au clavier complète

### Focus management

La gestion du focus est essentielle pour les utilisateurs qui naviguent au clavier:

```tsx
import { useRef, useEffect } from "react";

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);

  // Déplacer le focus vers la modal lorsqu'elle s'ouvre
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Piéger le focus dans la modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {children}
      <button onClick={onClose}>Fermer</button>
    </div>
  ) : null;
}
```

### ARIA

Utilisez les attributs ARIA pour améliorer l'accessibilité:

```tsx
// Exemple d'un bouton de basculement (toggle)
<button
  aria-pressed={isPressed}
  onClick={() => setIsPressed(!isPressed)}
>
  {isPressed ? 'Activé' : 'Désactivé'}
</button>

// Exemple d'un menu déroulant
<div role="menu" aria-labelledby="menubutton">
  <button id="menubutton" aria-haspopup="true" aria-expanded={isOpen}>
    Menu
  </button>
  {isOpen && (
    <ul>
      <li role="menuitem"><a href="/">Accueil</a></li>
      <li role="menuitem"><a href="/about">À propos</a></li>
    </ul>
  )}
</div>
```

### Outils d'accessibilité avancés

Notre application intègre plusieurs outils d'accessibilité avancés via le `AccessibilityProvider`:

- Contrôle de taille de texte
- Mode contraste élevé
- Mode simplifié
- Préférences de mouvement réduit

```tsx
// Exemple d'utilisation
import { useAccessibility } from "@/components/accessibility/accessibility-provider";

function MyComponent() {
  const { textSize, increaseTextSize, highContrast, reducedMotion } =
    useAccessibility();

  return (
    <div className={highContrast ? "high-contrast" : ""}>
      <button onClick={increaseTextSize}>A+</button>
      {/* Animations conditionnelles */}
      {!reducedMotion && <AnimatedComponent />}
    </div>
  );
}
```

### Tests d'accessibilité

Nous utilisons plusieurs outils pour tester l'accessibilité:

- **Axe-core** pour l'analyse automatisée
- **Tests avec lecteurs d'écran** (NVDA, VoiceOver)
- **Tests au clavier** pour vérifier la navigation

Exemple de test avec axe-core:

```tsx
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Internationalisation + Accessibilité

### Considérations culturelles

- Adaptez les couleurs et iconographies selon les normes culturelles
- Évitez les symboles qui peuvent avoir des significations différentes selon les cultures
- Utilisez des formats de dates, d'heures et d'adresses appropriés pour chaque région

### Formats internationaux

Notre application prend en charge différents formats selon la locale:

- **Dates**: formats localisés (MM/DD/YYYY, DD/MM/YYYY, etc.)
- **Nombres et devises**: formats localisés (1,234.56 vs 1.234,56)
- **Adresses**: formats adaptés aux standards locaux
- **Fuseaux horaires**: prise en compte des fuseaux horaires des utilisateurs

```tsx
// Exemple d'utilisation
import { DateTime } from "luxon";

// Conversion entre fuseaux horaires
const localTime = DateTime.fromISO("2023-05-12T10:00:00Z")
  .setZone(userTimeZone)
  .toFormat("yyyy-MM-dd HH:mm");
```

---

Pour toute question ou suggestion concernant l'implémentation de l'internationalisation ou de l'accessibilité, contactez l'équipe de développement.
