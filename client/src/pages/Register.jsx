import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-ultra text-luxury-gold font-bold block mb-1">
          Membership Privileges
        </span>
        <h1 className="font-serif text-3xl font-bold text-luxury-black mb-2">
          Create Client Account
        </h1>
        <p className="text-xs text-luxury-muted">
          Enjoy express checkout, order timeline tracking, and invitations to private footwear releases.
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
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tariq Raza"
                className="w-full p-3 pl-10 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
              <User className="absolute left-3 top-3.5 w-4 h-4 text-luxury-muted" />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full p-3 pl-10 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-luxury-muted" />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full p-3 pl-10 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-luxury-muted" />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
              Password (min. 6 characters) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full p-3 pl-10 border border-luxury-gray focus:outline-none focus:border-luxury-gold"
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-luxury-muted" />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-luxury-black mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-luxury-gray text-xs">
          <p className="text-luxury-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-luxury-black hover:text-luxury-gold underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
