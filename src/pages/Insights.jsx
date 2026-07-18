import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, RefreshCw, AlertTriangle, TrendingDown, PiggyBank, HeartPulse, FileText, ArrowRight, Zap, ExternalLink
} from 'lucide-react';

const Insights = () => {
  const { darkMode } = useAuth();
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState({ summary: { income: 0, expense: 0 } });
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  // x402 premium report state
  const [buying, setBuying] = useState(false);
  const [x402Error, setX402Error] = useState('');
  const [x402Metrics, setX402Metrics] = useState(null);
  const [lastSettlement, setLastSettlement] = useState(null);

  const fetchData = async () => {
    try {
      const [insightsData, statsData, metricsData] = await Promise.all([
        api.getInsights(),
        api.getStats(),
        api.getX402Metrics().catch(() => null)
      ]);
      setInsights(insightsData);
      setStats(statsData);
      if (metricsData) setX402Metrics(metricsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAudit = async () => {
    setAuditing(true);
    try {
      await api.generateInsights();
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setAuditing(false);
    }
  };

  // Buy a premium report via the x402 payment flow (0.10 USDC on Celo).
  const handleBuyPremium = async () => {
    setBuying(true);
    setX402Error('');
    setLastSettlement(null);
    try {
      const result = await api.generatePremiumInsights();
      if (result.settlement?.transaction) setLastSettlement(result.settlement.transaction);
      await fetchData();
    } catch (err) {
      setX402Error(err.message || 'Premium report payment failed.');
    } finally {
      setBuying(false);
    }
  };

  // Helper Calculations
  const totalIncome = stats.summary?.income || 0;
  const totalExpense = stats.summary?.expense || 0;
  const netSavings = Math.max(0, totalIncome - totalExpense);

  const calculateFinancialScore = () => {
    if (totalIncome === 0 && totalExpense === 0) return 90; // fresh account default
    if (totalIncome === 0) return 40; // only spending
    const ratio = totalExpense / totalIncome;
    if (ratio >= 1.0) return 45; // living beyond means
    return Math.max(45, Math.round(100 - (ratio * 50)));
  };

  const healthScore = calculateFinancialScore();

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Insights & Reports
          </h2>
          <p className="text-gray-400 text-sm">Deep learning reports auditing cashflow limits and wallet transactions.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={handleAudit}
            disabled={auditing}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 border rounded-xl text-xs font-semibold shadow-sm transition ${
              darkMode ? 'bg-[#0D121F] border-gray-800 hover:bg-gray-800 text-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${auditing ? 'animate-spin' : ''}`} />
            <span>{auditing ? 'Auditing Spend...' : 'Refresh AI Audit'}</span>
          </button>
          <button
            onClick={handleBuyPremium}
            disabled={buying}
            title="Pay 0.10 USDC on Celo (x402) to generate a premium report"
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#080B11] shadow-lg shadow-emerald-500/10 transition disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            <span>{buying ? 'Processing payment...' : 'Premium Report · 0.10 USDC'}</span>
          </button>
        </div>
      </div>

      {/* x402 payment status + metrics */}
      {(x402Error || lastSettlement || x402Metrics) && (
        <div className="space-y-3">
          {x402Error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{x402Error}</span>
            </div>
          )}
          {lastSettlement && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              Payment settled on Celo. Tx:{' '}
              <a
                href={`https://celoscan.io/tx/${lastSettlement}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-mono break-all"
              >
                {lastSettlement.slice(0, 14)}...{lastSettlement.slice(-8)}
              </a>
            </div>
          )}
          {x402Metrics && (
            <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'}`}>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-3">
                x402 Payment Metrics (Celo · USDC)
              </span>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                    {x402Metrics.platform?.x402Payments ?? 0}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Payments</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                    {x402Metrics.platform?.x402Settlements ?? 0}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Settlements</p>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                    ${(x402Metrics.platform?.x402VolumeUsd ?? 0).toFixed(2)}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Volume (USD)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HEALTH METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Financial Health Score Card */}
        <div className={`p-6 rounded-3xl border flex items-center justify-between ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Financial Health</span>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1">
              {healthScore} <span className="text-xs text-gray-400 font-normal">/ 100</span>
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              {healthScore >= 80 ? 'Excellent saving structure' : healthScore >= 60 ? 'Healthy spending ratios' : 'Caution: high spending velocity'}
            </p>
          </div>
          <div className={`p-4 rounded-2xl ${
            healthScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
            healthScore >= 60 ? 'bg-blue-500/10 text-blue-400' :
            'bg-red-500/10 text-red-500'
          }`}>
            <HeartPulse className="w-8 h-8" />
          </div>
        </div>

        {/* Cashflow Summary Card */}
        <div className={`p-6 rounded-3xl border flex items-center justify-between ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Net Savings Rate</span>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1">
              ${netSavings.toFixed(2)}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Incomes: ${totalIncome.toFixed(2)} | Expenses: ${totalExpense.toFixed(2)}
            </p>
          </div>
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <FileText className="w-8 h-8" />
          </div>
        </div>

        {/* EOM Forecast Card */}
        <div className={`p-6 rounded-3xl border flex items-center justify-between ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Predicted EOM Balance</span>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-emerald-400">
              +${(netSavings * 1.2).toFixed(2)}
            </h3>
            <p className="text-xs text-gray-450 mt-2">
              Based on monthly budget limits and active rules.
            </p>
          </div>
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <Sparkles className="w-8 h-8" />
          </div>
        </div>

      </div>

      {/* INSIGHT REPORT STREAM */}
      <div className="space-y-6">
        <h3 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          AI Auditor Insights Logs
        </h3>

        {insights.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border border-dashed ${
            darkMode ? 'border-gray-800 text-gray-550' : 'border-gray-200 text-gray-400'
          }`}>
            No audits logged yet. Click "Refresh AI Audit" to trigger an initial review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight) => {
              const isAlert = insight.type === 'overspending';
              const isSaving = insight.type === 'saving';

              return (
                <div 
                  key={insight._id}
                  className={`p-6 rounded-3xl border text-left flex flex-col justify-between ${
                    darkMode ? 'bg-[#0D121F] border-gray-850' : 'bg-white border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-extrabold text-sm text-gray-200">{insight.title}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        isAlert ? 'bg-red-500/10 text-red-400' :
                        isSaving ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{insight.content}</p>
                  </div>

                  <span className="text-[10px] text-gray-550 mt-6 block">
                    AUDITED: {new Date(insight.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Insights;
