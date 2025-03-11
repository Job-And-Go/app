import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProps>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue sur</Text>
        <Text style={styles.titleAccent}>StuJob</Text>
        <Text style={styles.subtitle}>
          Trouvez le job étudiant idéal ou le candidat parfait
        </Text>
      </View>

      <View style={styles.searchSection}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.searchButtonText}>Commencer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>💼</Text>
          <Text style={styles.featureTitle}>Offres Ciblées</Text>
          <Text style={styles.featureText}>
            Des opportunités adaptées à votre profil et à vos disponibilités
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🎓</Text>
          <Text style={styles.featureTitle}>Spécial Étudiants</Text>
          <Text style={styles.featureText}>
            Une plateforme conçue pour les étudiants et leurs besoins spécifiques
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🤝</Text>
          <Text style={styles.featureTitle}>Mise en Relation</Text>
          <Text style={styles.featureText}>
            Contact direct avec les employeurs et réponses rapides
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3bee5e',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  searchSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  searchButton: {
    backgroundColor: '#3bee5e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    marginTop: 48,
    marginBottom: 32,
    paddingHorizontal: 20,
    gap: 20,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },
  featureTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureText: {
    color: '#666',
    fontSize: 15,
    lineHeight: 22,
  },
}); 