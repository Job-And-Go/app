import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import MessageConversation from '../components/MessageConversation';
import { NavigationProps, RootStackParamList, RouteParams } from '../types/navigation';

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

export default function MessagesScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const applicationId = route.params?.applicationId;
  const otherUserId = route.params?.userId;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.navigate('Login');
        return;
      }
      setCurrentUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);
      fetchConversations(user.id);

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
  }, [otherUserId, applicationId]);

  useEffect(() => {
    if (!currentUser) return;

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

      if (message.receiver_id === userId && !message.read) {
        acc[conversationId].unread_count++;
      }

      if (new Date(message.created_at) > new Date(acc[conversationId].last_message.created_at)) {
        acc[conversationId].last_message = {
          content: message.content,
          created_at: message.created_at
        };
      }

      return acc;
    }, {});

    const sortedConversations = Object.values(conversationsMap)
      .sort((a, b) => 
        new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
      );

    setConversations(sortedConversations);
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        selectedConversation?.id === item.id && styles.selectedConversation
      ]}
      onPress={() => navigation.navigate('Chat', {
        otherUserId: item.other_user.id,
        applicationId: item.application_id
      })}
    >
      <View style={styles.conversationContent}>
        <Image
          source={{ uri: item.other_user.avatar_url || 'https://default-avatar-url.com' }}
          style={styles.avatar}
        />
        <View style={styles.messageInfo}>
          <Text style={styles.userName}>{item.other_user.full_name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message.content}
          </Text>
        </View>
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unread_count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  selectedConversation: {
    backgroundColor: '#e6ffe9',
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  messageInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: '#3bee5e',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 