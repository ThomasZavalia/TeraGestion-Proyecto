
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

 
const login = async (username, password) => {
  try {
    const data = await authService.login(username, password);
    
   
    if (data.token && data.user) {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } else {
    
      return { 
        success: false, 
        message: 'Respuesta inválida del servidor' 
      };
    }

  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
    return {
      success: false,
      message: errorMessage,
    };
  }
};

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};