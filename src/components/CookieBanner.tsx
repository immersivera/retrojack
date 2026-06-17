import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import {
  ConsentCategories,
  DEFAULT_CATEGORIES,
  acceptAll,
  applyConsent,
  getStoredConsent,
  hasStoredConsent,
  initConsent,
} from '../utils/consent';
import CookiePreferences from './CookiePreferences';
import CookiePolicy from './CookiePolicy';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    // Re-apply stored consent (Consent Mode + GTM) and decide whether to show the banner.
    const hasDecision = initConsent();
    setShowBanner(!hasDecision);
  }, []);

  // Allow other UI (e.g. footer link) to open settings via a global event.
  useEffect(() => {
    const open = () => setShowPreferences(true);
    window.addEventListener('open-cookie-settings', open);
    return () => window.removeEventListener('open-cookie-settings', open);
  }, []);

  const currentCategories: ConsentCategories =
    getStoredConsent()?.categories ?? { ...DEFAULT_CATEGORIES };

  const handleAcceptAll = () => {
    acceptAll();
    setShowPreferences(false);
    setShowBanner(false);
  };


  const handleSave = (categories: ConsentCategories) => {
    applyConsent(categories);
    setShowPreferences(false);
    setShowBanner(false);
  };

  return (
    <>
      {showBanner && !showPreferences && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-slideInUp">
          <div className="max-w-4xl mx-auto bg-green-900 border-2 border-yellow-400 rounded-xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <Cookie className="w-7 h-7 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-yellow-400 mb-1">We value your privacy</h2>
                <p className="text-gray-200 text-sm leading-relaxed">
                  We use cookies to keep the game running and, with your consent, to analyze usage
                  and personalize content. You can accept all or choose your preferences. Read our{' '}
                  <button
                    onClick={() => setShowPolicy(true)}
                    className="text-yellow-400 underline hover:text-yellow-300"
                  >
                    Cookie &amp; Privacy Policy
                  </button>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-5 py-3 bg-green-700 text-white font-bold rounded-lg border border-green-500 hover:bg-green-600 transition-all duration-200"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-bold rounded-lg shadow-lg hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent settings button once a choice has been made */}
      {!showBanner && !showPreferences && (
        <button
          onClick={() => setShowPreferences(true)}
          aria-label="Cookie settings"
          className="fixed bottom-4 left-4 z-40 bg-green-900 border-2 border-yellow-400 text-yellow-400 rounded-full p-3 shadow-lg hover:bg-green-800 transition-all duration-200"
        >
          <Cookie className="w-5 h-5" />
        </button>
      )}

      {showPreferences && (
        <CookiePreferences
          initial={currentCategories}
          onSave={handleSave}
          onAcceptAll={handleAcceptAll}
          onClose={() => {
            setShowPreferences(false);
            // If no decision exists yet, keep the banner visible.
            setShowBanner(!hasStoredConsent());
          }}
        />
      )}

      {showPolicy && (
        <CookiePolicy
          onClose={() => setShowPolicy(false)}
          onManagePreferences={() => {
            setShowPolicy(false);
            setShowPreferences(true);
          }}
        />
      )}
    </>
  );
};

export default CookieBanner;
