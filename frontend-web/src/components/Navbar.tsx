'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNotifications } from '@/hooks/useNotifications';
import { formatName } from '@/utils/nameFormatter';

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

interface Message {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_id: string;
  sender: {
    full_name: string;
    avatar_url: string;
  };
}

interface NavbarProps {
  user: any;
  userProfile: any;
  handleSignOut: () => Promise<void>;
}

interface NotificationsMenuProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

interface MessagesMenuProps {
  recentMessages: Message[];
  unreadMessagesCount: number;
  router: any; // On garde any ici car le type exact dépend de Next.js
}

interface ProfileMenuProps {
  userProfile: {
    type?: string;
    [key: string]: any;
  };
  handleSignOut: () => Promise<void>;
}

const Logo = () => (
  <div className="flex items-center">
    <a href="/" className="cursor-pointer">
      <Image 
        src="/images/logo.PNG"
        alt="StuJob Logo"
        width={120}
        height={40}
        priority
      />
    </a>
  </div>
);

const NotificationsMenu = ({ notifications, unreadCount, markAsRead, markAllAsRead }: NotificationsMenuProps) => (
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
);

const MessagesMenu = ({ recentMessages, unreadMessagesCount, router }: MessagesMenuProps) => (
  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-lg font-semibold">Messages</h3>
      <button
        onClick={() => router.push('/messages')}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Voir tout
      </button>
    </div>
    <div className="max-h-96 overflow-y-auto">
      {recentMessages.length === 0 ? (
        <p className="p-4 text-gray-500 text-center">Aucun message</p>
      ) : (
        recentMessages.map(message => (
          <div
            key={message.id}
            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
              !message.read ? 'bg-blue-50' : ''
            }`}
            onClick={() => router.push(`/messages?user=${message.sender_id}`)}
          >
            <div className="flex items-center gap-3">
              <img
                src={message.sender.avatar_url || '/default-avatar.png'}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium text-sm">{message.sender.full_name}</p>
                <p className="text-sm text-gray-600 truncate">{message.content}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(message.created_at).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  </div>
);

const ProfileMenu = ({ userProfile, handleSignOut }: ProfileMenuProps) => (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
      Mon Profil
    </a>
    
    {userProfile?.type === 'student' && (
      <>
        <a href="/jobs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Offres disponibles
        </a>
        <a href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Mes Favoris
        </a>
      </>
    )}
    
    {(userProfile?.type === 'particulier' || userProfile?.type === 'professionel') && (
      <>
        <a href="/jobs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Mes Offres
        </a>
        <a href="/jobs/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Créer une offre
        </a>
      </>
    )}
    
    {(userProfile?.type === 'etablissement' || userProfile?.type === 'professionel') && (
      <a href="/integration" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        Système d'Intégration
      </a>
    )}
    
    <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
      Paramètres
    </a>
    
    <button
      onClick={handleSignOut}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      Se déconnecter
    </button>
  </div>
);

const MainNav = () => (
  <div className="hidden md:flex items-center space-x-4">
    <a href="/blog" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
      Blog
    </a>
    <a href="/about" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
      À propos
    </a>
    <a href="/partners" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
      Partenaires
    </a>
  </div>
);

export default function Navbar({ user, userProfile, handleSignOut }: NavbarProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          sender_id,
          sender:profiles!sender_id (
            full_name,
            avatar_url
          )
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        const formattedMessages = data.map(message => ({
          id: message.id,
          content: message.content,
          created_at: message.created_at,
          read: message.read,
          sender_id: message.sender_id,
          sender: {
            full_name: message.sender[0]?.full_name || '',
            avatar_url: message.sender[0]?.avatar_url || ''
          }
        }));
        setRecentMessages(formattedMessages);
        setUnreadMessagesCount(formattedMessages.filter(m => !m.read).length);
      } else {
        setRecentMessages([]);
        setUnreadMessagesCount(0);
      }
    };

    fetchMessages();
  }, [user?.id]);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Logo />
            <MainNav />
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
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
                    <NotificationsMenu 
                      notifications={notifications}
                      unreadCount={unreadCount}
                      markAsRead={markAsRead}
                      markAllAsRead={markAllAsRead}
                    />
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowMessages(!showMessages)}
                    className="relative p-2 text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
                    </svg>
                    {unreadMessagesCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </button>
                  {showMessages && (
                    <MessagesMenu 
                      recentMessages={recentMessages}
                      unreadMessagesCount={unreadMessagesCount}
                      router={router}
                    />
                  )}
                </div>
              </>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => user.email ? setShowProfileMenu(!showProfileMenu) : router.push('/login')}
                  className="bg-theme-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-theme-hover transition-colors flex items-center gap-2"
                >
                  {userProfile?.avatar_url && (
                    <img
                      src={userProfile.avatar_url}
                      alt="Photo de profil"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  {user.email ? (
                    userProfile?.first_name && userProfile?.last_name 
                      ? formatName(userProfile.first_name, userProfile.last_name)
                      : user.email.split('@')[0]
                  ) : 'Invité'}
                </button>
                
                {showProfileMenu && (
                  <ProfileMenu userProfile={userProfile} handleSignOut={handleSignOut} />
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
                  className="bg-theme-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-theme-hover transition-colors"
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