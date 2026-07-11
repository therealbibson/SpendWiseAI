import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Calendar, DollarSign, RefreshCw, Trash2, Pause, Play, AlertCircle, Check, ExternalLink
} from 'lucide-react';

const Subscriptions = () => {
  const { darkMode } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextPayment, setNextPayment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const data = await api.getSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return setError('Invalid amount.');
    if (!walletAddress) return setError('Recipient address is required.');
    if (!nextPayment) return setError('First payment date is required.');

    setSubmitting(true);
    setError('');

    try {
      await api.createSubscription({
        name,
        amount: parseFloat(amount),
        walletAddress,
        frequency,
        nextPayment: new Date(nextPayment).toISOString()
      });
      setOpenModal(false);
      setName('');
      setAmount('');
      setWalletAddress('');
      setNextPayment('');
      fetchSubscriptions();
    } catch (err) {
      setError(err.message || 'Failed to create subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (sub) => {
    try {
      const newStatus = sub.status === 'active' ? 'paused' : 'active';
      await api.updateSubscription(sub._id, { status: newStatus });
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscription?')) return;
    try {
      await api.deleteSubscription(id);
      fetchSubscriptions();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Subscription Manager
          </h2>
          <p className="text-gray-400 text-sm">Schedule automated recurring stablecoin transactions on-chain.</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-[#080B11] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* SUBSCRIPTION LIST */}
      {subscriptions.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border border-dashed ${
          darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'
        }`}>
          No subscriptions scheduled. Click "New Subscription" to set up recurring cUSD payments.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => {
            const isActive = sub.status === 'active';
            
            return (
              <div 
                key={sub._id} 
                className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? 'bg-[#0D121F] border-gray-850' : 'bg-white border-gray-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-200">{sub.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleToggleStatus(sub)}
                        className={`p-1.5 rounded-lg border transition ${
                          darkMode ? 'border-gray-800 hover:bg-gray-800 text-gray-400' : 'border-gray-200 hover:bg-gray-55 text-gray-600'
                        }`}
                        title={isActive ? 'Pause' : 'Activate'}
                      >
                        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Recurrent Payment</span>
                    <h4 className="text-xl font-extrabold mt-0.5">
                      ${sub.amount.toFixed(2)}{' '}
                      <span className="text-xs text-gray-450 font-normal">/ {sub.frequency}</span>
                    </h4>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800/10 text-xs">
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Recipient</span>
                    <span className="font-mono text-[10px]">
                      {sub.walletAddress.slice(0, 6)}...{sub.walletAddress.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Next Due Date</span>
                    <span className="font-semibold text-gray-300">
                      {new Date(sub.nextPayment).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW SUBSCRIPTION MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md border p-6 rounded-2xl relative shadow-2xl ${
            darkMode ? 'bg-[#0D121F] border-gray-850 text-gray-100' : 'bg-white border-gray-200 text-gray-850'
          }`}>
            <h3 className="text-lg font-bold mb-2">Create Subscription</h3>
            <p className="text-xs text-gray-500 mb-6">Authorize recurring on-chain transfers. The agent signs these autonomously.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Subscription / Merchant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify Premium, Rent Payment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Amount (cUSD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="15.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  >
                    <option value="daily">Daily (for testing)</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Recipient Celo Wallet Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  First Execution Date
                </label>
                <input
                  type="date"
                  required
                  value={nextPayment}
                  onChange={(e) => setNextPayment(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] rounded-xl text-xs font-bold flex items-center justify-center animate-pulse"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-[#080B11]/25 border-t-[#080B11] rounded-full animate-spin"></span>
                  ) : (
                    'Authorize Payments'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Subscriptions;
