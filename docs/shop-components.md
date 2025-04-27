# Documentation des Composants E-commerce

Cette documentation détaille les composants disponibles dans le module E-commerce, leur utilisation et leurs fonctionnalités.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [ProductCard](#productcard)
3. [ProductGrid](#productgrid)
4. [ProductFilters](#productfilters)
5. [ProductDetail](#productdetail)
6. [AddToCartButton](#addtocartbutton)
7. [CartIndicator](#cartindicator)
8. [ProductStockDisplay](#productstockdisplay)
9. [ProductReviews](#productreviews)
10. [ReviewForm](#reviewform)

## Vue d'ensemble

Les composants E-commerce offrent une solution complète pour créer une boutique en ligne avec des fonctionnalités avancées : affichage de produits, filtrage, gestion du panier, avis clients et autres fonctionnalités essentielles pour une expérience d'achat optimale.

## ProductCard

Le composant `ProductCard` affiche un produit dans une carte, idéal pour les grilles et listes de produits.

### Fonctionnalités

- Affichage de l'image principale du produit
- Gestion des badges (promotion, nouveau, stock limité)
- Affichage du prix avec gestion des promotions
- Quick view sur survol/appui
- Ajout rapide au panier
- Ajout aux favoris
- Support pour les variations de produits
- Gestion des stocks
- Animation au survol

### Utilisation

```jsx
import { ProductCard } from "@/components/shop/ProductCard";

// Utilisation de base
<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
/>

// Avec options avancées
<ProductCard
  product={product}
  showQuickView={true}
  enableFavorites={true}
  onQuickView={handleQuickView}
  onAddToCart={handleAddToCart}
  onAddToFavorites={handleAddToFavorites}
  size="medium"
  layout="vertical"
/>
```

### Props

| Prop               | Type                                           | Description                        |
| ------------------ | ---------------------------------------------- | ---------------------------------- |
| `product`          | `Product`                                      | Objet produit à afficher           |
| `onAddToCart`      | `(product: Product, quantity: number) => void` | Callback lors de l'ajout au panier |
| `showQuickView`    | `boolean`                                      | Afficher l'option de vue rapide    |
| `onQuickView`      | `(product: Product) => void`                   | Callback pour la vue rapide        |
| `enableFavorites`  | `boolean`                                      | Activer le bouton de favoris       |
| `onAddToFavorites` | `(product: Product) => void`                   | Callback pour l'ajout aux favoris  |
| `size`             | `"small" \| "medium" \| "large"`               | Taille de la carte                 |
| `layout`           | `"vertical" \| "horizontal"`                   | Orientation de la carte            |
| `className`        | `string`                                       | Classes CSS additionnelles         |

## ProductGrid

Le composant `ProductGrid` affiche une grille de produits avec options de tri, filtrage et pagination.

### Fonctionnalités

- Grille responsive adaptée à tous les écrans
- Options de tri (popularité, prix, nouveautés)
- Pagination intégrée
- Chargement paresseux des images
- Vue en grille ou liste
- Gestion du nombre de produits par page
- Animation de chargement
- Intégration avec les filtres

### Utilisation

```jsx
import { ProductGrid } from "@/components/shop/ProductGrid";

// Utilisation de base
<ProductGrid
  products={products}
  onProductClick={handleProductClick}
/>

// Avec options avancées
<ProductGrid
  products={products}
  onProductClick={handleProductClick}
  onAddToCart={handleAddToCart}
  sorting="price_asc"
  itemsPerPage={24}
  currentPage={1}
  onPageChange={handlePageChange}
  layout="grid"
  columns={{ sm: 2, md: 3, lg: 4 }}
  loading={isLoading}
/>
```

### Props

| Prop             | Type                                                      | Description                          |
| ---------------- | --------------------------------------------------------- | ------------------------------------ |
| `products`       | `Product[]`                                               | Liste des produits à afficher        |
| `onProductClick` | `(product: Product) => void`                              | Callback lors du clic sur un produit |
| `onAddToCart`    | `(product: Product, quantity: number) => void`            | Callback pour l'ajout au panier      |
| `sorting`        | `"popularity" \| "price_asc" \| "price_desc" \| "newest"` | Ordre de tri                         |
| `onSortChange`   | `(sorting: string) => void`                               | Callback lors du changement de tri   |
| `itemsPerPage`   | `number`                                                  | Nombre d'articles par page           |
| `currentPage`    | `number`                                                  | Page actuelle                        |
| `totalPages`     | `number`                                                  | Nombre total de pages                |
| `onPageChange`   | `(page: number) => void`                                  | Callback lors du changement de page  |
| `layout`         | `"grid" \| "list"`                                        | Mode d'affichage                     |
| `columns`        | `{ sm: number; md: number; lg: number }`                  | Configuration des colonnes           |
| `loading`        | `boolean`                                                 | État de chargement                   |

## ProductFilters

Le composant `ProductFilters` permet de filtrer les produits selon divers critères.

### Fonctionnalités

- Filtrage par catégorie
- Filtrage par prix (slider)
- Filtrage par attributs (couleur, taille, etc.)
- Filtrage par marque
- Filtrage par notation
- Recherche textuelle
- Filtres combinables
- Sauvegarde et restauration de filtres
- Réinitialisation des filtres
- Version mobile avec drawer

### Utilisation

```jsx
import { ProductFilters } from "@/components/shop/ProductFilters";

// Utilisation de base
<ProductFilters
  categories={categories}
  attributes={attributes}
  onFilterChange={handleFilterChange}
/>

// Configuration avancée
<ProductFilters
  categories={categories}
  attributes={attributes}
  brands={brands}
  priceRange={{ min: 0, max: 1000 }}
  activeFilters={currentFilters}
  onFilterChange={handleFilterChange}
  onFilterReset={handleFilterReset}
  expandedByDefault={['categories', 'price']}
  mobileMode={isMobile}
/>
```

### Props

| Prop                | Type                           | Description                             |
| ------------------- | ------------------------------ | --------------------------------------- |
| `categories`        | `Category[]`                   | Liste des catégories                    |
| `attributes`        | `Attribute[]`                  | Liste des attributs filtrants           |
| `brands`            | `Brand[]`                      | Liste des marques                       |
| `priceRange`        | `{ min: number; max: number }` | Plage de prix disponible                |
| `activeFilters`     | `Filters`                      | Filtres actuellement actifs             |
| `onFilterChange`    | `(filters: Filters) => void`   | Callback lors du changement de filtre   |
| `onFilterReset`     | `() => void`                   | Callback pour réinitialiser les filtres |
| `expandedByDefault` | `string[]`                     | Sections dépliées par défaut            |
| `mobileMode`        | `boolean`                      | Mode mobile (drawer)                    |
| `className`         | `string`                       | Classes CSS additionnelles              |

## ProductDetail

Le composant `ProductDetail` affiche la page détaillée d'un produit.

### Fonctionnalités

- Galerie d'images avec zoom et lightbox
- Sélection de variations (taille, couleur, etc.)
- Gestion des stocks en temps réel
- Avis clients
- Descriptions avec onglets
- Produits associés
- Partage sur réseaux sociaux
- Ajout au panier avec quantité
- Alerte de stock
- Informations de livraison

### Utilisation

```jsx
import { ProductDetail } from "@/components/shop/ProductDetail";

<ProductDetail
  product={product}
  relatedProducts={relatedProducts}
  onAddToCart={handleAddToCart}
  onVariationChange={handleVariationChange}
/>;
```

### Props

| Prop                | Type                                                                        | Description                                |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| `product`           | `Product`                                                                   | Objet produit à afficher                   |
| `relatedProducts`   | `Product[]`                                                                 | Produits associés                          |
| `reviews`           | `Review[]`                                                                  | Avis clients                               |
| `onAddToCart`       | `(product: Product, quantity: number, variation: ProductVariation) => void` | Callback pour l'ajout au panier            |
| `onVariationChange` | `(variation: ProductVariation) => void`                                     | Callback lors du changement de variation   |
| `onNotifyStock`     | `(email: string, productId: string) => void`                                | Callback pour notifier de la disponibilité |
| `onAddReview`       | `(review: ReviewInput) => void`                                             | Callback pour ajouter un avis              |
| `onShare`           | `(platform: string) => void`                                                | Callback pour le partage                   |
| `onProductClick`    | `(product: Product) => void`                                                | Callback pour les produits associés        |

## AddToCartButton

Le composant `AddToCartButton` est un bouton pour ajouter des produits au panier avec gestion de la quantité.

### Fonctionnalités

- Ajout simple au panier
- Sélecteur de quantité intégré
- Gestion des stocks
- Animations de confirmation
- États de chargement
- États de désactivation (produit indisponible)
- Personnalisation de l'apparence

### Utilisation

```jsx
import { AddToCartButton } from "@/components/shop/AddToCartButton";

// Utilisation de base
<AddToCartButton
  product={product}
  onAddToCart={handleAddToCart}
/>

// Avec options avancées
<AddToCartButton
  product={product}
  onAddToCart={handleAddToCart}
  showQuantity={true}
  initialQuantity={1}
  maxQuantity={10}
  size="large"
  variant="primary"
  fullWidth={true}
/>
```

### Props

| Prop              | Type                                           | Description                       |
| ----------------- | ---------------------------------------------- | --------------------------------- |
| `product`         | `Product`                                      | Produit à ajouter                 |
| `onAddToCart`     | `(product: Product, quantity: number) => void` | Callback pour l'ajout au panier   |
| `showQuantity`    | `boolean`                                      | Afficher le sélecteur de quantité |
| `initialQuantity` | `number`                                       | Quantité initiale                 |
| `maxQuantity`     | `number`                                       | Quantité maximale                 |
| `size`            | `"small" \| "medium" \| "large"`               | Taille du bouton                  |
| `variant`         | `"primary" \| "secondary" \| "outline"`        | Variante du bouton                |
| `fullWidth`       | `boolean`                                      | Occuper toute la largeur          |
| `loading`         | `boolean`                                      | État de chargement                |
| `className`       | `string`                                       | Classes CSS additionnelles        |

## CartIndicator

Le composant `CartIndicator` affiche un indicateur de panier dans la navigation.

### Fonctionnalités

- Affichage du nombre d'articles
- Affichage du total
- Mini-panier au survol/clic
- Actions rapides (voir panier, paiement)
- Animation lors de l'ajout d'articles
- Persistance du panier (localStorage)
- Mode responsive

### Utilisation

```jsx
import { CartIndicator } from "@/components/shop/CartIndicator";

<CartIndicator
  cart={cart}
  onViewCart={handleViewCart}
  onCheckout={handleCheckout}
/>;
```

### Props

| Prop               | Type                                         | Description                             |
| ------------------ | -------------------------------------------- | --------------------------------------- |
| `cart`             | `Cart`                                       | Objet panier                            |
| `onViewCart`       | `() => void`                                 | Callback pour voir le panier            |
| `onCheckout`       | `() => void`                                 | Callback pour aller au paiement         |
| `onRemoveItem`     | `(itemId: string) => void`                   | Callback pour retirer un article        |
| `onUpdateQuantity` | `(itemId: string, quantity: number) => void` | Callback pour mettre à jour la quantité |
| `showTotal`        | `boolean`                                    | Afficher le montant total               |
| `mobileBreakpoint` | `number`                                     | Seuil pour le mode mobile               |
| `className`        | `string`                                     | Classes CSS additionnelles              |

## ProductStockDisplay

Le composant `ProductStockDisplay` affiche l'état du stock d'un produit.

### Fonctionnalités

- Indication de disponibilité
- Affichage de la quantité en stock
- Alerte de stock faible
- Options de notification
- État de réapprovisionnement
- Délai de livraison estimé
- Personnalisation de l'apparence

### Utilisation

```jsx
import { ProductStockDisplay } from "@/components/shop/ProductStockDisplay";

<ProductStockDisplay
  stock={product.stock}
  status={product.stockStatus}
  lowStockThreshold={5}
/>;
```

### Props

| Prop                | Type                                             | Description                         |
| ------------------- | ------------------------------------------------ | ----------------------------------- |
| `stock`             | `number`                                         | Quantité en stock                   |
| `status`            | `"in_stock" \| "out_of_stock" \| "on_backorder"` | Statut du stock                     |
| `lowStockThreshold` | `number`                                         | Seuil de stock faible               |
| `showExactStock`    | `boolean`                                        | Afficher la quantité exacte         |
| `showStockBar`      | `boolean`                                        | Afficher une barre de progression   |
| `restock`           | `{ date: string; quantity: number }`             | Informations de réapprovisionnement |
| `onNotify`          | `() => void`                                     | Callback pour la notification       |
| `showNotifyOption`  | `boolean`                                        | Afficher l'option de notification   |
| `className`         | `string`                                         | Classes CSS additionnelles          |

## ProductReviews

Le composant `ProductReviews` affiche et gère les avis clients pour un produit.

### Fonctionnalités

- Affichage des avis avec pagination
- Synthèse des notes (étoiles)
- Filtrage par note
- Tri par pertinence/date
- Votes utile/inutile
- Photos des clients
- Réponses aux avis
- Signalement d'avis inappropriés
- Statistiques des avis

### Utilisation

```jsx
import { ProductReviews } from "@/components/shop/ProductReviews";

<ProductReviews
  productId={product.id}
  reviews={reviews}
  averageRating={4.5}
  ratingCount={25}
  onAddReview={handleAddReview}
/>;
```

### Props

| Prop             | Type                                               | Description                    |
| ---------------- | -------------------------------------------------- | ------------------------------ |
| `productId`      | `string`                                           | ID du produit                  |
| `reviews`        | `Review[]`                                         | Liste des avis                 |
| `averageRating`  | `number`                                           | Note moyenne                   |
| `ratingCount`    | `number`                                           | Nombre total d'avis            |
| `onAddReview`    | `(review: ReviewInput) => void`                    | Callback pour ajouter un avis  |
| `onVoteReview`   | `(reviewId: string, vote: "up" \| "down") => void` | Callback pour voter            |
| `onReportReview` | `(reviewId: string, reason: string) => void`       | Callback pour signaler         |
| `onFilterChange` | `(filter: ReviewFilter) => void`                   | Callback pour le filtrage      |
| `showAddReview`  | `boolean`                                          | Afficher le formulaire d'ajout |
| `reviewsPerPage` | `number`                                           | Nombre d'avis par page         |
| `currentPage`    | `number`                                           | Page actuelle                  |
| `onPageChange`   | `(page: number) => void`                           | Callback pour la pagination    |
| `className`      | `string`                                           | Classes CSS additionnelles     |

## ReviewForm

Le composant `ReviewForm` permet aux utilisateurs de soumettre des avis sur les produits.

### Fonctionnalités

- Notation par étoiles
- Champs de titre et commentaire
- Upload de photos
- Validation des champs
- Possibilité de modifier un avis existant
- Recommandation du produit (oui/non)
- Caractéristiques du produit évaluables
- Vérification d'achat

### Utilisation

```jsx
import { ReviewForm } from "@/components/shop/ReviewForm";

<ReviewForm
  productId={product.id}
  onSubmit={handleReviewSubmit}
  productName={product.name}
/>;
```

### Props

| Prop               | Type                            | Description                 |
| ------------------ | ------------------------------- | --------------------------- |
| `productId`        | `string`                        | ID du produit               |
| `productName`      | `string`                        | Nom du produit              |
| `onSubmit`         | `(review: ReviewInput) => void` | Callback à la soumission    |
| `initialReview`    | `ReviewInput`                   | Avis initial (modification) |
| `characteristics`  | `ProductCharacteristic[]`       | Caractéristiques évaluables |
| `maxPhotos`        | `number`                        | Nombre maximum de photos    |
| `loading`          | `boolean`                       | État de chargement          |
| `error`            | `string`                        | Message d'erreur            |
| `success`          | `string`                        | Message de succès           |
| `requiresPurchase` | `boolean`                       | Exiger un achat vérifié     |
| `className`        | `string`                        | Classes CSS additionnelles  |
