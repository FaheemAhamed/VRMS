import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { X, CheckCircle, XCircle } from 'lucide-react';
import OwnerVehicles from '../components/OwnerVehicles';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('');
  
  // Modals state for Owner
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state for Customer
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Generic Modals
  const [alertDialog, setAlertDialog] = useState({ show: false, message: '', type: 'error' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
        
        if (storedUser?.role === 'Owner') {
          setActiveTab('bookings');
          const res = await API.get('/bookings/manage');
          setBookings(res.data.data);
        } else if (storedUser?.role === 'Customer') {
          setActiveTab('current');
          const res = await API.get('/bookings/my-rentals');
          setBookings(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAction = async (status) => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await API.patch(`/bookings/${selectedBooking._id}/status`, { status });
      // Update local state
      setBookings(bookings.map(b => b._id === selectedBooking._id ? { ...b, status } : b));
      setShowAcceptModal(false);
    } catch (err) {
      setAlertDialog({ show: true, message: err.response?.data?.message || 'Action failed.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectStatusUpdate = (id, status) => {
    setConfirmDialog({
      show: true,
      message: `Are you sure you want to mark this booking as ${status}?`,
      onConfirm: async () => {
        setConfirmDialog({ show: false, message: '', onConfirm: null });
        setActionLoading(true);
        try {
          await API.patch(`/bookings/${id}/status`, { status });
          setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
        } catch (err) {
          setAlertDialog({ show: true, message: err.response?.data?.message || 'Status update failed.', type: 'error' });
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const openAcceptModal = (booking) => {
    setSelectedBooking(booking);
    setShowAcceptModal(true);
  };

  const openReviewModal = async (booking) => {
    setSelectedBooking(booking);
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');
    setExistingReviewId(null);
    setShowReviewModal(true);
    setReviewLoading(true);

    try {
      const res = await API.get(`/reviews/${booking.vehicleId._id}`);
      const reviews = res.data.data;
      const myReview = reviews.find(r => r.customerId._id === user.id || r.customerId === user.id);
      if (myReview) {
        setExistingReviewId(myReview._id);
        setReviewForm({ rating: myReview.rating, comment: myReview.comment });
      }
    } catch (err) {
      console.log('Failed to fetch existing reviews', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError('');
    try {
      if (existingReviewId) {
        await API.put(`/reviews/${existingReviewId}`, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment
        });
        setShowReviewModal(false);
        setAlertDialog({ show: true, message: 'Review updated successfully!', type: 'success' });
      } else {
        await API.post('/reviews', {
          vehicleId: selectedBooking.vehicleId._id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment
        });
        setShowReviewModal(false);
        setAlertDialog({ show: true, message: 'Review submitted successfully!', type: 'success' });
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-zinc-500">Loading dashboard...</div>;
  if (!user) return <div className="py-24 text-center text-zinc-500">Please log in.</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          {user.role === 'Owner' ? 'Owner Dashboard' : 'My Rentals'}
        </h1>
        {user.role === 'Owner' ? (
          <div className="flex gap-1 bg-zinc-100 p-1 rounded-md">
            <button 
              onClick={() => setActiveTab('bookings')} 
              className={`px-4 py-1.5 text-sm font-medium rounded ${activeTab === 'bookings' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Bookings
            </button>
            <button 
              onClick={() => setActiveTab('vehicles')} 
              className={`px-4 py-1.5 text-sm font-medium rounded ${activeTab === 'vehicles' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              My Vehicles
            </button>
          </div>
        ) : (
          <div className="flex gap-1 bg-zinc-100 p-1 rounded-md">
            <button 
              onClick={() => setActiveTab('current')} 
              className={`px-4 py-1.5 text-sm font-medium rounded ${activeTab === 'current' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Current Rentals
            </button>
            <button 
              onClick={() => setActiveTab('previous')} 
              className={`px-4 py-1.5 text-sm font-medium rounded ${activeTab === 'previous' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              Previous Rentals
            </button>
          </div>
        )}
      </div>
      {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6">{error}</div>}

      {user.role === 'Owner' && activeTab === 'vehicles' ? (
        <OwnerVehicles />
      ) : (
        (() => {
          let displayedBookings = bookings;
          if (user?.role === 'Customer') {
            if (activeTab === 'current') {
              displayedBookings = bookings.filter(b => ['Pending', 'Approved', 'Active'].includes(b.status));
            } else if (activeTab === 'previous') {
              displayedBookings = bookings.filter(b => ['Completed', 'Rejected', 'Cancelled'].includes(b.status));
            }
          }

          return (
            <>
              {displayedBookings.length === 0 ? (
                <div className="surface p-12 text-center rounded-lg text-zinc-500">
                  No bookings found in this section.
                </div>
              ) : (
                <div className="surface rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-sm font-semibold text-zinc-900">Vehicle</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-900">Dates</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-900">Total (INR)</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-900">
                  {user.role === 'Owner' ? 'Customer' : 'Owner'}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-900">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-zinc-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {displayedBookings.map(booking => (
                <tr key={booking._id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/vehicle/${booking.vehicleId?._id}`} className="font-medium text-zinc-900 hover:underline">
                      {booking.vehicleId?.name || 'Unknown Vehicle'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                    ₹{booking.totalCost}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {user.role === 'Owner' 
                      ? (booking.customerId?.name || 'Unknown')
                      : (booking.vehicleId?.ownerId?.name || 'Unknown')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${booking.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                        booking.status === 'Approved' || booking.status === 'Active' || booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {user.role === 'Owner' && booking.status === 'Pending' && (
                      <button 
                        onClick={() => openAcceptModal(booking)}
                        className="btn btn-primary px-3 py-1.5 text-xs"
                      >
                        Review Request
                      </button>
                    )}
                    {user.role === 'Owner' && booking.status === 'Approved' && (
                      <button 
                        onClick={() => handleDirectStatusUpdate(booking._id, 'Active')}
                        className="btn btn-secondary px-3 py-1.5 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        disabled={actionLoading}
                      >
                        Start Rental
                      </button>
                    )}
                    {user.role === 'Owner' && booking.status === 'Active' && (
                      <button 
                        onClick={() => handleDirectStatusUpdate(booking._id, 'Completed')}
                        className="btn btn-secondary px-3 py-1.5 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                        disabled={actionLoading}
                      >
                        Mark Completed
                      </button>
                    )}
                    {user.role === 'Customer' && ['Pending', 'Approved'].includes(booking.status) && (
                      <button 
                        onClick={() => handleDirectStatusUpdate(booking._id, 'Cancelled')}
                        className="btn btn-secondary px-3 py-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50"
                        disabled={actionLoading}
                      >
                        Cancel Booking
                      </button>
                    )}
                    {user.role === 'Customer' && booking.status === 'Completed' && (
                      <button 
                        onClick={() => openReviewModal(booking)}
                        className="btn btn-primary px-3 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800"
                      >
                        Review Vehicle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
            </>
          );
        })()
      )}

      {/* Owner Accept/Reject Modal */}
      {showAcceptModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="surface w-full max-w-md p-6 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-zinc-900">Booking Request</h3>
              <button onClick={() => setShowAcceptModal(false)} className="text-zinc-400 hover:text-zinc-900"><X size={20}/></button>
            </div>
            <div className="space-y-4 mb-8 text-zinc-600 text-sm">
              <p>
                <strong className="text-zinc-900">{selectedBooking.customerId?.name}</strong> has requested to book 
                <strong className="text-zinc-900"> {selectedBooking.vehicleId?.name}</strong>.
              </p>
              <div className="bg-zinc-50 p-4 rounded-md border border-zinc-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dates</span>
                  <span className="font-medium text-zinc-900">{new Date(selectedBooking.startDate).toLocaleDateString()} to {new Date(selectedBooking.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Earnings</span>
                  <span className="font-bold text-emerald-600">₹{selectedBooking.totalCost}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500">Accepting this will notify the customer that their booking is approved.</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleAction('Rejected')} 
                className="btn btn-secondary flex-1 text-red-600 hover:bg-red-50 hover:border-red-200"
                disabled={actionLoading}
              >
                Reject
              </button>
              <button 
                onClick={() => handleAction('Approved')} 
                className="btn btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700" 
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Accept Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="surface w-full max-w-md p-6 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-zinc-900">
                {existingReviewId ? 'Edit Your Review' : `Review ${selectedBooking.vehicleId?.name}`}
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-zinc-400 hover:text-zinc-900"><X size={20}/></button>
            </div>
            {reviewLoading ? (
              <div className="py-8 text-center text-zinc-500">Loading your review...</div>
            ) : (
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
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1" disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Submitting...' : (existingReviewId ? 'Update Review' : 'Submit Review')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertDialog.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="surface w-full max-w-sm p-6 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200 text-center">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${alertDialog.type === 'error' ? 'bg-red-100' : 'bg-emerald-100'}`}>
              {alertDialog.type === 'error' ? <XCircle className="h-6 w-6 text-red-600" /> : <CheckCircle className="h-6 w-6 text-emerald-600" />}
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">{alertDialog.type === 'error' ? 'Error' : 'Success'}</h3>
            <p className="text-sm text-zinc-600 mb-6">{alertDialog.message}</p>
            <button onClick={() => setAlertDialog({ show: false, message: '', type: 'error' })} className="btn btn-primary w-full py-2">
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="surface w-full max-w-sm p-6 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Confirm Action</h3>
            <p className="text-sm text-zinc-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={confirmDialog.onConfirm} className="btn btn-primary flex-1">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
