import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-luxury-charcoal border border-luxury-charcoal/80 p-8 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-luxury-black border border-luxury-gold/50 flex items-center justify-center mx-auto text-luxury-gold">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-ultra text-luxury-gold font-bold block">
            Security Control Portal
          </span>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            RAZA PALACE ADMIN
          </h1>
          <p className="text-xs text-gray-400">
            Authorized store administrators only. Access is cryptographically authenticated.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@razashoepalace.com"
                className="w-full p-3 pl-10 bg-luxury-black border border-luxury-charcoal text-white focus:outline-none focus:border-luxury-gold transition-colors"
              />
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-3 pl-10 bg-luxury-black border border-luxury-charcoal text-white focus:outline-none focus:border-luxury-gold transition-colors"
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-luxury-gold text-luxury-black text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold-light transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            <span>{loading ? 'Authenticating System...' : 'Enter Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-luxury-charcoal text-center text-xs text-gray-400">
          <Link to="/" className="text-luxury-gold hover:underline">
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
