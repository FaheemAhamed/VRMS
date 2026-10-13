import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';

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

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist,setWishlist] = useState([]);

  const [filters, setFilters] = useState({ query: '', type: 'All', location: '', minPrice: '', maxPrice: '', startDate: '', endDate: '' });

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        let url = '/vehicles';
        if (filters.startDate && filters.endDate) {
          url += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
        }
        const response = await API.get(url);
        setVehicles(response.data.data);
      } catch (err) {
        setError('Failed to fetch vehicles.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    let result = vehicles;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(q) || 
        (v.ownerId?.name || '').toLowerCase().includes(q)
      );
    }
    if (filters.type !== 'All') {
      result = result.filter(v => v.type === filters.type);
    }
    if (filters.location) {
      result = result.filter(v => v.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.minPrice) {
      result = result.filter(v => v.dailyRentalPrice >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(v => v.dailyRentalPrice <= Number(filters.maxPrice));
    }
    setFilteredVehicles(result);
  }, [filters, vehicles]); 

  const wishlistHandler = (idx) => {
    const selectedVehicle = vehicles.filter(function(elem){
      return elem._id == idx;
    }) 

    setWishlist((prev) => ([...prev,...selectedVehicle]));
    console.log(wishlist);
  }

  if (loading) return <div className="py-24 text-center text-zinc-500">Loading vehicles...</div>;
  if (error) return <div className="py-24 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight mb-4">Discover your next ride.</h1>
        
        {/* Filters */}
        <div className="flex flex-col gap-3 mt-8 bg-white p-3 md:p-4 rounded-lg border border-zinc-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center px-3 border border-zinc-200 rounded bg-zinc-50 focus-within:border-zinc-400 transition-colors">
              <Search size={18} className="text-zinc-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search vehicle or owner..." 
                className="w-full py-2 bg-transparent focus:outline-none text-sm text-zinc-900 placeholder:text-zinc-400"
                value={filters.query}
                onChange={e => setFilters({...filters, query: e.target.value})}
              />
            </div>
            <div className="flex items-center px-3 border border-zinc-200 rounded bg-zinc-50 focus-within:border-zinc-400 transition-colors">
              <MapPin size={18} className="text-zinc-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Location..." 
                className="w-full py-2 bg-transparent focus:outline-none text-sm text-zinc-900 placeholder:text-zinc-400"
                value={filters.location}
                onChange={e => setFilters({...filters, location: e.target.value})}
              />
            </div>
            <div>
              <select 
                className="w-full py-2.5 px-3 border border-zinc-200 rounded bg-zinc-50 focus:outline-none text-sm text-zinc-900 cursor-pointer focus:border-zinc-400 transition-colors"
                value={filters.type}
                onChange={e => setFilters({...filters, type: e.target.value})}
              >
                <option value="All">All Types</option>
                <option value="Car">Car</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
                <option value="Bike">Bike</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center px-3 border border-zinc-200 rounded bg-zinc-50 focus-within:border-zinc-400 transition-colors">
              <span className="text-zinc-400 text-sm mr-2">₹</span>
              <input 
                type="number" 
                placeholder="Min Price" 
                className="w-full py-2 bg-transparent focus:outline-none text-sm text-zinc-900 placeholder:text-zinc-400"
                value={filters.minPrice}
                onChange={e => setFilters({...filters, minPrice: e.target.value})}
              />
            </div>
            <div className="flex items-center px-3 border border-zinc-200 rounded bg-zinc-50 focus-within:border-zinc-400 transition-colors">
              <span className="text-zinc-400 text-sm mr-2">₹</span>
              <input 
                type="number" 
                placeholder="Max Price" 
                className="w-full py-2 bg-transparent focus:outline-none text-sm text-zinc-900 placeholder:text-zinc-400"
                value={filters.maxPrice}
                onChange={e => setFilters({...filters, maxPrice: e.target.value})}
              />
            </div>
            <div className="flex items-center px-3 border border-zinc-200 rounded bg-zinc-50 focus-within:border-zinc-400 transition-colors">
              <span className="text-zinc-400 text-xs font-bold uppercase mr-2 shrink-0">From</span>
              <input 
                type="date" 
                title="Start Date"
                className="w-full py-2 bg-transparent focus:outline-none text-sm text-zinc-700"
                min={new Date().toISOString().split('T')[0]}
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="flex items-center px-3 border border-zinc-200 rounded bg-zinc-50 focus-within:border-zinc-400 transition-colors">
              <span className="text-zinc-400 text-xs font-bold uppercase mr-2 shrink-0">To</span>
              <input 
                type="date" 
                title="End Date"
                className="w-full py-2 bg-transparent focus:outline-none text-sm text-zinc-700"
                min={filters.startDate || new Date().toISOString().split('T')[0]}
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
        </div>
      </header>
      
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-24 text-zinc-500 border border-dashed border-zinc-200 rounded-lg">
          No vehicles found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map(vehicle => (
            <Link key={vehicle._id} to={`/vehicle/${vehicle._id}`} className="group flex flex-col">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg mb-4 bg-zinc-100 relative">
                <img 
                  src={getImageUrl(vehicle)} 
                  alt={vehicle.name} 
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!vehicle.isAvailable ? 'grayscale opacity-70' : ''}`} 
                />
                {!vehicle.isAvailable && (
                  <div className="absolute top-3 right-3 bg-zinc-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded backdrop-blur-md shadow-sm">
                    Unavailable
                  </div>
                )}
              </div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-zinc-900 text-lg leading-tight group-hover:underline">{vehicle.name}</h3>
                <div className="flex items-center gap-1 text-sm font-medium text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                  ★ {vehicle.averageRating > 0 ? `${vehicle.averageRating.toFixed(1)}` : 'New'}
                </div>
              </div>
              <p className="text-xs text-zinc-500 mb-3 truncate">{vehicle.type} · {vehicle.location} · {vehicle.ownerId?.name || 'Owner'}</p>
              <div className="mt-auto pt-2 flex items-center justify-between border-t border-zinc-100">
                <div>
                  <span className="font-semibold text-zinc-900">₹{vehicle.dailyRentalPrice}</span>
                  <span className="text-zinc-500 text-sm"> / day</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${vehicle.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <button onClick={() => wishlistHandler(vehicle._id)}>Add to Wishlist</button>
              </div> 

              <div >
                {wishlist.map((ele) => (
                  <>
                    {console.log(ele)}
                  </>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
