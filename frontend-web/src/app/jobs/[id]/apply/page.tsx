'use client';

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ApplyToJob({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleApply = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Vérifier si l'utilisateur est un étudiant
      const { data: profile } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      if (!profile || profile.type !== 'student') {
        throw new Error('Seuls les étudiants peuvent postuler');
      }

      // Vérifier si l'étudiant n'a pas déjà postulé
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', params.id)
        .eq('student_id', user.id)
        .single();

      if (existingApplication) {
        throw new Error('Vous avez déjà postulé à cette offre');
      }

      // Créer la candidature
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: params.id,
          student_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      router.push('/applications');
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Postuler à l'offre</h1>
      <button
        onClick={handleApply}
        className="bg-[#3bee5e] text-white py-2 px-4 rounded hover:bg-[#32d951] transition-colors"
      >
        Confirmer la candidature
      </button>
    </div>
  );
} 