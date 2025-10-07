import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const StatsTable = ({ selectedCourse, onCourseSelect }) => {
  const [coursesData, setCoursesData] = useState({});
  const [totalStudents, setTotalStudents] = useState({});
  const [courses, setCourses] = useState([]);
  const [editingStats, setEditingStats] = useState({});
  const [courseIdMap, setCourseIdMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getReasonFromItem = (item) => {
    if (Number(item.n) > 0) return 'наряд';
    if (Number(item.k) > 0) return 'командировка';
    if (Number(item.o) > 0) return 'отпуск';
    if (Number(item.b) > 0) return 'болен';
    if (Number(item.y) > 0) return 'увольнение';
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Токен отсутствует. Пожалуйста, войдите в систему.');
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded.user_id;

      const response = await axios.get('http://localhost:8000/api/kurses/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const filteredCourses = response.data.filter(item => String(item.user_id) === String(userId));

      const grouped = {};
      const totals = {};
      const idMap = {};

      filteredCourses.forEach(item => {
        const kurs = item.number_of_kurs;
        if (!grouped[kurs]) grouped[kurs] = [];
        grouped[kurs].push({
          reason: getReasonFromItem(item),
          name: item.name_kurs,
          id: item.id,
          p_s: item.p_s,
          n_l: item.n_l,
          b: item.b,
          n: item.n,
          y: item.y,
          k: item.k,
          o: item.o,
          number_of_kurs: item.number_of_kurs
        });

        if (!totals[kurs]) totals[kurs] = item.p_s;
        if (!idMap[kurs]) idMap[kurs] = item.id;
      });

      setCourseIdMap(idMap);
      setCoursesData(grouped);
      setTotalStudents(totals);

      const coursesArray = Array.from({ length: 5 }, (_, i) => i + 1).map(kurs => ({
        id: idMap[kurs] || `course-${kurs}`,
        name: grouped[kurs]?.[0]?.name ? `${grouped[kurs][0].name} курс` : `${kurs} курс`,
        number: kurs
      }));
      setCourses(coursesArray);
    } catch (error) {
      setError('Не удалось загрузить данные. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (courseId, field, value) => {
    setEditingStats(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: Number(value)
      }
    }));
  };

  const saveStats = async (courseId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return alert('Токен отсутствует');

      const edited = editingStats[courseId];
      if (!edited) return alert('Нет данных для редактирования');

      let originalDataEntry = null;
      for (const kurs in coursesData) {
        const found = coursesData[kurs].find(item => item.id === courseId);
        if (found) {
          originalDataEntry = found;
          break;
        }
      }

      if (!originalDataEntry) return alert('Курс не найден');

      const { name, id, number_of_kurs } = originalDataEntry;

      const payload = {
        id,
        user_id: jwtDecode(token).user_id,
        name_kurs: name,
        number_of_kurs: number_of_kurs,
        p_s: (edited.total ?? originalDataEntry.p_s) || 0,
        n_l: (edited.present ?? originalDataEntry.n_l) || 0,
        b: (edited.sick ?? originalDataEntry.b) || 0,
        n: (edited.duty ?? originalDataEntry.n) || 0,
        y: (edited.dismissal ?? originalDataEntry.y) || 0,
        k: (edited.trip ?? originalDataEntry.k) || 0,
        o: (edited.vacation ?? originalDataEntry.o) || 0
      };

      await axios.put(`http://localhost:8000/api/kurses/${courseId}/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setEditingStats(prev => ({ ...prev, [courseId]: {} }));
      alert('Данные сохранены');
      await fetchData();
    } catch (error) {
      alert('Ошибка при сохранении');
    }
  };

  const calculateStats = (courseData, courseNumber) => {
    const record = courseData[0] || {};
    const total = record.p_s ?? totalStudents[courseNumber] ?? 0;
    const present = record.n_l ?? (total - courseData.length);
    return {
      total,
      present,
      duty: record.n || 0,
      trip: record.k || 0,
      vacation: record.o || 0,
      sick: record.b || 0,
      dismissal: record.y || 0,
    };
  };

  const allStats = selectedCourse === 0
    ? Object.keys(coursesData).map(courseNumber => ({
        ...calculateStats(coursesData[courseNumber] || [], courseNumber),
        courseNumber: parseInt(courseNumber),
        courseId: courseIdMap[courseNumber] || `course-${courseNumber}`
      }))
    : [{
        ...calculateStats(coursesData[selectedCourse] || [], selectedCourse),
        courseNumber: selectedCourse,
        courseId: courseIdMap[selectedCourse] || `course-${selectedCourse}`
      }];

  const totalRow = allStats.reduce((acc, curr) => {
    acc.total += curr.total || 0;
    acc.present += curr.present || 0;
    acc.duty += curr.duty || 0;
    acc.trip += curr.trip || 0;
    acc.vacation += curr.vacation || 0;
    acc.sick += curr.sick || 0;
    acc.dismissal += curr.dismissal || 0;
    return acc;
  }, {
    total: 0,
    present: 0,
    duty: 0,
    trip: 0,
    vacation: 0,
    sick: 0,
    dismissal: 0,
  });

  if (isLoading) return <div className="text-gray-700 text-center text-lg">Загрузка...</div>;
  if (error) return <div className="text-red-500 text-center text-lg">{error}</div>;

  return (
    <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-2xl p-6 mb-8 border border-gray-200 transform transition-all hover:shadow-xl">
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => onCourseSelect(0)}
          className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
            selectedCourse === 0
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Все курсы
        </button>
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => onCourseSelect(course.number)}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
              selectedCourse === course.number
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {course.name}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 mb-4 shadow-inner">
        <div className="grid grid-cols-8 gap-0.5 text-white font-bold text-l">
          {['Курс', 'По списку', 'На лицо', 'Наряд', 'Командировка', 'Отпуск', 'Болен', 'Увольнение'].map(header => (
            <div key={header} className="p-3 bg-blue-800 rounded-lg text-center shadow-md">{header}</div>
          ))}
        </div>
      </div>

      {allStats.length > 0 ? (
        <>
          {allStats.map(stat => {
            const courseName = courses.find(course => course.number === stat.courseNumber)?.name || `${stat.courseNumber} курс`;
            return (
              <div key={stat.courseId} className="grid grid-cols-8 gap-2 p-2 border-t border-gray-300 hover:bg-gray-50 transition-colors">
                <div
                  className={`p-3 text-center text-gray-800 font-medium ${
                    selectedCourse === 0
                      ? 'border border-gray-300 rounded-lg bg-white shadow-sm'
                      : 'border border-gray-300 rounded-lg bg-white shadow-sm flex items-center justify-center'
                  }`}
                >
                  <span className="font-bold text-xl" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {courseName}
                  </span>
                </div>
                {['total', 'present', 'duty', 'trip', 'vacation', 'sick', 'dismissal'].map(field => (
                  <div key={field} className="p-3 border border-gray-300 rounded-lg text-center bg-white shadow-sm">
                    {selectedCourse !== 0 ? (
                      <input
                        type="number"
                        value={editingStats[stat.courseId]?.[field] ?? stat[field]}
                        onChange={(e) => handleInputChange(stat.courseId, field, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all input-field"
                      />
                    ) : (
                      <span className="text-gray-700 font-semibold">{stat[field]}</span>
                    )}
                  </div>
                ))}
                {selectedCourse !== 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => saveStats(stat.courseId)}
                      className={`
                        w-full py-3 rounded-lg font-semibold text-white
                        transition-all duration-200 ease-in-out
                        flex items-center justify-center gap-2
                        ${isLoading
                          ? 'bg-blue-500/80 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                        }
                      `}
                    >
                      Сохранить
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {selectedCourse === 0 && (
            <div className="grid grid-cols-8 gap-2 font-bold p-4 mt-4 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 shadow-inner">
              <div className="text-center text-gray-800">Итого</div>
              <div className="text-center text-gray-800">{totalRow.total}</div>
              <div className="text-center text-gray-800">{totalRow.present}</div>
              <div className="text-center text-gray-800">{totalRow.duty}</div>
              <div className="text-center text-gray-800">{totalRow.trip}</div>
              <div className="text-center text-gray-800">{totalRow.vacation}</div>
              <div className="text-center text-gray-800">{totalRow.sick}</div>
              <div className="text-center text-gray-800">{totalRow.dismissal}</div>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg shadow-inner mt-4">Нет данных для отображения</div>
      )}
    </div>
  );
};

export default StatsTable;