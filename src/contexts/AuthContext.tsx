import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType } from "../types/index";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('educollab_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3001/users');
    const users: User[] = await response.json();
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('educollab_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Пользователь не найден');
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }) => {
    const newId = (Math.floor(Math.random() * 1000) + 10).toString();
    
    const newUser: User = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    
    await fetch('http://localhost:3001/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });
    
    setUser(newUser);
    localStorage.setItem('educollab_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('educollab_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};