'use client';

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJob() {
  const router = useRouter();
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
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

      const { error } = await supabase
        .from('jobs')
        .insert({
          employer_id: user.id,
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          salary: parseFloat(jobData.salary),
          status: 'open'
        });

      if (error) throw error;

      router.push('/jobs');
    } catch (error) {
      console.error("Erreur lors de la création de l'annonce:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Publier une nouvelle offre</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Titre du poste</label>
          <input
            type="text"
            name="title"
            value={jobData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#3bee5e]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={jobData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#3bee5e] h-32"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Localisation</label>
          <input
            type="text"
            name="location"
            value={jobData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#3bee5e]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Salaire</label>
          <input
            type="number"
            name="salary"
            value={jobData.salary}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#3bee5e]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#3bee5e] text-white py-2 px-4 rounded hover:bg-[#32d951] transition-colors"
        >
          Publier l'offre
        </button>
      </form>
    </div>
  );
} 