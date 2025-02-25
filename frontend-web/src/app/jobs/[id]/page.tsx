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
  student: {
    id: string;
    email: string;
    full_name: string;
    bio: string;
  };
};

export default function JobDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [userProfile, setUserProfile] = useState<{ id: string; type: string } | null>(null);
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
      if (!params?.id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, type')
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
          .eq('id', params.id)
          .single();

        if (jobData) {
          setJob(jobData as Job);
        }

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
        } else if (profileData?.type === 'employer') {
          const { data: applicationsData } = await supabase
            .from('applications')
            .select(`
              *,
              student:profiles(id, full_name, bio)
            `)
            .eq('job_id', params.id);

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
  }, [params?.id, router]);

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

  const handleApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
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
                job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {job.status === 'open' ? 'Ouvert' : 'Fermé'}
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <h2 className="text-xl font-semibold mb-2 text-black">Description du poste</h2>
            <p className="whitespace-pre-line text-black">{job.description}</p>
          </div>

          {userProfile?.type === 'employer' ? (
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
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(app.id, 'rejected')}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        <span className={`px-2 py-1 rounded text-sm ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status === 'pending' ? 'En attente' :
                           app.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : userProfile?.type === 'student' && job.status === 'open' && (
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
        </div>
      </div>
    </div>
  );
}