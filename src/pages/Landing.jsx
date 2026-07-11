import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Shield, Zap, PiggyBank, ArrowRight, Wallet, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      title: "Autonomous Agent Actions",
      description: "Define automation rules (e.g. balance thresholds, monthly surpluses) and let the AI execute transfers on-chain.",
      icon: Bot,
      color: "from-emerald-500 to-green-600"
    },
    {
      title: "Celo cUSD Payments",
      description: "Deploy secure custodial Smart Wallets on Celo Sepolia. Make transactions directly in digital dollars (USDm/cUSD).",
      icon: Wallet,
      color: "from-yellow-400 to-amber-500"
    },
    {
      title: "Conversational DeFAI Chat",
      description: "Simply say 'adjust my food budget to $150' or 'save $25 to Laptop goal' and watch the agent implement it instantly.",
      icon: Zap,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Self-Improving Savings Streaks",
      description: "The AI monitors your spending habits, flags overruns, and suggests moving unspent funds to specific savings targets.",
      icon: PiggyBank,
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#080B11] text-gray-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-400 overflow-x-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[80%] rounded-full bg-emerald-500/20 blur-[120px]"></div>
        <div className="absolute top-[10%] right-[-10%] w-[55%] h-[85%] rounded-full bg-blue-500/20 blur-[130px]"></div>
      </div>

      {/* Header navbar */}
      <header className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-white text-xl">
            S
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            SpendWise AI
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-gray-400 hover:text-white transition font-medium text-sm px-4 py-2"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="bg-emerald-500 hover:bg-emerald-400 text-[#080B11] px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition duration-150 transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 text-center z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8"
          >
            <Activity className="w-4 h-4" />
            <span>Autonomous DeFAI Financial Agentic Payments on Celo</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]"
          >
            Your Autonomous <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent">
              AI Financial Agent.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            SpendWise AI automatically monitors your budgets, alerts you on overspending, and executes recurring payments and savings rules on the Celo blockchain.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
          >
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/10 flex items-center justify-center space-x-2 transition duration-200 transform hover:-translate-y-0.5"
            >
              <span>Setup Your Smart Agent</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-[#131926] hover:bg-[#1A2335] text-gray-200 font-bold px-8 py-4 rounded-2xl border border-gray-800 transition duration-200"
            >
              Access Dashboard
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-gray-900 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Autonomous Financial Intelligence
          </h2>
          <p className="text-gray-400">
            The AI Agent does not just analyze—it acts. Fully integrated with Celo Sepolia to automate transactions while ensuring you stay in complete control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#0D121F]/60 border border-gray-850 hover:border-gray-800 p-8 rounded-3xl transition duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-6 group-hover:scale-105 transition duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-gray-900 z-10 text-center bg-gradient-to-b from-[#090D18]/40 to-transparent rounded-3xl">
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How SpendWise AI Works
          </h2>
          <p className="text-gray-400">
            Three simple steps to autonomous asset allocation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-6">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fund Your Smart Wallet</h3>
            <p className="text-gray-400 text-sm">
              We generate a Celo Sepolia address for you at signup. Fund it with cUSD from the Sepolia testnet faucet with a single click.
            </p>
          </div>

          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-6">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Configure Agent Rules</h3>
            <p className="text-gray-400 text-sm">
              Create triggers like: "If food spending reaches 90% of budget, warn me" or "Move leftover grocery budget to Laptop savings."
            </p>
          </div>

          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-6">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Watch the Agent Execute</h3>
            <p className="text-gray-400 text-sm">
              The SpendWise agent processes transactions, evaluates your rules autonomously in the background, and makes on-chain transfers when satisfied.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative max-w-7xl mx-auto px-6 py-12 border-t border-gray-900 z-10 flex flex-col md:flex-row items-center justify-between text-gray-500 text-xs">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-white text-xs">
            S
          </div>
          <span className="font-semibold text-gray-400">SpendWise AI © 2026</span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="https://github.com/therealbibson/SpendWiseAI" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub</a>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
