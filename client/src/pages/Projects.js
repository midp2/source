import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { formatDistanceToNow } from 'date-fns';
import { projectsAPI } from '../utils/api';
import { useAuth } from '../App';

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDialog, setOpenDialog] = useState(searchParams.get('action') === 'create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: projects = [], isLoading } = useQuery(
    'projects',
    projectsAPI.getAll
  );

  const createProjectMutation = useMutation(
    projectsAPI.create,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        setOpenDialog(false);
        reset();
      },
    }
  );

  const handleCreateProject = (data) => {
    createProjectMutation.mutate(data);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSearchParams({});
    reset();
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filterTab) {
      case 0: // All
        return matchesSearch;
      case 1: // Owned
        return matchesSearch && project.owner === user?.id;
      case 2: // Member
        return matchesSearch && project.members?.includes(user?.id) && project.owner !== user?.id;
      case 3: // Public
        return matchesSearch && project.visibility === 'public';
      default:
        return matchesSearch;
    }
  });

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
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Project
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Tabs value={filterTab} onChange={(e, newValue) => setFilterTab(newValue)}>
          <Tab label="All" />
          <Tab label="Owned" />
          <Tab label="Member" />
          <Tab label="Public" />
        </Tabs>
      </Box>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
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
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
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
                      icon={<GroupIcon />}
                      label={`${project.members?.length || 1}`}
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
                    View
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
              No projects found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          {createProjectMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createProjectMutation.error?.response?.data?.error || 'Failed to create project'}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(handleCreateProject)}>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              fullWidth
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', {
                required: 'Project name is required',
                minLength: {
                  value: 3,
                  message: 'Project name must be at least 3 characters',
                },
                pattern: {
                  value: /^[a-zA-Z0-9\s\-_]+$/,
                  message: 'Project name can only contain letters, numbers, spaces, hyphens, and underscores',
                },
              })}
            />
            
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              helperText="Optional description for your project"
              {...register('description')}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Visibility</InputLabel>
              <Select
                label="Visibility"
                defaultValue="private"
                {...register('visibility')}
              >
                <MenuItem value="private">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon fontSize="small" />
                    Private
                  </Box>
                </MenuItem>
                <MenuItem value="public">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PublicIcon fontSize="small" />
                    Public
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit(handleCreateProject)}
            variant="contained"
            disabled={createProjectMutation.isLoading}
          >
            {createProjectMutation.isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;