# SpendWise

SpendWise is a full-stack personal finance management application for tracking accounts, income, expenses, and spending patterns through a secure web interface.

## Features

- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- User-specific financial data
- Account management
- Income and expense tracking
- Automatic account balance updates
- Insufficient-balance validation
- Fixed transaction categories
- Expense breakdown visualization
- Recent transaction history
- Transaction deletion with balance reversal
- Protected dashboard
- Responsive Bootstrap interface

## Tech Stack

### Frontend
- React
- JavaScript
- React Router
- Bootstrap
- Chart.js
- Fetch API

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT
- bcrypt
- Uvicorn

### DevOps
- Docker
- Docker Compose
- Git
- GitHub

## Architecture

React Frontend
        |
        | REST API
        v
FastAPI Backend
        |
        | SQLAlchemy ORM
        v
PostgreSQL Database

## Application Flow

User
 |
 v
React Frontend
 |
 | HTTP requests + JWT
 v
FastAPI
 |
 | SQLAlchemy
 v
PostgreSQL

## Authentication Flow

Register
   |
   v
Password hashed with bcrypt
   |
   v
User stored in PostgreSQL
   |
   v
Login
   |
   v
JWT access token
   |
   v
Protected API requests

## Core Data Model

User
 |
 +---- Accounts
 |       |
 |       +---- Transactions
 |
 +---- Budgets
 |
Category
 |
 +---- Transactions
 +---- Budgets

### Main Entities

- Users
- Accounts
- Categories
- Transactions
- Budgets

## Transaction Logic

For an expense:

Current Balance >= Expense
        |
        v
Transaction created
        |
        v
Balance decreases

If the expense exceeds the available balance:

Expense > Current Balance
        |
        v
Transaction rejected
        |
        v
Balance remains unchanged

For income:

Income added
    |
    v
Account balance increases

When a transaction is deleted, its effect on the account balance is reversed.

## Project Structure

SpendWise/
|
├── backend/
│   ├── .env
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models.py
│       ├── auth.py
│       ├── schemas.py
│       └── routers/
│           ├── auth.py
│           ├── accounts.py
│           └── transactions.py
|
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── package-lock.json
|
├── docker-compose.yml
└── README.md

## Running the Project Locally

### Prerequisites

Install:

- Python 3.x
- Node.js
- Docker Desktop
- Git

### 1. Start PostgreSQL

From the project root:

    docker compose up -d

### 2. Configure Backend

Create:

    backend/.env

Example:

    DATABASE_URL=postgresql+psycopg2://postgres:postgres@127.0.0.1:5434/spendwise
    SECRET_KEY=change-this-development-secret
    ACCESS_TOKEN_EXPIRE_MINUTES=30

### 3. Start Backend

    cd backend

Create the virtual environment:

    python -m venv .venv

Activate it on Windows:

    .venv\Scripts\activate

Install dependencies:

    pip install -r requirements.txt

Start FastAPI:

    python -m uvicorn app.main:app --reload

Backend:

    http://127.0.0.1:8000

API documentation:

    http://127.0.0.1:8000/docs

### 4. Start Frontend

Open another terminal:

    cd frontend
    npm install
    npm run dev

Frontend:

    http://localhost:5173

On Windows PowerShell, if npm is blocked by the execution policy, use npm.cmd instead.

## API Overview

### Authentication

    POST /auth/register
    POST /auth/login

### Accounts

    POST   /accounts/
    GET    /accounts/
    PUT    /accounts/{account_id}
    DELETE /accounts/{account_id}

### Transactions

    POST   /transactions/
    GET    /transactions/
    PUT    /transactions/{transaction_id}
    DELETE /transactions/{transaction_id}

### Other

    GET /categories
    GET /me
    GET /health

## Security

SpendWise uses:

- bcrypt password hashing
- JWT-based authentication
- Authorization headers for protected requests
- User ownership checks for financial data
- Environment variables for database credentials and application secrets
- CORS configuration for frontend-backend communication

Sensitive configuration such as .env is excluded from Git using .gitignore.

## Future Improvements

Potential future improvements include:

- Budget tracking and alerts
- CSV transaction import
- Recurring transaction detection
- Advanced monthly analytics
- Production cloud deployment
- Automated testing and CI/CD



