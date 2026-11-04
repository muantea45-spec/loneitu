import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, Crown, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../components/common/Toast';

export const AdminLoginPage: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showOtherEmailInput, setShowOtherEmailInput] = useState(false);
  const [otherEmail, setOtherEmail] = useState('');

  const {
    loginAdminWithGmail,
    authorizedEmails,
    primaryOwnerEmail,
    addAuthorizedEmail,
  } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Instant 1-Click Sign-In with Selected Account
  const handleSelectAccount = (email: string) => {
    setIsAuthenticating(true);
    setSelectedEmail(email);

    setTimeout(() => {
      loginAdminWithGmail(email);
      setIsAuthenticating(false);
      const isPrimary = email.toLowerCase() === (primaryOwnerEmail || '').toLowerCase();
      showToast(
        `Signed in as ${email} (${isPrimary ? 'Primary Owner' : 'Journal Administrator'})`,
        'success'
      );
      navigate('/admin');
    }, 350);
  };

  // Sign In with Another Gmail Address
  const handleOtherEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherEmail.trim() || !otherEmail.includes('@')) {
      return;
    }
    const emailToUse = otherEmail.trim().toLowerCase();
    addAuthorizedEmail(emailToUse);
    handleSelectAccount(emailToUse);
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
            Authorized administrative access for Loneitu journal authors, agronomists, and editors.
          </p>
        </div>

        {/* Account Selection Card */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-1">
            {/* Google Logo */}
            <svg className="w-6 h-6 mx-auto mb-1.5" viewBox="0 0 24 24">
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
            <h3 className="text-base font-bold text-[#143520]">
              Choose an account to sign in
            </h3>
            <p className="text-xs text-[#6F5B3C]">
              Select any of your administrator accounts to enter:
            </p>
          </div>

          {/* List of Administrator Accounts */}
          <div className="divide-y divide-[#EBE6D6] border-2 border-[#DDD4BC] rounded-2xl overflow-hidden bg-white shadow-xs">
            {authorizedEmails.map(email => {
              const isPrimary = email.toLowerCase() === (primaryOwnerEmail || '').toLowerCase();
              const initial = email.charAt(0).toUpperCase();
              const isCurrent = isAuthenticating && selectedEmail === email;

              return (
                <button
                  key={email}
                  type="button"
                  disabled={isAuthenticating}
                  onClick={() => handleSelectAccount(email)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9F7F1] transition-all cursor-pointer group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#143520] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#1E542E] transition-colors">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-[#143520] truncate group-hover:text-[#256B3A] transition-colors">
                        {email}
                      </div>
                      <div className="text-[10px] text-[#6F5B3C] flex items-center gap-1 mt-0.5">
                        {isPrimary ? (
                          <span className="text-[#C2623D] font-bold flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" />
                            Primary Owner
                          </span>
                        ) : (
                          <span>Journal Administrator</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isCurrent ? (
                      <Loader2 className="w-4 h-4 text-[#256B3A] animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-[#256B3A] opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Option to Use Another Gmail Account */}
          {!showOtherEmailInput ? (
            <button
              type="button"
              onClick={() => setShowOtherEmailInput(true)}
              className="w-full py-2.5 text-xs text-[#256B3A] hover:text-[#1E542E] font-semibold hover:bg-[#F2F7F3] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Use or add another Gmail account</span>
            </button>
          ) : (
            <form onSubmit={handleOtherEmailSubmit} className="space-y-2.5 p-3.5 bg-[#F9F7F1] rounded-2xl border border-[#DDD4BC]">
              <label className="block text-xs font-semibold text-[#54432C]">
                Enter Your Gmail Account
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  autoFocus
                  required
                  value={otherEmail}
                  onChange={e => setOtherEmail(e.target.value)}
                  placeholder="your-account@gmail.com"
                  className="flex-1 px-3.5 py-2 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A]"
                />
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="px-3.5 py-2 bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3 text-[#BFDC28]" />
                </button>
              </div>
            </form>
          )}

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
    </div>
  );
};
