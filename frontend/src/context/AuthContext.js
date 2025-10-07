import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout, refreshToken } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Проверка и установка юзера при загрузке
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          setUser(decoded);  // Токен валиден, установим пользователя
        } else {
          handleLogout(); // Токен истёк
        }
      } catch (e) {
        console.error('Invalid token', e);
        handleLogout();
      }
    }
  }, []);

  // Обновление access токена, если это необходимо
  useEffect(() => {
    const interval = setInterval(async () => {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const data = await refreshToken(refresh);
          localStorage.setItem('access_token', data.access);
          setUser(jwtDecode(data.access));
        } catch (err) {
          console.error('Failed to refresh token', err);
          handleLogout(); // Если обновление токена не удалось
        }
      }
    }, 5 * 60 * 1000); // Обновление каждые 5 минут

    return () => clearInterval(interval);
  }, []);

  // Логика входа
  const handleLogin = async (username, password) => {
    try {
      const data = await apiLogin(username, password);  // Получение данных с сервера
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setUser(jwtDecode(data.access));  // Декодируем access токен и устанавливаем пользователя
    } catch (err) {
      console.error('Login failed', err);
      throw err;  // Прокидываем ошибку, чтобы она была обработана на уровне компонента
    }
  };

  // Логика выхода
  const handleLogout = () => {
    apiLogout();  // Оповещаем сервер о выходе, если необходимо
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);  // Очистка данных пользователя
  };

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
