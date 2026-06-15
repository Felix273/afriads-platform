import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Ban,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Globe2,
  MousePointerClick,
  RadioTower,
  ShieldAlert,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { activityAPI } from '../services/paymentService';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const sections = [
  { id: 'ad-ops', label: 'Ad Ops', href: '/admin/ad-ops', icon: BarChart3 },
  { id: 'approvals', label: 'Approvals', href: '/admin/approvals', icon: FileCheck2 },
  { id: 'fraud', label: 'Fraud', href: '/admin/fraud', icon: ShieldAlert },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const activeSection = getActiveSection(location.pathname);
  const [overview, setOverview] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [activity, setActivity] = useState([]);
  const [ipForm, setIpForm] = useState({ ip_address: '', reason: '', block_type: 'permanent', expires_at: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [overviewRes, websitesRes, creativesRes, blockedRes, activityRes] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getPendingWebsites(),
        adminAPI.getPendingCreatives(),
        adminAPI.getBlockedIPs(),
        activityAPI.getRecent({ limit: 8 }),
      ]);

      setOverview(overviewRes.data.data);
      setWebsites(rows(websitesRes.data.data));
      setCreatives(rows(creativesRes.data.data));
      setBlockedIPs(rows(blockedRes.data.data));
      setActivity(rows(activityRes.data.activities));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const moderateWebsite = async (id, status) => {
    try {
      await adminAPI.moderateWebsite(id, { status });
      showMessage(`Website ${status}`);
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update website');
    }
  };

  const moderateCreative = async (id, status) => {
    try {
      await adminAPI.moderateCreative(id, { status });
      showMessage(`Creative ${status}`);
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update creative');
    }
  };

  const handleBlockIP = async (event) => {
    event.preventDefault();
    try {
      await adminAPI.blockIP({
        ip_address: ipForm.ip_address,
        reason: ipForm.reason,
        block_type: ipForm.block_type,
        expires_at: ipForm.block_type === 'temporary' ? ipForm.expires_at || null : null,
      });
      setIpForm({ ip_address: '', reason: '', block_type: 'permanent', expires_at: '' });
      showMessage('IP blocked');
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block IP');
    }
  };

  const unblockIP = async (id) => {
    try {
      await adminAPI.unblockIP(id);
      showMessage('IP unblocked');
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unblock IP');
    }
  };

  const metrics = useMemo(() => buildMetrics(overview, websites.length, creatives.length, blockedIPs.length), [
    overview,
    websites.length,
    creatives.length,
    blockedIPs.length,
  ]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="aa-wide py-8">
        <section className="border-b border-black/10 pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Admin Console</p>
              <h1 className="aa-heading mt-3 max-w-3xl">{sectionCopy[activeSection].title}</h1>
              <p className="aa-body mt-4 max-w-2xl">{sectionCopy[activeSection].description}</p>
              <p className="mt-4 text-sm text-[#777c72]">{user?.email}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-black/10 bg-white p-1">
              {sections.map(({ id, label, href, icon: Icon }) => (
                <Link
                  key={id}
                  to={href}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    activeSection === id
                      ? 'bg-[#151713] text-white'
                      : 'text-[#5d6258] hover:bg-[#f7f5ef] hover:text-[#151713]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {(message || error) && (
          <div className="mt-6 grid gap-3">
            {message && <Notice tone="success">{message}</Notice>}
            {error && <Notice tone="error">{error}</Notice>}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[45vh] items-center justify-center text-sm text-[#666d62]">
            Loading admin console...
          </div>
        ) : (
          <>
            {activeSection === 'ad-ops' && (
              <AdOpsView metrics={metrics} overview={overview} activity={activity} />
            )}
            {activeSection === 'approvals' && (
              <ApprovalsView
                websites={websites}
                creatives={creatives}
                onModerateWebsite={moderateWebsite}
                onModerateCreative={moderateCreative}
              />
            )}
            {activeSection === 'fraud' && (
              <FraudView
                overview={overview}
                blockedIPs={blockedIPs}
                ipForm={ipForm}
                setIpForm={setIpForm}
                onBlockIP={handleBlockIP}
                onUnblockIP={unblockIP}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

const AdOpsView = ({ metrics, overview, activity }) => (
  <div className="mt-6 grid gap-6">
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon, color, detail }) => (
        <div key={label} className="metric-card">
          <p className="flex items-center gap-2 text-sm text-[#666d62]">
            <Icon className="h-4 w-4" style={{ color }} />
            {label}
          </p>
          <strong>{value}</strong>
          <p className="mt-2 text-xs text-[#777c72]">{detail}</p>
        </div>
      ))}
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="data-card overflow-hidden">
        <PanelHeader kicker="Network Health" title="Delivery overview" />
        <div className="grid gap-4 p-6 md:grid-cols-3">
          <DeliveryStat icon={RadioTower} label="Impressions" value={numberValue(overview?.delivery?.impressions)} />
          <DeliveryStat icon={MousePointerClick} label="Clicks" value={numberValue(overview?.delivery?.clicks)} />
          <DeliveryStat icon={CircleDollarSign} label="Spend" value={`KES ${moneyValue(overview?.delivery?.spend)}`} />
        </div>
        <div className="border-t border-black/10 p-6">
          <h3 className="text-sm font-semibold uppercase text-[#777c72]">Campaign status mix</h3>
          <StatusGrid rows={overview?.campaigns} emptyText="No campaigns found." />
        </div>
      </div>

      <div className="data-card overflow-hidden">
        <PanelHeader kicker="Operator Log" title="Recent activity" />
        <div className="space-y-3 p-6">
          {activity.length === 0 ? (
            <p className="text-sm text-[#666d62]">No recent admin activity yet.</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="rounded-lg bg-[#f7f5ef] p-4">
                <p className="text-sm font-semibold text-[#151713]">{humanize(item.action)}</p>
                <p className="mt-1 text-sm text-[#5f665b]">{item.description || 'Activity recorded'}</p>
                <p className="mt-2 text-xs text-[#777c72]">{formatDate(item.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  </div>
);

const ApprovalsView = ({ websites, creatives, onModerateWebsite, onModerateCreative }) => (
  <div className="mt-6 grid gap-6">
    <section className="grid gap-3 md:grid-cols-3">
      <QueueCard icon={Globe2} label="Websites waiting" value={websites.length} />
      <QueueCard icon={Sparkles} label="Creatives waiting" value={creatives.length} />
      <QueueCard icon={Clock3} label="Total queue" value={websites.length + creatives.length} />
    </section>

    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <ReviewPanel title="Publisher Website Approvals" emptyText="No websites waiting for review.">
        {websites.map((website) => (
          <div key={website.id} className="rounded-lg bg-[#f7f5ef] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-[#151713]">{website.name}</h3>
                <p className="mt-1 text-sm text-[#5f665b]">{website.url}</p>
                <p className="mt-1 text-xs text-[#7a8175]">
                  {website.email} / {website.category || 'Uncategorized'}
                </p>
              </div>
              <ModerationActions
                onApprove={() => onModerateWebsite(website.id, 'approved')}
                onReject={() => onModerateWebsite(website.id, 'rejected')}
              />
            </div>
          </div>
        ))}
      </ReviewPanel>

      <ReviewPanel title="Creative Approvals" emptyText="No creatives waiting for review.">
        {creatives.map((creative) => (
          <div key={creative.id} className="rounded-lg bg-[#f7f5ef] p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              {creative.image_url && (
                <img
                  src={creative.image_url}
                  alt={creative.title || creative.name}
                  className="h-28 w-full rounded-md bg-[#ece8df] object-cover sm:w-40"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#151713]">{creative.title || creative.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5f665b]">{creative.description}</p>
                <p className="mt-1 text-xs text-[#7a8175]">
                  {creative.campaign_name} / {creative.advertiser_email}
                </p>
                <ModerationActions
                  className="mt-4"
                  onApprove={() => onModerateCreative(creative.id, 'approved')}
                  onReject={() => onModerateCreative(creative.id, 'rejected')}
                />
              </div>
            </div>
          </div>
        ))}
      </ReviewPanel>
    </section>
  </div>
);

const FraudView = ({ overview, blockedIPs, ipForm, setIpForm, onBlockIP, onUnblockIP }) => (
  <div className="mt-6 grid gap-6">
    <section className="grid gap-3 md:grid-cols-3">
      <QueueCard icon={Ban} label="Blocked IPs" value={blockedIPs.length} />
      <QueueCard icon={ShieldAlert} label="Pending reviews" value={countRows(overview?.creatives, 'pending') + countRows(overview?.websites, 'pending')} />
      <QueueCard icon={Activity} label="Clicks recorded" value={numberValue(overview?.delivery?.clicks)} />
    </section>

    <section className="data-card overflow-hidden">
      <PanelHeader kicker="Fraud Controls" title="Block suspicious traffic" />
      <div className="p-6">
        <form onSubmit={onBlockIP} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr_170px_180px_auto]">
          <input
            value={ipForm.ip_address}
            onChange={(event) => setIpForm({ ...ipForm, ip_address: event.target.value })}
            placeholder="IP address"
            required
            className="form-input"
          />
          <input
            value={ipForm.reason}
            onChange={(event) => setIpForm({ ...ipForm, reason: event.target.value })}
            placeholder="Reason"
            className="form-input"
          />
          <select
            value={ipForm.block_type}
            onChange={(event) => setIpForm({ ...ipForm, block_type: event.target.value })}
            className="form-input"
          >
            <option value="permanent">Permanent</option>
            <option value="temporary">Temporary</option>
          </select>
          <input
            type="datetime-local"
            value={ipForm.expires_at}
            onChange={(event) => setIpForm({ ...ipForm, expires_at: event.target.value })}
            disabled={ipForm.block_type !== 'temporary'}
            className="form-input"
          />
          <button className="btn-primary justify-center">
            <Ban className="h-4 w-4" />
            Block
          </button>
        </form>
      </div>
    </section>

    <section className="data-card overflow-hidden">
      <PanelHeader kicker="Blocklist" title="Blocked IP list" />
      {blockedIPs.length === 0 ? (
        <p className="p-6 text-sm text-[#666d62]">No blocked IPs.</p>
      ) : (
        <div className="overflow-x-auto p-6">
          <table className="aa-table">
            <thead>
              <tr>
                <th>IP</th>
                <th>Reason</th>
                <th>Type</th>
                <th>Expires</th>
                <th>Blocked By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {blockedIPs.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold text-[#151713]">{item.ip_address}</td>
                  <td className="text-[#5f665b]">{item.reason || '-'}</td>
                  <td className="capitalize text-[#5f665b]">{item.block_type}</td>
                  <td className="text-[#5f665b]">{item.expires_at ? formatDate(item.expires_at) : '-'}</td>
                  <td className="text-[#5f665b]">{item.blocked_by_email || '-'}</td>
                  <td>
                    <button onClick={() => onUnblockIP(item.id)} className="text-sm font-semibold text-[#8f3024]">
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </div>
);

const PanelHeader = ({ kicker, title }) => (
  <div className="border-b border-[#e0ddd3] px-6 py-5">
    <p className="section-kicker">{kicker}</p>
    <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">{title}</h2>
  </div>
);

const ReviewPanel = ({ title, emptyText, children }) => (
  <section className="data-card overflow-hidden">
    <PanelHeader kicker="Review Queue" title={title} />
    <div className="space-y-4 p-6">
      {React.Children.count(children) === 0 ? (
        <p className="text-sm text-[#666d62]">{emptyText}</p>
      ) : (
        children
      )}
    </div>
  </section>
);

const ModerationActions = ({ onApprove, onReject, className = '' }) => (
  <div className={`flex shrink-0 gap-2 ${className}`}>
    <button onClick={onApprove} className="btn-secondary px-3 py-2">
      <CheckCircle2 className="h-4 w-4" />
      Approve
    </button>
    <button
      onClick={onReject}
      className="inline-flex items-center gap-2 rounded-md border border-[#8f3024]/30 bg-white px-3 py-2 text-sm font-semibold text-[#8f3024] transition hover:bg-red-50"
    >
      <XCircle className="h-4 w-4" />
      Reject
    </button>
  </div>
);

const DeliveryStat = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg bg-[#f7f5ef] p-4">
    <p className="flex items-center gap-2 text-sm text-[#666d62]">
      <Icon className="h-4 w-4 text-[#2f6f4e]" />
      {label}
    </p>
    <strong className="mt-3 block text-2xl font-semibold text-[#151713]">{value}</strong>
  </div>
);

const QueueCard = ({ icon: Icon, label, value }) => (
  <div className="metric-card">
    <p className="flex items-center gap-2 text-sm text-[#666d62]">
      <Icon className="h-4 w-4 text-[#2f6f4e]" />
      {label}
    </p>
    <strong>{value}</strong>
  </div>
);

const StatusGrid = ({ rows = [], emptyText }) => {
  if (!rows.length) return <p className="mt-4 text-sm text-[#666d62]">{emptyText}</p>;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((row) => (
        <div key={row.status} className="rounded-lg border border-black/10 bg-white p-4">
          <p className="text-sm capitalize text-[#666d62]">{row.status}</p>
          <strong className="mt-2 block text-2xl text-[#151713]">{numberValue(row.count)}</strong>
        </div>
      ))}
    </div>
  );
};

const Notice = ({ tone, children }) => (
  <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
    tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-[#f7f5ef] text-black/80'
  }`}>
    {children}
  </div>
);

const buildMetrics = (overview, pendingWebsites, pendingCreatives, blockedCount) => [
  {
    label: 'Advertisers',
    value: countRows(overview?.users, 'advertiser'),
    icon: Users,
    color: '#315f8c',
    detail: 'Demand-side accounts',
  },
  {
    label: 'Publishers',
    value: countRows(overview?.users, 'publisher'),
    icon: Globe2,
    color: '#2f6f4e',
    detail: 'Supply-side accounts',
  },
  {
    label: 'Pending review',
    value: pendingWebsites + pendingCreatives,
    icon: FileCheck2,
    color: '#7f5b17',
    detail: 'Websites and creatives',
  },
  {
    label: 'Blocked traffic',
    value: blockedCount,
    icon: ShieldAlert,
    color: '#8f3024',
    detail: 'Active IP rules',
  },
];

const sectionCopy = {
  'ad-ops': {
    title: 'Run the network from one operating view.',
    description: 'Track demand, supply, delivery, spend, queue pressure, and recent operator actions.',
  },
  approvals: {
    title: 'Review supply and creatives before they go live.',
    description: 'Approve publisher websites and advertiser creatives with a clean queue built for fast moderation.',
  },
  fraud: {
    title: 'Protect inventory quality and stop suspicious traffic.',
    description: 'Block abusive IPs, review the blocklist, and keep traffic controls visible to operators.',
  },
};

const getActiveSection = (pathname) => {
  if (pathname.includes('/approvals')) return 'approvals';
  if (pathname.includes('/fraud')) return 'fraud';
  return 'ad-ops';
};

const rows = (value) => value || [];

const countRows = (items = [], key) => {
  const row = items.find((item) => item.status === key || item.user_type === key);
  return parseInt(row?.count || 0, 10);
};

const numberValue = (value) => Number(value || 0).toLocaleString();
const moneyValue = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const humanize = (value = '') => value.replace(/_/g, ' ');

export default AdminDashboard;
