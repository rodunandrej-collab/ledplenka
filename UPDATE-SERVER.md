# 🔄 Команды для обновления сайта на сервере

## Быстрое обновление (если уже настроено)

```bash
# 1. Подключиться к серверу по SSH
ssh root@ваш-ip-адрес

# 2. Перейти в папку проекта
cd /var/www/ledplenka
# или
cd ~/ledplenka

# 3. Получить последние изменения с GitHub
git pull origin main

# 4. Установить новые зависимости (если есть)
npm install

# 5. Перезапустить приложение через PM2
pm2 restart ledplenka

# 6. Проверить статус
pm2 status
pm2 logs ledplenka --lines 20
```

---

## Полная инструкция

### Шаг 1: Подключиться к серверу

**Windows (PowerShell):**
```powershell
ssh root@ваш-ip-адрес
```

**Windows (PuTTY):**
- Откройте PuTTY
- Host Name: `ваш-ip-адрес`
- Port: `22`
- Connection type: `SSH`
- Нажмите "Open"
- Введите пароль

**Mac/Linux:**
```bash
ssh root@ваш-ip-адрес
```

---

### Шаг 2: Перейти в папку проекта

```bash
# Если проект в /var/www/ledplenka
cd /var/www/ledplenka

# Или если в домашней папке
cd ~/ledplenka
```

---

### Шаг 3: Обновить код с GitHub

```bash
# Получить последние изменения
git pull origin main

# Если возникнут конфликты, можно принудительно обновить:
# git fetch origin
# git reset --hard origin/main
```

---

### Шаг 4: Установить новые зависимости (если нужно)

```bash
# Установить новые пакеты из package.json
npm install
```

---

### Шаг 5: Перезапустить приложение

```bash
# Перезапустить через PM2
pm2 restart ledplenka

# Или если приложение называется по-другому:
pm2 restart all
```

---

### Шаг 6: Проверить работу

```bash
# Посмотреть статус
pm2 status

# Посмотреть логи (последние 50 строк)
pm2 logs ledplenka --lines 50

# Посмотреть логи в реальном времени
pm2 logs ledplenka
```

---

## Если проект еще не клонирован с GitHub

Если на сервере еще нет проекта, сначала клонируйте:

```bash
# Создать папку
mkdir -p /var/www/ledplenka
cd /var/www/ledplenka

# Клонировать репозиторий
git clone https://github.com/rodunandrej-collab/ledplenka.git .

# Установить зависимости
npm install

# Создать папку для данных
mkdir -p data

# Запустить через PM2
pm2 start server.js --name ledplenka
pm2 save
pm2 startup
```

---

## Полезные команды PM2

```bash
# Список всех процессов
pm2 list

# Перезапуск
pm2 restart ledplenka

# Остановка
pm2 stop ledplenka

# Удаление
pm2 delete ledplenka

# Логи
pm2 logs ledplenka

# Мониторинг
pm2 monit

# Сохранить текущую конфигурацию
pm2 save
```

---

## Если что-то пошло не так

### Откатить изменения:
```bash
cd /var/www/ledplenka
git reset --hard HEAD~1
pm2 restart ledplenka
```

### Проверить, что порт свободен:
```bash
sudo netstat -tulpn | grep 3000
```

### Убить процесс на порту 3000 (если нужно):
```bash
sudo lsof -ti:3000 | xargs kill -9
```

---

## Автоматическое обновление (опционально)

Можно создать скрипт для автоматического обновления:

```bash
# Создать файл update.sh
nano /var/www/ledplenka/update.sh
```

Вставить:
```bash
#!/bin/bash
cd /var/www/ledplenka
git pull origin main
npm install
pm2 restart ledplenka
echo "Обновление завершено!"
```

Сделать исполняемым:
```bash
chmod +x /var/www/ledplenka/update.sh
```

Запускать одной командой:
```bash
/var/www/ledplenka/update.sh
```

---

**Готово! Сайт обновлен! 🎉**

