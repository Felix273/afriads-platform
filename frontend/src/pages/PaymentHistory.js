// src/pages/PaymentHistory.js
import React, { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Filter, Phone, Plus, ReceiptText, WalletCards } from 'lucide-react';
import Navbar from '../components/Navbar';
import { paymentAPI } from '../services/paymentService';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instructions, setInstructions] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, statsRes, mpesaRes] = await Promise.all([
        paymentAPI.getAll(),
        paymentAPI.getStats(),
        paymentAPI.getMpesaStatus(),
      ]);
      setPayments(paymentsRes.data.payments || []);
      setStats(statsRes.data.stats || null);
      setMpesaStatus(mpesaRes.data.mpesa || null);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPayments = payments.filter((payment) => filter === 'all' || payment.status === filter);

  const handleCreatePayment = async (event) => {
    event.preventDefault();
    setFormError('');
    setInstructions(null);

    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Enter a valid amount');
      return;
    }

    if (paymentMethod === 'mpesa' && mpesaStatus?.configured === false) {
      setFormError(`M-Pesa sandbox is missing: ${mpesaStatus.missing.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await paymentAPI.create({
        amount: parseFloat(amount),
        currency: 'KES',
        payment_method: paymentMethod,
        phone_number: paymentMethod === 'mpesa' ? phoneNumber : undefined,
        description: 'Advertiser wallet top up',
      });

      setInstructions(response.data.payment_instructions);
      setAmount('');
      setPhoneNumber('');
      await fetchData();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="aa-wide py-8">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="data-card p-6 sm:p-8">
            <p className="section-kicker">Wallet</p>
            <h1 className="aa-heading mt-3">
              Fund campaigns through a controlled payment flow.
            </h1>
            <p className="aa-body mt-4">
              Start with the M-Pesa sandbox, verify STK push behavior, then switch to live credentials when the account is approved.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="Payments" value={stats?.total_payments || 0} icon={ReceiptText} color="#315f8c" />
              <Metric label="Completed" value={`KES ${parseFloat(stats?.total_completed || 0).toFixed(2)}`} icon={CheckCircle2} color="#2f6f4e" />
              <Metric label="Pending" value={`KES ${parseFloat(stats?.total_pending || 0).toFixed(2)}`} icon={WalletCards} color="#2f6f4e" />
            </div>
          </div>

          <div className="data-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Top Up</p>
                <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Add campaign funds</h2>
              </div>
              <MpesaBadge status={mpesaStatus} />
            </div>

            {formError && (
              <div className="mt-5 rounded-lg bg-[#f7f5ef] px-4 py-3 text-sm font-medium text-black/80">
                {formError}
              </div>
            )}

            {instructions && (
              <div className="mt-5 rounded-lg bg-[#f7f5ef] p-4 text-sm text-black/80">
                <p className="font-semibold">M-Pesa STK push sent</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <span>Phone: {instructions.phone_number}</span>
                  <span>Amount: KES {parseFloat(instructions.amount || 0).toFixed(2)}</span>
                  <span>Reference: {instructions.account_reference}</span>
                  <span>Checkout: {instructions.checkout_request_id}</span>
                </div>
                <p className="mt-3">{instructions.customer_message}</p>
              </div>
            )}

            <form onSubmit={handleCreatePayment} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="5000"
                    className="form-input"
                  />
                </Field>
                <Field label="Method">
                  <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="form-input">
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </Field>
              </div>
              {paymentMethod === 'mpesa' && (
                <Field label="M-Pesa Phone Number">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8175]" />
                    <input
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="254712345678"
                      className="form-input pl-11"
                    />
                  </div>
                </Field>
              )}
              <button
                type="submit"
                disabled={submitting || (paymentMethod === 'mpesa' && mpesaStatus?.configured === false)}
                className="btn-primary justify-center disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {submitting ? 'Initiating...' : 'Initiate payment'}
              </button>
            </form>
          </div>
        </section>

        <section className="data-card mt-6 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-[#e0ddd3] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-kicker">Ledger</p>
              <h2 className="mt-2 text-[28px] font-normal leading-[1.14] text-[#151713]">Payment history</h2>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="h-4 w-4 shrink-0 text-[#666d62]" />
              {['all', 'completed', 'pending', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    filter === status
                      ? 'bg-[#2f6f4e] text-white'
                      : 'bg-[#f7f5ef] text-black/70 hover:underline'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center text-sm text-[#666d62]">Loading payments...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e0ddd3] text-xs font-semibold uppercase text-[#6b7268]">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Transaction</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebe7dc]">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center text-[#666d62]">
                          <CreditCard className="mx-auto mb-3 h-8 w-8 text-[#b9b5aa]" />
                          No payments found
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="transition hover:bg-[#f7f5ef]">
                          <td className="px-4 py-4 text-[#30342e]">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-4 font-semibold text-[#151713]">{payment.transaction_id || '-'}</td>
                          <td className="px-4 py-4 text-[#30342e]">KES {parseFloat(payment.amount || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-[#30342e]">{payment.payment_method}</td>
                          <td className="px-4 py-4"><StatusPill status={payment.status} /></td>
                          <td className="px-4 py-4 text-[#5f665b]">{payment.description || '-'}</td>
                        </tr>
                      ))
                    )}
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

const Field = ({ label, children }) => (
  <label className="block">
    <span className="form-label">{label}</span>
    <span className="mt-2 block">{children}</span>
  </label>
);

const Metric = ({ label, value, icon: Icon, color }) => (
  <div className="metric-card">
    <p className="flex items-center gap-2 text-sm text-[#666d62]">
      <Icon className="h-4 w-4" style={{ color }} />
      {label}
    </p>
    <strong>{value}</strong>
  </div>
);

const MpesaBadge = ({ status }) => {
  if (!status) {
    return (
      <span className="rounded-[980px] bg-[#f7f5ef] px-3 py-1 text-xs font-semibold text-black/60">
        Checking M-Pesa
      </span>
    );
  }

  return (
    <span className={`rounded-[980px] px-3 py-1 text-xs font-semibold ${
      status.configured
        ? 'bg-[#2f6f4e] text-white'
        : 'bg-[#f7f5ef] text-black/60'
    }`}>
      {status.configured ? `${status.environment} ready` : 'M-Pesa setup needed'}
    </span>
  );
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
    status === 'completed'
      ? 'bg-[#2f6f4e] text-white'
      : 'bg-[#f7f5ef] text-black/60'
  }`}>
    {status}
  </span>
);

export default PaymentHistory;
