import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
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
  const [isGsiReady, setIsGsiReady] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const {
    loginAdminWithGmail,
    isAuthorizedEmail,
    googleClientId,
  } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Handle successful Google authentication
  const handleAuthSuccess = (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!isAuthorizedEmail(normalized)) {
      setIsAuthenticating(false);
      showToast(`Access Denied: "${normalized}" is not on the authorized administrator whitelist.`, 'error');
      return;
    }
    const loggedIn = loginAdminWithGmail(normalized);
    setIsAuthenticating(false);
    if (loggedIn) {
      showToast(`Welcome! Signed in with Google as ${normalized}`, 'success');
      navigate('/admin');
    } else {
      showToast(`Access Denied: "${normalized}" is not an authorized administrator.`, 'error');
    }
  };

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    let checkInterval: any = null;

    const setupGoogleGsi = () => {
      if (!window.google?.accounts?.id || !googleClientId) return false;

      try {
        // Initialize Google One-Tap & Button
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: { credential: string }) => {
            if (response.credential) {
              setIsAuthenticating(true);
              const payload = parseGoogleJwtCredential(response.credential);
              if (payload && payload.email) {
                handleAuthSuccess(payload.email);
              } else {
                setIsAuthenticating(false);
                showToast('Unable to read email from Google credential', 'error');
              }
            }
          },
          auto_select: false,
        });

        // Render the official Google Sign-In button
        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 280,
            logo_alignment: 'left',
          });
        }

        setIsGsiReady(true);
        return true;
      } catch (err) {
        console.error('Error setting up Google GSI', err);
        return false;
      }
    };

    if (!setupGoogleGsi()) {
      checkInterval = setInterval(() => {
        if (setupGoogleGsi()) {
          clearInterval(checkInterval);
        }
      }, 250);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [googleClientId]);

  // Fallback direct trigger via OAuth2 Token Client (opens Google account picker popup)
  const handleCustomGoogleClick = () => {
    if (!googleClientId) {
      showToast('Google Client ID not configured', 'error');
      return;
    }

    if (window.google?.accounts?.oauth2) {
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
                  handleAuthSuccess(user.email);
                  return;
                }
              } catch (e) {
                console.error('Failed to fetch userinfo', e);
              }
            }
            setIsAuthenticating(false);
          },
        });

        // prompt='select_account' forces Google to display all accounts on this device
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.error('Error invoking Google oauth2 token client', err);
        setIsAuthenticating(false);
      }
    }

    // Try Google ID prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
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

        {/* Form Body: Displays ONLY Login with Gmail option */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center justify-center min-h-[56px]">
            {isAuthenticating ? (
              <div className="flex items-center gap-2.5 text-xs text-[#143520] font-semibold py-3">
                <Loader2 className="w-5 h-5 animate-spin text-[#256B3A]" />
                <span>Signing in with Google...</span>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-3">
                {/* Official Google Sign-In Button Container */}
                <div
                  ref={googleBtnContainerRef}
                  className="flex justify-center w-full min-h-[44px]"
                />

                {/* Styled Google Fallback Button (visible if official iframe is loading or on tap) */}
                {!isGsiReady && (
                  <button
                    type="button"
                    onClick={handleCustomGoogleClick}
                    className="w-full py-3.5 px-4 rounded-full border border-[#DDD4BC] bg-white hover:bg-[#F9F7F1] text-[#143520] font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-xs hover:shadow-md cursor-pointer"
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
                )}
              </div>
            )}
          </div>

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
