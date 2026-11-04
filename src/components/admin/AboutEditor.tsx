import React, { useState, useEffect, useRef } from 'react';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';
import type { AboutPageData, SocialLinks } from '../../types/blog';
import {
  Save,
  ExternalLink,
  BookOpen,
  Sparkles,
  Quote,
  CheckCircle2,
  RefreshCw,
  Share2,
  Info
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
  YouTubeIcon,
  TwitterIcon,
  SocialIconsRow
} from '../common/SocialIcons';

export const AboutEditor: React.FC = () => {
  const { aboutData, updateAboutData, isCloudSyncing } = useBlog();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<AboutPageData>(() => ({
    ...aboutData,
    socialLinks: {
      instagram: aboutData.socialLinks?.instagram || '',
      facebook: aboutData.socialLinks?.facebook || '',
      whatsapp: aboutData.socialLinks?.whatsapp || '',
      youtube: aboutData.socialLinks?.youtube || '',
      twitter: aboutData.socialLinks?.twitter || '',
    },
  }));

  const [isSaved, setIsSaved] = useState(false);

  // User-interaction guard: prevents background polling from reverting text while the user is typing
  const isDirtyRef = useRef(false);

  useEffect(() => {
    // Only accept external updates if user has NOT modified the form
    if (!isDirtyRef.current) {
      setFormData({
        ...aboutData,
        socialLinks: {
          instagram: aboutData.socialLinks?.instagram || '',
          facebook: aboutData.socialLinks?.facebook || '',
          whatsapp: aboutData.socialLinks?.whatsapp || '',
          youtube: aboutData.socialLinks?.youtube || '',
          twitter: aboutData.socialLinks?.twitter || '',
        },
      });
    }
  }, [aboutData]);

  const handleChange = (field: keyof AboutPageData, value: any) => {
    isDirtyRef.current = true;
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSocialChange = (network: keyof SocialLinks, value: string) => {
    isDirtyRef.current = true;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [network]: value,
      },
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isDirtyRef.current = false;
    updateAboutData(formData);
    setIsSaved(true);
    showToast('About page successfully updated & saved across all devices!', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DDD4BC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#256B3A] mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Public Page Customization</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#143520]">
            Edit About & Editorial Manifesto Page
          </h1>
          <p className="text-xs text-[#8F7855] mt-1">
            Customize the editorial vision, manifesto copy, and optional social media links displayed at /about.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DDD4BC] text-[#54432C] hover:bg-[#F6F4EB] text-xs font-semibold transition-colors"
          >
            <span>View Live Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="submit"
            disabled={isCloudSyncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-4 h-4 text-[#BFDC28] animate-spin" />
            ) : isSaved ? (
              <CheckCircle2 className="w-4 h-4 text-[#BFDC28]" />
            ) : (
              <Save className="w-4 h-4 text-[#BFDC28]" />
            )}
            <span>{isCloudSyncing ? 'Syncing...' : isSaved ? 'Saved & Synced' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Section 1: Hero Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              1. Hero Header & Mission Badge
            </h2>
            <p className="text-xs text-[#8F7855]">
              The prominent dark green banner displayed at the top of the About page
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Badge / Kicker Text
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={e => handleChange('badge', e.target.value)}
              placeholder="e.g. The Loneitu Manifesto — MIZORAM TAN"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Main Hero Heading
            </label>
            <input
              type="text"
              value={formData.heroTitle}
              onChange={e => handleChange('heroTitle', e.target.value)}
              placeholder="e.g. Empowering Mizoram Farmers with Sustainable Agronomy & Agro-Tech."
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl font-serif font-bold text-base text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Hero Subtitle / Mission Summary
            </label>
            <textarea
              rows={3}
              value={formData.heroDescription}
              onChange={e => handleChange('heroDescription', e.target.value)}
              placeholder="Describe the overarching mission of Loneitu in 2-3 sentences..."
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] leading-relaxed focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Editorial Purpose & Manifesto */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              2. Editorial Purpose & Manifesto Text
            </h2>
            <p className="text-xs text-[#8F7855]">
              Detailed narrative explaining why Loneitu exists and what reading standard it sets
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
                Section Tag / Kicker
              </label>
              <input
                type="text"
                value={formData.editorialTag}
                onChange={e => handleChange('editorialTag', e.target.value)}
                placeholder="e.g. Our Editorial Purpose"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
                Section Headline
              </label>
              <input
                type="text"
                value={formData.editorialTitle}
                onChange={e => handleChange('editorialTitle', e.target.value)}
                placeholder="e.g. Why Modern Agriculture Requires a New Reading Standard"
                className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl font-serif font-bold text-sm text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Editorial Manifesto Content (Markdown & Paragraphs)
            </label>
            <p className="text-[11px] text-[#8F7855] mb-2">
              Separate paragraphs with empty lines. Standard Markdown formatting (e.g. **bold**, *italics*, bullet points) is fully supported.
            </p>
            <textarea
              rows={8}
              value={formData.editorialBody}
              onChange={e => handleChange('editorialBody', e.target.value)}
              placeholder="Write the editorial manifesto..."
              className="w-full p-4 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-mono text-[#143520] leading-relaxed focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Featured Manifesto Quotation Callout (Optional)
            </label>
            <div className="relative">
              <Quote className="w-4 h-4 text-[#256B3A] absolute top-3 left-3" />
              <textarea
                rows={2}
                value={formData.quote || ''}
                onChange={e => handleChange('quote', e.target.value)}
                placeholder="Highlighted manifesto quote..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs italic text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Social Media Links (Simple Brand Logos - Not Mandatory) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#EBE6D6] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#143520]">
                3. Social Media Logos & Links
              </h2>
              <p className="text-xs text-[#8F7855]">
                Displayed simply as clean, recognizable brand logos on the About page and footer. Completely optional.
              </p>
            </div>
          </div>

          {/* Live Preview of Active Logos */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8F7855] uppercase tracking-wider">Preview:</span>
            <SocialIconsRow links={formData.socialLinks} variant="light" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instagram */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#E1306C]"><InstagramIcon className="w-4 h-4" /></span>
              <span>Instagram (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.instagram || ''}
              onChange={e => handleSocialChange('instagram', e.target.value)}
              placeholder="https://instagram.com/yourhandle or @yourhandle"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#1877F2]"><FacebookIcon className="w-4 h-4" /></span>
              <span>Facebook (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.facebook || ''}
              onChange={e => handleSocialChange('facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#25D366]"><WhatsAppIcon className="w-4 h-4" /></span>
              <span>WhatsApp (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.whatsapp || ''}
              onChange={e => handleSocialChange('whatsapp', e.target.value)}
              placeholder="e.g. +91 9876543210 or https://wa.me/..."
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#FF0000]"><YouTubeIcon className="w-4 h-4" /></span>
              <span>YouTube (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.youtube || ''}
              onChange={e => handleSocialChange('youtube', e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>

          {/* X / Twitter */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5 flex items-center gap-1.5">
              <span className="text-[#143520]"><TwitterIcon className="w-4 h-4" /></span>
              <span>X / Twitter (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.socialLinks?.twitter || ''}
              onChange={e => handleSocialChange('twitter', e.target.value)}
              placeholder="https://x.com/yourhandle or @yourhandle"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Editorial Advisory & Research Team Headers */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EBE6D6] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
            <span className="text-xs">04</span>
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#143520]">
              4. Authors & Researchers Section Headers
            </h2>
            <p className="text-xs text-[#8F7855]">
              Section titles for the contributing researcher cards rendered at the bottom of the About page
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              value={formData.authorsTitle}
              onChange={e => handleChange('authorsTitle', e.target.value)}
              placeholder="e.g. Contributing Agronomists & Field Researchers"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Section Subtitle
            </label>
            <input
              type="text"
              value={formData.authorsSubtitle}
              onChange={e => handleChange('authorsSubtitle', e.target.value)}
              placeholder="e.g. Researchers and farmers authoring our peer-informed investigations"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
        </div>

        <div className="p-4 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-[#256B3A] shrink-0 mt-0.5" />
          <p className="text-xs text-[#54432C] leading-relaxed">
            <strong>Note:</strong> The individual author profiles, photos, and credentials displayed in this section are managed separately under the <strong>Authors & Contributors</strong> tab on the left sidebar.
          </p>
        </div>
      </div>

      {/* Bottom Floating/Sticky Save Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-md flex items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="text-xs text-[#6F5B3C] hidden sm:block">
          All changes are saved to Cloudflare KV and instantly available across all devices.
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="submit"
            disabled={isCloudSyncing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-4 h-4 text-[#BFDC28] animate-spin" />
            ) : isSaved ? (
              <CheckCircle2 className="w-4 h-4 text-[#BFDC28]" />
            ) : (
              <Save className="w-4 h-4 text-[#BFDC28]" />
            )}
            <span>{isCloudSyncing ? 'Syncing...' : 'Save & Publish About Page'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
