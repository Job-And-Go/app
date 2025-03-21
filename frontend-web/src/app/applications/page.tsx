'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function Applications() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setUserType(profileData.type);

        let query = supabase
          .from('applications')
          .select(`
            *,
            job:jobs(*),
            student:profiles!applications_student_id_fkey(*)
          `);

        if (profileData.type === 'student') {
          query = query.eq('student_id', user.id);
        } else if (profileData.type === 'particulier' || profileData.type === 'professionnel') {
          query = query.eq('employer_id', user.id);
        } else {
          throw new Error('Type d\'utilisateur non autorisé');
        }

        const { data, error } = await query;
        if (error) throw error;

        setApplications(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-theme-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">
          {userType === 'particulier' || userType === 'professionnel' ? 'Candidatures reçues' : 'Mes candidatures'}
        </h1>

        <div className="grid gap-6">
          {applications.map(application => (
            <div key={application.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{application.job.title}</h2>
                  <p className="text-gray-600 mb-4">{application.job.company_name}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                    ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'accepted' ? 'bg-theme-light text-theme-primary' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {application.status === 'pending' ? 'En attente' :
                     application.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                  </span>
                </div>
              </div>

              {(userType === 'particulier' || userType === 'professionnel') && application.status === 'pending' && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleStatusChange(application.id, 'accepted')}
                    className="bg-theme-primary text-white px-4 py-2 rounded hover:bg-theme-hover transition-colors"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleStatusChange(application.id, 'rejected')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 