import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import {
  OfflineManagerProvider,
  useOffline,
  OfflineBanner,
  QueuedAction,
  withOfflineSupport,
} from "./OfflineManager";

// Composant qui utilise le hook useOffline
const ConnectionStatus: React.FC = () => {
  const { isOnline, connectionStatus, connectionType, syncStatus, syncData } =
    useOffline();

  return (
    <View style={styles.statusContainer}>
      <Text style={styles.statusTitle}>Statut de connexion</Text>
      <Text
        style={[
          styles.statusText,
          isOnline ? styles.statusOnline : styles.statusOffline,
        ]}
      >
        {isOnline ? "Connecté" : "Déconnecté"}
      </Text>
      <Text style={styles.statusDetails}>Type: {connectionType}</Text>
      <Text style={styles.statusDetails}>Statut: {connectionStatus}</Text>

      {syncStatus.pendingActions > 0 && (
        <View style={styles.syncContainer}>
          <Text style={styles.syncText}>
            {syncStatus.pendingActions} action(s) en attente de synchronisation
          </Text>
          <Button
            title="Synchroniser maintenant"
            onPress={() => syncData()}
            disabled={!isOnline || syncStatus.isSyncing}
          />
          {syncStatus.isSyncing && <Text>Synchronisation en cours...</Text>}
        </View>
      )}
    </View>
  );
};

// Exemple de composant nécessitant une connexion
const OnlineOnlyContent = withOfflineSupport(
  () => (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>
        Contenu disponible uniquement en ligne
      </Text>
      <Text style={styles.contentText}>
        Ce contenu nécessite une connexion Internet active pour être affiché. Il
        n'est pas mis en cache et ne sera pas disponible hors ligne.
      </Text>
    </View>
  ),
  {
    requiredConnectionStatus: ["online"],
    loadFromCache: false,
    fallback: (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Contenu indisponible</Text>
        <Text style={styles.fallbackText}>
          Cette section nécessite une connexion Internet active. Veuillez vous
          reconnecter pour y accéder.
        </Text>
      </View>
    ),
  }
);

// Exemple de composant fonctionnant hors ligne avec cache
const CachedContent = withOfflineSupport(
  () => (
    <View style={styles.contentContainer}>
      <Text style={styles.contentTitle}>Contenu disponible hors ligne</Text>
      <Text style={styles.contentText}>
        Ce contenu est mis en cache et reste disponible même sans connexion
        Internet. Certaines fonctionnalités peuvent toutefois être limitées.
      </Text>
    </View>
  ),
  {
    loadFromCache: true,
    cacheDuration: 7 * 24 * 60 * 60 * 1000, // 7 jours
  }
);

// Composant d'exemple qui illustre l'ajout d'actions en file d'attente
const OfflineActions: React.FC = () => {
  const { queueAction, isOnline, syncData } = useOffline();

  // Simuler l'envoi d'un formulaire qui sera mis en file d'attente si hors ligne
  const handleSubmit = () => {
    const action: QueuedAction = {
      type: "SUBMIT_FORM",
      payload: {
        formId: "example-form",
        data: { name: "Exemple", email: "exemple@email.com" },
      },
      endpoint: "https://api.example.com/forms",
      method: "POST",
      priority: 1,
    };

    const actionId = queueAction(action);
    alert(
      `Action enregistrée avec ID: ${actionId}. ${
        isOnline
          ? "Envoi immédiat"
          : "Sera synchronisée quand la connexion sera rétablie"
      }`
    );

    if (isOnline) {
      syncData();
    }
  };

  return (
    <View style={styles.actionContainer}>
      <Text style={styles.actionTitle}>Actions hors ligne</Text>
      <Text style={styles.actionText}>
        Vous pouvez soumettre ce formulaire même hors ligne. Il sera synchronisé
        automatiquement quand la connexion sera rétablie.
      </Text>
      <Button title="Soumettre le formulaire" onPress={handleSubmit} />
    </View>
  );
};

// Composant principal avec le provider
const OfflineExample: React.FC = () => {
  return (
    <OfflineManagerProvider
      pingEndpoint="https://www.google.com"
      onlineDetectionInterval={15000}
      syncInterval={30000}
      autoSync={true}
      onConnectionChange={(status, type) => {
        console.log(`Connexion changée: ${status} (${type})`);
      }}
      fallbackUI={
        <View style={styles.fallbackScreen}>
          <Text style={styles.fallbackScreenTitle}>Application hors ligne</Text>
          <Text style={styles.fallbackScreenText}>
            Vous êtes actuellement hors ligne. Certaines fonctionnalités sont
            limitées. Reconnectez-vous à Internet pour accéder à toutes les
            fonctionnalités.
          </Text>
          <Text style={styles.fallbackScreenNote}>
            Voici quelques fonctionnalités disponibles hors ligne :
          </Text>
          <CachedContent />
        </View>
      }
    >
      <View style={styles.container}>
        <OfflineBanner message="Vous êtes actuellement hors ligne. Les changements seront synchronisés quand vous serez de nouveau connecté." />

        <Text style={styles.title}>Démo du mode hors ligne</Text>
        <Text style={styles.subtitle}>
          Cette démo illustre la gestion du mode hors ligne dans une application
          React Native
        </Text>

        <ConnectionStatus />

        <View style={styles.contentWrapper}>
          <OnlineOnlyContent />
          <CachedContent />
          <OfflineActions />
        </View>
      </View>
    </OfflineManagerProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusOnline: {
    color: "#28a745",
  },
  statusOffline: {
    color: "#dc3545",
  },
  statusDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  syncContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  syncText: {
    marginBottom: 8,
    color: "#495057",
  },
  contentWrapper: {
    marginTop: 12,
  },
  contentContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contentText: {
    color: "#555",
    lineHeight: 20,
  },
  fallbackContainer: {
    backgroundColor: "#f8d7da",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#721c24",
    marginBottom: 8,
  },
  fallbackText: {
    color: "#721c24",
  },
  actionContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  actionText: {
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  fallbackScreen: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
  },
  fallbackScreenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 12,
  },
  fallbackScreenText: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 24,
    lineHeight: 22,
  },
  fallbackScreenNote: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 12,
  },
});

export default OfflineExample;
