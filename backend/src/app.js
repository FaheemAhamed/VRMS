const express = require('express');
const cors = require('cors');

// Route files
const auth = require('./routes/authRoutes');
const vehicles = require('./routes/vehicleRoutes');
const bookings = require('./routes/bookingRoutes');
const reviews = require('./routes/reviewRoutes');
const notifications = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/vehicles', vehicles);
app.use('/api/bookings', bookings);
app.use('/api/reviews', reviews);
app.use('/api/notifications', notifications);

app.get('/api', (req, res) => {
    res.send('Vehicle Rental API is running...');
});

module.exports = app;
