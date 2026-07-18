import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, Send, Sparkles, AlertCircle, Trash2, ArrowRight, ExternalLink, CheckSquare, RefreshCw
} from 'lucide-react';

const Chat = () => {
  const { darkMode, refreshWalletBalance } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  // x402: remaining free chats today + per-reply payment badges.
  const [quota, setQuota] = useState(null);
  // Maps an assistant message's timestamp (ISO) -> { settlement } for messages
  // that required an x402 payment, so we can show a "paid" badge under them.
  const [paidReplies, setPaidReplies] = useState({});

  const chatEndRef = useRef(null);

  const suggestedPrompts = [
    "What is my smart wallet balance?",
    "Can I afford dinner tonight?",
    "How much have I spent on food this month?",
    "Transfer $5 from grocery budget to Savings Vacation",
    "Change my bills budget limit to $120"
  ];

  const fetchChatHistory = async () => {
    try {
      const [data, quotaData] = await Promise.all([
        api.getChatHistory(),
        api.getChatQuota().catch(() => null),
      ]);
      setMessages(data.messages || []);
      if (quotaData) setQuota(quotaData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch chat logs.');
    } finally {
      setLoading(false);
    }
  };

  const refreshQuota = async () => {
    try {
      const q = await api.getChatQuota();
      setQuota(q);
    } catch (_) { /* non-fatal */ }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    setSending(true);
    setInput('');
    setError('');

    // Optimistically update UI
    setMessages(prev => [...prev, { role: 'user', content: textToSend, timestamp: new Date() }]);

    try {
      const data = await api.postChatMessage(textToSend);

      const serverMessages = data.conversation.messages;

      // If this message was x402-paid, tag the newest assistant reply so we can
      // render a payment badge beneath it.
      if (data._x402?.paid) {
        const lastAssistant = [...serverMessages].reverse().find((m) => m.role === 'assistant');
        if (lastAssistant) {
          setPaidReplies((prev) => ({
            ...prev,
            [new Date(lastAssistant.timestamp).toISOString()]: {
              settlement: data._x402.settlement,
              priceUsdc: quota?.priceUsdc,
            },
          }));
        }
      }

      // Update with server records
      setMessages(serverMessages);

      // Payment (or free message) consumed — refresh the remaining allowance.
      refreshQuota();

      // If an action was executed by the agent, refresh user wallet balances
      if (data.actionTriggered) {
        refreshWalletBalance();
      }

    } catch (err) {
      setError(err.message || 'AI message dispatch failed.');
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat memory?')) return;
    try {
      // Mock clearing on frontend for visual simplicity, or we can just send an empty chat trigger
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6 text-left">
      
      {/* CHAT WINDOW */}
      <div className={`flex-1 flex flex-col rounded-3xl border overflow-hidden ${
        darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        
        {/* Chat Header */}
        <div className="p-4 border-b border-inherit flex justify-between items-center bg-[#141B2D]/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-200">SpendWise Finance Agent</h3>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active & transacting on Celo Mainnet</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {quota && (
              <span
                title={`Free chats reset daily. Beyond the free tier each message costs ${quota.priceUsdc} USDC on Celo.`}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                  quota.remaining > 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                {quota.remaining > 0
                  ? `${quota.remaining} free chat${quota.remaining === 1 ? '' : 's'} left today`
                  : `Free tier used · ${quota.priceUsdc} USDC / msg`}
              </span>
            )}
            <button
              onClick={handleClearHistory}
              className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg transition"
              title="Clear Chat Log"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <Sparkles className="w-10 h-10 text-emerald-400/30 mb-4 animate-bounce" />
              <p className="font-bold text-sm text-gray-400">Autonomous Financial Assistant</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Ask me details about your budget limit, overspending warnings, or say "save $10 into Laptop Vacation" to submit a Celo payment autonomously!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAI = msg.role === 'assistant';
              const payment = isAI ? paidReplies[new Date(msg.timestamp).toISOString()] : null;
              const txHash = payment?.settlement?.transaction || payment?.settlement?.txHash;

              return (
                <div key={index} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex items-start space-x-2.5 max-w-[80%] ${isAI ? 'text-left' : 'flex-row-reverse space-x-reverse'}`}>
                    {isAI && (
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isAI
                          ? (darkMode ? 'bg-[#151D30] text-gray-200' : 'bg-gray-100 text-gray-800')
                          : 'bg-emerald-500 text-[#080B11] font-medium'
                      }`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 px-1">
                        <span className="text-[9px] text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {payment && (
                          <span className="text-[9px] text-emerald-400 font-semibold flex items-center space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Paid {payment.priceUsdc ?? ''} USDC</span>
                            {txHash && (
                              <a
                                href={`https://celoscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline inline-flex items-center space-x-0.5 hover:text-emerald-300"
                                title="View settlement on CeloScan"
                              >
                                <span className="font-mono">{txHash.slice(0, 6)}…{txHash.slice(-4)}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2.5 max-w-[80%]">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${darkMode ? 'bg-[#151D30]' : 'bg-gray-100'} flex items-center space-x-2`}>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div ref={chatEndRef}></div>
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-inherit">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }} 
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              placeholder="Ask SpendWise or tell me to move money..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              className="flex-1 px-4 py-3 bg-[#131926] border border-gray-850 focus:border-emerald-500/30 rounded-xl text-xs text-gray-300 outline-none transition"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-3 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] rounded-xl transition duration-150 disabled:opacity-50"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

      </div>

      {/* QUICK ACTIONS SIDEBAR (DESKTOP) */}
      <div className="hidden lg:flex flex-col w-72 space-y-6">
        
        {/* Suggested prompts card */}
        <div className={`p-5 rounded-3xl border text-left ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Suggested Commands</span>
          </h4>
          <div className="space-y-3">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={sending}
                className={`w-full text-left p-3 rounded-xl border text-xs font-medium leading-relaxed transition ${
                  darkMode ? 'border-gray-850 hover:border-gray-800 bg-[#131926]/40 text-gray-300 hover:text-white' : 'border-gray-150 hover:border-gray-200 bg-gray-50/50 text-gray-600 hover:text-gray-900'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Agent Capabilities summary */}
        <div className={`p-5 rounded-3xl border text-left text-xs text-gray-400 space-y-3 ${
          darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <p className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">AGENT CAPABILITIES</p>
          <p>✔ **USDm On-chain Moves**: Execute actual transfers on Celo Mainnet.</p>
          <p>✔ **Limit Controls**: Modify category budgets via text.</p>
          <p>✔ **Autonomy**: Rules are evaluated in background even when logged off.</p>
        </div>

      </div>

    </div>
  );
};

export default Chat;
