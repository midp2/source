import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Folder as FolderIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { authAPI, projectsAPI } from '../utils/api';
import { useAuth } from '../App';

const Profile = () => {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  const { data: projects = [], isLoading: projectsLoading } = useQuery(
    'projects',
    projectsAPI.getAll
  );

  const updateProfileMutation = useMutation(
    authAPI.updateProfile,
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('profile');
        // Update user in auth context
        login(user.token, response.data);
        setOpenEditDialog(false);
        reset();
      },
    }
  );

  const updatePasswordMutation = useMutation(
    authAPI.updateProfile,
    {
      onSuccess: () => {
        setOpenPasswordDialog(false);
        resetPassword();
      },
    }
  );

  const handleUpdateProfile = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleUpdatePassword = (data) => {
    updatePasswordMutation.mutate(data);
  };

  const userProjects = projects.filter(p => p.owner === user?.id);
  const memberProjects = projects.filter(p => p.members?.includes(user?.id) && p.owner !== user?.id);

  if (projectsLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={user?.avatar}
                alt={user?.fullName}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {user?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{user?.username}
              </Typography>
              <Chip
                label={user?.isAdmin ? 'Admin' : 'User'}
                color={user?.isAdmin ? 'primary' : 'default'}
                size="small"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenEditDialog(true)}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Username"
                    secondary={user?.username}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                startIcon={<SecurityIcon />}
                onClick={() => setOpenPasswordDialog(true)}
                fullWidth
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity & Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <FolderIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {userProjects.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects Owned
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {memberProjects.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects Member
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <BugReportIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h4" component="div">
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issues Created
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CodeIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" component="div">
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commits
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Projects */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Projects
                  </Typography>
                  {userProjects.length > 0 ? (
                    <List>
                      {userProjects.map((project) => (
                        <ListItem key={project.id} divider>
                          <ListItemIcon>
                            <FolderIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={project.name}
                            secondary={project.description || 'No description'}
                          />
                          <Chip
                            label={project.visibility}
                            size="small"
                            color={project.visibility === 'public' ? 'success' : 'default'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      You haven't created any projects yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <TimelineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {updateProfileMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateProfileMutation.error?.response?.data?.error || 'Failed to update profile'}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            {...register('fullName', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Full name must be at least 2 characters',
              },
            })}
          />
          
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            type="email"
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit(handleUpdateProfile)}
            variant="contained"
            disabled={updateProfileMutation.isLoading}
          >
            {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {updatePasswordMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updatePasswordMutation.error?.response?.data?.error || 'Failed to update password'}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            fullWidth
            type="password"
            variant="outlined"
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword', {
              required: 'Current password is required',
            })}
          />
          
          <TextField
            margin="dense"
            label="New Password"
            fullWidth
            type="password"
            variant="outlined"
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePasswordSubmit(handleUpdatePassword)}
            variant="contained"
            disabled={updatePasswordMutation.isLoading}
          >
            {updatePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;