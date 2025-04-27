import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  NetInfo,
  AppState,
  AppStateStatus,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types pour l'état de connexion
export type ConnectionStatus = "online" | "offline" | "limited";
export type ConnectionType = "wifi" | "cellular" | "unknown" | "none";

// Interface pour le contexte
interface OfflineContextType {
  isOnline: boolean;
  isOffline: boolean;
  connectionStatus: ConnectionStatus;
  connectionType: ConnectionType;
  lastOnlineTimestamp: number | null;
  syncStatus: {
    pendingActions: number;
    lastSyncTimestamp: number | null;
    isSyncing: boolean;
  };
  syncData: () => Promise<boolean>;
  queueAction: (action: QueuedAction) => string;
  removeQueuedAction: (id: string) => boolean;
  clearActionQueue: () => void;
}

// Type pour une action en file d'attente
export interface QueuedAction {
  id?: string;
  type: string;
  payload: any;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  priority?: number;
  createdAt?: number;
  retryCount?: number;
  maxRetries?: number;
  requiresConnection?: ConnectionType[];
}

// Props pour le provider
interface OfflineManagerProviderProps {
  children: ReactNode;
  onlineDetectionInterval?: number;
  pingEndpoint?: string;
  syncInterval?: number;
  autoSync?: boolean;
  maxStorageSize?: number;
  persistOptions?: {
    enabled: boolean;
    key?: string;
  };
  onSyncStart?: () => void;
  onSyncComplete?: (success: boolean, results: any) => void;
  onConnectionChange?: (status: ConnectionStatus, type: ConnectionType) => void;
  customConnectionChecker?: () => Promise<boolean>;
  fallbackUI?: React.ReactNode;
}

// Valeurs par défaut
const defaultContext: OfflineContextType = {
  isOnline: true,
  isOffline: false,
  connectionStatus: "online",
  connectionType: "unknown",
  lastOnlineTimestamp: null,
  syncStatus: {
    pendingActions: 0,
    lastSyncTimestamp: null,
    isSyncing: false,
  },
  syncData: async () => false,
  queueAction: () => "",
  removeQueuedAction: () => false,
  clearActionQueue: () => {},
};

// Créer le contexte avec les valeurs par défaut
const OfflineContext = createContext<OfflineContextType>(defaultContext);

// Hook personnalisé pour utiliser le contexte
export const useOffline = () => useContext(OfflineContext);

