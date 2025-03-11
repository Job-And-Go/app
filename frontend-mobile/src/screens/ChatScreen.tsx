import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import MessageConversation from '../components/MessageConversation';
import { RootStackParamList } from '../types/navigation';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const { otherUserId, applicationId } = route.params;
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    };

    getUser();
  }, []);

  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MessageConversation
        currentUserId={currentUser}
        otherUserId={otherUserId}
        applicationId={applicationId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 