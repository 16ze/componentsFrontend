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
 * @route   GET /api/booking
 * @desc    Récupérer toutes les réservations
 * @access  Private/Admin
 */
router.get("/", protect, admin, getBookings);

/**
 * @route   GET /api/booking/available
 * @desc    Récupérer les créneaux disponibles
 * @access  Public
 */
router.get("/available", getAvailableTimeSlots);

/**
 * @route   GET /api/booking/:id
 * @desc    Récupérer une réservation par son ID
 * @access  Private
 */
router.get("/:id", protect, getBookingById);

/**
 * @route   POST /api/booking
 * @desc    Créer une nouvelle réservation
 * @access  Public
 */
router.post("/", validateBookingData, createBooking);

/**
 * @route   PUT /api/booking/:id
 * @desc    Mettre à jour une réservation
 * @access  Private
 */
router.put("/:id", protect, validateBookingData, updateBooking);

/**
 * @route   DELETE /api/booking/:id
 * @desc    Supprimer une réservation
 * @access  Private/Admin
 */
router.delete("/:id", protect, admin, deleteBooking);

module.exports = router;
