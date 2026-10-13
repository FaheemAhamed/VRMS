const express = require('express');
const {
    createBooking,
    getMyRentals,
    getManagedBookings,
    updateBookingStatus
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Customer'), createBooking);
router.get('/my-rentals', protect, authorize('Customer'), getMyRentals);
router.get('/manage', protect, authorize('Owner'), getManagedBookings);
router.patch('/:id/status', protect, updateBookingStatus);

module.exports = router;
