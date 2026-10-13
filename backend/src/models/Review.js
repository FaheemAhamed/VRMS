const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    customerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    comment: {
        type: String,
        required: [true, 'Please add a review comment']
    }
}, {
    timestamps: true
});

// Prevent user from submitting more than one review per vehicle (optional, based on requirement, usually good to have)
reviewSchema.index({ vehicleId: 1, customerId: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function(vehicleId) {
    const obj = await this.aggregate([
        {
            $match: { vehicleId: vehicleId }
        },
        {
            $group: {
                _id: '$vehicleId',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    try {
        await this.model('Vehicle').findByIdAndUpdate(vehicleId, {
            averageRating: obj[0] ? obj[0].averageRating : 0,
            reviewCount: obj[0] ? obj[0].reviewCount : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.vehicleId);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.vehicleId);
});

module.exports = mongoose.model('Review', reviewSchema);
