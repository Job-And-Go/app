'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  performance: boolean;
  functional: boolean;
  targeting: boolean;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    performance: false,
    functional: false,
    targeting: false,
  });

  useEffect(() => {
    const hasPreferences = localStorage.getItem('cookiePreferences');
    if (!hasPreferences) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      performance: true,
      functional: true,
      targeting: true,
    });
    savePreferences({
      essential: true,
      performance: true,
      functional: true,
      targeting: true,
    });
    setShowBanner(false);
  };

  const handleAcceptFunctional = () => {
    setPreferences({
      essential: true,
      performance: false,
      functional: true,
      targeting: false,
    });
    savePreferences({
      essential: true,
      performance: false,
      functional: true,
      targeting: false,
    });
    setShowBanner(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const Switch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-500' : 'bg-gray-200'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );

  if (!showBanner) return null;

  if (showPreferences) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 max-w-2xl rounded-lg bg-white p-6 shadow-lg">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Préférences des cookies</h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Cookies essentiels</h3>
                  <p className="text-sm text-gray-600">Nécessaires au fonctionnement du site</p>
                </div>
                <Switch checked={preferences.essential} onChange={() => {}} disabled={true} />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Cookies de performance</h3>
                  <p className="text-sm text-gray-600">Nous aident à améliorer le site</p>
                </div>
                <Switch
                  checked={preferences.performance}
                  onChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, performance: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Cookies fonctionnels</h3>
                  <p className="text-sm text-gray-600">Pour des fonctionnalités améliorées</p>
                </div>
                <Switch
                  checked={preferences.functional}
                  onChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, functional: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Cookies de ciblage</h3>
                  <p className="text-sm text-gray-600">Pour la personnalisation et la publicité</p>
                </div>
                <Switch
                  checked={preferences.targeting}
                  onChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, targeting: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPreferences(false)}
                className="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePreferences}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Enregistrer les préférences
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 text-sm text-gray-600">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site.{' '}
              <Link href="/cookies" className="text-blue-500 hover:underline">
                En savoir plus
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 sm:flex-none"
              >
                Tout accepter
              </button>
              <button
                onClick={handleAcceptFunctional}
                className="flex-1 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 sm:flex-none"
              >
                Accepter l'essentiel
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:flex-none"
              >
                Personnaliser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 