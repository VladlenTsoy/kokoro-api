# Kokoro CRM API

Этот проект представляет собой RESTful API для системы управления взаимоотношениями с клиентами Kokoro, созданный с использованием Node.js и фреймворка Nest.js. Он предназначен для обеспечения гибкой и масштабируемой инфраструктуры для управления данными клиентов и взаимодействий.

## Технологический Стек

- **Backend**: Node.js с Nest.js
- **База Данных**: MySQL
- **Контейнеризация**: Docker
- **Управление БД**: phpMyAdmin

## Развертывание для Разработки

### Предварительные Требования

Убедитесь, что у вас установлены Docker и Node.js.

### Клонирование Репозитория

```bash
git clone https://github.com/VladlenTsoy/kokoro-api
cd kokoro-api
```
### Установка Зависимостей

```bash
npm install
```

### Настройка Среды
Создайте .env файл на основе .env.example и заполните необходимые переменные среды.

### Запуск Docker Контейнеров

```bash
docker-compose up -d
```

### Конфигурация TypeORM

Скопируйте **ormconfig.example.ts** в **ormconfig.ts** и настройте параметры подключения к базе данных.

### Миграция Базы Данных

Инициализация миграции

```bash
npm run migration:run
```

Запуск миграции

```bash
npm run migration:generate
```

### Запуск API

```bash
npm start
```

API теперь доступен и готов к использованию для разработки.
