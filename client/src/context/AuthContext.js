import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/signin', {
        username,
        password
      });
      
      // Store user in localStorage
      if (response.data.accessToken) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const register = async (username, email, password, firstName, lastName) => {
    try {
      const response = await axios.post('/api/auth/signup', {
        username,
        email,
        password,
        firstName,
        lastName
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const isAuthenticated = () => {
    return !!currentUser;
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Auth context value
  const value = {
    currentUser,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;