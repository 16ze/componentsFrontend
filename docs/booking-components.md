# Documentation des Composants de Réservation

Cette documentation détaille les composants disponibles dans le module de réservation, leur utilisation et leurs fonctionnalités.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [BookingCalendar](#bookingcalendar)
3. [BookingForm](#bookingform)

## Vue d'ensemble

Les composants de réservation fournissent un système complet pour gérer les réservations, les disponibilités et les plannings. Ils sont adaptés aux hôtels, salles de réunion, restaurants, services de rendez-vous et autres entreprises nécessitant un système de réservation.

## BookingCalendar

Le composant `BookingCalendar` affiche un calendrier interactif pour la sélection de dates et créneaux horaires de réservation.

### Fonctionnalités

- Affichage mensuel, hebdomadaire ou journalier
- Gestion des disponibilités en temps réel
- Sélection de plages de dates (check-in/check-out)
- Affichage des créneaux horaires disponibles
- Blocage des dates indisponibles
- Tarifications dynamiques par jour
- Support pour les fuseaux horaires
- Personnalisation visuelle (thèmes, couleurs)
- Mode responsive
- Support tactile pour mobile

### Utilisation

```jsx
import { BookingCalendar } from "@/components/booking/BookingCalendar";

// Utilisation de base
<BookingCalendar
  availableDates={availableDates}
  onDateSelect={handleDateSelect}
/>

// Configuration complète
<BookingCalendar
  availableDates={availableDates}
  bookedSlots={bookedSlots}
  minDate={new Date()}
  maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
  initialDate={new Date()}
  mode="range"
  allowedDays={[1, 2, 3, 4, 5]} // Lundi à vendredi
  timeSlots={timeSlots}
  priceByDate={priceByDate}
  onDateSelect={handleDateSelect}
  onTimeSlotSelect={handleTimeSlotSelect}
  disabledDates={disabledDates}
  highlightedDates={highlightedDates}
  view="month"
/>
```

### Props

| Prop               | Type                                           | Description                                        |
| ------------------ | ---------------------------------------------- | -------------------------------------------------- |
| `availableDates`   | `Date[]`                                       | Dates disponibles pour réservation                 |
| `bookedSlots`      | `BookedSlot[]`                                 | Créneaux déjà réservés                             |
| `minDate`          | `Date`                                         | Date minimale sélectionnable                       |
| `maxDate`          | `Date`                                         | Date maximale sélectionnable                       |
| `initialDate`      | `Date`                                         | Date initiale affichée                             |
| `mode`             | `"single" \| "range" \| "multiple"`            | Mode de sélection                                  |
| `allowedDays`      | `number[]`                                     | Jours de la semaine autorisés (0-6)                |
| `timeSlots`        | `TimeSlot[]`                                   | Créneaux horaires disponibles                      |
| `priceByDate`      | `Record<string, number>`                       | Prix par date                                      |
| `onDateSelect`     | `(dates: Date \| Date[] \| DateRange) => void` | Callback de sélection de date                      |
| `onTimeSlotSelect` | `(slot: TimeSlot) => void`                     | Callback de sélection de créneau                   |
| `disabledDates`    | `Date[]`                                       | Dates désactivées                                  |
| `highlightedDates` | `{ date: Date; color: string }[]`              | Dates mises en évidence                            |
| `view`             | `"month" \| "week" \| "day"`                   | Vue initiale                                       |
| `className`        | `string`                                       | Classes CSS additionnelles                         |
| `locale`           | `string`                                       | Locale pour la localisation                        |
| `firstDayOfWeek`   | `0 \| 1`                                       | Premier jour de la semaine (0: dimanche, 1: lundi) |

## BookingForm

Le composant `BookingForm` est un formulaire complet pour effectuer une réservation avec toutes les informations nécessaires.

### Fonctionnalités

- Sélection de dates et heures de réservation
- Gestion des informations client
- Options et extras ajoutables
- Calcul dynamique du prix
- Validation des champs
- Vérification des disponibilités en temps réel
- Intégration avec des systèmes de paiement
- Support pour différents types de réservations (personnes, salles, etc.)
- Gestion des codes promotionnels
- Récapitulatif de la réservation

### Utilisation

```jsx
import { BookingForm } from "@/components/booking/BookingForm";

// Utilisation de base
<BookingForm
  onSubmit={handleBookingSubmit}
  availableDates={availableDates}
/>

// Configuration complète
<BookingForm
  onSubmit={handleBookingSubmit}
  availableDates={availableDates}
  timeSlots={timeSlots}
  resourceTypes={resourceTypes}
  initialData={initialBookingData}
  extras={availableExtras}
  pricingRules={pricingRules}
  discountCodes={validDiscountCodes}
  onAvailabilityCheck={checkAvailability}
  paymentMethods={paymentMethods}
  termsUrl="/terms"
  maxPartySize={10}
  onCancel={handleCancel}
  loading={isSubmitting}
/>
```

### Props

| Prop                  | Type                                                          | Description                                  |
| --------------------- | ------------------------------------------------------------- | -------------------------------------------- |
| `onSubmit`            | `(booking: BookingData) => void`                              | Callback de soumission                       |
| `availableDates`      | `Date[]`                                                      | Dates disponibles                            |
| `timeSlots`           | `TimeSlot[]`                                                  | Créneaux horaires disponibles                |
| `resourceTypes`       | `ResourceType[]`                                              | Types de ressources (chambres, tables, etc.) |
| `initialData`         | `Partial<BookingData>`                                        | Données initiales du formulaire              |
| `extras`              | `BookingExtra[]`                                              | Options supplémentaires                      |
| `pricingRules`        | `PricingRule[]`                                               | Règles de tarification                       |
| `discountCodes`       | `DiscountCode[]`                                              | Codes de réduction valides                   |
| `onAvailabilityCheck` | `(dates: DateRange, resourceId?: string) => Promise<boolean>` | Vérification de disponibilité                |
| `paymentMethods`      | `PaymentMethod[]`                                             | Méthodes de paiement acceptées               |
| `termsUrl`            | `string`                                                      | URL des conditions générales                 |
| `maxPartySize`        | `number`                                                      | Taille maximale du groupe                    |
| `onCancel`            | `() => void`                                                  | Callback d'annulation                        |
| `loading`             | `boolean`                                                     | État de chargement                           |
| `requiresPayment`     | `boolean`                                                     | Nécessite un paiement immédiat               |
| `className`           | `string`                                                      | Classes CSS additionnelles                   |
| `minAdvanceBooking`   | `number`                                                      | Délai minimum en jours pour réserver         |
| `maxAdvanceBooking`   | `number`                                                      | Délai maximum en jours pour réserver         |

### Structure de données

#### BookingData

```typescript
interface BookingData {
  id?: string;
  dates: {
    startDate: Date;
    endDate?: Date;
  };
  timeSlot?: TimeSlot;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: Address;
  };
  resources: BookedResource[];
  party: {
    adults: number;
    children: number;
  };
  extras: BookedExtra[];
  specialRequests?: string;
  payment?: {
    method: string;
    status: PaymentStatus;
    amount: number;
    transactionId?: string;
  };
  discountCode?: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

#### TimeSlot

```typescript
interface TimeSlot {
  id: string;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  maxCapacity?: number;
  available: boolean;
  price?: number;
}
```

#### ResourceType

```typescript
interface ResourceType {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  pricePerUnit: number;
  images?: string[];
  features?: string[];
  available: boolean;
}
```

#### BookingExtra

```typescript
interface BookingExtra {
  id: string;
  name: string;
  description?: string;
  price: number;
  perPerson?: boolean;
  perDay?: boolean;
  maxQuantity?: number;
}
```

### Exemple de validation

Le formulaire utilise Zod pour la validation des données :

```typescript
const bookingFormSchema = z.object({
  dates: z.object({
    startDate: z.date({
      required_error: "Date de début requise",
    }),
    endDate: z.date().optional(),
  }),
  timeSlot: z
    .object({
      id: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    })
    .optional(),
  customer: z.object({
    firstName: z.string().min(2, "Prénom trop court"),
    lastName: z.string().min(2, "Nom trop court"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Téléphone invalide"),
  }),
  resources: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().min(1),
      })
    )
    .min(1, "Au moins une ressource doit être sélectionnée"),
  party: z.object({
    adults: z.number().min(1, "Au moins un adulte requis"),
    children: z.number().min(0),
  }),
  extras: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().min(1),
      })
    )
    .optional(),
  specialRequests: z.string().max(500).optional(),
  termsAccepted: z.literal(true, {
    invalid_type_error: "Vous devez accepter les conditions",
  }),
});
```
