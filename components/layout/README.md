# Composant de Navigation Responsive

## Prompt utilisé pour générer ce composant

```
Crée un composant de navigation responsive moderne pour Next.js 15.x avec les spécifications suivantes:
1) Support de desktop (NavigationMenu) et mobile (Sheet) avec détection automatique
2) Changement d'apparence au scroll (transparent vers opaque avec backdrop blur)
3) Sous-menus pour les éléments de navigation complexes
4) Support du thème clair/sombre avec toggle accessible
5) Intégration d'un menu utilisateur avec avatar et dropdown
6) Support pour utilisateurs connectés/déconnectés
7) Mise en évidence de l'élément actif basée sur le chemin actuel
8) Animations subtiles avec framer-motion pour améliorer l'UX
9) UI Tailwind CSS utilisant les composants shadcn/UI (NavigationMenu, Sheet, DropdownMenu)

Le composant doit être modulaire, optimisé pour les performances et suivre les meilleures pratiques d'accessibilité.
```

## Architecture du composant

```
📁 navigation/
  📁 components/
    📁 layout/
      📄 MainNavigation.jsx  # Composant principal de navigation
      📄 MobileMenu.jsx      # Menu mobile (inclus dans MainNavigation)
      📄 UserMenu.jsx        # Menu utilisateur (inclus dans MainNavigation)
      📄 ThemeToggle.jsx     # Toggle de thème (inclus dans MainNavigation)
  📁 lib/
    📁 utils/
      📄 navigation-utils.js # Utilitaires pour la navigation (liens actifs, etc.)
  📁 hooks/
    📄 useScrollPosition.js  # Hook pour détecter la position de scroll
```

## Flux de données

1. Le composant détecte la taille d'écran pour afficher la version desktop ou mobile
2. La position de scroll est suivie pour modifier l'apparence de la barre de navigation
3. Le chemin actuel est détecté pour mettre en évidence l'élément de navigation correspondant
4. L'état de l'utilisateur (connecté/déconnecté) détermine l'affichage du menu utilisateur
5. Le thème clair/sombre est géré via next-themes

## Dépendances requises

- Next.js 15.x
- React 19.x
- Tailwind CSS 3.4.x
- shadcn/ui (NavigationMenu, Sheet, DropdownMenu, etc.)
- next-themes
- framer-motion (optionnel, pour les animations améliorées)
- lucide-react (pour les icônes)

## Comment implémenter

1. Assurez-vous d'avoir shadcn/ui configuré dans votre projet
2. Installez next-themes: `npm install next-themes`
3. Copiez les composants dans les dossiers correspondants
4. Importez et utilisez MainNavigation dans votre layout racine

## Personnalisation

Vous pouvez facilement personnaliser:

- Les éléments de navigation (en modifiant le tableau navItems)
- L'apparence et le comportement au scroll
- Les styles et couleurs via Tailwind
- Les sous-menus et leur contenu
- Le comportement du menu utilisateur
