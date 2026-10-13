import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Bell, CheckCircle } from 'lucide-react';
import API from '../api/axiosInstance';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token');

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchNotifications();
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.log('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.log('Failed to mark notification as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
        <Link to="/" className="text-lg font-bold text-zinc-900 tracking-tight">
          DriveSpace.
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Discover</Link>
          
          {token && user ? (
            <>
              {user.role === 'Owner' && (
                <Link to="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">My Vehicles</Link>
              )}
              {user.role === 'Customer' && (
                <Link to="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">My Rentals</Link>
              )}
              <div className="flex items-center gap-3 pl-8 border-l border-zinc-200">
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)} 
                    className="relative text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-md shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <h3 className="font-semibold text-zinc-900">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-zinc-500">No notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif._id} className={`px-4 py-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                            <p className="text-sm text-zinc-800">{notif.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-zinc-500">{new Date(notif.createdAt).toLocaleDateString()}</span>
                              {!notif.read && (
                                <button onClick={() => markAsRead(notif._id)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                  <CheckCircle size={12}/> Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end ml-2">
                  <span className="text-sm font-medium text-zinc-900 leading-none">{user.name}</span>
                  <span className="text-xs text-zinc-500 mt-1">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="text-zinc-400 hover:text-zinc-900 transition-colors ml-2" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-zinc-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-6 py-4 space-y-4">
          <Link to="/" className="block text-sm font-medium text-zinc-700">Discover</Link>
          {token && user ? (
            <>
              {user.role === 'Owner' && <Link to="/dashboard" className="block text-sm font-medium text-zinc-700">My Vehicles</Link>}
              {user.role === 'Customer' && <Link to="/dashboard" className="block text-sm font-medium text-zinc-700">My Rentals</Link>}
              <hr className="border-zinc-100" />
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-zinc-900">{user.name}</div>
                  <div className="text-xs text-zinc-500">{user.role}</div>
                </div>
                <button onClick={handleLogout} className="text-sm text-zinc-500 flex items-center gap-1">
                  <LogOut size={16}/> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
              <Link to="/login" className="btn btn-secondary w-full">Log in</Link>
              <Link to="/register" className="btn btn-primary w-full">Sign up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
