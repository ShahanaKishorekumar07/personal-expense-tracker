
# Personal Expense Tracker and Budget Planner

A full-stack web application that helps users manage their personal finances by tracking income, recording expenses, setting monthly budgets, and visualizing spending patterns.

## Features

- Dashboard displaying total income, total expenses, and current balance
- Add, edit, and delete transactions
- Categorize income and expenses
- Record transaction dates and descriptions
- Set and update monthly budgets
- Track monthly spending and remaining budget
- Display budget warnings when spending reaches 80% or more
- Visualize expense categories using a doughnut chart
- Store transactions persistently in an SQLite database
- Responsive interface for desktop and mobile screens

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js

### Backend
- Node.js
- Express.js

### Database
- SQLite using better-sqlite3

### Development Tools
- Visual Studio Code
- npm
- Nodemon

## Project Structure

```text
personal-expense-tracker/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

The `expenses.db` database file is generated automatically when the application starts.

## Prerequisites

Install the following software before running the project:

- Node.js (LTS version recommended)
- npm (included with Node.js)
- Visual Studio Code
- A modern web browser

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/personal-expense-tracker.git
```

### 2. Navigate to the project folder

```bash
cd personal-expense-tracker
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the application

For development:

```bash
npm run dev
```

Alternatively:

```bash
npm start
```

### 5. Open the application

Visit the following address in your browser:

http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server status |
| GET | `/api/summary` | Retrieve income, expenses, and balance |
| GET | `/api/transactions` | Retrieve all transactions |
| POST | `/api/transactions` | Add a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/budget/:month` | Retrieve monthly budget and spending |
| PUT | `/api/budget/:month` | Create or update a monthly budget |

## Database

The application uses SQLite to store transaction and budget information locally.

- `transactions`: stores transaction type, amount, category, description, and date.
- `budgets`: stores monthly budget amounts.

## Future Enhancements

- User registration and secure login
- Separate financial records for each user
- Transaction search and filtering
- Export reports to CSV or PDF
- Downloadable monthly financial reports
- Recurring transactions and reminders
- Improved financial analytics

## Security and Limitations

This project is intended as a local learning prototype. It does not currently include user authentication or account separation. Do not expose it publicly with real financial information without adding appropriate authentication, authorization, input validation, and security protections.

## Author

Shahana Kishorekumar

## License

This project is available for educational purposes. Add an appropriate open-source license if you intend to permit reuse and redistribution.
