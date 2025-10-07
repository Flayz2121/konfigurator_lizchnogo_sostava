import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [usernames, setUsernames] = useState([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  // Custom sorting
  const sortUsernames = (usernamesList) => {
    return usernamesList.sort((a, b) => {
      const getOrder = (name) => {
        if (name === 'Дежурный по академии') return 0;
        const match = name.match(/^Дежурный по (\d) факультету$/);
        if (match) return parseInt(match[1]);
        if (name === 'Дежурный по Спец Факультету') return 10;
        if (name === 'Дежурный по СПО') return 11;
        if (name === 'admin') return 12;
        return 100;
      };
      return getOrder(a) - getOrder(b);
    });
  };

  // Fetch usernames
  useEffect(() => {
    const fetchUsernames = async () => {
      setIsFetchingUsers(true);
      try {
        const response = await axios.get('http://localhost:8000/api/users/');
        const users = response.data;
        const usernamesList = users.map((user) => user.username);
        const sortedUsernames = sortUsernames(usernamesList);
        setUsernames(sortedUsernames);
        if (sortedUsernames.length > 0) {
          setUsername(sortedUsernames[0]);
        }
      } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
        setError('Не удалось загрузить список пользователей.');
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsernames();
  }, []);

  // Background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.5,
      color: Math.random() < 0.6 ? 'rgba(255, 255, 255, ' : Math.random() < 0.8 ? 'rgba(200, 100, 100, ' : 'rgba(150, 50, 50, ',
      twinklePhase: Math.random() * 2 * Math.PI,
      twinkleSpeed: Math.random() * 0.5 + 0.5,
    }));

    const nebulas = Array.from({ length: 3 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 150 + 100,
      color: `hsla(${Math.random() * 20 + 340}, 50%, 60%, 0.15)`,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nebulas.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

stars.forEach((star) => {
  const time = Date.now() * 0.001;
  const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase); // усиленное мерцание
  const currentOpacity = star.opacity * twinkle;
  const currentSize = star.size * (0.75 + 0.5 * twinkle); // чуть более заметное увеличение
  star.x += star.speed * 0.1;
  star.y += star.speed * 0.1;

  if (star.x < 0) star.x += canvas.width;
  if (star.x > canvas.width) star.x -= canvas.width;
  if (star.y < 0) star.y += canvas.height;
  if (star.y > canvas.height) star.y -= canvas.height;

  ctx.beginPath();
  ctx.arc(star.x, star.y, currentSize, 0, 2 * Math.PI);
  ctx.fillStyle = `${star.color}${currentOpacity})`;
  ctx.shadowBlur = 10 * twinkle;
  ctx.shadowColor = star.color + '1)';
  ctx.fill();
});


      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation for dropdown
  const handleDropdownKeyDown = (e) => {
    if (!isDropdownOpen) return;
    const items = usernames;
    const currentIndex = items.indexOf(username);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      setUsername(items[nextIndex]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      setUsername(items[prevIndex]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setIsDropdownOpen(false);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/redirect');
    } catch (err) {
      setError('Неверный пароль');
      console.error('Ошибка при авторизации:', err);
    }
  };

  const toggleDropdown = () => {
    if (!isLoading && !isFetchingUsers) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const selectUsername = (user) => {
    setUsername(user);
    setIsDropdownOpen(false);
    dropdownButtonRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 cosmic-bg">
        <div className="stars-layer"></div>
        <div className="nebula-layer"></div>
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <img
          src={require('./Эмблема Академии Можайского.svg.png')}
          alt="Эмблема ВКА"
          className="w-48 h-48 mb-8 mt-[-2rem]"
          style={{ opacity: 0.8 }}
        />
        <form
          onSubmit={handleSubmit}
          className="w-96 max-w-md rounded-2xl p-8 shadow-xl border border-gray-600/30 bg-gray-800/20 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div ref={dropdownRef}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                Логин
              </label>
              <div
                ref={dropdownButtonRef}
                tabIndex={0}
                className={`w-full px-4 py-3 bg-gray-700/50 border ${
                  isLoading || isFetchingUsers ? 'border-gray-600' : 'border-gray-600 hover:border-blue-500'
                } rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between cursor-pointer`}
                onClick={toggleDropdown}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDropdown();
                  }
                }}
                style={{
                  pointerEvents: isLoading || isFetchingUsers ? 'none' : 'auto',
                  opacity: isLoading || isFetchingUsers ? 0.5 : 1,
                }}
              >
                <span>{username || 'Выберите пользователя'}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={isDropdownOpen ? 'rotate-180' : ''}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              {isDropdownOpen && (
                <div
                  className="absolute w-96 max-w-md bg-gray-700/90 border border-gray-600 rounded-lg mt-1 z-20"
                  style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#4b5563 #374151',
                  }}
                  onKeyDown={handleDropdownKeyDown}
                >
                  {isFetchingUsers ? (
                    <div className="px-4 py-2 text-gray-100">Загрузка...</div>
                  ) : usernames.length === 0 ? (
                    <div className="px-4 py-2 text-gray-100">Нет пользователей</div>
                  ) : (
                    usernames.map((user) => (
                      <div
                        key={user}
                        className={`px-4 py-2 text-gray-100 hover:bg-gray-600 cursor-pointer ${
                          username === user ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => selectUsername(user)}
                      >
                        {user}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-500/20 border-l-4 border-red-600 text-red-200 p-4 mb-6 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading || isFetchingUsers}
              className={`
                w-full py-3 rounded-lg font-semibold text-white
                transition-all duration-200 ease-in-out
                flex items-center justify-center gap-2
                ${isLoading || isFetchingUsers
                  ? 'bg-blue-500/80 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                }
              `}
            >
              {(isLoading || isFetchingUsers) ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Загрузка...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .absolute::-webkit-scrollbar {
          width: 8px;
        }
        .absolute::-webkit-scrollbar-track {
          background: #374151;
        }
        .absolute::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default Login;