import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/DezhurFak/Header';
import './DezhurAkad.css';

const FACULTIES = [
  { id: 0, name: 'Общий' },
  ...Array.from({ length: 9 }, (_, i) => ({ id: i + 1, name: `${i + 1} Факультет` })),
  { id: 10, name: 'СПО' },
  { id: 11, name: 'Спец Факультет' },
];

const COURSES = Array.from({ length: 5 }, (_, i) => i + 1);

const DezhurAkad = () => {
  const { logout } = useAuth();
  const [currentFaculty, setCurrentFaculty] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [facultiesData, setFacultiesData] = useState({});
  const [totalStudents, setTotalStudents] = useState({});
  const [coursesInfo, setCoursesInfo] = useState([]);
  const [allPersons, setAllPersons] = useState([]); // Все персоны
  const [filteredPersons, setFilteredPersons] = useState([]); // Персоны текущего курса
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);

  // Функция определения факультета
  const getFacultyId = (name) => {
    if (!name) return 0;
    const nameStr = String(name).trim();

    if (nameStr.startsWith('СФ')) return 11;
    if (nameStr.startsWith('СПО') || ['Повар', 'Сварщик', 'Электрик'].some(w => nameStr.includes(w))) return 10;

    const firstDigit = parseInt(nameStr[0]);
    if (!isNaN(firstDigit)) {
      if (firstDigit === 6 && nameStr.length > 1) {
        const secondDigit = parseInt(nameStr[1]);
        if (!isNaN(secondDigit)) return 6;
      }
      if (firstDigit >= 1 && firstDigit <= 9) return firstDigit;
    }
    return 0;
  };

  // Загрузка всех данных
  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Токен отсутствует');

      // Загрузка курсов
      const coursesResponse = await axios.get('http://localhost:8000/api/kurses/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Загрузка всех персон
      const personsResponse = await axios.get('http://localhost:8000/api/persons/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { groupedData, studentCounts, coursesInfo } = processData(coursesResponse.data);

      setFacultiesData(groupedData);
      setTotalStudents(studentCounts);
      setCoursesInfo(coursesInfo);
      setAllPersons(personsResponse.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setIsLoading(false);
    }
  };

  // Группировка данных курсов
  const processData = (data) => {
    const result = {};
    const counts = {};
    const info = [];

    FACULTIES.forEach(f => {
      if (f.id !== 0) {
        result[f.id] = {};
        counts[f.id] = {};
        COURSES.forEach(c => {
          result[f.id][c] = [];
          counts[f.id][c] = 0;
        });
      }
    });

    data.forEach(item => {
      const facultyId = getFacultyId(item.name_kurs);
      let courseNum = item.number_of_kurs;

      if (facultyId === 6 && String(item.name_kurs).startsWith('6')) {
        const num = parseInt(item.name_kurs[1]);
        if (!isNaN(num) && num >= 1 && num <= 5) courseNum = num;
      }

      if (facultyId > 0 && facultyId <= 11 && courseNum >= 1 && courseNum <= 5) {
        const record = {
          ...item,
          reason: item.n ? 'наряд' :
                 item.k ? 'командировка' :
                 item.o ? 'отпуск' :
                 item.b ? 'болен' :
                 item.y ? 'увольнение' : 'прочее'
        };

        result[facultyId][courseNum].push(record);
        counts[facultyId][courseNum] += item.p_s || 0;

        if (!info.some(c => c.facultyId === facultyId && c.courseNumber === courseNum)) {
          info.push({
            facultyId,
            courseNumber: courseNum,
            name: facultyId === 10 && courseNum <= 3
              ? `${courseNum} курс СПО `
              : facultyId === 6
                ? `6${courseNum} курс`
                : `${item.name_kurs || courseNum} курс`,
            kursId: item.id // Сохраняем ID курса для фильтрации персон
          });
        }
      }
    });

    return { groupedData: result, studentCounts: counts, coursesInfo: info };
  };

  // Фильтрация персон по выбранному курсу
  useEffect(() => {
    if (selectedCourse && coursesInfo.length > 0 && allPersons.length > 0) {
      const courseInfo = coursesInfo.find(c =>
        c.facultyId === currentFaculty && c.courseNumber === selectedCourse
      );

      if (courseInfo) {
        const filtered = allPersons.filter(person =>
          person.Kurses && person.Kurses.id === courseInfo.kursId
        );
        setFilteredPersons(filtered);
      }
    } else {
      setFilteredPersons([]);
    }
  }, [selectedCourse, currentFaculty, coursesInfo, allPersons]);

  useEffect(() => { fetchAllData(); }, []);

  // Компонент таблицы
  const StatsTable = () => {
    const getCurrentData = () => {
      if (selectedCourse) {
        const data = facultiesData[currentFaculty]?.[selectedCourse] || [];
        const total = totalStudents[currentFaculty]?.[selectedCourse] || 0;

        return {
          title: coursesInfo.find(c =>
            c.facultyId === currentFaculty && c.courseNumber === selectedCourse
          )?.name || `${selectedCourse} курс`,
          stats: [{
            total,
            present: total - data.length,
            duty: data.filter(d => d.reason === 'наряд').length,
            trip: data.filter(d => d.reason === 'командировка').length,
            vacation: data.filter(d => d.reason === 'отпуск').length,
            sick: data.filter(d => d.reason === 'болен').length,
            dismissal: data.filter(d => d.reason === 'увольнение').length,
            other: data.filter(d => d.reason === 'прочее').length,
            details: data
          }],
          isDetailed: true
        };
      }

      if (currentFaculty === 0) {
        return {
          stats: FACULTIES.filter(f => f.id !== 0).map(f => {
            const facultyData = Object.values(facultiesData[f.id] || {}).flat();
            const facultyTotal = Object.values(totalStudents[f.id] || {}).reduce((a, b) => a + b, 0);

            return {
              faculty: f.id,
              total: facultyTotal,
              present: facultyTotal - facultyData.length,
              duty: facultyData.filter(d => d.reason === 'наряд').length,
              trip: facultyData.filter(d => d.reason === 'командировка').length,
              vacation: facultyData.filter(d => d.reason === 'отпуск').length,
              sick: facultyData.filter(d => d.reason === 'болен').length,
              dismissal: facultyData.filter(d => d.reason === 'увольнение').length,
              other: facultyData.filter(d => d.reason === 'прочее').length
            };
          }),
          isDetailed: false
        };
      }

      return {
        title: FACULTIES.find(f => f.id === currentFaculty)?.name,
        stats: COURSES.map(c => {
          const courseData = facultiesData[currentFaculty]?.[c] || [];
          const courseTotal = totalStudents[currentFaculty]?.[c] || 0;

          return {
            course: c,
            total: courseTotal,
            present: courseTotal - courseData.length,
            duty: courseData.filter(d => d.reason === 'наряд').length,
            trip: courseData.filter(d => d.reason === 'командировка').length,
            vacation: courseData.filter(d => d.reason === 'отпуск').length,
            sick: courseData.filter(d => d.reason === 'болен').length,
            dismissal: courseData.filter(d => d.reason === 'увольнение').length,
            other: courseData.filter(d => d.reason === 'прочее').length
          };
        }),
        isDetailed: false
      };
    };

    const { title, stats, isDetailed } = getCurrentData();
    const total = stats.reduce((acc, s) => ({
      total: acc.total + s.total,
      present: acc.present + s.present,
      duty: acc.duty + s.duty,
      trip: acc.trip + s.trip,
      vacation: acc.vacation + s.vacation,
      sick: acc.sick + s.sick,
      dismissal: acc.dismissal + s.dismissal,
      other: acc.other + s.other
    }), { total: 0, present: 0, duty: 0, trip: 0, vacation: 0, sick: 0, dismissal: 0, other: 0 });

    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">{title}</h2>

          {currentFaculty !== 0 && !isDetailed && (
            <div className="flex gap-2 flex-wrap">
              {COURSES.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCourse(c)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition hover:scale-105 active:scale-95 active:bg-gray-300 bg-gray-200"
                >
                  {coursesInfo.find(ci =>
                    ci.facultyId === currentFaculty && ci.courseNumber === c
                  )?.name || `${c} курс`}
                </button>
              ))}
            </div>
          )}

          {isDetailed && (
            <button
              onClick={() => setSelectedCourse(null)}
              className='px-6 py-1 rounded-xl font-semibold  transition-all transform hover:scale-105 active:scale-95 active:bg-gray-300 bg-gray-200'
            >
              Назад к курсам
            </button>
          )}
        </div>
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 mb-4 shadow-inner">
          <div className="grid grid-cols-8 gap-0.5 text-white font-bold text-l">
            {['Факультет', 'По списку', 'На лицо', 'Наряд', 'Командировка', 'Отпуск', 'Болен', 'Увольнение'].map(header => (
                <div key={header} className="p-3 bg-blue-800 rounded-lg text-center shadow-md">{header}</div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-8 gap-1 text-sm">
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`p-2 ${i % 2 ? 'bg-gray-50' : 'bg-white'}`}>
                {currentFaculty === 0 ? FACULTIES.find(f => f.id === s.faculty)?.name :
                 isDetailed ? title : `${s.course} курс`}
              </div>
              {['total', 'present', 'duty', 'trip', 'vacation', 'sick', 'dismissal'].map(f => (
                <div key={f} className={`p-2 ${i % 2 ? 'bg-gray-50' : 'bg-white'}`}>
                  {s[f]}
                </div>
              ))}
            </React.Fragment>
          ))}

          <div className="p-2 font-bold bg-blue-50">Итого</div>
          {['total', 'present', 'duty', 'trip', 'vacation', 'sick', 'dismissal'].map(f => (
            <div key={f} className="p-2 font-bold bg-blue-50">{total[f]}</div>
          ))}
        </div>

        {/* Отображение персон текущего курса */}
        {isDetailed && filteredPersons.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Список персонала курса:</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border">Звание</th>
                    <th className="py-2 px-4 border">ФИО</th>
                    <th className="py-2 px-4 border">Назначение</th>
                    <th className="py-2 px-4 border">Причина</th>
                    <th className="py-2 px-4 border">Дата отсутствия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersons.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{person.rank}</td>
                      <td className="py-2 px-4 border">{person.name}</td>
                      <td className="py-2 px-4 border">{person.destination}</td>
                      <td className="py-2 px-4 border">{person.reason}</td>
                      <td className="py-2 px-4 border">{person.absenceTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Стили и рендеринг
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '7rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      background: 'linear-gradient(to bottom right, #0f0c29, #302b63, #24243e)'
    },
    cosmicBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    starsLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'><circle cx=\'20\' cy=\'20\' r=\'1\' fill=\'white\' opacity=\'0.6\'/><circle cx=\'50\' cy=\'50\' r=\'1\' fill=\'white\' opacity=\'0.6\'/><circle cx=\'80\' cy=\'30\' r=\'1\' fill=\'white\' opacity=\'0.6\'/><circle cx=\'30\' cy=\'80\' r=\'1\' fill=\'white\' opacity=\'0.6\'/><circle cx=\'70\' cy=\'70\' r=\'1\' fill=\'white\' opacity=\'0.6\'/></svg>")',
      backgroundSize: '200px 200px',
      opacity: 0.8
    },
    nebulaLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 30% 30%, rgba(94, 53, 177, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(233, 30, 99, 0.2) 0%, transparent 50%)'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '80rem'
    },
    tableContainer: {
      marginTop: '1rem',
      width: '100%',
      background: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)',
      borderRadius: '1.5rem',
      padding: '1rem',
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'scale(1.01)',
        boxShadow: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.1)'
      }
    },
    noData: {
      textAlign: 'center',
      color: '#6b7280',
      padding: '1rem',
      background: '#e5e7eb',
      borderRadius: '0.75rem',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container} className="flex items-center justify-center text-white">
        <div className="text-center">
          <div className="spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
          <p>Загрузка данных по академии...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.cosmicBg}>
        <div style={styles.starsLayer} />
        <div style={styles.nebulaLayer} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </div>
      <div style={styles.content}>
        <Header />
        <div style={{ marginTop: '2rem' }}>

            <div className="flex flex-wrap justify-center gap-3 bg-white p-4 rounded-xl shadow-md mb-6">
              {FACULTIES.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setCurrentFaculty(f.id);
                    setSelectedCourse(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentFaculty === f.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
        </div>

        <StatsTable />
      </div>
    </div>
  );
};

export default DezhurAkad;