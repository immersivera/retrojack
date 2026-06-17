// GDPR / CCPA cookie consent management + Google Tag Manager (Consent Mode v2)

export interface ConsentCategories {
  necessary: boolean; // always true, cannot be disabled
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentState {
  version: number;
  categories: ConsentCategories;
  updatedAt: string;
}

const STORAGE_KEY = 'cookie_consent';
const CONSENT_VERSION = 1;

const GTM_ID = (import.meta.env.VITE_GTM_ID as string | undefined) || '';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const DEFAULT_CATEGORIES: ConsentCategories = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // GTM's gtag uses `arguments`, so we must push the arguments object shape.
  window.dataLayer.push(args);
}

export function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasStoredConsent(): boolean {
  return getStoredConsent() !== null;
}

function persistConsent(categories: ConsentCategories): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    categories: { ...categories, necessary: true },
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable - consent still applies for the session */
  }
  return state;
}

/** Push the granular consent state to Google Consent Mode. */
function updateConsentMode(categories: ConsentCategories) {
  const grant = (v: boolean) => (v ? 'granted' : 'denied');
  gtag('consent', 'update', {
    ad_storage: grant(categories.marketing),
    ad_user_data: grant(categories.marketing),
    ad_personalization: grant(categories.marketing),
    analytics_storage: grant(categories.analytics),
    functionality_storage: grant(categories.preferences),
    personalization_storage: grant(categories.preferences),
    security_storage: 'granted',
  });
  // Surface a custom event so GTM triggers can react to consent changes.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'consent_update', consent: categories });
}

let gtmLoaded = false;

/** Inject the GTM container script once. Only call after consent defaults are set. */
export function loadGTM() {
  if (gtmLoaded || !GTM_ID) return;
  gtmLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);

  // <noscript> fallback iframe for users without JS.
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.appendChild(noscript);
}

/** Apply a consent decision: persist, update Consent Mode, and load GTM. */
export function applyConsent(categories: ConsentCategories): ConsentState {
  const state = persistConsent(categories);
  updateConsentMode(state.categories);
  loadGTM();
  return state;
}

export function acceptAll(): ConsentState {
  return applyConsent({
    necessary: true,
    preferences: true,
    analytics: true,
    marketing: true,
  });
}

export function rejectAll(): ConsentState {
  return applyConsent({ ...DEFAULT_CATEGORIES });
}

/**
 * Re-apply any previously stored consent on app startup so Consent Mode and GTM
 * reflect the returning visitor's choice. Returns true if a decision exists.
 */
export function initConsent(): boolean {
  const stored = getStoredConsent();
  if (stored) {
    updateConsentMode(stored.categories);
    loadGTM();
    return true;
  }
  return false;
}

export const isGtmConfigured = Boolean(GTM_ID);
