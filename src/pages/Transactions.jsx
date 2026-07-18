import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
  ExternalLink, FileSpreadsheet, AlertCircle, Sparkles, Check, RefreshCw
} from 'lucide-react';

const Transactions = () => {
  const { darkMode, refreshWalletBalance } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [type, setType] = useState('');

  // Add Transaction Modal State
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [txCategory, setTxCategory] = useState('food');
  const [txType, setTxType] = useState('expense');
  const [txMethod, setTxMethod] = useState('cash');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState('USDm');

  // Import Statement simulation
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // On-chain sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Savings', 'General'];

  const categoryColors = {
    food: 'bg-orange-500/10 text-orange-400',
    transport: 'bg-blue-500/10 text-blue-400',
    shopping: 'bg-purple-500/10 text-purple-400',
    bills: 'bg-red-500/10 text-red-400',
    savings: 'bg-emerald-500/10 text-emerald-400',
    entertainment: 'bg-pink-500/10 text-pink-400',
    health: 'bg-teal-500/10 text-teal-400',
    education: 'bg-indigo-500/10 text-indigo-400',
    income: 'bg-green-500/10 text-green-400',
    general: 'bg-gray-550/10 text-gray-400'
  };

  const fetchTransactions = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (type) params.type = type;

      const data = await api.getTransactions(params);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, category, paymentMethod, type]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return setError('Invalid transaction amount.');
    if (txMethod === 'celo' && txType === 'expense' && !recipient) {
      return setError('Recipient Celo address is required for blockchain payments.');
    }

    setSubmitting(true);
    setError('');

    try {
      await api.createTransaction({
        title,
        amount: parseFloat(amount),
        category: txCategory,
        type: txType,
        paymentMethod: txMethod,
        recipientAddress: recipient,
        tokenSymbol: txMethod === 'celo' ? tokenSymbol : undefined,
        description
      });
      setOpenModal(false);
      setTitle('');
      setAmount('');
      setRecipient('');
      setDescription('');
      fetchTransactions();
      refreshWalletBalance();
    } catch (err) {
      setError(err.message || 'Transaction registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await api.syncTransactions();
      setSyncMessage(res.message || 'On-chain sync complete.');
      await fetchTransactions();
      refreshWalletBalance();
      setTimeout(() => setSyncMessage(''), 4000);
    } catch (err) {
      setSyncMessage(err.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleImportMock = async () => {
    setImporting(true);
    // Create some premium mock transactions
    const mockTxs = [
      { title: 'Whole Foods Market', amount: 84.50, category: 'Food', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), paymentMethod: 'card', type: 'expense' },
      { title: 'USDm Deposit', amount: 10.00, category: 'Savings', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), paymentMethod: 'celo', type: 'income' },
      { title: 'Shell Gas Station', amount: 45.00, category: 'Transport', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), paymentMethod: 'cash', type: 'expense' },
      { title: 'Starbucks Coffee', amount: 6.75, category: 'Food', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), paymentMethod: 'card', type: 'expense' },
      { title: 'Salary Deposit', amount: 1200.00, category: 'General', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), paymentMethod: 'card', type: 'income' },
      { title: 'Gym Membership', amount: 35.00, category: 'Health', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), paymentMethod: 'card', type: 'expense' },
      { title: 'Netflix Subscription', amount: 15.49, category: 'Bills', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), paymentMethod: 'celo', type: 'expense' }
    ];

    try {
      await api.importTransactions(mockTxs);
      setImportSuccess(true);
      fetchTransactions();
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Transaction History
          </h2>
          <p className="text-gray-400 text-sm">Add manual cash entries or trigger Celo payments.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-[#131926] hover:bg-[#1a2233] border border-gray-800 text-gray-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync On-Chain'}</span>
          </button>
          <button
            onClick={() => setOpenModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-[#080B11] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-xl flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {importSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2 animate-pulse">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Statement imported successfully! Dashboard charts have been populated.</span>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
        darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#131926] border border-gray-850 focus:border-emerald-500/30 rounded-xl text-xs text-gray-300 outline-none transition"
          />
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 bg-[#131926] border border-gray-850 focus:border-emerald-500/30 rounded-xl text-xs text-gray-400 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-3 py-2.5 bg-[#131926] border border-gray-850 focus:border-emerald-500/30 rounded-xl text-xs text-gray-400 outline-none"
          >
            <option value="">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="celo">Celo (USDm)</option>
          </select>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2.5 bg-[#131926] border border-gray-850 focus:border-emerald-500/30 rounded-xl text-xs text-gray-400 outline-none"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

      </div>

      {/* TRANSACTION LIST */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border border-dashed ${
          darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'
        }`}>
          No transactions match your filter criteria. Click "Add Transaction" to start.
        </div>
      ) : (
        <div className={`border rounded-3xl overflow-hidden ${
          darkMode ? 'bg-[#0D121F] border-gray-850' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-800 bg-[#141B2D]/40' : 'border-gray-150 bg-gray-50/50'}`}>
                  <th className="p-4 font-bold text-gray-500">MERCHANT/TITLE</th>
                  <th className="p-4 font-bold text-gray-500 hidden sm:table-cell">CATEGORY</th>
                  <th className="p-4 font-bold text-gray-500 hidden md:table-cell">PAYMENT METHOD</th>
                  <th className="p-4 font-bold text-gray-500 hidden sm:table-cell">DATE</th>
                  <th className="p-4 font-bold text-gray-500 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/10">
                {transactions.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const catClass = categoryColors[tx.category.toLowerCase()] || categoryColors.general;

                  return (
                    <tr key={tx._id} className="hover:bg-gray-800/5 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isExpense ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {isExpense ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tx.title}</p>
                            {tx.description && <p className="text-[10px] text-gray-500 truncate max-w-xs">{tx.description}</p>}
                            {/* Mobile inline metadata */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 sm:hidden">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${catClass}`}>
                                {tx.category}
                              </span>
                              <span className="text-[9px] text-gray-500">
                                {tx.paymentMethod.toUpperCase()} • {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                              {tx.blockchainHash && (
                                <a 
                                  href={`https://celoscan.io/tx/${tx.blockchainHash}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] text-blue-400 hover:underline flex items-center space-x-0.5"
                                >
                                  <span>Tx</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${catClass}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">
                            {tx.paymentMethod}
                          </span>
                          {tx.blockchainHash && (
                            <a 
                              href={`https://celoscan.io/tx/${tx.blockchainHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] text-blue-400 hover:underline flex items-center space-x-0.5 mt-0.5"
                            >
                              <span>Explorer</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-400 hidden sm:table-cell">
                        {new Date(tx.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <p className={`font-extrabold text-sm ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isExpense ? '-' : '+'}{tx.paymentMethod === 'celo' ? '' : '$'}{tx.amount.toFixed(tx.tokenSymbol === 'USDC' || tx.tokenSymbol === 'USDT' ? 2 : 4)}{tx.paymentMethod === 'celo' ? ` ${tx.tokenSymbol || 'USDm'}` : ''}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD TRANSACTION MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md border p-6 rounded-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#0D121F] border-gray-850 text-gray-100' : 'bg-white border-gray-200 text-gray-850'
          }`}>
            <h3 className="text-lg font-bold mb-2">Record Transaction</h3>
            <p className="text-xs text-gray-500 mb-6">Log manual expenses or submit Celo blockchain USDm transfers.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Type
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Payment Method
                  </label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="celo">Celo (USDm)</option>
                  </select>
                </div>
              </div>

              {/* Informative notice for Celo Payments */}
              {txMethod === 'celo' && txType === 'expense' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-xl flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Blockchain Payment Notice:</strong> Selecting Celo triggers an actual on-chain transaction. SpendWise will sign the calldata with your encrypted smart wallet key, appending the registered attribution suffix `celo_25db5a84f655`.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Merchant/Recipient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks, Rent, Faucet Claim"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                />
              </div>

              <div className={txMethod === 'celo' ? 'grid grid-cols-2 gap-4' : ''}>
                {txMethod === 'celo' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Token / Asset
                    </label>
                    <select
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                      className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                    >
                      <option value="CELO">CELO (Celo Native)</option>
                      <option value="USDm">USDm (Mento Dollar)</option>
                      <option value="EURm">EURm (Mento Euro)</option>
                      <option value="USDC">USDC (Circle USDC)</option>
                      <option value="USDT">USDT (Tether USD)</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Amount {txMethod === 'celo' ? `(${tokenSymbol})` : '(USDm / USD)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  />
                </div>
              </div>

              {txMethod === 'celo' && txType === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Recipient Celo Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c.toLowerCase()}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Memo/Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Weekly coffee"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  />
                </div>
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
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] rounded-xl text-xs font-bold flex items-center justify-center"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-[#080B11]/25 border-t-[#080B11] rounded-full animate-spin"></span>
                  ) : (
                    txMethod === 'celo' && txType === 'expense' ? 'Execute Payment' : 'Log Transaction'
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

export default Transactions;
