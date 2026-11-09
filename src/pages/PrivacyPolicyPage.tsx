import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft, ChevronRight, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Privacy Policy — Loneitu (MIZORAM TAN)';
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-16">
      {/* Header Container */}
      <div className="w-full bg-[#F6F4EB] border-b border-[#EBE6D6] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#6F5B3C] font-medium">
            <Link to="/" className="hover:text-[#143520] transition-colors">
              Journal
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#256B3A] font-semibold">Privacy Policy</span>
          </nav>

          {/* Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#143520] text-[#BFDC28]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Legal Documentation</span>
            </span>
          </div>

          {/* Title & Metadata */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#143520] leading-[1.2]">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#6F5B3C] max-w-2xl leading-relaxed">
              How Mizo Farm Solutions and Loneitu (MIZORAM TAN) protect your personal information, respect offline reading, and uphold Indian data privacy standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDD4BC] text-xs text-[#6F5B3C]">
            <div>
              <span>Effective & Last Updated: </span>
              <strong className="text-[#143520]">November 9, 2026</strong>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/terms"
                className="text-[#256B3A] font-semibold hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Terms of Use</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <article className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EBE6D6] shadow-xs space-y-8 text-sm sm:text-base text-[#2D3A31] leading-relaxed">
          
          {/* Introductory Notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F2F7F3] border border-[#B7CEB4] space-y-2">
            <h3 className="font-serif font-bold text-base text-[#143520] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#256B3A]" />
              <span>Mizo Farm Solutions Commitment</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#4A584E] leading-relaxed">
              <strong>Mizo Farm Solutions</strong> ("we," "our," or "us"), operating the agricultural publication and field registry platform <strong>Loneitu (MIZORAM TAN)</strong> at <strong>https://loneitu.com</strong>, respects your privacy and is committed to protecting your personal data in accordance with the <strong>Information Technology Act, 2000</strong> and the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act, India)</strong>.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect only minimal, purpose-specific information required to deliver agrarian technical articles, agricultural directory features, and educational updates:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#4A584E]">
              <li>
                <strong className="text-[#143520]">Newsletter & Field Subscribers:</strong> If you voluntarily subscribe to our agronomy updates or email us, we collect your <strong>email address</strong>.
              </li>
              <li>
                <strong className="text-[#143520]">Farmer Registry Submissions:</strong> For local growers and practitioners listed in our public Farmer Directory, we collect verified agricultural details with consent (name, contact number, village/district, crop types, land size, and farming techniques).
              </li>
              <li>
                <strong className="text-[#143520]">Progressive Web App (PWA) Offline Storage:</strong> To allow farmers to read technical articles in remote hill areas without internet, Loneitu stores saved articles, reading progress, and bookmarks locally on your device via HTML5 <code className="bg-[#F6F4EB] px-1 py-0.5 rounded text-xs font-mono text-[#143520]">localStorage</code>. This data never leaves your device.
              </li>
              <li>
                <strong className="text-[#143520]">Anonymous Edge Logs:</strong> Our infrastructure (Cloudflare) records standard anonymous access logs (IP address, browser type, timestamps) solely for security, DDoS protection, and bot defense.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              2. Zero Ad-Tracking Guarantee
            </h2>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-900">
              <EyeOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#143520]">We do not sell, rent, or trade your personal data.</p>
                <p className="mt-1 text-[#6F5B3C]">
                  Loneitu operates completely free of cross-site ad brokers, commercial tracking pixels, or invasive telemetry. Any cookies used are strictly functional to remember your display preferences and session tokens.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              3. How We Use Information
            </h2>
            <p>Your information is used exclusively for legitimate operational purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-[#DDD4BC] bg-[#FAF8F3] space-y-1">
                <span className="font-bold text-xs text-[#143520] block">Agricultural Publishing</span>
                <span className="text-xs text-[#6F5B3C]">Delivering verified hill farming guides, soil reports, and agronomy research.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#DDD4BC] bg-[#FAF8F3] space-y-1">
                <span className="font-bold text-xs text-[#143520] block">Agrarian Networking</span>
                <span className="text-xs text-[#6F5B3C]">Facilitating verified grower discovery and peer knowledge exchange.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#DDD4BC] bg-[#FAF8F3] space-y-1">
                <span className="font-bold text-xs text-[#143520] block">Offline Accessibility</span>
                <span className="text-xs text-[#6F5B3C]">Enabling instant access to technical knowledge even without cellular reception.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#DDD4BC] bg-[#FAF8F3] space-y-1">
                <span className="font-bold text-xs text-[#143520] block">Security & Bot Defense</span>
                <span className="text-xs text-[#6F5B3C]">Blocking scraping bots and unauthorized administrative intrusions.</span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              4. Data Security Standards
            </h2>
            <p>
              All traffic to <code className="bg-[#F6F4EB] px-1 py-0.5 rounded text-xs font-mono text-[#143520]">loneitu.com</code> is enforced over encrypted <strong>HTTPS (TLS 1.2 / TLS 1.3)</strong> with HTTP Strict Transport Security (HSTS), clickjacking defense (<code className="bg-[#F6F4EB] px-1 py-0.5 rounded text-xs font-mono text-[#143520]">X-Frame-Options: SAMEORIGIN</code>), and MIME-sniffing protection. Editorial access is strictly restricted through multi-factor Google OAuth whitelist verification.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              5. Your Rights Under the Indian DPDP Act 2023
            </h2>
            <p>You retain full control over your personal data:</p>
            <ul className="space-y-2 text-[#4A584E]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#256B3A] shrink-0 mt-1" />
                <span><strong>Right to Access:</strong> You may request a summary of the personal data we hold about you.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#256B3A] shrink-0 mt-1" />
                <span><strong>Right to Correction:</strong> You may update or correct inaccurate details in the Farmer Directory.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#256B3A] shrink-0 mt-1" />
                <span><strong>Right to Erasure (Withdrawal of Consent):</strong> You may request deletion of your listed farmer profile or email subscription at any time.</span>
              </li>
            </ul>
            <p className="pt-2 text-xs text-[#6F5B3C]">
              To exercise any of these rights, email us at <a href="mailto:contact@loneitu.com" className="text-[#256B3A] font-bold underline">contact@loneitu.com</a>. We process verified requests within 7 business days.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[#DDD4BC]">
            <h2 className="font-serif font-bold text-xl text-[#143520]">
              6. Official Contact & Grievance Desk
            </h2>
            <div className="p-5 rounded-2xl bg-[#F6F4EB] border border-[#DDD4BC] space-y-2">
              <div className="font-semibold text-sm text-[#143520]">
                Mizo Farm Solutions — Loneitu (MIZORAM TAN)
              </div>
              <div className="text-xs text-[#6F5B3C] space-y-1">
                <div>Attn: Privacy & Editorial Compliance Desk</div>
                <div>Location: Aizawl, Mizoram, India</div>
                <div className="pt-1">
                  Official Email:{' '}
                  <a
                    href="mailto:contact@loneitu.com"
                    className="inline-flex items-center gap-1 text-[#256B3A] font-mono font-bold hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#256B3A]" />
                    <span>contact@loneitu.com</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Return Links */}
          <div className="pt-4 flex items-center justify-between border-t border-[#EBE6D6]">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143520] hover:text-[#256B3A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#256B3A] hover:underline"
            >
              <span>Read Terms of Use</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};
