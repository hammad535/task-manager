# Task Management Tool - Monday.com Clone (Phase 1)

A full-stack task management application inspired by Monday.com, built with Node.js, Express, MySQL, and React.

## Features

### Backend Features
- ✅ Board management (Create, Read, Delete)
- ✅ Group management within boards
- ✅ Item (Task) CRUD operations with columns:
  - Status (Not Started, In Progress, Done, Stuck)
  - Priority (Low, Medium, High, Critical)
  - Timeline (start and end dates)
  - Multi-assignee support
- ✅ Sub-item management
- ✅ Team management and assignment
- ✅ My Work view with filters (All, This Week, Upcoming)
- ✅ Activity logging for all item changes
- ✅ Email notifications on status changes
- ✅ Recurring task automation (daily/weekly/monthly)

### Frontend Features
- ✅ Board Dashboard
- ✅ Board detail view with Groups → Items → Sub-items hierarchy
- ✅ My Work page with date filters
- ✅ Create/Edit Item modals with dropdowns
- ✅ Team and individual assignment
- ✅ Activity log display

## Tech Stack

### Backend
- Node.js with Express
- MySQL (mysql2)
- node-cron for recurring tasks
- nodemailer for email notifications

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios for API calls
- Vite for build tooling

## Project Structure

```
Task/
├── server/
│   ├── config/
│   │   ├── database.js
│   │   └── email.js
│   ├── controllers/
│   │   ├── boardController.js
│   │   ├── groupController.js
│   │   ├── itemController.js
│   │   ├── subItemController.js
│   │   ├── teamController.js
│   │   └── myWorkController.js
│   ├── routes/
│   │   ├── boardRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── subItemRoutes.js
│   │   ├── teamRoutes.js
│   │   └── myWorkRoutes.js
│   ├── utils/
│   │   ├── activityLogger.js
│   │   └── recurringTasks.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ItemCard.jsx
    │   │   ├── ItemModal.jsx
    │   │   └── SubItemModal.jsx
    │   ├── pages/
    │   │   ├── BoardDashboard.jsx
    │   │   ├── BoardDetail.jsx
    │   │   └── MyWork.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- The `task_manager` database should already exist with the required schema

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager
DB_PORT=3306

PORT=5000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get board by ID
- `POST /api/boards` - Create board
- `DELETE /api/boards/:id` - Delete board

### Groups
- `GET /api/groups/board/:boardId` - Get groups by board
- `POST /api/groups` - Create group
- `DELETE /api/groups/:id` - Delete group

### Items
- `GET /api/items` - Get items (with optional query params: board_id, group_id)
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Sub-items
- `GET /api/subitems/parent/:parentItemId` - Get sub-items by parent
- `GET /api/subitems/:id` - Get sub-item by ID
- `POST /api/subitems` - Create sub-item
- `PUT /api/subitems/:id` - Update sub-item
- `DELETE /api/subitems/:id` - Delete sub-item

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/assign/:itemId` - Assign team to item

### My Work
- `GET /api/mywork?userId=1&filter=this_week` - Get user's work items

## Database Schema

The application expects the following tables:
- `users` (id, name, email, password, role)
- `teams` (id, name)
- `team_members` (team_id, user_id)
- `boards` (id, name, created_by)
- `groups` (id, name, board_id)
- `items` (id, title, description, group_id, board_id, status, priority, timeline_start, timeline_end)
- `item_assignees` (item_id, user_id)
- `sub_items` (id, title, description, parent_item_id, status, priority, timeline_start, timeline_end)
- `activity_logs` (id, item_id, user_id, action, description, timestamp)
- `recurring_rules` (id, item_id, frequency, next_trigger_date)

## Notes

- Email notifications require proper SMTP configuration in `.env`
- Recurring tasks are processed daily at midnight via node-cron
- The frontend uses a proxy to communicate with the backend API
- User authentication is not implemented in Phase 1 (userId is hardcoded for demo purposes)

## Future Enhancements (Phase 2+)

- User authentication and authorization
- Real-time updates with WebSockets
- Advanced filtering and search
- Drag-and-drop task reordering
- File attachments
- Comments on items
- Dashboard analytics
- Mobile responsive improvements

