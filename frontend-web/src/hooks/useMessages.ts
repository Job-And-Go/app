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

  const validateMessage = (content: string): { isValid: boolean; error?: string } => {
    // Regex pour détecter les emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    
    // Regex pour détecter les numéros de téléphone (formats internationaux)
    const phoneRegex = /(?:\+\d{1,3}[-. ]?)?\d{2,}[-. ]?\d{2,}[-. ]?\d{2,}[-. ]?\d{2,}/;
    
    // Regex pour détecter les liens
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/;

    if (emailRegex.test(content)) {
      return { isValid: false, error: "Les adresses email ne sont pas autorisées dans les messages." };
    }

    if (phoneRegex.test(content)) {
      return { isValid: false, error: "Les numéros de téléphone ne sont pas autorisés dans les messages." };
    }

    if (urlRegex.test(content)) {
      return { isValid: false, error: "Les liens ne sont pas autorisés dans les messages." };
    }

    return { isValid: true };
  };

  const sendMessage = async (content: string, receiverId: string, applicationId?: string) => {
    // Valider le contenu du message
    const validation = validateMessage(content);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

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
    console.log('Checking message permission:', { receiverId, applicationId });

    // Si on a un applicationId, on vérifie d'abord la candidature
    if (applicationId) {
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('status')
        .eq('id', applicationId)
        .single();

      console.log('Application check:', { application, error: appError });

      if (appError) {
        console.error('Error checking application:', appError);
        return false;
      }

      if (application?.status === 'accepted') {
        return true;
      }
    }

    // Vérifier le profil du destinataire
    const { data: receiverProfile, error: profileError } = await supabase
      .from('profiles')
      .select('type, is_private, accept_dm')
      .eq('id', receiverId)
      .single();

    console.log('Profile check:', { receiverProfile, error: profileError });

    if (profileError) {
      console.error('Error checking profile:', profileError);
      return false;
    }

    if (!receiverProfile) {
      console.log('No receiver profile found');
      return false;
    }

    // Si c'est un étudiant, il peut toujours recevoir des messages
    if (receiverProfile.type === 'student') {
      console.log('Receiver is a student, allowing message');
      return true;
    }

    // Pour les autres types d'utilisateurs, on vérifie les paramètres de confidentialité
    const canMessage = !receiverProfile.is_private || receiverProfile.accept_dm;
    console.log('Final permission check:', { canMessage, profile: receiverProfile });
    
    return canMessage;
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