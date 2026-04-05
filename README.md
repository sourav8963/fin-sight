# Finsight — Finance Dashboard

A clean, interactive personal finance dashboard built with React, Zustand, and Recharts.

---

## Overview

Finsight is a frontend-only finance tracking application that helps users visualize their financial activity, manage transactions, and understand spending patterns. It uses mock/static data and simulates role-based access without any backend.

The design philosophy is intentionally editorial and minimal — avoiding the typical gradient-heavy AI dashboard aesthetic in favour of crisp typography, tight spacing, and contextual color usage.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| State Management | Zustand (with localStorage persistence) |
| Charts | Recharts |
| Date utilities | date-fns |

---

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app runs at `http://localhost:3000` by default.

---

## Features

### Dashboard Overview
- **Summary cards** — Net Balance, Total Income, Total Expenses with month-over-month delta indicators
- **Balance trend chart** — Area chart showing income vs expenses over the last 6 months
- **Spending breakdown** — Donut chart with category legend
- **Monthly comparison** — Grouped bar chart for income vs expenses per month
- **Recent activity** — Last 5 transactions with quick-link to full list

### Transactions
- Full transaction table with date, amount, category, type, and description
- **Search** — Full-text search across category, notes, and amount
- **Filter** — By type (income/expense) and category
- **Sort** — By date or amount (ascending/descending toggle)
- **Export** — Download filtered transactions as CSV
- **Admin actions** — Edit or delete transactions (with confirmation step)

### Insights
- **Savings rate** — Calculated as (income − expenses) / income × 100
- **Net savings trend** — Monthly bar chart with green/red conditional coloring
- **Category breakdown** — Horizontal progress bars with percentage of total spend
- **Income sources** — Breakdown of income by category with percentage bars
- **Observations** — Contextual insights: biggest expense, biggest income, savings health assessment

### Role-Based UI
- Toggle between **Viewer** and **Admin** in the top bar
- **Viewer**: read-only access — can view all data but cannot add or modify transactions
- **Admin**: full access — can add new transactions, edit existing ones, and delete

### Additional Features
- **Dark mode** — Toggle in the top bar; preference persisted via localStorage
- **Data persistence** — All transactions and settings saved to localStorage via Zustand's `persist` middleware
- **Empty states** — Graceful handling when no transactions match filters
- **Input validation** — Form validation with inline error messages
- **Responsive layout** — Mobile-first with collapsible sidebar on small screens

---

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # App shell with sidebar + main content
│   ├── Sidebar.jsx         # Navigation with mobile overlay
│   ├── TopBar.jsx          # Role switcher, dark mode toggle, add button
│   ├── SummaryCard.jsx     # Reusable KPI card
│   └── TransactionModal.jsx # Add/edit transaction form
├── pages/
│   ├── Dashboard.jsx       # Overview with charts and recent activity
│   ├── Transactions.jsx    # Full transaction list with filters
│   └── Insights.jsx        # Financial insights and analytics
├── store/
│   └── useStore.js         # Zustand store — state, actions, persistence
└── data/
    └── mockData.js         # 60 mock transactions across 6 months + helpers
```

---

## State Management

Zustand is used as a single global store with `persist` middleware. The store manages:

- `transactions` — array of all transactions (persisted)
- `role` — current user role: `'viewer'` | `'admin'` (persisted)
- `darkMode` — boolean (persisted)
- `filters` — search query, type, category, sortBy, sortDir (session only)
- `modal` — open/close state for transaction form
- `activePage` — current navigation page

All CRUD operations (add, update, delete) are pure state mutations — no async required for mock data.

---

## Design Decisions

- **No CSS framework components** — All UI built with Tailwind utility classes for full control
- **CSS custom properties** — Theme variables allow instant light/dark switching without JS class toggling per element
- **Tabular numerics** — All currency values use `font-variant-numeric: tabular-nums` for aligned columns
- **Conditional color** — Income values consistently green, expense values consistently warm red
- **Staggered animations** — Cards animate in with small delays for a polished entry sequence
