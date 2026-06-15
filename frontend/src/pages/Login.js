// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) navigate('/dashboard');
    else setError(result.message || 'Login failed');
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#151713]">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden bg-[#151713] p-10 text-[#f7f5ef] lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f7f5ef] text-sm font-black text-[#151713]">AA</span>
            <span className="text-lg font-semibold">AfriAds</span>
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase text-[#9cbba9]">Operator access</p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight">
              Return to the campaign console.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#c8ccbd]">
              Manage wallets, campaign delivery, publisher supply, and approvals from a focused workspace.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm text-[#c8ccbd]">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">Verified supply</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">M-Pesa ready</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">Ad ops controls</div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md rounded-xl border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(21,23,19,0.10)] sm:p-8">
            <div className="mb-8 lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#151713] text-sm font-black text-[#f7f5ef]">AA</span>
                <span className="text-lg font-semibold">AfriAds</span>
              </Link>
            </div>

            <p className="section-kicker">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Access your workspace</h2>
            <p className="mt-2 text-sm text-[#5d6258]">Use your advertiser, publisher, or admin account.</p>

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label>
                <span className="form-label">Email address</span>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777c72]" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input pl-11"
                  />
                </div>
              </label>

              <label>
                <span className="form-label">Password</span>
                <div className="relative mt-2">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777c72]" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input pl-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#777c72] hover:bg-[#f7f5ef]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <button type="submit" disabled={loading} className="btn-primary justify-center">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#5d6258]">
              No account yet? <Link to="/register" className="font-semibold text-[#2f6f4e]">Create one</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
