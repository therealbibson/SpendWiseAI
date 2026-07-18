import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Bot, Wallet, Eye, EyeOff, Lock, AlertCircle, Check, Copy,
  Trash2, Plus, RefreshCw, Key, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';

const Settings = () => {
  const { user, wallet, updatePreferences, refreshWalletBalance, darkMode } = useAuth();
  
  // Tab/Panel select
  const [activeTab, setActiveTab] = useState('profile');

  // AI preference states
  const [aiTone, setAiTone] = useState(user?.aiPreferences?.tone || 'professional');
  const [autoApply, setAutoApply] = useState(user?.aiPreferences?.autoApplyRecommendations || false);
  const [updatingPrefs, setUpdatingPrefs] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Private key export states
  const [password, setPassword] = useState('');
  const [exportedKey, setExportedKey] = useState('');
  const [showKey, setShowKey] = useState(true); // visible by default once revealed
  const [keyCopied, setKeyCopied] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Rules states
  const [rules, setRules] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [openRuleModal, setOpenRuleModal] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);

  // New Rule Form State
  const [triggerCondition, setTriggerCondition] = useState('balance_below');
  const [triggerValue, setTriggerValue] = useState('');
  const [triggerCategory, setTriggerCategory] = useState('food');
  const [actionType, setActionType] = useState('notify');
  const [actionValue, setActionValue] = useState('');
  const [actionGoal, setActionGoal] = useState('');
  const [ruleError, setRuleError] = useState('');
  const [savingRule, setSavingRule] = useState(false);

  const fetchRulesAndGoals = async () => {
    try {
      const [rulesData, goalsData] = await Promise.all([
        api.getRules(),
        api.getSavingsGoals()
      ]);
      setRules(rulesData);
      setSavingsGoals(goalsData);
      if (goalsData.length > 0 && !actionGoal) {
        setActionGoal(goalsData[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'automation') {
      fetchRulesAndGoals();
    }
  }, [activeTab]);

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setUpdatingPrefs(true);
    setPrefSuccess(false);

    try {
      await updatePreferences(
        user.notificationPreferences,
        { tone: aiTone, autoApplyRecommendations: autoApply },
        darkMode
      );
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPrefs(false);
    }
  };

  const handleExportKey = async (e) => {
    e.preventDefault();
    setKeyError('');
    setExportedKey('');
    setExporting(true);

    try {
      const data = await api.exportKey(password);
      setExportedKey(data.privateKey);
      setPassword('');
    } catch (err) {
      setKeyError(err.message || 'Incorrect password.');
    } finally {
      setExporting(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!triggerValue) return setRuleError('Trigger value is required.');
    
    setSavingRule(true);
    setRuleError('');

    // Generate descriptive summary
    let description = '';
    let triggerMetadata = {};
    let actionMetadata = {};

    if (triggerCondition === 'balance_below') {
      description = `If wallet balance drops below $${triggerValue} USDm`;
    } else if (triggerCondition === 'category_percent_above') {
      description = `If ${triggerCategory} spending reaches ${triggerValue}% of budget`;
    } else if (triggerCondition === 'category_value_above') {
      description = `If ${triggerCategory} spending exceeds $${triggerValue} USDm`;
      triggerMetadata.category = triggerCategory;
    } else if (triggerCondition === 'leftover_budget') {
      description = `If ${triggerCategory} budget has $${triggerValue} remaining at end of month`;
      triggerMetadata.category = triggerCategory;
    }

    if (actionType === 'notify') {
      description += `, warn me via notification.`;
    } else if (actionType === 'restrict_spending') {
      description += `, stop recommending card transactions.`;
    } else if (actionType === 'transfer_savings') {
      const goal = savingsGoals.find(g => g._id === actionGoal);
      description += `, transfer $${actionValue} USDm to savings goal "${goal ? goal.name : 'Vault'}".`;
      actionMetadata.savingsGoalId = actionGoal;
    }

    try {
      await api.createRule({
        triggerCondition,
        triggerValue: parseFloat(triggerValue),
        triggerMetadata,
        actionType,
        actionValue: actionValue ? parseFloat(actionValue) : undefined,
        actionMetadata,
        description
      });
      setOpenRuleModal(false);
      setTriggerValue('');
      setActionValue('');
      fetchRulesAndGoals();
    } catch (err) {
      setRuleError(err.message || 'Failed to save rule.');
    } finally {
      setSavingRule(false);
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      await api.updateRule(rule._id, { isActive: !rule.isActive });
      fetchRulesAndGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this automation rule?')) return;
    try {
      await api.deleteRule(id);
      fetchRulesAndGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAudit = async () => {
    setAuditing(true);
    setAuditSuccess(false);
    try {
      await api.evaluateRules();
      await refreshWalletBalance();
      setAuditSuccess(true);
      setTimeout(() => setAuditSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h2>
        <p className="text-gray-400 text-sm">Configure agent parameters, export keys, and set automated rules.</p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-800/10 space-x-6 text-sm font-semibold overflow-x-auto whitespace-nowrap no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 shrink-0 border-b-2 transition ${
            activeTab === 'profile' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Profile & AI Settings
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 shrink-0 border-b-2 transition ${
            activeTab === 'wallet' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Custodian Celo Key Export
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`pb-3 shrink-0 border-b-2 transition ${
            activeTab === 'automation' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          AI Automation Rules
        </button>
      </div>

      {/* 1. PROFILE & AI PREFERENCES */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border lg:col-span-2 ${
            darkMode ? 'bg-[#0D121F] border-gray-855' : 'bg-white border-gray-200'
          }`}>
            <h3 className="font-bold text-sm text-gray-200 mb-6">AI Agent Configuration</h3>

            {prefSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Agent preferences saved successfully.</span>
              </div>
            )}

            <form onSubmit={handleUpdatePreferences} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Agent Communication Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                >
                  <option value="professional">Professional (Analytical insights)</option>
                  <option value="casual">Casual (Friendly tips)</option>
                  <option value="strict">Strict (Firm warnings on targets)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#131926]/40 border border-gray-850">
                <div>
                  <h4 className="font-bold text-xs text-gray-300">Auto-Apply Recommendations</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Allow the AI to automatically change budget limits without requiring approval.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoApply(!autoApply)}
                  className="text-gray-400 hover:text-white"
                >
                  {autoApply ? (
                    <ToggleRight className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-600" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={updatingPrefs}
                className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] font-bold rounded-xl text-xs flex items-center justify-center transition"
              >
                {updatingPrefs ? 'Saving Settings...' : 'Save AI Settings'}
              </button>
            </form>
          </div>

          <div className={`p-6 rounded-3xl border ${
            darkMode ? 'bg-[#0D121F] border-gray-855' : 'bg-white border-gray-200'
          }`}>
            <h3 className="font-bold text-xs text-gray-200 mb-4 uppercase tracking-wide">User Account</h3>
            <div className="space-y-4 text-xs text-gray-400">
              <div>
                <span className="text-[10px] text-gray-500 block">NAME</span>
                <span className="font-bold text-gray-300">{user?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">EMAIL</span>
                <span className="font-bold text-gray-300">{user?.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">ACCOUNT STATE</span>
                <span className="font-bold text-emerald-400">Activated (Registered cohort)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTODIAL KEY EXPORT */}
      {activeTab === 'wallet' && (
        <div className={`p-6 rounded-3xl border max-w-2xl ${
          darkMode ? 'bg-[#0D121F] border-gray-855' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 text-emerald-400 mb-4">
            <Key className="w-5 h-5" />
            <h3 className="font-bold text-sm text-gray-200">Backup Smart Wallet Private Key</h3>
          </div>
          
          <p className="text-xs text-gray-400 leading-relaxed mb-6">
            SpendWise automatically generated a custodial keypair for you on signup. To import this wallet into external clients (like Metamask or Valora), verify your account password below to retrieve the decrypted private key in plain text.
          </p>

          {keyError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{keyError}</span>
            </div>
          )}

          {exportedKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
                <span>✔ Credentials decrypted successfully. Copy and store this key somewhere safe — never share it.</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Celo Wallet Address</span>
                  <div className="relative">
                    <p className="font-mono text-xs text-gray-300 bg-[#131926] p-3 border border-gray-850 rounded-xl mt-1 select-all pr-10 break-all">
                      {wallet?.address}
                    </p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(wallet?.address || ''); }}
                      className="absolute top-3 right-2 mt-1 text-gray-500 hover:text-emerald-400 transition"
                      title="Copy address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Decrypted Private Key</span>
                  <div className="relative mt-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      readOnly
                      value={exportedKey}
                      className="w-full font-mono text-xs text-gray-300 bg-[#131926] p-3 border border-emerald-500/30 rounded-xl pr-20 outline-none select-all break-all"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(exportedKey);
                          setKeyCopied(true);
                          setTimeout(() => setKeyCopied(false), 2000);
                        }}
                        className="p-1.5 text-gray-500 hover:text-emerald-400 transition"
                        title="Copy private key"
                      >
                        {keyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="p-1.5 text-gray-500 hover:text-gray-300 transition"
                        title={showKey ? 'Hide key' : 'Show key'}
                      >
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-red-400 mt-2">⚠ Never share this key. Anyone with it controls your wallet.</p>
                </div>
              </div>

              <button
                onClick={() => { setExportedKey(''); setShowKey(true); setKeyCopied(false); }}
                className="text-xs text-gray-500 hover:text-gray-300 transition underline"
              >
                Clear & re-enter password
              </button>
            </div>
          ) : (
            <form onSubmit={handleExportKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-550">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Enter your SpendWise password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#131926] border border-gray-805 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={exporting}
                className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] font-bold rounded-xl text-xs flex items-center justify-center transition"
              >
                {exporting ? 'Decrypting Key...' : 'Reveal Private Key'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. AI AUTOMATION RULES */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-sm text-gray-200">Autonomous Financial Rules</h3>
              <p className="text-xs text-gray-500">Configure triggers for automated Celo transfers and alert notifications.</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRunAudit}
                disabled={auditing}
                className={`flex items-center space-x-1.5 px-3 py-2.5 border rounded-xl text-xs font-semibold transition ${
                  darkMode ? 'bg-[#0D121F] border-gray-800 hover:bg-gray-850 text-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${auditing ? 'animate-spin' : ''}`} />
                <span>{auditing ? 'Evaluating...' : 'Force Agent Audit'}</span>
              </button>
              
              <button
                onClick={() => setOpenRuleModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-[#080B11] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>New Agent Rule</span>
              </button>
            </div>
          </div>

          {auditSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Agent audit triggered. Rules checked and wallet status synced with Celo.</span>
            </div>
          )}

          {/* RULES LIST */}
          {loadingRules ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border border-dashed ${
              darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'
            }`}>
              No automated rules configured. Define triggers above to authorize autonomous transfers.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map((rule) => (
                <div 
                  key={rule._id}
                  className={`p-5 rounded-3xl border flex justify-between items-start ${
                    darkMode ? 'bg-[#0D121F] border-gray-850' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="space-y-2">
                    <p className={`text-xs font-bold ${rule.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {rule.isActive ? 'ACTIVE AUTOMATION' : 'PAUSED AUTOMATION'}
                    </p>
                    <p className="text-sm text-gray-200 font-semibold leading-relaxed">{rule.description}</p>
                    <span className="text-[10px] text-gray-500 block">
                      Trigger Type: {rule.triggerCondition} • Action: {rule.actionType}
                    </span>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full space-y-4">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className="text-gray-400 hover:text-white"
                      title={rule.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {rule.isActive ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule._id)}
                      className="text-gray-550 hover:text-red-500 transition"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW RULE MODAL */}
      {openRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md border p-6 rounded-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#0D121F] border-gray-850 text-gray-100' : 'bg-white border-gray-200 text-gray-850'
          }`}>
            <h3 className="text-lg font-bold mb-2">Create Agent Rule</h3>
            <p className="text-xs text-gray-500 mb-6">Setup parameters for autonomous agent audits.</p>

            {ruleError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{ruleError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRule} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Rule Trigger
                </label>
                <select
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-850 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                >
                  <option value="balance_below">Smart wallet balance drops below threshold</option>
                  <option value="category_percent_above">Category spending reaches percentage limit</option>
                  <option value="category_value_above">Category spending exceeds dollar threshold</option>
                  <option value="leftover_budget">Grocery/Category has leftover remaining at end of month</option>
                </select>
              </div>

              {(triggerCondition === 'category_percent_above' || 
                triggerCondition === 'category_value_above' || 
                triggerCondition === 'leftover_budget') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Target Category
                  </label>
                  <select
                    value={triggerCategory}
                    onChange={(e) => setTriggerCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#131926] border border-gray-850 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                  >
                    <option value="food">Food & Dining</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Shopping</option>
                    <option value="bills">Bills & Utilities</option>
                    <option value="health">Health</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Trigger Value (USDm or %)
                </label>
                <input
                  type="number"
                  required
                  placeholder={triggerCondition === 'category_percent_above' ? 'e.g. 90 (for 90%)' : 'e.g. 30.00 (USDm)'}
                  value={triggerValue}
                  onChange={(e) => setTriggerValue(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-850 focus:border-emerald-500/50 rounded-xl text-sm text-gray-350 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Agent Action
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131926] border border-gray-850 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                >
                  <option value="notify">Send notification alert to user</option>
                  <option value="restrict_spending">Restrict card recommendation warnings</option>
                  {savingsGoals.length > 0 && <option value="transfer_savings">Execute on-chain transfer to Savings Goal</option>}
                </select>
              </div>

              {actionType === 'transfer_savings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Transfer Amount (USDm)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10.00"
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                      className="w-full px-4 py-3 bg-[#131926] border border-gray-850 focus:border-emerald-500/50 rounded-xl text-sm text-gray-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Destination Savings Goal
                    </label>
                    <select
                      value={actionGoal}
                      onChange={(e) => setActionGoal(e.target.value)}
                      className="w-full px-4 py-3 bg-[#131926] border border-gray-850 focus:border-emerald-500/50 rounded-xl text-sm text-gray-350 outline-none"
                    >
                      {savingsGoals.map(g => (
                        <option key={g._id} value={g._id}>{g.name} (${g.currentAmount.toFixed(0)} saved)</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenRuleModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRule}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] rounded-xl text-xs font-bold flex items-center justify-center"
                >
                  {savingRule ? (
                    <span className="w-5 h-5 border-2 border-[#080B11]/25 border-t-[#080B11] rounded-full animate-spin"></span>
                  ) : (
                    'Activate Rule'
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

export default Settings;
