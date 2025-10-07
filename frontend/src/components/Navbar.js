import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Подключим стили

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {user && (
          <>
            {user.is_superuser && (
              <li>
                <Link to="/admin">Вернуться в админку</Link>
              </li>
            )}
            <li>
               <Link onClick={logout} to="/">Выход</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
