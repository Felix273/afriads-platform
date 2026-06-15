// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Eye,
  MousePointerClick,
  Plus,
  RadioTower,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { campaignAPI } from '../services/api';

const money = (value) => `KES ${Number(value || 0).toFixed(2)}`;

const Dashboard = () => {
  const { user, isAdvertiser, isPublisher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadCampaigns = async () => {
    try {
      const response = await campaignAPI.getAll({ limit: 5 });
      const campaignsData = response.data.data.campaigns || [];
      setCampaigns(campaignsData);

      setStats({
        totalCampaigns: campaignsData.length,
        activeCampaigns: campaignsData.filter((campaign) => campaign.status === 'active').length,
        totalSpent: campaignsData.reduce((sum, campaign) => sum + parseFloat(campaign.total_spend || 0), 0),
        totalImpressions: campaignsData.reduce((sum, campaign) => sum + parseInt(campaign.total_impressions || 0, 10), 0),
        totalClicks: campaignsData.reduce((sum, campaign) => sum + parseInt(campaign.total_clicks || 0, 10), 0),
      });
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPublisher) {
      navigate('/publisher/dashboard');
    } else if (isAdmin) {
      navigate('/admin/ad-ops');
    } else if (isAdvertiser) {
      loadCampaigns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublisher, isAdmin, isAdvertiser, navigate]);

  const ctr = stats.totalImpressions > 0
    ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="app-shell">
      <Navbar />

      <main className="aa-wide py-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="data-card p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-kicker">Advertiser Workspace</p>
                <h1 className="aa-heading mt-3 max-w-3xl">
                  Campaign control for every shilling in market.
                </h1>
                <p className="aa-body mt-4 max-w-2xl">
                  {user?.company_name || user?.first_name
                    ? `${user?.company_name || user?.first_name}, your account is ready to plan, fund, approve, and measure local display campaigns.`
                    : 'Plan, fund, approve, and measure local display campaigns from one operational surface.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/analytics')} className="btn-secondary">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </button>
                <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
                  <Plus className="h-4 w-4" />
                  New campaign
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="metric-card">
                <p className="flex items-center gap-2 text-sm text-black/60">
                  <RadioTower className="h-4 w-4 text-[#2f6f4e]" />
                  Campaigns
                </p>
                <strong>{stats.totalCampaigns}</strong>
              </div>
              <div className="metric-card">
                <p className="flex items-center gap-2 text-sm text-black/60">
                  <Activity className="h-4 w-4 text-[#2f6f4e]" />
                  Active
                </p>
                <strong>{stats.activeCampaigns}</strong>
              </div>
              <div className="metric-card">
                <p className="text-sm text-black/60">Spend</p>
                <strong>{money(stats.totalSpent)}</strong>
              </div>
              <div className="metric-card">
                <p className="flex items-center gap-2 text-sm text-black/60">
                  <Eye className="h-4 w-4 text-[#2f6f4e]" />
                  Impressions
                </p>
                <strong>{stats.totalImpressions.toLocaleString()}</strong>
              </div>
              <div className="metric-card">
                <p className="flex items-center gap-2 text-sm text-black/60">
                  <MousePointerClick className="h-4 w-4 text-[#2f6f4e]" />
                  CTR
                </p>
                <strong>{ctr}%</strong>
              </div>
            </div>
          </div>

          <aside className="data-card p-6">
            <p className="section-kicker">Readiness</p>
            <h2 className="mt-3 text-[28px] font-normal leading-[1.14] text-[#151713]">Launch queue</h2>
            <div className="mt-6 space-y-4">
              {[
                ['Audience', 'Kenya traffic segments and publisher channels'],
                ['Funding', 'M-Pesa sandbox payments are available for test flows'],
                ['Creative', 'Upload assets and send them for moderation'],
              ].map(([title, detail]) => (
                <div key={title} className="border-l-2 border-[#2f6f4e] pl-4">
                  <p className="text-sm font-semibold text-[#151713]">{title}</p>
                  <p className="mt-1 text-sm leading-[1.29] text-black/70">{detail}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/payments')} className="btn-secondary mt-7 w-full justify-center">
              <CreditCard className="h-4 w-4" />
              Payment history
            </button>
          </aside>
        </section>

        <section className="data-card mt-6 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-kicker">Recent Work</p>
              <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Campaigns</h2>
            </div>
            <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
              <Plus className="h-4 w-4" />
              Create campaign
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center text-sm text-black/50">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="mx-auto max-w-md py-12 text-center">
                <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">No campaigns yet</h3>
                <p className="mt-2 text-sm leading-[1.29] text-black/70">
                  Start with one focused campaign: choose placement, upload creative, fund it, then watch delivery.
                </p>
                <button onClick={() => navigate('/campaigns/new')} className="btn-primary mx-auto mt-6">
                  <Plus className="h-4 w-4" />
                  Build first campaign
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="aa-table">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">Campaign</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Budget</th>
                      <th className="px-4 py-3">Impressions</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">CTR</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => {
                      const campaignCtr = campaign.total_impressions > 0
                        ? ((campaign.total_clicks / campaign.total_impressions) * 100).toFixed(2)
                        : '0.00';

                      return (
                        <tr
                          key={campaign.id}
                          onClick={() => navigate(`/campaigns/${campaign.id}/creatives`)}
                          className="cursor-pointer transition hover:bg-[#f7f5ef]"
                        >
                          <td className="px-4 py-4 font-semibold text-[#151713]">{campaign.name}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              campaign.status === 'active'
                                ? 'bg-[#2f6f4e] text-white'
                                : 'bg-[#f7f5ef] text-black/60'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-black/80">{money(campaign.total_budget)}</td>
                          <td className="px-4 py-4 text-black/80">
                            {parseInt(campaign.total_impressions || 0, 10).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-black/80">
                            {parseInt(campaign.total_clicks || 0, 10).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-black/80">{campaignCtr}%</td>
                          <td className="px-4 py-4 text-right">
                            <ArrowUpRight className="ml-auto h-4 w-4 text-[#2f6f4e]" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Live now', 'Display placements', 'Approved publisher inventory and creative moderation.'],
            ['Next', 'Native and push', 'Mobile-first formats prepared as inventory modules mature.'],
            ['Partnerships', 'pDOOH and transit', 'Roadmap lane for outdoor, matatu, and place-based media.'],
          ].map(([label, title, copy]) => (
            <div key={title} className="rounded-lg border border-black/10 bg-white p-5">
              <p className="section-kicker">{label}</p>
              <h3 className="mt-4 text-lg font-semibold text-[#151713]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5d6258]">{copy}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
