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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, budgetsData, txsData, goalsData, subsData, insightsData] = await Promise.all([
        api.getStats(),
        api.getBudgets(),
        api.getTransactions(),
        api.getSavingsGoals(),
        api.getSubscriptions(),
        api.getInsights()
      ]);

      setStats(statsData);
      setBudgets(budgetsData);
      setTransactions(txsData);
      setSavingsGoals(goalsData);
      setSubscriptions(subsData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-xl text-xs font-semibold shadow-sm transition ${
            darkMode ? 'bg-[#0D121F] border-gray-800 hover:bg-gray-800 text-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Blockchain'}</span>
        </button>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wallet Balance Card */}
        <div className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between h-52 bg-gradient-to-br ${
          darkMode ? 'from-[#0D121F] to-[#151D30] border-gray-800' : 'from-white to-gray-50/50 border-gray-200'
        }`}>
          {/* Card background glowing orb */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Celo Wallet Balance</span>
              <h3 className="text-3xl font-extrabold mt-1 tracking-tight">
                ${wallet?.balance.toFixed(2) || '0.00'}{' '}
                <span className="text-xs text-emerald-500 font-bold">cUSD</span>
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Wallet className="w-5 h-5" />
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
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
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
                <h3 className="text-4xl font-extrabold mt-1 tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
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
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 transition-all duration-300"
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
            No transactions found. Add a transaction manually or send cUSD to populate your activity!
          </div>
        ) : (
          <div className="divide-y divide-gray-800/10">
            {transactions.slice(0, 5).map((tx) => {
              const isExpense = tx.type === 'expense';
              const catClass = categoryColors[tx.category.toLowerCase()] || categoryColors.general;
              
              return (
                <div key={tx._id} className="py-4 flex items-center justify-between hover:bg-gray-800/5 px-2 rounded-xl transition duration-150">
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl ${
                      isExpense 
                        ? 'bg-red-500/10 text-red-400' 
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {isExpense ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-200">{tx.title}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${catClass}`}>
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {tx.paymentMethod.toUpperCase()} • {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-extrabold text-sm ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isExpense ? '-' : '+'}${tx.amount.toFixed(2)}
                    </p>
                    {tx.blockchainHash && (
                      <a 
                        href={`https://celo-sepolia.blockscout.com/tx/${tx.blockchainHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-blue-400 hover:underline block mt-0.5"
                      >
                        {tx.blockchainHash.slice(0, 6)}...{tx.blockchainHash.slice(-4)}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
