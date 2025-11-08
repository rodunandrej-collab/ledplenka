# 🔧 Исправление: Certbot и кириллические домены (Punycode)

## Проблема
Certbot не поддерживает кириллические домены напрямую. Нужно использовать **Punycode** (IDN).

---

## Решение: Конвертация домена в Punycode

### Шаг 1: Конвертировать домен в Punycode

**Вариант А: Онлайн конвертер**
1. Откройте: https://www.punycoder.com/
2. Введите: `ацелотлед.рф`
3. Скопируйте результат (например: `xn--80aafq0a1a.xn--p1ai`)

**Вариант Б: Через Python на сервере**
```bash
python3 -c "import idna; print(idna.encode('ацелотлед.рф').decode('ascii'))"
```

**Вариант В: Через команду idn**
```bash
# Установить утилиту (если нет)
sudo apt install idn -y

# Конвертировать
idn ацелотлед.рф
```

---

### Шаг 2: Обновить конфигурацию Nginx

```bash
# Открыть конфигурацию
sudo nano /etc/nginx/sites-available/ledplenka
```

**Используйте Punycode в server_name:**

```nginx
server {
    listen 80;
    server_name xn--80aafq0a1a.xn--p1ai www.xn--80aafq0a1a.xn--p1ai;
    # Также можно оставить кириллицу для пользователей:
    # server_name ацелотлед.рф www.ацелотлед.рф xn--80aafq0a1a.xn--p1ai www.xn--80aafq0a1a.xn--p1ai;

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

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Проверьте и перезагрузите:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Шаг 3: Установить SSL с Punycode

**Вариант А: С email (рекомендуется):**
```bash
# Используйте Punycode версию домена и укажите email
sudo certbot --nginx -d xn--80aafq0a1a.xn--p1ai -d www.xn--80aafq0a1a.xn--p1ai --email ваш-email@example.com --agree-tos --non-interactive
```

**Вариант Б: Без email (не рекомендуется, но работает):**
```bash
# Без email адреса
sudo certbot --nginx -d xn--80aafq0a1a.xn--p1ai -d www.xn--80aafq0a1a.xn--p1ai --register-unsafely-without-email --agree-tos --non-interactive
```

**Вариант В: Интерактивный режим:**
```bash
# Certbot спросит email интерактивно
sudo certbot --nginx -d xn--80aafq0a1a.xn--p1ai -d www.xn--80aafq0a1a.xn--p1ai
# Введите email когда попросит
```

**Важно:** 
- Замените `xn--80aafq0a1a.xn--p1ai` на реальный Punycode вашего домена!
- Замените `ваш-email@example.com` на ваш реальный email

---

## Быстрое решение (все команды)

```bash
# 1. Конвертировать домен в Punycode
python3 -c "import idna; print(idna.encode('ацелотлед.рф').decode('ascii'))"

# 2. Сохранить результат (например: xn--80aafq0a1a.xn--p1ai)
# Замените в командах ниже на ваш результат

# 3. Обновить Nginx конфигурацию
sudo nano /etc/nginx/sites-available/ledplenka
# Используйте Punycode в server_name

# 4. Проверить и перезагрузить
sudo nginx -t && sudo systemctl reload nginx

# 5. Установить SSL
sudo certbot --nginx -d xn--80aafq0a1a.xn--p1ai -d www.xn--80aafq0a1a.xn--p1ai
```

---

## Альтернатива: Использовать оба варианта

Можно указать и кириллицу, и Punycode в конфигурации:

```nginx
server {
    listen 80;
    server_name ацелотлед.рф www.ацелотлед.рф xn--80aafq0a1a.xn--p1ai www.xn--80aafq0a1a.xn--p1ai;
    
    # ... остальная конфигурация
}
```

Но для Certbot используйте только Punycode:
```bash
sudo certbot --nginx -d xn--80aafq0a1a.xn--p1ai -d www.xn--80aafq0a1a.xn--p1ai
```

---

## Проверка Punycode

После установки SSL проверьте:
```bash
# Проверить сертификат
sudo certbot certificates

# Проверить конфигурацию Nginx
sudo nginx -t
```

---

**Важно:** Замените `xn--80aafq0a1a.xn--p1ai` на реальный Punycode вашего домена, полученный через конвертер!

