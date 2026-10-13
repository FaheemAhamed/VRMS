const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// @desc    Get all vehicles (with filtering)
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude from direct match
        const removeFields = ['select', 'sort', 'page', 'limit', 'minPrice', 'maxPrice', 'startDate', 'endDate'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Vehicle.find(JSON.parse(queryStr)).populate({
            path: 'ownerId',
            select: 'name email'
        });

        // Handle Price Range
        if (req.query.minPrice || req.query.maxPrice) {
            const priceQuery = {};
            if (req.query.minPrice) priceQuery.$gte = req.query.minPrice;
            if (req.query.maxPrice) priceQuery.$lte = req.query.maxPrice;
            query = query.find({ dailyRentalPrice: priceQuery });
        }

        // Handle name/model search
        if (req.query.search) {
             query = query.find({ name: { $regex: req.query.search, $options: 'i' } });
        }
        
        // Handle Date Availability (Basic implementation)
        // If dates are provided, we find vehicles that do NOT have overlapping bookings
        if (req.query.startDate && req.query.endDate) {
            const requestedStart = new Date(req.query.startDate);
            const requestedEnd = new Date(req.query.endDate);
            
            // Find bookings that overlap
            const overlappingBookings = await Booking.find({
                status: { $in: ['Pending', 'Approved', 'Active'] },
                $or: [
                    { startDate: { $lte: requestedEnd }, endDate: { $gte: requestedStart } }
                ]
            });
            
            const bookedVehicleIds = overlappingBookings.map(b => b.vehicleId);
            query = query.find({ _id: { $nin: bookedVehicleIds } });
        }

        // Executing query
        const vehicles = await query;

        res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate({
            path: 'ownerId',
            select: 'name email'
        });

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        res.status(200).json({ success: true, data: vehicle });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Owner only)
const createVehicle = async (req, res) => {
    try {
        // Add user to req.body
        req.body.ownerId = req.user.id;

        const vehicle = await Vehicle.create(req.body);

        res.status(201).json({
            success: true,
            data: vehicle
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Owner only)
const updateVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Make sure user is vehicle owner
        if (vehicle.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this vehicle' });
        }

        vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: vehicle });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Owner only)
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Make sure user is vehicle owner
        if (vehicle.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this vehicle' });
        }

        // Check for active bookings before deleting
        const activeBookings = await Booking.find({
            vehicleId: vehicle._id,
            status: { $in: ['Pending', 'Approved', 'Active'] }
        });

        if (activeBookings.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete vehicle with active or pending bookings' 
            });
        }

        await vehicle.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle
};
