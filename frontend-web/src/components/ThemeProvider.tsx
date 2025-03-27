'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import '../styles/colors.css';

const ThemeContext = createContext<{
  userType: string | null;
  setUserType: (type: string | null) => void;
}>({
  userType: null,
  setUserType: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('type')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.type) {
          setUserType(profile.type);
        }
      }
    };

    getProfile();
  }, []);

  const themeClass = !userType || userType === 'student'
    ? 'student-theme'
    : (userType === 'particulier' || userType === 'professionnel')
      ? 'professional-theme'
      : '';

  return (
    <ThemeContext.Provider value={{ userType, setUserType }}>
      <div className={themeClass}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
} 