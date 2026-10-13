const express = require('express');
const {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require('../controllers/vehicleController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Need to merge params if we nest routes later (like /api/vehicles/:vehicleId/reviews)
const router = express.Router();

router.route('/')
    .get(getVehicles)
    .post(protect, authorize('Owner'), createVehicle);

router.route('/:id')
    .get(getVehicle)
    .put(protect, authorize('Owner'), updateVehicle)
    .delete(protect, authorize('Owner'), deleteVehicle);

module.exports = router;
