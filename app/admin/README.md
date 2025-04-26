# Dashboard Admin avec Analyse des Données

## Prompt utilisé pour générer ce composant

```
Crée un dashboard admin Next.js pour un système de réservation avec les spécifications suivantes:
1) Affichage de métriques clés: nombre total de réservations, revenus, taux de conversion et durée moyenne des rendez-vous
2) Visualisations de données avec Recharts: graphique à barres pour les réservations quotidiennes et diagramme circulaire pour la distribution par type de rendez-vous
3) Filtre de période (semaine/mois/personnalisé) avec sélecteur de date shadcn/UI
4) Support du thème clair/sombre via next-themes avec adaptation des couleurs des graphiques
5) Notifications avec Sonner pour les actions utilisateur (ex: export de données)
6) UI responsive avec Tailwind CSS et composants shadcn/UI

Le dashboard doit être optimisé pour les performances et utiliser le mode client de Next.js App Router.
```

## Architecture du composant

```
📁 admin-dashboard/
  📁 app/
    📁 admin/
      📁 dashboard/
        📄 page.jsx          # Page principale du dashboard
  📁 components/
    📁 admin/
      📁 dashboard/
        📄 StatCards.jsx     # Composant de cartes statistiques (inclus dans page.jsx)
        📄 BookingChart.jsx  # Graphique des réservations (inclus dans page.jsx)
        📄 TypeDistribution.jsx # Distribution par type (inclus dans page.jsx)
```

## Flux de données

1. Les données simulées sont définies dans le composant principal
2. L'utilisateur peut filtrer les données par période (semaine/mois/personnalisé)
3. Les métriques clés sont recalculées en fonction du filtre sélectionné
4. Les graphiques sont mis à jour dynamiquement
5. Les couleurs des graphiques s'adaptent au thème clair/sombre actif

## Dépendances requises

- Next.js 15.x
- React 19.x
- Tailwind CSS 3.4.x
- shadcn/ui (Select, Card, Button, etc.)
- recharts (pour les visualisations)
- date-fns
- next-themes
- Sonner (pour les notifications)
- lucide-react (pour les icônes)

## Comment implémenter

1. Assurez-vous d'avoir shadcn/ui configuré dans votre projet
2. Installez recharts: `npm install recharts`
3. Installez next-themes pour le support du thème: `npm install next-themes`
4. Copiez les composants dans les dossiers correspondants
5. Importez la page dans votre application

## Personnalisation

Vous pouvez facilement personnaliser:

- Les métriques affichées et leur calcul
- Les types de graphiques et leur présentation
- Les périodes de filtre disponibles
- Le design et les couleurs via Tailwind
- Les données affichées (en les connectant à votre API réelle)
