import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
//import { supabase } from '@/lib/supabase';

export default function App() {
  /*const setNewView = async () => {
    const { data, error } = await supabase
      .from("views")
      .insert({
        name: "random name"
      })

    console.log(error || data);
  }

  setNewView();*/

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Image
          source={require('./assets/favicon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerText}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Trouvez votre prochain emploi</Text>
          <Text style={styles.titleAccent}>avec Job&Go</Text>
          <Text style={styles.subtitle}>
            La plateforme qui connecte les talents avec les meilleures opportunités professionnelles.
          </Text>
        </View>

        <View style={styles.searchSection}>
          <TextInput
            style={styles.input}
            placeholder="Poste, compétence ou entreprise"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input}
            placeholder="Ville ou région"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            activeOpacity={0.8}
          >
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>✨</Text>
            <Text style={styles.featureTitle}>Offres Pertinentes</Text>
            <Text style={styles.featureText}>Des opportunités professionnelles adaptées à votre profil et vos aspirations.</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🔍</Text>
            <Text style={styles.featureTitle}>Recherche Simplifiée</Text>
            <Text style={styles.featureText}>Une interface intuitive pour trouver rapidement les offres qui vous correspondent.</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🚀</Text>
            <Text style={styles.featureTitle}>Carrière Accélérée</Text>
            <Text style={styles.featureText}>Des outils et conseils pour booster votre parcours professionnel.</Text>
          </View>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2C2C',
  },
  nav: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logo: {
    width: 120,
    height: 40,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loginButton: {
    padding: 10,
  },
  loginText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#FF7043',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  registerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleAccent: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF7043',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: '90%',
  },
  searchSection: {
    marginTop: 24,
    gap: 16,
  },
  input: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    color: 'white',
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#FF7043',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    marginTop: 48,
    marginBottom: 32,
    gap: 20,
  },
  featureCard: {
    backgroundColor: '#2C2C2C',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },
  featureTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureText: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 22,
  },
});
