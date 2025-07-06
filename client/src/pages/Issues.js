import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  BugReport as BugReportIcon,
  Assignment as AssignmentIcon,
  Label as LabelIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as OpenIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { formatDistanceToNow } from 'date-fns';
import { issuesAPI, projectsAPI } from '../utils/api';
import { useAuth } from '../App';

const Issues = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState('all');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', id],
    () => projectsAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  const { data: issues = [], isLoading: issuesLoading, error } = useQuery(
    ['issues', id],
    () => issuesAPI.getAll(id),
    {
      enabled: !!id,
    }
  );

  const createIssueMutation = useMutation(
    (issueData) => issuesAPI.create(id, issueData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['issues', id]);
        setOpenDialog(false);
        reset();
      },
    }
  );

  const handleCreateIssue = (data) => {
    createIssueMutation.mutate(data);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'closed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <OpenIcon />;
      case 'closed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <AssignmentIcon />;
      default:
        return <BugReportIcon />;
    }
  };

  const filteredIssues = issues.filter(issue => {
    switch (filter) {
      case 'open':
        return issue.status === 'open';
      case 'closed':
        return issue.status === 'closed';
      case 'assigned':
        return issue.assignee === user?.id;
      case 'created':
        return issue.author === user?.id;
      default:
        return true;
    }
  });

  const openIssuesCount = issues.filter(issue => issue.status === 'open').length;
  const closedIssuesCount = issues.filter(issue => issue.status === 'closed').length;

  if (projectLoading || issuesLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error.response?.data?.error || 'Failed to load issues'}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <IconButton onClick={() => navigate(`/projects/${id}`)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {project?.name} / Issues
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Badge badgeContent={openIssuesCount} color="error">
              <Chip
                icon={<OpenIcon />}
                label="Open"
                variant={filter === 'open' ? 'filled' : 'outlined'}
                onClick={() => setFilter('open')}
                clickable
              />
            </Badge>
            <Badge badgeContent={closedIssuesCount} color="success">
              <Chip
                icon={<CheckCircleIcon />}
                label="Closed"
                variant={filter === 'closed' ? 'filled' : 'outlined'}
                onClick={() => setFilter('closed')}
                clickable
              />
            </Badge>
            <Chip
              label="All"
              variant={filter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setFilter('all')}
              clickable
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Issue
        </Button>
      </Box>

      {/* Issues List */}
      {filteredIssues.length > 0 ? (
        <Grid container spacing={2}>
          {filteredIssues.map((issue) => (
            <Grid item xs={12} key={issue.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getStatusIcon(issue.status)}
                        <Typography variant="h6" component="h3">
                          {issue.title}
                        </Typography>
                        <Chip
                          label={issue.status}
                          size="small"
                          color={getStatusColor(issue.status)}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {issue.description}
                      </Typography>

                      {issue.labels && issue.labels.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          {issue.labels.map((label, index) => (
                            <Chip
                              key={index}
                              label={label}
                              size="small"
                              variant="outlined"
                              icon={<LabelIcon />}
                            />
                          ))}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" />
                          <Typography variant="caption">
                            Created by {issue.author === user?.id ? 'You' : 'User'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                        </Typography>
                        {issue.assignee && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 20, height: 20 }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="caption">
                              Assigned to {issue.assignee === user?.id ? 'You' : 'User'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <BugReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No issues found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filter === 'all' ? 'No issues have been created yet' : `No ${filter} issues found`}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Create First Issue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Issue Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Issue</DialogTitle>
        <DialogContent>
          {createIssueMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createIssueMutation.error?.response?.data?.error || 'Failed to create issue'}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(handleCreateIssue)}>
            <TextField
              autoFocus
              margin="dense"
              label="Issue Title"
              fullWidth
              variant="outlined"
              error={!!errors.title}
              helperText={errors.title?.message}
              {...register('title', {
                required: 'Issue title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
              })}
            />
            
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Describe the issue in detail..."
              {...register('description')}
            />
            
            <TextField
              margin="dense"
              label="Labels"
              fullWidth
              variant="outlined"
              placeholder="bug, enhancement, help wanted (comma separated)"
              helperText="Enter labels separated by commas"
              {...register('labels', {
                setValueAs: (value) => value ? value.split(',').map(label => label.trim()) : [],
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit(handleCreateIssue)}
            variant="contained"
            disabled={createIssueMutation.isLoading}
          >
            {createIssueMutation.isLoading ? 'Creating...' : 'Create Issue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Issues;