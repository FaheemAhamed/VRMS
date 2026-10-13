const express = require('express');
const {
    addReview,
    getVehicleReviews,
    updateReview
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Customer'), addReview);
router.get('/:vehicleId', getVehicleReviews);
router.put('/:id', protect, authorize('Customer'), updateReview);

module.exports = router;
