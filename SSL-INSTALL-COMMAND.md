# 🔒 Команда для установки SSL сертификата

## Ваш Punycode домен:
`xn--80aica3aau6a6a.xn--p1ai`

---

## Команда для установки SSL (с email):

```bash
sudo certbot --nginx -d xn--80aica3aau6a6a.xn--p1ai -d www.xn--80aica3aau6a6a.xn--p1ai --email ваш-email@example.com --agree-tos --non-interactive
```

**Замените `ваш-email@example.com` на ваш реальный email!**

---

## Команда без email (если не хотите указывать email):

```bash
sudo certbot --nginx -d xn--80aica3aau6a6a.xn--p1ai -d www.xn--80aica3aau6a6a.xn--p1ai --register-unsafely-without-email --agree-tos --non-interactive
```

---

## Интерактивный режим (Certbot спросит email):

```bash
sudo certbot --nginx -d xn--80aica3aau6a6a.xn--p1ai -d www.xn--80aica3aau6a6a.xn--p1ai
```

---

## После установки проверьте:

```bash
# Проверить сертификаты
sudo certbot certificates

# Проверить конфигурацию Nginx
sudo nginx -t

# Перезагрузить Nginx (если нужно)
sudo systemctl reload nginx
```

---

**Готово! Ваш сайт будет доступен по HTTPS: https://ацелотлед.рф** 🎉

