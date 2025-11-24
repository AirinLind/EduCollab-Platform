import React, { useState } from 'react';
import { useMilestones, useCreateMilestone, useUpdateMilestone } from '../hooks/useProgress';
import { useTeamMembers } from '../hooks/useTeams';
import { useAuth } from '../contexts/AuthContext';
import type { Project, Milestone } from '../types';
import "../styles/ProjectProgress.css"

interface ProjectProgressProps {
  project: Project;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({ project }) => {
  const { user } = useAuth();
  const { data: milestones, isLoading, error } = useMilestones(project.id);
  const { data: teamMembers } = useTeamMembers(project.id);
  const createMilestoneMutation = useCreateMilestone();
  const updateMilestoneMutation = useUpdateMilestone();

  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const isTeamMember = React.useMemo(() => {
    if (!user || !teamMembers) return false;
    return teamMembers.some(member => {
      if (!member || member.userId == null) return false;
      return member.userId.toString() === user.id.toString();
    });
  }, [user, teamMembers]);

  const isOwner = user && project.ownerId && user.id.toString() === project.ownerId.toString();
  const canManageMilestones = isTeamMember || isOwner;

  const completedMilestones = milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = milestones?.length || 0;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title.trim() || !user) return;

    try {
      await createMilestoneMutation.mutateAsync({
        projectId: project.id,
        title: newMilestone.title,
        description: newMilestone.description,
        status: 'pending' as const,
        dueDate: newMilestone.dueDate || undefined,
      });
      setNewMilestone({ title: '', description: '', dueDate: '' });
      setShowMilestoneForm(false);
    } catch (err) {
      console.error('Ошибка при создании этапа:', err);
      alert('Ошибка при создании этапа. Попробуйте еще раз.');
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string | number, newStatus: Milestone['status']) => {
    try {
      await updateMilestoneMutation.mutateAsync({
        id: milestoneId,
        milestone: { 
          status: newStatus,
          ...(newStatus === 'completed' ? { completedAt: new Date().toISOString() } : {})
        }
      });
    } catch (err) {
      console.error('Ошибка при обновлении этапа:', err);
      alert('Ошибка при обновлении этапа. Попробуйте еще раз.');
    }
  };

  if (isLoading) {
    return <div className="loading">Загрузка прогресса...</div>;
  }

  if (error) {
    return <div className="error">Ошибка загрузки этапов проекта</div>;
  }

  return (
    <div className="project-progress">
      <div className="progress-header">
        <h2>Прогресс проекта</h2>
        <div className="progress-stats">
          <div className="progress-percentage">{Math.round(progressPercentage)}%</div>
          <div className="progress-text">
            {completedMilestones} из {totalMilestones} этапов завершено
          </div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Упрощенная отладочная информация (можно удалить в продакшене) */}
      {false && ( // Измените на true для включения отладки
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Отладка:</strong><br />
          User ID: {user?.id}<br />
          Project Owner ID: {project.ownerId}<br />
          Is Owner: {isOwner ? 'Да' : 'Нет'}<br />
          Team Members: {teamMembers?.length || 0}<br />
          Is Team Member: {isTeamMember ? 'Да' : 'Нет'}<br />
          Can Manage: {canManageMilestones ? 'Да' : 'Нет'}
        </div>
      )}

      {canManageMilestones && (
        <div className="milestone-actions">
          {!showMilestoneForm ? (
            <button 
              className="btn btn-primary"
              onClick={() => setShowMilestoneForm(true)}
            >
              + Добавить этап
            </button>
          ) : (
            <form onSubmit={handleCreateMilestone} className="milestone-form">
              <h4>Новый этап проекта</h4>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Название этапа *"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Описание этапа"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Дедлайн (опционально):</label>
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="form-control"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createMilestoneMutation.isPending}
                >
                  {createMilestoneMutation.isPending ? 'Создание...' : 'Создать этап'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowMilestoneForm(false)}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!canManageMilestones && user && (
        <div className="guest-info">
          <p>💡 Чтобы управлять этапами проекта, присоединитесь к команде.</p>
          <p>Если вы владелец проекта, убедитесь что вы добавлены в команду.</p>
        </div>
      )}

      <div className="milestones-section">
        <h3>Этапы проекта</h3>
        {milestones && milestones.length > 0 ? (
          <div className="milestones-list">
            {milestones.map((milestone) => (
              <div key={milestone.id} className={`milestone-item milestone-${milestone.status}`}>
                <div className="milestone-header">
                  <div className="milestone-title">
                    <h4>{milestone.title}</h4>
                    <span className={`status-badge status-${milestone.status}`}>
                      {milestone.status === 'pending' && '⏳ Ожидание'}
                      {milestone.status === 'in_progress' && '🚀 В работе'}
                      {milestone.status === 'completed' && '✅ Завершено'}
                    </span>
                  </div>
                  {canManageMilestones && (
                    <div className="milestone-actions">
                      <select
                        value={milestone.status}
                        onChange={(e) => handleUpdateMilestoneStatus(milestone.id, e.target.value as Milestone['status'])}
                        className="status-select"
                      >
                        <option value="pending">Ожидание</option>
                        <option value="in_progress">В работе</option>
                        <option value="completed">Завершено</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {milestone.description && (
                  <p className="milestone-description">{milestone.description}</p>
                )}
                
                <div className="milestone-meta">
                  {milestone.dueDate && (
                    <span className="due-date">
                      📅 Дедлайн: {new Date(milestone.dueDate).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {milestone.completedAt && (
                    <span className="completed-date">
                      ✅ Завершено: {new Date(milestone.completedAt).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  <span className="created-date">
                    📝 Создан: {new Date(milestone.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-milestones">
            <p>Этапы проекта еще не добавлены.</p>
            {canManageMilestones ? (
              <p>Начните с добавления первого этапа вашего проекта!</p>
            ) : (
              <p>Только участники команды могут добавлять этапы.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectProgress;