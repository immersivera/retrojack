import React, { useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { ConsentCategories } from '../utils/consent';

interface CookiePreferencesProps {
  initial: ConsentCategories;
  onSave: (categories: ConsentCategories) => void;
  onAcceptAll: () => void;
  onClose: () => void;
}

interface CategoryMeta {
  key: keyof ConsentCategories;
  title: string;
  description: string;
  locked?: boolean;
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: 'necessary',
    title: 'Strictly necessary',
    description:
      'Required for the site to function, including remembering your consent choice and local leaderboard data. Always on.',
    locked: true,
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Help us understand usage through aggregated, privacy-friendly statistics.',
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description: 'Used to deliver and measure the relevance of advertising.',
  },
];

const Toggle: React.FC<{ checked: boolean; disabled?: boolean; onChange: () => void }> = ({
  checked,
  disabled,
  onChange,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
      checked ? 'bg-green-500' : 'bg-gray-600'
    } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const CookiePreferences: React.FC<CookiePreferencesProps> = ({
  initial,
  onSave,
  onAcceptAll,
  onClose,
}) => {
  const [categories, setCategories] = useState<ConsentCategories>({ ...initial });

  const toggle = (key: keyof ConsentCategories) => {
    if (key === 'necessary') return;
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[70]">
      <div className="bg-green-900 rounded-xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto border-2 border-yellow-400">
        <div className="flex justify-between items-start mb-5">
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            <Cookie className="w-7 h-7" />
            Cookie preferences
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white hover:text-yellow-400 transition-colors duration-200"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <p className="text-gray-200 text-sm mb-5">
          We use cookies to run the game and, with your permission, to improve it. Choose which
          optional categories you allow. You can change this any time.
        </p>

        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="flex items-start justify-between gap-4 bg-green-800 border border-green-600 rounded-lg p-4"
            >
              <div>
                <h3 className="font-bold text-white">{cat.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{cat.description}</p>
              </div>
              <Toggle
                checked={categories[cat.key]}
                disabled={cat.locked}
                onChange={() => toggle(cat.key)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onSave(categories)}
            className="flex-1 px-4 py-3 bg-green-700 text-white font-bold rounded-lg border border-green-500 hover:bg-green-600 transition-all duration-200"
          >
            Save choices
          </button>
          <button
            onClick={onAcceptAll}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-green-900 font-bold rounded-lg shadow-lg hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferences;
