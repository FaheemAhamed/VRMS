const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a vehicle name or model'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a detailed description']
    },
    images: {
        type: [String], // Array of image URLs
        required: [true, 'Please add at least one image']
    },
    type: {
        type: String,
        enum: ['Car', 'SUV', 'Bike', 'Van'],
        required: [true, 'Please specify the vehicle type']
    },
    registrationNumber: {
        type: String,
        required: [true, 'Please add a registration number'],
        unique: true
    },
    dailyRentalPrice: {
        type: Number,
        required: [true, 'Please add a daily rental price']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    features: {
        type: [String],
        default: []
    },
    ownerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
