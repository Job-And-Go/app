'use client';

import { useTheme } from './ThemeProvider';
import Link from 'next/link';

export default function Footer() {
  const { userType } = useTheme();

  return (
    <footer className="bg-white text-gray-900 mt-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-sm font-semibold mb-4 text-theme-primary">À propos</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Qui sommes-nous</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-theme-primary">Ressources</h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Blog</Link></li>
              <li><Link href={userType === 'professionnel' ? "/guide-recrutement" : "/guide-stages"} className="text-gray-600 hover:text-theme-hover text-sm transition-colors">
                {userType === 'professionnel' ? "Guide recrutement" : "Guide stages"}
              </Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-theme-primary">Légal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Confidentialité</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">CGU</Link></li>
              <li><Link href="/cookies" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Politique de cookies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-theme-primary">Suivez-nous</h4>
            <ul className="space-y-2">
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">LinkedIn</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-theme-hover text-sm transition-colors">Twitter</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
} 