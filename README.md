# Inventory Management System

Inventory Management System built with Node.js, Next.js, MongoDB, and JWT Authentication.

## Features

- Admin, Employee, and Customer roles
- Account approval system
- Supplier management
- Inventory management
- JWT authentication
- Role-based access control

---

# Prerequisites

Install the following before running the project:

- Node.js  
  [Node.js Official Website](https://nodejs.org?utm_source=chatgpt.com)

- MongoDB Compass  
  [MongoDB Compass](https://www.mongodb.com/products/compass?utm_source=chatgpt.com)

---

# Setup & Run

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Start MongoDB

Open MongoDB Compass and ensure the local database is running.

---

## 3. Admin Account Details


Admin credentials are available inside:

```bash
initialSeed.js
```

---

## 4. Run Development Server

```bash
npm run dev
```

Application URL:

```bash
http://localhost:3000
```

---

# User Workflow

- Admin account is created through seed process.
- Employees and Customers can register themselves.
- Newly registered users remain in `Pending` status.
- Admin must approve accounts before users can access system features.
- Admin cannot add inventory materials until supplier data exists.

---

# Important Notes

- MongoDB must be running before starting the app.
- Supplier data is required before adding inventory materials.
- Only approved users can perform activities in the system.