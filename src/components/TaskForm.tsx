import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
} from '@mui/material';
import { AttachFile, Delete } from '@mui/icons-material';
import { Task } from '../types/Task';
import { Column } from '../types/Column';
import { Attachment } from '../types/Attachment';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>, 
    files?: File[],
    removedAttachmentIds?: string[]
  ) => Promise<void> | void;
  columns: Column[];
  initialTask?: Task;
  defaultColumnId?: string;
  title?: string;
}

type ImageItem = 
  | { type: 'existing'; attachment: Attachment }
  | { type: 'new'; file: File; preview: string };

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSubmit,
  columns,
  initialTask,
  defaultColumnId,
  title = 'Create Task',
}) => {
  const [titleValue, setTitleValue] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [columnId, setColumnId] = useState(columns[0]?.id || '');
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (initialTask) {
        setTitleValue(initialTask.name);
        setDescription(initialTask.description);
        setDeadline(initialTask.deadline || '');
        setFavorite(initialTask.isFavorite);
        setColumnId(initialTask.columnId);
        
        // Load existing attachments as image items
        const existingAttachments: ImageItem[] = (initialTask.attachments || [])
          .filter(att => att.type.startsWith('image/'))
          .map(att => ({ type: 'existing' as const, attachment: att }));
        setImageItems(existingAttachments);
        setRemovedAttachmentIds(new Set());
      } else {
        setTitleValue('');
        setDescription('');
        setDeadline('');
        setFavorite(false);
        setColumnId(defaultColumnId || columns[0]?.id || '');
        setImageItems([]);
        setRemovedAttachmentIds(new Set());
      }
    }
  }, [open, initialTask, columns, defaultColumnId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      
      // Create preview URLs for each file
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          setImageItems(prev => [...prev, { type: 'new', file, preview: url }]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const item = imageItems[index];
    if (item.type === 'existing') {
      // Mark existing attachment for removal
      setRemovedAttachmentIds(prev => new Set(prev).add(item.attachment.id));
    }
    // Remove from display
    setImageItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (titleValue.trim() && columnId) {
      // Get only new files (not existing attachments)
      const newFiles = imageItems
        .filter(item => item.type === 'new')
        .map(item => item.file);
      
      // Get removed attachment IDs
      const removedIds = Array.from(removedAttachmentIds);
      
      await onSubmit({
        name: titleValue.trim(),
        description: description.trim(),
        deadline: deadline.trim() || null,
        isFavorite: favorite,
        columnId,
        imageUrl: null,
      }, newFiles.length > 0 ? newFiles : undefined, removedIds.length > 0 ? removedIds : undefined);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="task-form-dialog" maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle id="task-form-dialog">{title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            required
            aria-required="true"
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            variant="outlined"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Column"
            select
            fullWidth
            variant="outlined"
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            SelectProps={{
              native: true,
            }}
            required
            aria-required="true"
            sx={{ mt: 2 }}
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                aria-label="Mark as favorite"
              />
            }
            label="Favorite"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Images ({imageItems.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AttachFile />}
                onClick={() => fileInputRef.current?.click()}
                size="small"
                aria-label="Add image"
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
            {imageItems.length > 0 && (
              <Grid container spacing={2}>
                {imageItems.map((item, index) => {
                  const key = item.type === 'existing' 
                    ? `existing-${item.attachment.id}` 
                    : `new-${index}-${item.file.name}`;
                  return (
                    <Grid item xs={6} sm={4} key={key}>
                      <Card>
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            image={item.type === 'existing' ? item.attachment.data : item.preview}
                            alt={item.type === 'existing' ? item.attachment.name : item.file.name}
                            sx={{ height: 120, objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveImage(index)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              },
                            }}
                            aria-label={`Remove ${item.type === 'existing' ? item.attachment.name : item.file.name}`}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box p={1}>
                          <Typography variant="caption" noWrap title={item.type === 'existing' ? item.attachment.name : item.file.name}>
                            {item.type === 'existing' ? item.attachment.name : item.file.name}
                          </Typography>
                          {item.type === 'existing' && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                              Existing
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} aria-label="Cancel">
            Cancel
          </Button>
          <Button type="submit" variant="contained" aria-label="Submit">
            {initialTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

