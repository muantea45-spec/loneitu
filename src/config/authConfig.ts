/**
 * Loneitu (MIZORAM TAN) — Administrator Whitelist & Security Configuration
 * Strictly protects the Editorial CMS Console from unauthorized access.
 */

export const DEFAULT_AUTHORIZED_EMAILS: string[] = [
  'muantea45@gmail.com', // Primary Owner & Journal Administrator
  'ddvktp@gmail.com',    // Journal Administrator
];

export const DEFAULT_ADMIN_KEY = 'agri2026';

export const isDefaultAuthorizedEmail = (email: string): boolean => {
  const normalized = email.trim().toLowerCase();
  return DEFAULT_AUTHORIZED_EMAILS.some(
    e => e.trim().toLowerCase() === normalized
  );
};

export interface GoogleJwtPayload {
  iss?: string;
  nbf?: number;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

/**
 * Safely decodes Google Identity Services JWT credential
 */
export const parseGoogleJwtCredential = (token: string): GoogleJwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT credential', e);
    return null;
  }
};
