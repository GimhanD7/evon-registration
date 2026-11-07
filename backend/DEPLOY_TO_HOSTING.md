# Backend Deployment Guide: https://technohub.kasunwalakumbura.com

This guide explains how to upload the backend files to your hosting server at `https://technohub.kasunwalakumbura.com` and connect both your local and production environments.

---

## 1. Folder Structure on Hosting Server

Upload the entire `backend/` folder into your hosting server's web root (`public_html` or domain root):

```text
public_html/
└── backend/
    ├── .htaccess                  <- Apache CORS & Authorization headers (included)
    ├── config/
    │   ├── db.php                 <- Universal database loader with CORS & auto-fallback
    │   ├── db_config.php          <- Your live database credentials (create from example)
    │   └── db_config.example.php  <- Template
    ├── api/
    │   ├── status.php             <- Health check endpoint
    │   ├── auth.php
    │   ├── users.php
    │   ├── papers.php
    │   ├── results.php
    │   ├── evaluations.php
    │   ├── quizzes.php
    │   ├── batches.php
    │   ├── activity_logs.php
    │   ├── settings.php
    │   └── seed.php
    └── database/
        ├── schema.sql             <- Database schema
        └── seed_all_data.sql      <- Initial data
```

---

## 2. Set Up the MySQL Database on Hosting

1. Log in to your hosting control panel (cPanel / DirectAdmin / Plesk) at `technohub.kasunwalakumbura.com`.
2. Go to **MySQL Databases**:
   - Create a new database (e.g., `user_evon_lms`).
   - Create a database user (e.g., `user_evon_admin`) with a secure password.
   - Add the user to the database and grant **ALL PRIVILEGES**.
3. Open **phpMyAdmin**:
   - Select the newly created database.
   - Click **Import** and upload [`backend/database/schema.sql`](file:///c:/xampp/htdocs/Evon-registration/backend/database/schema.sql) (or copy-paste its SQL queries).
   - *(Optional)* Import [`backend/database/seed_all_data.sql`](file:///c:/xampp/htdocs/Evon-registration/backend/database/seed_all_data.sql) if you want sample data.

---

## 3. Configure Database Credentials

On the hosting server, duplicate `backend/config/db_config.example.php` as `backend/config/db_config.php` and fill in your details:

```php
<?php
return [
    'db_host' => 'localhost',
    'db_port' => '3306',
    'db_name' => 'kasuormb_evon',
    'db_user' => 'kasuormb_evonGimhana',
    'db_pass' => 'l=I0!+GOm#S=GW=+',
];
```

> **Note**: Your local development will continue using default XAMPP settings (`127.0.0.1`, `root`, no password).

---

## 4. Test the Live Backend

Open the health check endpoint in your web browser:
```
https://technohub.kasunwalakumbura.com/backend/api/status.php
```

You should see a JSON response:
```json
{
  "api": "ONLINE",
  "database": "CONNECTED",
  "database_name": "your_cpanel_dbname",
  "timestamp": "2026-11-07 16:25:00"
}
```

---

## 5. How Local & Hosting Work Together

- **Running locally (`localhost:3000`)**:
  - The app will automatically connect to your local XAMPP Apache backend (`http://localhost/Evon-registration/backend`).
  - If your local XAMPP is turned off, the frontend will automatically use `https://technohub.kasunwalakumbura.com/backend` as a fallback!
  - If you want local development to **always** use the live hosting backend, simply add this line to your `.env.local`:
    ```env
    NEXT_PUBLIC_BACKEND_URL=https://technohub.kasunwalakumbura.com/backend
    BACKEND_APACHE_URL=https://technohub.kasunwalakumbura.com/backend
    ```

- **Running on `https://technohub.kasunwalakumbura.com`**:
  - The frontend automatically detects the domain and routes all API requests directly to the live hosted backend without any extra configuration.
