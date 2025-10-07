import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, error } = useUser();

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

  if (error || !user) return <Navigate to="/" replace />;

  if (requiredRole && !user[requiredRole]) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;