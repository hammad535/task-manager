# 🚀 Quick Start Guide

## Step 1: Set Your MySQL Password

Edit the file: `server\.env`

Change this line:
```
DB_PASSWORD=
```

To your MySQL password:
```
DB_PASSWORD=your_mysql_password_here
```

## Step 2: Install Dependencies & Run Backend

**Option A: Using Windows Batch File**
- Double-click `START_BACKEND.bat`

**Option B: Using Command Line**
```powershell
cd server
npm install
npm start
```

You should see: `✅ Database connected successfully` and `🚀 Server running on port 5000`

## Step 3: Install Dependencies & Run Frontend (New Terminal)

**Option A: Using Windows Batch File**
- Double-click `START_FRONTEND.bat` (in a new window)

**Option B: Using Command Line (Open NEW terminal)**
```powershell
cd client
npm install
npm run dev
```

You should see: `Local: http://localhost:3000/`

## Step 4: Open the App

Open your browser and go to: **http://localhost:3000**

---

## ⚠️ Important Notes:

1. **You need TWO terminals running** - one for backend, one for frontend
2. **Backend must run first** - make sure backend is running before starting frontend
3. **Database must exist** - make sure `task_manager` database exists in MySQL
4. **MySQL must be running** - start MySQL service if it's not running

## 🐛 Troubleshooting:

- **Can't connect to database?** Check your MySQL password in `server\.env`
- **Port 5000 in use?** Change `PORT` in `server\.env` to another number
- **Frontend can't connect?** Make sure backend is running first

