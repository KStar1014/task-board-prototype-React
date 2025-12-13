import React from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column as ColumnType, SortOption } from '../types/Column';
import { Task } from '../types/Task';
import { TaskCard } from './TaskCard';
import { TASK_TYPE, COLUMN_TYPE } from '../dnd/dragConfig';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleFavorite: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
  onSortOptionChange: (sortOption: SortOption) => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleFavorite,
  onTaskClick,
  onEditColumn,
  onDeleteColumn,
  onSortOptionChange,
}) => {
  const sortOption: SortOption = column.sortOption || 'normal';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: COLUMN_TYPE,
      column,
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column-drop-zone',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskIds = (tasks || []).map(t => t.id);

  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node);
    setDroppableRef(node);
  };

  return (
    <Paper
      ref={combinedRef}
      style={style}
      sx={{
        p: 2,
        minWidth: 300,
        maxWidth: 400,
        backgroundColor: isOver ? 'rgba(102, 126, 234, 0.05)' : '#ffffff',
        backgroundImage: isOver 
          ? 'linear-gradient(to bottom, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.06))'
          : 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
        border: isOver ? '2px dashed' : '1px solid',
        borderColor: isOver ? '#667eea' : '#e0e0e0',
        transition: 'all 0.2s ease-in-out',
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
        boxShadow: isOver 
          ? '0 8px 16px rgba(102, 126, 234, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        '&::before': isOver ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '2px solid',
          borderColor: '#667eea',
          borderRadius: 1,
          pointerEvents: 'none',
          animation: 'pulse 1.5s ease-in-out infinite',
        } : {},
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 0.5,
          },
          '50%': {
            opacity: 1,
          },
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: '#667eea',
          outlineOffset: 2,
        },
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
        },
      }}
      {...attributes}
      role="region"
      aria-label={`Column: ${column.name}`}
    >
      <Box mb={2}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={1}
        >
          <Typography 
            variant="h6" 
            component="h2"
            {...listeners}
            sx={{ 
              cursor: 'grab', 
              '&:active': { cursor: 'grabbing' },
              flex: 1,
              userSelect: 'none',
              fontWeight: 600,
              color: '#2d3748',
              letterSpacing: '0.3px',
            }}
          >
            {column.name} ({tasks && tasks.length})
          </Typography>
          <Box 
            display="flex" 
            alignItems="center" 
            gap={1} 
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEditColumn();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label={`Edit column ${column.name}`}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteColumn();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label={`Delete column ${column.name}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Box 
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={sortOption}
              onChange={(e) => {
                e.stopPropagation();
                onSortOptionChange(e.target.value as SortOption);
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              sx={{ fontSize: '0.875rem' }}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="A-Z">A-Z</MenuItem>
              <MenuItem value="Z-A">Z-A</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <SortableContext 
        items={taskIds} 
        strategy={verticalListSortingStrategy}
      >
        <Box>
          {(tasks || []).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
              onToggleFavorite={() => onToggleFavorite(task.id)}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </Box>
      </SortableContext>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<Add />}
        onClick={(e) => {
          e.stopPropagation();
          onAddTask();
        }}
        sx={{ mt: 2 }}
        aria-label={`Add task to ${column.name}`}
      >
        Add Task
      </Button>
    </Paper>
  );
};

