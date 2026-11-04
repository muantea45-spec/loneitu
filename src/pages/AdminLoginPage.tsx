import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, KeyRound, ArrowRight, Sprout, CheckCircle2 } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../components/common/Toast';

export const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = loginAdmin(password);
    if (success) {
      showToast('Welcome to the Loneitu Editorial CMS Console (MIZORAM TAN)!', 'success');
      navigate('/admin');
    } else {
      setError('Invalid admin credentials. (Hint: Try "admin" or use 1-click Demo Login below)');
    }
  };

  const handleQuickDemoLogin = () => {
    loginAdmin('admin');
    showToast('Logged in as Chief Agronomy Editor!', 'success');
    navigate('/admin');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#DDD4BC] shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#143520] p-8 text-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#BFDC28] text-[#143520] flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-white">
            Editorial CMS Console
          </h2>
          <p className="text-xs text-[#ADC6A7] max-w-xs mx-auto">
            Authorized access for agronomists, peer reviewers, and journal editors.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#54432C] mb-1.5">
                Editor Passkey / Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F7855]" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator passkey"
                  className="w-full pl-10 pr-4 py-3 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A]"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Authenticate & Enter Console</span>
              <ArrowRight className="w-4 h-4 text-[#BFDC28]" />
            </button>
          </form>

          {/* Quick Demo 1-Click Login Box */}
          <div className="p-4 bg-[#F2F7F3] rounded-2xl border border-[#B7CEB4]/60 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#143520]">
              <CheckCircle2 className="w-4 h-4 text-[#256B3A]" />
              <span>Reviewer & Evaluator One-Click Access</span>
            </div>
            <p className="text-[11px] text-[#4A584E] leading-relaxed">
              No password memorization required for review. Click below to instantly log in as Chief Editor with complete authoring privileges.
            </p>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 px-3 bg-[#BFDC28] hover:bg-[#d5f33d] text-[#143520] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>One-Click Demo Admin Login</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs text-[#8F7855] hover:text-[#143520] hover:underline"
            >
              ← Return to Public Journal Frontpage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

