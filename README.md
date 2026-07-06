# 💰 FinSight – Financial Habit Builder & Wealth Growth Tracker

<div align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

**A Full-Stack Personal Finance Management Platform that helps users build healthy financial habits, track wealth growth, manage expenses, and achieve savings goals.**

</div>

---

## 📖 Overview

FinSight is a **Full-Stack MERN application** designed to help users improve their financial discipline by tracking income, expenses, savings goals, financial habits, investments, and overall wealth growth.

Unlike traditional budgeting applications, FinSight focuses on **building long-term financial habits** through habit tracking, goal management, wealth analytics, and insightful dashboards.

---

## ✨ Features

### 👤 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Access (User/Admin)

---

### 📊 Dashboard

- Financial Overview
- Income Summary
- Expense Summary
- Savings Overview
- Wealth Snapshot
- Interactive Charts
- Recent Transactions
- Quick Statistics

---

### 💵 Income Management

- Add Income
- Edit Income
- Delete Income
- Categorize Income
- Monthly Income Summary
- Search & Filter

---

### 💸 Expense Management

- Add Expenses
- Edit Expenses
- Delete Expenses
- Category-wise Tracking
- Expense Analytics
- Monthly Spending Reports
- Search & Filter
- CSV Export

---

### 🎯 Savings Goals

- Create Goals
- Track Progress
- Goal Contributions
- Deadline Tracking
- Progress Visualization

---

### 📈 Wealth Growth Tracker

- Asset Tracking
- Wealth Analytics
- Financial Overview
- Interactive Charts
- Growth Monitoring

---

### 📌 Habit Tracker

- Create Financial Habits
- Daily Habit Tracking
- Habit Streaks
- Progress Monitoring
- Completion History

---

### 💹 Investment Tracker

- Track Investments
- Investment Portfolio
- Investment Summary
- Performance Tracking

---

### 📅 Bills Management

- Add Bills
- Due Date Tracking
- Payment Status
- Bill History

---

### 👨‍💼 Admin Dashboard

- User Management
- Analytics Dashboard
- Feedback Management
- Platform Statistics

---

### 📑 Reports & Analytics

- Financial Reports
- Charts & Graphs
- Monthly Analytics
- CSV Export

---

## 🛠 Tech Stack

### Frontend

- React.js
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- React Hook Form
- Recharts
- Axios

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- Express Validator
- Helmet
- Rate Limiter

### Database

- MongoDB Atlas
- Mongoose

### Deployment

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## 📂 Project Structure

```
fin-sight/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   └── assets/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── tests/
│   └── server.js
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/sourav8963/fin-sight.git

cd fin-sight
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

Runs on

```
http://localhost:5173
```

---

## Backend Setup

```bash
cd server

npm install

npm run dev
```

Runs on

```
http://localhost:5000
```

---

## Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173

EMAIL_USER=your_email@example.com

EMAIL_PASS=your_email_password
```

---

# 📷 Application Pages

- Login
- Register
- Dashboard
- Income Tracker
- Expense Tracker
- Savings Goals
- Habit Tracker
- Investment Tracker
- Wealth Analytics
- Bills Management
- User Profile
- Admin Dashboard

---

# 📊 Core Modules

### Authentication Module

- Secure Login
- Registration
- JWT Authentication
- Authorization

---

### Financial Tracking

- Income
- Expenses
- Savings
- Investments
- Bills

---

### Habit Builder

- Daily Habits
- Habit Streaks
- Progress Tracking

---

### Wealth Analytics

- Financial Charts
- Spending Analysis
- Wealth Overview

---

### Reports

- CSV Export
- Financial Analytics
- Monthly Summary

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing
- Helmet Security
- Rate Limiting
- Input Validation
- Protected Routes
- Environment Variables
- MongoDB Injection Protection

---

# 📈 Future Enhancements

- Email Verification
- Forgot Password
- PDF Report Export
- Excel Report Export
- AI Financial Advisor
- Bank Account Integration
- Push Notifications
- Mobile Application
- OCR Receipt Scanner
- Multi-Currency Support

---

# 🧪 Testing

Run backend tests

```bash
cd server

npm test
```

---

# 🌐 Deployment

### Frontend

Vercel

### Backend

Render

### Database

MongoDB Atlas

---

# 📋 API Documentation

After starting the backend, Swagger documentation is available at:

```
http://localhost:5000/api-docs
```

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 👨‍💻 Author

**Sourav Kumar**

- GitHub: https://github.com/sourav8963
- LinkedIn: https://www.linkedin.com/in/sourav-kumar-bb8976301/

---

# 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you found this project helpful:

⭐ Star this repository

🍴 Fork the repository

🛠 Contribute to the project

---

<div align="center">

### 💡 "Build Better Financial Habits. Grow Your Wealth."

Made with ❤️ by **Sourav Kumar**

</div>
