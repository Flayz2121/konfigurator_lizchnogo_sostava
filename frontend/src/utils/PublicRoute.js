import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // или твой аналог
import { Box, CircularProgress, Typography } from '@mui/material';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh', // Полная высота экрана
          backgroundColor: '#f5f5f5', // Светлый фон
        }}
      >
        <CircularProgress color="primary" size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: '#555' }}>
          Загрузка...
        </Typography>
      </Box>
    );
  }

  // Если пользователь уже залогинен — редирект на Home
  if (user) return <Navigate to="/redirect" />;

  // Иначе отображаем публичную страницу (например, /login)
  return children;
}
