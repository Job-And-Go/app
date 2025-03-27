'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Search, Filter, Star, MapPin, GraduationCap } from 'lucide-react';
import categoriesData from '@/data/categories.json';

interface Student {
  id: string;
  full_name: string;
  avatar_url?: string;
  formation?: string;
  skills?: string[];
  rating?: number;
  code_postal?: string;
  localite?: string;
  nb_ratings?: number;
}

export default function StudentsList() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  const loadStudents = useCallback(async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          student_ratings:student_ratings!student_ratings_student_id_fkey(
            rating
          )
        `)
        .eq('type', 'student');

      // Appliquer les filtres
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,formation.ilike.%${searchQuery}%`);
      }

      if (selectedSkills.length > 0) {
        query = query.contains('skills', selectedSkills);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculer la moyenne des notes pour chaque étudiant
      const studentsWithAvgRating = data?.map(student => {
        const ratings = student.student_ratings || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((acc: number, curr: any) => acc + Number(curr.rating), 0) / ratings.length
          : undefined;
        
        return {
          ...student,
          rating: avgRating,
          nb_ratings: ratings.length
        };
      }) || [];

      // Trier les étudiants
      const sortedStudents = [...studentsWithAvgRating].sort((a, b) => {
        if (sortBy === 'rating') {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        } else {
          return a.full_name.localeCompare(b.full_name);
        }
      });

      setStudents(sortedStudents);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSkills, sortBy]);

  const loadAvailableSkills = useCallback(() => {
    // Utiliser les catégories principales du fichier categories.json
    const mainCategories = Object.keys(categoriesData.categories);
    setAvailableSkills(mainCategories);
  }, []);

  useEffect(() => {
    loadStudents();
    loadAvailableSkills();
  }, [loadStudents, loadAvailableSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidenav avec filtres */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="space-y-6">
                  {/* Barre de recherche */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Rechercher</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Rechercher un étudiant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Tri */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Trier par</h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                    >
                      <option value="rating">Note</option>
                      <option value="name">Nom</option>
                    </select>
                  </div>

                  {/* Filtres de compétences */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Compétences</h3>
                    <div className="space-y-2">
                      {availableSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedSkills.includes(skill)
                              ? 'bg-theme-light text-theme-primary font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des étudiants */}
            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => router.push(`/students/${student.id}`)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-100"
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
                      {student.rating !== undefined && (
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
                ))}

                {students.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">Aucun étudiant trouvé</h3>
                    <p className="mt-2 text-gray-600">
                      Essayez de modifier vos critères de recherche pour trouver plus de résultats.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 