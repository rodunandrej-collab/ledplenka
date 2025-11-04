# Инструкция по деплою на Railway

## Шаг 1: Подготовка репозитория

Убедитесь, что все файлы закоммичены:

```bash
git init
git add .
git commit -m "Prepare for Railway deployment"
```

## Шаг 2: Создание проекта на Railway

1. Зайдите на [railway.app](https://railway.app)
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Подключите ваш GitHub аккаунт
5. Выберите репозиторий с проектом

## Шаг 3: Настройка переменных окружения (опционально)

В настройках проекта Railway (Settings → Variables) можно добавить:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

Если переменные не указаны, используются значения по умолчанию:
- Username: `admin`
- Password: `admin123`

⚠️ **Важно:** Обязательно измените пароль для production!

## Шаг 4: Деплой

Railway автоматически:
- Определит Node.js проект
- Установит зависимости (`npm install`)
- Запустит сервер (`npm start`)
- Назначит публичный URL

## Шаг 5: Проверка работы

После деплоя проверьте:
- Главная страница доступна: `https://your-app.railway.app`
- Админ-панель доступна: `https://your-app.railway.app/admin.html`
- API работает: `https://your-app.railway.app/api/stats`

## Структура данных

Данные хранятся в файле `data/orders.json` на сервере Railway. Файл автоматически создается при первом запуске.

## Полезные команды Railway CLI

```bash
# Установка Railway CLI
npm i -g @railway/cli

# Логин
railway login

# Создание проекта
railway init

# Деплой
railway up

# Просмотр логов
railway logs
```

## Возможные проблемы

### Порт не определен
Railway автоматически устанавливает переменную `PORT`. Если проблемы, проверьте настройки проекта.

### Заказы не сохраняются
Убедитесь, что папка `data/` имеет права на запись. Railway создает её автоматически.

### Ошибки при деплое
Проверьте логи в разделе "Deployments" на Railway.

## Обновление сайта

Каждый push в main ветку автоматически триггерит новый деплой на Railway.

---

**Успешного деплоя! 🚀**


