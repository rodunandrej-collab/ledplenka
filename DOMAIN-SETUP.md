# 🌐 Настройка домена ацелотлед.рф на Timeweb VPS

## Шаг 1: Настройка DNS записей в панели Timeweb

1. Зайдите в панель управления Timeweb: https://timeweb.com
2. Найдите раздел **"Домены"** или **"DNS"**
3. Выберите домен **ацелотлед.рф**
4. Настройте DNS записи:

### A-запись:
```
Тип: A
Имя: @ (или оставить пустым)
Значение: IP-адрес вашего VPS сервера
TTL: 3600 (или автоматически)
```

### A-запись для www:
```
Тип: A
Имя: www
Значение: IP-адрес вашего VPS сервера
TTL: 3600
```

**Важно:** Замените `IP-адрес вашего VPS сервера` на реальный IP вашего сервера Timeweb.

---

## Шаг 2: Обновить конфигурацию Nginx

Подключитесь к серверу по SSH и отредактируйте конфигурацию:

```bash
# Подключиться к серверу
ssh root@ваш-ip-адрес

# Открыть конфигурацию Nginx
sudo nano /etc/nginx/sites-available/ledplenka
```

**Замените содержимое на:**

```nginx
server {
    listen 80;
    server_name ацелотлед.рф www.ацелотлед.рф;

    # Логи
    access_log /var/log/nginx/ledplenka-access.log;
    error_log /var/log/nginx/ledplenka-error.log;

    # Проксирование на Node.js приложение
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
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Статические файлы (опционально, для оптимизации)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|mp4)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Сохраните:** `Ctrl+O`, затем `Enter`, затем `Ctrl+X`

---

## Шаг 3: Проверить и перезагрузить Nginx

```bash
# Проверить конфигурацию на ошибки
sudo nginx -t

# Если всё ОК, перезагрузить Nginx
sudo systemctl reload nginx

# Или полный перезапуск
sudo systemctl restart nginx
```

---

## Шаг 4: Установить SSL сертификат (HTTPS)

Для установки бесплатного SSL сертификата Let's Encrypt:

```bash
# Установить Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Получить сертификат для домена
sudo certbot --nginx -d ацелотлед.рф -d www.ацелотлед.рф

# Следовать инструкциям:
# - Ввести email
# - Согласиться с условиями
# - Certbot автоматически обновит конфигурацию Nginx
```

**После установки Certbot автоматически:**
- Обновит конфигурацию Nginx
- Настроит редирект с HTTP на HTTPS
- Настроит автообновление сертификата

---

## Шаг 5: Проверить работу

1. **Проверить DNS:**
   ```bash
   # На вашем компьютере выполните:
   ping ацелотлед.рф
   # Должен показать IP вашего сервера
   ```

2. **Проверить сайт:**
   - Откройте в браузере: `http://ацелотлед.рф`
   - После установки SSL: `https://ацелотлед.рф`

3. **Проверить логи:**
   ```bash
   # Логи Nginx
   sudo tail -f /var/log/nginx/ledplenka-access.log
   sudo tail -f /var/log/nginx/ledplenka-error.log
   
   # Логи приложения
   pm2 logs ledplenka
   ```

---

## Шаг 6: Настроить автообновление SSL (опционально)

Certbot обычно настраивает это автоматически, но можно проверить:

```bash
# Проверить автообновление
sudo certbot renew --dry-run

# Посмотреть статус таймера
sudo systemctl status certbot.timer
```

---

## Если что-то не работает

### Проверить, что DNS настроен правильно:
```bash
# На вашем компьютере
nslookup ацелотлед.рф
# Должен показать IP вашего сервера
```

### Проверить, что Nginx слушает правильный порт:
```bash
sudo netstat -tulpn | grep nginx
```

### Проверить, что Node.js приложение работает:
```bash
pm2 status
pm2 logs ledplenka
```

### Проверить firewall:
```bash
# Разрешить HTTP и HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### Проверить конфигурацию Nginx:
```bash
sudo nginx -t
```

---

## Обновленная конфигурация Nginx с SSL (после Certbot)

После установки SSL, Certbot создаст примерно такую конфигурацию:

```nginx
server {
    listen 80;
    server_name ацелотлед.рф www.ацелотлед.рф;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ацелотлед.рф www.ацелотлед.рф;

    ssl_certificate /etc/letsencrypt/live/ацелотлед.рф/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ацелотлед.рф/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/ledplenka-access.log;
    error_log /var/log/nginx/ledplenka-error.log;

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

---

## Быстрая команда для обновления конфигурации

Если нужно быстро обновить домен в конфигурации:

```bash
# Открыть конфигурацию
sudo nano /etc/nginx/sites-available/ledplenka

# Заменить server_name на ваш домен
# Сохранить (Ctrl+O, Enter, Ctrl+X)

# Проверить и перезагрузить
sudo nginx -t && sudo systemctl reload nginx
```

---

## Проверка после настройки

✅ Домен должен открываться: `http://ацелотлед.рф`  
✅ После SSL: `https://ацелотлед.рф`  
✅ www версия: `https://www.ацелотлед.рф`  
✅ Админ-панель: `https://ацелотлед.рф/admin.html`  

---

**Готово! Ваш сайт доступен по домену ацелотлед.рф! 🎉**

