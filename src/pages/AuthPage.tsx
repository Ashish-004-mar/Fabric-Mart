import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Lock, Mail, User as UserIcon, Building2, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [role, setRole] = useState<UserRole>('BUYER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        const res = await register(name, email, role, companyName);
        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed.');
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await login(email, role);
        if (!res.success) {
          setErrorMsg(res.error || 'Sign in failed. No account found.');
          setIsSubmitting(false);
          return;
        }
      }
      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md">
            F
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isRegisterMode ? 'Create Fabric Mart Account' : 'Sign In to Fabric Mart'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegisterMode
              ? 'Join fashion brands and verified textile mills worldwide'
              : 'Access your fabric sourcing dashboard, cart & order tracking'}
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setRole('BUYER');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-lg transition-all ${
              role === 'BUYER'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('SUPPLIER');
              setErrorMsg(null);
            }}
            className={`py-2.5 rounded-lg transition-all ${
              role === 'SUPPLIER'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Supplier
          </button>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold">{errorMsg}</p>
              {!isRegisterMode && errorMsg.includes('not found') && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMsg(null);
                  }}
                  className="text-blue-600 dark:text-blue-400 font-bold underline flex items-center gap-1 mt-1 hover:text-blue-700"
                >
                  <span>Click here to register a new account now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegisterMode && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder={isRegisterMode ? "alex@mybrand.com" : "emily@luxedesign.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {isRegisterMode && role === 'SUPPLIER' && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Textile Mill / Company Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Apex Textile Mills"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-md text-sm mt-2 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : isRegisterMode
              ? `Register Account (${role})`
              : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg(null);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            {isRegisterMode
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register now"}
          </button>
        </div>
      </div>
    </div>
  );
};
