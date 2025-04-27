# Documentation des Composants CRM

Cette documentation détaille les composants disponibles dans le module CRM, leurs fonctionnalités et leur utilisation.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [ClientsTable](#clientstable)
3. [ClientDetails](#clientdetails)
4. [KanbanBoard](#kanbanboard)
5. [AutomationBuilder](#automationbuilder)
6. [Segmentation](#segmentation)
7. [Scoring](#scoring)
8. [Communication](#communication)
9. [ActivityManager](#activitymanager)
10. [ContactImportExport](#contactimportexport)
11. [MiniKanban](#minikanban)

## Vue d'ensemble

Les composants CRM forment un système complet de gestion de la relation client, permettant de suivre les interactions avec les clients, gérer les prospects, automatiser les workflows commerciaux et analyser les performances.

## ClientsTable

Le composant `ClientsTable` offre une interface complète pour afficher, filtrer, trier et gérer une liste de clients ou prospects.

### Fonctionnalités

- Affichage en mode tableau ou grille de cartes
- Tri multi-colonnes
- Filtrage avancé par statut, score, secteur, etc.
- Recherche en temps réel
- Pagination avec nombre configurable d'éléments par page
- Export des données (CSV, Excel, PDF)
- Personnalisation des colonnes affichées
- Persistance des préférences utilisateur

### Utilisation

```tsx
import { ClientsTable } from "@/components/crm/ClientsTable/ClientsTable";

// Utilisation de base
<ClientsTable />

// Avec configuration personnalisée
<ClientsTable
  initialFilters={{ status: 'active' }}
  customColumns={myColumnsConfig}
  onClientSelect={handleClientSelect}
  onExport={handleExport}
/>
```

### Props

| Prop             | Type                                          | Description                               |
| ---------------- | --------------------------------------------- | ----------------------------------------- |
| `initialFilters` | `ClientFiltersType`                           | Filtres à appliquer au chargement         |
| `customColumns`  | `ColumnConfig[]`                              | Configuration personnalisée des colonnes  |
| `onClientSelect` | `(client: Client) => void`                    | Callback lors de la sélection d'un client |
| `onExport`       | `(data: any[], format: ExportFormat) => void` | Callback lors de l'export des données     |
| `dataSource`     | `() => Promise<Client[]>`                     | Source de données alternative             |
| `itemsPerPage`   | `number`                                      | Nombre d'éléments par page (défaut: 10)   |

## ClientDetails

Le composant `ClientDetails` affiche les informations détaillées d'un client, son historique d'interactions et permet de mettre à jour ses informations.

### Fonctionnalités

- Affichage des informations de contact et de société
- Historique complet des interactions
- Gestion des tâches associées
- Édition des informations
- Notes et commentaires
- Timeline d'activité
- Indicateurs de performance

### Utilisation

```tsx
import { ClientDetails } from "@/components/crm/ClientDetails/ClientDetails";

<ClientDetails
  clientId="client-123"
  editable={true}
  onUpdate={handleClientUpdate}
/>;
```

### Props

| Prop           | Type                       | Description                          |
| -------------- | -------------------------- | ------------------------------------ |
| `clientId`     | `string`                   | ID du client à afficher              |
| `client`       | `Client`                   | Objet client (alternatif à clientId) |
| `editable`     | `boolean`                  | Autoriser l'édition des informations |
| `onUpdate`     | `(client: Client) => void` | Callback lors de la mise à jour      |
| `showActivity` | `boolean`                  | Afficher la timeline d'activité      |
| `showTasks`    | `boolean`                  | Afficher les tâches associées        |

## KanbanBoard

Le composant `KanbanBoard` implémente une vue kanban pour gérer le pipeline commercial ou les tâches.

### Fonctionnalités

- Colonnes personnalisables
- Glisser-déposer des cartes entre colonnes
- Filtrage et recherche
- Vue compacte ou détaillée
- Statistiques par colonne
- Personnalisation des cartes
- Gestion des étiquettes et priorités

### Utilisation

```tsx
import { KanbanBoard } from "@/components/crm/KanbanBoard/KanbanBoard";

<KanbanBoard
  columns={salesPipelineColumns}
  items={opportunities}
  onItemMove={handleOpportunityStageChange}
/>;
```

### Props

| Prop              | Type                                                              | Description                               |
| ----------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| `columns`         | `KanbanColumn[]`                                                  | Configuration des colonnes                |
| `items`           | `KanbanItem[]`                                                    | Éléments à afficher                       |
| `onItemMove`      | `(item: KanbanItem, source: string, destination: string) => void` | Callback lors du déplacement d'un élément |
| `compactView`     | `boolean`                                                         | Affichage compact des cartes              |
| `showColumnStats` | `boolean`                                                         | Afficher les statistiques par colonne     |
| `itemRenderer`    | `(item: KanbanItem) => React.ReactNode`                           | Rendu personnalisé des cartes             |

## AutomationBuilder

Le composant `AutomationBuilder` permet de créer et gérer des workflows d'automatisation marketing et commerciale.

### Fonctionnalités

- Éditeur visuel de workflows
- Déclencheurs d'événements
- Actions conditionnelles
- Délais et attentes
- Intégrations email et SMS
- Tests de workflows
- Analyse de performance

### Utilisation

```tsx
import { AutomationBuilder } from "@/components/crm/AutomationBuilder/AutomationBuilder";

<AutomationBuilder
  initialWorkflow={welcomeEmailWorkflow}
  triggers={availableTriggers}
  actions={availableActions}
  onSave={handleWorkflowSave}
/>;
```

### Props

| Prop              | Type                                          | Description                    |
| ----------------- | --------------------------------------------- | ------------------------------ |
| `initialWorkflow` | `Workflow`                                    | Workflow initial à éditer      |
| `triggers`        | `TriggerDefinition[]`                         | Déclencheurs disponibles       |
| `actions`         | `ActionDefinition[]`                          | Actions disponibles            |
| `onSave`          | `(workflow: Workflow) => void`                | Callback lors de la sauvegarde |
| `readOnly`        | `boolean`                                     | Mode lecture seule             |
| `onTest`          | `(workflow: Workflow) => Promise<TestResult>` | Fonction de test du workflow   |

## Segmentation

Le composant `Segmentation` permet de créer et gérer des segments de clients basés sur des critères complexes.

### Fonctionnalités

- Constructeur de requêtes visuelles
- Opérateurs ET/OU/NON
- Prévisualisation des résultats
- Sauvegarde des segments
- Réutilisation des segments
- Exportation des segments

### Utilisation

```tsx
import { Segmentation } from "@/components/crm/Segmentation/Segmentation";

<Segmentation
  availableFields={clientFields}
  onSegmentCreate={handleSegmentCreate}
  onPreview={handleSegmentPreview}
/>;
```

### Props

| Prop              | Type                                                    | Description                               |
| ----------------- | ------------------------------------------------------- | ----------------------------------------- |
| `availableFields` | `SegmentField[]`                                        | Champs disponibles pour la segmentation   |
| `initialSegment`  | `Segment`                                               | Segment initial à éditer                  |
| `onSegmentCreate` | `(segment: Segment) => void`                            | Callback lors de la création d'un segment |
| `onPreview`       | `(criteria: SegmentCriteria) => Promise<PreviewResult>` | Fonction de prévisualisation              |
| `savedSegments`   | `Segment[]`                                             | Segments sauvegardés pour réutilisation   |

## Scoring

Le composant `Scoring` permet de configurer et gérer des modèles de scoring pour évaluer la qualité des leads.

### Fonctionnalités

- Configuration des règles de scoring
- Pondération des critères
- Seuils de qualification
- Modèles prédéfinis
- Visualisation des scores
- Tests A/B de modèles

### Utilisation

```tsx
import { Scoring } from "@/components/crm/Scoring/Scoring";

<Scoring
  scoringModel={currentModel}
  availableCriteria={leadCriteria}
  onModelSave={handleModelSave}
/>;
```

### Props

| Prop                | Type                            | Description                      |
| ------------------- | ------------------------------- | -------------------------------- |
| `scoringModel`      | `ScoringModel`                  | Modèle de scoring à éditer       |
| `availableCriteria` | `ScoringCriterion[]`            | Critères disponibles             |
| `onModelSave`       | `(model: ScoringModel) => void` | Callback lors de la sauvegarde   |
| `showAnalytics`     | `boolean`                       | Afficher les analytics du modèle |
| `testData`          | `Lead[]`                        | Données pour tester le modèle    |

## Communication

Le composant `Communication` gère les modèles de communication et l'envoi d'emails, SMS et notifications.

### Fonctionnalités

- Modèles d'emails et SMS
- Éditeur visuel
- Personnalisation dynamique
- Planification d'envoi
- Statistiques d'ouverture et de clic
- Tests A/B

### Utilisation

```tsx
import { Communication } from "@/components/crm/Communication/Communication";

<Communication
  templates={emailTemplates}
  variables={availableVariables}
  onSend={handleSendCommunication}
/>;
```

### Props

| Prop               | Type                                                    | Description                                    |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------- |
| `templates`        | `CommunicationTemplate[]`                               | Modèles disponibles                            |
| `variables`        | `TemplateVariable[]`                                    | Variables de personnalisation                  |
| `onSend`           | `(communication: Communication) => Promise<SendResult>` | Fonction d'envoi                               |
| `selectedContacts` | `Contact[]`                                             | Contacts sélectionnés pour l'envoi             |
| `channelTypes`     | `ChannelType[]`                                         | Types de canaux disponibles (email, SMS, etc.) |

## ActivityManager

Le composant `ActivityManager` permet de suivre et gérer les activités liées aux clients.

### Fonctionnalités

- Création et assignation de tâches
- Suivi des appels, emails et réunions
- Rappels et notifications
- Vue calendrier
- Vue liste
- Filtrage par statut et type

### Utilisation

```tsx
import { ActivityManager } from "@/components/crm/ActivityManager/ActivityManager";

<ActivityManager
  activities={clientActivities}
  onActivityCreate={handleCreateActivity}
  onActivityComplete={handleCompleteActivity}
/>;
```

### Props

| Prop                 | Type                           | Description                     |
| -------------------- | ------------------------------ | ------------------------------- |
| `activities`         | `Activity[]`                   | Activités à afficher            |
| `clientId`           | `string`                       | ID du client (facultatif)       |
| `viewType`           | `"list" \| "calendar"`         | Type de vue                     |
| `onActivityCreate`   | `(activity: Activity) => void` | Callback lors de la création    |
| `onActivityComplete` | `(activityId: string) => void` | Callback lors de la complétion  |
| `onActivityUpdate`   | `(activity: Activity) => void` | Callback lors de la mise à jour |

## ContactImportExport

Le composant `ContactImportExport` gère l'import et export de contacts depuis diverses sources.

### Fonctionnalités

- Import depuis CSV, Excel, vCard
- Export vers différents formats
- Mappage de champs
- Validation des données
- Détection de doublons
- Fusion de contacts

### Utilisation

```tsx
import { ContactImportExport } from "@/components/crm/ContactImportExport/ContactImportExport";

<ContactImportExport
  fieldMapping={contactFieldMapping}
  onImportComplete={handleImportComplete}
  onExportRequest={handleExportRequest}
/>;
```

### Props

| Prop                   | Type                                                     | Description                        |
| ---------------------- | -------------------------------------------------------- | ---------------------------------- |
| `fieldMapping`         | `FieldMapping`                                           | Mappage des champs                 |
| `onImportComplete`     | `(importResult: ImportResult) => void`                   | Callback après import              |
| `onExportRequest`      | `(format: ExportFormat, filters: ExportFilters) => void` | Callback pour l'export             |
| `validateBeforeImport` | `boolean`                                                | Activer la validation avant import |
| `detectDuplicates`     | `boolean`                                                | Détecter les doublons              |
| `supportedFormats`     | `ImportExportFormat[]`                                   | Formats supportés                  |

## MiniKanban

Le composant `MiniKanban` est une version simplifiée du KanbanBoard, utilisable comme widget dans d'autres vues.

### Fonctionnalités

- Interface simplifiée
- Nombre limité d'éléments
- Actions rapides
- Aperçu des principales opportunités ou tâches

### Utilisation

```tsx
import { MiniKanban } from "@/components/crm/MiniKanban/MiniKanban";

<MiniKanban
  items={topOpportunities}
  maxItems={5}
  onItemClick={handleOpportunitySelect}
/>;
```

### Props

| Prop            | Type                         | Description                           |
| --------------- | ---------------------------- | ------------------------------------- |
| `items`         | `KanbanItem[]`               | Éléments à afficher                   |
| `columns`       | `KanbanColumn[]`             | Colonnes à afficher (facultatif)      |
| `maxItems`      | `number`                     | Nombre maximum d'éléments par colonne |
| `onItemClick`   | `(item: KanbanItem) => void` | Callback lors du clic sur un élément  |
| `showAddButton` | `boolean`                    | Afficher le bouton d'ajout            |
| `compactView`   | `boolean`                    | Affichage compact (défaut: true)      |
