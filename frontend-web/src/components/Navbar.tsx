'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNotifications } from '@/hooks/useNotifications';

interface Job {
  title: string;
}

interface Application {
  id: string;
  status: string;
  job?: Job;
}

interface Notification {
  id: string;
  user_id: string;
  type: 'job_created' | 'application_received' | 'application_status_changed' | 'job_viewed';
  job_id?: string;
  application_id?: string;
  message: string;
  read: boolean;
  created_at: string;
  job?: Job;
  application?: Application;
}

interface NavbarProps {
  user: any;
  userProfile: any;
  handleSignOut: () => Promise<void>;
}

export default function Navbar({ user, userProfile, handleSignOut }: NavbarProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(user?.id);

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
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 text-center">Aucune notification</p>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <p className="text-sm text-gray-800">
                              {notification.type === 'job_created' && `Nouvelle offre : ${notification.job?.title}`}
                              {notification.type === 'application_received' && `Nouvelle candidature pour ${notification.job?.title}`}
                              {notification.type === 'application_status_changed' && 
                                `Statut de candidature mis à jour : ${notification.application?.job?.title} - ${notification.application?.status}`
                              }
                              {notification.type === 'job_viewed' && `Votre offre ${notification.job?.title} a été vue`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => user.email ? setShowProfileMenu(!showProfileMenu) : router.push('/login')}
                  className="bg-[#3bee5e] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#32d951] transition-colors flex items-center gap-2"
                >
                  {userProfile?.avatar_url && (
                    <img
                      src={userProfile.avatar_url}
                      alt="Photo de profil"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
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
                    {userProfile?.type === 'student' && (
                      <>
                        <a
                          href="/favorites"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Mes Favoris
                        </a>
                      </>
                    )}
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