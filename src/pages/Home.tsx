import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>EduCollab - Платформа для учебных проектов</h1>
            <p>Создавайте проекты, находите команду, делитесь знаниями и достигайте целей вместе</p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/projects" className="btn btn-primary btn-large">
                  Перейти к проектам
                </Link>
              ) : (
                <div className="auth-actions">
                  <Link to="/register" className="btn btn-primary btn-large">
                    Начать сейчас
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-large">
                    Войти в систему
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Возможности платформы</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📋 Создание проектов</h3>
              <p>Публикуйте свои учебные проекты и привлекайте участников</p>
            </div>
            <div className="feature-card">
              <h3>👥 Командная работа</h3>
              <p>Находите единомышленников и работайте вместе над проектами</p>
            </div>
            <div className="feature-card">
              <h3>💬 Обсуждения</h3>
              <p>Комментируйте проекты, делитесь идеями и получайте обратную связь</p>
            </div>
            <div className="feature-card">
              <h3>📊 Отслеживание прогресса</h3>
              <p>Следите за статусом проектов и достижениями команды</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;