import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  Wallet, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, 
  Sparkles, PiggyBank, Calendar, AlertTriangle, ArrowRight, RefreshCw, Copy, Check
} from 'lucide-react';

const Dashboard = () => {
  const { wallet, refreshWalletBalance, darkMode } = useAuth();
  const [stats, setStats] = useState({ summary: { income: 0, expense: 0 }, monthlyTrends: [], categoryDistribution: [] });
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [x402Metrics, setX402Metrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Send Asset Modal State
  const [openSendModal, setOpenSendModal] = useState(false);
  const [sendTokenSymbol, setSendTokenSymbol] = useState('USDm');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendCategory, setSendCategory] = useState('general');
  const [sendDescription, setSendDescription] = useState('');
  const [sendError, setSendError] = useState('');
  const [sendSubmitting, setSendSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, budgetsData, txsData, goalsData, subsData, insightsData, metricsData] = await Promise.all([
        api.getStats(),
        api.getBudgets(),
        api.getTransactions(),
        api.getSavingsGoals(),
        api.getSubscriptions(),
        api.getInsights(),
        api.getX402Metrics().catch(() => null)
      ]);

      setStats(statsData);
      setBudgets(budgetsData);
      setTransactions(txsData);
      setSavingsGoals(goalsData);
      setSubscriptions(subsData);
      setInsights(insightsData);
      if (metricsData) setX402Metrics(metricsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        await refreshWalletBalance();
      } catch (err) {
        console.error('Auto-sync wallet failed:', err);
      }
      fetchData();
    };
    initDashboard();

    // Auto-refresh wallet balances every 30 seconds to catch deposits
    const balancePoller = setInterval(async () => {
      try { await refreshWalletBalance(); } catch (_) {}
    }, 30000);
    return () => clearInterval(balancePoller);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWalletBalance();
    await fetchData();
    setRefreshing(false);
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendAsset = async (e) => {
    e.preventDefault();
    if (!sendAmount || sendAmount <= 0) return setSendError('Invalid send amount.');
    if (!sendRecipient) return setSendError('Recipient address is required.');

    setSendSubmitting(true);
    setSendError('');
    setSendSuccess(false);

    try {
      await api.createTransaction({
        title: `Transfer: ${sendTokenSymbol}`,
        amount: parseFloat(sendAmount),
        category: sendCategory,
        type: 'expense',
        paymentMethod: 'celo',
        recipientAddress: sendRecipient,
        tokenSymbol: sendTokenSymbol,
        description: sendDescription
      });
      
      setSendSuccess(true);
      setSendRecipient('');
      setSendAmount('');
      setSendDescription('');
      
      // Auto refresh data
      await refreshWalletBalance();
      await fetchData();

      setTimeout(() => {
        setOpenSendModal(false);
        setSendSuccess(false);
      }, 2000);
    } catch (err) {
      setSendError(err.message || 'Transaction execution failed.');
    } finally {
      setSendSubmitting(false);
    }
  };

  // Helper Calculations
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalSavings = savingsGoals.reduce((sum, s) => sum + s.currentAmount, 0);
  const upcomingSubscriptionsTotal = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  // Dynamic budget health score calculation (starts at 100, drops as spending approaches limits)
  const calculateHealthScore = () => {
    if (totalBudgetLimit === 0) return 100;
    const ratio = totalBudgetSpent / totalBudgetLimit;
    if (ratio >= 1.0) return 30; // Overspent
    return Math.max(30, Math.round(100 - (ratio * 60))); // Scaled health score
  };

  const healthScore = calculateHealthScore();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define color mappings for category badges
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

  return (
    <div className="space-y-8 text-left">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Overview Dashboard
          </h2>
          <p className="text-gray-400 text-sm">Real-time status of your SpendWise Smart Wallet.</p>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wallet Balance Card */}
        <div className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between h-52 ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Celo Wallet Balance</span>
              {/* Total portfolio value in USD across all tokens */}
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">
                <span className="text-lg text-emerald-500 font-bold align-top">$</span>
                {(() => {
                  const total = typeof wallet?.totalUsd === 'number'
                    ? wallet.totalUsd
                    : (wallet?.balances?.reduce((sum, b) => sum + (b.usdValue || 0), 0) ?? wallet?.balance ?? 0);
                  return total.toFixed(2);
                })()}{' '}
                <span className="text-xs text-gray-400 font-semibold">USD</span>
              </h3>
              {/* Show CELO + USDm breakdown underneath */}
              {(() => {
                const usdm = wallet?.balances?.find(b => b.symbol === 'USDm');
                const celo = wallet?.balances?.find(b => b.symbol === 'CELO');
                const parts = [];
                if (usdm && usdm.balance > 0) parts.push(`${usdm.balance.toFixed(2)} USDm`);
                if (celo && celo.balance > 0) parts.push(`${celo.balance.toFixed(4)} CELO`);
                return parts.length ? (
                  <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                    {parts.join(' · ')}
                  </p>
                ) : null;
              })()}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                title="Refresh balances"
                className={`p-2 rounded-xl transition ${refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800/30'} text-gray-500 hover:text-emerald-400`}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/10">
            <span className="text-[10px] text-gray-500 block font-semibold mb-1.5">SMART CONTRACT WALLET ADDRESS</span>
            <div className="flex items-center justify-between bg-[#131926]/50 px-3 py-2 rounded-xl border border-gray-800/30">
              <span className="font-mono text-xs text-gray-400">
                {wallet ? `${wallet.address.slice(0, 10)}...${wallet.address.slice(-8)}` : 'Generating...'}
              </span>
              <button 
                onClick={copyAddress}
                className="text-gray-500 hover:text-emerald-400 transition"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Budget Spending Card */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between h-52 ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Monthly Budget Limits</span>
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">
                ${totalBudgetSpent.toFixed(2)}{' '}
                <span className="text-xs text-gray-400 font-normal">/ ${totalBudgetLimit.toFixed(2)} spent</span>
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-5 text-blue-600'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Limit Progress</span>
              <span>{totalBudgetLimit > 0 ? ((totalBudgetSpent / totalBudgetLimit) * 100).toFixed(0) : 0}%</span>
            </div>
            <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${totalBudgetLimit > 0 ? Math.min(100, (totalBudgetSpent / totalBudgetLimit) * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Health Score & Savings Combined */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between h-52 ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Budget Health Score</span>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-4xl font-extrabold mt-1 tracking-tight text-emerald-400">
                  {healthScore}
                </h3>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <div className={`p-2 rounded-xl text-xs font-bold ${
              healthScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
              healthScore >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-red-500/10 text-red-500'
            }`}>
              {healthScore >= 80 ? 'Excellent' : healthScore >= 50 ? 'Warning' : 'Critical'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800/10 text-xs">
            <div>
              <span className="text-gray-500 block mb-0.5 font-semibold">SAVINGS VAULT</span>
              <span className="font-extrabold text-sm text-gray-300">${totalSavings.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5 font-semibold">UPCOMING SUBS</span>
              <span className="font-extrabold text-sm text-gray-300">${upcomingSubscriptionsTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* x402 PAYMENT METRICS (Celo · USDC) */}
      {x402Metrics && (
        <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">x402 Payments</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">On-chain USDC micropayments settled on Celo with attribution tag.</p>
            </div>
            <Link to="/insights" className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold flex items-center space-x-0.5">
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#131926]/40 border border-gray-850 rounded-2xl">
              <h4 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                {x402Metrics.platform?.x402Payments ?? 0}
              </h4>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Payments</p>
            </div>
            <div className="p-4 bg-[#131926]/40 border border-gray-850 rounded-2xl">
              <h4 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                {x402Metrics.platform?.x402Settlements ?? 0}
              </h4>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Settlements</p>
            </div>
            <div className="p-4 bg-[#131926]/40 border border-gray-850 rounded-2xl">
              <h4 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                ${(x402Metrics.platform?.x402VolumeUsd ?? 0).toFixed(2)}
              </h4>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Volume (USD)</p>
            </div>
          </div>
        </div>
      )}

      {/* WALLET ASSETS LIST & QUICK SEND */}
      <div className={`p-6 rounded-3xl border ${
        darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Wallet Assets & Balances</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Real-time balances of Celo Mainnet tokens. Click "Send" to transfer any token directly.</p>
          </div>
          <button
            onClick={() => {
              setSendTokenSymbol('USDm');
              setOpenSendModal(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-[#080B11] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1"
          >
            <span>Send Asset</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(wallet?.balances || [
            { symbol: 'CELO', name: 'Celo Native', balance: wallet?.balance || 0, isNative: true },
            { symbol: 'USDm', name: 'Mento Dollar', balance: wallet?.balance || 0 },
            { symbol: 'EURm', name: 'Mento Euro', balance: 0.0 },
            { symbol: 'USDC', name: 'USDC (Circle)', balance: 0.0 },
            { symbol: 'USDT', name: 'Tether USD', balance: 0.0 }
          ]).map((token) => (
            <div key={token.symbol} className="p-4 bg-[#131926]/40 border border-gray-850 rounded-2xl flex flex-col justify-between h-28">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{token.name}</span>
                <h4 className="text-lg font-extrabold mt-1 text-gray-200 truncate">
                  {token.balance.toFixed(token.decimals === 6 ? 2 : 4)}{' '}
                  <span className="text-[10px] text-emerald-500 font-bold">{token.symbol}</span>
                </h4>
              </div>
              <button
                onClick={() => {
                  setSendTokenSymbol(token.symbol);
                  setOpenSendModal(true);
                }}
                className="text-[10px] text-left text-emerald-400 hover:text-emerald-300 font-bold transition"
              >
                Send {token.symbol} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MID PANEL: CHARTS & AI SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Spending Trend Chart (SVG) */}
        <div className={`p-6 rounded-3xl border lg:col-span-2 ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Daily Spending Trend</h3>
            <span className="text-xs text-gray-500">Last 30 Days</span>
          </div>

          {/* Simple Custom SVG Bar Chart */}
          <div className="h-48 w-full flex items-end justify-between px-2 pt-6 relative border-b border-gray-800/15">
            {stats.monthlyTrends.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                No recent transaction trends to show.
              </div>
            ) : (
              stats.monthlyTrends.slice(-15).map((trend, index) => {
                const max = Math.max(...stats.monthlyTrends.map(t => t.total), 1);
                const heightPercent = (trend.total / max) * 80 + 10; // min 10% height
                return (
                  <div key={trend._id} className="flex-1 flex flex-col items-center group mx-1.5">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-1 bg-gray-900 border border-gray-800 text-white text-[10px] px-2 py-0.5 rounded shadow-lg pointer-events-none transition duration-150 z-10">
                      ${trend.total.toFixed(2)}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full rounded-t-md bg-emerald-500 hover:bg-emerald-400 transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    {/* Label */}
                    <span className="text-[9px] text-gray-500 mt-2 rotate-45 origin-left tracking-tighter truncate max-w-[24px]">
                      {trend._id.split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Insight / Summary Card */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-4">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider">AI Financial Agent Summary</h3>
            </div>
            
            {insights.length > 0 ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  insights[0].type === 'overspending' ? (darkMode ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-100 text-red-800') :
                  insights[0].type === 'saving' ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-800') :
                  (darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-800')
                }`}>
                  <p className="font-bold text-xs flex items-center space-x-1.5">
                    {insights[0].type === 'overspending' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    <span>{insights[0].title}</span>
                  </p>
                  <p className="text-xs mt-1.5 leading-relaxed opacity-90">{insights[0].content}</p>
                </div>
                {insights[1] && (
                  <p className="text-xs text-gray-400 border-t border-gray-800/10 pt-3 leading-relaxed">
                    💡 <span className="font-bold text-gray-300">{insights[1].title}</span>: {insights[1].content}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed">
                SpendWise AI is auditng your transactions. We will display budgeting summaries, overspending detections, and savings recommendation logs here shortly.
              </p>
            )}
          </div>

          <Link 
            to="/insights"
            className="mt-6 w-full py-3 bg-[#131926] hover:bg-[#1A2335] text-gray-300 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 border border-gray-800/40 transition"
          >
            <span>View Full Financial Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* LOWER PANEL: RECENT ACTIVITY */}
      <div className={`p-6 rounded-3xl border ${
        darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Recent Transactions</h3>
          <Link 
            to="/transactions" 
            className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold flex items-center space-x-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No transactions yet. Add a transaction or send a token to get started!
          </div>
        ) : (
          <div className="divide-y divide-gray-800/10">
            {transactions.slice(0, 5).map((tx) => {
              const isExpense = tx.type === 'expense';
              const catClass = categoryColors[tx.category?.toLowerCase()] || categoryColors.general;
              const tokenLabel = tx.tokenSymbol || (tx.paymentMethod === 'celo' ? 'USDm' : '');
              const isCelo = tx.paymentMethod === 'celo';
              const decimals = (tx.tokenSymbol === 'USDC' || tx.tokenSymbol === 'USDT') ? 2 : 4;
              const amountStr = `${isExpense ? '-' : '+'}${isCelo ? '' : '$'}${tx.amount.toFixed(decimals)}${isCelo && tokenLabel ? ` ${tokenLabel}` : ''}`;

              return (
                <div key={tx._id} className="py-3 flex items-center gap-3 hover:bg-gray-800/5 px-2 rounded-xl transition duration-150">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-xl ${
                    isExpense ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {isExpense ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>

                  {/* Title + meta — flex-1 + min-w-0 prevents overflow */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-200 truncate">{tx.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${catClass}`}>
                        {tx.category}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate">
                        {tx.paymentMethod?.toUpperCase()} · {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Amount — flex-shrink-0 so it never squashes */}
                  <div className="flex-shrink-0 text-right ml-1">
                    <p className={`font-extrabold text-sm whitespace-nowrap ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
                      {amountStr}
                    </p>
                    {tx.blockchainHash && (
                      <a
                        href={`https://celoscan.io/tx/${tx.blockchainHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-blue-400 hover:underline block mt-0.5"
                      >
                        {tx.blockchainHash.slice(0, 6)}…{tx.blockchainHash.slice(-4)}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEND ASSET MODAL */}
      {openSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md border p-6 rounded-2xl relative shadow-2xl text-left max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#0D121F] border-gray-850 text-gray-100' : 'bg-white border-gray-200 text-gray-850'
          }`}>
            <h3 className="text-lg font-bold mb-2 text-white">Send On-chain Asset</h3>
            <p className="text-xs text-gray-500 mb-6">Transfer any Celo Mainnet token directly from your smart wallet.</p>

            {sendError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            {sendSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Transfer executed successfully on Celo Mainnet!</span>
              </div>
            )}

            <form onSubmit={handleSendAsset} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Token / Asset
                  </label>
                  <select
                    value={sendTokenSymbol}
                    onChange={(e) => setSendTokenSymbol(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  >
                    <option value="CELO">CELO (Celo Native)</option>
                    <option value="USDm">USDm (Mento Dollar)</option>
                    <option value="EURm">EURm (Mento Euro)</option>
                    <option value="USDC">USDC (Circle USDC)</option>
                    <option value="USDT">USDT (Tether USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  />
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
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Category (for budgets)
                  </label>
                  <select
                    value={sendCategory}
                    onChange={(e) => setSendCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  >
                    <option value="general">General</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Shopping</option>
                    <option value="bills">Bills</option>
                    <option value="savings">Savings</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Memo/Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Weekly coffee"
                    value={sendDescription}
                    onChange={(e) => setSendDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenSendModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendSubmitting || sendSuccess}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] rounded-xl text-xs font-bold flex items-center justify-center"
                >
                  {sendSubmitting ? (
                    <span className="w-5 h-5 border-2 border-[#080B11]/25 border-t-[#080B11] rounded-full animate-spin"></span>
                  ) : (
                    'Execute Send'
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

export default Dashboard;
