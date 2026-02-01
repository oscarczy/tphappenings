import { createContext, useContext, useState, useEffect } from 'react';
import {API_URL} from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, userType) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Invalid email or password');
      }

      const foundUser = await response.json();

      const userData = {
        id: foundUser.id || foundUser._id, 
        email: foundUser.email,
        name: foundUser.name,
        userType: foundUser.userType,
        adminNo: foundUser.adminNo, 
        course: foundUser.course,
        yearOfStudy: foundUser.yearOfStudy
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const isStudent = () => user?.userType === 'student';
  const isOrganiser = () => user?.userType === 'organiser';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isStudent, isOrganiser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};