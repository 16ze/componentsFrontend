# Documentation des Composants Mobiles

Cette documentation détaille les composants optimisés pour les applications mobiles, leur utilisation et leur intégration.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Responsive](#responsive)
3. [Offline](#offline)
4. [Navigation](#navigation)
5. [Interaction](#interaction)
6. [Native](#native)
7. [Types](#types)

## Vue d'ensemble

Les composants mobiles offrent des solutions optimisées pour les interfaces tactiles, la gestion des contraintes d'écran, le support hors ligne et l'adaptation à différentes tailles d'écrans. Ils sont compatibles avec les applications React Native et les applications web mobiles.

## Responsive

Les composants responsives s'adaptent automatiquement aux différentes tailles d'écran et orientations.

### ResponsiveContainer

Le composant `ResponsiveContainer` est un conteneur intelligent qui s'adapte automatiquement à la taille et l'orientation de l'écran. Il fournit des utilitaires de mise à l'échelle et d'adaptation.

#### Fonctionnalités

- Détection automatique du type d'appareil (téléphone, tablette, desktop)
- Adaptation à l'orientation (portrait, paysage)
- Mise à l'échelle intelligente des éléments
- Support pour les marges de sécurité (notch, barre système)
- Styles conditionnels basés sur le type d'appareil et l'orientation

#### Utilisation

```tsx
import { ResponsiveContainer } from "@/components/mobile/responsive/ResponsiveContainer";

// Utilisation de base
<ResponsiveContainer>
  <YourContent />
</ResponsiveContainer>

// Avec styles conditionnels
<ResponsiveContainer
  phoneStyle={{ padding: 16 }}
  tabletStyle={{ padding: 24 }}
  portraitStyle={{ flexDirection: 'column' }}
  landscapeStyle={{ flexDirection: 'row' }}
>
  <YourContent />
</ResponsiveContainer>

// Utilisation des informations responsives
<ResponsiveContainer>
  {(responsive) => (
    <View>
      <Text style={{ fontSize: responsive.scaleFont(16) }}>
        Texte mis à l'échelle
      </Text>
      <View style={{
        width: responsive.horizontalScale(100),
        height: responsive.verticalScale(50)
      }} />
      {responsive.isTablet && <TabletOnlyComponent />}
    </View>
  )}
</ResponsiveContainer>
```

#### Props

| Prop                 | Type                                                                   | Description                               |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| `children`           | `React.ReactNode \| ((info: ResponsiveInfo) => React.ReactNode)`       | Contenu du conteneur                      |
| `style`              | `ViewStyle`                                                            | Style de base                             |
| `phoneStyle`         | `ViewStyle`                                                            | Style appliqué sur téléphone              |
| `tabletStyle`        | `ViewStyle`                                                            | Style appliqué sur tablette               |
| `desktopStyle`       | `ViewStyle`                                                            | Style appliqué sur desktop                |
| `portraitStyle`      | `ViewStyle`                                                            | Style appliqué en mode portrait           |
| `landscapeStyle`     | `ViewStyle`                                                            | Style appliqué en mode paysage            |
| `config`             | `ResponsiveConfig`                                                     | Configuration avancée                     |
| `onDimensionsChange` | `(info: ResponsiveInfo) => void`                                       | Callback lors du changement de dimensions |
| `minHeight`          | `number`                                                               | Hauteur minimale                          |
| `safeArea`           | `{ top?: boolean; bottom?: boolean; left?: boolean; right?: boolean }` | Configuration des zones sécurisées        |

#### Hooks et HOC

```tsx
// Hook
import { useResponsive } from "@/components/mobile/responsive/ResponsiveContainer";

function MyComponent() {
  const responsive = useResponsive();

  return (
    <View style={{ padding: responsive.isPhone ? 16 : 24 }}>
      <Text style={{ fontSize: responsive.scaleFont(16) }}>
        Texte adaptatif
      </Text>
    </View>
  );
}

// HOC
import { withResponsive } from "@/components/mobile/responsive/ResponsiveContainer";

function MyComponent({ responsive, ...props }) {
  return (
    <View style={{ padding: responsive.isPhone ? 16 : 24 }}>
      <Text style={{ fontSize: responsive.scaleFont(16) }}>
        Texte adaptatif
      </Text>
    </View>
  );
}

export default withResponsive(MyComponent);
```

### ResponsiveGrid

Un système de grille responsive adapté aux interfaces mobiles.

#### Fonctionnalités

- Disposition en grille avec nombre de colonnes adaptatif
- Gestion automatique des espacements
- Adaptation à l'orientation
- Support pour les éléments de taille variable

#### Utilisation

```tsx
import { ResponsiveGrid } from "@/components/mobile/responsive/ResponsiveGrid";

<ResponsiveGrid
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  columns={{ phone: 2, tablet: 3, desktop: 4 }}
  spacing={10}
/>;
```

#### Props

| Prop          | Type                                                              | Description                          |
| ------------- | ----------------------------------------------------------------- | ------------------------------------ |
| `data`        | `any[]`                                                           | Données à afficher dans la grille    |
| `renderItem`  | `({ item, index, width }) => React.ReactNode`                     | Fonction de rendu d'un élément       |
| `columns`     | `number \| { phone?: number; tablet?: number; desktop?: number }` | Configuration des colonnes           |
| `spacing`     | `number \| { horizontal?: number; vertical?: number }`            | Espacement entre les éléments        |
| `onItemPress` | `(item: any, index: number) => void`                              | Callback lors du clic sur un élément |

## Offline

Les composants Offline permettent de gérer l'état de connexion et le fonctionnement hors ligne.

### OfflineIndicator

Indicateur d'état de connexion réseau avec gestion des notifications.

#### Fonctionnalités

- Détection automatique de l'état de connexion
- Indicateur visuel de l'état de connexion
- Personnalisation de l'apparence
- Animations de transition

#### Utilisation

```tsx
import { OfflineIndicator } from "@/components/mobile/offline/OfflineIndicator";

<OfflineIndicator message="Vous êtes hors ligne" position="top" />;
```

#### Props

| Prop              | Type                | Description                           |
| ----------------- | ------------------- | ------------------------------------- |
| `message`         | `string`            | Message à afficher en mode hors ligne |
| `position`        | `"top" \| "bottom"` | Position de l'indicateur              |
| `style`           | `ViewStyle`         | Style personnalisé                    |
| `textStyle`       | `TextStyle`         | Style du texte                        |
| `showOfflineOnly` | `boolean`           | N'afficher que quand hors ligne       |
| `onConnect`       | `() => void`        | Callback lors de la reconnexion       |
| `onDisconnect`    | `() => void`        | Callback lors de la déconnexion       |

### OfflineQueue

Gestion des actions en file d'attente lors de l'utilisation hors ligne.

#### Fonctionnalités

- Mise en file d'attente des actions hors ligne
- Synchronisation automatique lors de la reconnexion
- Gestion des conflits
- Indicateur de progression
- Persistance des actions

#### Utilisation

```tsx
import { OfflineQueue } from "@/components/mobile/offline/OfflineQueue";
import { useMutation } from "@tanstack/react-query";

function MyComponent() {
  const { mutate } = useMutation({
    mutationFn: updateData,
  });

  return (
    <OfflineQueue>
      {({ enqueue, isOnline, pendingCount }) => (
        <>
          {pendingCount > 0 && <Text>Actions en attente: {pendingCount}</Text>}

          <Button
            title="Enregistrer"
            onPress={() => {
              const action = {
                type: "UPDATE_DATA",
                payload: { id: 123, data: newData },
              };

              if (isOnline) {
                mutate(action.payload);
              } else {
                enqueue(action);
              }
            }}
          />
        </>
      )}
    </OfflineQueue>
  );
}
```

#### Props

| Prop           | Type                                                                    | Description                                   |
| -------------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| `children`     | `(queueProps: OfflineQueueProps) => React.ReactNode`                    | Render prop avec l'état de la file            |
| `onSync`       | `(actions: QueuedAction[]) => Promise<void>`                            | Callback de synchronisation                   |
| `onConflict`   | `(action: QueuedAction, error: Error) => Promise<QueuedAction \| null>` | Gestion des conflits                          |
| `persist`      | `boolean`                                                               | Persistance des actions entre sessions        |
| `throttleSync` | `number`                                                                | Délai entre les tentatives de synchronisation |

## Navigation

Composants de navigation optimisés pour les interfaces mobiles.

### TabBar

Barre d'onglets mobile avec support pour les animations et gestures.

#### Fonctionnalités

- Design adapté aux interfaces tactiles
- Indicateurs de notification
- Support pour les icônes
- Animation de transition
- Positionnement en bas ou en haut
- Gestion du "safe area"

#### Utilisation

```tsx
import { TabBar, Tab } from "@/components/mobile/navigation/TabBar";

<TabBar>
  <Tab
    icon="home"
    label="Accueil"
    badge={2}
    onPress={() => navigate("Home")}
    isActive={currentRoute === "Home"}
  />
  <Tab
    icon="search"
    label="Recherche"
    onPress={() => navigate("Search")}
    isActive={currentRoute === "Search"}
  />
</TabBar>;
```

#### Props

| Prop          | Type                            | Description                                       |
| ------------- | ------------------------------- | ------------------------------------------------- |
| `position`    | `"bottom" \| "top"`             | Position de la barre                              |
| `showLabels`  | `boolean`                       | Afficher les libellés des onglets                 |
| `adaptive`    | `boolean`                       | Adapter la taille en fonction du nombre d'onglets |
| `theme`       | `"light" \| "dark" \| "system"` | Thème de la barre                                 |
| `translucent` | `boolean`                       | Effet de translucidité                            |
| `safeArea`    | `boolean`                       | Respecter les zones de sécurité                   |

### SwipeableScreen

Écran avec support des gestures de swipe pour la navigation.

#### Fonctionnalités

- Navigation par gesture de swipe
- Animations fluides
- Support du retour par gesture
- Options de personnalisation
- Indicateurs visuels pour les actions disponibles

#### Utilisation

```tsx
import { SwipeableScreen } from "@/components/mobile/navigation/SwipeableScreen";

<SwipeableScreen
  onSwipeLeft={() => navigateToNext()}
  onSwipeRight={() => navigateToPrevious()}
  swipeThreshold={0.3}
>
  <YourScreenContent />
</SwipeableScreen>;
```

#### Props

| Prop              | Type         | Description                           |
| ----------------- | ------------ | ------------------------------------- |
| `onSwipeLeft`     | `() => void` | Action lors d'un swipe vers la gauche |
| `onSwipeRight`    | `() => void` | Action lors d'un swipe vers la droite |
| `canSwipeLeft`    | `boolean`    | Autoriser le swipe vers la gauche     |
| `canSwipeRight`   | `boolean`    | Autoriser le swipe vers la droite     |
| `swipeThreshold`  | `number`     | Seuil de déclenchement (0-1)          |
| `showIndicators`  | `boolean`    | Afficher des indicateurs visuels      |
| `animationConfig` | `object`     | Configuration des animations          |

## Interaction

Composants optimisés pour les interactions tactiles.

### TouchableScale

Composant tactile avec effet d'échelle lors du toucher.

#### Fonctionnalités

- Feedback tactile avec animation d'échelle
- Configurations de l'animation
- Support pour le retour haptique
- Gestion des pressions longues

#### Utilisation

```tsx
import { TouchableScale } from "@/components/mobile/interaction/TouchableScale";

<TouchableScale onPress={handlePress} scaleTo={0.95} activeOpacity={0.7}>
  <Text>Appuyez ici</Text>
</TouchableScale>;
```

#### Props

| Prop            | Type                                        | Description                           |
| --------------- | ------------------------------------------- | ------------------------------------- |
| `onPress`       | `() => void`                                | Action lors de la pression            |
| `scaleTo`       | `number`                                    | Facteur d'échelle lors de la pression |
| `duration`      | `number`                                    | Durée de l'animation en ms            |
| `activeOpacity` | `number`                                    | Opacité lors de la pression           |
| `haptic`        | `boolean \| "light" \| "medium" \| "heavy"` | Retour haptique                       |
| `disabled`      | `boolean`                                   | Désactiver l'interaction              |

### GestureCard

Carte avec support de gestures avancés (swipe, rotation, pinch).

#### Fonctionnalités

- Support multi-gestures
- Actions personnalisables
- Animations fluides
- Limites configurables
- Retour à la position initiale

#### Utilisation

```tsx
import { GestureCard } from "@/components/mobile/interaction/GestureCard";

<GestureCard
  onSwipeLeft={handleSwipeLeft}
  onSwipeRight={handleSwipeRight}
  swipeThreshold={0.4}
  enableRotation
>
  <CardContent />
</GestureCard>;
```

#### Props

| Prop                   | Type                            | Description                           |
| ---------------------- | ------------------------------- | ------------------------------------- |
| `onSwipeLeft`          | `() => void`                    | Action lors d'un swipe vers la gauche |
| `onSwipeRight`         | `() => void`                    | Action lors d'un swipe vers la droite |
| `swipeThreshold`       | `number`                        | Seuil de déclenchement du swipe       |
| `enableRotation`       | `boolean`                       | Activer la rotation                   |
| `enableScale`          | `boolean`                       | Activer le zoom (pinch)               |
| `maxRotation`          | `number`                        | Rotation maximale en degrés           |
| `maxScale`             | `number`                        | Échelle maximale                      |
| `springConfig`         | `object`                        | Configuration des animations          |
| `onGestureStateChange` | `(state: GestureState) => void` | Callback de changement d'état         |

## Native

Composants pour l'intégration avec les fonctionnalités natives.

### CameraView

Interface pour l'utilisation de la caméra du dispositif.

#### Fonctionnalités

- Accès à la caméra avant/arrière
- Contrôle du flash
- Zoom et focus
- Capture de photos et vidéos
- Overlay personnalisable
- Scan de code-barres/QR

#### Utilisation

```tsx
import { CameraView } from "@/components/mobile/native/CameraView";

<CameraView
  cameraType="back"
  onCapture={handleCapture}
  enableScanning
  onScan={handleScan}
/>;
```

#### Props

| Prop                   | Type                           | Description                      |
| ---------------------- | ------------------------------ | -------------------------------- |
| `cameraType`           | `"front" \| "back"`            | Type de caméra à utiliser        |
| `flashMode`            | `"auto" \| "on" \| "off"`      | Mode du flash                    |
| `zoom`                 | `number`                       | Niveau de zoom (0-1)             |
| `enableScanning`       | `boolean`                      | Activer le scan de codes         |
| `scanFrequency`        | `number`                       | Fréquence de scan en ms          |
| `onCapture`            | `(data: CaptureData) => void`  | Callback de capture              |
| `onScan`               | `(scanData: ScanData) => void` | Callback de scan                 |
| `cameraPermissionText` | `string`                       | Texte pour demande de permission |

### LocationPicker

Sélecteur de localisation avec carte interactive.

#### Fonctionnalités

- Carte interactive
- Géolocalisation de l'utilisateur
- Recherche d'adresses
- Sélection par appui long
- Conversion coordonnées/adresse
- Support du mode hors ligne

#### Utilisation

```tsx
import { LocationPicker } from "@/components/mobile/native/LocationPicker";

<LocationPicker
  initialRegion={userRegion}
  onLocationSelect={handleLocationSelect}
  showsUserLocation
/>;
```

#### Props

| Prop                     | Type                                    | Description                           |
| ------------------------ | --------------------------------------- | ------------------------------------- |
| `initialRegion`          | `Region`                                | Région initiale à afficher            |
| `onLocationSelect`       | `(location: Location) => void`          | Callback de sélection                 |
| `showsUserLocation`      | `boolean`                               | Afficher la position de l'utilisateur |
| `searchPlaceholder`      | `string`                                | Placeholder pour la recherche         |
| `offlineMode`            | `boolean`                               | Mode hors ligne                       |
| `mapType`                | `"standard" \| "satellite" \| "hybrid"` | Type de carte                         |
| `locationPermissionText` | `string`                                | Texte pour demande de permission      |

## Types

Types TypeScript et utilitaires pour les composants mobiles.

### Responsive Types

```tsx
// Types pour les composants responsifs
export type DeviceType = "phone" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";

export interface BreakpointConfig {
  phone: number;
  tablet: number;
  desktop: number;
}

export interface ResponsiveInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  scale: number;
  fontScale: number;
  breakpoints: BreakpointConfig;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  horizontalScale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  scaleFont: (size: number) => number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  devicePixelRatio: number;
}
```

### Offline Types

```tsx
// Types pour les composants hors ligne
export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineQueueProps {
  enqueue: (
    action: Omit<QueuedAction, "id" | "timestamp" | "retryCount">
  ) => void;
  dequeue: (id: string) => void;
  isOnline: boolean;
  pendingCount: number;
  queuedActions: QueuedAction[];
  sync: () => Promise<void>;
  clearQueue: () => void;
}
```

### Gesture Types

```tsx
// Types pour les composants de gesture
export interface GestureState {
  translationX: number;
  translationY: number;
  scale: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  state: "BEGAN" | "ACTIVE" | "CANCELLED" | "END" | "FAILED";
}

export interface SwipeDirection {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}
```
