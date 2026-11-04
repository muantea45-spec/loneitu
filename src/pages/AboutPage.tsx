import React, { useEffect } from 'react';
import { Sprout } from 'lucide-react';
import { useBlog } from '../context/BlogContext';

export const AboutPage: React.FC = () => {
  const { authors } = useBlog();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'About & Editorial Manifesto — Loneitu (MIZORAM TAN)';
  }, []);

  const corePrinciples = [
    {
      title: 'Empirical Field Verification',
      description: 'We do not publish theoretical models ungrounded in real acreage. Every technique must be tested across real growing seasons in diverse soil types.',
    },
    {
      title: 'Biological Regeneration over Chemical Crutches',
      description: 'We prioritize mycorrhizal restoration, diverse cover crop cocktails, and multi-trophic biocontrols before synthetic intervention.',
    },
    {
      title: 'Appropriate Agro-Technology',
      description: 'Technology must serve the farmstead, not indebt it. We champion open-source LoRa telemetry, solar cold chains, and modular hardware.',
    },
    {
      title: 'Rural Community Self-Reliance',
      description: 'Farming is the economic cornerstone of rural civilization. We advocate for decentralized processing hubs and generational equity.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FBFBF8] pb-16">
      {/* Hero Header */}
      <div className="w-full bg-[#143520] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#256B3A]">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BFDC28]/20 border border-[#BFDC28]/40 text-[#BFDC28] text-xs font-bold uppercase tracking-wider mx-auto">
            <Sprout className="w-4 h-4" />
            <span>The Loneitu Manifesto — MIZORAM TAN</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Empowering Mizoram Farmers with Sustainable Agronomy & Agro-Tech.
          </h1>

          <p className="text-base sm:text-lg text-[#D7E3D5] leading-relaxed max-w-2xl mx-auto font-light">
            Loneitu is a dedicated agricultural platform built for Mizoram—fostering climate-smart hill agronomy, high-value horticulture, livestock care, and rural prosperity.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16">
        {/* Editorial Vision */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EBE6D6] shadow-xs space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#256B3A]">
            Our Editorial Purpose
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520]">
            Why Modern Agriculture Requires a New Reading Standard
          </h2>
          <div className="text-sm sm:text-base text-[#4A584E] leading-relaxed space-y-4">
            <p>
              For over half a century, mainstream agricultural communication was dominated by chemical input catalogs and subsidized monoculture advice. Soil was simplified into a dead sponge to be force-fed soluble NPK, while pests and weeds were met with escalating sprays that bred resistant biotypes.
            </p>
            <p>
              Today, a quiet agricultural revolution is underway. Farmers worldwide are demonstrating that by fostering subterranean mycorrhizal fungal webs, crimping dense cover crops, deploying low-power wireless tension sensors, and integrating timber trees with livestock, farms can thrive through extreme weather while slashing overhead costs.
            </p>
            <blockquote className="border-l-4 border-[#256B3A] pl-4 py-2 my-4 italic text-[#143520] bg-[#F6F4EB] rounded-r-xl">
              "To heal the climate and nourish human communities, we must first restore the microbial dignity of the soil beneath our feet."
            </blockquote>
          </div>
        </div>

        {/* 4 Pillars */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520]">
              The Four Agronomic Pillars
            </h3>
            <p className="text-xs sm:text-sm text-[#8F7855]">
              Guiding standards for every article, investigation, and field protocol we publish
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {corePrinciples.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#EBE6D6] shadow-xs space-y-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EBF1EA] text-[#256B3A] flex items-center justify-center font-bold text-xs">
                  0{idx + 1}
                </div>
                <h4 className="font-serif font-bold text-lg text-[#143520]">
                  {pillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#6F5B3C] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contributing Agronomists */}
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#256B3A]">
              Editorial Advisory
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#143520] mt-1">
              Contributing Agronomists & Field Researchers
            </h3>
            <p className="text-xs sm:text-sm text-[#8F7855] mt-1">
              Researchers and farmers authoring our peer-informed investigations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {authors.map(author => (
              <div
                key={author.id}
                className="bg-white p-6 rounded-2xl border border-[#EBE6D6] shadow-xs flex gap-4 items-start"
              >
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#256B3A]/20 shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-[#143520]">
                    {author.name}
                  </h4>
                  <div className="text-xs font-semibold text-[#256B3A]">
                    {author.role}
                  </div>
                  <div className="text-[11px] text-[#8F7855]">
                    {author.institution}
                  </div>
                  <p className="text-xs text-[#54432C] pt-2 line-clamp-3 leading-relaxed">
                    {author.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
