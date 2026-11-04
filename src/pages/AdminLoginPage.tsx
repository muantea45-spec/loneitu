import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../components/common/Toast';

declare global {
  interface Window {
    google?: {
      accounts: {
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
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const AdminLoginPage: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { verifyAndLoginAdmin, verifyAndLoginWithGoogleJwt, googleClientId } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Initialize Real Google Identity Services (GSI) if Client ID configured
  useEffect(() => {
    if (!googleClientId || !window.google?.accounts?.id || !googleButtonRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential: string }) => {
          setIsAuthenticating(true);
          setErrorMessage('');
          const result = verifyAndLoginWithGoogleJwt(response.credential);
          setIsAuthenticating(false);

          if (result.ok) {
            showToast(`Verified via Google Identity! Welcome back.`, 'success');
            navigate('/admin');
          } else {
            setErrorMessage(result.error || 'Google authentication failed.');
          }
        },
      });

      // Render official Google Sign-In button
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 320,
      });
    } catch (e) {
      console.error('Error initializing Google Sign-In', e);
    }
  }, [googleClientId, verifyAndLoginWithGoogleJwt, navigate, showToast]);

  // Handle Secure Sign-In (Requires both verified Gmail + Secret Passkey)
  const handleSecureLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check lock
    if (lockedUntil && Date.now() < lockedUntil) {
      const remainingSeconds = Math.ceil((lockedUntil - Date.now()) / 1000);
      setErrorMessage(`Too many failed attempts. Security lockout active for ${remainingSeconds} seconds.`);
      return;
    }

    if (!emailInput.trim() || !emailInput.includes('@')) {
      setErrorMessage('Please enter your authorized Gmail address.');
      return;
    }

    if (!passkeyInput.trim()) {
      setErrorMessage('Owner Security Passkey is required to prove account ownership.');
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage('');

    setTimeout(() => {
      const result = verifyAndLoginAdmin(emailInput, passkeyInput);
      setIsAuthenticating(false);

      if (result.ok) {
        setFailedAttempts(0);
        showToast('Owner Verified! Logged in to Editorial CMS Console.', 'success');
        navigate('/admin');
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          const lockTime = Date.now() + 10 * 60 * 1000; // 10 minutes
          setLockedUntil(lockTime);
          setErrorMessage('Maximum security threshold exceeded. Access temporarily locked for 10 minutes.');
        } else {
          setErrorMessage(
            result.error || 'Access Denied: Invalid credentials. Only verified owners with the secret passkey may enter.'
          );
        }
      }
    }, 600);
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
            Protected administrative console. Verified credentials and owner authorization required.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Security Restriction</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Real Google One-Tap/Identity Button (if Google Client ID active) */}
          {googleClientId && (
            <div className="flex flex-col items-center justify-center space-y-3 pb-2 border-b border-[#F6F4EB]">
              <div ref={googleButtonRef} />
              <div className="text-[11px] text-[#8F7855] text-center">
                Or authenticate with your Owner Security Key below
              </div>
            </div>
          )}

          {/* Secure Owner Authentication Form */}
          <form onSubmit={handleSecureLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#54432C] mb-1.5">
                Authorized Gmail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F7855]" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#54432C]">
                  Owner Secret Passkey (2FA Key)
                </label>
                <span className="text-[10px] text-[#8F7855]" title="Prevents anyone who knows your email from logging in">
                  Required
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F7855]" />
                <input
                  type={showPasskey ? 'text' : 'password'}
                  required
                  value={passkeyInput}
                  onChange={e => setPasskeyInput(e.target.value)}
                  placeholder="Enter secret security key"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#13341D] placeholder:text-[#8F7855]/60 focus:outline-hidden focus:border-[#256B3A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F7855] hover:text-[#143520] transition-colors cursor-pointer"
                  title={showPasskey ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 px-4 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-70 mt-2"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#BFDC28]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  {/* Google 4-color SVG */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>Verify & Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Security Assurance Notice */}
          <div className="p-3 bg-[#F2F7F3] rounded-xl border border-[#B7CEB4]/60 text-[11px] text-[#4A584E] flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#256B3A] shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Leakage Protection:</strong> Registered administrator emails are strictly hidden. Only verified owners with the secret passkey are permitted entry.
            </span>
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
