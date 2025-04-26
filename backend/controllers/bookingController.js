const Booking = require("../models/bookingModel");
const asyncHandler = require("../middleware/asyncHandler");
const { BookingService } = require("../services/bookingService");

/**
 * @desc    Récupérer toutes les réservations
 * @route   GET /api/booking
 * @access  Private/Admin
 */
const getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const bookings = await Booking.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  const count = await Booking.countDocuments({});

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: bookings,
  });
});

/**
 * @desc    Récupérer une réservation par son ID
 * @route   GET /api/booking/:id
 * @access  Private
 */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }

  // Vérifier si l'utilisateur est autorisé à voir cette réservation
  if (
    !req.user.isAdmin &&
    booking.user.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Non autorisé à voir cette réservation");
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

/**
 * @desc    Récupérer les créneaux disponibles
 * @route   GET /api/booking/available
 * @access  Public
 */
const getAvailableTimeSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    res.status(400);
    throw new Error("Veuillez fournir une date");
  }

  const bookingService = new BookingService();
  const availableSlots = await bookingService.getAvailableTimeSlots(
    new Date(date)
  );

  res.status(200).json({
    success: true,
    data: availableSlots,
  });
});

/**
 * @desc    Créer une nouvelle réservation
 * @route   POST /api/booking
 * @access  Public
 */
const createBooking = asyncHandler(async (req, res) => {
  const { date, time, service, clientName, clientEmail, clientPhone, message } =
    req.body;

  // Vérifier si le créneau est disponible
  const bookingService = new BookingService();
  const isAvailable = await bookingService.isTimeSlotAvailable(date, time);

  if (!isAvailable) {
    res.status(400);
    throw new Error("Ce créneau horaire n'est plus disponible");
  }

  // Créer la réservation
  const booking = await Booking.create({
    date,
    time,
    service,
    clientName,
    clientEmail,
    clientPhone,
    message,
    user: req.user ? req.user._id : null,
  });

  // Envoyer un email de confirmation
  await bookingService.sendConfirmationEmail(booking);

  res.status(201).json({
    success: true,
    data: booking,
  });
});

/**
 * @desc    Mettre à jour une réservation
 * @route   PUT /api/booking/:id
 * @access  Private
 */
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }

  // Vérifier si l'utilisateur est autorisé à modifier cette réservation
  if (
    !req.user.isAdmin &&
    booking.user.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Non autorisé à modifier cette réservation");
  }

  // Si la date ou l'heure a changé, vérifier la disponibilité
  if (req.body.date !== booking.date || req.body.time !== booking.time) {
    const bookingService = new BookingService();
    const isAvailable = await bookingService.isTimeSlotAvailable(
      req.body.date,
      req.body.time,
      req.params.id // Exclure cette réservation de la vérification
    );

    if (!isAvailable) {
      res.status(400);
      throw new Error("Ce créneau horaire n'est plus disponible");
    }
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedBooking,
  });
});

/**
 * @desc    Supprimer une réservation
 * @route   DELETE /api/booking/:id
 * @access  Private/Admin
 */
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Réservation non trouvée");
  }

  await booking.remove();

  res.status(200).json({
    success: true,
    message: "Réservation supprimée",
  });
});

module.exports = {
  getBookings,
  getBookingById,
  getAvailableTimeSlots,
  createBooking,
  updateBooking,
  deleteBooking,
};
