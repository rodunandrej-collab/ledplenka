# ⚡ Быстрый старт для Timeweb VPS

## 🚀 Минимальные команды для запуска

### 1. Подключиться к серверу
```bash
ssh root@ваш-ip-адрес
```

### 2. Создать папку и загрузить файлы через Git
```bash
mkdir -p /var/www/ledplenka
cd /var/www/ledplenka
git clone https://github.com/rodunandrej-collab/ledplenka.git .
```

### 3. Установить зависимости
```bash
npm install
mkdir -p data
```

### 4. Установить и запустить через PM2
```bash
npm install -g pm2
pm2 start server.js --name ledplenka
pm2 save
pm2 startup
# Выполните команду, которую выведет PM2
```

### 5. Установить и настроить Nginx
```bash
sudo apt update
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/ledplenka
```

**Вставьте в файл:**
```nginx
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Сохраните (Ctrl+O, Enter, Ctrl+X) и активируйте:**
```bash
sudo ln -s /etc/nginx/sites-available/ledplenka /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Готово! Откройте в браузере:
```
http://ваш-ip-адрес
```

---

## 📋 Полезные команды

```bash
# Просмотр логов
pm2 logs ledplenka

# Перезапуск
pm2 restart ledplenka

# Статус
pm2 status

# Остановка
pm2 stop ledplenka
```

---

**Подробная инструкция:** см. `TIMEWEB-VPS-DEPLOY.md`

