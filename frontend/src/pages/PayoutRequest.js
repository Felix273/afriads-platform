// src/pages/PayoutRequest.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, DollarSign, WalletCards } from 'lucide-react';
import Navbar from '../components/Navbar';
import { payoutAPI } from '../services/paymentService';

const PayoutRequest = () => {
  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [accountDetails, setAccountDetails] = useState({ paypal_email: '', bank_account: '', mpesa_number: '' });
  const [description, setDescription] = useState('');
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [minimumPayout, setMinimumPayout] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBalance, setUserBalance] = useState(0);

  const fetchData = async () => {
    try {
      const [payoutsRes, statsRes, minRes] = await Promise.all([
        payoutAPI.getAll(),
        payoutAPI.getStats(),
        payoutAPI.getMinimum(),
      ]);
      setPayouts(payoutsRes.data.payouts || []);
      setStats(statsRes.data.stats || null);
      setMinimumPayout(minRes.data.minimum_payout);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserBalance(parseFloat(user.balance || 0));
    } catch (fetchError) {
      console.error('Error fetching payout data:', fetchError);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid payout amount');
      return;
    }
    if (parseFloat(amount) < minimumPayout) {
      setError(`Minimum payout amount is KES ${minimumPayout}`);
      return;
    }
    if (parseFloat(amount) > userBalance) {
      setError('Insufficient balance');
      return;
    }

    const details = getDetails(payoutMethod, accountDetails);
    if (!details) {
      setError('Enter payout account details');
      return;
    }

    try {
      setLoading(true);
      await payoutAPI.request({
        amount: parseFloat(amount),
        payout_method: payoutMethod,
        account_details: details,
        description: description || 'Payout request',
      });
      setSuccess('Payout request submitted for review.');
      setAmount('');
      setDescription('');
      fetchData();
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Failed to submit payout request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this payout request?')) return;
    try {
      await payoutAPI.cancel(id);
      setSuccess('Payout request cancelled.');
      fetchData();
    } catch (cancelError) {
      setError(cancelError.response?.data?.error || 'Failed to cancel payout');
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="aa-wide py-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="data-card p-6 sm:p-8">
            <p className="section-kicker">Publisher Payouts</p>
            <h1 className="aa-heading mt-3 max-w-3xl">Request earned revenue with review controls.</h1>
            <p className="aa-body mt-4 max-w-2xl">
              Submit payout requests against the available publisher balance. Operations can review pending requests before money leaves the platform.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric icon={WalletCards} label="Available" value={`KES ${userBalance.toFixed(2)}`} />
              <Metric icon={DollarSign} label="Minimum" value={`KES ${minimumPayout}`} />
              <Metric icon={CheckCircle} label="Requests" value={stats?.total_payouts || 0} />
            </div>
          </div>

          <aside className="data-card p-6">
            <p className="section-kicker">Stats</p>
            <div className="mt-5 space-y-4">
              {[
                ['Completed', stats?.total_paid],
                ['Pending', stats?.total_pending],
                ['Processing', stats?.total_processing],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-t border-black/[0.06] pt-4 first:border-t-0 first:pt-0">
                  <span className="text-sm text-black/60">{label}</span>
                  <strong className="text-sm text-[#151713]">KES {parseFloat(value || 0).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="data-card mt-6 p-6 sm:p-8">
          <h2 className="text-[28px] font-normal leading-[1.14] text-[#151713]">New payout request</h2>
          {(error || success) && (
            <div className="mt-5 grid gap-3">
              {error && <div className="rounded-lg bg-[#f7f5ef] px-4 py-3 text-sm text-black/80">{error}</div>}
              {success && <div className="rounded-lg bg-[#f7f5ef] px-4 py-3 text-sm text-black/80">{success}</div>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-2">
            <Field label="Amount">
              <input type="number" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="form-input" placeholder="0.00" required />
            </Field>
            <Field label="Payout Method">
              <select value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)} className="form-input">
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mpesa">M-Pesa</option>
              </select>
            </Field>
            {payoutMethod === 'paypal' && (
              <Field label="PayPal Email">
                <input type="email" value={accountDetails.paypal_email} onChange={(event) => setAccountDetails({ ...accountDetails, paypal_email: event.target.value })} className="form-input" required />
              </Field>
            )}
            {payoutMethod === 'mpesa' && (
              <Field label="M-Pesa Number">
                <input type="tel" value={accountDetails.mpesa_number} onChange={(event) => setAccountDetails({ ...accountDetails, mpesa_number: event.target.value })} className="form-input" placeholder="254712345678" required />
              </Field>
            )}
            {payoutMethod === 'bank_transfer' && (
              <Field label="Bank Account Details">
                <textarea value={accountDetails.bank_account} onChange={(event) => setAccountDetails({ ...accountDetails, bank_account: event.target.value })} className="form-input min-h-[110px]" required />
              </Field>
            )}
            <Field label="Description">
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="form-input min-h-[110px]" placeholder="Optional note" />
            </Field>
            <button type="submit" disabled={loading} className="btn-primary lg:col-span-2">
              {loading ? 'Submitting...' : 'Request payout'}
            </button>
          </form>
        </section>

        <section className="data-card mt-6 overflow-hidden">
          <div className="border-b border-black/[0.06] px-6 py-5">
            <h2 className="text-[28px] font-normal leading-[1.14] text-[#151713]">Payout history</h2>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="aa-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-black/50">No payout requests yet</td>
                  </tr>
                ) : payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td>{new Date(payout.requested_at).toLocaleDateString()}</td>
                    <td className="font-semibold text-[#151713]">KES {parseFloat(payout.amount).toFixed(2)}</td>
                    <td>{payout.payout_method}</td>
                    <td><StatusPill status={payout.status} /></td>
                    <td>
                      {payout.status === 'pending' && (
                        <button onClick={() => handleCancel(payout.id)} className="aa-link">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

const getDetails = (method, details) => {
  if (method === 'paypal' && details.paypal_email) return { paypal_email: details.paypal_email };
  if (method === 'bank_transfer' && details.bank_account) return { bank_account: details.bank_account };
  if (method === 'mpesa' && details.mpesa_number) return { mpesa_number: details.mpesa_number };
  return null;
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="form-label">{label}</span>
    <span className="mt-2 block">{children}</span>
  </label>
);

const Metric = ({ icon: Icon, label, value }) => (
  <div className="metric-card">
    <p className="flex items-center gap-2 text-sm text-black/60">
      <Icon className="h-4 w-4 text-[#2f6f4e]" />
      {label}
    </p>
    <strong>{value}</strong>
  </div>
);

const StatusPill = ({ status }) => (
  <span className={`inline-flex rounded-[980px] px-3 py-1 text-xs font-semibold ${
    status === 'processing' ? 'bg-[#2f6f4e] text-white' : 'bg-[#f7f5ef] text-black/60'
  }`}>
    {status}
  </span>
);

export default PayoutRequest;
