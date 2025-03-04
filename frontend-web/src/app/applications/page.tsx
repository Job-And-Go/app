'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Application = {
  id: string;
  status: string;
  created_at: string;
  student_id: string;
  job: {
    title: string;
    employer_id: string;
  };
  student: {
    id: string;
    full_name: string;
  };
};

export default function Applications() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Récupérer le type d'utilisateur
      const { data: profileData } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserType(profileData.type);

        // Récupérer les candidatures selon le type d'utilisateur
        const query = supabase
          .from('applications')
          .select(`
            *,
            job:jobs(title, employer_id),
            student:profiles(id, full_name)
          `)
          .order('created_at', { ascending: false });

        if (profileData.type === 'employer') {
          query.eq('jobs.employer_id', user.id);
        } else {
          query.eq('student_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setApplications(data as Application[]);
      }
    };

    fetchApplications();
  }, [router]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      // Mettre à jour l'état local
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const handleMessageClick = (applicationId: string, otherUserId: string) => {
    router.push(`/messages?application=${applicationId}&user=${otherUserId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {userType === 'employer' ? 'Candidatures reçues' : 'Mes candidatures'}
      </h1>

      <div className="grid gap-6">
        {applications.map(application => (
          <div key={application.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{application.job.title}</h2>
                <p className="text-gray-600">{application.student.full_name}</p>
                <p className="text-sm text-gray-500">
                  Postulé le {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                {userType === 'employer' && application.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'accepted')}
                      className="bg-[#3bee5e] text-white px-4 py-2 rounded hover:bg-[#32d951]"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Refuser
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className={`px-4 py-2 rounded ${
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status === 'accepted' ? 'Acceptée' :
                       application.status === 'rejected' ? 'Refusée' :
                       'En attente'}
                    </span>
                    {application.status === 'accepted' && (
                      <button
                        onClick={() => handleMessageClick(
                          application.id,
                          userType === 'employer' ? application.student.id : application.job.employer_id
                        )}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Message
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 