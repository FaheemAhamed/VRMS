import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { Plus, Edit2, Trash2, X, CheckCircle, XCircle } from 'lucide-react';

const OwnerVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: '',
    type: 'Car',
    registrationNumber: '',
    dailyRentalPrice: '',
    location: '',
    features: '',
    isAvailable: true
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Generic Modals
  const [alertDialog, setAlertDialog] = useState({ show: false, message: '', type: 'error' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });

  const fetchVehicles = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      // Fetch all and filter client side to be safe
      const res = await API.get('/vehicles');
      const myVehicles = res.data.data.filter(v => (v.ownerId?._id || v.ownerId) === storedUser.id);
      setVehicles(myVehicles);
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '', description: '', images: '', type: 'Car', 
      registrationNumber: '', dailyRentalPrice: '', location: '', 
      features: '', isAvailable: true
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setModalMode('edit');
    setEditingId(v._id);
    setFormData({
      name: v.name,
      description: v.description,
      images: v.images.join(', '),
      type: v.type,
      registrationNumber: v.registrationNumber,
      dailyRentalPrice: v.dailyRentalPrice,
      location: v.location,
      features: (v.features || []).join(', '),
      isAvailable: v.isAvailable
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError('');
    try {
      const payload = {
        ...formData,
        dailyRentalPrice: Number(formData.dailyRentalPrice),
        images: formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        features: formData.features ? formData.features.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      if (modalMode === 'add') {
        await API.post('/vehicles', payload);
      } else {
        await API.put(`/vehicles/${editingId}`, payload);
      }
      
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      show: true,
      message: "Are you sure you want to delete this vehicle? It cannot be undone.",
      onConfirm: async () => {
        setConfirmDialog({ show: false, message: '', onConfirm: null });
        try {
          await API.delete(`/vehicles/${id}`);
          fetchVehicles();
        } catch (err) {
          setAlertDialog({ show: true, message: err.response?.data?.message || 'Failed to delete vehicle. It may have active bookings.', type: 'error' });
        }
      }
    });
  };

  const toggleAvailability = async (v) => {
    try {
      await API.put(`/vehicles/${v._id}`, { isAvailable: !v.isAvailable });
      fetchVehicles();
    } catch (err) {
      setAlertDialog({ show: true, message: 'Failed to update status', type: 'error' });
    }
  };

  if (loading) return <div className="py-12 text-center text-zinc-500">Loading vehicles...</div>;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-900">My Vehicles</h2>
        <button onClick={openAddModal} className="btn btn-primary flex items-center gap-1 py-1.5 px-3 text-sm">
          <Plus size={16} /> Add Vehicle
        </button>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      {vehicles.length === 0 ? (
        <div className="surface p-12 text-center rounded-lg text-zinc-500">
          You haven't listed any vehicles yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(v => (
            <div key={v._id} className="surface flex flex-col rounded-lg overflow-hidden border border-zinc-200">
              <div className="aspect-[4/3] bg-zinc-100 relative">
                <img 
                  src={v.images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'} 
                  alt={v.name} 
                  className={`w-full h-full object-cover ${!v.isAvailable ? 'grayscale opacity-60' : ''}`}
                />
                {!v.isAvailable && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Unavailable</div>
                )}
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-zinc-900">{v.name}</h3>
                  <span className="font-semibold text-zinc-900">₹{v.dailyRentalPrice}/d</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">{v.type} · {v.location}</p>
                
                <div className="mt-auto pt-4 border-t border-zinc-100 flex justify-between items-center">
                  <button 
                    onClick={() => toggleAvailability(v)} 
                    className={`text-xs font-medium ${v.isAvailable ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                  >
                    Mark {v.isAvailable ? 'Unavailable' : 'Available'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(v)} className="text-zinc-500 hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(v._id)} className="text-zinc-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="surface w-full max-w-2xl p-6 rounded-lg shadow-xl relative my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900">{modalMode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{formError}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name / Model</label>
                  <input type="text" required className="form-input" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Registration Number</label>
                  <input type="text" required className="form-input" value={formData.registrationNumber} onChange={e=>setFormData({...formData, registrationNumber: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Daily Rental Price (INR)</label>
                  <input type="number" required min="1" className="form-input" value={formData.dailyRentalPrice} onChange={e=>setFormData({...formData, dailyRentalPrice: e.target.value})} />
                </div>
                
                <div>
                  <label className="form-label">Location (City)</label>
                  <input type="text" required className="form-input" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" checked={formData.isAvailable} onChange={e=>setFormData({...formData, isAvailable: e.target.checked})} />
                    <span className="text-sm font-medium text-zinc-700">Currently Available for Rent</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea required className="form-input resize-y min-h-[80px]" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div>
                <label className="form-label">Features (comma separated)</label>
                <input type="text" placeholder="e.g. Automatic, AC, GPS, 5 seats" className="form-input" value={formData.features} onChange={e=>setFormData({...formData, features: e.target.value})} />
              </div>
              
              <div>
                <label className="form-label">Image URLs (comma separated)</label>
                <input type="text" placeholder="Leave empty for category default, or enter URLs" className="form-input" value={formData.images} onChange={e=>setFormData({...formData, images: e.target.value})} />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
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

export default OwnerVehicles;
