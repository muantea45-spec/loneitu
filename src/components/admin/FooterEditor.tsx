import React, { useState, useEffect, useRef } from 'react';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';
import {
  Save,
  Check,
  PanelBottom,
  Megaphone,
  Sparkles,
  Link as LinkIcon,
  Heart,
  ArrowRight,
  Mail
} from 'lucide-react';
import type { FooterData } from '../../types/blog';

export const FooterEditor: React.FC = () => {
  const { footerData, updateFooterData, isCloudSyncing } = useBlog();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FooterData>(() => ({ ...footerData }));
  const [isSaved, setIsSaved] = useState(false);
  const isDirtyRef = useRef(false);

  // Sync from remote/context only if the user hasn't typed uncommitted changes
  useEffect(() => {
    if (!isDirtyRef.current) {
      setFormData({ ...footerData });
    }
  }, [footerData]);

  const handleChange = <K extends keyof FooterData>(key: K, value: FooterData[K]) => {
    isDirtyRef.current = true;
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFooterData(formData);
    isDirtyRef.current = false;
    setIsSaved(true);
    showToast('Footer & Banner settings saved and synced to cloud!', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#143520] text-[#BFDC28] flex items-center justify-center shadow-xs">
            <PanelBottom className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-[#143520]">
              Edit Footer & Announcement Banner
            </h1>
            <p className="text-xs text-[#8F7855] mt-0.5">
              Customize the global footer tagline, active notice banner, and legal copyright
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isCloudSyncing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-[#BFDC28]" />
              <span>Saved & Synced!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#BFDC28]" />
              <span>{isCloudSyncing ? 'Syncing...' : 'Save Footer Settings'}</span>
            </>
          )}
        </button>
      </div>

      {/* Section 1: Active Announcement Banner in Footer */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#143520]">
                1. Footer Announcement Banner
              </h2>
              <p className="text-xs text-[#8F7855]">
                Displays a prominent promotional or advisory notice bar right across the top of the footer
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <span className="text-xs font-bold text-[#143520]">
              {formData.bannerEnabled ? 'Banner Active' : 'Banner Disabled'}
            </span>
            <input
              type="checkbox"
              checked={formData.bannerEnabled ?? false}
              onChange={e => handleChange('bannerEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#EBE6D6] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DDD4BC] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#256B3A] relative" />
          </label>
        </div>

        {formData.bannerEnabled && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>Banner Badge / Tag</span>
                </label>
                <input
                  type="text"
                  value={formData.bannerBadge || ''}
                  onChange={e => handleChange('bannerBadge', e.target.value)}
                  placeholder="e.g. HRIATTIRNA THAR or SPECIAL ANNOUNCEMENT"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-bold text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
                  Banner Headline
                </label>
                <input
                  type="text"
                  value={formData.bannerTitle || ''}
                  onChange={e => handleChange('bannerTitle', e.target.value)}
                  placeholder="e.g. Loneitu Field Advisory & Community Journal"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl font-serif font-bold text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
                Banner Message / Advisory Text
              </label>
              <textarea
                rows={2}
                value={formData.bannerText || ''}
                onChange={e => handleChange('bannerText', e.target.value)}
                placeholder="Brief message displayed in the banner..."
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] leading-relaxed focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
                  Action Button Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.bannerButtonText || ''}
                  onChange={e => handleChange('bannerButtonText', e.target.value)}
                  placeholder="e.g. Kan Chanchin Chhiar Rawh"
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#256B3A]" />
                  <span>Action Button Destination Link (Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.bannerButtonLink || ''}
                  onChange={e => handleChange('bannerButtonLink', e.target.value)}
                  placeholder="e.g. /about or https://wa.me/..."
                  className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                />
              </div>
            </div>

            {/* Live Banner Preview */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-[#8F7855] uppercase tracking-wider block mb-1.5">
                Live Banner Preview:
              </span>
              <div className="bg-gradient-to-r from-[#173F26] via-[#215E34] to-[#173F26] text-white p-4 rounded-xl border border-[#256B3A] shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  {formData.bannerBadge && (
                    <span className="px-2.5 py-1 rounded-full bg-[#BFDC28] text-[#143520] text-[10px] font-bold uppercase tracking-wider shrink-0">
                      {formData.bannerBadge}
                    </span>
                  )}
                  <div>
                    <h4 className="font-serif font-bold text-sm text-white">
                      {formData.bannerTitle || 'Your Banner Headline'}
                    </h4>
                    <p className="text-xs text-[#D7E3D5] leading-relaxed mt-0.5">
                      {formData.bannerText || 'Your announcement message will be rendered here.'}
                    </p>
                  </div>
                </div>
                {formData.bannerButtonText && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#BFDC28] text-[#143520] text-xs font-bold shrink-0">
                    <span>{formData.bannerButtonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Main Footer Tagline */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <PanelBottom className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              2. Footer Mission Tagline
            </h2>
            <p className="text-xs text-[#8F7855]">
              Short description placed directly below the Loneitu logo in the footer
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
            Tagline / Mission Text
          </label>
          <textarea
            rows={3}
            value={formData.tagline}
            onChange={e => handleChange('tagline', e.target.value)}
            placeholder="e.g. Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal."
            className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] leading-relaxed focus:outline-hidden focus:border-[#256B3A]"
            required
          />
        </div>
      </div>

      {/* Section 3: Contact Us Email */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              3. Contact Us Email
            </h2>
            <p className="text-xs text-[#8F7855]">
              Manual email address displayed in the footer ("Contact Us @ email") for public inquiries
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
            Contact Email Address
          </label>
          <input
            type="email"
            value={formData.contactEmail || ''}
            onChange={e => handleChange('contactEmail', e.target.value)}
            placeholder="e.g. muantea45@gmail.com"
            className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
          />
          <p className="text-[11px] text-[#8F7855] mt-1.5">
            This email is displayed at the bottom of every page as a clickable direct email link.
          </p>
        </div>
      </div>

      {/* Section 4: Bottom Bar & Legal Notices */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              4. Copyright Notice & Dedication
            </h2>
            <p className="text-xs text-[#8F7855]">
              Bottom legal statement and heartfelt dedication displayed on every page
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Copyright Text
            </label>
            <input
              type="text"
              value={formData.copyrightText}
              onChange={e => handleChange('copyrightText', e.target.value)}
              placeholder="e.g. Loneitu (MIZORAM TAN). Mizoram thlai leh leilung humhalhna."
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Dedication Statement
            </label>
            <input
              type="text"
              value={formData.dedicationText}
              onChange={e => handleChange('dedicationText', e.target.value)}
              placeholder="e.g. Loneitute leh zirtirtute tana duhsakna nen"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
        </div>
      </div>

      {/* Floating Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isCloudSyncing}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-md hover:scale-101 cursor-pointer disabled:opacity-60"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-[#BFDC28]" />
              <span>Saved & Synced!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#BFDC28]" />
              <span>{isCloudSyncing ? 'Syncing...' : 'Save & Publish Footer Changes'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

