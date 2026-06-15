import React, { useEffect, useMemo, useState } from 'react';
import { BadgeDollarSign, CalendarDays, Eye, MousePointerClick, WalletCards } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const PublisherEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [totals, setTotals] = useState({ total_impressions: 0, total_clicks: 0, total_earnings: 0 });
  const [filters, setFilters] = useState({ start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const response = await api.get('/publisher/earnings', { params });
      setEarnings(response.data.data.earnings || []);
      setTotals(response.data.data.totals || { total_impressions: 0, total_clicks: 0, total_earnings: 0 });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctr = useMemo(() => {
    const impressions = Number(totals.total_impressions || 0);
    if (!impressions) return '0.00';
    return ((Number(totals.total_clicks || 0) / impressions) * 100).toFixed(2);
  }, [totals]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="aa-wide py-8">
        <section className="data-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Publisher Earnings</p>
              <h1 className="aa-heading mt-3 max-w-3xl">Track revenue from verified ad delivery.</h1>
              <p className="aa-body mt-4 max-w-2xl">
                Review impressions, clicks, CTR, and payout-ready earnings across your approved publisher sites.
              </p>
            </div>
            <a href="/payouts" className="btn-primary">
              <WalletCards className="h-4 w-4" />
              Request payout
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={BadgeDollarSign} label="Earnings" value={`KES ${money(totals.total_earnings)}`} />
            <Metric icon={Eye} label="Impressions" value={number(totals.total_impressions)} />
            <Metric icon={MousePointerClick} label="Clicks" value={number(totals.total_clicks)} />
            <Metric icon={CalendarDays} label="CTR" value={`${ctr}%`} />
          </div>
        </section>

        <section className="data-card mt-6 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Reporting</p>
              <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Daily earnings</h2>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                loadEarnings();
              }}
              className="grid gap-3 sm:grid-cols-[160px_160px_auto]"
            >
              <input
                type="date"
                value={filters.start_date}
                onChange={(event) => setFilters({ ...filters, start_date: event.target.value })}
                className="form-input"
              />
              <input
                type="date"
                value={filters.end_date}
                onChange={(event) => setFilters({ ...filters, end_date: event.target.value })}
                className="form-input"
              />
              <button className="btn-secondary justify-center">Apply</button>
            </form>
          </div>

          {error && <div className="m-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="overflow-x-auto p-6">
            {loading ? (
              <div className="py-12 text-center text-sm text-black/50">Loading earnings...</div>
            ) : (
              <table className="aa-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Website</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-black/50">
                        No earnings yet. Delivery will appear here after ads serve on your zones.
                      </td>
                    </tr>
                  ) : (
                    earnings.map((row, index) => {
                      const impressions = Number(row.impressions || 0);
                      const clicks = Number(row.clicks || 0);
                      const rowCtr = impressions ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
                      return (
                        <tr key={`${row.report_date}-${row.website_name}-${index}`}>
                          <td>{new Date(row.report_date).toLocaleDateString()}</td>
                          <td className="font-semibold text-[#151713]">{row.website_name}</td>
                          <td>{number(impressions)}</td>
                          <td>{number(clicks)}</td>
                          <td>{rowCtr}%</td>
                          <td className="font-semibold text-[#151713]">KES {money(row.earnings)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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

const number = (value) => Number(value || 0).toLocaleString();
const money = (value) => Number(value || 0).toFixed(2);

export default PublisherEarnings;
