// src/pages/PublisherDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BadgeDollarSign, CheckCircle2, Code2, Eye, Globe2, MousePointerClick, Plus, WalletCards } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const PublisherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [stats, setStats] = useState({
    totalWebsites: 0,
    activeWebsites: 0,
    totalEarnings: 0,
    totalImpressions: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: '',
    monthly_visitors: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadWebsites = async () => {
    try {
      const response = await api.get('/publisher/websites');

      const websitesData = response.data.data || [];
      setWebsites(websitesData);
      setStats({
        totalWebsites: websitesData.length,
        activeWebsites: websitesData.filter((website) => website.status === 'approved' || website.status === 'active').length,
        totalEarnings: websitesData.reduce((sum, website) => sum + parseFloat(website.total_earnings || 0), 0),
        totalImpressions: websitesData.reduce((sum, website) => sum + parseInt(website.total_impressions || 0, 10), 0),
        totalClicks: websitesData.reduce((sum, website) => sum + parseInt(website.total_clicks || 0, 10), 0),
      });
    } catch (err) {
      console.error('Error loading websites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const cleanName = formData.name.trim();
    const cleanUrl = normalizeUrl(formData.url);
    const duplicate = websites.some((website) => normalizeUrl(website.url) === cleanUrl);

    if (!cleanName || !cleanUrl) {
      setError('Website name and URL are required.');
      return;
    }

    if (!isValidUrl(cleanUrl)) {
      setError('Enter a valid website URL, for example https://example.co.ke');
      return;
    }

    if (duplicate) {
      setError('This website is already in your publisher workspace.');
      return;
    }

    const payload = {
      name: cleanName,
      url: cleanUrl,
      category: formData.category || null,
      monthly_visitors: formData.monthly_visitors ? Number(formData.monthly_visitors) : null,
    };

    try {
      const response = await api.post('/publisher/websites', payload);

      if (response.data.success) {
        setSuccess('Website submitted for approval.');
        setShowAddWebsite(false);
        loadWebsites();
        setFormData({ name: '', url: '', category: '', monthly_visitors: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit website');
    }
  };

  const ctr = stats.totalImpressions > 0
    ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="app-shell">
      <Navbar />

      <main className="aa-wide py-8">
        <section className="data-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Publisher Workspace</p>
              <h1 className="aa-heading mt-3 max-w-3xl">
                Turn trusted Kenyan traffic into managed ad revenue.
              </h1>
              <p className="aa-body mt-4 max-w-2xl">
                {user?.first_name
                  ? `${user.first_name}, submit sites, manage ad zones, and track payout-ready performance from one place.`
                  : 'Submit sites, manage ad zones, and track payout-ready performance from one place.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/publisher/earnings')} className="btn-secondary">
                <BadgeDollarSign className="h-4 w-4" />
                Earnings
              </button>
              <button onClick={() => navigate('/payouts')} className="btn-secondary">
                <WalletCards className="h-4 w-4" />
                Payouts
              </button>
              <button onClick={() => setShowAddWebsite(true)} className="btn-primary">
                <Plus className="h-4 w-4" />
                Add website
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric icon={Globe2} label="Websites" value={stats.totalWebsites} />
            <Metric icon={ArrowUpRight} label="Active" value={stats.activeWebsites} />
            <Metric icon={BadgeDollarSign} label="Earnings" value={`KES ${stats.totalEarnings.toFixed(2)}`} />
            <Metric icon={Eye} label="Impressions" value={stats.totalImpressions.toLocaleString()} />
            <Metric icon={MousePointerClick} label="CTR" value={`${ctr}%`} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-4">
          {[
            ['Submit website', stats.totalWebsites > 0, Globe2],
            ['Get approval', stats.activeWebsites > 0, CheckCircle2],
            ['Create zones', websites.some((website) => Number(website.zones_count || 0) > 0), Code2],
            ['Request payout', stats.totalEarnings > 0, WalletCards],
          ].map(([label, complete, Icon]) => (
            <div key={label} className="data-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#151713]">
                <Icon className={`h-4 w-4 ${complete ? 'text-[#2f6f4e]' : 'text-[#9a9f94]'}`} />
                {label}
              </p>
              <p className="mt-2 text-xs text-[#666d62]">{complete ? 'Ready' : 'Next step'}</p>
            </div>
          ))}
        </section>

        {(error || success) && (
          <div className="mt-6 grid gap-3">
            {error && (
              <div className="rounded-lg bg-[#f7f5ef] px-4 py-3 text-sm font-medium text-black/80">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-[#f7f5ef] px-4 py-3 text-sm font-medium text-black/80">
                {success}
              </div>
            )}
          </div>
        )}

        <section className="data-card mt-6 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-kicker">Supply</p>
              <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Websites</h2>
            </div>
            {!showAddWebsite && (
              <button onClick={() => setShowAddWebsite(true)} className="btn-primary">
                <Plus className="h-4 w-4" />
                Add website
              </button>
            )}
          </div>

          {showAddWebsite && (
            <div className="border-b border-black/[0.06] bg-[#f7f5ef] p-6">
              <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">Submit a website</h3>
              <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Website Name">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nationwide Business Blog"
                      className="form-input"
                    />
                  </Field>
                  <Field label="Website URL">
                    <input
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleChange}
                      required
                      placeholder="https://example.co.ke"
                      className="form-input"
                    />
                  </Field>
                  <Field label="Category">
                    <select name="category" value={formData.category} onChange={handleChange} className="form-input">
                      <option value="">Select category</option>
                      <option value="News">News</option>
                      <option value="Technology">Technology</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Sports">Sports</option>
                      <option value="Business">Business</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Monthly Visitors">
                    <input
                      type="number"
                      name="monthly_visitors"
                      value={formData.monthly_visitors}
                      onChange={handleChange}
                      placeholder="50000"
                      className="form-input"
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="btn-primary">Submit website</button>
                  <button type="button" onClick={() => setShowAddWebsite(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center text-sm text-black/50">Loading websites...</div>
            ) : websites.length === 0 ? (
              <div className="mx-auto max-w-md py-12 text-center">
                <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">No websites submitted</h3>
                <p className="mt-2 text-sm leading-[1.29] text-black/70">
                  Add your first publisher property so the ops team can review it for verified ad supply.
                </p>
                {!showAddWebsite && (
                  <button onClick={() => setShowAddWebsite(true)} className="btn-primary mx-auto mt-6">
                    <Plus className="h-4 w-4" />
                    Add first website
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="aa-table">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">Website</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Ad zones</th>
                      <th className="px-4 py-3">Impressions</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">Earnings</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {websites.map((website) => (
                      <tr key={website.id} className="transition hover:bg-[#f7f5ef]">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#151713]">{website.name}</div>
                          <div className="mt-1 text-xs text-[#7a8175]">{website.url}</div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusPill status={website.status} />
                        </td>
                        <td className="px-4 py-4 text-black/80">{website.zones_count || 0}</td>
                        <td className="px-4 py-4 text-black/80">
                          {parseInt(website.total_impressions || 0, 10).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-black/80">
                          {parseInt(website.total_clicks || 0, 10).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-black/80">
                          KES {parseFloat(website.total_earnings || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          {(website.status === 'approved' || website.status === 'active') ? (
                            <button
                              onClick={() => navigate(`/publisher/websites/${website.id}`)}
                              className="text-sm font-semibold text-[#2f6f4e] hover:underline"
                            >
                              Manage zones
                            </button>
                          ) : (
                            <span className="text-xs text-[#7a8175]">Awaiting review</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }) => (
  <div className="metric-card">
    <p className="flex items-center gap-2 text-sm text-black/60">
      <Icon className="h-4 w-4 text-[#2f6f4e]" />
      {label}
    </p>
    <strong>{value}</strong>
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="form-label">{label}</span>
    <span className="mt-2 block">{children}</span>
  </label>
);

const normalizeUrl = (value = '') => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    url.hash = '';
    url.search = '';
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString().replace(/\/$/, '');
  } catch {
    return withProtocol;
  }
};

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return Boolean(url.hostname.includes('.'));
  } catch {
    return false;
  }
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
    status === 'approved' || status === 'active'
      ? 'bg-[#2f6f4e] text-white'
      : 'bg-[#f7f5ef] text-black/60'
  }`}>
    {status}
  </span>
);

export default PublisherDashboard;
