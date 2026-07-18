import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Edit2, Trash2, Sparkles, Check, AlertTriangle, TrendingDown, RefreshCw
} from 'lucide-react';

const Budgets = () => {
  const { darkMode } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [openModal, setOpenModal] = useState(false);
  const [category, setCategory] = useState('food');
  const [name, setName] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transport & Rides' },
    { value: 'shopping', label: 'Shopping & Retail' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'bills', label: 'Utilities & Bills' },
    { value: 'health', label: 'Medical & Health' },
    { value: 'education', label: 'Education' },
    { value: 'savings', label: 'Savings & Vaults' }
  ];

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#6366F1'  // Indigo
  ];

  const fetchData = async () => {
    try {
      const [budgetsData, recommendationsData] = await Promise.all([
        api.getBudgets(),
        api.getRecommendations()
      ]);
      setBudgets(budgetsData);
      setRecommendations(recommendationsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!monthlyLimit || monthlyLimit <= 0) return setError('Invalid budget limit amount.');
    
    setSubmitting(true);
    setError('');

    // Prepopulate name from category label if not manually typed
    const finalName = name || categories.find(c => c.value === category).label;

    try {
      await api.createBudget({
        name: finalName,
        monthlyLimit: parseFloat(monthlyLimit),
        category,
        color
      });
      setOpenModal(false);
      setName('');
      setMonthlyLimit('');
      fetchData();
    } catch (err) {
      setError(err.message || 'Upsert failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this budget?')) return;
    try {
      await api.deleteBudget(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyRec = async (recId) => {
    try {
      await api.applyRecommendation(recId);
      fetchData();
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
    }
  };

  const handleDismissRec = async (recId) => {
    try {
      await api.dismissRecommendation(recId);
      fetchData();
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err);
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
            Budget Manager
          </h2>
          <p className="text-gray-400 text-sm">Design monthly limits to govern autonomous spending.</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="w-full sm:w-auto justify-center bg-emerald-500 hover:bg-emerald-400 text-[#080B11] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Budget Limit</span>
        </button>
      </div>

      {/* AI RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <div className={`p-6 rounded-3xl border ${
          darkMode ? 'bg-[#0D121F] border-emerald-500/20' : 'bg-emerald-50/30 border-emerald-200'
        }`}>
          <div className="flex items-center space-x-2 text-emerald-400 mb-4">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">AI Budget Optimizations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div 
                key={rec._id} 
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
                }`}
              >
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-1">
                    PROPOSED ADJUSTMENT: {rec.type === 'budget_limit_change' ? 'REDUCE CAP' : 'TRANSFER SURPLUS'}
                  </p>
                  <p className="text-sm text-gray-300 font-medium">{rec.text}</p>
                </div>
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleApplyRec(rec._id)}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] text-xs font-bold rounded-lg transition"
                  >
                    Apply Cap Adjust
                  </button>
                  <button
                    onClick={() => handleDismissRec(rec._id)}
                    className={`px-3 py-2 border text-xs font-semibold rounded-lg transition ${
                      darkMode ? 'border-gray-800 hover:bg-gray-800 text-gray-400' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUDGET LIST GRID */}
      {budgets.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border border-dashed ${
          darkMode ? 'border-gray-800 text-gray-505' : 'border-gray-200 text-gray-400'
        }`}>
          No budget limits set. Create a limit to track your category spending.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const remaining = b.monthlyLimit - b.spentAmount;
            const spentPercent = b.monthlyLimit > 0 ? (b.spentAmount / b.monthlyLimit) * 100 : 0;
            const isNearLimit = spentPercent >= 90;

            return (
              <div 
                key={b._id} 
                className={`p-6 rounded-3xl border flex flex-col justify-between ${
                  darkMode ? 'bg-[#0D121F] border-gray-850' : 'bg-white border-gray-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: b.color }}></span>
                      <h3 className="font-extrabold text-sm text-gray-200">{b.name}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded transition"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Spent Progress</span>
                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                      <span className="text-xl font-extrabold">${b.spentAmount.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">/ ${b.monthlyLimit.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, spentPercent)}%`,
                          backgroundColor: b.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-800/10 text-xs">
                  <div className="text-left">
                    <span className="text-gray-500 block font-semibold">REMAINING</span>
                    <span className={`font-extrabold ${remaining < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                      {remaining < 0 ? '-' : ''}${Math.abs(remaining).toFixed(2)}
                    </span>
                  </div>
                  {isNearLimit && (
                    <div className="flex items-center space-x-1 text-red-400 bg-red-500/10 px-2 py-1 rounded-lg font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Overrun</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE/EDIT BUDGET MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md border p-6 rounded-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#0D121F] border-gray-850 text-gray-100' : 'bg-white border-gray-200 text-gray-800'
          }`}>
            <h3 className="text-lg font-bold mb-2">Create Budget Limit</h3>
            <p className="text-xs text-gray-500 mb-6">Allocate maximum monthly caps for automatic category spending.</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none transition"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Custom Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Groceries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Monthly Limit (USDm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="150.00"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Color Indicator
                </label>
                <div className="flex space-x-2.5">
                  {colors.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        color === col ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                    ></button>
                  ))}
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
                    'Set Budget Cap'
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

export default Budgets;
