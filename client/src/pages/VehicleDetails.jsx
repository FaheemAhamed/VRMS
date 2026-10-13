import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { MapPin, Check, X } from 'lucide-react';

const categoryImages = {
  Car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
  SUV: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
  Bike: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  Van: 'https://i.pinimg.com/736x/56/09/30/56093017cf3cdfe00f024b11a8c88499.jpg',
  Default: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
};

const getImageUrl = (vehicle) => {
  const genericImg = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
  if (vehicle.images && vehicle.images[0] && vehicle.images[0] !== genericImg) {
    return vehicle.images[0];
  }
  return categoryImages[vehicle.type] || categoryImages.Default;
};

const VehicleDetails = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const [vehicleRes, reviewsRes] = await Promise.all([
          API.get(`/vehicles/${id}`),
          API.get(`/reviews/${id}`)
        ]);
        
        setVehicle(vehicleRes.data.data);
        setReviews(reviewsRes.data.data);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const rentalsRes = await API.get('/bookings/my-rentals');
            const hasCompleted = rentalsRes.data.data.some(
              booking => {
                const bId = booking.vehicleId?._id || booking.vehicleId;
                return bId === id && ['Approved', 'Active', 'Completed'].includes(booking.status);
              }
            );
            setCanReview(hasCompleted);
          } catch (e) {}
        }
      } catch (err) {
        setError('Failed to fetch vehicle details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleDetails();
  }, [id]);

  const initiateBooking = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    setBookingError('');
    setBookingLoading(true);
    try {
      await API.post('/bookings', {
        vehicleId: id,
        startDate,
        endDate
      });
      setShowBookingModal(false);
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book vehicle. Dates might be unavailable.');
      setShowBookingModal(false);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await API.post('/reviews', {
        vehicleId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      const storedUser = JSON.parse(localStorage.getItem('user')) || { name: 'You' };
      setReviews([{...res.data.data, customerId: storedUser}, ...reviews]);
      setCanReview(false); 
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-zinc-500">Loading details...</div>;
  if (error) return <div className="py-24 text-center text-red-600">{error}</div>;
  if (!vehicle) return null;

  // Calculate price
  let days = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start <= end) {
      days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Image and Details */}
        <div className="lg:col-span-2 space-y-12">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200">
            <img 
              src={getImageUrl(vehicle)} 
              alt={vehicle.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{vehicle.name}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${vehicle.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {vehicle.isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <span>·</span>
              <span className="font-medium text-zinc-900">★ {vehicle.averageRating > 0 ? vehicle.averageRating.toFixed(1) : 'New'}</span>
              <span>·</span>
              <span className="underline">{vehicle.reviewCount || 0} reviews</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {vehicle.location}</span>
              <span>·</span>
              <span>Hosted by <strong className="text-zinc-700">{vehicle.ownerId?.name || 'Owner'}</strong></span>
            </div>
            
            <div className="py-6 border-y border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 mb-3">About this vehicle</h3>
              <p className="text-zinc-600 leading-relaxed">{vehicle.description}</p>
            </div>

            <div className="py-6 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Features</h3>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                {vehicle.features?.length > 0 ? vehicle.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-zinc-600 text-sm">
                    <Check size={16} className="text-zinc-400" /> {f}
                  </li>
                )) : (
                  <li className="text-zinc-500 text-sm">Standard features included</li>
                )}
              </ul>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="pt-4">
            <h3 className="text-2xl font-bold text-zinc-900 mb-6">Reviews</h3>
            
            {canReview && (
              <div className="surface p-6 rounded-lg mb-8">
                <h4 className="font-semibold text-zinc-900 mb-4">Share your experience</h4>
                <form onSubmit={handleReviewSubmit}>
                  {reviewError && <div className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded">{reviewError}</div>}
                  <div className="mb-4">
                    <label className="form-label">Rating</label>
                    <select className="form-input" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: e.target.value})}>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Review</label>
                    <textarea className="form-input min-h-[100px] resize-y" required value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-zinc-500">No reviews yet.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review._id} className="pb-6 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-zinc-900">{review.customerId?.name || 'User'}</div>
                      <span className="text-zinc-300">·</span>
                      <div className="text-sm text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm font-medium text-zinc-900 mb-2">★ {review.rating}.0</div>
                    <p className="text-zinc-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Booking Box */}
        <div>
          <div className="surface p-6 rounded-lg sticky top-24">
            <div className="mb-6">
              <span className="text-2xl font-bold text-zinc-900">₹{vehicle.dailyRentalPrice}</span>
              <span className="text-zinc-500"> / day</span>
            </div>

            {bookingSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-md border border-emerald-100 text-sm">
                <h4 className="font-bold mb-1">Booking Confirmed!</h4>
                <p>Your request has been sent to the owner.</p>
                <Link to="/dashboard" className="block mt-3 underline font-medium">View my rentals</Link>
              </div>
            ) : (
              <form onSubmit={initiateBooking} className="space-y-4">
                {bookingError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{bookingError}</div>}
                
                <div className="grid grid-cols-2 gap-3 border border-zinc-300 rounded-md p-1">
                  <div className="relative px-3 py-2 border-r border-zinc-200">
                    <label className="block text-xs font-bold uppercase text-zinc-700">Check-in</label>
                    <input 
                      type="date" 
                      required
                      className="w-full text-sm outline-none bg-transparent"
                      min={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="relative px-3 py-2">
                    <label className="block text-xs font-bold uppercase text-zinc-700">Check-out</label>
                    <input 
                      type="date" 
                      required
                      className="w-full text-sm outline-none bg-transparent"
                      min={startDate || new Date().toISOString().split('T')[0]}
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {days > 0 && (
                  <div className="py-4 space-y-3 text-sm text-zinc-600">
                    <div className="flex justify-between">
                      <span>₹{vehicle.dailyRentalPrice} x {days} nights</span>
                      <span>₹{vehicle.dailyRentalPrice * days}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 pt-3 font-semibold text-zinc-900">
                      <span>Total</span>
                      <span>₹{vehicle.dailyRentalPrice * days}</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary w-full py-3 text-base"
                  disabled={!localStorage.getItem('token')}
                >
                  Request to Book
                </button>
                
                {!localStorage.getItem('token') && (
                  <p className="text-center text-xs text-zinc-500 mt-2">
                    <Link to="/login" className="underline hover:text-zinc-900">Log in</Link> to book this vehicle.
                  </p>
                )}
                <p className="text-center text-xs text-zinc-500">You won't be charged yet.</p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="surface w-full max-w-md p-6 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-zinc-900">Confirm Booking</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-zinc-400 hover:text-zinc-900"><X size={20}/></button>
            </div>
            <div className="space-y-4 mb-6 text-zinc-600 text-sm">
              <p>You are requesting to book <strong className="text-zinc-900">{vehicle.name}</strong>.</p>
              <div className="flex justify-between py-2 border-y border-zinc-100">
                <span>Dates:</span>
                <span className="font-medium text-zinc-900">{startDate} to {endDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span>Total Cost:</span>
                <span className="font-bold text-zinc-900">₹{vehicle.dailyRentalPrice * days}</span>
              </div>
              <p className="text-xs text-zinc-500">The owner ({vehicle.ownerId?.name || 'Owner'}) will review your request. You won't be charged until it is accepted.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowBookingModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={confirmBooking} className="btn btn-primary flex-1" disabled={bookingLoading}>
                {bookingLoading ? 'Confirming...' : 'Confirm Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;
