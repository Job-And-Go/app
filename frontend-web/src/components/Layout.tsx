import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Notification from './Notification';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <>
      <Notification />
      <Navbar 
        user={user} 
        userProfile={userProfile} 
        handleSignOut={handleSignOut} 
      />
      {children}
    </>
  );
} 