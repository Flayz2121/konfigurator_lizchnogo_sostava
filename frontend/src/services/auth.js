import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/token/', { username, password });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Получаем доп. информацию о пользователе с сервера
    const user = await fetchUserProfile();

    return { access, refresh, user };
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    return await fetchUserProfile();
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('Refresh token is missing');

  try {
    const response = await api.post('/token/refresh/', { refresh });
    const { access } = response.data;

    localStorage.setItem('access_token', access);

    // Получаем обновлённую информацию о пользователе
    const user = await fetchUserProfile();

    return { access, user };
  } catch (error) {
    console.error('Refresh token error', error);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    console.warn('Нет access_token в localStorage');
    throw new Error('Access token is missing');
  }

  const response = await api.get('/user-status/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const user = response.data;
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};
