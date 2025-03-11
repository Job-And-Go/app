import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';
import Icon from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Messages: { userId?: string };
  Login: undefined;
};

interface NavbarProps {
  user: any;
  userProfile: any;
  handleSignOut: () => Promise<void>;
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

export default function Navbar({ user, userProfile, handleSignOut }: NavbarProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(user?.id);

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
      }
    };

    fetchMessages();
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Image 
          source={require('@/assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {user && (
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowNotifications(true)}
          >
            <Icon name="notifications-outline" size={24} color="#4B5563" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowMessages(true)}
          >
            <Icon name="chatbubbles-outline" size={24} color="#4B5563" />
            {unreadMessagesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadMessagesCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image
              source={
                userProfile?.avatar_url
                  ? { uri: userProfile.avatar_url }
                  : require('@/assets/default-avatar.png')
              }
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.markAllRead}>Tout marquer comme lu</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.modalScroll}>
              {notifications.length === 0 ? (
                <Text style={styles.emptyText}>Aucune notification</Text>
              ) : (
                notifications.map(notification => (
                  <Pressable
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadItem
                    ]}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <Text style={styles.notificationText}>
                      {notification.message}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(notification.created_at).toLocaleDateString()}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNotifications(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMessages}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessages(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Messages</Text>
              <TouchableOpacity onPress={() => {
                setShowMessages(false);
                navigation.navigate('Messages', { userId: undefined });
              }}>
                <Text style={styles.viewAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {recentMessages.length === 0 ? (
                <Text style={styles.emptyText}>Aucun message</Text>
              ) : (
                recentMessages.map(message => (
                  <Pressable
                    key={message.id}
                    style={[
                      styles.messageItem,
                      !message.read && styles.unreadItem
                    ]}
                    onPress={() => {
                      setShowMessages(false);
                      navigation.navigate('Messages', { userId: message.sender_id });
                    }}
                  >
                    <View style={styles.messageHeader}>
                      <Image
                        source={
                          message.sender.avatar_url
                            ? { uri: message.sender.avatar_url }
                            : require('@/assets/default-avatar.png')
                        }
                        style={styles.messageAvatar}
                      />
                      <View style={styles.messageContent}>
                        <Text style={styles.senderName}>{message.sender.full_name}</Text>
                        <Text style={styles.messageText} numberOfLines={1}>
                          {message.content}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(message.created_at).toLocaleDateString()}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMessages(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    width: 120,
    height: 40,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  markAllRead: {
    color: '#2563EB',
    fontSize: 14,
  },
  viewAll: {
    color: '#2563EB',
    fontSize: 14,
  },
  modalScroll: {
    maxHeight: '70%',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  messageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  unreadItem: {
    backgroundColor: '#EBF5FF',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#4B5563',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    color: '#6B7280',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
}); 