// src/components/MessageSystem.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender: {
    full_name: string;
    avatar_url: string;
  };
}

export default function MessageSystem({ 
  currentUserId, 
  otherUserId,
  applicationId = null 
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [canMessage, setCanMessage] = useState(false);

  useEffect(() => {
    checkMessagingPermissions();
    fetchMessages();
    subscribeToMessages();
  }, [currentUserId, otherUserId]);

  const checkMessagingPermissions = async () => {
    if (!applicationId) {
      // Vérifier si le profil est public et accepte les DMs
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_private, accept_dm')
        .eq('id', otherUserId)
        .single();

      setCanMessage(!profile?.is_private && profile?.accept_dm);
    } else {
      // Vérifier si la candidature est acceptée
      const { data: application } = await supabase
        .from('applications')
        .select('status')
        .eq('id', applicationId)
        .single();

      setCanMessage(application?.status === 'accepted');
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(full_name, avatar_url)
      `)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!canMessage || !newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: newMessage.trim(),
        application_id: applicationId,
        created_at: new Date().toISOString()
      });

    if (!error) {
      setNewMessage('');
    }
  };

  // ... reste du composant pour l'affichage des messages
}