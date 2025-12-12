import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { DragConfig, COLUMN_TYPE, TASK_TYPE } from '../dnd/dragConfig';
import { useBoardState } from '../hooks/useBoardState';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { ColumnForm } from './ColumnForm';
import { ConfirmDialog } from './ConfirmDialog';
import { Task } from '../types/Task';
import { Column as ColumnType, SortOption } from '../types/Column';

export const Board: React.FC = () => {
  const {
    columns,
    createTask,
    createTaskWithAttachments,
    updateTask,
    deleteTask,
    createColumn,
    updateColumn,
    deleteColumn,
    moveTask,
    reorderTasks,
    reorderColumns,
    addAttachment,
    removeAttachment,
    getSortedTasks,
    updateColumnSortOption,
  } = useBoardState();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<ColumnType | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'task' | 'column' | null;
    id: string | null;
    name: string | null;
  }>({
    open: false,
    type: null,
    id: null,
    name: null,
  });

  const handleCreateTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>, 
    files?: File[],
    removedAttachmentIds?: string[]
  ) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      
      // Remove attachments that were marked for removal
      if (removedAttachmentIds && removedAttachmentIds.length > 0) {
        for (const attachmentId of removedAttachmentIds) {
          removeAttachment(editingTask.id, attachmentId);
        }
      }
      
      // Add new attachments if files were provided
      if (files && files.length > 0) {
        for (const file of files) {
          await addAttachment(editingTask.id, file, taskData.columnId);
        }
      }
      
      setEditingTask(null);
    } else {
      // If files are provided, create task with attachments in a single operation
      // This avoids race conditions with React state updates
      if (files && files.length > 0) {
        await createTaskWithAttachments(taskData, files);
      } else {
        // No files, just create the task normally
        createTask(taskData);
      }
    }
    setIsTaskFormOpen(false);
  };

  const handleCreateColumn = (name: string) => {
    if (editingColumn) {
      updateColumn(editingColumn.id, { name });
      setEditingColumn(null);
    } else {
      createColumn(name);
    }
    setIsColumnFormOpen(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    setActiveType(event.active.data.current?.type || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (active.data.current?.type === COLUMN_TYPE) {
      if (activeId !== overId) {
        const columnIds = columns.map(c => c.id);
        const oldIndex = columnIds.indexOf(activeId);
        const newIndex = columnIds.indexOf(overId);
        const reordered = [...columnIds];
        reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, activeId);
        reorderColumns(reordered);
      }
    } else if (active.data.current?.type === TASK_TYPE) {
      const task = columns
        .flatMap(col => getSortedTasks(col.id))
        .find(t => t.id === activeId);

      if (!task) return;

      const overColumn = columns.find(col => col.id === overId);
      const overTask = columns
        .flatMap(col => getSortedTasks(col.id))
        .find(t => t.id === overId);

      if (overColumn) {
        const targetTasks = getSortedTasks(overColumn.id);
        const newOrder = targetTasks.length;
        moveTask(activeId, overColumn.id, newOrder);
      } else if (overTask) {
        const targetColumnId = overTask.columnId;
        const sourceColumnId = task.columnId;
        
        // If dragging within the same column, check if sort allows reordering
        if (targetColumnId === sourceColumnId) {
          const targetColumn = columns.find(col => col.id === targetColumnId);
          const sortOption = targetColumn?.sortOption || 'normal';
          
          // Only allow reordering within the same column if sort is 'normal'
          if (sortOption !== 'normal') {
            return; // Prevent reordering within the same column
          }
        }
        
        const targetTasks = getSortedTasks(targetColumnId);
        const overIndex = targetTasks.findIndex(t => t.id === overId);
        moveTask(activeId, targetColumnId, overIndex);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.type === TASK_TYPE) {
      const task = columns
        .flatMap(col => getSortedTasks(col.id))
        .find(t => t.id === active.id);

      if (!task) return;

      const overColumn = columns.find(col => col.id === over.id);
      if (overColumn && task.columnId !== overColumn.id) {
        const targetTasks = getSortedTasks(overColumn.id);
        const newOrder = targetTasks.length;
        moveTask(task.id, overColumn.id, newOrder);
      }
    }
  };

  // Handle URL parameter for editing task
  useEffect(() => {
    const editTaskId = searchParams.get('edit');
    if (editTaskId) {
      const taskToEdit = columns
        .flatMap(col => getSortedTasks(col.id))
        .find(t => t.id === editTaskId);
      if (taskToEdit) {
        setEditingTask(taskToEdit);
        setIsTaskFormOpen(true);
        // Remove the edit parameter from URL
        searchParams.delete('edit');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams, columns, getSortedTasks]);

  const columnIds = columns.map(c => c.id);

  // Get the active item for drag overlay
  const activeTask = activeId && activeType === TASK_TYPE
    ? columns.flatMap(col => getSortedTasks(col.id)).find(t => t.id === activeId)
    : null;
  const activeColumn = activeId && activeType === COLUMN_TYPE
    ? columns.find(c => c.id === activeId)
    : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          p: 3,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            color: 'white',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Task Board
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingColumn(null);
            setIsColumnFormOpen(true);
          }}
          aria-label="Add new column"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Add Column
        </Button>
      </Box>

      <DragConfig
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        dragOverlay={
          activeTask ? (
            <Box
              sx={{
                transform: 'rotate(3deg) scale(1.05)',
                opacity: 0.95,
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                borderRadius: 2,
                overflow: 'hidden',
                maxWidth: 350,
                border: '2px solid',
                borderColor: 'primary.main',
                backgroundColor: 'background.paper',
                pointerEvents: 'none',
              }}
            >
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggleFavorite={() => {}}
                onClick={() => {}}
                isDragging={true}
              />
            </Box>
          ) : activeColumn ? (
            <Box
              sx={{
                transform: 'rotate(2deg) scale(1.02)',
                opacity: 0.95,
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                borderRadius: 2,
                p: 2,
                minWidth: 300,
                maxWidth: 400,
                backgroundColor: 'background.paper',
                border: '2px solid',
                borderColor: 'primary.main',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {activeColumn.name}
              </Typography>
            </Box>
          ) : null
        }
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 2 }}>
            {columns.map((column) => {
              const columnTasks = getSortedTasks(column.id);
              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onAddTask={() => {
                    setEditingTask(null);
                    setDefaultColumnId(column.id);
                    setIsTaskFormOpen(true);
                  }}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsTaskFormOpen(true);
                  }}
                  onDeleteTask={(taskId) => {
                    const task = columns
                      .flatMap(col => getSortedTasks(col.id))
                      .find(t => t.id === taskId);
                    if (task) {
                      setConfirmDialog({
                        open: true,
                        type: 'task',
                        id: taskId,
                        name: task.name,
                      });
                    }
                  }}
                  onToggleFavorite={(taskId) => {
                    const task = columns
                      .flatMap(col => getSortedTasks(col.id))
                      .find(t => t.id === taskId);
                    if (task) {
                      updateTask(taskId, { isFavorite: !task.isFavorite });
                    }
                  }}
                  onTaskClick={(task) => {
                    // Navigation is handled by TaskCard component
                  }}
                  onEditColumn={() => {
                    setEditingColumn(column);
                    setIsColumnFormOpen(true);
                  }}
                  onDeleteColumn={() => {
                    setConfirmDialog({
                      open: true,
                      type: 'column',
                      id: column.id,
                      name: column.name,
                    });
                  }}
                  onSortOptionChange={(sortOption: SortOption) => {
                    updateColumnSortOption(column.id, sortOption);
                  }}
                />
              );
            })}
          </Box>
        </SortableContext>
      </DragConfig>

      <TaskForm
        open={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
          setDefaultColumnId(null);
        }}
        onSubmit={handleCreateTask}
        columns={columns}
        initialTask={editingTask || undefined}
        defaultColumnId={defaultColumnId || undefined}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      />

      <ColumnForm
        open={isColumnFormOpen}
        onClose={() => {
          setIsColumnFormOpen(false);
          setEditingColumn(null);
        }}
        onSubmit={handleCreateColumn}
        initialName={editingColumn?.name}
        title={editingColumn ? 'Edit Column' : 'Create Column'}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.type === 'task' ? 'Delete Task' : 'Delete Column'}
        message={
          confirmDialog.type === 'task'
            ? `Are you sure you want to delete the task "${confirmDialog.name}"? This action cannot be undone.`
            : `Are you sure you want to delete the column "${confirmDialog.name}"? All tasks in this column will also be deleted. This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
          onConfirm={() => {
          if (confirmDialog.type === 'task' && confirmDialog.id) {
            deleteTask(confirmDialog.id);
          } else if (confirmDialog.type === 'column' && confirmDialog.id) {
            deleteColumn(confirmDialog.id);
          }
          setConfirmDialog({
            open: false,
            type: null,
            id: null,
            name: null,
          });
        }}
        onCancel={() => {
          setConfirmDialog({
            open: false,
            type: null,
            id: null,
            name: null,
          });
        }}
      />
    </Container>
  );
};

