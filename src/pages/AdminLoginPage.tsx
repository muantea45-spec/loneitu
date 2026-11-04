import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../components/common/Toast';

export const AdminLoginPage: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { loginAdminWithGmail, primaryOwnerEmail } = useBlog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Instant 1-Click Login Using Gmail
  const handleLoginUsingGmail = () => {
    setIsAuthenticating(true);

    setTimeout(() => {
      const email = primaryOwnerEmail || 'muantea45@gmail.com';
      loginAdminWithGmail(email);
      setIsAuthenticating(false);
      showToast(`Signed in as ${email} (Journal Administrator)`, 'success');
      navigate('/admin');
    }, 400);
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

        {/* Form Body: Direct 1-Click Google Sign-In */}
        <div className="p-8 space-y-6">
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleLoginUsingGmail}
            className="w-full py-4 px-5 rounded-2xl border-2 border-[#DDD4BC] bg-white hover:bg-[#F9F7F1] hover:border-[#256B3A]/40 text-[#143520] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3.5 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70 group"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#256B3A]" />
                <span className="font-medium">Signing in with Google...</span>
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
    </div>
  );
};
