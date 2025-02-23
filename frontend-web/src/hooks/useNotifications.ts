import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface NotificationData {
  id: string;
  user_id: string;
  type: 'job_created' | 'application_received' | 'application_status_changed' | 'job_viewed';
  job_id?: string;
  application_id?: string;
  message: string;
  read: boolean;
  created_at: string;
  job?: {
    title: string;
  };
  application?: {
    id: string;
    status: string;
    job?: {
      title: string;
    };
  };
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Charger les notifications initiales
    fetchNotifications();

    // Configurer la souscription en temps réel
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, 
      payload => {
        const newNotification = payload.new as NotificationData;
        setNotifications(prev => [newNotification, ...prev]);
        if (!newNotification.read) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        job:jobs!notifications_job_id_fkey(title),
        application:applications!notifications_application_id_fkey(
          id,
          status,
          job:jobs(title)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      return;
    }

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return;
    }

    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Erreur lors du marquage des notifications:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
} 