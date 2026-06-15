// src/pages/Homepage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BarChart3, CheckCircle2, FileText, Globe2, Radio, ShieldCheck, Smartphone, Truck, WalletCards, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const Homepage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdvertiser, isPublisher, isAdmin } = useAuth();
  const [selectedStudy, setSelectedStudy] = useState(null);

  const enterApp = () => {
    if (!isAuthenticated) navigate('/register');
    else if (isAdmin) navigate('/admin/ad-ops');
    else if (isPublisher) navigate('/publisher/dashboard');
    else if (isAdvertiser) navigate('/dashboard');
    else navigate('/dashboard');
  };

  const primaryCta = isAuthenticated ? 'Open workspace' : 'Open account';

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#151713]">
      <Navbar transparent />

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
          <div>
            <p className="section-kicker">Kenya-first ad network</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight sm:text-7xl">
              Local media buying that feels operational, not experimental.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6258]">
              AfriAds brings advertisers, verified publishers, M-Pesa wallet funding, campaign moderation, and reporting into one controlled marketplace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={enterApp} className="btn-primary">{primaryCta}</button>
              <a href="#workflow" className="btn-secondary">View workflow</a>
            </div>
          </div>

          <div className="dashboard-preview">
            <div className="border-b border-black/10 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Campaign workspace</span>
                <span className="rounded-full bg-[#dff0e7] px-3 py-1 text-xs font-semibold text-[#236245]">Live</span>
              </div>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-lg bg-[#151713] p-5 text-[#f7f5ef]">
                <p className="text-sm text-[#bfc4b8]">Wallet balance</p>
                <p className="mt-3 text-4xl font-semibold">KES 248,400</p>
                <p className="mt-3 text-sm text-[#bfc4b8]">M-Pesa sandbox STK ready</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Reach', '1.2M'],
                  ['Clicks', '8,420'],
                  ['CTR', '1.8%'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white p-4">
                    <p className="text-xs text-[#777c72]">{label}</p>
                    <p className="mt-2 text-xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[0.8fr_1.2fr] gap-4">
                <div className="rounded-lg bg-[#151713] p-4 text-[#f7f5ef]">
                  <WalletCards className="h-5 w-5" />
                  <p className="mt-6 text-xs text-[#bfc4b8]">M-Pesa sandbox</p>
                  <p className="mt-1 text-lg font-semibold">STK ready</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-[#eef4ff] p-4">
                  <p className="text-xs uppercase text-[#4f668a]">Publisher quality</p>
                  <div className="mt-4 h-2 rounded-full bg-white">
                    <div className="h-2 w-4/5 rounded-full bg-[#315f95]" />
                  </div>
                  <p className="mt-3 text-sm text-[#4f668a]">80% verified supply this week</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="network" className="border-y border-black/10 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="section-kicker">Network layer</p>
              <h2 className="section-title">Built like an operator console, not a marketing template.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="feature-panel">
                  <Icon className="h-6 w-6 text-[#2f6f4e]" />
                  <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5d6258]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="formats" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="section-kicker">Ad formats</p>
                <h2 className="section-title">Position AfriAds as more than display banners.</h2>
                <p className="mt-5 text-sm leading-7 text-[#5d6258]">
                  Suss presents itself as a multi-channel African ad platform. AfriAds should do the same, while clearly marking what is live, sandboxed, or planned.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {formats.map(({ icon: Icon, title, status, copy }) => (
                  <div key={title} className="rounded-lg border border-black/10 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <Icon className="h-5 w-5 text-[#2f6f4e]" />
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        status === 'Live' ? 'bg-[#dff0e7] text-[#236245]' : 'bg-[#eef4ff] text-[#315f95]'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <h3 className="mt-7 text-lg font-semibold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#5d6258]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="border-y border-black/10 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-kicker">Campaign intelligence</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#151713] sm:text-5xl">
                Field notes from campaigns worth repeating.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5d6258]">
                Not flat blog cards. Each playbook shows the media signal, format mix, controls, and reporting outcome a buyer would care about.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {caseStudies.map((study) => (
                <article key={study.title} className="group overflow-hidden rounded-xl border border-black/10 bg-[#f7f5ef] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(21,23,19,0.12)]">
                  <div className={`relative h-52 overflow-hidden ${study.art.bg}`}>
                    <div className="absolute inset-0 bg-[#151713]/10" />
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#151713] backdrop-blur">
                      <study.icon className="h-3.5 w-3.5 text-[#2f6f4e]" />
                      {study.channel}
                    </div>
                    {study.art.device && (
                      <div className="absolute right-5 top-10 h-28 w-16 rounded-[1.4rem] border-4 border-[#151713] bg-white shadow-2xl">
                        <div className="mx-auto mt-2 h-1 w-6 rounded-full bg-[#151713]/20" />
                        <div className="m-2 mt-4 rounded-md bg-[#e7ecdf] p-2 text-center text-[10px] font-bold text-[#2f6f4e]">
                          AfriAds
                        </div>
                      </div>
                    )}
                    {study.art.shape === 'bars' && (
                      <div className="absolute right-5 top-10 flex h-28 items-end gap-2">
                        {[48, 72, 56, 94].map((height) => (
                          <span key={height} className="w-8 rounded-t-md bg-white/80" style={{ height }} />
                        ))}
                      </div>
                    )}
                    {study.art.shape === 'route' && (
                      <div className="absolute right-4 top-8 h-32 w-32 rounded-full border-8 border-white/70">
                        <div className="absolute left-8 top-10 h-6 w-12 rounded-full bg-[#151713]" />
                        <div className="absolute left-12 top-16 h-3 w-3 rounded-full bg-[#dff0e7]" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-lg border border-white/30 bg-white/90 p-4 backdrop-blur">
                        <p className="text-xs font-semibold uppercase text-[#5d6258]">{study.art.label}</p>
                        <div className="mt-2 flex items-end justify-between">
                          <p className="text-3xl font-black leading-none text-[#151713]">{study.art.stat}</p>
                          <span className="text-xs font-semibold text-[#2f6f4e]">{study.stage}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-[#151713]">{study.title}</h3>
                    <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[#5d6258]">{study.copy}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {study.stack.map((item) => (
                        <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#5d6258]">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {study.metrics.map(([label, value]) => (
                        <div key={label} className="rounded-md bg-white p-3">
                          <p className="text-xs text-[#777c72]">{label}</p>
                          <p className="mt-1 text-base font-semibold text-[#151713]">{value}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudy(study)}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2f6f4e] hover:underline"
                    >
                      Open playbook
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {selectedStudy && (
          <div className="fixed inset-0 z-[80] flex items-end bg-[#151713]/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-[#f7f5ef] shadow-2xl">
              <div className="flex items-start justify-between border-b border-black/10 bg-white p-6">
                <div>
                  <p className="section-kicker">{selectedStudy.channel}</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight text-[#151713]">{selectedStudy.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudy(null)}
                  className="rounded-md border border-black/10 bg-white p-2 text-[#5d6258] hover:bg-[#f7f5ef]"
                  aria-label="Close case study"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-[0.95fr_1.05fr]">
                <div className={`min-h-72 rounded-xl ${selectedStudy.art.bg} p-5 text-white`}>
                  <selectedStudy.icon className="h-7 w-7" />
                  <p className="mt-20 text-sm text-white/80">{selectedStudy.art.label}</p>
                  <p className="mt-2 text-5xl font-black">{selectedStudy.art.stat}</p>
                  <p className="mt-4 text-sm leading-6 text-white/80">{selectedStudy.copy}</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#151713]">Campaign architecture</h4>
                  <div className="mt-4 grid gap-3">
                    {selectedStudy.playbook.map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#777c72]">{label}</p>
                        <p className="mt-2 text-sm leading-6 text-[#151713]">{value}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={enterApp} className="btn-primary mt-6 w-full justify-center">
                    {isAuthenticated ? 'Open workspace' : 'Build a campaign like this'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <section id="workflow" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="section-kicker">Workflow</p>
                <h2 className="section-title">The path from wallet top-up to verified delivery.</h2>
              </div>
              <div className="grid gap-3">
                {steps.map((step, index) => (
                  <div key={step} className="flex items-center gap-4 rounded-lg border border-black/10 bg-white p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#151713] text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{step}</span>
                    <CheckCircle2 className="ml-auto h-5 w-5 text-[#2f6f4e]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="border-y border-black/10 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="section-kicker">Trust layer</p>
                <h2 className="section-title">Controls for the parts of ad networks that usually get messy.</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {trust.map(([title, copy]) => (
                  <div key={title} className="rounded-lg border border-black/10 bg-[#f7f5ef] p-5">
                    <h3 className="text-base font-semibold text-[#151713]">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#5d6258]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-xl bg-[#151713] p-8 text-[#f7f5ef]">
                <p className="text-xs font-semibold uppercase text-[#9cbba9]">Legitimacy layer</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight">Make trust visible before sales calls.</h2>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {['Publisher review', 'Creative approval', 'Fraud blocklist'].map((item) => (
                    <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-[#d9ddcf]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-8">
                <p className="section-kicker">Payment rails</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight">Show buyers and publishers how money moves.</h2>
                <div className="mt-8 grid gap-3 sm:grid-cols-4">
                  {['M-Pesa', 'Card', 'Bank', 'Payouts'].map((method) => (
                    <div key={method} className="rounded-lg bg-[#f7f5ef] p-4 text-center text-sm font-semibold">
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#151713] py-20 text-[#f7f5ef]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase text-[#9cbba9]">Commercial model</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">
                Start lean, prove local demand, then scale with data.
              </h2>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm leading-7 text-[#c6cabb]">
                Self-service campaign tools, local wallet payments, publisher approvals, and performance reporting. Built to graduate into managed campaigns, category sponsorships, and agency workflows.
              </p>
              <button onClick={enterApp} className="mt-8 rounded-md bg-[#f7f5ef] px-5 py-3 text-sm font-semibold text-[#151713]">
                {primaryCta}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const features = [
  { icon: Globe2, title: 'Verified supply', description: 'Publishers submit websites and zones for approval before inventory is sold.' },
  { icon: Smartphone, title: 'M-Pesa funding', description: 'Advertisers can validate the wallet flow in sandbox before going live.' },
  { icon: ShieldCheck, title: 'Moderation', description: 'Creatives, websites, and suspicious traffic have real operator controls.' },
  { icon: BarChart3, title: 'Reporting', description: 'Delivery, spend, clicks, and CTR stay visible in practical dashboards.' },
];

const formats = [
  { icon: BarChart3, title: 'Display Ads', status: 'Live', copy: 'Standard banners and placements across approved publisher sites.' },
  { icon: Smartphone, title: 'Push and Interstitial', status: 'Planned', copy: 'Mobile-first engagement formats for high-intent campaign moments.' },
  { icon: Globe2, title: 'Native Ads', status: 'Planned', copy: 'Content-led placements designed to sit naturally inside publisher environments.' },
  { icon: Radio, title: 'Radio and Audio', status: 'Planned', copy: 'A future lane for regional reach when inventory partnerships are ready.' },
  { icon: Truck, title: 'Transit and pDOOH', status: 'Planned', copy: 'A roadmap lane for matatu, outdoor, and place-based media buying.' },
  { icon: FileText, title: 'Messaging Ads', status: 'Planned', copy: 'WhatsApp, Telegram, and SMS-style campaign workflows as the platform matures.' },
];

const caseStudies = [
  {
    channel: 'Awareness',
    icon: Radio,
    title: 'How AfriAds accelerated an electric mobility launch',
    copy: 'Turning awareness into action for a Nairobi mobility brand using verified display inventory.',
    metrics: [['Reach', '1.2M'], ['Window', '5 days']],
    stage: 'Launch',
    stack: ['Display', 'Geo focus', 'Daily pacing'],
    playbook: [
      ['Audience signal', 'Urban commuters, mobility readers, and high-frequency local news inventory.'],
      ['Media mix', 'Verified display placements with daily pacing and creative approval before activation.'],
      ['Control layer', 'Publisher review, fraud blocklist monitoring, and wallet-funded spend control.'],
    ],
    art: { bg: 'bg-[#3910a8]', label: 'Electric mobility', stat: '1.2M', shape: 'route' },
  },
  {
    channel: 'Performance',
    icon: WalletCards,
    title: 'Powering wallet adoption across mobile-first audiences',
    copy: 'A fintech-style campaign template built around clicks, top-up intent, and payment traceability.',
    metrics: [['CTR', '2.4%'], ['CPC', 'KES 18']],
    stage: 'Scale',
    stack: ['Fintech', 'Mobile', 'CPC'],
    playbook: [
      ['Audience signal', 'Mobile-first users on publisher categories where finance and utility content over-index.'],
      ['Media mix', 'Display now, with messaging and push as planned expansion modules for retargeting.'],
      ['Control layer', 'M-Pesa wallet funding, daily performance reporting, and creative compliance checks.'],
    ],
    art: { bg: 'bg-[#0abf83]', label: 'Wallet growth', stat: '2.4%', device: true },
  },
  {
    channel: 'Ticketing',
    icon: Smartphone,
    title: 'Driving high-impact bookings for events and cinemas',
    copy: 'A mobile display campaign pattern for ticketing platforms that need high-intent reach.',
    metrics: [['Bookings', '+28%'], ['CTR', '1.9%']],
    stage: 'Intent',
    stack: ['Mobile', 'Events', 'Retargeting'],
    playbook: [
      ['Audience signal', 'Entertainment, events, campus, lifestyle, and city-guide publisher environments.'],
      ['Media mix', 'Mobile display placements with creative variants for events, cinema, and transport contexts.'],
      ['Control layer', 'Moderated creatives, live CTR tracking, and campaign-level spend caps.'],
    ],
    art: { bg: 'bg-[#cfefff]', label: 'Mobile ticketing', stat: '+28%', device: true },
  },
  {
    channel: 'Weather trigger',
    icon: ShieldCheck,
    title: 'Weather-triggered retail campaign across Kenya',
    copy: 'A template for campaigns that should respond to weather, location, and seasonal demand.',
    metrics: [['Markets', '4'], ['Lift', '+31%']],
    stage: 'Signal',
    stack: ['Weather', 'Retail', 'Regions'],
    playbook: [
      ['Audience signal', 'Regional inventory grouped around weather-sensitive demand moments.'],
      ['Media mix', 'Display placements supported by planned contextual triggers as the platform matures.'],
      ['Control layer', 'Market-level pacing, approved publishers, and creative rotation by condition.'],
    ],
    art: { bg: 'bg-[#26302c]', label: 'Weather signal', stat: '+31%', shape: 'bars' },
  },
  {
    channel: 'B2B scale',
    icon: Globe2,
    title: 'Delivering global scale for industrial procurement',
    copy: 'A B2B campaign model for sourcing, import, and procurement audiences across niche publisher inventory.',
    metrics: [['Impressions', '35.5M'], ['Markets', '8']],
    stage: 'B2B',
    stack: ['Procurement', 'Niche supply', 'CPM'],
    playbook: [
      ['Audience signal', 'Business, trade, logistics, finance, and procurement-adjacent inventory clusters.'],
      ['Media mix', 'High-reach CPM buys across verified publisher supply and planned B2B native placements.'],
      ['Control layer', 'Frequency discipline, budget pacing, and transparent end-of-campaign reporting.'],
    ],
    art: { bg: 'bg-[#3f3328]', label: 'B2B reach', stat: '35.5M', shape: 'bars' },
  },
  {
    channel: 'Messaging',
    icon: FileText,
    title: 'Telegram ads for SME finance engagement',
    copy: 'A messaging-led campaign pattern for efficient reach, strong engagement, and retargeting readiness.',
    metrics: [['Engagement', '+42%'], ['Window', '14 days']],
    stage: 'Engage',
    stack: ['Messaging', 'SME', 'Leads'],
    playbook: [
      ['Audience signal', 'SME owners, finance readers, and community-led channels prepared for messaging inventory.'],
      ['Media mix', 'Display today, with Telegram and WhatsApp-style workflows represented as planned modules.'],
      ['Control layer', 'Lead-intent reporting, creative approvals, and auditable campaign funding.'],
    ],
    art: { bg: 'bg-[#08b883]', label: 'SME finance', stat: '+42%', device: true },
  },
];

const steps = [
  'Create campaign and define the budget.',
  'Top up wallet through M-Pesa sandbox.',
  'Upload creatives for approval.',
  'Launch, measure, and scale delivery.',
];

const trust = [
  ['Supply review', 'Publisher websites move through approval before inventory is sold.'],
  ['Creative moderation', 'Campaign assets can be checked before they reach live placements.'],
  ['Fraud controls', 'Suspicious traffic can be tracked, blocked, and reviewed by operators.'],
];

export default Homepage;
