import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';  // Важно импортировать функции из API, чтобы получать данные

const useAuth = () => {
  const [user, setUser] = useState(null); // Значение по умолчанию — null
  const [loading, setLoading] = useState(true);  // Состояние загрузки

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setLoading(false);  // Если нет токена, сразу прекращаем загрузку
      return;
    }

    // Получаем информацию о пользователе
    getCurrentUser()
      .then((userData) => {
        setUser(userData);  // Устанавливаем данные пользователя
      })
      .catch(() => {
        setUser(null); // Если ошибка — сбрасываем user
        localStorage.removeItem('access_token');  // Удаляем токен, если ошибка
      })
      .finally(() => {
        setLoading(false); // Загружаем завершение
      });
  }, []); // Запускать при монтировании компонента

  return { user, loading }; // Возвращаем user и loading
};

export default useAuth;
