import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useDeleteProject } from '../hooks/useProjects';
import { useComments, useCreateComment } from '../hooks/useComments';
import { useAuth } from '../contexts/AuthContext';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import TeamManagement from '../components/TeamManagement'; 
import ProjectProgress from '../components/ProjectProgress';
import ProjectRatings from '../components/ProjectRatings';
import '../styles/ProjectDetails.css';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const projectId = id || '';

  const { data: project, isLoading, error } = useProject(projectId);
  const { data: comments } = useComments(projectId);
  const createCommentMutation = useCreateComment();
  const deleteProjectMutation = useDeleteProject();

  const [showCommentForm, setShowCommentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const handleAddComment = async (content: string) => {
    if (!user) return;
    
    await createCommentMutation.mutateAsync({
      content,
      authorId: user.id,
      projectId: projectId
    });
    setShowCommentForm(false);
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.')) {
      try {
        await deleteProjectMutation.mutateAsync(projectId);
        navigate('/projects');
      } catch (error) {
        alert('Ошибка при удалении проекта');
      }
    }
  };

  if (!projectId) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Неверный ID проекта</h2>
          <p>Пожалуйста, проверьте ссылку и попробуйте снова.</p>
          <button onClick={() => navigate('/projects')} className="btn btn-primary">
            Вернуться к проектам
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="loading">Загрузка проекта...</div>;
  
  if (error || !project) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Проект не найден</h2>
          <p>Проект с ID {id} не существует или был удален.</p>
          <button onClick={() => navigate('/projects')} className="btn btn-primary">
            Вернуться к проектам
          </button>
        </div>
      </div>
    );
  }

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

  const renderMainContent = () => {
    switch (activeTab) {
      case 'progress':
        return <ProjectProgress project={project} />;
      case 'team':
        return <TeamManagement project={project} />;
      default:
        return (
          <>
            <section className="project-description-section">
              <h2>Описание проекта</h2>
              <p>{project.description}</p>
            </section>

            <section className="project-tags-section">
              <h2>Технологии и теги</h2>
              <div className="tags-container">
                {project.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </section>

            {project.deadline && (
              <section className="project-deadline">
                <h2>Дедлайн</h2>
                <p>{new Date(project.deadline).toLocaleDateString('ru-RU')}</p>
              </section>
            )}

            {(project.repositoryUrl || project.demoUrl) && (
              <section className="project-links">
                <h2>Ссылки</h2>
                <div className="links-container">
                  {project.repositoryUrl && (
                    <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                      📁 Репозиторий
                    </a>
                  )}
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                      🌐 Демо
                    </a>
                  )}
                </div>
              </section>
            )}
          </>
        );
    }
  };

  return (
    <div className="project-details-page">
      <div className="container">
        <button onClick={() => navigate('/projects')} className="back-button">
          ← Назад к проектам
        </button>

        <div className="project-header">
          <div className="project-title-section">
            <h1>{project.title}</h1>
            <div className="project-meta">
              <span className={`status-badge status-${project.status}`}>
                {getStatusText(project.status)}
              </span>
              <span className="difficulty-badge">
                {getDifficultyText(project.difficulty)}
              </span>
              <span className="created-date">
                Создан: {new Date(project.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        <div className="project-tabs">
          <button 
            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            📋 Описание
          </button>
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            📊 Прогресс
          </button>
          <button 
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            👥 Команда
          </button>
        </div>

        <div className="project-content">
          <div className="project-main">
            {renderMainContent()}
          </div>

          <div className="project-sidebar">
            <ProjectRatings project={project} />

            <section className="project-actions">
              <h3>Действия</h3>
              {isAuthenticated && (
                <>
                  <button 
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    className="btn btn-primary btn-full"
                  >
                    💬 Добавить комментарий
                  </button>
                  {project.ownerId.toString() === user?.id.toString() && (
                    <button 
                      onClick={handleDeleteProject}
                      className="btn btn-danger btn-full"
                      style={{ marginTop: '0.5rem' }}
                      disabled={deleteProjectMutation.isPending}
                    >
                      {deleteProjectMutation.isPending ? '⏳ Удаление...' : '🗑️ Удалить проект'}
                    </button>
                  )}
                </>
              )}
            </section>

            {showCommentForm && (
              <CommentForm 
                onSubmit={handleAddComment}
                onCancel={() => setShowCommentForm(false)}
              />
            )}
          </div>
        </div>

        <section className="project-comments">
          <h2>Комментарии ({comments?.length || 0})</h2>
          <CommentList 
            comments={comments || []} 
            projectId={projectId}
          />
        </section>
      </div>
    </div>
  );
};

export default ProjectDetails;