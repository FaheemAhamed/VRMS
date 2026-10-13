const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer only)
const createBooking = async (req, res) => {
    try {
        const { vehicleId, startDate, endDate } = req.body;

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Calculate total cost
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // at least 1 day
        const totalCost = diffDays * vehicle.dailyRentalPrice;

        // Check for overlapping bookings
        const overlappingBookings = await Booking.find({
            vehicleId,
            status: { $in: ['Pending', 'Approved', 'Active'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vehicle is already booked for these dates' 
            });
        }

        const booking = await Booking.create({
            vehicleId,
            customerId: req.user.id,
            startDate: start,
            endDate: end,
            totalCost
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get customer's rentals
// @route   GET /api/bookings/my-rentals
// @access  Private (Customer only)
const getMyRentals = async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user.id })
            .populate({
                path: 'vehicleId',
                select: 'name type images dailyRentalPrice location ownerId',
                populate: {
                    path: 'ownerId',
                    select: 'name email'
                }
            });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get owner's managed bookings
// @route   GET /api/bookings/manage
// @access  Private (Owner only)
const getManagedBookings = async (req, res) => {
    try {
        // Find all vehicles owned by this user
        const vehicles = await Vehicle.find({ ownerId: req.user.id });
        const vehicleIds = vehicles.map(v => v._id);

        const bookings = await Booking.find({ vehicleId: { $in: vehicleIds } })
            .populate('vehicleId', 'name registrationNumber')
            .populate('customerId', 'name email');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Owner or Customer based on status)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id).populate('vehicleId');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Authorization checks
        if (req.user.role === 'Customer') {
            // Customers can only cancel their own pending/approved bookings
            if (booking.customerId.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
            if (status !== 'Cancelled') {
                return res.status(403).json({ success: false, message: 'Customers can only cancel bookings' });
            }
            if (!['Pending', 'Approved'].includes(booking.status)) {
                return res.status(400).json({ success: false, message: 'Can only cancel pending or approved bookings' });
            }
        } else if (req.user.role === 'Owner') {
            // Owners can manage bookings for their vehicles
            if (booking.vehicleId.ownerId.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
            // Owners shouldn't normally be setting it to 'Cancelled', but maybe they can 'Reject'
            const allowedOwnerStatuses = ['Approved', 'Rejected', 'Active', 'Completed'];
            if (!allowedOwnerStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status update for owner' });
            }
        }

        booking.status = status;
        await booking.save();

        if (status === 'Cancelled' && req.user.role === 'Customer') {
            const Notification = require('../models/Notification');
            const User = require('../models/User');
            const customer = await User.findById(req.user.id);
            await Notification.create({
                userId: booking.vehicleId.ownerId,
                message: `Customer ${customer.name} has cancelled their booking for ${booking.vehicleId.name}.`
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = {
    createBooking,
    getMyRentals,
    getManagedBookings,
    updateBookingStatus
};
