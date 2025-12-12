import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Grid,
  Card,
  CardMedia,
} from '@mui/material';
import { Favorite, FavoriteBorder, Edit, Delete, Close, AttachFile } from '@mui/icons-material';
import { Task } from '../types/Task';
import { format } from 'date-fns';

interface TaskDetailsProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onAddAttachment: (file: File) => Promise<void>;
  onRemoveAttachment: (attachmentId: string) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  open,
  onClose,
  task,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!task) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          await onAddAttachment(file);
        }
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="task-details-dialog"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="task-details-dialog">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h2">
            {task.name}
          </Typography>
          <Box>
            <IconButton
              onClick={onToggleFavorite}
              aria-label={task.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {task.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton onClick={onClose} aria-label="Close">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
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
          <Grid container spacing={2}>
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
                      onClick={() => onRemoveAttachment(attachment.id)}
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
          <Typography variant="body2" color="text.secondary">
            No attachments yet.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onEdit} variant="outlined" aria-label="Edit task">
          Edit
        </Button>
        <Button onClick={onDelete} color="error" variant="outlined" aria-label="Delete task">
          Delete
        </Button>
        <Button onClick={onClose} variant="contained" aria-label="Close">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

