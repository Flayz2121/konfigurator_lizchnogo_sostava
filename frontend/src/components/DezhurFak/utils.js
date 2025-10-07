// utils.js

export const validateEntry = (entry) => {
  if (!entry.rank?.trim() || !entry.name?.trim() || !entry.reason) {
    alert('Пожалуйста, заполните обязательные поля: Звание, ФИО и Причина отсутствия');
    return false;
  }
  return true;
};

export const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Ошибка загрузки ${key}:`, e);
    return defaultValue;
  }
};

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Ошибка сохранения ${key}:`, e);
  }
};
