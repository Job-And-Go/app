'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  status: string;
  created_at: string;
  employer: {
    id: string;
    full_name: string;
  };
};

type Application = {
  id: string;
  status: string;
  created_at: string;
};

export default function JobDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [userProfile, setUserProfile] = useState<{ id: string; type: string } | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobAndProfile = async () => {
      if (!params?.id) return; // Vérification de sécurité

      try {
        // Récupérer l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Récupérer le profil de l'utilisateur
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, type')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }

        // Récupérer les détails de l'offre
        const { data: jobData } = await supabase
          .from('jobs')
          .select(`
            *,
            employer:profiles(id, full_name)
          `)
          .eq('id', params.id)
          .single();

        if (jobData) {
          setJob(jobData as Job);
        }

        // Vérifier si l'étudiant a déjà postulé
        if (profileData?.type === 'student') {
          const { data: applicationData } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', params.id)
            .eq('student_id', user.id)
            .single();

          if (applicationData) {
            setApplication(applicationData);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setLoading(false);
      }
    };

    fetchJobAndProfile();
  }, [params?.id, router]); // Utiliser params?.id au lieu de params.id

  const handleApply = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: params.id,
          student_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      // Rafraîchir l'application
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', params.id)
        .eq('student_id', user.id)
        .single();

      if (data) {
        setApplication(data);
      }
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!job) {
    return <div className="p-6">Offre non trouvée</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => router.push('/jobs')}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          Retour aux offres
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
        
        <div className="mb-6">
          <p className="text-gray-600">Publié par {job.employer.full_name}</p>
          <div className="flex gap-4 mt-2">
            <span className="text-gray-600">{job.location}</span>
            <span className="text-gray-600">{job.salary}€</span>
            <span className={`px-2 py-1 rounded text-sm ${
              job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {job.status === 'open' ? 'Ouvert' : 'Fermé'}
            </span>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <h2 className="text-xl font-semibold mb-2">Description du poste</h2>
          <p className="whitespace-pre-line">{job.description}</p>
        </div>

        {userProfile?.type === 'student' && job.status === 'open' && (
          <div className="mt-6">
            {!application ? (
              <button
                onClick={handleApply}
                className="w-full bg-[#3bee5e] text-white py-3 px-4 rounded-lg hover:bg-[#32d951] transition-colors"
              >
                Postuler
              </button>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-center">
                  Vous avez déjà postulé à cette offre
                  <span className="block mt-2 font-semibold">
                    Statut: {application.status === 'pending' ? 'En attente' : 
                            application.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 