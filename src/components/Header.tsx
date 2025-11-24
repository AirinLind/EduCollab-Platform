import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Notifications from './Notifications';
import '../styles/Header.css';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>EduCollab</h1>
          </Link>
          
          <nav className="nav">
            <Link to="/projects" className="nav-link">Проекты</Link>
            {isAuthenticated && (
              <Link to="/create-project" className="nav-link">Создать проект</Link>
            )}
          </nav>

          <div className="auth-section">
            {isAuthenticated ? (
              <div className="user-menu">
                <Notifications />
                <span>Привет, {user?.name}</span>
                <button onClick={logout} className="btn btn-secondary">Выйти</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary">Войти</Link>
                <Link to="/register" className="btn btn-primary">Регистрация</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;