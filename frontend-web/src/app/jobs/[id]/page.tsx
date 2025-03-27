'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '@/components/Navbar';
import FavoriteButton from '@/components/FavoriteButton';
import { User } from '@supabase/supabase-js';
import Image from "next/image";

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
    avatar_url?: string;
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<boolean | null>(null);

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
              student:profiles(id, full_name, bio, avatar_url)
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
      setShowConfirmation(false);
      setPendingStatusChange(null);
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
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/jobs')}
            className="bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour aux offres
          </button>
          {userProfile?.type === 'student' && (
            <FavoriteButton jobId={job.id} userId={user?.id || ''} />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* En-tête de l'offre */}
          <div className="bg-gradient-to-r from-theme-light to-theme-primary p-6 text-white">
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {job.location}
              </span>
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                {job.salary}€
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.is_open ? 'bg-green-500/20 text-white' : 'bg-red-500/20 text-white'
              }`}>
                {job.is_open ? 'Ouvert' : 'Fermé'}
              </span>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-6">
            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Description du poste</h2>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              {job.max_applications && (
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Places restantes : {job.max_applications - (job.accepted_applications || 0)}
                </div>
              )}
            </div>

            {/* Section des candidatures */}
            {userProfile?.type !== 'student' && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                  Candidatures ({applications.length})
                </h2>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image
                            src={app.student.avatar_url || '/images/default-avatar.jpg'}
                            alt={app.student.full_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <button 
                                onClick={() => router.push(`/students/${app.student.id}`)}
                                className="font-semibold text-gray-900 hover:text-theme-primary transition-colors"
                              >
                                {app.student.full_name}
                              </button>
                              <p className="text-sm text-gray-600 mt-1">{app.student.bio}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {app.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApplicationStatus(app.id, 'accepted')}
                                    className="bg-theme-primary text-white px-3 py-1 rounded-lg hover:bg-theme-hover transition-colors text-sm"
                                  >
                                    Accepter
                                  </button>
                                  <button
                                    onClick={() => handleApplicationStatus(app.id, 'rejected')}
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                  >
                                    Refuser
                                  </button>
                                </>
                              )}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {app.status === 'pending' ? 'En attente' :
                                 app.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                              </span>
                            </div>
                          </div>
                          {app.status === 'accepted' && (
                            <button
                              onClick={() => router.push(`/messages?application=${app.id}&user=${app.student.id}`)}
                              className="mt-2 text-theme-primary hover:text-theme-hover text-sm flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                              Envoyer un message
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions pour les étudiants */}
            {userProfile?.type === 'student' && (
              <div className="mt-6">
                {!application ? (
                  <button
                    onClick={handleApply}
                    disabled={!job.is_open}
                    className="w-full bg-theme-primary text-white py-3 px-4 rounded-lg hover:bg-theme-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {job.is_open ? 'Postuler' : "L'offre est fermée"}
                  </button>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-center text-gray-900">
                      Vous avez déjà postulé à cette offre
                      <span className={`block mt-2 font-semibold ${
                        application.status === 'pending' ? 'text-yellow-600' :
                        application.status === 'accepted' ? 'text-green-600' :
                        'text-red-600'
                      }`}>
                        Statut: {application.status === 'pending' ? 'En attente' : 
                                application.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                      </span>
                    </p>
                    {application.status === 'accepted' && (
                      <button
                        onClick={() => router.push(`/messages?application=${application.id}&user=${job.employer.id}`)}
                        className="mt-4 w-full bg-theme-primary text-white py-2 px-4 rounded-lg hover:bg-theme-hover transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        Contacter l'employeur
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Contrôles pour l'employeur */}
            {(userProfile?.type === 'particulier' || userProfile?.type === 'professionnel') && (
              <div className="mt-8 border-t pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Statut de l'offre</h3>
                  <button
                    onClick={() => {
                      setPendingStatusChange(!job.is_open);
                      setShowConfirmation(true);
                    }}
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
          </div>
        </div>
      </div>

      {/* Popup de confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">
              {pendingStatusChange ? "Réouvrir l'offre ?" : "Fermer l'offre ?"}
            </h3>
            <p className="text-gray-600 mb-6">
              {pendingStatusChange ? (
                "En réouvrant l'offre :"
              ) : (
                "En fermant l'offre :"
              )}
              <ul className="list-disc ml-6 mt-2 space-y-2">
                {pendingStatusChange ? (
                  <>
                    <li>L'offre sera à nouveau visible pour les étudiants</li>
                    <li>Les étudiants pourront postuler</li>
                    <li>Les candidatures en attente pourront être traitées</li>
                  </>
                ) : (
                  <>
                    <li>L'offre ne sera plus visible dans les recherches</li>
                    <li>Les étudiants ne pourront plus postuler</li>
                    <li>Les candidatures en cours seront conservées</li>
                  </>
                )}
              </ul>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingStatusChange(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleJobStatus(pendingStatusChange!)}
                className={`px-4 py-2 rounded-lg text-white ${
                  pendingStatusChange
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}