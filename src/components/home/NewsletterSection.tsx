import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Sprout } from 'lucide-react';
import { useToast } from '../common/Toast';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please provide a valid email address.', 'error');
      return;
    }
    setIsSubmitted(true);
    showToast('You are subscribed to the Loneitu Field Dispatch (MIZORAM TAN)!', 'success');
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E542E] via-[#143520] to-[#244B34] text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-[#256B3A]/60">
        {/* Subtle decorative grain background */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-[#BFDC28]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BFDC28]/20 border border-[#BFDC28]/40 text-[#BFDC28] text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-3.5 h-3.5" />
            <span>Weekly Agronomy Briefing</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Cultivate Deep Agronomic Insight Delivered Every Tuesday Dawn.
          </h3>

          <p className="text-sm sm:text-base text-[#D7E3D5] leading-relaxed max-w-2xl font-light">
            Receive summaries of emerging soil microbiome research, LoRaWAN field node telemetry benchmarks, cover crop mixture calculators, and regional agricultural policy analyses. Zero promotional spam.
          </p>

          {isSubmitted ? (
            <div className="flex items-center gap-3 p-4 bg-[#BFDC28]/20 rounded-2xl border border-[#BFDC28] text-[#BFDC28] text-sm font-semibold max-w-md">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Thank you for joining our community of regenerative agrarian stewards! Check your inbox for the welcome agronomy guide.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A682]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="enter your farm or research email"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-[#32864A] rounded-xl text-xs sm:text-sm text-white placeholder:text-[#ADC6A7] focus:outline-hidden focus:border-[#BFDC28] focus:ring-1 focus:ring-[#BFDC28]"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-[#BFDC28] text-[#143520] font-bold text-xs sm:text-sm hover:bg-[#d5f33d] transition-all duration-200 shrink-0 cursor-pointer shadow-md"
              >
                Subscribe Free
              </button>
            </form>
          )}

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#ADC6A7] pt-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#BFDC28]" />
              Strict privacy: no third-party data tracking
            </span>
            <span>•</span>
            <span>Unsubscribe with 1-click anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

