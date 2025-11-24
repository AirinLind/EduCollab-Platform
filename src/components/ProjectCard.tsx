import React from 'react';
import { Link } from 'react-router-dom';
import { useDeleteProject } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import type { Project } from '../types';
import '../styles/ProjectCard.css';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const deleteProjectMutation = useDeleteProject();
  const { isAuthenticated } = useAuth();

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      planning: 'Планирование',
      in_progress: 'В работе',
      completed: 'Завершен',
      archived: 'Архив'
    };
    return statusMap[status] || status;
  };

  const getDifficultyText = (difficulty: string) => {
    const difficultyMap: { [key: string]: string } = {
      beginner: 'Начальный',
      intermediate: 'Средний',
      advanced: 'Продвинутый'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
      } catch (error) {
        alert('Ошибка при удалении проекта');
      }
    }
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <h3 className="project-title">
          <Link to={`/projects/${project.id}`}>{project.title}</Link>
        </h3>
        <div className="project-actions">
          <span className={`status-badge status-${project.status}`}>
            {getStatusText(project.status)}
          </span>
          {isAuthenticated && (
            <button 
              onClick={handleDelete}
              className="btn-delete"
              title="Удалить проект"
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? '⏳' : '🗑️'}
            </button>
          )}
        </div>
      </div>
      
      <p className="project-description">{project.description}</p>
      
      <div className="project-tags">
        {project.tags.map(tag => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>
      
      <div className="project-meta">
        <span className={`difficulty difficulty-${project.difficulty}`}>
          Сложность: {getDifficultyText(project.difficulty)}
        </span>
        <span className="created-date">
          {new Date(project.createdAt).toLocaleDateString('ru-RU')}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;