"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/stores/bookingStore";

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const appointmentTypes = [
  {
    id: "discovery",
    name: "Découverte",
    duration: 30,
    color: "bg-blue-100 dark:bg-blue-900",
  },
  {
    id: "consultation",
    name: "Consultation",
    duration: 60,
    color: "bg-green-100 dark:bg-green-900",
  },
  {
    id: "followup",
    name: "Suivi",
    duration: 45,
    color: "bg-purple-100 dark:bg-purple-900",
  },
];

export function BookingCalendar() {
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedType, setSelectedType] = useState(appointmentTypes[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const { setBookingDetails } = useBookingStore();

  // Simulate fetching available slots from API
  useEffect(() => {
    const fetchAvailability = async () => {
      // In a real app, this would be an API call with date as parameter
      // For demo, we'll simulate some available slots
      const fetchedSlots = timeSlots.filter(() => Math.random() > 0.3);
      setAvailableSlots(fetchedSlots);
    };

    if (date) {
      fetchAvailability();
    }
  }, [date]);

  // Handle appointment type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedSlot(null); // Reset slot selection when changing appointment type
  };

  // Custom day rendering for the calendar
  const dayRenderer = (day, selectedDays, dayProps) => {
    return (
      <div
        {...dayProps}
        className={cn(
          dayProps.className,
          "relative rounded-md transition-colors",
          isSameDay(day, new Date()) && "bg-accent text-accent-foreground",
          day < new Date() && "text-muted-foreground opacity-50"
        )}
      >
        {format(day, "d")}
        {day > new Date() && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary/70"></div>
        )}
      </div>
    );
  };

  // Handle time slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);

    // Create appointment datetime by combining the selected date and time slot
    const [hours, minutes] = slot.split(":");
    const appointmentDate = new Date(date);
    appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Update global booking state
    setBookingDetails({
      date: appointmentDate,
      type: selectedType,
      time: slot,
      duration: selectedType.duration,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sélectionnez le type de rendez-vous</CardTitle>
          <CardDescription>
            Choisissez le service qui correspond à vos besoins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {appointmentTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType.id === type.id ? "default" : "outline"}
                className={cn(
                  "flex flex-col h-20 transition-all",
                  selectedType.id === type.id ? "border-primary" : ""
                )}
                onClick={() => handleTypeSelect(type)}
              >
                <span className="font-medium">{type.name}</span>
                <span className="text-xs opacity-70">{type.duration} min</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez une date</CardTitle>
            <CardDescription>
              Choisissez le jour qui vous convient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={{ before: new Date() }}
              locale={fr}
              components={{
                Day: dayRenderer,
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horaires disponibles</CardTitle>
            <CardDescription>
              {date
                ? format(date, "EEEE d MMMM yyyy", { locale: fr })
                : "Sélectionnez une date"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? "default" : "outline"}
                    className={cn(
                      "flex items-center justify-center h-12",
                      selectedSlot === slot && "border-primary"
                    )}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">
                  Aucun créneau disponible à cette date
                </p>
                <Button
                  variant="ghost"
                  className="mt-2"
                  onClick={() => setDate(addDays(date, 1))}
                >
                  Voir le jour suivant
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(addDays(date, -1))}
              disabled={date <= new Date()}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Jour précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(addDays(date, 1))}
            >
              Jour suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {selectedSlot && (
        <Card className={cn("border-l-4", selectedType.color)}>
          <CardHeader>
            <CardTitle>Récapitulatif de votre réservation</CardTitle>
            <CardDescription>
              Vérifiez les détails avant de confirmer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span>{selectedType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{format(date, "EEEE d MMMM yyyy", { locale: fr })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Heure:</span>
                <span>{selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Durée:</span>
                <span>{selectedType.duration} minutes</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Confirmer la réservation</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
