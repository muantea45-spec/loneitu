import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, Crown, UserCheck, X, AlertCircle } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../components/common/Toast';

export const AdminLoginPage: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');

  const {
    loginAdminWithGmail,
    authorizedEmails,
    primaryOwnerEmail,
    isAuthorizedEmail,
  } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Perform sign-in with chosen Gmail
  const performSignIn = (email: string) => {
    setIsAuthenticating(true);
    setError('');

    setTimeout(() => {
      const ok = loginAdminWithGmail(email);
      setIsAuthenticating(false);
      setShowAccountChooser(false);

      if (ok) {
        const isPrimary = email.toLowerCase() === primaryOwnerEmail.toLowerCase();
        showToast(
          `Signed in as ${email} (${isPrimary ? 'Primary Owner' : 'Administrator'})`,
          'success'
        );
        navigate('/admin');
      } else {
        setError(
          `Access Denied: "${email}" is not on the authorized Loneitu administrator whitelist. Only designated editors can access the console.`
        );
      }
    }, 500);
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Gmail address.');
      return;
    }
    const normalized = customEmail.trim().toLowerCase();
    if (!isAuthorizedEmail(normalized)) {
      setError(
        `Access Denied: "${normalized}" is not on the authorized administrator whitelist.`
      );
      return;
    }
    performSignIn(normalized);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#DDD4BC] shadow-xl overflow-hidden">
        {/* Editorial CMS Console Header Banner */}
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

        {/* Form Body: ONLY Sign in with Google and Return Link */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Access Restricted</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Primary Action: Sign in with Google */}
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={() => {
              setError('');
              setShowAccountChooser(true);
            }}
            className="w-full py-4 px-5 rounded-2xl border-2 border-[#DDD4BC] bg-white hover:bg-[#F9F7F1] hover:border-[#256B3A]/40 text-[#143520] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3.5 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70 group"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#256B3A]" />
                <span className="font-medium">Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G Logo SVG */}
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
                <span className="text-[#143520] font-bold">Sign in with Google</span>
              </>
            )}
          </button>

          {/* Return to Loneitu Public Frontpage Link */}
          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs text-[#8F7855] hover:text-[#143520] hover:underline transition-colors inline-block"
            >
              ← Return to Loneitu Public Frontpage
            </Link>
          </div>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {showAccountChooser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {/* Google Logo */}
                <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24">
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
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  Choose an account
                </h3>
                <p className="text-xs text-gray-500">
                  to continue to <span className="font-semibold text-gray-800">Loneitu CMS</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAccountChooser(false);
                  setShowCustomInput(false);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account List */}
            <div className="divide-y divide-gray-100 border border-gray-150 rounded-2xl overflow-hidden">
              {authorizedEmails.map(email => {
                const isPrimary = email.toLowerCase() === primaryOwnerEmail.toLowerCase();
                const initial = email.charAt(0).toUpperCase();

                return (
                  <button
                    key={email}
                    type="button"
                    disabled={isAuthenticating}
                    onClick={() => performSignIn(email)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#143520] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#1E542E]">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-xs text-gray-900 truncate">
                          {email}
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          {isPrimary ? (
                            <span className="text-[#C2623D] font-bold flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" />
                              Primary Owner
                            </span>
                          ) : (
                            <span>Administrator</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <UserCheck className="w-4 h-4 text-[#256B3A] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>

            {/* Enter another account */}
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full py-2.5 text-xs text-[#256B3A] font-semibold hover:bg-[#F2F7F3] rounded-xl transition-colors cursor-pointer text-center"
              >
                + Use another Google account
              </button>
            ) : (
              <form onSubmit={handleCustomEmailSubmit} className="space-y-2 pt-1">
                <input
                  type="email"
                  autoFocus
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="Enter your authorized Gmail"
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:border-[#256B3A]"
                />
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2 bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Continue
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowAccountChooser(false);
                  setShowCustomInput(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
