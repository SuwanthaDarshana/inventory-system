# Inventory Management System 📦

An internal Inventory Management System developed for Ceyntics Systems to securely manage tools, products, and electronic components within the organization. 

This system features a decoupled architecture with a RESTful API backend and a responsive Single Page Application (SPA) frontend.

## 🚀 Tech Stack

- **Backend:** Laravel (PHP)
- **Frontend:** React (TypeScript, Vite)
- **Database:** PostgreSQL
- **Authentication:** Laravel Sanctum (Token-based Auth)
- **Styling:** Tailwind CSS (assumed based on standard React/Vite setups)

## ✨ Core Features

1. **Authentication & Authorization**
   - Secure token-based login.
   - Closed system: No public self-registration.
   - Role-Based Access Control (Admin / Staff). Only Admins can create new system users and assign roles.

2. **Storage Structure Management**
   - Full CRUD operations for **Cupboards** and **Places**.
   - Hierarchical storage: Every `Place` belongs to a specific `Cupboard`.

3. **Inventory Management**
   - Track items with unique codes (SKUs), names, and quantities.
   - Store images, descriptions, and optional serial numbers.
   - Link items to specific storage `Places`.
   - Automatic status transitions (In-Store, Borrowed, Damaged, Missing) based on available quantity.

4. **Borrowing System & Race Condition Handling**
   - Track borrower details (name, contact, dates, quantity).
   - System automatically reduces stock and updates item statuses.
   - **Concurrency Safety:** Borrowing and returning logic is wrapped in Database Transactions utilizing Pessimistic Locking (`lockForUpdate()`) to prevent race conditions and ensure accurate inventory counts even under concurrent requests.

5. **Audit & Activity Log**
   - Comprehensive tracking of system changes.
   - Logs record who performed the action, timestamp, affected table/record, and structured JSON of the `old_value` transitioning to the `new_value`.

## 📂 Project Structure

The repository is divided into two main directories:
- `/inventory-backend` - The Laravel API.
- `/inventory-frontend` - The React SPA.

---

## 🛠️ Installation & Setup instructions

### Prerequisites
- PHP 8.2+
- Composer
- Node.js & npm
- PostgreSQL database

### 1. Backend Setup (Laravel)

```bash
cd inventory-backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

**Configure Database:**
Open your `.env` file and configure your PostgreSQL connection:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

**Run Migrations & Seeders:**
```bash
# Run migrations to create tables
php artisan migrate

# Link the storage directory for image uploads
php artisan storage:link

# Start the Laravel development server
php artisan serve
```
*The API will be available at `http://localhost:8000`*

### 2. Frontend Setup (React/TypeScript)

```bash
cd inventory-frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The React app will be available at `http://localhost:5173`*

---

