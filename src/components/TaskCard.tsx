import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import { Favorite, FavoriteBorder, Edit, Delete } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/Task';
import { format } from 'date-fns';
import { TASK_TYPE } from '../dnd/dragConfig';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onClick: () => void;
  isDragging?: boolean;
  disableDrag?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
  isDragging: isDraggingOverlay = false,
  disableDrag = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: TASK_TYPE,
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDraggingOverlay ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        cursor: isDraggingOverlay ? 'grabbing' : 'grab',
        transform: isDragging ? 'scale(0.95)' : 'scale(1)',
        transition: isDraggingOverlay ? 'none' : 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: isDraggingOverlay ? 6 : 3,
          transform: isDraggingOverlay ? 'scale(1.02)' : 'scale(1.01)',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
        ...(isDragging && {
          boxShadow: 2,
        }),
      }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Task: ${task.name}`}
      {...(isDraggingOverlay ? {} : attributes)}
      {...(isDraggingOverlay ? {} : listeners)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="h6" component="h3" gutterBottom>
              {task.name}
            </Typography>
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {task.description}
              </Typography>
            )}
            {task.deadline && (
              <Chip
                label={format(new Date(task.deadline), 'MMM dd, yyyy')}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            )}
            {(task.attachments && task.attachments.length > 0) && (
              <Chip
                label={`${task.attachments.length} attachment${task.attachments.length > 1 ? 's' : ''}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <Box 
            display="flex" 
            flexDirection="column"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            sx={{ pointerEvents: 'auto' }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label={task.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              sx={{ mb: 0.5, pointerEvents: 'auto' }}
            >
              {task.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label="Edit task"
              sx={{ mb: 0.5, pointerEvents: 'auto' }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label="Delete task"
              sx={{ pointerEvents: 'auto' }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

