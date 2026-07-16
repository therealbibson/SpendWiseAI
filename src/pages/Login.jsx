import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login, requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Forgot-password modal state. step 'request' emails a code; step 'reset'
  // verifies the code and sets a new password.
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotInfo, setForgotInfo] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const openForgot = () => {
    setForgotOpen(true);
    setForgotStep('request');
    setForgotEmail(email);
    setForgotCode('');
    setForgotNewPassword('');
    setForgotError('');
    setForgotInfo('');
    setForgotSuccess(false);
  };

  const closeForgot = () => {
    setForgotOpen(false);
  };

  // Step 1: request a reset code.
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotError('');
    setForgotLoading(true);
    try {
      await requestPasswordReset(forgotEmail);
      setForgotInfo(`If an account exists for ${forgotEmail}, a 6-digit code is on its way.`);
      setForgotStep('reset');
    } catch (err) {
      setForgotError(err.message || 'Could not send reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: verify the code and set a new password.
  const handleForgotReset = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotCode || forgotCode.length < 6) {
      return setForgotError('Enter the 6-digit code from your email.');
    }
    if (forgotNewPassword.length < 6) {
      return setForgotError('Password must be at least 6 characters.');
    }

    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail, forgotCode, forgotNewPassword);
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotOpen(false);
        setForgotSuccess(false);
      }, 2500);
    } catch (err) {
      setForgotError(err.message || 'Could not reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-[#080B11] pointer-events-none opacity-5 z-0"></div>

      <div className="w-full max-w-md bg-[#0D121F]/80 backdrop-blur-xl border border-gray-850 p-8 rounded-3xl shadow-2xl relative z-10">
        
        {/* Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white text-md">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight text-emerald-400">
              SpendWise AI
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1.5">Sign in to manage your autonomous financial agent</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={openForgot}
                className="text-xs text-emerald-500 hover:text-emerald-400 font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-550 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] font-bold rounded-xl text-sm shadow-xl shadow-emerald-500/10 flex items-center justify-center space-x-2 transition duration-150"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Redirect */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-semibold">
            Create account
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0D121F] border border-gray-850 p-6 rounded-2xl relative shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-gray-400 mb-4">
              {forgotStep === 'request'
                ? "Enter your email and we'll send a 6-digit reset code."
                : 'Enter the code we emailed you and choose a new password.'}
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotInfo && !forgotError && (
              <div className={`mb-4 p-3 rounded-xl border text-xs text-center font-medium ${forgotSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-300'}`}>
                {forgotInfo}
              </div>
            )}

            {forgotSuccess ? null : forgotStep === 'request' ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition"
                />
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeForgot}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/10 disabled:opacity-60"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="6-digit code"
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3.5 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition tracking-[0.4em] text-center font-bold"
                />
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="New password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3.5 bg-[#131926] border border-gray-800 focus:border-emerald-500/50 rounded-xl text-sm text-gray-100 placeholder-gray-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-550 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleForgotRequest}
                    disabled={forgotLoading}
                    className="text-xs text-emerald-500 hover:text-emerald-400 font-medium disabled:opacity-60"
                  >
                    Resend code
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeForgot}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#080B11] rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/10 disabled:opacity-60"
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
