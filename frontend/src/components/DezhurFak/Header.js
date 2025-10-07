import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const username = user?.username || '';

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserLogo = (username) => {
    if (!username) return null;

    const trimmed = username.trim();

    if (trimmed === 'Дежурный по СПО') {
      return require('../../pages/Logos/СПО.png');
    }

    const match = trimmed.match(/^Дежурный по (\d) факультету$/);
    if (match) {
      const facultyNumber = match[1];
      return require(`../../pages/Logos/${facultyNumber}фак.png`);
    }

    return require('../../pages/Logos/default.png');
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-20 flex justify-between items-center bg-white/10 text-white p-4 rounded-2xl shadow backdrop-blur-md border border-sky-200/30">
      <div className="header-left">
        <img
          src={require('../../pages/Эмблема Академии Можайского.svg.png')}
          alt="Эмблема ВКА"
          className="header-emblem"
        />
        <h1 className="header-title">{username || 'Пользователь'}</h1>
      </div>

      <div className="header-right">
        <button
          onClick={handleLogout}
          className="logout-button"
          title="Выйти из аккаунта"
        >
          <svg className="logout-icon" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
        <img
          src={getUserLogo(username)}
          alt="Герб факультета"
          className="faculty-logo"
        />
      </div>
    </header>
  );
};

export default React.memo(Header);