'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  user: any;
  userProfile: any;
  handleSignOut: () => Promise<void>;
}

export default function Navbar({ user, userProfile, handleSignOut }: NavbarProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="cursor-pointer">
              <Image 
                src="/logo.svg"
                alt="StuJob Logo"
                width={120}
                height={40}
                priority
              />
            </a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => user.email ? setShowProfileMenu(!showProfileMenu) : router.push('/login')}
                  className="bg-[#3bee5e] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#32d951] transition-colors"
                >
                  {user.email ? (userProfile?.full_name || user.email.split('@')[0]) : 'Invité'}
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <a
                      href={user.email ? "/profile" : "/login"}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mon Profil
                    </a>
                    <a
                      href={user.email ? "/settings" : "/login"}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Paramètres
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a 
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Se connecter
                </a>
                <a
                  href="/login" 
                  className="bg-[#3bee5e] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#32d951] transition-colors"
                >
                  S'inscrire
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 