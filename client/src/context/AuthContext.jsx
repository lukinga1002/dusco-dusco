import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dusco_token');
    if (token) {
      api.me().then(setUser).catch(() => localStorage.removeItem('dusco_token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone, password) => {
    const data = await api.login({ phone, password });
    localStorage.setItem('dusco_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (phone, name, password) => {
    const data = await api.register({ phone, name, password });
    return data;
  };

  const verifyOtp = async (phone, otp) => {
    const data = await api.verifyOtp({ phone, otp });
    localStorage.setItem('dusco_token', data.token);
    const me = await api.me();
    setUser(me);
    return me;
  };

  const logout = () => {
    localStorage.removeItem('dusco_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
