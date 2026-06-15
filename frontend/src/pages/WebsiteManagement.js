import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Plus, WalletCards } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const WebsiteManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAdTag, setShowAdTag] = useState(null);
  const [adTagCode, setAdTagCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', zone_type: 'display', dimensions: '728x90' });

  const loadWebsite = async () => {
    try {
      const response = await api.get(`/publisher/websites/${id}`);
      setWebsite(response.data.data);
    } catch (err) {
      setError('Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async () => {
    try {
      const response = await api.get(`/publisher/websites/${id}/zones`);
      setZones(response.data.data || []);
    } catch (err) {
      console.error('Error loading zones:', err);
    }
  };

  useEffect(() => {
    loadWebsite();
    loadZones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (event) => {
    if (event.target.name === 'zone_type') {
      setFormData({
        ...formData,
        zone_type: event.target.value,
        dimensions: event.target.value === 'native' ? 'responsive' : '728x90',
      });
      return;
    }

    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await api.post(`/publisher/websites/${id}/zones`, formData);
      if (response.data.success) {
        setSuccess('Ad zone created successfully.');
        setShowAddZone(false);
        setFormData({ name: '', zone_type: 'display', dimensions: '728x90' });
        loadZones();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ad zone');
    }
  };

  const getAdTag = async (zoneId) => {
    try {
      const response = await api.get(`/publisher/zones/${zoneId}/tag`);
      setAdTagCode(response.data.data.ad_tag);
      setShowAdTag(zoneId);
    } catch (err) {
      setError('Failed to get ad tag');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(adTagCode);
    setSuccess('Ad tag copied to clipboard.');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-black/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <header className="bg-black py-16 text-white">
        <div className="aa-wide">
          <button onClick={() => navigate('/publisher/dashboard')} className="mb-5 text-[17px] text-[#9cbba9] hover:underline">
            Publisher dashboard &gt;
          </button>
          <h1 className="aa-display">{website?.name}</h1>
          <p className="mt-3 text-[21px] leading-[1.19] text-white/80">{website?.url}</p>
        </div>
      </header>

      <main className="aa-wide py-8">
        {(error || success) && (
          <div className="mb-6 grid gap-3">
            {error && <div className="rounded-lg bg-white px-4 py-3 text-sm text-black/80">{error}</div>}
            {success && <div className="rounded-lg bg-white px-4 py-3 text-sm text-black/80">{success}</div>}
          </div>
        )}

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Zones" value={website?.zones_count || zones.length} />
          <Metric label="Impressions" value={parseInt(website?.total_impressions || 0, 10).toLocaleString()} />
          <Metric label="Clicks" value={parseInt(website?.total_clicks || 0, 10).toLocaleString()} />
          <Metric label="Earnings" value={`KES ${parseFloat(website?.total_earnings || 0).toFixed(2)}`} />
        </section>

        <section className="data-card overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[28px] font-normal leading-[1.14] text-[#151713]">Ad Zones</h2>
            {!showAddZone && (
              <button onClick={() => setShowAddZone(true)} className="btn-primary">
                <Plus className="h-4 w-4" />
                Create Ad Zone
              </button>
            )}
          </div>

          {showAddZone && (
            <div className="border-b border-black/[0.06] bg-[#f7f5ef] p-6">
              <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">Create ad zone</h3>
              <form onSubmit={handleSubmit} className="mt-5 grid gap-5">
                <Field label="Zone Name">
                  <input name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="Homepage banner" />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Ad Type">
                    <select name="zone_type" value={formData.zone_type} onChange={handleChange} className="form-input">
                      <option value="display">Display Banner</option>
                      <option value="video">Video Ad</option>
                      <option value="native">Native Ad</option>
                    </select>
                  </Field>
                  <Field label="Dimensions">
                    <select name="dimensions" value={formData.dimensions} onChange={handleChange} className="form-input">
                      {formData.zone_type === 'native' && <option value="responsive">Responsive Native</option>}
                      <option value="728x90">Leaderboard (728x90)</option>
                      <option value="300x250">Medium Rectangle (300x250)</option>
                      <option value="160x600">Wide Skyscraper (160x600)</option>
                      <option value="320x50">Mobile Banner (320x50)</option>
                      <option value="300x600">Half Page (300x600)</option>
                      <option value="970x250">Billboard (970x250)</option>
                    </select>
                  </Field>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">
                    <Plus className="h-4 w-4" />
                    Create Ad Zone
                  </button>
                  <button type="button" onClick={() => setShowAddZone(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            {zones.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-sm text-black/50">No ad zones yet</p>
                {!showAddZone && <button onClick={() => setShowAddZone(true)} className="btn-primary">Create first ad zone</button>}
              </div>
            ) : (
              <div className="grid gap-4">
                {zones.map((zone) => {
                  const ctr = zone.total_impressions > 0 ? ((zone.total_clicks / zone.total_impressions) * 100).toFixed(2) : '0.00';
                  return (
                    <div key={zone.id} className="rounded-lg bg-[#f7f5ef] p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">{zone.name}</h3>
                          <p className="mt-1 text-sm text-black/50">{zone.zone_type} / {zone.dimensions}</p>
                        </div>
                        <StatusPill status={zone.status} />
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <Metric label="Impressions" value={parseInt(zone.total_impressions || 0, 10).toLocaleString()} />
                        <Metric label="Clicks" value={parseInt(zone.total_clicks || 0, 10).toLocaleString()} />
                        <Metric label="CTR" value={`${ctr}%`} />
                        <Metric label="Earnings" value={`KES ${parseFloat(zone.total_earnings || 0).toFixed(2)}`} />
                      </div>
                      <button onClick={() => getAdTag(zone.id)} className="btn-primary mt-5">
                        <Copy className="h-4 w-4" />
                        Get Ad Code
                      </button>
                      {showAdTag === zone.id && (
                        <div className="mt-5 rounded-lg bg-black p-4 text-white">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold">Ad Tag Code</p>
                            <button onClick={copyToClipboard} className="inline-flex items-center gap-2 rounded-md bg-[#2f6f4e] px-3 py-2 text-xs text-white">
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </button>
                          </div>
                          <pre className="overflow-x-auto text-xs leading-[1.47] text-white/80"><code>{adTagCode}</code></pre>
                          <p className="mt-3 text-xs text-white/50">Paste this code where the ad should appear.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="data-card mt-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-kicker">Revenue</p>
              <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Earnings report</h2>
            </div>
            <button onClick={() => navigate('/publisher/earnings')} className="btn-secondary">
              <WalletCards className="h-4 w-4" />
              View earnings
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="form-label">{label}</span>
    <span className="mt-2 block">{children}</span>
  </label>
);

const Metric = ({ label, value }) => (
  <div className="rounded-lg bg-white p-4">
    <p className="text-xs text-black/50">{label}</p>
    <strong className="mt-2 block text-[21px] leading-[1.19] text-[#151713]">{value}</strong>
  </div>
);

const StatusPill = ({ status }) => (
  <span className={`inline-flex rounded-[980px] px-3 py-1 text-xs font-semibold ${
    status === 'active' ? 'bg-[#2f6f4e] text-white' : 'bg-white text-black/60'
  }`}>
    {status}
  </span>
);

export default WebsiteManagement;
