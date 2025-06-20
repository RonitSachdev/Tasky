# Tasky - Project Management System

A modern, full-stack project management application built with Rails API backend and Next.js frontend. Features organization-based user management, Kanban-style task boards, and real-time collaboration.

## 🚀 Features

### Core Functionality
- **Project Management**: Create, organize, and track projects
- **Task Management**: Full CRUD operations with Kanban drag-and-drop interface
- **Organization System**: Multi-tenant architecture with role-based access
- **User Management**: Admin controls for adding/removing team members
- **Authentication**: JWT-based secure authentication
- **Real-time Updates**: Instant task status updates via drag-and-drop

### User Roles
- **Admin**: Full organization management, user invitation/removal, all project access
- **Employee**: Project creation, task management, team collaboration
- **Trainee**: Task assignment, project participation

### UI/UX
- **Helvetica Design System**: Clean, Apple-inspired interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Drag & Drop**: Intuitive Kanban board with visual feedback
- **Modern Components**: Tailwind CSS with custom design system

## 🛠 Tech Stack

### Backend
- **Ruby on Rails 8.0** - API-only application
- **PostgreSQL** - Primary database
- **JWT Authentication** - Secure token-based auth
- **BCrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **@dnd-kit** - Drag and drop functionality
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Ruby** (v3.2 or higher)
- **Rails** (v8.0 or higher)
- **PostgreSQL** (v13 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

### 2. Backend Setup

```bash
# Navigate to backend directory
cd tasky-backend

# Install dependencies
bundle install

# Setup database
rails db:create
rails db:migrate
rails db:seed

# Start the Rails server
rails server -p 3001
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd tasky-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🗄 Database Setup

The application uses PostgreSQL. Make sure you have it installed and running.

### Database Configuration

Update `tasky-backend/config/database.yml` if needed:

```yaml
development:
  adapter: postgresql
  encoding: unicode
  database: tasky_development
  pool: 5
  username: your_username
  password: your_password
  host: localhost
  port: 5432
```

### Seed Data

The seed file creates sample data including:

- 2 Organizations (Acme Corporation, Startup Inc)
- 9 Users with different roles
- 6 Projects with tasks
- 4 Users without organizations (for testing admin functionality)

## 👥 Test Accounts

### Admin Accounts
```
Email: demo@example.com
Password: password123
Role: Admin at Acme Corporation

Email: alice@startup.com
Password: password123
Role: Admin at Startup Inc
```

### Employee Accounts
```
Email: john@acme.com
Password: password123
Role: Employee at Acme Corporation

Email: jane@acme.com
Password: password123
Role: Employee at Acme Corporation
```

### Trainee Account
```
Email: bob@startup.com
Password: password123
Role: Trainee at Startup Inc
```

### Users Without Organizations (for testing admin functionality)
```
Email: test1@example.com
Password: password123

Email: test2@example.com
Password: password123

Email: newuser@example.com
Password: password123
```

## 🔧 API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/signup     - Create new user account
POST /api/v1/auth/login      - User login
DELETE /api/v1/auth/logout   - User logout
GET /api/v1/auth/me          - Get current user info
```

### Organization Endpoints

```
GET /api/v1/organizations                    - List user's organizations
POST /api/v1/organizations                   - Create new organization
GET /api/v1/organizations/:id                - Get organization details
PUT /api/v1/organizations/:id                - Update organization
DELETE /api/v1/organizations/:id             - Delete organization
GET /api/v1/organizations/:id/users          - Get organization members
POST /api/v1/organizations/:id/add_user      - Add user to organization (Admin only)
DELETE /api/v1/organizations/:id/remove_user/:user_id - Remove user (Admin only)
GET /api/v1/organizations/search_users       - Search users without organizations
```

### Project Endpoints

```
GET /api/v1/projects                - List projects
POST /api/v1/projects               - Create project
GET /api/v1/projects/:id            - Get project details
PUT /api/v1/projects/:id            - Update project
DELETE /api/v1/projects/:id         - Delete project
GET /api/v1/projects/assignable_users - Get users for task assignment
```

### Task Endpoints

```
POST /api/v1/projects/:project_id/tasks    - Create task
GET /api/v1/tasks/:id                      - Get task details
PUT /api/v1/tasks/:id                      - Update task
DELETE /api/v1/tasks/:id                   - Delete task
```

## 🎯 User Workflows

### New User Onboarding

1. **Sign Up**: Create account with email and password
2. **Onboarding**: Choose to create organization or wait for invitation
3. **Organization Setup**: If creating new org, become admin
4. **Dashboard Access**: Access projects and tasks once in organization

### Admin User Management

1. **Access**: Admins see "Manage Users" button in dashboard
2. **Search**: Find users by email or name (minimum 3 characters)
3. **Add Users**: Select role (Admin/Employee/Trainee) and add to organization
4. **Remove Users**: Remove team members (cannot remove last admin)

### Project & Task Management

1. **Create Projects**: Add new projects with descriptions
2. **Task Creation**: Add tasks with priority, status, due dates, and assignees
3. **Kanban Board**: Drag tasks between columns (To Do, In Progress, Completed, Cancelled)
4. **Task Details**: Click tasks to view/edit full details

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for Admin/Employee/Trainee
- **Organization Isolation**: Users can only access their organization's data
- **Admin Safeguards**: Cannot remove last admin from organization
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests

## 🎨 Design System

### Helvetica UI
- **Typography**: Helvetica Neue font family
- **Colors**: Blue primary (#2563eb), semantic colors for status
- **Components**: Custom button styles, form elements, modals
- **Spacing**: Consistent spacing scale
- **Responsive**: Mobile-first responsive design

### Status Colors
- **Pending**: Gray
- **In Progress**: Blue
- **Completed**: Green
- **Cancelled**: Red

### Priority Colors
- **Low**: Green
- **Medium**: Yellow
- **High**: Orange
- **Urgent**: Red

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full feature set with optimal layout
- **Tablet**: Responsive grid layouts and touch-friendly interactions
- **Mobile**: Optimized for mobile usage with collapsible navigation

## 🧪 Testing

### Manual Testing Scenarios

1. **User Registration & Onboarding**
   - Sign up new user → Should redirect to onboarding
   - Create organization → Should become admin and access dashboard
   - Sign up another user → Should show onboarding options

2. **Admin User Management**
   - Login as admin → Access "Manage Users" 
   - Search for users without organizations
   - Add users with different roles
   - Try to remove last admin (should be prevented)

3. **Project & Task Management**
   - Create projects and tasks
   - Drag tasks between Kanban columns
   - Assign tasks to team members
   - Edit task details via modal

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

- None currently reported

## 📞 Support

For support, please open an issue on GitHub or contact [ronitsachdev007@gmail.com].
---

**Built with ❤️ using Rails and Next.js** 
