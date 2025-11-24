import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '../hooks/useProjects';
import type { Project } from '../types';
import '../styles/CreateProject.css';

const CreateProject: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as Project['difficulty'],
    tags: '',
    status: 'planning' as Project['status'],
    deadline: '',
    repositoryUrl: '',
    demoUrl: '',
    maxTeamSize: 5,
    lookingForMembers: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const createProjectMutation = useCreateProject();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        deadline: formData.deadline || undefined,
        repositoryUrl: formData.repositoryUrl || undefined,
        demoUrl: formData.demoUrl || undefined,
        maxTeamSize: formData.maxTeamSize,
        lookingForMembers: formData.lookingForMembers,
      };
      
      await createProjectMutation.mutateAsync(projectData);
      navigate('/projects');
    } catch (err) {
      setError('Ошибка при создании проекта. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-project-page">
      <div className="container">
        <div className="page-header">
          <h1>Создать новый проект</h1>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="title">Название проекта *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Введите название проекта"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание проекта *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="form-control"
              placeholder="Опишите цели, задачи и технологии проекта..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Статус *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="planning">Планирование</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершен</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Сложность *</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="beginner">Начальный</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Дедлайн</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxTeamSize">Максимальный размер команды</label>
              <input
                type="number"
                id="maxTeamSize"
                name="maxTeamSize"
                value={formData.maxTeamSize}
                onChange={handleChange}
                min="1"
                max="20"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lookingForMembers" className="checkbox-label">
                <input
                  type="checkbox"
                  id="lookingForMembers"
                  name="lookingForMembers"
                  checked={formData.lookingForMembers}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    lookingForMembers: e.target.checked
                  }))}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Ищем участников</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Теги</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-control"
              placeholder="react, typescript, nodejs (через запятую)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="repositoryUrl">Ссылка на репозиторий</label>
            <input
              type="url"
              id="repositoryUrl"
              name="repositoryUrl"
              value={formData.repositoryUrl}
              onChange={handleChange}
              className="form-control"
              placeholder="https://github.com/username/project"
            />
          </div>

          <div className="form-group">
            <label htmlFor="demoUrl">Демо-ссылка</label>
            <input
              type="url"
              id="demoUrl"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleChange}
              className="form-control"
              placeholder="https://your-project-demo.netlify.app"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button"
              onClick={() => navigate('/projects')}
              className="btn btn-secondary"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Создание...' : 'Создать проект'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;