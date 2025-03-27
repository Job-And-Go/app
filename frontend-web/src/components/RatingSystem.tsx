'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';

interface RatingSystemProps {
  studentId: string;
  currentUserId: string;
  onRatingSubmit?: () => void;
}

// Type pour l'affichage
interface Rating {
  rating: number;
  comment: string;
  created_at: string;
  rater: {
    full_name: string;
    avatar_url?: string;
  };
}

// Type pour la base de données
type DatabaseRating = {
  rating: number;
  comment: string | null;
  created_at: string;
  rater: {
    full_name: string;
    avatar_url: string | null;
  };
}

export default function RatingSystem({ studentId, currentUserId, onRatingSubmit }: RatingSystemProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatDatabaseRating = (dbRating: any): Rating => ({
    rating: dbRating.rating,
    comment: dbRating.comment || '',
    created_at: dbRating.created_at,
    rater: {
      full_name: dbRating.rater.full_name,
      avatar_url: dbRating.rater.avatar_url || undefined
    }
  });

  useEffect(() => {
    loadRatings();
  }, [studentId, currentUserId]);

  const loadRatings = async () => {
    try {
      const { data: userRating } = await supabase
        .from('student_ratings')
        .select(`
          rating,
          comment,
          created_at,
          rater:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('student_id', studentId)
        .eq('rater_id', currentUserId)
        .single();

      if (userRating) {
        const formattedRating = formatDatabaseRating(userRating);
        setExistingRating(formattedRating);
        setRating(userRating.rating);
        setComment(userRating.comment || '');
      }

      const { data: ratings } = await supabase
        .from('student_ratings')
        .select(`
          rating,
          comment,
          created_at,
          rater:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (ratings) {
        const formattedRatings = ratings.map(formatDatabaseRating);
        setAllRatings(formattedRatings);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const ratingData = {
        student_id: studentId,
        rater_id: currentUserId,
        rating,
        comment: comment.trim()
      };

      const { error } = existingRating
        ? await supabase
            .from('student_ratings')
            .update(ratingData)
            .eq('student_id', studentId)
            .eq('rater_id', currentUserId)
        : await supabase
            .from('student_ratings')
            .insert([ratingData]);

      if (error) throw error;

      await loadRatings();
      if (onRatingSubmit) onRatingSubmit();
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Une erreur est survenue lors de la soumission de votre note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Système de notation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {existingRating ? 'Modifier votre note' : 'Laisser une note'}
        </h3>
        
        <div className="flex items-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                (hoveredRating || rating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
          <span className="ml-2 text-gray-600">
            {rating ? `${rating} sur 5` : 'Sélectionnez une note'}
          </span>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience avec cet étudiant (optionnel)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
          rows={4}
        />

        {error && (
          <div className="mt-2 text-red-600 text-sm">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!rating || isSubmitting}
          className={`mt-4 px-6 py-2 rounded-lg text-white ${
            !rating || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-theme-primary hover:bg-theme-hover'
          }`}
        >
          {isSubmitting ? 'Envoi en cours...' : existingRating ? 'Modifier' : 'Envoyer'}
        </button>
      </div>

      {/* Liste des notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Avis ({allRatings.length})
        </h3>
        
        {allRatings.map((r, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < r.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                par {r.rater.full_name}
              </span>
              <span className="ml-2 text-sm text-gray-400">
                • {formatDate(r.created_at)}
              </span>
            </div>
            {r.comment && (
              <p className="text-gray-700 mt-2">{r.comment}</p>
            )}
          </div>
        ))}

        {allRatings.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Aucun avis pour le moment
          </p>
        )}
      </div>
    </div>
  );
} 