const request = require("supertest");
const { describe, it, expect, beforeEach, jest } = require("@jest/globals");
const mongoose = require("mongoose");
const express = require("express");

// Importer les modèles et contrôleurs
const Booking = require("../../models/bookingModel");
const {
  getBookings,
  createBooking,
} = require("../../controllers/bookingController");

// Mocker le service de réservation
jest.mock("../../services/bookingService", () => {
  return {
    BookingService: jest.fn().mockImplementation(() => {
      return {
        isTimeSlotAvailable: jest.fn().mockResolvedValue(true),
        sendConfirmationEmail: jest.fn().mockResolvedValue(true),
      };
    }),
  };
});

// Configurer Express pour les tests
const app = express();
app.use(express.json());

// Middleware mock pour l'authentification
const mockProtect = (req, res, next) => {
  req.user = {
    _id: new mongoose.Types.ObjectId(),
    isAdmin: true,
  };
  next();
};

// Configurer les routes pour le test
app.get("/api/booking", mockProtect, getBookings);
app.post("/api/booking", createBooking);

// Tests
describe("Booking Controller", () => {
  // Données de test
  const mockBooking = {
    date: "2023-12-01",
    time: "10:00",
    service: "Consultation",
    clientName: "Jean Dupont",
    clientEmail: "jean@example.com",
    clientPhone: "0612345678",
    message: "Message de test",
  };

  beforeEach(async () => {
    // Nettoyer la collection avant chaque test
    await Booking.deleteMany({});
  });

  describe("GET /api/booking", () => {
    it("devrait récupérer toutes les réservations", async () => {
      // Créer des réservations de test
      await Booking.create(mockBooking);
      await Booking.create({ ...mockBooking, clientName: "Marie Martin" });

      // Exécuter la requête
      const res = await request(app).get("/api/booking");

      // Vérifications
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.totalPages).toBe(1);
    });
  });

  describe("POST /api/booking", () => {
    it("devrait créer une nouvelle réservation", async () => {
      // Exécuter la requête
      const res = await request(app).post("/api/booking").send(mockBooking);

      // Vérifications
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.clientName).toBe(mockBooking.clientName);

      // Vérifier que la réservation est enregistrée en base
      const bookings = await Booking.find({});
      expect(bookings.length).toBe(1);
    });

    it("devrait rejeter une réservation avec des données manquantes", async () => {
      // Données incomplètes
      const incompleteMockBooking = {
        date: "2023-12-01",
        // Temps manquant
        service: "Consultation",
        // Autres champs manquants
      };

      // Exécuter la requête
      const res = await request(app)
        .post("/api/booking")
        .send(incompleteMockBooking);

      // Vérifications
      expect(res.statusCode).toBe(400);

      // Vérifier qu'aucune réservation n'est enregistrée
      const bookings = await Booking.find({});
      expect(bookings.length).toBe(0);
    });
  });
});
