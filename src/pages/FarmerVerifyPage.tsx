import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUrlResolver';
import { MFS_CREDENTIALS } from '../utils/farmerIdCardPdfGenerator';

const VERIFY_ENDPOINTS = [
  '/api/verify-farmer',
  'https://loneitu.ddvktp.workers.dev/api/verify-farmer',
];

interface VerifiedFarmerPayload {
  id: string;
  fullName: string;
  status?: string;
  registrationDate?: string;
  avatar?: string;
  verifiedData: Record<string, string>;
}

export const FarmerVerifyPage: React.FC = () => {
  const { farmerId } = useParams<{ farmerId?: string }>();
  const navigate = useNavigate();

  const [lookupId, setLookupId] = useState(farmerId || '');
  const [loading, setLoading] = useState(Boolean(farmerId));
  const [farmer, setFarmer] = useState<VerifiedFarmerPayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLookupId(farmerId || '');
    if (!farmerId || !farmerId.trim()) {
      setFarmer(null);
      setErrorMsg(null);
      setLoading(false);
      document.title = 'Farmer Verification — Loneitu (MIZORAM TAN)';
      return;
    }

    let cancelled = false;
    const verify = async () => {
      setLoading(true);
      setErrorMsg(null);
      setFarmer(null);

      for (const endpoint of VERIFY_ENDPOINTS) {
        try {
          const res = await fetch(`${endpoint}?id=${encodeURIComponent(farmerId.trim())}`, {
            cache: 'no-store',
          });
          if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
            const json = await res.json();
            if (cancelled) return;
            if (json?.success && json.farmer) {
              setFarmer(json.farmer as VerifiedFarmerPayload);
              document.title = `Verified Farmer: ${json.farmer.fullName} — Loneitu`;
              setLoading(false);
              return;
            }
          } else if (res.status === 404) {
            if (cancelled) return;
            setErrorMsg('No registered farmer record matched this ID.');
            document.title = 'Farmer Not Found — Loneitu';
            setLoading(false);
            return;
          }
        } catch {
          // try fallback endpoint
        }
      }

      if (!cancelled) {
        setErrorMsg('Unable to verify farmer record right now. Please check the ID and try again.');
        setLoading(false);
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [farmerId]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = lookupId.trim();
    if (!cleaned) return;
    navigate(`/verify/${encodeURIComponent(cleaned)}`);
  };

  const avatarSrc = farmer?.avatar ? resolveImageUrl(farmer.avatar) : '';
  const dataEntries = Object.entries(farmer?.verifiedData || {});

  return (
    <div className="min-h-[75vh] bg-[#F6F4EB] py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#256B3A] hover:text-[#143520] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Loneitu Home</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143520] text-[#BFDC28] text-[11px] font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            OFFICIAL REGISTRY VERIFICATION
          </span>
        </div>

        {/* Lookup Bar */}
        <form
          onSubmit={handleLookupSubmit}
          className="bg-white rounded-2xl border border-[#DDD4BC] p-4 sm:p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="font-serif font-bold text-lg sm:text-xl text-[#143520]">
                Mizo Farm Solutions — Farmer Identity Verification
              </h1>
              <p className="text-xs text-[#6F5B3C]">
                Scan a Farmer Digital ID Card QR code or enter a Registry ID to verify active enrollment.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6F5B3C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lookupId}
                onChange={e => setLookupId(e.target.value)}
                placeholder="Enter Farmer Registry ID (e.g., FRM-001)"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#DDD4BC] bg-[#FBF9F4] text-[#143520] focus:outline-none focus:border-[#256B3A]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#143520] hover:bg-[#1E542E] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Verify ID
            </button>
          </div>
        </form>

        {/* Verification Result */}
        {loading && (
          <div className="bg-white rounded-2xl border border-[#DDD4BC] p-10 text-center space-y-3 shadow-xs">
            <div className="w-9 h-9 border-3 border-[#256B3A]/20 border-t-[#256B3A] rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-[#143520]">
              Verifying farmer record against Loneitu Registry...
            </p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="bg-white rounded-2xl border border-amber-300 p-8 text-center space-y-3 shadow-xs">
            <ShieldAlert className="w-11 h-11 text-amber-600 mx-auto" />
            <h2 className="font-serif font-bold text-xl text-[#143520]">
              Verification Record Not Found
            </h2>
            <p className="text-xs sm:text-sm text-[#6F5B3C] max-w-md mx-auto">
              {errorMsg}
            </p>
            <p className="text-[11px] text-[#6F5B3C]/80 font-mono">
              Checked Registry ID: {farmerId}
            </p>
          </div>
        )}

        {!loading && farmer && (
          <div className="bg-white rounded-2xl border border-[#DDD4BC] overflow-hidden shadow-sm">
            {/* Green Verification Header */}
            <div className="bg-[#143520] px-5 sm:px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3 border-b-4 border-[#BFDC28]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-[#BFDC28] shrink-0" />
                <div>
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[#BFDC28]">
                    Verified Registered Farmer
                  </p>
                  <p className="text-xs text-white/85">
                    {MFS_CREDENTIALS.organizationName}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#256B3A] border border-[#BFDC28]/40 text-xs font-bold text-white">
                {farmer.status || 'Active'}
              </span>
            </div>

            {/* Identity Strip */}
            <div className="p-5 sm:p-6 border-b border-[#EFEAE0] flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-24 h-28 rounded-xl border border-[#DDD4BC] bg-[#F6F4EB] overflow-hidden shrink-0 flex items-center justify-center">
                {avatarSrc && !avatarSrc.startsWith('data:image/svg') ? (
                  <img
                    src={avatarSrc}
                    alt={farmer.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCheck className="w-10 h-10 text-[#256B3A]" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#256B3A]">
                  <BadgeCheck className="w-4 h-4" />
                  <span>ID: {farmer.id}</span>
                </div>
                <h2 className="font-serif font-bold text-2xl text-[#143520]">
                  {farmer.fullName}
                </h2>
                <p className="text-xs text-[#6F5B3C]">
                  Registered on: <strong className="text-[#143520]">{farmer.registrationDate || '2026'}</strong>
                </p>
                <p className="text-[11px] text-[#6F5B3C]/90 pt-1">
                  Society Reg: {MFS_CREDENTIALS.regNo} • NITI Aayog DARPAN: {MFS_CREDENTIALS.darpanId} • UDYAM: {MFS_CREDENTIALS.udyamNo}
                </p>
              </div>
            </div>

            {/* Verified Attributes Grid */}
            <div className="p-5 sm:p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6F5B3C]">
                Verified Enrollment Attributes
              </h3>

              {dataEntries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dataEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl bg-[#FBF9F4] border border-[#EAE4D3] px-3.5 py-2.5"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#6F5B3C]">
                        {key}
                      </p>
                      <p className="text-sm font-medium text-[#143520] wrap-break-word mt-0.5">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6F5B3C]">
                  Core identity confirmed in the active Mizo Farm Solutions registry.
                </p>
              )}

              <div className="pt-2 border-t border-[#EFEAE0] text-[11px] text-[#6F5B3C] flex flex-wrap items-center justify-between gap-2">
                <span>
                  Privacy Notice: Sensitive Aadhaar/UID/bank details are redacted, and phone numbers are masked.
                </span>
                <span className="font-semibold text-[#143520]">{MFS_CREDENTIALS.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
