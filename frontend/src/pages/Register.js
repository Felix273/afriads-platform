import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'advertiser',
    first_name: '',
    last_name: '',
    company_name: '',
    country: 'Kenya',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/dashboard');
      return;
    }

    setError(result.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] px-4 py-8 text-[#151713] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#151713] text-sm font-black text-[#f7f5ef]">AA</span>
            <span className="text-lg font-semibold">AfriAds</span>
          </Link>
          <Link to="/login" className="btn-secondary">Sign in</Link>
        </div>

        <div className="grid overflow-hidden rounded-xl border border-black/10 bg-white lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="bg-[#151713] p-8 text-[#f7f5ef]">
            <p className="text-xs font-semibold uppercase text-[#9cbba9]">Create workspace</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Choose your side of the local ad marketplace.
            </h1>
            <div className="mt-10 grid gap-3 text-sm text-[#d9ddcf]">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                Advertisers fund a wallet, submit creatives, and buy verified local delivery.
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                Publishers submit websites, create ad zones, and request payouts.
              </div>
            </div>
          </aside>

          <main className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">Account details</h2>
            <p className="mt-2 text-sm text-[#5d6258]">Use real company information. Admin review depends on it.</p>

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label>
                <span className="form-label">Account type</span>
                <select name="user_type" value={formData.user_type} onChange={handleChange} className="form-input mt-2">
                  <option value="advertiser">Advertiser</option>
                  <option value="publisher">Publisher</option>
                </select>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="form-label">First name</span>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} required className="form-input mt-2" />
                </label>
                <label>
                  <span className="form-label">Last name</span>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} required className="form-input mt-2" />
                </label>
              </div>

              <label>
                <span className="form-label">Company name</span>
                <input name="company_name" value={formData.company_name} onChange={handleChange} className="form-input mt-2" />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="form-label">Email address</span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input mt-2" />
                </label>
                <label>
                  <span className="form-label">Country</span>
                  <select name="country" value={formData.country} onChange={handleChange} className="form-input mt-2">
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="South Africa">South Africa</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="form-label">Password</span>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input mt-2" />
                </label>
                <label>
                  <span className="form-label">Confirm password</span>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="form-input mt-2" />
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary justify-center">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Register;
