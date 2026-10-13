import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await API.post("/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center pt-24 pb-12 px-4">
      <div className="surface w-full max-w-sm p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-zinc-900 tracking-tight">Log in to DriveSpace</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="text-center text-zinc-500 text-sm mt-6">
          Don't have an account? <Link to="/register" className="text-zinc-900 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
