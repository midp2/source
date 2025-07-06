import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { projectsAPI } from '../utils/api';
import { useAuth } from '../App';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery(
    'projects',
    projectsAPI.getAll
  );

  const recentProjects = projects.slice(0, 6);

  const handleCreateProject = () => {
    navigate('/projects?action=create');
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.fullName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
          size="large"
        >
          New Project
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <FolderIcon />
                </Avatar>
                <Typography variant="h6">Projects</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {projects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <BugReportIcon />
                </Avatar>
                <Typography variant="h6">Issues</Typography>
              </Box>
              <Typography variant="h4" component="div">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Open issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CodeIcon />
                </Avatar>
                <Typography variant="h6">Commits</Typography>
              </Box>
              <Typography variant="h4" component="div">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <TimelineIcon />
                </Avatar>
                <Typography variant="h6">Activity</Typography>
              </Box>
              <Typography variant="h4" component="div">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent activity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Projects */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Recent Projects
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/projects')}
          >
            View All
          </Button>
        </Box>

        {recentProjects.length > 0 ? (
          <Grid container spacing={3}>
            {recentProjects.map((project) => (
              <Grid item xs={12} md={6} key={project.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {project.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <StarIcon />
                        </IconButton>
                        {project.visibility === 'public' ? (
                          <PublicIcon color="action" />
                        ) : (
                          <LockIcon color="action" />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description || 'No description available'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={project.visibility}
                        size="small"
                        variant="outlined"
                        color={project.visibility === 'public' ? 'success' : 'default'}
                      />
                      <Chip
                        label={`${project.members?.length || 1} member${project.members?.length !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleViewProject(project.id)}
                    >
                      View Project
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigate(`/projects/${project.id}/repository`)}
                    >
                      Repository
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No projects yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started by creating your first project
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
              >
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Recent Activity */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Recent Activity
        </Typography>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No recent activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your project activity will appear here
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;