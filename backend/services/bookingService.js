const Booking = require("../models/bookingModel");
const logger = require("../utils/logger");

/**
 * Service pour la gestion des réservations
 */
class BookingService {
  /**
   * Vérifie si un créneau horaire est disponible
   * @param {String} date - Date au format YYYY-MM-DD
   * @param {String} time - Heure au format HH:MM
   * @param {String} excludeId - ID de réservation à exclure (pour les mises à jour)
   * @returns {Promise<Boolean>} - true si disponible, false sinon
   */
  async isTimeSlotAvailable(date, time, excludeId = null) {
    try {
      // Convertir la date en objet Date
      const bookingDate = new Date(date);

      // Définir les limites de la journée
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Requête pour trouver les réservations pour cette date et cette heure
      const query = {
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        time: time,
      };

      // Si on met à jour une réservation, exclure la réservation actuelle
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      // Compter les réservations pour ce créneau
      const count = await Booking.countDocuments(query);

      // Maximum 1 réservation par créneau horaire
      return count === 0;
    } catch (error) {
      logger.error(
        "Erreur lors de la vérification de disponibilité du créneau:",
        error
      );
      throw new Error(
        "Erreur lors de la vérification de disponibilité du créneau"
      );
    }
  }

  /**
   * Retourne les créneaux horaires disponibles pour une date donnée
   * @param {Date} date - Date pour laquelle récupérer les créneaux
   * @returns {Promise<Array>} - Liste des créneaux disponibles
   */
  async getAvailableTimeSlots(date) {
    try {
      // Définir les horaires d'ouverture (9h-18h, créneaux d'une heure)
      const allTimeSlots = [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
      ];

      // Définir les limites de la journée
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Récupérer toutes les réservations pour cette date
      const bookings = await Booking.find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).select("time");

      // Extraire les créneaux déjà réservés
      const bookedTimeSlots = bookings.map((booking) => booking.time);

      // Filtrer pour ne garder que les créneaux disponibles
      const availableTimeSlots = allTimeSlots.filter(
        (timeSlot) => !bookedTimeSlots.includes(timeSlot)
      );

      return availableTimeSlots;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des créneaux disponibles:",
        error
      );
      throw new Error(
        "Erreur lors de la récupération des créneaux disponibles"
      );
    }
  }

  /**
   * Envoie un email de confirmation pour une réservation
   * @param {Object} booking - Objet de réservation
   * @returns {Promise<void>}
   */
  async sendConfirmationEmail(booking) {
    try {
      // Cette fonction serait implémentée avec un service d'envoi d'email comme NodeMailer
      // Pour l'instant, on simule juste l'envoi avec un log
      logger.info(
        `Email de confirmation envoyé à ${booking.clientEmail} pour la réservation du ${booking.date} à ${booking.time}`
      );

      // Mettre à jour le statut de la réservation
      booking.status = "confirmed";
      await booking.save();

      return true;
    } catch (error) {
      logger.error("Erreur lors de l'envoi de l'email de confirmation:", error);
      throw new Error("Erreur lors de l'envoi de l'email de confirmation");
    }
  }

  /**
   * Récupère les statistiques des réservations
   * @returns {Promise<Object>} - Statistiques de réservation
   */
  async getBookingStats() {
    try {
      // Total des réservations
      const totalBookings = await Booking.countDocuments();

      // Réservations par statut
      const bookingsByStatus = await Booking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Réservations par service
      const bookingsByService = await Booking.aggregate([
        {
          $group: {
            _id: "$service",
            count: { $sum: 1 },
          },
        },
      ]);

      // Réservations du mois en cours
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const bookingsThisMonth = await Booking.countDocuments({
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });

      return {
        totalBookings,
        bookingsByStatus: bookingsByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        bookingsByService: bookingsByService.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        bookingsThisMonth,
      };
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des statistiques de réservation:",
        error
      );
      throw new Error(
        "Erreur lors de la récupération des statistiques de réservation"
      );
    }
  }
}

module.exports = { BookingService };
