'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { User } from '@supabase/supabase-js';

type Favorite = {
  id: string;
  job_id: string;
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary: number;
    employer: {
      full_name: string;
    }
  }
}

export default function Favorites() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setUser(user);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setUserProfile(profileData);

    const { data: favoritesData } = await supabase
      .from('favorites')
      .select(`
        *,
        job:jobs!favorites_job_id_fkey (
          id,
          title,
          description,
          location,
          salary,
          employer:profiles!jobs_employer_id_fkey (
            full_name
          )
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    setFavorites(favoritesData || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Navbar 
        user={user}
        userProfile={userProfile}
        handleSignOut={handleSignOut}
      />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Mes Offres Favorites</h1>

        <div className="grid gap-6">
          {favorites.map(favorite => (
            <div key={favorite.id} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">{favorite.job.title}</h2>
              <p className="text-gray-600 mb-4">{favorite.job.employer.full_name}</p>
              <p className="text-gray-800 mb-4 line-clamp-3">{favorite.job.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{favorite.job.location}</span>
                <span>{favorite.job.salary}€</span>
              </div>
              <button
                onClick={() => router.push(`/jobs/${favorite.job.id}`)}
                className="mt-4 w-full bg-theme-primary text-white py-2 px-4 rounded hover:bg-theme-hover transition-colors"
              >
                Voir les détails
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 