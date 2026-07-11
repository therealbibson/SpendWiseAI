import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  LayoutDashboard, PieChart, ArrowRightLeft, CalendarDays, 
  PiggyBank, MessageSquare, Sparkles, Settings, LogOut, 
  Bell, Moon, Sun, Menu, X, Copy, Check, ExternalLink, HeartPulse
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, wallet, logout, darkMode, setDarkMode, refreshWalletBalance } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [copied, setCopied] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Subscriptions', path: '/subscriptions', icon: CalendarDays },
    { name: 'Savings Goals', path: '/savings', icon: PiggyBank },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'AI Insights', path: '/insights', icon: Sparkles },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.markNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getActiveTitle = () => {
    const activeItem = menuItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.name : 'SpendWise';
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-[#080B11] text-gray-100' : 'bg-[#F9FAFB] text-gray-900'}`}>
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`hidden md:flex flex-col w-64 border-r ${darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-inherit">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-white text-lg">
              S
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
              SpendWise AI
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-150 font-medium ${
                  isActive 
                    ? (darkMode ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100')
                    : (darkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile section at the bottom */}
        <div className="p-4 border-t border-inherit">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-semibold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="max-w-[120px]">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'}`}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className={`md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-40 border-b ${
        darkMode ? 'bg-[#0D121F] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-white text-lg">
            S
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            SpendWise
          </span>
        </Link>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-30 pt-16 md:hidden flex flex-col ${
          darkMode ? 'bg-[#0D121F]' : 'bg-white'
        }`}>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition font-medium ${
                    isActive 
                      ? (darkMode ? 'bg-gray-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                      : (darkMode ? 'text-gray-400 hover:bg-gray-850' : 'text-gray-600 hover:bg-gray-50')
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-lg">{item.name}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-red-500 hover:bg-red-500/10 font-medium`}
            >
              <LogOut className="w-6 h-6" />
              <span className="text-lg">Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16">
        
        {/* DESKTOP HEADER */}
        <header className={`hidden md:flex h-16 items-center justify-between px-8 border-b ${
          darkMode ? 'bg-[#0D121F]/80 border-gray-800' : 'bg-white/80 border-gray-200'
        } backdrop-blur-md sticky top-0 z-20`}>
          
          <h1 className="text-xl font-bold tracking-tight text-inherit my-0 text-left">
            {getActiveTitle()}
          </h1>

          <div className="flex items-center space-x-6">
            {/* Celo wallet quick display */}
            {wallet && (
              <div className={`flex items-center space-x-3 px-4 py-1.5 rounded-full border text-xs font-semibold ${
                darkMode ? 'bg-[#151D30]/60 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-gray-400">Sepolia:</span>
                <span className="font-mono text-gray-300">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
                <button 
                  onClick={copyAddress}
                  className={`p-1 rounded transition ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                  title="Copy Celo Address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a 
                  href="https://faucet.celo.org/celo-sepolia" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-1 rounded text-blue-400 hover:bg-blue-500/10 flex items-center space-x-0.5"
                  title="Celo Faucet"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Dark mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition ${
                darkMode ? 'hover:bg-gray-855 border-gray-800 text-yellow-400' : 'hover:bg-gray-100 border-gray-200 text-gray-600'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl border transition relative ${
                  darkMode ? 'hover:bg-gray-855 border-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 border-gray-200 text-gray-600'
                }`}
              >
                <Bell className="w-5 h-5" />
                {getUnreadCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-inherit">
                    {getUnreadCount()}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border overflow-hidden z-50 ${
                  darkMode ? 'bg-[#0D121F] border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-850'
                }`}>
                  <div className="p-4 border-b border-inherit flex justify-between items-center bg-[#101726]/10">
                    <span className="font-bold text-sm">Notifications</span>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-inherit">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          onClick={async () => {
                            await api.markNotificationReadSingle(notif._id);
                            fetchNotifications();
                          }}
                          className={`p-4 transition cursor-pointer text-left hover:bg-emerald-500/5 ${
                            !notif.read ? (darkMode ? 'bg-[#151C2C]/50' : 'bg-emerald-500/5') : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                              notif.type === 'alert' ? 'bg-red-500/10 text-red-500' :
                              notif.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {notif.type.toUpperCase()}
                            </span>
                            <button 
                              onClick={(e) => deleteNotification(notif._id, e)}
                              className="text-gray-500 hover:text-red-500 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="font-semibold text-xs mt-1.5">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-gray-500 block mt-1.5">
                            {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
