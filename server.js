const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const simpleGit = require('simple-git');
const archiver = require('archiver');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const REPOS_DIR = path.join(DATA_DIR, 'repositories');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const ISSUES_FILE = path.join(DATA_DIR, 'issues.json');

// Initialize data directories
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(REPOS_DIR);

// Initialize data files
const initializeDataFiles = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeJsonSync(USERS_FILE, []);
  }
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeJsonSync(PROJECTS_FILE, []);
  }
  if (!fs.existsSync(ISSUES_FILE)) {
    fs.writeJsonSync(ISSUES_FILE, []);
  }
};

initializeDataFiles();

// Multer configuration for file uploads
const upload = multer({
  dest: path.join(DATA_DIR, 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper functions
const readJsonFile = (filePath) => {
  try {
    return fs.readJsonSync(filePath);
  } catch (error) {
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  fs.writeJsonSync(filePath, data, { spaces: 2 });
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const users = readJsonFile(USERS_FILE);
    
    // Check if user already exists
    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      fullName: fullName || username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || username)}&background=random`,
      createdAt: new Date().toISOString(),
      isAdmin: users.length === 0 // First user is admin
    };

    users.push(newUser);
    writeJsonFile(USERS_FILE, users);

    const { password: _, ...userWithoutPassword } = newUser;
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = readJsonFile(USERS_FILE);
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// User routes
app.get('/api/users/profile', authenticateToken, (req, res) => {
  res.json(req.user);
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email, currentPassword, newPassword } = req.body;
    const users = readJsonFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];
    
    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword || !await bcrypt.compare(currentPassword, user.password)) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    user.updatedAt = new Date().toISOString();

    users[userIndex] = user;
    writeJsonFile(USERS_FILE, users);

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Project routes
app.get('/api/projects', authenticateToken, (req, res) => {
  const projects = readJsonFile(PROJECTS_FILE);
  const userProjects = projects.filter(p => 
    p.members.includes(req.user.id) || p.owner === req.user.id
  );
  res.json(userProjects);
});

app.post('/api/projects', authenticateToken, (req, res) => {
  try {
    const { name, description, visibility = 'private' } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projects = readJsonFile(PROJECTS_FILE);
    
    const newProject = {
      id: uuidv4(),
      name,
      description: description || '',
      visibility,
      owner: req.user.id,
      members: [req.user.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      repositoryPath: path.join(REPOS_DIR, `${req.user.username}-${name}`),
      defaultBranch: 'main'
    };

    projects.push(newProject);
    writeJsonFile(PROJECTS_FILE, projects);

    // Initialize git repository
    const repoPath = newProject.repositoryPath;
    fs.ensureDirSync(repoPath);
    
    const git = simpleGit(repoPath);
    git.init().then(() => {
      // Create initial README
      const readmeContent = `# ${name}\n\n${description || 'A new project'}\n`;
      fs.writeFileSync(path.join(repoPath, 'README.md'), readmeContent);
      
      git.add('.').then(() => {
        git.commit('Initial commit').catch(console.error);
      });
    });

    res.json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Project creation failed' });
  }
});

app.get('/api/projects/:id', authenticateToken, (req, res) => {
  const projects = readJsonFile(PROJECTS_FILE);
  const project = projects.find(p => p.id === req.params.id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (!project.members.includes(req.user.id) && project.owner !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(project);
});

// Repository file operations
app.get('/api/projects/:id/files', authenticateToken, (req, res) => {
  try {
    const projects = readJsonFile(PROJECTS_FILE);
    const project = projects.find(p => p.id === req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { path: filePath = '' } = req.query;
    const fullPath = path.join(project.repositoryPath, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }

    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(fullPath).map(file => {
        const fileStats = fs.statSync(path.join(fullPath, file));
        return {
          name: file,
          type: fileStats.isDirectory() ? 'directory' : 'file',
          size: fileStats.size,
          modifiedAt: fileStats.mtime.toISOString()
        };
      });
      res.json(files);
    } else {
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.json({ content, type: 'file' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read files' });
  }
});

app.post('/api/projects/:id/files', authenticateToken, upload.single('file'), (req, res) => {
  try {
    const projects = readJsonFile(PROJECTS_FILE);
    const project = projects.find(p => p.id === req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { path: filePath, content, message } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const fullPath = path.join(project.repositoryPath, filePath);
    
    // Ensure directory exists
    fs.ensureDirSync(path.dirname(fullPath));
    
    if (req.file) {
      // Handle file upload
      fs.moveSync(req.file.path, fullPath);
    } else if (content !== undefined) {
      // Handle text content
      fs.writeFileSync(fullPath, content);
    } else {
      return res.status(400).json({ error: 'No file or content provided' });
    }

    // Git commit
    const git = simpleGit(project.repositoryPath);
    git.add(filePath).then(() => {
      git.commit(message || `Add ${filePath}`).catch(console.error);
    });

    res.json({ message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Issues routes
app.get('/api/projects/:id/issues', authenticateToken, (req, res) => {
  const issues = readJsonFile(ISSUES_FILE);
  const projectIssues = issues.filter(issue => issue.projectId === req.params.id);
  res.json(projectIssues);
});

app.post('/api/projects/:id/issues', authenticateToken, (req, res) => {
  try {
    const { title, description, labels = [], assignee } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Issue title is required' });
    }

    const issues = readJsonFile(ISSUES_FILE);
    
    const newIssue = {
      id: uuidv4(),
      projectId: req.params.id,
      title,
      description: description || '',
      labels,
      assignee,
      author: req.user.id,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    issues.push(newIssue);
    writeJsonFile(ISSUES_FILE, issues);

    res.json(newIssue);
  } catch (error) {
    res.status(500).json({ error: 'Issue creation failed' });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`GitLab Clone server running on port ${PORT}`);
});