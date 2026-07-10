# Thiqa Backend

Tourism agency operations and finance API.

## Setup

1. Copy `.env.example` to `.env` and configure MySQL credentials
2. Ensure MySQL is running and create database:
   ```bash
   npm install
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```
3. Start server:
   ```bash
   npm run dev
   ```

## Demo Users

| Username | Role | Password |
|----------|------|----------|
| superadmin | Super Admin | admin123 |
| officeadmin | Office Admin (Abdul Rahman) | admin123 |
| accountant | Accountant (Salah) | admin123 |
| employee | Field Employee / Driver | admin123 |

## API

Base URL: `http://localhost:3001/api`

Health check: `GET /api/health`
