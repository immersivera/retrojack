import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface CookiePolicyProps {
  onClose: () => void;
  onManagePreferences: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-lg font-bold text-yellow-400 mb-1">{title}</h3>
    <div className="text-gray-200 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const CookiePolicy: React.FC<CookiePolicyProps> = ({ onClose, onManagePreferences }) => {
  const lastUpdated = 'June 2026';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-green-900 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto border-2 border-yellow-400">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8" />
            Privacy &amp; Cookie Policy
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white hover:text-yellow-400 transition-colors duration-200"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <p className="text-gray-400 text-xs mb-6">Last updated: {lastUpdated}</p>

        <Section title="1. Overview">
          <p>
            This policy explains how Retro Blackjack ("we", "us") uses cookies and similar
            technologies, and describes the rights you have under the EU General Data Protection
            Regulation (GDPR) and the California Consumer Privacy Act (CCPA/CPRA). We only set
            non-essential cookies after you give consent.
          </p>
        </Section>

        <Section title="2. What are cookies?">
          <p>
            Cookies are small text files stored on your device. Similar technologies include
            <span> </span>localStorage and pixels. We use them to keep the game working and—only with
            your permission—measure usage and support marketing.
          </p>
        </Section>

        <Section title="3. Categories of cookies we use">
          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="font-semibold text-white">Strictly necessary</span> — required for the
              site to function (e.g. storing your consent choice, player names, and local leaderboard
              data). Always active.
            </li>
            <li>
              <span className="font-semibold text-white">Analytics</span> — help us understand how the
              game is used via aggregated statistics (e.g. Google Analytics through Google Tag
              Manager). Set only with consent.
            </li>
            <li>
              <span className="font-semibold text-white">Marketing</span> — used to deliver and
              measure relevant ads. Set only with consent.
            </li>
          </ul>
        </Section>

        <Section title="4. Google Consent Mode &amp; Tag Manager">
          <p>
            We use Google Tag Manager with Google Consent Mode v2. Before you make a choice, all
            non-essential storage (analytics and advertising) defaults to <em>denied</em>. Tags only
            adjust their behavior once you grant consent. You can change or withdraw your consent at
            any time.
          </p>
        </Section>

        <Section title="5. Your rights (GDPR)">
          <p>
            If you are in the EEA/UK, you have the right to access, rectify, erase, restrict, and port
            your data, and to object to processing. Consent for non-essential cookies is opt-in and
            can be withdrawn at any time without affecting prior lawful processing.
          </p>
        </Section>

        <Section title="6. Your rights (CCPA/CPRA)">
          <p>
            If you are a California resident, you have the right to know what personal information is
            collected, to delete it, to correct it, and to opt out of the "sale" or "sharing" of
            personal information. Rejecting analytics and marketing cookies here serves as your opt-out
            of sharing for cross-context behavioral advertising.
          </p>
        </Section>

        <Section title="7. Managing your choices">
          <p>
            You can update your cookie choices any time using the button below or the "Cookie settings"
            link. You can also clear cookies in your browser settings.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            For privacy requests, contact us at{' '}
            <a href="mailto:privacy@example.com" className="text-yellow-400 underline">
              privacy@example.com
            </a>
            .
          </p>
        </Section>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onManagePreferences}
            className="px-5 py-3 bg-green-700 text-white font-bold rounded-lg border border-green-500 hover:bg-green-600 transition-all duration-200"
          >
            Manage cookie preferences
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-green-400 hover:to-green-500 transform hover:scale-105 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
