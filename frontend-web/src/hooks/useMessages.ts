import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  application_id?: string;
  sender: {
    full_name: string;
    avatar_url: string;
  };
}

export function useMessages(userId: string, otherId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetchMessages();
    subscribeToMessages();
  }, [userId, otherId]);

  const fetchMessages = async () => {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (otherId) {
      query = query.or(`sender_id.eq.${otherId},receiver_id.eq.${otherId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors du chargement des messages:', error);
      return;
    }

    setMessages(data || []);
    setLoading(false);
  };

  const sendMessage = async (content: string, receiverId: string, applicationId?: string) => {
    // Vérifier si l'envoi est autorisé
    const canSend = await checkMessagePermission(receiverId, applicationId);
    if (!canSend) {
      throw new Error("Vous ne pouvez pas envoyer de message à cet utilisateur");
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        content,
        application_id: applicationId,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    await fetchMessages();
  };

  const checkMessagePermission = async (receiverId: string, applicationId?: string) => {
    if (applicationId) {
      const { data: application } = await supabase
        .from('applications')
        .select('status')
        .eq('id', applicationId)
        .single();

      return application?.status === 'accepted';
    }

    const { data: receiverProfile } = await supabase
      .from('profiles')
      .select('is_private, accept_dm')
      .eq('id', receiverId)
      .single();

    return !receiverProfile?.is_private || receiverProfile?.accept_dm;
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      }, 
      () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    messages,
    loading,
    sendMessage,
    refreshMessages: fetchMessages
  };
} 