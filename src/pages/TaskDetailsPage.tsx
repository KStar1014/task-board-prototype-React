import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Grid,
  Card,
  CardMedia,
  Paper,
} from '@mui/material';
import { Favorite, FavoriteBorder, Edit, Delete, ArrowBack, AttachFile } from '@mui/icons-material';
import { Task } from '../types/Task';
import { format } from 'date-fns';
import { useBoardState } from '../hooks/useBoardState';

export const TaskDetailsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    columns,
    updateTask,
    deleteTask,
    addAttachment,
    removeAttachment,
    getSortedTasks,
  } = useBoardState();

  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (taskId) {
      // Find the task across all columns
      const foundTask = columns
        .flatMap(col => getSortedTasks(col.id))
        .find(t => t.id === taskId);
      
      if (foundTask) {
        setTask(foundTask);
      } else {
        // Task not found, redirect to home
        navigate('/');
      }
    }
  }, [taskId, columns, getSortedTasks, navigate]);

  // Update task when columns change
  useEffect(() => {
    if (taskId && task) {
      const updatedTask = columns
        .flatMap(col => getSortedTasks(col.id))
        .find(t => t.id === taskId);
      if (updatedTask) {
        setTask(updatedTask);
      }
    }
  }, [columns, taskId, getSortedTasks, task]);

  if (!task) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6">Task not found</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && task) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          await addAttachment(task.id, file);
          // Refresh task
          const updatedTask = columns
            .flatMap(col => getSortedTasks(col.id))
            .find(t => t.id === task.id);
          if (updatedTask) {
            setTask(updatedTask);
          }
        }
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = () => {
    navigate(`/?edit=${task.id}`, { replace: true });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    navigate('/');
  };

  const handleToggleFavorite = () => {
    updateTask(task.id, { isFavorite: !task.isFavorite });
    setTask({ ...task, isFavorite: !task.isFavorite });
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    removeAttachment(task.id, attachmentId);
    // Refresh task
    const updatedTask = columns
      .flatMap(col => getSortedTasks(col.id))
      .find(t => t.id === task.id);
    if (updatedTask) {
      setTask(updatedTask);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton
              onClick={() => navigate('/')}
              aria-label="Go back"
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1">
              {task.name}
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={handleToggleFavorite}
              aria-label={task.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {task.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          {task.deadline && (
            <Chip
              label={`Deadline: ${format(new Date(task.deadline), 'MMM dd, yyyy')}`}
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          <Chip
            label={task.isFavorite ? 'Favorite' : 'Not Favorite'}
            color={task.isFavorite ? 'error' : 'default'}
            sx={{ mb: 1 }}
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {task.description || 'No description provided.'}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Attachments ({(task.attachments && task.attachments.length) || 0})
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AttachFile />}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Add attachment"
          >
            Add Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            aria-label="File input"
          />
        </Box>

        {task.attachments && task.attachments.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {task.attachments.map((attachment) => (
              <Grid item xs={12} sm={6} md={4} key={attachment.id}>
                <Card>
                  <CardMedia
                    component="img"
                    image={attachment.data}
                    alt={attachment.name}
                    sx={{ height: 200, objectFit: 'cover' }}
                  />
                  <Box p={1}>
                    <Typography variant="caption" noWrap>
                      {attachment.name}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      sx={{ mt: 0.5 }}
                      aria-label={`Remove ${attachment.name}`}
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No attachments yet.
          </Typography>
        )}

        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button onClick={handleEdit} variant="outlined" aria-label="Edit task">
            Edit
          </Button>
          <Button onClick={handleDelete} color="error" variant="outlined" aria-label="Delete task">
            Delete
          </Button>
          <Button onClick={() => navigate('/')} variant="contained" aria-label="Close">
            Close
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

