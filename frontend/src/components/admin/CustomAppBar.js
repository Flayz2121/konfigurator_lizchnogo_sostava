import { AppBar, TitlePortal } from 'react-admin';
import { Button, Toolbar, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const CustomAppBar = (props) => {
  const navigate = useNavigate();
  const { logout } = useAuth();


  const handleLogout = () => {
    logout(); // Вызываем logout для очистки данных
    navigate('/', { replace: true }); // Явно перенаправляем на /login
  };

  return (
    <AppBar {...props}>
      <Toolbar>
        <TitlePortal />
        <Typography variant="h6" sx={{ flex: 1 }}>
          Панель администратора
        </Typography>
        <Button
          color="inherit"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/DezhurAkad', { replace: true })}
          sx={{ mr: 2 }}
        >
          На главную
        </Button>
        <Button
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Выйти
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;