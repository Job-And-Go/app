'use client';

import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from '@/components/Layout';
import { useTheme } from '@/components/ThemeProvider';
import Footer from '@/components/Footer';
import { MapPin, Clock, Euro, FileText, GraduationCap, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  created_at: string;
  image_url?: string;
  description?: string;
  employer_type: 'particulier' | 'professionnel';
  category: string;
  employer?: {
    type: 'particulier' | 'professionnel';
  };
}

interface Student {
  id: string;
  full_name: string;
  avatar_url?: string;
  formation?: string;
  skills?: string[];
  rating?: number;
  created_at: string;
  student_ratings?: { rating: number }[];
  nb_ratings?: number;
}

export default function Home() {
  const router = useRouter();
  const { userType } = useTheme();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [particularJobs, setParticularJobs] = useState<Job[]>([]);
  const [professionalJobs, setProfessionalJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [featuredStudents, setFeaturedStudents] = useState<Student[]>([]);
  const [latestStudents, setLatestStudents] = useState<Student[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Récupérer l'utilisateur courant
        const { data: { user } } = await supabase.auth.getUser();
        
        // Si l'utilisateur est connecté (y compris en tant qu'invité)
        if (user) {
          if (userType === 'student') {
            // Récupérer les compétences de l'étudiant
            const { data: profile } = await supabase
              .from('profiles')
              .select('skills')
              .eq('id', user.id)
              .single();
            
            if (profile?.skills) {
              setUserSkills(profile.skills);
            }
          }

          // Charger les offres récentes
          const { data: recent } = await supabase
            .from('jobs')
            .select(`
              *,
              employer:profiles!jobs_employer_id_fkey (
                type
              )
            `)
            .order('created_at', { ascending: false })
            .limit(6);
          
          if (recent) {
            const filteredRecent = recent.filter(job => job.employer?.type);
            setRecentJobs(filteredRecent);
          }

          // Charger les offres de particuliers
          const { data: particulier } = await supabase
            .from('jobs')
            .select(`
              *,
              employer:profiles!jobs_employer_id_fkey (
                type
              )
            `)
            .eq('employer.type', 'particulier')
            .order('created_at', { ascending: false })
            .limit(6);
          
          if (particulier) setParticularJobs(particulier);

          // Charger les offres de professionnels
          const { data: professionnel } = await supabase
            .from('jobs')
            .select(`
              *,
              employer:profiles!jobs_employer_id_fkey (
                type
              )
            `)
            .eq('employer.type', 'professionnel')
            .order('created_at', { ascending: false })
            .limit(6);
          
          if (professionnel) setProfessionalJobs(professionnel);

          // Charger les offres recommandées pour les étudiants
          if (userType === 'student' && userSkills.length > 0) {
            const { data: recommended } = await supabase
              .from('jobs')
              .select(`
                *,
                employer:profiles!jobs_employer_id_fkey (
                  type
                )
              `)
              .in('category', userSkills)
              .order('created_at', { ascending: false })
              .limit(6);
        
            if (recommended) {
              const filteredRecommended = recommended.filter(job => job.employer?.type);
              setRecommendedJobs(filteredRecommended);
            }
          }
        } else {
          // Pour les utilisateurs non connectés, charger les offres publiques
          const { data: recent } = await supabase
            .from('jobs')
            .select(`
              *,
              employer:profiles!jobs_employer_id_fkey (
                type
              )
            `)
            .order('created_at', { ascending: false })
            .limit(6);
          
          if (recent) {
            const filteredRecent = recent.filter(job => job.employer?.type);
            setRecentJobs(filteredRecent);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userType, userSkills]);

  const JobCard = ({ job }: { job: Job }) => (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-100"
              onClick={() => router.push(`/jobs/${job.id}`)}
            >
      <div className="relative h-48 bg-gray-50 flex items-center justify-center">
        <FileText className="w-20 h-20 text-gray-300" />
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.employer?.type === 'particulier' 
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {job.employer?.type === 'particulier' ? 'Particulier' : 'Professionnel'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
        <p className="text-gray-600 mb-2">{job.company}</p>
        <div className="mb-4">
          <span className="inline-block px-2 py-1 bg-theme-light text-theme-primary text-sm rounded">
            {job.category}
          </span>
              </div>
        <div className="flex items-center text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {job.location}
                </div>
              </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: fr })}
          </div>
          <div className="flex items-center">
            <Euro className="w-5 h-5 mr-1 text-theme-primary" />
            <span className="text-xl font-bold text-theme-primary">{job.salary}</span>
            </div>
        </div>
      </div>
        </div>
      );

  const StudentCard = ({ student }: { student: Student }) => (
          <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-100"
            onClick={() => router.push(`/students/${student.id}`)}
          >
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={student.avatar_url || '/images/default-avatar.jpg'}
                    alt={student.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{student.full_name}</h3>
                  <p className="text-gray-600">{student.formation || 'Formation non spécifiée'}</p>
                          </div>
                        </div>
              {student.skills && student.skills.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, index) => (
                      <span 
                        key={index}
                  className="px-2 py-1 bg-theme-light text-theme-primary rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {student.rating !== undefined && student.nb_ratings && student.nb_ratings > 0 && (
                <div className="mt-4 flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="text-lg font-semibold text-gray-900">{student.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm ml-1">/ 5.0</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({student.nb_ratings} avis)
                  </span>
                </div>
              )}
            </div>
                      </div>
                    );

  const Section = ({ title, items, seeAllLink }: { title: string; items: (Job | Student)[]; seeAllLink: string }) => (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button 
            onClick={() => router.push(seeAllLink)}
            className="text-theme-primary hover:text-theme-hover"
          >
            Voir tout →
          </button>
              </div>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => 
              'title' in item ? (
                <JobCard key={item.id} job={item as Job} />
              ) : (
                <StudentCard key={item.id} student={item as Student} />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {'title' in (items[0] || {}) ? 'Aucune offre disponible' : 'Aucun étudiant disponible'}
            </p>
          </div>
        )}
                      </div>
    </section>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary"></div>
                      </div>
      </Layout>
                    );
  }

                    return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <section className="relative min-h-[500px] bg-gray-100 overflow-hidden py-12">
          <div className="relative z-10 h-full">
            <div className="max-w-7xl mx-auto px-4 w-full h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {!userType ? (
                  <>
                    {/* Colonne de gauche - Présentation */}
                    <div className="group flex flex-col justify-center p-12 transition-all duration-300 hover:bg-white/80 cursor-default">
                      <div className="max-w-xl">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4 group-hover:translate-y-[-4px] transition-transform duration-300">
                          La plateforme qui connecte
                        </h1>
                        <h2 className="text-4xl font-bold text-theme-primary mb-4 group-hover:translate-y-[-4px] transition-transform duration-300">
                          étudiants, particuliers et entreprises
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">
                          Que vous soyez étudiant à la recherche de jobs flexibles, particulier en quête de services, ou entreprise à la recherche de talents, StuJob est la solution adaptée à vos besoins.
                        </p>
                        <button 
                          onClick={() => router.push('/login')}
                          className="bg-theme-primary text-white px-12 py-4 rounded-lg text-lg font-medium hover:bg-theme-hover transition-all duration-300 w-fit group-hover:translate-y-[-2px] group-hover:shadow-lg"
                        >
                          Commencer maintenant
                        </button>
                        <button 
                          onClick={() => router.push('/about')}
                          className="ml-4 bg-white text-theme-primary border-2 border-theme-primary px-12 py-4 rounded-lg text-lg font-medium hover:bg-theme-light transition-all duration-300 w-fit group-hover:translate-y-[-2px] group-hover:shadow-lg"
                        >
                          En savoir plus
                        </button>
                      </div>
                    </div>

                    {/* Colonne de droite - Accès aux offres */}
                    <div className="group flex flex-col justify-center items-end p-12 transition-all duration-300 hover:bg-white/80 cursor-default">
                      <div className="max-w-xl text-right">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 group-hover:translate-y-[-4px] transition-transform duration-300">
                          Découvrez les offres
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">
                          Des milliers d'offres de particuliers et professionnels vous attendent
                        </p>
                        <button 
                          onClick={() => router.push('/jobs')}
                          className="bg-theme-primary text-white px-12 py-4 rounded-lg text-lg font-medium hover:bg-theme-hover transition-all duration-300 group-hover:translate-y-[-2px] group-hover:shadow-lg"
                        >
                          Explorer les offres
                        </button>
                      </div>
                    </div>
                  </>
                ) : userType !== 'student' ? (
                  <>
                    {/* Contenu existant pour les professionnels et particuliers */}
                    <div className="group flex flex-col justify-center p-12 transition-all duration-300 hover:bg-white/80 cursor-default">
                      <div className="max-w-xl">
                        <h2 className="text-5xl font-bold text-gray-900 mb-4 group-hover:translate-y-[-4px] transition-transform duration-300">
                          Publiez votre offre d'emploi
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">
                          Trouvez l'étudiant idéal pour votre projet en quelques clics
                        </p>
                        <button 
                          onClick={() => router.push('/jobs/new')}
                          className="bg-theme-primary text-white px-12 py-4 rounded-lg text-lg font-medium hover:bg-theme-hover transition-all duration-300 w-fit group-hover:translate-y-[-2px] group-hover:shadow-lg"
                        >
                          Créer une offre
                        </button>
                      </div>
                    </div>

                    <div className="group flex flex-col justify-center items-end p-12 transition-all duration-300 hover:bg-white/80 cursor-default">
                      <div className="max-w-xl text-right">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4 group-hover:translate-y-[-4px] transition-transform duration-300">
                          Trouvez les meilleurs étudiants
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">
                          Des étudiants qualifiés prêts à relever vos défis
                        </p>
                        <button 
                          onClick={() => router.push('/students')}
                          className="bg-theme-primary text-white px-12 py-4 rounded-lg text-lg font-medium hover:bg-theme-hover transition-all duration-300 group-hover:translate-y-[-2px] group-hover:shadow-lg"
                        >
                          Découvrir les étudiants
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Section étudiant existante
                  <div className="group flex flex-col justify-center p-12 transition-all duration-300 hover:bg-white/80 cursor-default">
                    <div className="max-w-xl">
                      <h1 className="text-5xl font-bold text-gray-900 mb-4 group-hover:translate-y-[-4px] transition-transform duration-300">
                        Trouvez votre prochaine opportunité
                      </h1>
                      <p className="text-lg text-gray-600 mb-8 group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">
                        Des milliers d'offres de particuliers et professionnels vous attendent
                      </p>
                      <button 
                        onClick={() => router.push('/jobs')}
                        className="bg-theme-primary text-white px-12 py-4 rounded-lg text-lg font-medium hover:bg-theme-hover transition-all duration-300 w-fit group-hover:translate-y-[-2px] group-hover:shadow-lg"
                      >
                        Explorer les offres
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sections conditionnelles */}
        {!userType ? (
          <Section 
            title="Nouvelles Offres" 
            items={recentJobs}
            seeAllLink="/jobs" 
          />
        ) : userType === 'student' ? (
          <>
            {userSkills.length > 0 && (
              <Section 
                title="Offres recommandées" 
                items={recommendedJobs}
                seeAllLink="/jobs?filter=recommended" 
              />
            )}
            <Section 
              title="Nouvelles Offres" 
              items={recentJobs}
              seeAllLink="/jobs" 
            />
            <Section 
              title="Offres de particuliers" 
              items={particularJobs}
              seeAllLink="/jobs?type=particulier" 
            />
            <Section 
              title="Offres de professionnels" 
              items={professionalJobs}
              seeAllLink="/jobs?type=professionnel" 
            />
          </>
        ) : (
          <>
            <Section 
              title="Étudiants en vedette" 
              items={featuredStudents}
              seeAllLink="/students" 
            />
            <Section 
              title="Nouveaux étudiants" 
              items={latestStudents}
              seeAllLink="/students" 
            />
          </>
        )}

        <Footer />
      </div>
    </Layout>
  );
}
