import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axiosInstance';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Customer' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const response = await API.post('/auth/register', formData);
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center pt-24 pb-12 px-4">
      <div className="surface w-full max-w-sm p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-zinc-900 tracking-tight">Create an account</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-700 p-3 rounded mb-6 text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required minLength="6" />
          </div>
          <div>
            <label className="form-label">I am a...</label>
            <select name="role" className="form-input" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}>
              <option value="Customer">Customer (Looking to rent)</option>
              <option value="Owner">Vehicle Owner (Looking to list)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Registering...' : 'Sign up'}
          </button>
        </form>
        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-zinc-900 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
