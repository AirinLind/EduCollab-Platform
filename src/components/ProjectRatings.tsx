import React, { useState } from 'react';
import { useProjectRatings, useAddRating } from '../hooks/useRatings';
import { useAuth } from '../contexts/AuthContext';
import type { Project } from '../types';
import '../styles/ProjectRatings.css';

interface ProjectRatingsProps {
  project: Project;
}

const ProjectRatings: React.FC<ProjectRatingsProps> = ({ project }) => {
  const { user } = useAuth();
  const { data: ratings, isLoading } = useProjectRatings(project.id);
  const addRatingMutation = useAddRating();

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRating = React.useMemo(() => {
    if (!user || !ratings) return null;
    return ratings.find(r => r && r.userId && r.userId.toString() === user.id.toString());
  }, [user, ratings]);

  const averageRating = ratings && ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + (r?.rating || 0), 0) / ratings.length 
    : 0;

  const handleRatingSubmit = async () => {
    if (ratingValue > 0 && user && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await addRatingMutation.mutateAsync({
          projectId: project.id,
          rating: ratingValue,
        });
        setShowRatingForm(false);
        setRatingValue(0);
      } catch (error) {
        console.error('Ошибка при оценке проекта:', error);
        alert('Ошибка при оценке проекта. Попробуйте еще раз.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancelRating = () => {
    setShowRatingForm(false);
    setRatingValue(0);
  };

  if (isLoading) {
    return (
      <div className="project-ratings">
        <div className="loading">Загрузка оценок...</div>
      </div>
    );
  }

  return (
    <div className="project-ratings">
      <div className="ratings-section">
        <h4>Оценки проекта</h4>
        
        <div className="rating-stats">
          <div className="average-rating">
            <span className="rating-value">{averageRating.toFixed(1)}</span>
            <span className="rating-stars">
              {'★'.repeat(Math.round(averageRating))}
              {'☆'.repeat(5 - Math.round(averageRating))}
            </span>
            <span className="rating-count">({ratings?.length || 0} оценок)</span>
          </div>
        </div>

        {user && !userRating && (
          <div className="rating-actions">
            {!showRatingForm ? (
              <button 
                className="btn-rate"
                onClick={() => setShowRatingForm(true)}
                disabled={isSubmitting}
              >
                Оценить проект
              </button>
            ) : (
              <div className="rating-form">
                <h5>Выберите оценку:</h5>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star ${star <= ratingValue ? 'active' : ''}`}
                      onClick={() => setRatingValue(star)}
                      type="button"
                      disabled={isSubmitting}
                    >
                      {star <= ratingValue ? '★' : '☆'}
                    </button>
                  ))}
                </div>
                <div className="selected-rating">
                  {ratingValue > 0 && `Выбрано: ${ratingValue} ★`}
                </div>
                <div className="rating-buttons">
                  <button 
                    onClick={handleRatingSubmit}
                    disabled={ratingValue === 0 || isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить оценку'}
                  </button>
                  <button 
                    onClick={handleCancelRating}
                    disabled={isSubmitting}
                    className="btn btn-secondary"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {userRating && (
          <div className="user-rating">
            <p>✅ Ваша оценка: {userRating.rating} ★</p>
            <p className="rating-date">
              Оценено: {new Date(userRating.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
        )}

        {!user && (
          <div className="guest-message">
            <p>Войдите в систему, чтобы оценить проект</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectRatings;