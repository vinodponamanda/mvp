import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Phone, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  MessageCircle, 
  PhoneCall, 
  HelpCircle,
  Sparkles,
  UserCheck,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login', isCheckout = false, onGuestCheckout }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot_pin' | 'update_pin'
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  const { login, register, changePin } = useAuth();
  const { settings } = useStore();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessNotice(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const cleanStorePhone = (settings?.phone || '9876543210').replace(/\D/g, '');
  const cleanWhatsAppPhone = (settings?.whatsApp || settings?.phone || '9876543210').replace(/\D/g, '');

  const resetForm = () => {
    setError(null);
    setPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!pin || pin.length < 4 || pin.length > 6) {
      setError('Please enter your 4 to 6-digit PIN.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(cleanPhone, pin);
      
      // If Admin set a temporary PIN, force customer to set their permanent PIN immediately
      if (res?.mustChangePin) {
        setMode('update_pin');
        setSuccessNotice('Temporary PIN verified! Please choose your new permanent PIN below.');
        resetForm();
        return;
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid Mobile Number or PIN. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!fullName || fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      setError('PIN must be 4 to 6 numbers (e.g. 1234).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(fullName, cleanPhone, pin);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message || 'Could not create account. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      setError('New PIN must be 4 to 6 numeric digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PIN and Confirm PIN do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await changePin(newPin);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Update PIN error:', err);
      const msg = err.response?.data?.message || 'Failed to update PIN. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const forgotWhatsAppUrl = `https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(
    `Hello ${settings?.storeName || 'Mana Vibe Prints'}, I forgot my account PIN for mobile number: +91 ${phone || '[Enter Mobile]'}. Please help me reset my PIN.`
  )}`;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      
      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-5 transform transition-all duration-200 scale-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
              {mode === 'forgot_pin' ? (
                <HelpCircle className="w-5 h-5" />
              ) : mode === 'update_pin' ? (
                <KeyRound className="w-5 h-5" />
              ) : mode === 'register' ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                {mode === 'login' && 'Sign In to Your Account'}
                {mode === 'register' && 'Create Customer Account'}
                {mode === 'forgot_pin' && 'Forgot Account PIN?'}
                {mode === 'update_pin' && 'Set Your Permanent PIN'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {mode === 'forgot_pin' ? 'Store Support Assistance' : mode === 'update_pin' ? 'Create your personal secret PIN' : 'Simple Mobile + PIN Access'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Sign In / Register) */}
        {mode !== 'forgot_pin' && mode !== 'update_pin' && (
          <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); resetForm(); }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); resetForm(); }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && mode === 'update_pin' && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-slate-500 font-bold text-xs pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Enter mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-16 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Account PIN
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot_pin'); resetForm(); }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                >
                  Forgot PIN?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  maxLength={6}
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 font-mono tracking-widest focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In With PIN</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-slate-500 font-bold text-xs pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Enter mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-16 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Create PIN
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  maxLength={6}
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 font-mono tracking-widest focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Remember this PIN to log in anytime without OTP.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account & Continue</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* SET PERMANENT PIN FORM (After Temporary PIN Login) */}
        {mode === 'update_pin' && (
          <form onSubmit={handleUpdatePin} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed font-medium">
              🔑 <strong>Temporary PIN Verified:</strong> For your security, please create your personal secret PIN now.
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                New Permanent PIN *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  required
                  maxLength={6}
                  placeholder="Enter new PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 font-mono tracking-widest focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:font-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm New Permanent PIN *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  required
                  maxLength={6}
                  placeholder="Re-enter new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 font-mono tracking-widest focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Save Permanent PIN & Continue</span>
            </button>
          </form>
        )}

        {/* FORGOT PIN SUPPORT SCREEN */}
        {mode === 'forgot_pin' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-1.5 text-left">
              <p className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                Easy PIN Reset via Support
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                To protect your account, our store administrator can provide a temporary PIN after quick phone verification. You can then change it to your private permanent PIN.
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href={forgotWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all text-xs cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Store Support</span>
              </a>

              <a
                href={`tel:${cleanStorePhone}`}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all text-xs cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <PhoneCall className="w-4 h-4 text-orange-400" />
                <span>Call Store Support ({settings?.phone || '+91 9876543210'})</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => { setMode('login'); resetForm(); }}
              className="w-full text-center text-xs text-orange-600 font-bold hover:underline pt-1 cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* GUEST CHECKOUT OPTION (If in checkout flow) */}
        {isCheckout && mode !== 'update_pin' && (
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                if (onGuestCheckout) onGuestCheckout();
                if (onClose) onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-orange-500 text-slate-700 hover:text-orange-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Continue as Guest (No Login Required)
            </button>
          </div>
        )}

        <div className="pt-1 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted BCrypt PIN Protection</span>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
