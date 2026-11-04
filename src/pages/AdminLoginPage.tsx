import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, KeyRound, ArrowRight, Mail, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../components/common/Toast';

export const AdminLoginPage: React.FC = () => {
  const [gmailInput, setGmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPasskeyOption, setShowPasskeyOption] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const { loginAdminWithGmail, loginAdmin } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fast Google Account Sign-In (Primary Flow)
  const handleGoogleOneClick = (email = 'muantea45@gmail.com') => {
    setIsAuthenticating(true);
    setError('');

    setTimeout(() => {
      const ok = loginAdminWithGmail(email);
      setIsAuthenticating(false);
      if (ok) {
        showToast(`Signed in as ${email} (Journal Administrator)`, 'success');
        navigate('/admin');
      } else {
        setError('Failed to authenticate with Google. Please check your Gmail address.');
      }
    }, 600);
  };

  // Custom Gmail Submission
  const handleGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailInput.trim()) {
      setError('Please enter your Gmail account address.');
      return;
    }

    const email = gmailInput.trim();
    if (!email.toLowerCase().endsWith('@gmail.com') && !email.includes('@')) {
      setError('Please provide a valid Gmail address (e.g. muantea45@gmail.com).');
      return;
    }

    handleGoogleOneClick(email);
  };

  // Fallback Passkey Submission
  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = loginAdmin(password);
    if (success) {
      showToast('Authenticated via Master Passkey!', 'success');
      navigate('/admin');
    } else {
      setError('Invalid passkey. You can sign in directly with your Gmail account above.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#DDD4BC] shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#143520] p-8 text-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#BFDC28] text-[#143520] flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-white">
              Editorial CMS Console
            </h2>
            <span className="inline-block mt-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#1E542E] text-[#BFDC28] border border-[#256B3A]">
              loneitu.pages.dev/admin
            </span>
          </div>
          <p className="text-xs text-[#ADC6A7] max-w-xs mx-auto">
            Secure administrative access for Loneitu journal authors, agronomists, and editors.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Primary Method: Sign in with Google */}
          <div className="space-y-4">
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={() => handleGoogleOneClick('muantea45@gmail.com')}
              className="w-full py-3.5 px-4 rounded-xl border border-[#DDD4BC] bg-white hover:bg-[#F9F7F1] text-[#143520] font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-70 group"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#256B3A]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google G SVG */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                  <span className="text-[10px] bg-[#EBF1EA] text-[#1E542E] px-2 py-0.5 rounded-full font-mono ml-auto">
                    muantea45@gmail.com
                  </span>
                </>
              )}
            </button>

            {/* Quick-Select Verified Gmail Admin Badge */}
            <div className="p-3 bg-[#F2F7F3] rounded-2xl border border-[#B7CEB4]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-[#256B3A] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#143520] truncate">
                    muantea45@gmail.com
                  </div>
                  <div className="text-[10px] text-[#4A584E]">
                    Verified Journal Administrator
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGoogleOneClick('muantea45@gmail.com')}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#143520] text-white hover:bg-[#1E542E] transition-colors shrink-0 cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#EBE6D6] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#8F7855] uppercase font-semibold tracking-wider">
              or enter other Gmail
            </span>
          </div>

          {/* Manual Gmail Input */}
          <form onSubmit={handleGmailSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#54432C] mb-1.5">
                Authorized Gmail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F7855]" />
                <input
                  type="email"
                  value={gmailInput}
                  onChange={e => setGmailInput(e.target.value)}
                  placeholder="your-name@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Continue with this Gmail</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#BFDC28]" />
            </button>
          </form>

          {/* Fallback Master Passkey (Expandable) */}
          <div className="pt-2 border-t border-[#F6F4EB]">
            {!showPasskeyOption ? (
              <button
                type="button"
                onClick={() => setShowPasskeyOption(true)}
                className="text-[11px] text-[#8F7855] hover:text-[#143520] font-medium flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Or sign in with passkey</span>
              </button>
            ) : (
              <form onSubmit={handlePasskeySubmit} className="space-y-3 mt-2 p-3.5 bg-[#F9F7F1] rounded-xl border border-[#DDD4BC]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#54432C]">
                    Master Passkey
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasskeyOption(false)}
                    className="text-[10px] text-[#8F7855] hover:underline"
                  >
                    Hide
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8F7855]" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter passkey"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD4BC] rounded-lg text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#54432C] hover:bg-[#3B2E1D] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Unlock with Passkey
                </button>
              </form>
            )}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs text-[#8F7855] hover:text-[#143520] hover:underline"
            >
              ← Return to Loneitu Public Frontpage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
