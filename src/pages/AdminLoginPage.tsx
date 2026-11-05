import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../components/common/Toast';
import { parseGoogleJwtCredential } from '../config/authConfig';

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
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle';
              width?: number;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const AdminLoginPage: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const {
    loginAdminWithGmail,
    checkAndRefreshAuthorization,
    googleClientId,
  } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Handle successful Google authentication for hriata.cherput@gmail.com, muantea45@gmail.com, etc.
  const handleAuthSuccess = async (email: string) => {
    const normalized = (email || '').trim().toLowerCase();
    setErrorMessage(null);
    setIsAuthenticating(true);

    try {
      // 1. Direct check: specifically whitelist hriata.cherput@gmail.com & muantea45@gmail.com
      const isPreApproved =
        normalized === 'hriata.cherput@gmail.com' ||
        normalized === 'muantea45@gmail.com';

      // 2. Real-time check against database
      const authorized = isPreApproved || (await checkAndRefreshAuthorization(normalized));

      if (!authorized) {
        const msg = `Access Denied: "${normalized}" is not an authorized administrator.`;
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      const loggedIn = loginAdminWithGmail(normalized);
      if (loggedIn) {
        showToast(`Welcome! Signed in as ${normalized}`, 'success');
        navigate('/admin', { replace: true });
      } else {
        const msg = `Access Denied: "${normalized}" could not be verified.`;
        setErrorMessage(msg);
        showToast(msg, 'error');
      }
    } catch (err: any) {
      console.error('Auth verification error:', err);
      const msg = 'Unable to complete sign-in. Please try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Initialize Google Identity Services (GIS) safely
  useEffect(() => {
    let checkInterval: any = null;

    const setupGoogleGsi = () => {
      if (!window.google?.accounts?.id || !googleClientId) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: { credential: string }) => {
            if (response.credential) {
              const payload = parseGoogleJwtCredential(response.credential);
              if (payload && payload.email) {
                handleAuthSuccess(payload.email);
              } else {
                showToast('Unable to read email from Google credential', 'error');
              }
            }
          },
          auto_select: false,
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 300,
            logo_alignment: 'center',
          });
        }

        return true;
      } catch (err) {
        console.warn('Google GSI notice (safe fallback active):', err);
        return false;
      }
    };

    if (!setupGoogleGsi()) {
      checkInterval = setInterval(() => {
        if (setupGoogleGsi()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [googleClientId]);

  // Reliable Google Sign-In Trigger (Works on Mobile Safari, Chrome, and Desktop)
  const handleGoogleSignInClick = () => {
    setErrorMessage(null);

    // 1. Try OAuth2 Token Client (Mobile-friendly direct popup)
    if (googleClientId && window.google?.accounts?.oauth2) {
      try {
        setIsAuthenticating(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setIsAuthenticating(false);
              return;
            }
            if (tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const user = await res.json();
                if (user && user.email) {
                  await handleAuthSuccess(user.email);
                  return;
                }
              } catch (e) {
                console.error('Failed to fetch userinfo', e);
              }
            }
            setIsAuthenticating(false);
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.error('OAuth2 token client trigger error:', err);
      }
    }

    // 2. Fallback to Google ID prompt
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('Google ID prompt error:', e);
      }
    }

    setIsAuthenticating(false);
    showToast('Google Sign-In is initializing. Please tap again in a moment.', 'info');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#DDD4BC] shadow-xl overflow-hidden">
        {/* Editorial CMS Console Header Banner */}
        <div className="bg-[#143520] p-8 text-white text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#BFDC28] text-[#143520] flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-white">
              Editorial CMS Console
            </h2>
            <span className="inline-block mt-1 text-[11px] font-mono px-3 py-0.5 rounded-full bg-[#1E542E] text-[#BFDC28] border border-[#256B3A]">
              {typeof window !== 'undefined' ? `${window.location.host}/admin` : 'loneitu-cbe.pages.dev/admin'}
            </span>
          </div>
          <p className="text-xs text-[#ADC6A7] max-w-xs mx-auto leading-relaxed">
            Authorized administrative access for <strong>hriata.cherput@gmail.com</strong> and <strong>muantea45@gmail.com</strong>.
          </p>
        </div>

        {/* Form Body: ONLY Google Login Option */}
        <div className="p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center min-h-[70px] space-y-4">
            {isAuthenticating ? (
              <div className="flex items-center gap-2.5 text-xs text-[#143520] font-semibold py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#256B3A]" />
                <span>Signing in with Google...</span>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-3">
                {/* Official Google Button Container */}
                <div
                  ref={googleBtnContainerRef}
                  className="flex justify-center w-full min-h-[46px]"
                />

                {/* Styled Mobile & Desktop Google Button (1-click trigger) */}
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  className="w-full max-w-[300px] py-3.5 px-5 rounded-xl border border-[#DDD4BC] bg-white hover:bg-[#F9F7F1] active:bg-[#F0ECE1] text-[#143520] font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-xs hover:shadow-md cursor-pointer"
                >
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
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-center text-[#8F7855] leading-relaxed max-w-xs mx-auto">
            Tap the button above to authenticate with your Google account. Both mobile and desktop browsers are fully supported.
          </p>

          {/* Return to Loneitu Public Frontpage Link */}
          <div className="text-center pt-2 border-t border-[#EBE6D6]">
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
