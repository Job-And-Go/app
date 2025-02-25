'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FavoriteButtonProps {
  jobId: string;
  userId: string;
}

export default function FavoriteButton({ jobId, userId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (jobId && userId) {
      checkIfFavorite();
    }
  }, [jobId, userId]);

  const checkIfFavorite = async () => {
    if (!jobId || !userId) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('job_id', jobId)
        .eq('student_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Erreur lors de la vérification des favoris:', error.message);
        return;
      }
      
      setIsFavorite(!!data);
    } catch (error: any) {
      console.error('Erreur:', error.message || 'Une erreur est survenue');
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!jobId || !userId) return;

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('job_id', jobId)
          .eq('student_id', userId);

        if (error) {
          console.error('Erreur lors de la suppression:', error.message);
          return;
        }
        setIsFavorite(false);
      } else {
        // Récupérer d'abord l'employer_id du job
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('employer_id')
          .eq('id', jobId)
          .single();

        if (jobError) {
          console.error('Erreur lors de la récupération du job:', jobError.message);
          return;
        }

        // Ajouter aux favoris avec l'employer_id récupéré
        const { error } = await supabase
          .from('favorites')
          .insert({
            job_id: jobId,
            student_id: userId,
            employer_id: jobData.employer_id,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Erreur lors de l\'ajout:', error.message);
          return;
        }
        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification des favoris:', error.message || 'Une erreur est survenue');
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 rounded-full transition-colors ${
        isFavorite 
          ? 'text-yellow-500 hover:text-yellow-600' 
          : 'text-gray-400 hover:text-gray-500'
      }`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    </button>
  );
} 