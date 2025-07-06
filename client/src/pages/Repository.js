import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, formatBytes } from 'date-fns';
import Editor from '@monaco-editor/react';
import { projectsAPI } from '../utils/api';
import { useAuth } from '../App';

const Repository = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPath, setCurrentPath] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', id],
    () => projectsAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  const { data: files = [], isLoading: filesLoading, error } = useQuery(
    ['projectFiles', id, currentPath],
    () => projectsAPI.getFiles(id, currentPath),
    {
      enabled: !!id,
    }
  );

  const createFileMutation = useMutation(
    (fileData) => projectsAPI.createFile(id, fileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projectFiles', id]);
        setOpenDialog(false);
        setNewFileName('');
        setFileContent('');
        setCommitMessage('');
      },
    }
  );

  const handleNavigate = (path) => {
    setCurrentPath(path);
  };

  const handleFileClick = (file) => {
    if (file.type === 'directory') {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      setCurrentPath(newPath);
    } else {
      // Load file content for editing
      setEditingFile(file);
    }
  };

  const handleCreateFile = () => {
    if (!newFileName || !fileContent) return;

    const filePath = currentPath ? `${currentPath}/${newFileName}` : newFileName;
    createFileMutation.mutate({
      path: filePath,
      content: fileContent,
      message: commitMessage || `Add ${newFileName}`,
    });
  };

  const handleSaveFile = () => {
    if (!editingFile) return;

    const filePath = currentPath ? `${currentPath}/${editingFile.name}` : editingFile.name;
    createFileMutation.mutate({
      path: filePath,
      content: fileContent,
      message: commitMessage || `Update ${editingFile.name}`,
    });
    setEditingFile(null);
  };

  const getFileIcon = (file) => {
    return file.type === 'directory' ? <FolderIcon /> : <FileIcon />;
  };

  const getFileLanguage = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      xml: 'xml',
      sql: 'sql',
      php: 'php',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      kt: 'kotlin',
      swift: 'swift',
    };
    return languageMap[extension] || 'plaintext';
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  if (projectLoading || filesLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error.response?.data?.error || 'Failed to load repository'}
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
              {project?.name} / Repository
            </Typography>
          </Box>
          <Breadcrumbs>
            <Link
              component="button"
              variant="body2"
              onClick={() => setCurrentPath('')}
              sx={{ cursor: 'pointer' }}
            >
              Root
            </Link>
            {breadcrumbs.map((crumb, index) => {
              const path = breadcrumbs.slice(0, index + 1).join('/');
              return (
                <Link
                  key={path}
                  component="button"
                  variant="body2"
                  onClick={() => setCurrentPath(path)}
                  sx={{ cursor: 'pointer' }}
                >
                  {crumb}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New File
        </Button>
      </Box>

      {/* File Browser */}
      {!editingFile && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Last Modified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(files) && files.map((file) => (
                  <TableRow key={file.name} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFileIcon(file)}
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleFileClick(file)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {file.name}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {file.type === 'file' ? formatBytes(file.size || 0) : '-'}
                    </TableCell>
                    <TableCell>
                      {file.modifiedAt ? formatDistanceToNow(new Date(file.modifiedAt), { addSuffix: true }) : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleFileClick(file)}>
                        {file.type === 'file' ? <EditIcon /> : <FolderIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {(!Array.isArray(files) || files.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No files in this directory
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* File Editor */}
      {editingFile && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => setEditingFile(null)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6">
                Editing: {editingFile.name}
              </Typography>
              <Chip
                label={getFileLanguage(editingFile.name)}
                size="small"
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setEditingFile(null)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveFile}
                disabled={createFileMutation.isLoading}
              >
                Save
              </Button>
            </Box>
          </Box>
          
          <Paper sx={{ mb: 2, p: 2 }}>
            <TextField
              fullWidth
              label="Commit Message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder={`Update ${editingFile.name}`}
              size="small"
            />
          </Paper>

          <Paper sx={{ height: '70vh', overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={getFileLanguage(editingFile.name)}
              value={fileContent}
              onChange={(value) => setFileContent(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </Paper>
        </Box>
      )}

      {/* Create File Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="e.g., index.js, README.md"
          />
          <TextField
            margin="dense"
            label="Commit Message"
            fullWidth
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Add new file"
          />
          <Box sx={{ mt: 2, height: '400px' }}>
            <Editor
              height="100%"
              language={getFileLanguage(newFileName)}
              value={fileContent}
              onChange={(value) => setFileContent(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateFile}
            variant="contained"
            disabled={!newFileName || createFileMutation.isLoading}
          >
            {createFileMutation.isLoading ? 'Creating...' : 'Create File'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Repository;