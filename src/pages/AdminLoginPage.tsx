import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, Crown, Plus, ArrowRight, UserCheck, X, Settings } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../components/common/Toast';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
        id?: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const AdminLoginPage: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showChooserModal, setShowChooserModal] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherEmail, setOtherEmail] = useState('');
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');

  const {
    loginAdminWithGmail,
    authorizedEmails,
    primaryOwnerEmail,
    addAuthorizedEmail,
    googleClientId,
    setGoogleClientId,
  } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Primary Action: User clicks "Sign in with Google" / "Login with Gmail"
  const handleGoogleLoginClick = () => {
    // If real Google OAuth Client ID is available and Google library is loaded
    if (googleClientId && window.google?.accounts?.oauth2) {
      try {
        setIsAuthenticating(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setIsAuthenticating(false);
              showToast('Google Sign-In was cancelled or failed.', 'error');
              return;
            }
            if (tokenResponse.access_token) {
              try {
                // Fetch profile to get verified email
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                setIsAuthenticating(false);

                if (profile && profile.email) {
                  const email = profile.email.toLowerCase();
                  addAuthorizedEmail(email);
                  loginAdminWithGmail(email);
                  showToast(`Signed in with Google as ${email}!`, 'success');
                  navigate('/admin');
                  return;
                }
              } catch (e) {
                console.error('Failed to fetch userinfo from Google', e);
              }
            }
            setIsAuthenticating(false);
          },
        });

        // Request access token with prompt="select_account" so Google shows all accounts on device
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Real Google GIS error, falling back to account chooser modal', err);
        setIsAuthenticating(false);
      }
    }

    // If Google Client ID not yet set, pop up the account chooser modal
    setShowChooserModal(true);
  };

  // Instant 1-Click Sign-In with Selected Account from Modal
  const handleSelectAccount = (email: string) => {
    setIsAuthenticating(true);
    setShowChooserModal(false);

    setTimeout(() => {
      loginAdminWithGmail(email);
      setIsAuthenticating(false);
      const isPrimary = email.toLowerCase() === (primaryOwnerEmail || '').toLowerCase();
      showToast(
        `Signed in as ${email} (${isPrimary ? 'Primary Owner' : 'Journal Administrator'})`,
        'success'
      );
      navigate('/admin');
    }, 300);
  };

  // Sign In with Another Gmail Address from Modal
  const handleOtherEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherEmail.trim() || !otherEmail.includes('@')) {
      return;
    }
    const emailToUse = otherEmail.trim().toLowerCase();
    addAuthorizedEmail(emailToUse);
    handleSelectAccount(emailToUse);
  };

  // Save Google Client ID
  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;
    setGoogleClientId(clientIdInput.trim());
    setShowClientIdConfig(false);
    showToast('Google Client ID connected! Click Sign in with Google again to open Google popup.', 'success');
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

        {/* Form Body: ONLY Sign In with Google Button and Return Link */}
        <div className="p-8 space-y-6">
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleGoogleLoginClick}
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

      {/* Account Selector Popup Modal (Appears only upon clicking "Sign in with Google") */}
      {showChooserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <svg className="w-6 h-6 mb-1.5" viewBox="0 0 24 24">
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
                  Choose an account
                </h3>
                <p className="text-xs text-[#6F5B3C]">
                  to continue to <strong className="text-[#143520]">Loneitu CMS</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChooserModal(false);
                  setShowOtherInput(false);
                  setShowClientIdConfig(false);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account List */}
            <div className="divide-y divide-[#EBE6D6] border-2 border-[#DDD4BC] rounded-2xl overflow-hidden bg-white shadow-xs">
              {authorizedEmails.map(email => {
                const isPrimary = email.toLowerCase() === (primaryOwnerEmail || '').toLowerCase();
                const initial = email.charAt(0).toUpperCase();

                return (
                  <button
                    key={email}
                    type="button"
                    onClick={() => handleSelectAccount(email)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F9F7F1] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#143520] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#1E542E]">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[#143520] truncate">
                          {email}
                        </div>
                        <div className="text-[10px] text-[#6F5B3C] flex items-center gap-1">
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
                    <UserCheck className="w-4 h-4 text-[#256B3A] shrink-0 opacity-60 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>

            {/* Option to Use Another Account */}
            {!showOtherInput ? (
              <button
                type="button"
                onClick={() => setShowOtherInput(true)}
                className="w-full py-2.5 text-xs text-[#256B3A] hover:text-[#1E542E] font-semibold hover:bg-[#F2F7F3] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Use another Gmail account</span>
              </button>
            ) : (
              <form onSubmit={handleOtherEmailSubmit} className="space-y-2.5 p-3.5 bg-[#F9F7F1] rounded-2xl border border-[#DDD4BC]">
                <label className="block text-xs font-semibold text-[#54432C]">
                  Enter your Gmail account
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    autoFocus
                    required
                    value={otherEmail}
                    onChange={e => setOtherEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="flex-1 px-3 py-2 bg-white border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] focus:outline-hidden focus:border-[#256B3A]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3 h-3 text-[#BFDC28]" />
                  </button>
                </div>
              </form>
            )}

            {/* Connect Google Cloud Client ID (For Real Google Popup) */}
            <div className="pt-2 border-t border-gray-100">
              {!showClientIdConfig ? (
                <button
                  type="button"
                  onClick={() => setShowClientIdConfig(true)}
                  className="text-[11px] text-[#8F7855] hover:text-[#143520] flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>{googleClientId ? 'Google Client ID Connected' : 'Connect Google Cloud Client ID'}</span>
                </button>
              ) : (
                <form onSubmit={handleSaveClientId} className="space-y-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-left">
                  <div className="text-[11px] font-bold text-gray-800">
                    Paste Google OAuth Client ID:
                  </div>
                  <input
                    type="text"
                    required
                    value={clientIdInput}
                    onChange={e => setClientIdInput(e.target.value)}
                    placeholder="xxxxxxxx.apps.googleusercontent.com"
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-[11px] font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#143520] text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    Activate Native Google Popup
                  </button>
                </form>
              )}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowChooserModal(false);
                  setShowOtherInput(false);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
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
