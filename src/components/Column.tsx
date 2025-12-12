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

  const taskIds = tasks.map(t => t.id);

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
        backgroundColor: isOver ? 'primary.light' : 'background.paper',
        backgroundImage: isOver 
          ? 'linear-gradient(to bottom, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.04))'
          : 'none',
        border: isOver ? '2px dashed' : '1px solid',
        borderColor: isOver ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease-in-out',
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
        boxShadow: isOver ? 4 : 1,
        position: 'relative',
        '&::before': isOver ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '2px solid',
          borderColor: 'primary.main',
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
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
      {...attributes}
      role="region"
      aria-label={`Column: ${column.name}`}
    >
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
        {...listeners}
        sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
      >
        <Typography variant="h6" component="h2">
          {column.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} onClick={(e) => e.stopPropagation()}>
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
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEditColumn();
            }}
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
            aria-label={`Delete column ${column.name}`}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <SortableContext 
        items={taskIds} 
        strategy={verticalListSortingStrategy}
      >
        <Box>
          {tasks.map((task) => (
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

