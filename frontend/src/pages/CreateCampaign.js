// src/pages/CreateCampaign.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CreditCard, Layers3, Megaphone, Plus, ShieldCheck, Target, WalletCards } from 'lucide-react';
import Navbar from '../components/Navbar';
import { campaignAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    total_budget: '',
    daily_budget: '',
    bid_type: 'cpm',
    bid_amount: '',
    start_date: '',
    end_date: '',
  });
  const [campaignPlan, setCampaignPlan] = useState({
    objective: 'awareness',
    market: 'Kenya',
    channels: ['display'],
    brandSafety: true,
    reportingCadence: 'daily',
  });

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
    setLoading(true);

    try {
      if (parseFloat(formData.total_budget) <= 0) {
        setError('Total budget must be greater than 0');
        setLoading(false);
        return;
      }
      if (parseFloat(formData.bid_amount) <= 0) {
        setError('Bid amount must be greater than 0');
        setLoading(false);
        return;
      }
      if (formData.daily_budget && parseFloat(formData.daily_budget) > parseFloat(formData.total_budget)) {
        setError('Daily budget cannot exceed total budget');
        setLoading(false);
        return;
      }

      const response = await campaignAPI.create(formData);
      if (response.data.success) {
        setSuccess('Campaign created successfully.');
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
      setLoading(false);
    }
  };

  const totalBudget = parseFloat(formData.total_budget || 0);
  const dailyBudget = parseFloat(formData.daily_budget || 0);
  const balance = parseFloat(user?.balance || 0);
  const pacing = totalBudget && dailyBudget ? Math.ceil(totalBudget / dailyBudget) : null;
  const selectedFormats = campaignPlan.channels.map((channel) => channelLabels[channel]).join(', ');

  const toggleChannel = (channel) => {
    setCampaignPlan((current) => {
      const exists = current.channels.includes(channel);
      const channels = exists
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel];
      return { ...current, channels: channels.length ? channels : ['display'] };
    });
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="aa-wide py-8">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="space-y-6">
            <div className="data-card p-6 sm:p-8">
              <p className="section-kicker">Campaign Launch</p>
              <h1 className="aa-heading mt-3">
                Build a campaign with spend control from the start.
              </h1>
              <p className="aa-body mt-4">
                Create the buying container first, then attach creatives and activate once moderation and funding are ready.
              </p>
            </div>

            <div className="data-card p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#666d62]">
                <WalletCards className="h-4 w-4 text-[#2f6f4e]" />
                Available balance
              </p>
              <strong className="mt-3 block text-[40px] font-semibold leading-[1.10] text-[#151713]">
                KES {balance.toFixed(2)}
              </strong>
              <button type="button" onClick={() => navigate('/payments')} className="btn-secondary mt-5 w-full justify-center">
                <CreditCard className="h-4 w-4" />
                Add funds
              </button>
            </div>

            <div className="data-card p-6">
              <p className="section-kicker">Launch Checks</p>
              <div className="mt-5 space-y-4">
                {[
                  ['Budget', totalBudget > 0 ? `Total budget set at KES ${totalBudget.toFixed(2)}` : 'Set a total budget'],
                  ['Objective', objectiveLabels[campaignPlan.objective]],
                  ['Channels', selectedFormats],
                  ['Pacing', pacing ? `Daily budget paces for about ${pacing} day${pacing === 1 ? '' : 's'}` : 'Optional daily cap not set'],
                  ['Creative', 'Add creatives after campaign creation'],
                ].map(([title, copy]) => (
                  <div key={title} className="border-l-2 border-[#2f6f4e] pl-4">
                    <p className="text-sm font-semibold text-[#151713]">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-[#666d62]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="data-card overflow-hidden">
            <div className="border-b border-[#e0ddd3] px-6 py-5">
              <p className="section-kicker">Setup</p>
              <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Campaign details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-8">
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

              <FormSection icon={Megaphone} title="Identity">
                <Field label="Campaign Name">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="June Nairobi retail push"
                    className="form-input"
                  />
                </Field>
              </FormSection>

              <FormSection icon={Layers3} title="Media Plan">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Objective">
                    <select
                      value={campaignPlan.objective}
                      onChange={(event) => setCampaignPlan({ ...campaignPlan, objective: event.target.value })}
                      className="form-input"
                    >
                      <option value="awareness">Awareness and reach</option>
                      <option value="traffic">Traffic and clicks</option>
                      <option value="conversion">Conversions and leads</option>
                      <option value="retention">Retention and re-engagement</option>
                    </select>
                  </Field>
                  <Field label="Primary Market">
                    <select
                      value={campaignPlan.market}
                      onChange={(event) => setCampaignPlan({ ...campaignPlan, market: event.target.value })}
                      className="form-input"
                    >
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Multi-market">Multi-market</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-5">
                  <span className="form-label">Channel Mix</span>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {channels.map(({ id, label, status }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleChannel(id)}
                        className={`rounded-lg border p-4 text-left transition ${
                          campaignPlan.channels.includes(id)
                            ? 'border-[#2f6f4e] bg-[#e7ecdf]'
                            : 'border-black/10 bg-white hover:bg-[#f7f5ef]'
                        }`}
                      >
                        <span className="text-sm font-semibold text-[#151713]">{label}</span>
                        <span className="mt-2 block text-xs text-[#777c72]">{status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </FormSection>

              <FormSection icon={ShieldCheck} title="Controls">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3">
                    <span>
                      <span className="block text-sm font-semibold text-[#151713]">Brand-safe supply</span>
                      <span className="mt-1 block text-xs text-[#777c72]">Exclude unsafe publisher environments.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={campaignPlan.brandSafety}
                      onChange={() => setCampaignPlan({ ...campaignPlan, brandSafety: !campaignPlan.brandSafety })}
                      className="h-5 w-5 accent-[#2f6f4e]"
                    />
                  </label>
                  <Field label="Reporting Cadence">
                    <select
                      value={campaignPlan.reportingCadence}
                      onChange={(event) => setCampaignPlan({ ...campaignPlan, reportingCadence: event.target.value })}
                      className="form-input"
                    >
                      <option value="daily">Daily performance report</option>
                      <option value="weekly">Weekly summary</option>
                      <option value="end">End-of-campaign report</option>
                    </select>
                  </Field>
                </div>
                <p className="mt-3 text-sm text-[#666d62]">
                  These planning choices guide setup now. The campaign container is created first; targeting and channel execution can be expanded as inventory modules mature.
                </p>
              </FormSection>

              <FormSection icon={WalletCards} title="Budget">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Total Budget (KES)">
                    <input
                      type="number"
                      name="total_budget"
                      value={formData.total_budget}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="1"
                      placeholder="50000"
                      className="form-input"
                    />
                  </Field>
                  <Field label="Daily Budget (KES)">
                    <input
                      type="number"
                      name="daily_budget"
                      value={formData.daily_budget}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="5000"
                      className="form-input"
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection icon={Target} title="Bidding">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Bid Type">
                    <select name="bid_type" value={formData.bid_type} onChange={handleChange} className="form-input">
                      <option value="cpm">CPM / Cost per 1000 impressions</option>
                      <option value="cpc">CPC / Cost per click</option>
                      <option value="cpa">CPA / Cost per action</option>
                    </select>
                  </Field>
                  <Field label="Bid Amount (KES)">
                    <input
                      type="number"
                      name="bid_amount"
                      value={formData.bid_amount}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0.01"
                      placeholder="250"
                      className="form-input"
                    />
                  </Field>
                </div>
                <p className="mt-3 text-sm text-[#666d62]">
                  {formData.bid_type === 'cpm' && 'Use CPM when reach and awareness are the main goal.'}
                  {formData.bid_type === 'cpc' && 'Use CPC when traffic quality matters more than raw reach.'}
                  {formData.bid_type === 'cpa' && 'Use CPA when conversion tracking is ready and reliable.'}
                </p>
              </FormSection>

              <FormSection icon={CalendarDays} title="Flight Dates">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Start Date">
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="form-input" />
                  </Field>
                  <Field label="End Date">
                    <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="form-input" />
                  </Field>
                </div>
              </FormSection>

              <div className="flex flex-col-reverse gap-3 border-t border-[#e0ddd3] pt-6 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => navigate('/dashboard')} disabled={loading} className="btn-secondary justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary justify-center disabled:opacity-60">
                  <Plus className="h-4 w-4" />
                  {loading ? 'Creating...' : 'Create campaign'}
                </button>
              </div>
            </form>
          </section>
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

const FormSection = ({ icon: Icon, title, children }) => (
  <section>
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2f6f4e] text-white">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">{title}</h3>
    </div>
    {children}
  </section>
);

const channels = [
  { id: 'display', label: 'Display Ads', status: 'Live inventory' },
  { id: 'native', label: 'Native Ads', status: 'Planned module' },
  { id: 'push', label: 'Push / Interstitial', status: 'Planned module' },
  { id: 'messaging', label: 'WhatsApp / Telegram', status: 'Planned module' },
  { id: 'pdooh', label: 'pDOOH / Transit', status: 'Partnership module' },
  { id: 'audio', label: 'Radio / Audio', status: 'Partnership module' },
];

const channelLabels = channels.reduce((map, channel) => ({ ...map, [channel.id]: channel.label }), {});

const objectiveLabels = {
  awareness: 'Awareness and reach',
  traffic: 'Traffic and clicks',
  conversion: 'Conversions and leads',
  retention: 'Retention and re-engagement',
};

export default CreateCampaign;
