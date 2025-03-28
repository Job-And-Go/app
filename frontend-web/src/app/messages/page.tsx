'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import MessageConversation from '@/components/MessageConversation';
import Layout from '@/components/Layout';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
  id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  last_message: {
    content: string;
    created_at: string;
  };
  unread_count: number;
  application_id?: string;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams?.get('application') ?? null;
  const otherUserId = searchParams?.get('user') ?? null;
  const { userType } = useTheme();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      // Récupérer le profil utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);
      fetchConversations(user.id);

      // Si on a un otherUserId dans l'URL, on charge cette conversation
      if (otherUserId) {
        const { data: otherUser } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherUserId)
          .single();

        if (otherUser) {
          const newConversation = {
            id: otherUser.id,
            other_user: otherUser,
            last_message: { content: '', created_at: new Date().toISOString() },
            unread_count: 0,
            application_id: applicationId || undefined
          };
          setSelectedConversation(newConversation);
        }
      }
    };

    getUser();
  }, [router, otherUserId, applicationId]);

  useEffect(() => {
    if (!currentUser) return;

    // Abonnement aux nouveaux messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}`,
      },
      () => {
        fetchConversations(currentUser.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);

  const fetchConversations = async (userId: string) => {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url),
        receiver:profiles!receiver_id(id, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      return;
    }

    // Grouper et compter les messages non lus par conversation
    const conversationsMap = messages.reduce((acc: Record<string, Conversation>, message) => {
      const otherUser = message.sender_id === userId ? message.receiver : message.sender;
      const conversationId = otherUser.id;

      if (!acc[conversationId]) {
        acc[conversationId] = {
          id: conversationId,
          other_user: otherUser,
          last_message: {
            content: message.content,
            created_at: message.created_at
          },
          unread_count: 0,
          application_id: message.application_id
        };
      }

      // Incrémenter le compteur de messages non lus
      if (message.receiver_id === userId && !message.read) {
        acc[conversationId].unread_count++;
      }

      // Mettre à jour le dernier message si plus récent
      if (new Date(message.created_at) > new Date(acc[conversationId].last_message.created_at)) {
        acc[conversationId].last_message = {
          content: message.content,
          created_at: message.created_at
        };
      }

      return acc;
    }, {});

    // Trier les conversations par date du dernier message
    const sortedConversations = Object.values(conversationsMap)
      .sort((a, b) => 
        new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
      );

    setConversations(sortedConversations);
    
    // Si aucune conversation n'est sélectionnée, sélectionner la première par défaut
    if (!selectedConversation && sortedConversations.length > 0) {
      setSelectedConversation(sortedConversations[0]);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Liste des conversations */}
        <div className="w-80 bg-white border-r border-gray-100 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-theme-light border-l-4 border-theme-primary' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={conversation.other_user.avatar_url || '/images/default-avatar.jpg'}
                      alt={conversation.other_user.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.other_user.full_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message.content || "Nouvelle conversation"}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="flex-shrink-0 inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-theme-primary rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                Aucune conversation
              </div>
            )}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 bg-gray-50">
          {selectedConversation ? (
            <MessageConversation
              currentUserId={currentUser.id}
              otherUserId={selectedConversation.other_user.id}
              applicationId={applicationId || undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="mb-2">Sélectionnez une conversation</p>
                <p className="text-sm">ou commencez une nouvelle discussion via une offre d'emploi</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}