const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private (Customer only)
const addReview = async (req, res) => {
    try {
        const { vehicleId, rating, comment } = req.body;
        req.body.customerId = req.user.id;

        // Check if user has a completed booking for this vehicle
        const hasCompletedBooking = await Booking.findOne({
            vehicleId,
            customerId: req.user.id,
            status: 'Completed'
        });

        if (!hasCompletedBooking) {
            return res.status(400).json({ 
                success: false, 
                message: 'You can only review a vehicle after completing a rental' 
            });
        }

        // Check if user already reviewed (Schema index also prevents this, but good to handle explicitly for a nice message)
        const existingReview = await Review.findOne({ vehicleId, customerId: req.user.id });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this vehicle'
            });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get reviews for a vehicle
// @route   GET /api/reviews/:vehicleId
// @access  Public
const getVehicleReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ vehicleId: req.params.vehicleId })
            .populate('customerId', 'name');

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Customer only)
const updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Make sure review belongs to user
        if (review.customerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update review' });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // We need to trigger the post save hook to recalculate avg rating, findByIdAndUpdate doesn't trigger hooks
        await review.save(); // Just calling save() to trigger hook

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = {
    addReview,
    getVehicleReviews,
    updateReview
};