// Composant Provider principal
export const OfflineManagerProvider: React.FC<OfflineManagerProviderProps> = ({
  children,
  onlineDetectionInterval = 30000, // 30 secondes par défaut
  pingEndpoint = "https://www.google.com",
  syncInterval = 60000, // 1 minute par défaut
  autoSync = true,
  maxStorageSize = 10 * 1024 * 1024, // 10MB par défaut
  persistOptions = {
    enabled: true,
    key: "offline_data",
  },
  onSyncStart,
  onSyncComplete,
  onConnectionChange,
  customConnectionChecker,
  fallbackUI,
}) => {
  // États
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("online");
  const [connectionType, setConnectionType] =
    useState<ConnectionType>("unknown");
  const [lastOnlineTimestamp, setLastOnlineTimestamp] = useState<number | null>(
    null
  );
  const [actionQueue, setActionQueue] = useState<QueuedAction[]>([]);
  const [syncStatus, setSyncStatus] = useState({
    pendingActions: 0,
    lastSyncTimestamp: null as number | null,
    isSyncing: false,
  });
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  // Références
  const netInfoSubscription = useRef<NetInfoSubscription | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les actions en file d'attente depuis le stockage
  const loadQueuedActions = useCallback(async () => {
    try {
      const queueString = await AsyncStorage.getItem(
        persistOptions.key || "offline_data"
      );
      if (queueString) {
        const queue = JSON.parse(queueString) as QueuedAction[];
        setActionQueue(queue);
        setSyncStatus((prev) => ({
          ...prev,
          pendingActions: queue.length,
          lastSyncTimestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des actions en file d'attente:",
        error
      );
    }
  }, [persistOptions.key]);

  // Sauvegarder les actions en file d'attente
  const saveQueuedActions = useCallback(
    async (queue: QueuedAction[]) => {
      try {
        await AsyncStorage.setItem(
          persistOptions.key || "offline_data",
          JSON.stringify(queue)
        );
      } catch (error) {
        console.error(
          "Erreur lors de la sauvegarde des actions en file d'attente:",
          error
        );
      }
    },
    [persistOptions.key]
  );

  // Fonction pour ajouter une action à la file d'attente
  const queueAction = useCallback(
    (action: Omit<QueuedAction, "id" | "createdAt">) => {
      const id =
        action.id ||
        `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newAction: QueuedAction = {
        ...action,
        id,
        createdAt: Date.now(),
        retryCount: 0,
      };

      setActionQueue((prevQueue) => {
        const updatedQueue = [...prevQueue, newAction].sort(
          (a, b) => b.priority - a.priority
        );
        saveQueuedActions(updatedQueue);
        return updatedQueue;
      });

      setSyncStatus((prev) => ({
        ...prev,
        pendingActions: prev.pendingActions + 1,
      }));

      return id;
    },
    [saveQueuedActions]
  );

  // Fonction pour supprimer une action de la file d'attente
  const removeQueuedAction = useCallback(
    (id: string) => {
      let found = false;

      setActionQueue((prevQueue) => {
        const newQueue = prevQueue.filter((action) => {
          if (action.id === id) {
            found = true;
            return false;
          }
          return true;
        });

        return newQueue;
      });

      if (found) {
        setSyncStatus((prev) => ({
          ...prev,
          pendingActions: prev.pendingActions - 1,
        }));

        // Mettre à jour le stockage persistant
        if (persistOptions.enabled) {
          try {
            const currentData = AsyncStorage.getItem(
              persistOptions.key || "offline_data"
            );
            if (currentData) {
              const parsedData = JSON.parse(currentData);

              localStorage.setItem(
                persistOptions.key || "offline_data",
                JSON.stringify({
                  ...parsedData,
                  queue: parsedData.queue.filter(
                    (action: QueuedAction) => action.id !== id
                  ),
                })
              );
            }
          } catch (error) {
            console.warn("Erreur lors de la persistance des données:", error);
          }
        }
      }

      return found;
    },
    [saveQueuedActions]
  );

  // Fonction pour vider la file d'attente
  const clearActionQueue = useCallback(() => {
    setActionQueue([]);
    setSyncStatus((prev) => ({
      ...prev,
      pendingActions: 0,
    }));

    // Mettre à jour le stockage persistant
    if (persistOptions.enabled) {
      try {
        const currentData = AsyncStorage.getItem(
          persistOptions.key || "offline_data"
        );
        if (currentData) {
          const parsedData = JSON.parse(currentData);

          localStorage.setItem(
            persistOptions.key || "offline_data",
            JSON.stringify({
              ...parsedData,
              queue: [],
            })
          );
        }
      } catch (error) {
        console.warn("Erreur lors de la persistance des données:", error);
      }
    }
  }, [saveQueuedActions]);

  // Fonction pour synchroniser les données
  const syncData = useCallback(async (): Promise<boolean> => {
    if (!connectionStatus || syncStatus.isSyncing || actionQueue.length === 0) {
      return true;
    }

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
    if (onSyncStart) onSyncStart();

    try {
      // Trier les actions par priorité
      const sortedQueue = [...actionQueue].sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      );

      // Traiter les actions en séquence
      const results = [];
      const failedActions = [];

      for (const action of sortedQueue) {
        try {
          if (action.endpoint) {
            // Exécuter une requête HTTP
            const response = await fetch(action.endpoint, {
              method: action.method || "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(action.payload),
            });

            if (!response.ok) {
              throw new Error(`HTTP error: ${response.status}`);
            }

            const result = await response.json();
            results.push({ id: action.id, success: true, result });
          } else {
            // Action locale, à implémenter selon les besoins
            results.push({
              id: action.id,
              success: true,
              result: "Local action processed",
            });
          }
        } catch (error) {
          console.error(`Échec de l'action ${action.id}:`, error);

          // Incrémenter le compteur de tentatives
          const updatedAction = {
            ...action,
            retryCount: (action.retryCount || 0) + 1,
          };

          // Vérifier si on doit réessayer
          if (updatedAction.retryCount < (updatedAction.maxRetries || 3)) {
            failedActions.push(updatedAction);
          } else {
            results.push({ id: action.id, success: false, error });
          }
        }
      }

      // Mettre à jour la file d'attente
      setActionQueue(failedActions);

      // Mettre à jour l'état de synchronisation
      setSyncStatus({
        pendingActions: failedActions.length,
        lastSyncTimestamp: Date.now(),
        isSyncing: false,
      });

      // Notifier le callback externe
      if (onSyncComplete) {
        onSyncComplete(failedActions.length === 0, results);
      }

      // Sauvegarder dans le stockage persistant
      if (persistOptions.enabled) {
        try {
          await saveQueuedActions(failedActions);
        } catch (error) {
          console.warn("Erreur lors de la persistance des données:", error);
        }
      }

      return failedActions.length === 0;
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);

      // Mettre à jour l'état de synchronisation
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
      }));

      // Notifier le callback externe
      if (onSyncComplete) {
        onSyncComplete(false, { error });
      }

      return false;
    }
  }, [
    connectionStatus,
    syncStatus.isSyncing,
    actionQueue,
    onSyncStart,
    onSyncComplete,
    saveQueuedActions,
  ]);

  // Vérifier la connexion Internet
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (customConnectionChecker) {
      return await customConnectionChecker();
    }

    try {
      // Vérifier d'abord les API natives
      const netInfoState = await NetInfo.fetch();
      const isConnected =
        netInfoState.isConnected || netInfoState.isInternetReachable;

      if (!isConnected) {
        return false;
      }

      // Double vérification avec un ping HTTP
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(pingEndpoint, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn("Erreur lors de la vérification de la connexion:", error);
      return false;
    }
  }, [customConnectionChecker, pingEndpoint]);

  // Gérer les changements de connexion à partir de NetInfo
  const handleNetInfoChange = useCallback(
    (state: NetInfoState) => {
      let newConnectionType: ConnectionType = "unknown";

      if (state.type === "wifi") {
        newConnectionType = "wifi";
      } else if (state.type === "cellular") {
        newConnectionType = "cellular";
      } else if (state.type === "none") {
        newConnectionType = "none";
      }

      setConnectionType(newConnectionType);

      // Si déconnecté selon NetInfo, mettre à jour immédiatement le statut
      if (!state.isConnected) {
        setConnectionStatus("offline");
        setLastOnlineTimestamp(null);

        if (onConnectionChange && connectionStatus !== "offline") {
          onConnectionChange("offline", newConnectionType);
        }
      } else {
        // Si connecté selon NetInfo, vérifier la qualité de la connexion
        checkConnection();
      }
    },
    [checkConnection, onConnectionChange, connectionStatus]
  );

  // Initialisation et nettoyage
  useEffect(() => {
    // Charger les actions en file d'attente au démarrage
    loadQueuedActions();

    // S'abonner aux changements de connectivité
    netInfoSubscription.current = NetInfo.addEventListener(handleNetInfoChange);

    // Configurer les intervalles
    pingIntervalRef.current = setInterval(
      checkConnection,
      onlineDetectionInterval
    );

    if (autoSync) {
      syncIntervalRef.current = setInterval(() => {
        if (connectionStatus === "online" && actionQueue.length > 0) {
          syncData();
        }
      }, syncInterval);
    }

    // Vérifier la connexion initiale
    checkConnection();

    // Nettoyage
    return () => {
      if (netInfoSubscription.current) {
        netInfoSubscription.current();
      }

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [
    loadQueuedActions,
    handleNetInfoChange,
    checkConnection,
    syncData,
    connectionStatus,
    actionQueue.length,
    autoSync,
    onlineDetectionInterval,
    syncInterval,
  ]);

  // Tenter une synchronisation lorsque l'état passe à "online"
  useEffect(() => {
    if (
      connectionStatus === "online" &&
      actionQueue.length > 0 &&
      !syncStatus.isSyncing
    ) {
      syncData();
    }
  }, [connectionStatus, actionQueue.length, syncStatus.isSyncing, syncData]);

  // Contexte à exposer
  const contextValue: OfflineContextType = {
    isOnline: connectionStatus === "online",
    isOffline: connectionStatus === "offline",
    connectionStatus,
    connectionType,
    lastOnlineTimestamp,
    syncStatus: {
      pendingActions: actionQueue.length,
      lastSyncTimestamp: syncStatus.lastSyncTimestamp,
      isSyncing: syncStatus.isSyncing,
    },
    syncData,
    queueAction,
    removeQueuedAction,
    clearActionQueue,
  };

  // Afficher une interface de secours en mode hors ligne
  if (connectionStatus === "offline" && fallbackUI) {
    return (
      <OfflineContext.Provider value={contextValue}>
        {fallbackUI}
      </OfflineContext.Provider>
    );
  }

  // Rendu normal
  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

// Composant qui affiche une bannière lorsque l'appareil est hors ligne
export const OfflineBanner: React.FC<{
  style?: any;
  messageStyle?: any;
  message?: string;
  onPress?: () => void;
}> = ({
  style,
  messageStyle,
  message = "Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.",
  onPress,
}) => {
  const { isOffline, connectionStatus } = useOffline();

  if (!isOffline) return null;

  const handleAction = () => {
    if (onPress) {
      onPress();
    } else {
      syncData();
    }
  };

  return (
    <View style={[styles.offlineBanner, style]}>
      <Text style={[styles.offlineText, messageStyle]}>{message}</Text>
      {onPress && (
        <TouchableOpacity
          style={styles.offlineBannerButton}
          onPress={handleAction}
          disabled={syncStatus.isSyncing}
        >
          {syncStatus.isSyncing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.offlineBannerButtonText}>Synchroniser</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// Composant HOC pour le contenu qui doit être accessible hors ligne
export function withOfflineSupport<P extends {}>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    requiredConnectionStatus?: ConnectionStatus[];
    loadFromCache?: boolean;
    cacheDuration?: number;
  }
) {
  return (props: P) => {
    const { isOnline, connectionStatus } = useOffline();
    const {
      fallback = (
        <Text style={styles.offlineMessage}>
          Ce contenu n'est pas disponible hors ligne
        </Text>
      ),
      requiredConnectionStatus = ["online"],
      loadFromCache = true,
      cacheDuration = 24 * 60 * 60 * 1000, // 24 heures par défaut
    } = options || {};

    // Vérifier si le statut de connexion actuel est suffisant
    const hasRequiredConnection =
      requiredConnectionStatus.includes(connectionStatus);

    if (!hasRequiredConnection && !loadFromCache) {
      return <>{fallback}</>;
    }

    // Sinon, afficher le composant normal
    return <WrappedComponent {...props} />;
  };
}

// Styles
const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: "#f8d7da",
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: 4,
  },
  offlineText: {
    color: "#721c24",
    fontSize: 14,
    fontWeight: "bold",
  },
  offlineMessage: {
    textAlign: "center",
    padding: 20,
    color: "#666",
  },
  offlineBannerButton: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  offlineBannerButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default OfflineManagerProvider;
