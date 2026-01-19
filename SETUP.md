# Quick Setup Guide

## Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- The `task_manager` database with the required schema

## Step 1: Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager
DB_PORT=3306
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm start
# or
npm run dev
```

## Step 2: Frontend Setup

```bash
cd client
npm install
```

Start frontend:
```bash
npm run dev
```

## Step 3: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Database Schema Note

If your `activity_logs` table doesn't have a `description` column, you can add it:

```sql
ALTER TABLE activity_logs ADD COLUMN description TEXT;
```

Or modify the activity logger to not use description if you prefer.

## Testing

1. Create a board from the dashboard
2. Add groups to the board
3. Create items with status, priority, and timeline
4. Add sub-items to items
5. View "My Work" page with filters
6. Create teams and assign them to items

## Troubleshooting

- **Database connection error**: Check your `.env` file credentials
- **CORS errors**: Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- **Email not working**: Configure SMTP settings in `.env` (optional for basic functionality)

