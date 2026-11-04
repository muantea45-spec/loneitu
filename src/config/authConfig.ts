/**
 * Loneitu (MIZORAM TAN) — Administrator Whitelist Configuration
 * Only the specific email addresses listed here (or added via the Admin Console)
 * are authorized to log in to the Editorial CMS Console.
 */
export const DEFAULT_AUTHORIZED_EMAILS: string[] = [
  'muantea45@gmail.com', // Primary Owner & Journal Administrator
];

export const isDefaultAuthorizedEmail = (email: string): boolean => {
  const normalized = email.trim().toLowerCase();
  return DEFAULT_AUTHORIZED_EMAILS.some(
    e => e.trim().toLowerCase() === normalized
  );
};
