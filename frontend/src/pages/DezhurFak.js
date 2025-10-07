import React, { useState, useReducer, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/DezhurFak/Header';
import StatsTable from '../components/DezhurFak/StatsTable';
import AddForm from '../components/DezhurFak/AddForm';
import TableHeader from '../components/DezhurFak/TableHeader';
import DataRow from '../components/DezhurFak/DataRow';
import { saveToLocalStorage, validateEntry } from '../components/DezhurFak/utils';
import './DezhurFak.css';

const DezhurFak = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentCourse, setCurrentCourse] = useState(0);
  const [newEntry, setNewEntry] = useState({ rank: '', name: '', destination: '', reason: '', absenceTime: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingRow, setEditingRow] = useState({});
  const canvasRef = useRef(null);

  const initialData = {
    coursesData: { 1: [], 2: [], 3: [], 4: [], 5: [] },
    totalStudents: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  const dataReducer = (state, action) => {
    switch (action.type) {
      case 'SET_COURSES':
        return { ...state, coursesData: action.payload };
      case 'SET_STUDENTS':
        return { ...state, totalStudents: action.payload };
      default:
        return state;
    }
  };

  const [data, dispatch] = useReducer(dataReducer, initialData);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        console.error('Токен отсутствует. Пожалуйста, войдите в систему.');
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.user_id;

      const response = await axios.get('http://localhost:8000/api/persons/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Данные с сервера:', response.data);

      const filteredCourses = response.data.filter(item => String(item.user_id) === String(userId));
      console.log('Отфильтрованные данные по пользователю:', filteredCourses);

      const groupedByCourse = filteredCourses.reduce((acc, person) => {
        const course = person.Kurses.number_of_kurs;
        if (!acc[course]) acc[course] = [];
        acc[course].push(person);
        return acc;
      }, { 1: [], 2: [], 3: [], 4: [], 5: [] });

      dispatch({ type: 'SET_COURSES', payload: groupedByCourse });
      console.log('Данные распределены по курсам:', groupedByCourse);

      const totals = {};
      Object.keys(groupedByCourse).forEach(course => {
        totals[course] = groupedByCourse[course].length;
      });
      dispatch({ type: 'SET_STUDENTS', payload: totals });
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allData = useMemo(() => {
    return Object.entries(data.coursesData)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .flatMap(([course, records]) =>
        Array.isArray(records)
          ? records
              .slice()
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
              .map(record => ({ ...record, course: parseInt(course) }))
          : []
      );
  }, [data.coursesData]);

  const currentData = currentCourse === 0 ? allData : (data.coursesData[currentCourse] || []);

  useEffect(() => {
    saveToLocalStorage('coursesData', data.coursesData);
    console.log('Данные сохранены в localStorage:', data.coursesData);
  }, [data.coursesData]);

  useEffect(() => {
    saveToLocalStorage('totalStudents', data.totalStudents);
    console.log('Количество студентов сохранено:', data.totalStudents);
  }, [data.totalStudents]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log('Пользователь вышел из системы');
  };

  const handleChange = (e) => {
    setNewEntry(prev => ({ ...prev, [e.target.name]: e.target.value }));
    console.log('Изменено поле формы добавления:', e.target.name, e.target.value);
  };

  const handleEditChange = (e) => {
    setEditingRow(prev => ({ ...prev, [e.target.name]: e.target.value }));
    console.log('Изменено поле редактирования:', e.target.name, e.target.value);
  };

const handleAdd = async () => {
  if (!validateEntry(newEntry) || currentCourse === 0) {
    if (currentCourse === 0) alert('Добавление возможно только в конкретный курс');
    return;
  }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Токен не найден');

      const decoded = jwtDecode(token);
      const userId = decoded.user_id;

      const courseObjects = Object.values(data.coursesData).flat();

      const anyPersonInCourse = courseObjects.find(
        p => p.Kurses?.number_of_kurs === currentCourse
      );

      let kursId, numberOfKurs;

      if (anyPersonInCourse) {
        kursId = anyPersonInCourse.Kurses.id;
        numberOfKurs = anyPersonInCourse.Kurses.number_of_kurs;
      } else {
        // Получаем курсы только текущего пользователя
        const kursResponse = await axios.get('http://localhost:8000/api/kurses/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Фильтруем курсы по user_id
        const userCourses = kursResponse.data.filter(k => String(k.user_id) === String(userId));
        console.log('Курсы текущего пользователя:', userCourses);

        const matchedCourse = userCourses.find(k => k.number_of_kurs === currentCourse);

        if (!matchedCourse) {
          alert('Ошибка: Курс с таким номером не найден у пользователя');
          return;
        }

        kursId = matchedCourse.id;
        numberOfKurs = matchedCourse.number_of_kurs;
      }

      const payload = {
        ...newEntry,
        user_id: userId,
        Kurses: {
          id: kursId,
          number_of_kurs: numberOfKurs
        }
      };

      console.log('Отправка на сервер:', payload);

      const response = await axios.post('http://localhost:8000/api/persons/', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const addedPerson = response.data;

      const updatedCourse = [
        ...(data.coursesData[currentCourse] || []),
        { ...addedPerson, course: currentCourse }
      ].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      dispatch({
        type: 'SET_COURSES',
        payload: { ...data.coursesData, [currentCourse]: updatedCourse }
      });

      setNewEntry({ rank: '', name: '', destination: '', reason: '', absenceTime: '' });
    } catch (error) {
      console.error('Ошибка при добавлении:', error);
      alert('Ошибка при добавлении: ' + JSON.stringify(error.response?.data || error.message, null, 2));
    }
  };



  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditingRow({ ...row });
    console.log('Редактирование записи:', row);
  };

const handleSave = async (id) => {
  if (!validateEntry(editingRow)) return;

  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Токен не найден');

    const response = await axios.patch(
      `http://localhost:8000/api/persons/${id}/`,
      editingRow,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const updatedPerson = response.data;
    const course = currentCourse === 0 ? updatedPerson.Kurses.number_of_kurs : currentCourse;

    const updatedRows = (data.coursesData[course] || [])
      .map(item => item.id === id ? { ...item, ...updatedPerson } : item)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    dispatch({
      type: 'SET_COURSES',
      payload: { ...data.coursesData, [course]: updatedRows }
    });

    console.log('Обновлена запись на сервере и в состоянии:', updatedPerson);

    setEditingId(null);
    setEditingRow({});
  } catch (error) {
    console.error('Ошибка при обновлении записи:', error);
    alert('Ошибка при сохранении: ' + JSON.stringify(error.response?.data || error.message, null, 2));
  }
};


  const handleCancel = () => {
    setEditingId(null);
    setEditingRow({});
    console.log('Редактирование отменено');
  };

const handleDelete = async (id) => {
  if (!window.confirm('Удалить эту запись?')) return;

  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Токен не найден');

    await axios.delete(`http://localhost:8000/api/persons/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Определяем, в каком курсе была эта запись
    const course = currentCourse === 0
      ? Object.keys(data.coursesData).find(c =>
          data.coursesData[c]?.some(r => r.id === id)
        )
      : currentCourse;

    if (!course) {
      console.warn('Не удалось определить курс для удаления записи.');
      return;
    }

    const updatedCourse = data.coursesData[course].filter(item => item.id !== id);

    dispatch({
      type: 'SET_COURSES',
      payload: {
        ...data.coursesData,
        [course]: updatedCourse
      }
    });

    console.log('Запись удалена с сервера и из состояния:', id);
  } catch (error) {
    console.error('Ошибка при удалении записи:', error);
    alert('Ошибка при удалении: ' + JSON.stringify(error.response?.data || error.message, null, 2));
  }
};


  const handleCourseSelect = (course) => {
    setCurrentCourse(course);
  };

  if (!isLoggedIn) {
    return <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#4b5563',
      background: '#1f2937',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    }}>Вы вышли из системы</div>;
  }

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

  return (
    <div style={styles.container}>
      <div style={styles.cosmicBg}>
        <div style={styles.starsLayer} />
        <div style={styles.nebulaLayer} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </div>
      <div style={styles.content}>
        <Header onLogout={handleLogout} />
        <div style={{ marginTop: '2rem' }}>
          {/* общая таблица по курсам на основной странице дежфака */}
          <StatsTable
            selectedCourse={currentCourse}
            onCourseSelect={handleCourseSelect}
          />
          {currentCourse !== 0 && (
            <AddForm
              newEntry={newEntry}
              onChange={handleChange}
              onAdd={handleAdd}
              className="bg-white rounded-xl shadow-md p-4 mb-6"
            />
          )}
          <div style={styles.tableContainer}> {/* общая таблица с курсантами на основной странице дежфака */}
            <TableHeader isGeneral={currentCourse === 0} />
            <div style={{ marginTop: '0.5rem' }}>
              {currentData.length > 0 ? currentData.map((row, index) => (
                <DataRow
                  key={row.id}
                  row={row}
                  index={index}
                  editingId={editingId}
                  editingRow={editingRow}
                  onEditChange={handleEditChange}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  isGeneral={currentCourse === 0}
                  className="cursor-pointer hover:bg-gray-100 rounded-md p-2"
                />
              )) : (
                <div style={styles.noData}>Нет данных</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DezhurFak;