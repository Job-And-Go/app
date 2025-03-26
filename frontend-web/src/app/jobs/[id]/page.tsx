'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '@/components/Navbar';
import FavoriteButton from '@/components/FavoriteButton';
import { User } from '@supabase/supabase-js';

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  is_open: boolean;
  created_at: string;
  employer: {
    id: string;
    full_name: string;
  };
  max_applications?: number;
  accepted_applications?: number;
};

type Application = {
  id: string;
  status: string;
  created_at: string;
  student: {
    id: string;
    email: string;
    full_name: string;
    bio: string;
  };
};

export default function JobDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    type: string;
    full_name: string;
    avatar_url: string;
    // autres champs nécessaires
  } | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    const fetchJobAndProfile = async () => {
      if (!id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/landing');
          return;
        }

        setUser(user);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }

        const { data: jobData } = await supabase
          .from('jobs')
          .select(`
            *,
            employer:profiles(id, full_name)
          `)
          .eq('id', id)
          .single();

        if (jobData) {
          setJob(jobData as Job);
        }

        if (profileData?.type === 'student') {
          const { data: applicationData } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', id)
            .eq('student_id', user.id)
            .single();

          if (applicationData) {
            setApplication(applicationData);
          }
        } else if (profileData?.type === 'particulier' || profileData?.type === 'professionnel') {
          const { data: applicationsData } = await supabase
            .from('applications')
            .select(`
              *,
              student:profiles(id, full_name, bio)
            `)
            .eq('job_id', id);

          if (applicationsData) {
            setApplications(applicationsData);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setLoading(false);
      }
    };

    fetchJobAndProfile();
  }, [id, router]);

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
          job_id: id,
          student_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', id)
        .eq('student_id', user.id)
        .single();

      if (data) {
        setApplication(data);
      }
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
    }
  };

  const handleApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      // Vérifier si on accepte une candidature
      if (newStatus === 'accepted') {
        // Récupérer les informations actuelles du job
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('max_applications, accepted_applications')
          .eq('id', id)
          .single();

        if (jobError) throw jobError;

        const newAcceptedCount = (jobData.accepted_applications || 0) + 1;

        // Mettre à jour le nombre de candidatures acceptées
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ 
            accepted_applications: newAcceptedCount,
            is_open: jobData.max_applications ? newAcceptedCount < jobData.max_applications : true
          })
          .eq('id', id);

        if (updateError) throw updateError;
      }

      // Mettre à jour le statut de la candidature
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const handleJobStatus = async (newIsOpen: boolean) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_open: newIsOpen })
        .eq('id', id);

      if (error) throw error;

      setJob(prev => prev ? { ...prev, is_open: newIsOpen } : null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de l'offre:", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-black">Chargement...</div>;
  }

  if (!job) {
    return <div className="p-6 text-black">Offre non trouvée</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Navbar 
        user={user}
        userProfile={userProfile}
        handleSignOut={handleSignOut}
      />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => router.push('/jobs')}
            className="bg-gray-100 text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Retour aux offres
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-black">{job.title}</h1>
            {userProfile?.type === 'student' && (
              <FavoriteButton jobId={job.id} userId={user?.id || ''} />
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-black">Publié par {job.employer.full_name}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-black">{job.location}</span>
              <span className="text-black">{job.salary}€</span>
              <span className={`px-2 py-1 rounded text-sm ${
                job.is_open ? 'bg-theme-light text-theme-primary' : 'bg-red-100 text-red-800'
              }`}>
                {job.is_open ? 'Ouvert' : 'Fermé'}
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <h2 className="text-xl font-semibold mb-2 text-black">Description du poste</h2>
            <p className="whitespace-pre-line text-black">{job.description}</p>
            {job.max_applications && (
              <div className="mt-4 text-sm text-gray-600">
                Places restantes : {job.max_applications - (job.accepted_applications || 0)}
              </div>
            )}
          </div>

          {userProfile?.type === 'particulier' || userProfile?.type === 'professionnel' ? (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-black">Candidatures ({applications.length})</h2>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-black">{app.student.email ? (app.student.full_name || app.student.email.split('@')[0]) : app.student.full_name}</h3>
                        <p className="text-black mt-1">{app.student.bio}</p>
                      </div>
                      <div className="flex gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'accepted')}
                              className="bg-theme-primary text-white px-3 py-1 rounded hover:bg-theme-hover"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'rejected')}
                              className="bg-theme-primary text-white px-3 py-1 rounded hover:bg-theme-hover"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        <span className={`px-2 py-1 rounded text-sm ${
                          app.status === 'pending' ? 'bg-theme-light text-theme-primary' :
                          app.status === 'accepted' ? 'bg-theme-light text-theme-primary' :
                          'bg-theme-primary hover:bg-theme-hover text-white'
                        }`}>
                          {app.status === 'pending' ? 'En attente' :
                           app.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                        </span>
                        {app.status === 'accepted' && (
                          <button
                            onClick={() => router.push(`/messages?application=${app.id}&user=${app.student.id}`)}
                            className="bg-theme-primary text-white px-3 py-1 rounded hover:bg-theme-hover"
                          >
                            Message
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : userProfile?.type === 'student' && job.is_open && (
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
                  <p className="text-center text-black">
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

          {(userProfile?.type === 'particulier' || userProfile?.type === 'professionnel') && userProfile.id === job.employer.id && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black">Statut de l'offre</h3>
                <button
                  onClick={() => handleJobStatus(!job.is_open)}
                  className={`px-4 py-2 rounded-lg ${
                    job.is_open 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {job.is_open ? "Fermer l'offre" : "Réouvrir l'offre"}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {job.is_open 
                  ? "L'offre est actuellement ouverte aux candidatures" 
                  : "L'offre est actuellement fermée aux candidatures"}
              </p>
            </div>
          )}

          {userProfile?.type === 'student' && application?.status === 'accepted' && (
            <div className="mt-4">
              <button
                onClick={() => router.push(`/messages?application=${application.id}&user=${job.employer.id}`)}
                className="w-full bg-theme-primary text-white py-2 px-4 rounded hover:bg-theme-hover transition-colors"
              >
                Contacter l'employeur
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}