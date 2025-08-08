import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      const res = await getMe();
      setUser(res);
    } catch (error) {
      // 토큰이 만료되었거나 없는 경우
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const login = (userData) => {
    setUser(userData);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    isLoading,
    isInitialized,
    logout,
    login,
    refetch: fetchUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
