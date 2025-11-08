# 🚀 Инструкция по загрузке на Timeweb VPS

## ✅ Что уже готово:
- ✅ VPS сервер куплен
- ✅ Node.js установлен

## 📋 Что нужно сделать:

### Шаг 1: Получить доступ к серверу

1. Зайдите в панель Timeweb: https://timeweb.com
2. Найдите ваш VPS в списке серверов
3. Откройте данные для доступа:
   - **IP адрес сервера**
   - **Логин** (обычно `root`)
   - **Пароль** (или SSH ключ)

---

### Шаг 2: Подключиться к серверу по SSH

**Windows:**
- Используйте **PuTTY** (скачать: https://www.putty.org/)
- Или **PowerShell** (встроен в Windows 10/11)

**В PowerShell:**
```powershell
ssh root@ваш-ip-адрес
```

**В PuTTY:**
- Host Name: `ваш-ip-адрес`
- Port: `22`
- Connection type: `SSH`
- Нажмите "Open"
- Введите пароль при запросе

---

### Шаг 3: Подготовить папку для сайта

На сервере выполните:

```bash
# Создать папку для сайта
mkdir -p /var/www/ledplenka
cd /var/www/ledplenka

# Или можно использовать домашнюю папку
mkdir -p ~/ledplenka
cd ~/ledplenka
```

---

### Шаг 4: Загрузить файлы на сервер

**Вариант А: Через Git (РЕКОМЕНДУЕТСЯ)**

```bash
# Установить Git (если еще не установлен)
sudo apt update
sudo apt install git -y

# Клонировать репозиторий
cd /var/www/ledplenka
git clone https://github.com/rodunandrej-collab/ledplenka.git .

# Или если хотите в домашнюю папку:
cd ~/ledplenka
git clone https://github.com/rodunandrej-collab/ledplenka.git .
```

**Вариант Б: Через FTP (FileZilla)**

1. Скачайте **FileZilla**: https://filezilla-project.org/
2. В панели Timeweb найдите **FTP данные** для вашего VPS
3. Подключитесь через FileZilla:
   - Хост: `ваш-ip-адрес` или `ftp.ваш-домен.ru`
   - Пользователь: `root` (или FTP пользователь)
   - Пароль: ваш пароль
   - Порт: `21` или `22` (SFTP)
4. Загрузите все файлы в папку `/var/www/ledplenka` или `~/ledplenka`

**Файлы для загрузки:**
```
✅ index.html
✅ styles.css
✅ script.js
✅ admin.html
✅ admin.css
✅ admin.js
✅ server.js
✅ package.json
✅ package-lock.json
✅ images/ (вся папка)
✅ data/ (папка - создастся автоматически, но можно создать пустую)
```

**НЕ загружайте:**
- ❌ node_modules/ (установится на сервере)
- ❌ .git/ (если используете FTP)

---

### Шаг 5: Установить зависимости

```bash
# Перейти в папку проекта
cd /var/www/ledplenka
# или
cd ~/ledplenka

# Установить зависимости
npm install
```

---

### Шаг 6: Проверить версию Node.js

```bash
node --version
# Должно быть: v18.x.x или выше

npm --version
```

Если версия ниже 18, обновите Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

### Шаг 7: Создать папку для данных

```bash
mkdir -p data
chmod 755 data
```

---

### Шаг 8: Настроить автозапуск через PM2

**Установить PM2:**
```bash
npm install -g pm2
```

**Запустить приложение:**
```bash
cd /var/www/ledplenka
# или
cd ~/ledplenka

pm2 start server.js --name ledplenka
```

**Сохранить конфигурацию PM2:**
```bash
pm2 save
```

**Настроить автозапуск при перезагрузке сервера:**
```bash
pm2 startup
# Выполните команду, которую выведет PM2 (обычно с sudo)
```

**Полезные команды PM2:**
```bash
pm2 list              # Список процессов
pm2 logs ledplenka     # Просмотр логов
pm2 restart ledplenka  # Перезапуск
pm2 stop ledplenka     # Остановка
pm2 delete ledplenka   # Удаление
```

---

### Шаг 9: Настроить Nginx (веб-сервер)

**Установить Nginx:**
```bash
sudo apt update
sudo apt install nginx -y
```

**Создать конфигурацию сайта:**
```bash
sudo nano /etc/nginx/sites-available/ledplenka
```

**Вставьте следующую конфигурацию:**

```nginx
server {
    listen 80;
    server_name ацелотлед.рф www.ацелотлед.рф;
    
    # Если домен еще не настроен, можно использовать IP:
    # server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Для установки SSL (HTTPS) после настройки DNS:**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ацелотлед.рф -d www.ацелотлед.рф
```

**Сохраните:** `Ctrl+O`, затем `Enter`, затем `Ctrl+X`

**Активировать конфигурацию:**
```bash
sudo ln -s /etc/nginx/sites-available/ledplenka /etc/nginx/sites-enabled/
sudo nginx -t  # Проверить конфигурацию
sudo systemctl restart nginx
```

**Включить автозапуск Nginx:**
```bash
sudo systemctl enable nginx
```

---

### Шаг 10: Настроить Firewall (если нужно)

```bash
# Разрешить HTTP и HTTPS
sudo ufw allow 'Nginx Full'
# или
sudo ufw allow 80
sudo ufw allow 443

# Разрешить SSH (важно!)
sudo ufw allow 22

# Включить firewall
sudo ufw enable
```

---

### Шаг 11: Проверить работу

1. **Проверить, что Node.js приложение работает:**
   ```bash
   pm2 status
   pm2 logs ledplenka
   ```

2. **Проверить, что Nginx работает:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Открыть сайт в браузере:**
   - Если есть домен: `http://ваш-домен.ru`
   - Если нет домена: `http://ваш-ip-адрес`
   - Админ-панель: `http://ваш-домен.ru/admin.html`

---

## 🔧 Настройка переменных окружения (опционально)

Если нужно изменить пароль админки или другие настройки:

```bash
cd /var/www/ledplenka
nano .env
```

Добавьте:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ваш_надежный_пароль
PORT=3000
```

Затем перезапустите:
```bash
pm2 restart ledplenka
```

---

## 🐛 Решение проблем

### Приложение не запускается

```bash
# Проверить логи
pm2 logs ledplenka

# Проверить, что порт 3000 свободен
sudo netstat -tulpn | grep 3000

# Проверить, что Node.js установлен
node --version
```

### Nginx не работает

```bash
# Проверить статус
sudo systemctl status nginx

# Проверить логи
sudo tail -f /var/log/nginx/error.log

# Проверить конфигурацию
sudo nginx -t
```

### Сайт не открывается

1. Проверьте, что PM2 запущен: `pm2 list`
2. Проверьте, что Nginx запущен: `sudo systemctl status nginx`
3. Проверьте firewall: `sudo ufw status`
4. Проверьте, что порт 3000 слушается: `pm2 logs ledplenka`

---

## 📝 Полезные команды

```bash
# Перезапуск приложения
pm2 restart ledplenka

# Просмотр логов в реальном времени
pm2 logs ledplenka --lines 50

# Перезагрузка Nginx
sudo systemctl reload nginx

# Проверка использования ресурсов
pm2 monit
```

---

## ✅ Чек-лист готовности

- [ ] Файлы загружены на сервер
- [ ] `npm install` выполнен успешно
- [ ] PM2 установлен и приложение запущено
- [ ] Nginx установлен и настроен
- [ ] Сайт открывается в браузере
- [ ] Админ-панель доступна
- [ ] Форма заказа работает

---

## 🆘 Нужна помощь?

Если что-то не работает:
1. Проверьте логи: `pm2 logs ledplenka`
2. Проверьте логи Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Обратитесь в техподдержку Timeweb

---

**Готово! Ваш сайт должен работать! 🎉**

