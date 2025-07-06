import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Button,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  Folder as FolderIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Description as DescriptionIcon,
  Timeline as TimelineIcon,
  Commit as CommitIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { projectsAPI } from '../utils/api';
import { useAuth } from '../App';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const { data: project, isLoading, error } = useQuery(
    ['project', id],
    () => projectsAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error.response?.data?.error || 'Failed to load project'}
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Project not found
      </Alert>
    );
  }

  const isOwner = project.owner === user?.id;
  const isMember = project.members?.includes(user?.id);

  return (
    <Box>
      {/* Project Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" component="h1">
                {project.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  icon={project.visibility === 'public' ? <PublicIcon /> : <LockIcon />}
                  label={project.visibility}
                  size="small"
                  color={project.visibility === 'public' ? 'success' : 'default'}
                />
                <Chip
                  icon={<GroupIcon />}
                  label={`${project.members?.length || 1} member${project.members?.length !== 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {project.description || 'No description available'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<StarIcon />}
              size="small"
            >
              Star
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/projects/${id}/repository`)}
            >
              Repository
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" icon={<DescriptionIcon />} />
          <Tab label="Repository" icon={<CodeIcon />} />
          <Tab label="Issues" icon={<BugReportIcon />} />
          <Tab label="Activity" icon={<TimelineIcon />} />
          {isOwner && <Tab label="Settings" icon={<SettingsIcon />} />}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Project Stats */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Activity
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Commits
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error">
                        0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Issues
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success">
                        0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Merge Requests
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Commits
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CommitIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No commits yet
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Info
                  </Typography>
                  <List disablePadding>
                    <ListItem disablePadding>
                      <ListItemIcon>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Default Branch"
                        secondary={project.defaultBranch || 'main'}
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon>
                        <GroupIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Members"
                        secondary={`${project.members?.length || 1} member${project.members?.length !== 1 ? 's' : ''}`}
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon>
                        {project.visibility === 'public' ? <PublicIcon /> : <LockIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary="Visibility"
                        secondary={project.visibility}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CodeIcon />}
                      onClick={() => navigate(`/projects/${id}/repository`)}
                      fullWidth
                    >
                      View Repository
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<BugReportIcon />}
                      onClick={() => navigate(`/projects/${id}/issues`)}
                      fullWidth
                    >
                      View Issues
                    </Button>
                    {isOwner && (
                      <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => setTabValue(4)}
                        fullWidth
                      >
                        Project Settings
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate(`/projects/${id}/repository`)}
              sx={{ mb: 2 }}
            >
              Go to Repository
            </Button>
            <Typography variant="body1" color="text.secondary">
              Repository view will be displayed here
            </Typography>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate(`/projects/${id}/issues`)}
              sx={{ mb: 2 }}
            >
              Go to Issues
            </Button>
            <Typography variant="body1" color="text.secondary">
              Issues will be displayed here
            </Typography>
          </Box>
        )}

        {tabValue === 3 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No activity yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Project activity will appear here
              </Typography>
            </CardContent>
          </Card>
        )}

        {tabValue === 4 && isOwner && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Project settings will be available here
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ProjectDetail;