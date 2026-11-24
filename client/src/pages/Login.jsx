import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Client Concierge
        </span>
        <h1 className="font-serif text-3xl font-bold text-luxury-black mb-2">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-luxury-muted">
          Access your order history, saved sizes, and shipping preferences.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 border border-luxury-gray shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-3 pl-10 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-luxury-muted" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold uppercase tracking-wider text-luxury-black">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pl-10 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-luxury-muted" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-luxury hover:bg-luxury-gold hover:text-luxury-black transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-luxury-gray text-xs space-y-2">
          <p className="text-luxury-muted">
            New to Raza Shoe Palace?{' '}
            <Link to="/register" className="font-bold text-luxury-black hover:text-luxury-gold underline">
              Create an account
            </Link>
          </p>

          <p className="text-[11px] text-gray-400">
            Store Administrator?{' '}
            <Link to="/admin/login" className="text-luxury-gold hover:underline">
              Access Admin Console
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
