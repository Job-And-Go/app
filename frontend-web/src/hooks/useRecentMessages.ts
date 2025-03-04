import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRecentMessages(userId: string | undefined) {
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchRecentMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name, avatar_url)
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Erreur lors du chargement des messages:', error);
        return;
      }

      if (data) {
        setRecentMessages(data);
        setUnreadCount(data.filter(m => !m.read).length);
      }
    };

    fetchRecentMessages();

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      }, 
      () => {
        fetchRecentMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return {
    recentMessages,
    unreadCount,
  };
} 