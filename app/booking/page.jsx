import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingForm } from "@/components/booking/BookingForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Réservation de rendez-vous",
  description: "Prenez rendez-vous en quelques clics",
};

export default function BookingPage() {
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-2">Réservez votre rendez-vous</h1>
      <p className="text-muted-foreground mb-6">
        Choisissez le type de rendez-vous, la date et l'heure qui vous
        conviennent.
      </p>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" id="calendar-tab">
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="details">Vos informations</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <BookingCalendar />
        </TabsContent>
        <TabsContent value="details">
          <BookingForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
