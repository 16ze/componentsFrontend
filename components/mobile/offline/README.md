# Gestion du mode hors ligne (Offline)

Ce module fournit des composants et des hooks pour gérer le fonctionnement de l'application en mode hors ligne.

## Installation

Pour utiliser ce module, vous devez installer les dépendances suivantes :

```bash
npm install @react-native-community/netinfo react-native-async-storage
```

## Composants et hooks disponibles

### `OfflineManagerProvider`

Un provider React qui encapsule votre application et gère le statut de connexion, la synchronisation des données et la file d'attente des actions.

```tsx
import { OfflineManagerProvider } from "./components/mobile/offline/OfflineManager";

const App = () => (
  <OfflineManagerProvider
    pingEndpoint="https://api.example.com/ping"
    onlineDetectionInterval={30000}
    syncInterval={60000}
    autoSync={true}
  >
    <YourApp />
  </OfflineManagerProvider>
);
```

**Props :**

- `pingEndpoint` : URL utilisée pour vérifier la connexion Internet
- `onlineDetectionInterval` : Intervalle de vérification de la connexion (en ms)
- `syncInterval` : Intervalle de synchronisation automatique (en ms)
- `autoSync` : Activer/désactiver la synchronisation automatique
- `onConnectionChange` : Callback appelé lorsque le statut de connexion change
- `fallbackUI` : UI à afficher lorsque l'application est complètement hors ligne

### `useOffline` Hook

Hook React qui donne accès aux fonctionnalités de gestion du mode hors ligne.

```tsx
import { useOffline } from "./components/mobile/offline/OfflineManager";

const MyComponent = () => {
  const {
    isOnline,
    connectionStatus,
    connectionType,
    queueAction,
    syncData,
    syncStatus,
    clearQueue,
  } = useOffline();

  // ...
};
```

**Valeurs retournées :**

- `isOnline` : Booléen indiquant si l'appareil est connecté à Internet
- `connectionStatus` : Status détaillé de la connexion ('online', 'offline', 'limited')
- `connectionType` : Type de connexion ('wifi', 'cellular', 'none', 'unknown')
- `queueAction` : Fonction pour ajouter une action à la file d'attente
- `removeQueuedAction` : Fonction pour supprimer une action de la file d'attente
- `syncData` : Fonction pour synchroniser manuellement les données
- `syncStatus` : Objet contenant le statut de synchronisation
- `clearQueue` : Fonction pour vider la file d'attente des actions

### `withOfflineSupport` HOC

HOC (Higher-Order Component) qui ajoute la gestion du mode hors ligne à n'importe quel composant.

```tsx
import { withOfflineSupport } from './components/mobile/offline/OfflineManager';

const MyOnlineComponent = () => (
  // Composant qui nécessite une connexion Internet
);

const MyOfflineAwareComponent = withOfflineSupport(MyOnlineComponent, {
  requiredConnectionStatus: ['online'],
  loadFromCache: true,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 heures
  fallback: <Text>Ce contenu n'est pas disponible hors ligne</Text>
});
```

**Options :**

- `requiredConnectionStatus` : Statuts de connexion requis pour afficher le composant
- `loadFromCache` : Autoriser le chargement depuis le cache en mode hors ligne
- `cacheDuration` : Durée de validité du cache (en ms)
- `fallback` : Composant à afficher si le composant principal ne peut pas être affiché

### `OfflineBanner`

Bannière qui s'affiche lorsque l'utilisateur est hors ligne.

```tsx
import { OfflineBanner } from "./components/mobile/offline/OfflineManager";

const MyScreen = () => (
  <View>
    <OfflineBanner
      message="Vous êtes actuellement hors ligne"
      style={{ backgroundColor: "#f8d7da" }}
    />
    {/* Contenu de l'écran */}
  </View>
);
```

## Exemple d'utilisation

Voir le fichier `OfflineExample.tsx` pour un exemple complet d'utilisation de tous ces composants.

## Gestion des actions hors ligne

Pour mettre en file d'attente des actions à exécuter lorsque la connexion sera rétablie :

```tsx
const { queueAction, isOnline, syncData } = useOffline();

const handleSubmit = () => {
  const action = {
    type: "SUBMIT_FORM",
    payload: {
      /* ... données du formulaire ... */
    },
    endpoint: "https://api.example.com/forms",
    method: "POST",
    priority: 1,
  };

  const actionId = queueAction(action);
  console.log(`Action mise en file d'attente avec ID: ${actionId}`);

  if (isOnline) {
    // Si l'utilisateur est en ligne, tenter une synchronisation immédiate
    syncData();
  }
};
```

## Intégration avec les systèmes de cache

Ce module peut être facilement intégré avec des systèmes de cache comme AsyncStorage ou des solutions plus avancées comme redux-persist ou react-query :

```tsx
// Exemple avec React Query
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { useOffline } from "./components/mobile/offline/OfflineManager";

const queryClient = new QueryClient();

const OfflineAwareApp = () => (
  <OfflineManagerProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </OfflineManagerProvider>
);

// Dans un composant
const MyDataComponent = () => {
  const { isOnline } = useOffline();

  const { data } = useQuery("myData", fetchData, {
    // Désactiver les requêtes automatiques lorsque l'utilisateur est hors ligne
    enabled: isOnline,
    // Garder les données en cache plus longtemps en mode hors ligne
    staleTime: isOnline ? 60000 : 24 * 60 * 60 * 1000,
  });

  // ...
};
```

## Bonnes pratiques

1. **Minimiser les requêtes réseau** : Utilisez le hook `isOnline` pour éviter d'effectuer des requêtes réseau lorsque l'utilisateur est hors ligne.

2. **Mettre en cache les données critiques** : Utilisez `loadFromCache` avec le HOC `withOfflineSupport` pour les composants qui doivent rester fonctionnels hors ligne.

3. **Informer l'utilisateur** : Utilisez `OfflineBanner` pour informer l'utilisateur de son statut de connexion et des fonctionnalités limitées.

4. **File d'attente des actions** : Utilisez `queueAction` pour mettre en file d'attente les actions de l'utilisateur lorsqu'il est hors ligne.

5. **Synchronisation manuelle** : Proposez une option de synchronisation manuelle via `syncData` pour permettre à l'utilisateur de forcer la synchronisation lorsqu'il retrouve une connexion.
