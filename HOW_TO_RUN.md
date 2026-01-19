# How to Run the Task Management App

## Prerequisites

Before running the app, make sure you have:
1. **Node.js** installed (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
2. **MySQL** installed and running - The `task_manager` database should already exist
3. **npm** (comes with Node.js)

## Quick Start Guide

### Step 1: Install Backend Dependencies

Open a terminal/command prompt and navigate to the server directory:

```bash
cd server
npm install
```

### Step 2: Configure Backend Environment

Create a `.env` file in the `server` directory:

**On Windows (PowerShell):**
```powershell
cd server
Copy-Item .env.example .env
```

**On Mac/Linux:**
```bash
cd server
cp .env.example .env
```

Then edit the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_manager
DB_PORT=3306
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Note:** Replace `your_mysql_password` with your actual MySQL password. Email settings are optional and can be left as-is for now.

### Step 3: Start the Backend Server

While still in the `server` directory:

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
```

**Keep this terminal window open!**

### Step 4: Install Frontend Dependencies

Open a **NEW** terminal/command prompt window and navigate to the client directory:

```bash
cd client
npm install
```

### Step 5: Start the Frontend Server

While in the `client` directory:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Step 6: Access the Application

Open your web browser and go to:
**http://localhost:3000**

## Running Both Servers Together

You need **TWO terminal windows** running simultaneously:

1. **Terminal 1** (Backend):
   ```bash
   cd server
   npm start
   ```

2. **Terminal 2** (Frontend):
   ```bash
   cd client
   npm run dev
   ```

## Troubleshooting

### Database Connection Error
- Make sure MySQL is running
- Check your `.env` file has correct database credentials
- Verify the `task_manager` database exists
- Test connection with: `mysql -u root -p` then `USE task_manager;`

### Port Already in Use
- Backend uses port 5000 - if it's taken, change `PORT` in `.env`
- Frontend uses port 3000 - Vite will suggest another port if 3000 is taken

### Module Not Found Errors
- Make sure you ran `npm install` in both `server` and `client` directories
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### CORS Errors
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL (default: http://localhost:3000)
- Ensure backend server is running before starting frontend

### Email Not Working
- Email functionality is optional - the app works without it
- If you want emails, configure SMTP settings in `.env`
- For Gmail, you need an "App Password" (not your regular password)

## Stopping the Servers

To stop the servers:
- Press `Ctrl + C` in each terminal window
- Or simply close the terminal windows

## What to Do Next

Once the app is running:
1. Create a board from the dashboard
2. Add groups to organize tasks
3. Create items (tasks) with status, priority, and timeline
4. Add sub-items to break down tasks
5. Create teams and assign them to items
6. View "My Work" to see filtered tasks

Enjoy your Task Management App! 🎉

