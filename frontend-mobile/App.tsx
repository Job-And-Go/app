import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
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
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = {
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
};
