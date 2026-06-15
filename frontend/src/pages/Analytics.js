// src/pages/Analytics.js
import React, { useEffect, useRef, useState } from 'react';
import { format, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import { Download, Eye, FileText, MousePointerClick, RefreshCw, TrendingUp, WalletCards } from 'lucide-react';
import Papa from 'papaparse';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Navbar from '../components/Navbar';
import { adServeAPI, campaignAPI } from '../services/api';

const Analytics = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const refreshInterval = useRef(null);

  const [dateRange, setDateRange] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [compareRange, setCompareRange] = useState({
    enabled: false,
    start_date: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    end_date: format(subDays(new Date(), 31), 'yyyy-MM-dd'),
  });
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [totals, setTotals] = useState({ impressions: 0, clicks: 0, spend: 0, ctr: 0 });
  const [compareTotals, setCompareTotals] = useState({ impressions: 0, clicks: 0, spend: 0, ctr: 0 });

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const campaignsResponse = await campaignAPI.getAll();
      setCampaigns(campaignsResponse.data.data.campaigns || []);

      const params = {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      };
      if (selectedCampaign !== 'all') params.campaign_id = selectedCampaign;

      const statsResponse = await adServeAPI.getStats(params);
      const statsData = (statsResponse.data.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      setStats(statsData);
      setTotals(sumStats(statsData));

      if (compareRange.enabled) {
        const compareParams = {
          start_date: compareRange.start_date,
          end_date: compareRange.end_date,
        };
        if (selectedCampaign !== 'all') compareParams.campaign_id = selectedCampaign;
        const compareResponse = await adServeAPI.getStats(compareParams);
        setCompareTotals(sumStats(compareResponse.data.data || []));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (autoRefresh) {
      refreshInterval.current = setInterval(() => loadData(true), 30000);
    }

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedCampaign, autoRefresh, compareRange]);

  const calculateChange = (current, previous) => {
    if (!previous) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('AfriAds Analytics Report', 20, 24);
    doc.setFontSize(11);
    doc.text(`Period: ${dateRange.start_date} to ${dateRange.end_date}`, 20, 34);
    doc.text(`Impressions: ${totals.impressions.toLocaleString()}`, 20, 52);
    doc.text(`Clicks: ${totals.clicks.toLocaleString()}`, 20, 62);
    doc.text(`CTR: ${totals.ctr.toFixed(2)}%`, 20, 72);
    doc.text(`Spend: KES ${totals.spend.toFixed(2)}`, 20, 82);
    doc.setFontSize(13);
    doc.text('Daily Performance', 20, 102);
    doc.setFontSize(9);
    let y = 114;
    stats.slice(0, 18).forEach((row) => {
      doc.text(
        `${format(new Date(row.date), 'MMM dd, yyyy')}  Impressions ${row.impressions || 0}  Clicks ${row.clicks || 0}  Spend KES ${parseFloat(row.total_cost || 0).toFixed(2)}`,
        20,
        y
      );
      y += 7;
    });
    doc.save(`afriads-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    setShowExportMenu(false);
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(stats.map((row) => ({
      Date: format(new Date(row.date), 'yyyy-MM-dd'),
      Impressions: row.impressions,
      Clicks: row.clicks,
      CTR: row.ctr,
      Spend: parseFloat(row.total_cost || 0).toFixed(2),
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `afriads-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const metricCards = [
    ['Impressions', totals.impressions.toLocaleString(), compareTotals.impressions, Eye, '#315f8c'],
    ['Clicks', totals.clicks.toLocaleString(), compareTotals.clicks, MousePointerClick, '#7b4f9b'],
    ['CTR', `${totals.ctr.toFixed(2)}%`, compareTotals.ctr, TrendingUp, '#2f6f4e'],
    ['Spend', `KES ${totals.spend.toFixed(2)}`, compareTotals.spend, WalletCards, '#2f6f4e'],
  ];

  return (
    <div className="app-shell">
      <Navbar />

      <main className="aa-wide py-8">
        <section className="data-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Reporting</p>
              <h1 className="aa-heading mt-3 max-w-3xl">
                Campaign performance without the noise.
              </h1>
              <p className="aa-body mt-4 max-w-2xl">
                Review spend, delivery, click activity, and period movement across your active media buying window.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setAutoRefresh(!autoRefresh)} className="btn-secondary">
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Live refresh' : 'Refresh off'}
              </button>
              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg bg-white shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0]">
                    <button onClick={exportToPDF} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-[#f7f5ef]">
                      <FileText className="h-4 w-4" />
                      PDF report
                    </button>
                    <button onClick={exportToCSV} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-[#f7f5ef]">
                      <FileText className="h-4 w-4" />
                      CSV data
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Campaign">
                <select value={selectedCampaign} onChange={(event) => setSelectedCampaign(event.target.value)} className="form-input">
                  <option value="all">All campaigns</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start Date">
                <input type="date" value={dateRange.start_date} onChange={(event) => setDateRange({ ...dateRange, start_date: event.target.value })} className="form-input" />
              </Field>
              <Field label="End Date">
                <input type="date" value={dateRange.end_date} onChange={(event) => setDateRange({ ...dateRange, end_date: event.target.value })} className="form-input" />
              </Field>
            </div>
            <div className="rounded-lg bg-[#f7f5ef] p-4">
              <label className="flex items-center justify-between gap-4 text-sm font-semibold text-[#151713]">
                Compare previous period
                <input
                  type="checkbox"
                  checked={compareRange.enabled}
                  onChange={() => setCompareRange({ ...compareRange, enabled: !compareRange.enabled })}
                  className="h-5 w-5 accent-[#2f6f4e]"
                />
              </label>
              {compareRange.enabled && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input type="date" value={compareRange.start_date} onChange={(event) => setCompareRange({ ...compareRange, start_date: event.target.value })} className="form-input" />
                  <input type="date" value={compareRange.end_date} onChange={(event) => setCompareRange({ ...compareRange, end_date: event.target.value })} className="form-input" />
                </div>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#666d62]">Loading analytics...</div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metricCards.map(([label, value, previous, Icon, color]) => {
                const rawCurrent = label === 'CTR' ? totals.ctr : label === 'Spend' ? totals.spend : Number(String(value).replace(/,/g, ''));
                const movement = compareRange.enabled ? calculateChange(rawCurrent, previous) : null;
                return (
                  <div key={label} className="metric-card">
                    <p className="flex items-center gap-2 text-sm text-[#666d62]">
                      <Icon className="h-4 w-4" style={{ color }} />
                      {label}
                    </p>
                    <strong>{value}</strong>
                    {movement !== null && previous > 0 && (
                      <span className={`mt-3 text-xs font-semibold ${movement >= 0 ? 'text-[#236245]' : 'text-[#8f3024]'}`}>
                        {movement >= 0 ? '+' : ''}{movement.toFixed(1)}% vs comparison
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
              <section className="data-card p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="section-kicker">Trend</p>
                    <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Delivery and engagement</h2>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold text-[#5f665b]">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#315f8c]" />Impressions</span>
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-black/40" />Clicks</span>
                  </div>
                </div>
                <div className="mt-6 h-[360px]" style={{ minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={stats}>
                      <CartesianGrid stroke="#e9e2d4" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={shortDate} stroke="#7a8175" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#7a8175" tick={{ fontSize: 12 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="impressions" stroke="#315f8c" fill="#dce9f8" strokeWidth={2} name="Impressions" />
                      <Area type="monotone" dataKey="clicks" stroke="#151713" fill="#d2d2d7" strokeWidth={2} name="Clicks" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="data-card p-6">
                <p className="section-kicker">Operations Notes</p>
                <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">What to watch</h2>
                <div className="mt-6 space-y-4">
                  {buildNotes(totals, stats).map((note) => (
                    <div key={note.title} className="border-l-2 border-[#2f6f4e] pl-4">
                      <p className="text-sm font-semibold text-[#151713]">{note.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#666d62]">{note.copy}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ChartCard title="CTR by day" dataKey="ctr" name="CTR %" data={stats} color="#2f6f4e" />
              <ChartCard title="Spend by day" dataKey="total_cost" name="Spend KES" data={stats} color="#151713" />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const sumStats = (rows) => {
  const impressions = rows.reduce((sum, row) => sum + parseInt(row.impressions || 0, 10), 0);
  const clicks = rows.reduce((sum, row) => sum + parseInt(row.clicks || 0, 10), 0);
  const spend = rows.reduce((sum, row) => sum + parseFloat(row.total_cost || 0), 0);
  return {
    impressions,
    clicks,
    spend,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
  };
};

const shortDate = (date) => format(new Date(date), 'MMM dd');

const Field = ({ label, children }) => (
  <label className="block">
    <span className="form-label">{label}</span>
    <span className="mt-2 block">{children}</span>
  </label>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white p-3 text-sm shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0]">
      <p className="font-semibold text-[#151713]">{format(new Date(label), 'MMM dd, yyyy')}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-1 flex justify-between gap-6 text-[#5f665b]">
          <span>{entry.name}</span>
          <strong className="text-[#151713]">{Number(entry.value || 0).toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, data, dataKey, name, color }) => (
  <section className="data-card p-6">
    <h2 className="text-[28px] font-normal leading-[1.14] text-[#151713]">{title}</h2>
    <div className="mt-6 h-[280px]" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart data={data}>
          <CartesianGrid stroke="#e9e2d4" vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} stroke="#7a8175" tick={{ fontSize: 12 }} />
          <YAxis stroke="#7a8175" tick={{ fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </section>
);

const buildNotes = (totals, rows) => {
  const notes = [];
  if (totals.ctr < 1) {
    notes.push({
      title: 'CTR below 1%',
      copy: 'Review creative clarity, placement quality, and bid competitiveness before adding more budget.',
    });
  } else {
    notes.push({
      title: 'CTR is holding',
      copy: 'Engagement is within a usable range. Scale carefully while watching spend per click.',
    });
  }

  const recent = rows.slice(-7).reduce((sum, row) => sum + parseInt(row.impressions || 0, 10), 0);
  notes.push({
    title: 'Last 7 days',
    copy: `${recent.toLocaleString()} impressions delivered in the most recent window shown on this report.`,
  });

  notes.push({
    title: 'Spend discipline',
    copy: totals.clicks > 0
      ? `Current cost per click is KES ${(totals.spend / totals.clicks).toFixed(2)}.`
      : 'No clicks are recorded yet, so cost per click cannot be calculated.',
  });
  return notes;
};

export default Analytics;
