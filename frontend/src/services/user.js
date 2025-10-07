// src/services/user.js
import api from './api';

export const fetchUserStatus = async () => {
  try {
    const response = await api.get('/user-status/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статуса пользователя:', error);
    throw error;
  }
};
