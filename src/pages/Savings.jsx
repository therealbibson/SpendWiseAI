import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, PiggyBank, Target, Landmark, AlertCircle, Check, ArrowRight, Sparkles
} from 'lucide-react';

const Savings = () => {
  const { darkMode, refreshWalletBalance } = useAuth();
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [openGoalModal, setOpenGoalModal] = useState(false);
  const [openDepositModal, setOpenDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Form State
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState('Vacation');
  const [depositAmount, setDepositAmount] = useState('');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goalCategories = ['Vacation', 'Laptop', 'Emergency Fund', 'House', 'Phone', 'Investment', 'Other'];

  const fetchGoals = async () => {
    try {
      const [goalsData, insightsData] = await Promise.all([
        api.getSavingsGoals(),
        api.getInsights()
      ]);
      setGoals(goalsData);
      // Filter for savings recommendations only
      setInsights(insightsData.filter(i => i.type === 'saving'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!targetAmount || targetAmount <= 0) return setError('Invalid target amount.');

    setSubmitting(true);
    setError('');

    try {
      await api.createSavingsGoal({
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        category
      });
      setOpenGoalModal(false);
      setGoalName('');
      setTargetAmount('');
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Failed to create goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || depositAmount <= 0) return setError('Invalid deposit amount.');

    setSubmitting(true);
    setError('');

    try {
      await api.depositSavings(selectedGoal._id, parseFloat(depositAmount));
      setOpenDepositModal(false);
      setDepositAmount('');
      fetchGoals();
      refreshWalletBalance();
    } catch (err) {
      setError(err.message || 'Deposit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyQuickSavings = async (rec) => {
    if (!rec.data || !rec.data.recommendedTransfer || !rec.data.savingsGoalId) return;
    setLoading(true);
    try {
      await api.depositSavings(rec.data.savingsGoalId, rec.data.recommendedTransfer);
      fetchGoals();
      refreshWalletBalance();
    } catch (err) {
      console.error('Quick savings transfer failed:', err);
    } finally {
      setLoading(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Savings Goals
          </h2>
          <p className="text-gray-400 text-sm">Save USDm towards specific purchases. AI automatically detects idle cash.</p>
        </div>
        <button
          onClick={() => setOpenGoalModal(true)}
          className="w-full sm:w-auto justify-center bg-emerald-500 hover:bg-emerald-400 text-[#080B11] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* AI RECOMMENDATIONS SECTION */}
      {insights.length > 0 && (
        <div className={`p-6 rounded-3xl border ${
          darkMode ? 'bg-[#0D121F] border-emerald-500/20' : 'bg-emerald-50/30 border-emerald-200'
        }`}>
          <div className="flex items-center space-x-2 text-emerald-400 mb-4">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider">AI Savings Opportunities</h3>
          </div>
          <div className="space-y-4">
            {insights.map((rec) => (
              <div 
                key={rec._id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-300">{rec.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{rec.content}</p>
                </div>
                {rec.data?.recommendedTransfer && (
                  <button
                    onClick={() => handleApplyQuickSavings(rec)}
                    className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition flex-shrink-0"
                  >
                    <span>Execute Saving Transfer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GOALS GRID */}
      {goals.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border border-dashed ${
          darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'
        }`}>
          No savings goals created. Start saving USDm now by defining a target.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const progressPercent = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const isCompleted = g.status === 'completed' || progressPercent >= 100;
            
            return (
              <div 
                key={g._id} 
                className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? 'bg-[#0D121F] border-gray-850' : 'bg-white border-gray-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-xl ${
                        isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-200">{g.name}</h3>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">{g.category}</span>
                      </div>
                    </div>
                    {isCompleted ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        COMPLETED
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedGoal(g);
                          setOpenDepositModal(true);
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-[#131926] hover:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-800 transition"
                      >
                        Deposit
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Goal Progress</span>
                    <h4 className="text-xl font-extrabold mt-0.5">
                      ${g.currentAmount.toFixed(2)}{' '}
                      <span className="text-xs text-gray-500 font-normal">/ ${g.targetAmount.toFixed(2)} target</span>
                    </h4>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-gray-500 font-semibold mt-2">
                  {progressPercent.toFixed(0)}% Achieved
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {openGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md border p-6 rounded-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#0D121F] border-gray-850 text-gray-100' : 'bg-white border-gray-200 text-gray-850'
          }`}>
            <h3 className="text-lg font-bold mb-2">Create Savings Target</h3>
            <p className="text-xs text-gray-500 mb-6">Allocate goals for your long-term savings.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Europe Vacation, Macbook Pro"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Target Amount (USDm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  >
                    {goalCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenGoalModal(false)}
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
                    'Set Target Goal'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DEPOSIT FUNDS MODAL */}
      {openDepositModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm border p-6 rounded-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#0D121F] border-gray-850 text-gray-100' : 'bg-white border-gray-200 text-gray-850'
          }`}>
            <h3 className="text-lg font-bold mb-2">Goal Deposit: {selectedGoal.name}</h3>
            <p className="text-xs text-gray-500 mb-6">
              Transfer USDm from your smart wallet to this savings target.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleDeposit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Deposit Amount (USDm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="50.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenDepositModal(false)}
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
                    'Transfer USDm'
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

export default Savings;
