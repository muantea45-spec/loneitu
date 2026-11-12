import React, { useState } from 'react';
import type { FarmerRecord } from '../../types/farmer';
import { resolveImageUrl } from '../../utils/imageUrlResolver';
import { 
  X, 
  BadgeCheck, 
  Share2, 
  Printer, 
  Check,
  MessageCircle,
  Phone
} from 'lucide-react';

interface FarmerDetailModalProps {
  farmer: FarmerRecord | null;
  onClose: () => void;
}

function getFarmerContactNo(data: Record<string, any> = {}): string {
  for (const [key, val] of Object.entries(data)) {
    if (/contact|phone|mobile|cell|whatsapp|ph/i.test(key)) {
      const s = String(val || '').trim();
      if (s) return s;
    }
  }
  return '';
}

function getWhatsAppLink(contact: string, name?: string): string | null {
  const digits = (contact || '').replace(/\D/g, '');
  if (!digits || digits.length < 10) return null;
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const msg = encodeURIComponent(
    name ? `Chibai ${name}! Loneitu (Mizoram Tan) atanga biak i ni e.` : 'Chibai! Loneitu (Mizoram Tan) atanga biak i ni e.'
  );
  return `https://wa.me/${phone}?text=${msg}`;
}

function getDirectCallLink(contact: string): string | null {
  const digits = (contact || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `tel:+91${digits}`;
  if (digits.length > 10) return `tel:+${digits}`;
  if (digits.length >= 6) return `tel:${digits}`;
  return null;
}

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({ farmer, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!farmer) return null;

  const handleShare = () => {
    const entries = farmer.data ? Object.entries(farmer.data) : [];
    const fieldsText = entries.map(([k, v]) => `${k}: ${v}`).join('\n');
    const text = `Farmer Registry Profile: ${farmer.fullName}\n\n${fieldsText}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const uploadedEntries = farmer.data ? Object.entries(farmer.data) : [];
  const contactNo = getFarmerContactNo(farmer.data);
  const primaryWaUrl = contactNo ? getWhatsAppLink(contactNo, farmer.fullName) : null;
  const primaryCallUrl = contactNo ? getDirectCallLink(contactNo) : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header: Centered Circular Avatar & Farmer Name */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-[#D5D9E2] dark:border-[#D5D9E2]">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full p-1 ring-2 ring-[#CBD5E1] dark:ring-[#CBD5E1] shadow-md flex items-center justify-center bg-white shadow-2xs">
              {farmer.avatar ? (
                <img
                  src={resolveImageUrl(farmer.avatar)}
                  alt={farmer.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] dark:from-[#E2E8F0] dark:to-[#CBD5E1] text-[#334155] dark:text-[#334155] font-black text-3xl flex items-center justify-center shadow-inner">
                  {farmer.fullName ? farmer.fullName.trim().charAt(0).toUpperCase() : 'F'}
                </div>
              )}
            </div>
            <div 
              className="absolute bottom-1 right-1 bg-[#256B3A] text-white p-1.5 rounded-full shadow-md ring-2 ring-white"
              title="Verified Record"
            >
              <BadgeCheck className="w-4 h-4 text-[#BFDC28]" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {farmer.fullName}
          </h2>

          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {uploadedEntries.length} Uploaded Columns
            </span>

            {/* Direct Phone Call Quick Action Button in Header */}
            {primaryCallUrl && (
              <a
                href={primaryCallUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-2xs hover:scale-105 transition-all cursor-pointer"
                title={`Call ${farmer.fullName} directly (${contactNo})`}
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Call ({contactNo})</span>
              </a>
            )}

            {/* 1-Click WhatsApp Quick Action Button in Header */}
            {primaryWaUrl && (
              <a
                href={primaryWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-2xs hover:scale-105 transition-all cursor-pointer"
                title={`Chat with ${farmer.fullName} on WhatsApp`}
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp ({contactNo})</span>
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Fields Section: Displays ONLY the uploaded columns and values */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {uploadedEntries.length === 0 ? (
              <p className="col-span-2 text-center text-slate-400 py-6">
                No uploaded column data available for this record.
              </p>
            ) : (
              uploadedEntries.map(([key, val]) => {
                const isContact = /contact|phone|mobile|cell|whatsapp|ph/i.test(key);
                const fieldWaUrl = isContact && val ? getWhatsAppLink(String(val), farmer.fullName) : null;
                const fieldCallUrl = isContact && val ? getDirectCallLink(String(val)) : null;

                return (
                  <div 
                    key={key} 
                    className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 block mb-1">
                      {key}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white break-words">
                        {String(val)}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {fieldCallUrl && (
                          <a
                            href={fieldCallUrl}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-2xs hover:scale-105 transition-all cursor-pointer shrink-0"
                            title={`Call directly: ${val}`}
                          >
                            <Phone className="w-3 h-3 fill-current" />
                            <span>Call</span>
                          </a>
                        )}
                        {fieldWaUrl && (
                          <a
                            href={fieldWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-[11px] font-bold shadow-2xs hover:scale-105 transition-all cursor-pointer shrink-0"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 fill-current" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Details' : 'Share Profile'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-[#256B3A] text-white hover:bg-[#1b4d2a] transition-colors shadow-sm ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
