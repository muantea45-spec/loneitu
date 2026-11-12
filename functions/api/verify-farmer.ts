/**
 * Cloudflare Pages Function: /api/verify-farmer?id=<farmerId>
 * Public verification lookup for Farmer QR Digital ID Cards & Certificates.
 * Returns ONLY sanitized verification metadata for one farmer without exposing full registry PII.
 */
const BACKEND_URL = 'https://loneitu.ddvktp.workers.dev/api/verify-farmer';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

function sanitizeFarmerForVerification(farmer: any) {
  if (!farmer) return null;
  const rawData = farmer.data && typeof farmer.data === 'object' ? farmer.data : {};
  const verifiedData: Record<string, string> = {};

  for (const [key, val] of Object.entries(rawData)) {
    const strVal = String(val ?? '').trim();
    if (!strVal) continue;
    if (/(aadhaar|aadhar|uid|bank|account|ifsc|pan\b)/i.test(key)) {
      continue;
    }
    if (/(contact|phone|mobile|cell|whatsapp|ph)/i.test(key)) {
      const digits = strVal.replace(/\D/g, '');
      verifiedData[key] = digits.length >= 4 ? `******${digits.slice(-4)}` : 'Verified on File';
      continue;
    }
    verifiedData[key] = strVal;
  }

  return {
    id: farmer.id,
    fullName: farmer.fullName || rawData['Name'] || rawData['Farmer Name'] || 'Verified Farmer',
    status: farmer.status || 'Verified',
    registrationDate: farmer.registrationDate || '2026-04-01',
    avatar: farmer.avatar || '',
    verifiedData,
  };
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const env = context.env as any;
    const reqUrl = new URL(context.request.url);
    const farmerId = decodeURIComponent((reqUrl.searchParams.get('id') || '').trim());

    if (!farmerId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing farmer ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    if (env?.LONEITU_KV) {
      let farmersList: any[] = [];
      const farmersDb = await env.LONEITU_KV.get('loneitu_farmers_db_v1', 'json');
      if (farmersDb && Array.isArray(farmersDb.farmers)) {
        farmersList = farmersDb.farmers;
      } else {
        const fullDb = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
        if (fullDb && Array.isArray(fullDb.farmers)) {
          farmersList = fullDb.farmers;
        }
      }

      const found = farmersList.find((f: any) => f.id === farmerId);
      if (!found) {
        return new Response(JSON.stringify({ success: false, error: 'Farmer record not found in verified registry' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, 'Cache-Control': 'no-store' },
        });
      }

      return new Response(JSON.stringify({ success: true, farmer: sanitizeFarmerForVerification(found) }), {
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    }

    const res = await fetch(`${BACKEND_URL}?id=${encodeURIComponent(farmerId)}`);
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        'Cache-Control': res.ok ? 'public, max-age=60, s-maxage=300' : 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
};
