const express = require("express");
const {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getAvailableTimeSlots,
} = require("../controllers/bookingController");
const { protect, admin } = require("../middleware/authMiddleware");
const { validateBookingData } = require("../middleware/validationMiddleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - date
 *         - time
 *         - service
 *         - clientName
 *         - clientEmail
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré de la réservation
 *         date:
 *           type: string
 *           format: date
 *           description: Date de la réservation (YYYY-MM-DD)
 *         time:
 *           type: string
 *           description: Heure de la réservation (HH:MM)
 *         service:
 *           type: string
 *           description: Type de service réservé
 *         clientName:
 *           type: string
 *           description: Nom du client
 *         clientEmail:
 *           type: string
 *           format: email
 *           description: Email du client
 *         clientPhone:
 *           type: string
 *           description: Numéro de téléphone du client
 *         message:
 *           type: string
 *           description: Message facultatif du client
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           default: pending
 *           description: Statut de la réservation
 *         user:
 *           type: string
 *           description: ID de l'utilisateur associé (si connecté)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 */

/**
 * @swagger
 * /booking:
 *   get:
 *     summary: Récupérer toutes les réservations
 *     description: Récupère la liste paginée des réservations. Réservé aux administrateurs.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des réservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.get("/", protect, admin, getBookings);

/**
 * @swagger
 * /booking/available:
 *   get:
 *     summary: Récupérer les créneaux disponibles
 *     description: Récupère les créneaux horaires disponibles pour une date donnée
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date au format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Créneaux horaires disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "10:00"
 *       400:
 *         description: Date non fournie ou invalide
 */
router.get("/available", getAvailableTimeSlots);

/**
 * @swagger
 * /booking/{id}:
 *   get:
 *     summary: Récupérer une réservation par ID
 *     description: Récupère les détails d'une réservation spécifique
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Détails de la réservation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Réservation non trouvée
 */
router.get("/:id", protect, getBookingById);

/**
 * @swagger
 * /booking:
 *   post:
 *     summary: Créer une nouvelle réservation
 *     description: Crée une nouvelle réservation avec les données fournies
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - time
 *               - service
 *               - clientName
 *               - clientEmail
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-01"
 *               time:
 *                 type: string
 *                 example: "10:00"
 *               service:
 *                 type: string
 *                 example: "Consultation"
 *               clientName:
 *                 type: string
 *                 example: "Jean Dupont"
 *               clientEmail:
 *                 type: string
 *                 format: email
 *                 example: "jean@example.com"
 *               clientPhone:
 *                 type: string
 *                 example: "0612345678"
 *               message:
 *                 type: string
 *                 example: "J'ai besoin d'un rendez-vous urgent."
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       400:
 *         description: Données invalides ou créneau non disponible
 */
router.post("/", validateBookingData, createBooking);

/**
 * @swagger
 * /booking/{id}:
 *   put:
 *     summary: Mettre à jour une réservation
 *     description: Met à jour les détails d'une réservation existante
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Réservation mise à jour avec succès
 *       400:
 *         description: Données invalides ou créneau non disponible
 *       404:
 *         description: Réservation non trouvée
 */
router.put("/:id", protect, validateBookingData, updateBooking);

/**
 * @swagger
 * /booking/{id}:
 *   delete:
 *     summary: Supprimer une réservation
 *     description: Supprime une réservation existante
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Réservation supprimée avec succès
 *       404:
 *         description: Réservation non trouvée
 */
router.delete("/:id", protect, admin, deleteBooking);

module.exports = router;
