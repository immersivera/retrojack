import React from 'react';
import { FileText, ShieldCheck, ScrollText } from 'lucide-react';

type LegalPageType = 'cookie' | 'privacy' | 'terms';

interface LegalPageProps {
  type: LegalPageType;
  onManageCookies?: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-yellow-400 mb-2">{title}</h3>
    <div className="text-gray-200 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const pageMeta = {
  cookie: {
    title: 'Cookie Policy',
    icon: ShieldCheck,
  },
  privacy: {
    title: 'Privacy Policy',
    icon: FileText,
  },
  terms: {
    title: 'Terms of Service',
    icon: ScrollText,
  },
};

const LegalPage: React.FC<LegalPageProps> = ({ type, onManageCookies }) => {
  const { title, icon: Icon } = pageMeta[type];
  const lastUpdated = 'June 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4 pt-20">
      <div className="max-w-3xl mx-auto bg-green-900 rounded-xl p-6 border-2 border-yellow-400">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <Icon className="w-8 h-8" />
            {title}
          </h2>
          <p className="text-gray-400 text-xs mt-3">Last updated: {lastUpdated}</p>
        </div>

        {type === 'cookie' && (
          <>
            <Section title="1. Overview">
              <p>
                This policy explains how Retro Blackjack uses cookies and similar technologies. We only
                set non-essential cookies after you give consent.
              </p>
            </Section>
            <Section title="2. What are cookies?">
              <p>
                Cookies are small text files stored on your device. Similar technologies include
                localStorage and pixels. We use them to keep the game working and, only with your
                permission, measure usage and support marketing.
              </p>
            </Section>
            <Section title="3. Categories of cookies we use">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="font-semibold text-white">Strictly necessary</span> — required for
                  the site to function, including storing your consent choice, player names, and local
                  leaderboard data. Always active.
                </li>
                <li>
                  <span className="font-semibold text-white">Analytics</span> — help us understand how
                  the game is used via aggregated statistics. Set only with consent.
                </li>
                <li>
                  <span className="font-semibold text-white">Marketing</span> — used to deliver and
                  measure relevant ads. Set only with consent.
                </li>
              </ul>
            </Section>
            <Section title="4. Managing your choices">
              <p>You can update your cookie choices at any time from the menu.</p>
              {onManageCookies && (
                <button
                  onClick={onManageCookies}
                  className="mt-2 px-5 py-3 bg-green-700 text-white font-bold rounded-lg border border-green-500 hover:bg-green-600 transition-all duration-200"
                >
                  Manage cookie preferences
                </button>
              )}
            </Section>
          </>
        )}

        {type === 'privacy' && (
          <>
            <Section title="1. Information we store">
              <p>
                Retro Blackjack stores local game information such as player names and leaderboard
                results in your browser so the game can function and remember scores locally.
              </p>
            </Section>
            <Section title="2. Analytics and marketing">
              <p>
                Analytics and marketing technologies are optional and are controlled by your cookie
                choices. Non-essential storage is denied unless you grant consent.
              </p>
            </Section>
            <Section title="3. Your rights">
              <p>
                Depending on your location, you may have rights to access, correct, delete, or object to
                processing of personal information. You can clear locally stored game data through your
                browser settings.
              </p>
            </Section>
            <Section title="4. Contact">
              <p>
                For privacy requests, contact us at support@retrojack.net.
              </p>
            </Section>
          </>
        )}

        {type === 'terms' && (
          <>
            <Section title="1. Use of the game">
              <p>
                Retro Blackjack is provided for entertainment purposes. You agree to use the game lawfully
                and not interfere with its operation.
              </p>
            </Section>
            <Section title="2. No real-money gambling">
              <p>
                The game does not provide real-money gambling, prizes, payouts, or wagering functionality.
              </p>
            </Section>
            <Section title="3. Local data">
              <p>
                Leaderboard and player-name data is stored locally in your browser. Clearing browser data
                may remove saved game records.
              </p>
            </Section>
            <Section title="4. Availability">
              <p>
                The game is provided as-is without warranties. Features may change or become unavailable.
              </p>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default LegalPage;
