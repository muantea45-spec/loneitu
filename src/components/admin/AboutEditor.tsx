import React, { useState, useEffect } from 'react';
import { useBlog } from '../../context/BlogContext';
import { useToast } from '../common/Toast';
import type { AboutPageData, PillarItem } from '../../types/blog';
import {
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Info,
  BookOpen,
  Sparkles,
  Quote,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AboutEditor: React.FC = () => {
  const { aboutData, updateAboutData, isCloudSyncing } = useBlog();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<AboutPageData>(aboutData);
  const [isSaved, setIsSaved] = useState(false);

  // Keep form data updated if remote changes arrive
  useEffect(() => {
    setFormData(aboutData);
  }, [aboutData]);

  const handleChange = (field: keyof AboutPageData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handlePillarChange = (index: number, field: keyof PillarItem, value: string) => {
    setFormData(prev => {
      const updatedPillars = [...prev.pillars];
      updatedPillars[index] = {
        ...updatedPillars[index],
        [field]: value,
      };
      return { ...prev, pillars: updatedPillars };
    });
    setIsSaved(false);
  };

  const handleAddPillar = () => {
    const newPillar: PillarItem = {
      id: `pillar-${Date.now()}`,
      title: 'New Agronomic Pillar',
      description: 'Describe this key principle or protocol for sustainable hill farming.',
    };
    setFormData(prev => ({
      ...prev,
      pillars: [...prev.pillars, newPillar],
    }));
    setIsSaved(false);
    showToast('New pillar added! Remember to save changes.', 'info');
  };

  const handleRemovePillar = (index: number) => {
    if (formData.pillars.length <= 1) {
      showToast('You must keep at least one pillar.', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      pillars: prev.pillars.filter((_, i) => i !== index),
    }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutData(formData);
    setIsSaved(true);
    showToast('About page successfully updated & synced globally!', 'success');
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
            Customize the editorial vision, agronomic pillars, and manifesto copy displayed on the public /about page.
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
              Separate paragraphs with empty lines. Standard Markdown like **bold**, *italics*, and lists are fully supported.
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
              Featured Manifesto Quotation Callout
            </label>
            <div className="relative">
              <Quote className="w-4 h-4 text-[#256B3A] absolute top-3 left-3" />
              <textarea
                rows={2}
                value={formData.quote}
                onChange={e => handleChange('quote', e.target.value)}
                placeholder="Highlighted manifesto quote..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs italic text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: The Agronomic Pillars */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD4BC] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE6D6] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold">
              <span className="text-xs">03</span>
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#143520]">
                3. The Core Agronomic Pillars
              </h2>
              <p className="text-xs text-[#8F7855]">
                Key foundational principles highlighted in grid cards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddPillar}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF1EA] text-[#1E542E] hover:bg-[#DFEDE3] rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-[#256B3A]" />
            <span>Add Pillar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Pillars Section Title
            </label>
            <input
              type="text"
              value={formData.pillarsTitle}
              onChange={e => handleChange('pillarsTitle', e.target.value)}
              placeholder="e.g. The Four Agronomic Pillars"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs font-medium text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F5B3C] mb-1.5">
              Pillars Section Subtitle
            </label>
            <input
              type="text"
              value={formData.pillarsSubtitle}
              onChange={e => handleChange('pillarsSubtitle', e.target.value)}
              placeholder="e.g. Guiding standards for every article, investigation, and field protocol we publish"
              className="w-full px-3.5 py-2.5 bg-[#F6F4EB] border border-[#DDD4BC] rounded-xl text-xs text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
              required
            />
          </div>
        </div>

        {/* Pillars Cards List */}
        <div className="space-y-4 pt-2">
          {formData.pillars.map((pillar, idx) => (
            <div
              key={pillar.id || idx}
              className="p-4 sm:p-5 rounded-xl border border-[#DDD4BC] bg-[#FBFBF8] space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#EBF1EA] text-[#256B3A] font-bold text-xs flex items-center justify-center">
                  0{idx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemovePillar(idx)}
                  className="p-1.5 text-[#8F7855] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove this pillar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                  Pillar Title
                </label>
                <input
                  type="text"
                  value={pillar.title}
                  onChange={e => handlePillarChange(idx, 'title', e.target.value)}
                  placeholder="Pillar title..."
                  className="w-full px-3 py-2 bg-white border border-[#DDD4BC] rounded-lg font-serif font-bold text-sm text-[#143520] focus:outline-hidden focus:border-[#256B3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F5B3C] mb-1">
                  Pillar Description
                </label>
                <textarea
                  rows={2}
                  value={pillar.description}
                  onChange={e => handlePillarChange(idx, 'description', e.target.value)}
                  placeholder="Explain the importance and application of this pillar..."
                  className="w-full px-3 py-2 bg-white border border-[#DDD4BC] rounded-lg text-xs text-[#54432C] leading-relaxed focus:outline-hidden focus:border-[#256B3A]"
                  required
                />
              </div>
            </div>
          ))}
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
            <strong>Note:</strong> The individual author profiles, photos, and institutional credentials displayed in this section are managed separately under the <strong>Authors & Contributors</strong> tab on the left sidebar.
          </p>
        </div>
      </div>

      {/* Bottom Floating/Sticky Save Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDD4BC] shadow-md flex items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="text-xs text-[#6F5B3C] hidden sm:block">
          All modifications are immediately synced across mobile and desktop devices.
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="submit"
            disabled={isCloudSyncing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-4 h-4 text-[#BFDC28] animate-spin" />
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
