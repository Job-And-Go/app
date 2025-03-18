import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

interface MessageValidationErrorProps {
  error: string | null;
  onClose: () => void;
}

export default function MessageValidationError({ error, onClose }: MessageValidationErrorProps) {
  const translateY = new Animated.Value(100);

  useEffect(() => {
    if (error) {
      // Animation d'entrée
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      // Disparition automatique après 5 secondes
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!error) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.content}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#DC2626',
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 