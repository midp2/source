# GitLab Clone - Complete DevOps Platform

A comprehensive GitLab duplicate built with modern web technologies, featuring repository management, issue tracking, project management, and Progressive Web App (PWA) capabilities for Android.

## ✨ Features

### 🚀 Core Features
- **User Authentication & Authorization** - Secure JWT-based authentication
- **Project Management** - Create, manage, and organize projects
- **Repository Management** - Full file browser and code editor with syntax highlighting
- **Issue Tracking** - Comprehensive issue management system
- **Real-time Updates** - WebSocket integration for live updates
- **Progressive Web App** - Install on Android devices like a native app

### 🔧 Technical Features
- **Modern UI/UX** - Material-UI based responsive design
- **Code Editor** - Monaco Editor with multi-language support
- **File Management** - Upload, edit, and manage project files
- **Git Integration** - Basic git operations and version control
- **Offline Support** - Service worker for offline functionality
- **Mobile Responsive** - Works seamlessly on all device sizes

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI library
- **Material-UI** - Component library and design system
- **Monaco Editor** - Advanced code editor
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time WebSocket server
- **JWT** - Authentication tokens
- **BCrypt** - Password hashing
- **Simple Git** - Git operations
- **Multer** - File upload handling

### Storage & Data
- **JSON Files** - Simple file-based data storage
- **File System** - Local repository storage
- **In-memory Caching** - Fast data access

## 📱 Progressive Web App (PWA)

This application is fully PWA-compliant and can be installed on Android devices:

### Android Installation
1. Open the app in Chrome browser on your Android device
2. Tap the menu (three dots) in the browser
3. Select "Add to Home Screen" or "Install App"
4. Follow the installation prompts
5. The app will appear on your home screen like a native app

### PWA Features
- **Offline Support** - Core functionality works without internet
- **App-like Experience** - Full-screen mode without browser UI
- **Background Sync** - Sync data when connection is restored
- **Push Notifications** - Receive notifications (when implemented)
- **Auto-updates** - App updates automatically

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Git (optional, for cloning)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gitlab-clone
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Build

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Frontend Configuration

Update `client/src/utils/api.js` for production:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-domain.com/api';
```

## 📖 Usage Guide

### Getting Started

1. **Create Account**
   - Visit the application URL
   - Click "Sign Up" to create a new account
   - The first user becomes an admin automatically

2. **Create First Project**
   - Click "New Project" from the dashboard
   - Fill in project details (name, description, visibility)
   - Click "Create Project"

3. **Manage Repository**
   - Navigate to your project
   - Click "Repository" to access file management
   - Create, edit, and organize files
   - Use the built-in code editor with syntax highlighting

4. **Track Issues**
   - Go to project "Issues" section
   - Create new issues with labels and descriptions
   - Assign issues to team members
   - Track issue status and progress

### Key Features

#### Project Management
- Create public or private projects
- Invite team members
- Set project descriptions and settings
- View project statistics and activity

#### Code Repository
- Browse project files and directories
- Create and edit files with syntax highlighting
- Support for 20+ programming languages
- Commit changes with custom messages
- View file history and modifications

#### Issue Tracking
- Create detailed issues with descriptions
- Add labels for categorization
- Assign issues to users
- Filter issues by status (open, closed, assigned)
- Track issue creation and modification dates

#### User Management
- User profiles with avatars
- Account settings and preferences
- Password change functionality
- Project membership management

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - BCrypt for secure password storage
- **Rate Limiting** - API request rate limiting
- **Input Validation** - Comprehensive input sanitization
- **CORS Protection** - Cross-origin request security
- **Helmet.js** - Security headers and protections

## 📱 Mobile & Android Support

### Responsive Design
- Optimized for mobile screens
- Touch-friendly interface
- Adaptive navigation

### Android PWA Features
- Native app-like experience
- Home screen installation
- Offline functionality
- Background synchronization
- Full-screen mode

### Installation on Android
The app can be installed directly from the browser:
1. Open in Chrome on Android
2. Look for "Add to Home Screen" prompt
3. Or use browser menu → "Install App"
4. App appears as native app icon

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Update documentation for new features
- Test on both desktop and mobile

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Project Endpoints
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/:id/files` - Browse project files
- `POST /api/projects/:id/files` - Create/update files

### Issue Endpoints
- `GET /api/projects/:id/issues` - List project issues
- `POST /api/projects/:id/issues` - Create new issue
- `PUT /api/projects/:id/issues/:issueId` - Update issue
- `DELETE /api/projects/:id/issues/:issueId` - Delete issue

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

**Dependencies not installing:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**PWA not installing on Android:**
- Ensure HTTPS is enabled (required for PWA)
- Check manifest.json is accessible
- Verify service worker is registered
- Clear browser cache and reload

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- Monaco Editor for the powerful code editor
- React.js community for excellent tooling
- Node.js and Express.js for reliable backend
- All contributors and testers

## 🚀 Deployment

### Heroku Deployment
1. Create Heroku app: `heroku create your-app-name`
2. Set environment variables: `heroku config:set JWT_SECRET=your-secret`
3. Deploy: `git push heroku main`

### Docker Deployment
```dockerfile
# Dockerfile included for containerized deployment
docker build -t gitlab-clone .
docker run -p 5000:5000 gitlab-clone
```

### Self-hosted
- Deploy on any Node.js hosting provider
- Ensure environment variables are set
- Configure HTTPS for PWA functionality

---

**Built with ❤️ for developers who need a complete DevOps platform**