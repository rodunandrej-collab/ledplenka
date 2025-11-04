# Инструкция по деплою на Railway

## 1. Создание репозитория на GitHub

1. Перейдите на https://github.com/rodunandrej-collab
2. Нажмите "New repository" (или кнопку "New")
3. Название репозитория: `ledplenka`
4. **Важно:** Не добавляйте README, .gitignore или лицензию (они уже есть в проекте)
5. Нажмите "Create repository"

## 2. Загрузка кода на GitHub

После создания репозитория выполните:

```bash
git push -u origin main
```

Если возникнет ошибка, попробуйте:

```bash
git push -u origin master
```

## 3. Деплой на Railway

### Шаг 1: Подключение GitHub репозитория
1. Перейдите на [railway.app](https://railway.app)
2. Войдите в аккаунт
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите репозиторий `rodunandrej-collab/ledplenka`

### Шаг 2: Добавление PostgreSQL базы данных
1. В проекте Railway нажмите "+ New"
2. Выберите "Database" → "Add PostgreSQL"
3. Railway автоматически создаст базу данных и переменную `DATABASE_URL`

### Шаг 3: Настройка переменных окружения (опционально)
В настройках проекта (Settings → Variables) можно добавить:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

### Шаг 4: Деплой
Railway автоматически:
- Определит Node.js проект
- Установит зависимости (`npm install`)
- Запустит сервер (`npm start`)
- Создаст таблицы в базе данных при первом запуске

## 4. Проверка работы

После деплоя:
1. Railway предоставит URL вашего сайта (например: `https://your-app.railway.app`)
2. Откройте админ-панель: `https://your-app.railway.app/admin.html`
3. Проверьте работу формы заказа на главной странице

## 5. Troubleshooting

### База данных не подключается
- Убедитесь, что PostgreSQL сервис добавлен в проект
- Проверьте, что переменная `DATABASE_URL` присутствует в Settings → Variables
- Проверьте логи в Railway Dashboard

### Ошибки при запуске
- Проверьте логи в Railway Dashboard
- Убедитесь, что все зависимости установлены (`pg` должен быть в `package.json`)
- Проверьте, что порт настроен правильно (Railway автоматически устанавливает `PORT`)

## Структура базы данных

Таблица `orders` создается автоматически при первом запуске:

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    area VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Полезные ссылки

- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [GitHub Repository](https://github.com/rodunandrej-collab/ledplenka)

