// AddForm.js
import React, { useRef, useEffect } from 'react';
import InputField from './InputField';

const REASONS = ['Наряд', 'Командировка', 'Отпуск', 'Болен', 'Увольнение']; /*  */

const AddForm = ({ newEntry, onChange, onAdd }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentIndex = inputRefs.current.findIndex(
        (el) => el === document.activeElement
      );

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (currentIndex + 1) % inputRefs.current.length;
        inputRefs.current[next]?.focus();
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (currentIndex - 1 + inputRefs.current.length) % inputRefs.current.length;
        inputRefs.current[prev]?.focus();
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        onAdd();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onAdd]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 fade-in">
      <h2 className="font-semibold text-blue-800 mb-4">Добавить запись</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InputField
          name="rank"
          value={newEntry.rank}
          onChange={onChange}
          placeholder="Звание"
          required
          ref={el => inputRefs.current[0] = el}
        />
        <InputField
          name="name"
          value={newEntry.name}
          onChange={onChange}
          placeholder="ФИО"
          required
          ref={el => inputRefs.current[1] = el}
        />
        <InputField
          name="destination"
          value={newEntry.destination}
          onChange={onChange}
          placeholder="Место убытия"
          ref={el => inputRefs.current[2] = el}
        />
        <InputField
          name="reason"
          value={newEntry.reason}
          onChange={onChange}
          type="select"
          options={REASONS}
          required
          ref={el => inputRefs.current[3] = el}
        />
        <InputField
          name="absenceTime"
          value={newEntry.absenceTime}
          onChange={onChange}
          type="date"
          placeholder="Время отсутствия"
          ref={(el) => {
            inputRefs.current[4] = el;
            if (el) {
              el.onfocus = () => el.showPicker?.(); // автоматическое открытие календаря
            }
          }}
        />
      </div>
      <button
        onClick={onAdd}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 add-button"
      >
        Добавить
      </button>
    </div>
  );
};

export default React.memo(AddForm);
