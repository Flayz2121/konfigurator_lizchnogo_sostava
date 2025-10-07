Конфигуратор личного состава

🛠️ Описание проекта Конфигуратор личного состава — это приложение, предназначенное для формирования, 
редактирования и управления данными о личном составе. Оно может использоваться в учебных,
военных или корпоративных целях для моделирования структуры подразделений и назначения сотрудников.

📦 Возможности
Добавление и редактирование информации о сотрудниках

Формирование структуры подразделений

Назначение ролей и должностей

Сохранение и экспорт конфигураций

Удобный пользовательский интерфейс

🚀 Установка

git clone https://github.com/Flayz2121/konfigurator_lizchnogo_sostava.git
cd konfigurator_lizchnogo_sostava
cd backend

# Установка зависимостей 

pip install -r requirements.txt

▶️ Запуск

python main.py runserver

во втором терминале:
cd frontend
npm start

📁 Структура проекта
plaintext
konfigurator_lizchnogo_sostava/
├── .gitignore
├── README.md
├── .idea/
├── backend/
└── frontend/

🧰 Используемые технологии
Backend: Python (Django, django rest framework), PyJWT, PostgreSQL

Frontend: React(JS)
