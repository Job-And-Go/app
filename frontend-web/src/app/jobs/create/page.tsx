'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '@/components/Navbar';
import LocationSearch from '@/components/LocationSearch';

export default function CreateJob() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [jobData, setJobData] = useState({
    title: "",
    description: "", 
    location: "",
    salary: "",
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location: string) => {
    setJobData(prev => ({
      ...prev,
      location: location
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      if (!profileData || profileData.type !== 'employer') {
        throw new Error('Seuls les employeurs peuvent publier des annonces');
      }

      const { error } = await supabase
        .from('jobs')
        .insert({
          employer_id: user.id,
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          salary: parseFloat(jobData.salary),
          status: 'open',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      router.push('/jobs');
    } catch (error) {
      console.error("Erreur lors de la création de l'annonce:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        user={user}
        userProfile={userProfile}
        handleSignOut={handleSignOut}
      />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Publier une nouvelle offre</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Titre du poste</label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[#3bee5e] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Description</label>
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[#3bee5e] h-32 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Localisation</label>
            <LocationSearch onSelect={handleLocationSelect} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Salaire</label>
            <input
              type="number"
              name="salary"
              value={jobData.salary}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[#3bee5e] text-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#3bee5e] text-black py-2 px-4 rounded hover:bg-[#32d951] transition-colors"
          >
            Publier l'offre
          </button>
        </form>
      </div>
    </div>
  );
}