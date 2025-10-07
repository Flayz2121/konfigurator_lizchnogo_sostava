import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useUser } from '../hooks/useUser';


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const {  loading } = useUser();


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

  return user ? children : <Navigate to="/" replace />;

};



export default PrivateRoute;