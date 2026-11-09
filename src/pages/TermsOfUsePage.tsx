import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, ArrowLeft, ChevronRight, Mail, Share2, ShieldAlert } from 'lucide-react';

export const TermsOfUsePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Terms of Use — Loneitu (MIZORAM TAN)';
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
            <span className="text-[#256B3A] font-semibold">Terms of Use</span>
          </nav>

          {/* Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#143520] text-[#BFDC28]">
              <FileText className="w-3.5 h-3.5" />
              <span>Legal Agreement</span>
            </span>
          </div>

          {/* Title & Metadata */}
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#143520] leading-[1.2]">
              Terms of Use
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#6F5B3C] max-w-2xl leading-relaxed">
              Standard conditions of use, agrarian research disclaimer, intellectual property terms, and community guidelines for Loneitu.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDD4BC] text-xs text-[#6F5B3C]">
            <div>
              <span>Effective & Last Updated: </span>
              <strong className="text-[#143520]">November 9, 2026</strong>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/privacy"
                className="text-[#256B3A] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Privacy Policy</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <article className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EBE6D6] shadow-xs space-y-8 text-sm sm:text-base text-[#2D3A31] leading-relaxed">
          
          {/* Section 1: Acceptance */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              Welcome to <strong>Loneitu (MIZORAM TAN)</strong>, operated by <strong>Mizo Farm Solutions</strong> at <code className="bg-[#F6F4EB] px-1 py-0.5 rounded text-xs font-mono text-[#143520]">https://loneitu.com</code>. By visiting, browsing, reading articles, or utilizing our Progressive Web App (PWA) and Farmer Registry, you agree to comply with and be bound by these Terms of Use. If you do not agree, please discontinue using the platform.
            </p>
          </section>

          {/* Section 2: CRITICAL AGRARIAN DISCLAIMER */}
          <section className="space-y-4">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>2. Agrarian & Technical Information Disclaimer</span>
            </h2>

            <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-xs sm:text-sm text-amber-950 space-y-3 shadow-xs">
              <div className="font-bold text-sm text-[#143520] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Informational & Educational Purpose Only</span>
              </div>
              <p className="leading-relaxed">
                All agricultural articles, soil management schedules, biochar/vermicompost ratios, fertilizer dosages, pruning recommendations, livestock management notes, and pest control guidelines published on Loneitu are provided strictly for <strong>general educational and journalistic purposes</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-amber-900 leading-relaxed">
                <li>
                  <strong>Consult Certified Agronomists:</strong> Agricultural success depends on local altitude, soil pH, monsoon cycles, microclimates, and specific crop varieties. Before making major financial outlays, applying chemical inputs, or changing field operations, always consult your local <strong>Krishi Vigyan Kendra (KVK)</strong>, State Department of Agriculture / Horticulture officers, or certified extension specialists.
                </li>
                <li>
                  <strong>No Guarantee of Yields:</strong> Mizo Farm Solutions verifies agrarian field observations carefully, but cannot guarantee specific commercial crop yields, market prices, or resilience against unforeseen weather anomalies.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Intellectual Property & Fair Use */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              3. Intellectual Property & Community Fair Use
            </h2>
            <p>
              All editorial articles, original field photography, charts, custom code, and brand marks ("Loneitu", "Mizo Farm Solutions", "MIZORAM TAN") are the exclusive intellectual property of <strong>Mizo Farm Solutions</strong> or credited contributors.
            </p>
            <div className="p-4 rounded-2xl bg-[#F2F7F3] border border-[#B7CEB4] space-y-2 text-xs sm:text-sm text-[#143520]">
              <div className="font-bold flex items-center gap-1.5 text-[#256B3A]">
                <Share2 className="w-4 h-4" />
                <span>Encouraged Community Sharing (Fair Use)</span>
              </div>
              <p className="text-[#4A584E]">
                We actively encourage farmers, agricultural educators, self-help groups (SHGs), and youth across Mizoram to share article excerpts, key takeaways, and web links freely on <strong>WhatsApp, Facebook, and non-commercial educational forums</strong>, provided you include clear attribution to <strong>Loneitu (loneitu.com)</strong>.
              </p>
            </div>
            <p className="text-xs text-[#6F5B3C]">
              <strong>Prohibited:</strong> Mass-scraping, unauthorized automated mirroring, repackaging, or commercial resale of the Loneitu database or Farmer Registry without written permission is strictly prohibited.
            </p>
          </section>

          {/* Section 4: Farmer Registry Conduct */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              4. Farmer Registry & Practitioner Conduct
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#4A584E]">
              <li>
                <strong className="text-[#143520]">Truthful Information:</strong> Any farmer, nursery owner, or practitioner submitting records warrants that farm size, crop varieties, and contact details are truthful and authentic.
              </li>
              <li>
                <strong className="text-[#143520]">Anti-Telemarketing Protection:</strong> Contact details in the Farmer Registry are published exclusively for agrarian peer networking, produce buyers, and verified agricultural knowledge exchange. Using this registry for spam, bulk commercial SMS, or predatory telemarketing is strictly forbidden.
              </li>
            </ul>
          </section>

          {/* Section 5: Embedded Content & Links */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              5. Embedded Media (YouTube & Instagram)
            </h2>
            <p>
              Loneitu embeds technical video demonstrations from YouTube and Instagram Reels. We do not own third-party video platforms; your viewing experience and video data are governed by the terms and policies of YouTube and Meta/Instagram respectively.
            </p>
          </section>

          {/* Section 6: Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#143520] border-b border-[#DDD4BC] pb-2">
              6. Limitation of Liability
            </h2>
            <p className="text-[#4A584E]">
              To the maximum extent permitted by Indian law, Mizo Farm Solutions and its editorial team shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from farming decisions taken, temporary network outages, or circumstances beyond our reasonable control.
            </p>
          </section>

          {/* Section 7: Governing Law */}
          <section className="space-y-3 pt-4 border-t border-[#DDD4BC]">
            <h2 className="font-serif font-bold text-xl text-[#143520]">
              7. Governing Law & Dispute Resolution
            </h2>
            <p className="text-[#4A584E]">
              These Terms shall be governed by and construed in accordance with the <strong>laws of India</strong>. Any dispute arising out of or related to Loneitu shall be subject to the exclusive jurisdiction of the competent courts in <strong>Champhai, Mizoram, India</strong>.
            </p>
          </section>

          {/* Section 8: Contact */}
          <section className="space-y-2">
            <div className="p-5 rounded-2xl bg-[#F6F4EB] border border-[#DDD4BC] space-y-2">
              <div className="font-semibold text-sm text-[#143520]">
                Mizo Farm Solutions — Loneitu Legal Desk
              </div>
              <div className="text-xs text-[#6F5B3C] space-y-1">
                <div>Location: Champhai, Mizoram, India</div>
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
              to="/privacy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#256B3A] hover:underline"
            >
              <span>Read Privacy Policy</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};

