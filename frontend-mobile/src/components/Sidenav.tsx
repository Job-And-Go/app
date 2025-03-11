import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';
import { User } from '@supabase/supabase-js';
import { NavigationProps } from '../types/navigation';

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

export default function Sidenav() {
  const navigation = useNavigation<NavigationProps>();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

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

      if (data) {
        const formattedMessages = data.map(msg => ({
          ...msg,
          sender: msg.sender[0] || { full_name: '', avatar_url: '' }
        }));
        setRecentMessages(formattedMessages);
        setUnreadMessagesCount(formattedMessages.filter(m => !m.read).length);
      }
    };

    fetchMessages();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const NotificationsModal = () => (
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
                <Text style={styles.blueText}>Tout marquer comme lu</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={styles.modalBody}>
            {notifications.length === 0 ? (
              <Text style={styles.emptyText}>Aucune notification</Text>
            ) : (
              notifications.map(notification => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationItem, !notification.read && styles.unreadItem]}
                  onPress={() => markAsRead(notification.id)}
                >
                  <Text style={styles.notificationText}>
                    {notification.message}
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(notification.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
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
  );

  const MessagesModal = () => (
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
              navigation.navigate('Messages');
            }}>
              <Text style={styles.blueText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {recentMessages.length === 0 ? (
              <Text style={styles.emptyText}>Aucun message</Text>
            ) : (
              recentMessages.map(message => (
                <TouchableOpacity
                  key={message.id}
                  style={[styles.messageItem, !message.read && styles.unreadItem]}
                  onPress={() => {
                    setShowMessages(false);
                    navigation.navigate('Chat', { otherUserId: message.sender_id });
                  }}
                >
                  <View style={styles.messageHeader}>
                    <Image
                      source={{ uri: message.sender.avatar_url || 'https://via.placeholder.com/40' }}
                      style={styles.avatar}
                    />
                    <View style={styles.messageContent}>
                      <Text style={styles.senderName}>{message.sender.full_name}</Text>
                      <Text style={styles.messageText}>{message.content}</Text>
                    </View>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(message.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
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
  );

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setIsOpen(true)}
      >
        <Icon name="menu" size={24} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.sidenav}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Menu</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {user ? (
              <>
                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => {
                    setShowNotifications(true);
                    setIsOpen(false);
                  }}
                >
                  <Icon name="notifications" size={24} color="#333" />
                  <Text style={styles.navText}>Notifications</Text>
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => {
                    setShowMessages(true);
                    setIsOpen(false);
                  }}
                >
                  <Icon name="chatbubbles" size={24} color="#333" />
                  <Text style={styles.navText}>Messages</Text>
                  {unreadMessagesCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadMessagesCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => {
                    navigation.navigate('Profile');
                    setIsOpen(false);
                  }}
                >
                  <Icon name="person" size={24} color="#333" />
                  <Text style={styles.navText}>Profil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => {
                    navigation.navigate('Settings');
                    setIsOpen(false);
                  }}
                >
                  <Icon name="settings" size={24} color="#333" />
                  <Text style={styles.navText}>Paramètres</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navItem, styles.signOutButton]}
                  onPress={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  <Icon name="log-out" size={24} color="#ff4444" />
                  <Text style={[styles.navText, styles.signOutText]}>Se déconnecter</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => {
                  navigation.navigate('Login');
                  setIsOpen(false);
                }}
              >
                <Icon name="log-in" size={24} color="#333" />
                <Text style={styles.navText}>Se connecter</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <NotificationsModal />
      <MessagesModal />
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 100,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidenav: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  navText: {
    marginLeft: 15,
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 'auto',
  },
  signOutText: {
    color: '#ff4444',
  },
  badge: {
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  blueText: {
    color: '#007AFF',
  },
  modalBody: {
    maxHeight: '70%',
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  messageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unreadItem: {
    backgroundColor: '#f0f9ff',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    color: '#666',
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
}); 