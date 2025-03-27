'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { GraduationCap, MapPin, Mail, Phone, Star, Plus, X, Check } from 'lucide-react';
import categories from '@/data/categories.json';

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  formation?: string;
  skills?: string[];
  rating?: number;
  code_postal?: string;
  localite?: string;
}

interface Application {
  id: string;
  status: string;
  job_id: string;
}

interface DatabaseRatingResponse {
  id: string;
  student_id: string;
  rater_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  rater: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface RawRating {
  id: string;
  student_id: string;
  rater_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  rater: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface Rating {
  id: string;
  student_id: string;
  rater_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  rater: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export default function StudentProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; type: string } | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAcceptedApplication, setHasAcceptedApplication] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableCategories] = useState(Object.keys(categories.categories));

  const loadData = useCallback(async () => {
    try {
      // Charger l'utilisateur courant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Charger le type de l'utilisateur courant
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      if (currentUserProfile) {
        setCurrentUser({ id: user.id, type: currentUserProfile.type });

        // Vérifier s'il existe une candidature acceptée
        if (currentUserProfile.type === 'particulier' || currentUserProfile.type === 'professionnel') {
          const { data: applications } = await supabase
            .from('applications')
            .select('id, status')
            .eq('student_id', params.id)
            .eq('status', 'accepted');

          if (applications && applications.length > 0) {
            setHasAcceptedApplication(true);
            setApplicationId(applications[0].id);
          }
        }
      }

      // Charger le profil de l'étudiant
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .eq('type', 'student')
        .single();

      if (studentProfile) {
        setProfile(studentProfile);
      }

      // Charger tous les avis
      const { data: allRatings, error: ratingsError } = await supabase
        .from('student_ratings')
        .select(`
          *,
          rater:profiles!student_ratings_rater_id_fkey(id, full_name, avatar_url)
        `)
        .eq('student_id', params.id)
        .order('created_at', { ascending: false });

      if (ratingsError) {
        console.error('Erreur lors du chargement des avis:', ratingsError);
        return;
      }

      if (allRatings) {
        try {
          const formattedRatings: Rating[] = allRatings
            .filter(rating => rating && rating.rater)
            .map(rating => ({
              id: rating.id,
              student_id: rating.student_id,
              rater_id: rating.rater_id,
              rating: rating.rating,
              comment: rating.comment,
              created_at: rating.created_at,
              updated_at: rating.updated_at,
              rater: {
                id: rating.rater.id,
                full_name: rating.rater.full_name,
                avatar_url: rating.rater.avatar_url || undefined
              }
            }));
        
          setRatings(formattedRatings);
        
          // Trouver l'avis de l'utilisateur courant s'il existe
          const currentUserRating = formattedRatings.find(r => r.rater_id === user.id);
          if (currentUserRating) {
            setUserRating(currentUserRating);
            setNewRating(currentUserRating.rating);
            setComment(currentUserRating.comment || '');
          }
        } catch (error) {
          console.error('Erreur lors du traitement des avis:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRatingSubmit = async () => {
    if (!currentUser || !profile) return;
    
    try {
      setIsSubmitting(true);

      if (userRating) {
        // Mettre à jour l'avis existant
        const { error } = await supabase
          .from('student_ratings')
          .update({
            rating: newRating,
            comment: comment,
          })
          .eq('id', userRating.id);

        if (error) throw error;
      } else {
        // Créer un nouvel avis
        const { error } = await supabase
          .from('student_ratings')
          .insert({
            student_id: profile.id,
            rater_id: currentUser.id,
            rating: newRating,
            comment: comment,
          });

        if (error) throw error;
      }

      await loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 4) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSaveSkills = async () => {
    if (!currentUser || !profile) return;
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('profiles')
        .update({ skills: selectedSkills })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, skills: selectedSkills });
      setIsEditingSkills(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des compétences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil non trouvé</h1>
            <p className="text-gray-600">L'étudiant que vous recherchez n'existe pas.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* En-tête du profil */}
            <div className="relative h-48 bg-gradient-to-r from-theme-light to-theme-primary">
              <div className="absolute -bottom-16 left-8">
                <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  <Image
                    src={profile.avatar_url || '/images/default-avatar.jpg'}
                    alt={profile.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Informations principales */}
            <div className="pt-20 px-8 pb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                  {profile.formation && (
                    <div className="flex items-center mt-2 text-gray-600">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      {profile.formation}
                    </div>
                  )}
                  {(profile.code_postal || profile.localite) && (
                    <div className="flex items-center mt-2 text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      {profile.code_postal} {profile.localite}
                    </div>
                  )}
                </div>
                {profile.rating && (
                  <div className="bg-yellow-50 px-4 py-2 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{profile.rating.toFixed(1)}</div>
                    <div className="text-sm text-yellow-600">/ 5.0</div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos</h2>
                  <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
                </div>
              )}

              {/* Compétences */}
                <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Compétences</h2>
                  {currentUser?.id === profile.id && (
                    <button
                      onClick={() => {
                        if (!isEditingSkills) {
                          setSelectedSkills(profile.skills || []);
                        }
                        setIsEditingSkills(!isEditingSkills);
                      }}
                      className="text-theme-primary hover:text-theme-hover flex items-center gap-2"
                    >
                      {isEditingSkills ? (
                        <>
                          <X className="w-4 h-4" />
                          Annuler
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Modifier
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {isEditingSkills ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleSkillToggle(category)}
                          className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${
                            selectedSkills.includes(category)
                              ? 'bg-theme-primary text-white border-theme-primary shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-theme-primary hover:shadow-sm'
                          }`}
                        >
                          <span>{category}</span>
                          {selectedSkills.includes(category) && (
                            <Check className="w-4 h-4 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">
                          {selectedSkills.length}/4 compétences sélectionnées
                        </p>
                        {selectedSkills.length === 4 && (
                          <span className="text-sm text-red-500">
                            Maximum atteint
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleSaveSkills}
                        disabled={isSubmitting || selectedSkills.length === 0}
                        className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Enregistrer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, index) => (
                      <span
                        key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                          {currentUser?.id === profile.id && (
                            <button
                              onClick={() => {
                                setSelectedSkills(profile.skills?.filter((_, i) => i !== index) || []);
                                handleSaveSkills();
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                      </span>
                      ))
                    ) : (
                      <p className="text-gray-500">Aucune compétence ajoutée</p>
                    )}
                  </div>
                )}
                </div>

              {/* Contact */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
                <div className="space-y-3">
                  {currentUser?.type === 'student' ? (
                    <>
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-5 h-5 mr-3" />
                        <a href={`mailto:${profile.email}`} className="hover:text-theme-primary">
                          {profile.email}
                        </a>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-5 h-5 mr-3" />
                          <a href={`tel:${profile.phone}`} className="hover:text-theme-primary">
                            {profile.phone}
                          </a>
                        </div>
                      )}
                    </>
                  ) : hasAcceptedApplication ? (
                    <button
                      onClick={() => router.push(`/messages?application=${applicationId}&user=${profile?.id}`)}
                      className="w-full bg-theme-primary text-white py-3 px-4 rounded-lg hover:bg-theme-hover transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Envoyer un message
                    </button>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 text-center">
                        Pour entrer en contact avec cet étudiant, publiez une offre d'emploi et attendez sa candidature.
                      </p>
                      <button
                        onClick={() => router.push('/jobs/new')}
                        className="mt-4 w-full bg-theme-primary text-white py-2 px-4 rounded-lg hover:bg-theme-hover transition-colors"
                      >
                        Publier une offre
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Système d'avis */}
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Avis</h2>

                {/* Formulaire d'avis - visible uniquement pour les particuliers et professionnels */}
                {currentUser && ['particulier', 'professionnel'].includes(currentUser.type) && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {userRating ? 'Modifier votre avis' : 'Laisser un avis'}
                    </h3>
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1"
                        >
                          <Star
                            className="w-8 h-8"
                            fill={star <= newRating ? '#FBBF24' : 'none'}
                            stroke={star <= newRating ? '#FBBF24' : '#D1D5DB'}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience avec cet étudiant..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                      rows={4}
                    />
                    <button
                      onClick={handleRatingSubmit}
                      disabled={isSubmitting || newRating === 0}
                      className="mt-4 px-6 py-2 bg-theme-primary text-white rounded-md hover:bg-theme-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Envoi en cours...' : userRating ? 'Modifier' : 'Envoyer'}
                    </button>
                  </div>
                )}

                {/* Liste des avis */}
                <div className="space-y-6">
                  {ratings.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun avis pour le moment.</p>
                  ) : (
                    ratings.map((rating) => (
                      <div key={rating.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-4">
                              <Image
                                src={rating.rater.avatar_url || '/images/default-avatar.jpg'}
                                alt={rating.rater.full_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{rating.rater.full_name}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(rating.created_at).toLocaleDateString()}
                                {rating.updated_at !== rating.created_at && 
                                  <span className="ml-2 text-gray-400">(Modifié)</span>
                                }
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="w-5 h-5"
                                fill={star <= rating.rating ? '#FBBF24' : 'none'}
                                stroke={star <= rating.rating ? '#FBBF24' : '#D1D5DB'}
                              />
                            ))}
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="mt-4 text-gray-700">{rating.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 