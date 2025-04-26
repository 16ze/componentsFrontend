# Formulaire de Contact Avancé avec Validation

## Prompt utilisé pour générer ce composant

```
Crée un formulaire de contact avancé en Next.js qui utilise:
1) react-hook-form pour la gestion de l'état du formulaire
2) zod pour la validation des données avec des règles précises (email, téléphone au format français, longueur minimale et maximale pour le message)
3) Animation de transition avec framer-motion entre l'état initial et l'état de succès
4) Compteur de caractères restants pour le champ message
5) Switch pour l'option newsletter
6) UI responsive avec Tailwind CSS et composants shadcn/UI
7) Notifications avec Sonner pour le feedback utilisateur
8) Gestion de l'état de chargement avec animation appropriée
9) Structure modulaire et organisation du code optimale

Le formulaire doit être compatible mobile et desktop, et supporter le thème clair/sombre.
```

## Architecture du composant

```
📁 contact-form/
  📁 app/
    📁 contact/
      📄 page.jsx            # Page de contact intégrant le formulaire
  📁 components/
    📁 contact/
      📄 ContactForm.jsx     # Composant principal du formulaire
      📄 SuccessMessage.jsx  # Message de succès (inclus dans ContactForm)
  📁 lib/
    📁 validation/
      📄 contact-schema.js   # Schéma de validation zod (inclus dans ContactForm)
```

## Flux de données

1. L'utilisateur remplit le formulaire
2. Les données sont validées en temps réel avec zod via react-hook-form
3. À la soumission, un état de chargement est affiché avec animation
4. En cas de succès, une animation de transition révèle le message de succès
5. Des notifications toast informent l'utilisateur des étapes du processus

## Dépendances requises

- Next.js 15.x
- React 19.x
- Tailwind CSS 3.4.x
- shadcn/ui (Form, Input, Button, etc.)
- react-hook-form
- @hookform/resolvers/zod
- zod
- framer-motion
- sonner
- lucide-react (icônes)

## Comment implémenter

1. Assurez-vous d'avoir shadcn/ui configuré dans votre projet
2. Installez les dépendances: `npm install react-hook-form @hookform/resolvers zod framer-motion sonner`
3. Copiez les composants dans les dossiers correspondants
4. Créez une page contact qui importe et utilise le composant ContactForm

## Personnalisation

Vous pouvez facilement personnaliser:

- Les règles de validation (en modifiant le schéma zod)
- Les champs du formulaire (en ajoutant ou supprimant des FormField)
- Les animations de transition (en modifiant les paramètres framer-motion)
- Le design et les couleurs via Tailwind
- Le comportement de soumission (en connectant à votre API réelle)
