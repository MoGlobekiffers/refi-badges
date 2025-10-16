// lib/safeOrigin.ts
export function getAppOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    // côté navigateur
    return window.location.origin;
  }
  // côté serveur (fallback)
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

