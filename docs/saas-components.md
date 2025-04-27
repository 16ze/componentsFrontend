# Documentation des Composants SaaS

Cette documentation détaille les composants disponibles pour les applications SaaS, leur utilisation et leurs fonctionnalités.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Composants d'Authentification](#composants-dauthentification)
3. [Composants de Gestion d'Abonnement](#composants-de-gestion-dabonnement)
4. [Composants d'Administration](#composants-dadministration)
5. [Composants de Tableau de Bord](#composants-de-tableau-de-bord)
6. [Composants d'Intégration](#composants-dintégration)

## Vue d'ensemble

Les composants SaaS fournissent les fonctionnalités essentielles pour construire une application en mode Software-as-a-Service : authentification, abonnements, tableaux de bord, intégrations et administration multi-tenant.

## Composants d'Authentification

### AuthProvider

Le composant `AuthProvider` gère l'état d'authentification global et fournit les méthodes d'authentification.

#### Fonctionnalités

- Gestion de l'état d'authentification
- Authentification par email/mot de passe
- Authentification par réseaux sociaux
- Authentification par SSO
- Gestion des tokens JWT
- Sessions persistantes
- Authentification à deux facteurs (2FA)
- Protection des routes

#### Utilisation

```tsx
import { AuthProvider } from "@/components/subscription/auth/AuthProvider";

<AuthProvider authConfig={authConfig} onAuthStateChange={handleAuthStateChange}>
  <YourApp />
</AuthProvider>;
```

#### Hooks associés

```tsx
import { useAuth } from "@/components/subscription/auth/useAuth";

function ProfileComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    resetPassword,
  } = useAuth();

  // Utilisation des fonctions d'authentification
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Bonjour, {user.name}</p>
          <button onClick={logout}>Déconnexion</button>
        </>
      ) : (
        <button onClick={() => login({ email, password })}>Connexion</button>
      )}
    </div>
  );
}
```

### LoginForm

Formulaire complet de connexion avec validation.

#### Fonctionnalités

- Validation des champs
- Connexion par email/mot de passe
- Connexion par réseaux sociaux
- Option "Se souvenir de moi"
- Récupération de mot de passe
- Messagerie d'erreur
- Authentification à deux facteurs

#### Utilisation

```tsx
import { LoginForm } from "@/components/subscription/auth/LoginForm";

<LoginForm
  onSuccess={handleLoginSuccess}
  onError={handleLoginError}
  showSocialLogin={true}
  enabledSocialProviders={["google", "github"]}
  redirectTo="/dashboard"
/>;
```

### SignupForm

Formulaire d'inscription pour de nouveaux utilisateurs.

#### Fonctionnalités

- Validation des champs
- Vérification de complexité du mot de passe
- Formulaire multi-étapes
- Intégration avec les plans d'abonnement
- Vérification d'email
- Personnalisation des champs
- Termes et conditions

#### Utilisation

```tsx
import { SignupForm } from "@/components/subscription/auth/SignupForm";

<SignupForm
  onSuccess={handleSignupSuccess}
  customFields={customUserFields}
  plans={subscriptionPlans}
  selectedPlan={selectedPlan}
  enableEmailVerification={true}
  termsUrl="/terms"
  privacyUrl="/privacy"
/>;
```

## Composants de Gestion d'Abonnement

### PricingTable

Le composant `PricingTable` affiche les différents plans d'abonnement disponibles.

#### Fonctionnalités

- Comparaison des fonctionnalités par plan
- Affichage des prix mensuel/annuel
- Mise en évidence du plan recommandé
- Gestion des promotions et codes promo
- Affichage des périodes d'essai
- Design responsive

#### Utilisation

```tsx
import { PricingTable } from "@/components/subscription/pricing/PricingTable";

<PricingTable
  plans={subscriptionPlans}
  currentPlan={userCurrentPlan}
  onPlanSelect={handlePlanSelect}
  billingPeriod={billingPeriod}
  showToggle={true}
  promoCode={promoCode}
  highlightedPlan="pro"
/>;
```

### SubscriptionManager

Interface de gestion d'abonnement pour les utilisateurs.

#### Fonctionnalités

- Affichage du plan actuel
- Historique de facturation
- Changement de plan
- Annulation d'abonnement
- Gestion des moyens de paiement
- Téléchargement des factures
- Gestion des limites d'utilisation

#### Utilisation

```tsx
import { SubscriptionManager } from "@/components/subscription/manager/SubscriptionManager";

<SubscriptionManager
  subscription={userSubscription}
  paymentMethods={userPaymentMethods}
  invoices={userInvoices}
  onPlanChange={handlePlanChange}
  onCancel={handleCancelSubscription}
  onPaymentMethodUpdate={handlePaymentUpdate}
/>;
```

### PaymentMethodForm

Formulaire pour ajouter ou mettre à jour des moyens de paiement.

#### Fonctionnalités

- Intégration Stripe/PayPal/etc.
- Validation de carte
- Sauvegarde sécurisée
- Support de différents types de paiement
- Interface de carte interactive
- Gestion des erreurs de paiement

#### Utilisation

```tsx
import { PaymentMethodForm } from "@/components/subscription/payment/PaymentMethodForm";

<PaymentMethodForm
  onSuccess={handlePaymentMethodAdded}
  defaultValues={existingPaymentMethod}
  providers={["stripe", "paypal"]}
  saveAsDefault={true}
/>;
```

## Composants d'Administration

### UserManagement

Interface d'administration des utilisateurs.

#### Fonctionnalités

- Liste des utilisateurs avec pagination
- Recherche et filtrage
- Édition des profils
- Gestion des rôles et permissions
- Désactivation/réactivation de comptes
- Import/export d'utilisateurs
- Métriques d'activité

#### Utilisation

```tsx
import { UserManagement } from "@/components/subscription/admin/UserManagement";

<UserManagement
  users={users}
  roles={availableRoles}
  onUserUpdate={handleUserUpdate}
  onUserCreate={handleUserCreate}
  onUserDeactivate={handleUserDeactivate}
  pagination={{
    pageSize: 10,
    pageIndex: 0,
    total: totalUsers,
  }}
  onPageChange={handlePageChange}
/>;
```

### TeamManagement

Gestion des équipes et organisations.

#### Fonctionnalités

- Création et configuration d'équipes
- Invitation de membres
- Attribution de rôles
- Hiérarchie d'équipes
- Paramètres par équipe
- Transfert de propriété
- Métriques d'utilisation par équipe

#### Utilisation

```tsx
import { TeamManagement } from "@/components/subscription/admin/TeamManagement";

<TeamManagement
  teams={userTeams}
  currentTeam={activeTeam}
  onTeamCreate={handleTeamCreate}
  onTeamUpdate={handleTeamUpdate}
  onMemberInvite={handleMemberInvite}
  onMemberRemove={handleMemberRemove}
  onMemberRoleChange={handleRoleChange}
  onTeamSwitch={handleTeamSwitch}
/>;
```

## Composants de Tableau de Bord

### MetricsWidget

Widget pour afficher des métriques clés sur un tableau de bord.

#### Fonctionnalités

- Visualisation de données
- Comparaison avec période précédente
- Tendances et évolutions
- Personnalisation des indicateurs
- Exportation des données
- Actualisation en temps réel
- Affichage condensé ou détaillé

#### Utilisation

```tsx
import { MetricsWidget } from "@/components/subscription/dashboard/MetricsWidget";

<MetricsWidget
  title="Utilisateurs actifs"
  value={activeUsers}
  previousValue={previousActiveUsers}
  change={percentChange}
  trend="up"
  format="number"
  icon="users"
  timeframe="30d"
  onRefresh={fetchLatestData}
/>;
```

### UsageOverview

Vue d'ensemble de l'utilisation des ressources et des limites du plan.

#### Fonctionnalités

- Barres de progression
- Alertes de seuils
- Historique d'utilisation
- Prédictions d'utilisation
- Comparaison par rapport au plan
- Suggestions de mise à niveau
- Détail par ressource

#### Utilisation

```tsx
import { UsageOverview } from "@/components/subscription/dashboard/UsageOverview";

<UsageOverview
  resources={resourceUsage}
  limits={planLimits}
  billingPeriod="monthly"
  showUpgradePrompt={isNearLimit}
  onUpgradeClick={handleUpgradeClick}
  detailed={true}
/>;
```

## Composants d'Intégration

### APIKeyManager

Gestion des clés API pour l'intégration avec d'autres services.

#### Fonctionnalités

- Génération de clés API
- Révocation de clés
- Droits d'accès par clé
- Journalisation des utilisations
- Limites d'utilisation
- Test d'intégration
- Exemples de code

#### Utilisation

```tsx
import { APIKeyManager } from "@/components/subscription/integration/APIKeyManager";

<APIKeyManager
  apiKeys={userApiKeys}
  onKeyCreate={handleKeyCreate}
  onKeyRevoke={handleKeyRevoke}
  onPermissionsChange={handlePermissionsChange}
  showUsageLogs={true}
  maxKeys={planLimits.apiKeys}
/>;
```

### WebhookConfigurator

Configuration de webhooks pour les notifications externes.

#### Fonctionnalités

- Ajout/suppression de webhooks
- Sélection d'événements
- Test de webhooks
- Historique de livraison
- Format de payload personnalisable
- Sécurité des webhooks
- Replanification automatique

#### Utilisation

```tsx
import { WebhookConfigurator } from "@/components/subscription/integration/WebhookConfigurator";

<WebhookConfigurator
  webhooks={configuredWebhooks}
  availableEvents={webhookEvents}
  onWebhookCreate={handleWebhookCreate}
  onWebhookUpdate={handleWebhookUpdate}
  onWebhookDelete={handleWebhookDelete}
  onTest={handleWebhookTest}
  deliveryLogs={webhookDeliveryLogs}
/>;
```

### OAuth2ClientManager

Gestion des clients OAuth2 pour l'intégration d'applications tierces.

#### Fonctionnalités

- Création de clients OAuth2
- Configuration des redirects URI
- Gestion des scopes
- Génération de secrets
- Journalisation des autorisations
- Révocation d'accès
- Statistiques d'utilisation

#### Utilisation

```tsx
import { OAuth2ClientManager } from "@/components/subscription/integration/OAuth2ClientManager";

<OAuth2ClientManager
  oauthClients={userOAuthClients}
  onClientCreate={handleClientCreate}
  onClientUpdate={handleClientUpdate}
  onClientDelete={handleClientDelete}
  availableScopes={oauthScopes}
  authorizedApps={userAuthorizedApps}
  onRevokeAccess={handleRevokeAccess}
/>;
```
