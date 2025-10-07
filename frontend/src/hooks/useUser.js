// useUser.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Для индикатора загрузки
  const [error, setError] = useState(null);      // Для обработки ошибок

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token'); // Получаем токен из localStorage
        const response = await axios.get('http://localhost:8000/api/user-status/', {
          headers: {
            'Authorization': `Bearer ${token}`,  // Добавляем токен в заголовок
          }
        });
        setUser(response.data);  // Устанавливаем данные пользователя
      } catch (err) {
        setError('Ошибка при загрузке данных пользователя'); // Обработка ошибки
        setUser(null); // При ошибке очищаем данные пользователя
      } finally {
        setLoading(false);  // Устанавливаем загрузку в false после завершения запроса
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };  // Возвращаем данные, состояние загрузки и ошибку
};
