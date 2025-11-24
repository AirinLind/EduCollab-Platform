import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import '../styles/Projects.css';

const Projects: React.FC = () => {
  const { data: projects, isLoading, error } = useProjects();
  const [filter, setFilter] = useState('all');

  if (isLoading) return <div className="loading">Загрузка проектов...</div>;
  if (error) return <div className="error">Ошибка загрузки проектов</div>;

  const filteredProjects = projects?.filter(project => 
    filter === 'all' || project.status === filter
  );

  return (
    <div className="projects-page">
      <div className="container">
        <div className="page-header">
          <h1>Все проекты</h1>
          <div className="filters">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все проекты</option>
              <option value="planning">Планирование</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершенные</option>
            </select>
          </div>
        </div>

        <div className="projects-grid">
          {filteredProjects?.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects?.length === 0 && (
          <div className="no-projects">
            <p>Проекты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;