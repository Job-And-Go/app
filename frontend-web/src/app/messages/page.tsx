'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import MessageConversation from '@/components/MessageConversation';
import Navbar from '@/components/Navbar';

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

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('application');
  const otherUserId = searchParams.get('user');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
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

  return (
    <>
      <Navbar 
        user={currentUser}
        userProfile={currentUser}
        handleSignOut={async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }}
      />
      <div className="flex h-[calc(100vh-64px)] bg-white">
        {/* Liste des conversations */}
        <div className="w-1/3 border-r overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b hover:bg-[#f0fff2] cursor-pointer ${
                selectedConversation?.id === conversation.id ? 'bg-[#e6ffe9]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={conversation.other_user.avatar_url || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-black">{conversation.other_user.full_name}</h3>
                  <p className="text-sm text-black truncate">
                    {conversation.last_message.content}
                  </p>
                </div>
                {conversation.unread_count > 0 && (
                  <span className="bg-[#3bee5e] text-white px-2 py-1 rounded-full text-xs">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Zone de conversation active */}
        <div className="w-2/3 bg-white">
          {selectedConversation ? (
            <MessageConversation
              currentUserId={currentUser?.id}
              otherUserId={selectedConversation.other_user.id}
              applicationId={selectedConversation.application_id}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-black">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </>
  );
}