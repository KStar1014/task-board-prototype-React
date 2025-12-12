import { useState, useCallback, useMemo } from 'react';
import { Task } from '../types/Task';
import { Column } from '../types/Column';
import { Attachment } from '../types/Attachment';
import { useLocalStorage } from './useLocalStorage';

interface BoardState {
  columns: Column[];
  tasks: {
    [columnId: string]: Task[];
  };
}

const STORAGE_KEY = 'ramsoft-task-board';

const defaultColumns: Column[] = [
  { id: 'todo', name: 'To Do', order: 0 },
  { id: 'in-progress', name: 'In Progress', order: 1 },
  { id: 'done', name: 'Done', order: 2 },
];

// Migration function to convert old structure to new structure
function migrateOldStructure(oldData: any): BoardState {
  if (oldData.tasks && Array.isArray(oldData.tasks)) {
    // Old structure: tasks is an array
    const tasksByColumn: { [columnId: string]: Task[] } = {};
    
    oldData.tasks.forEach((task: any) => {
      // Migrate task fields
      const migratedTask: Task = {
        id: task.id,
        name: task.title || task.name || '',
        description: task.description || '',
        deadline: task.deadline || null,
        columnId: task.columnId,
        imageUrl: task.imageUrl || null,
        isFavorite: task.favorite !== undefined ? task.favorite : (task.isFavorite || false),
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString(),
        attachments: task.attachments || [],
      };
      
      if (!tasksByColumn[task.columnId]) {
        tasksByColumn[task.columnId] = [];
      }
      tasksByColumn[task.columnId].push(migratedTask);
    });
    
    return {
      columns: oldData.columns || defaultColumns,
      tasks: tasksByColumn,
    };
  }
  
  // Already in new structure or empty
  return oldData.tasks ? oldData : {
    columns: defaultColumns,
    tasks: {},
  };
}

export function useBoardState() {
  const [boardState, setBoardState] = useLocalStorage<BoardState>(STORAGE_KEY, {
    columns: defaultColumns,
    tasks: {},
  }, migrateOldStructure);

  const tasks = boardState.tasks;
  const columns = boardState.columns;

  // Helper to get all tasks as a flat array (for backward compatibility)
  const getAllTasks = useCallback(() => {
    return Object.values(tasks).flat();
  }, [tasks]);

  const updateState = useCallback((updater: (state: BoardState) => BoardState) => {
    setBoardState(updater);
  }, [setBoardState]);

  const createTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>): string => {
    const now = new Date().toISOString();
    const taskId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: Task = {
      ...task,
      id: taskId,
      createdAt: now,
      updatedAt: now,
      attachments: [],
    };
    
    updateState((state) => {
      const columnTasks = state.tasks[task.columnId] || [];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task.columnId]: [...columnTasks, newTask],
        },
      };
    });
    
    return taskId;
  }, [updateState]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    updateState((state) => {
      const updatedTasks = { ...state.tasks };
      let found = false;
      
      for (const columnId in updatedTasks) {
        const taskIndex = updatedTasks[columnId].findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          updatedTasks[columnId] = [...updatedTasks[columnId]];
          updatedTasks[columnId][taskIndex] = {
            ...updatedTasks[columnId][taskIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          found = true;
          break;
        }
      }
      
      return found ? { ...state, tasks: updatedTasks } : state;
    });
  }, [updateState]);

  const deleteTask = useCallback((id: string) => {
    updateState((state) => {
      const updatedTasks = { ...state.tasks };
      
      for (const columnId in updatedTasks) {
        const taskIndex = updatedTasks[columnId].findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          updatedTasks[columnId] = updatedTasks[columnId].filter(t => t.id !== id);
          break;
        }
      }
      
      return { ...state, tasks: updatedTasks };
    });
  }, [updateState]);

  const createColumn = useCallback((name: string) => {
    updateState((state) => {
      const newColumn: Column = {
        id: `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        order: state.columns.length,
      };
      return {
        ...state,
        columns: [...state.columns, newColumn],
      };
    });
  }, [updateState]);

  const updateColumn = useCallback((id: string, updates: Partial<Column>) => {
    updateState((state) => {
      // If updating the name, check if a column with that name already exists
      if (updates.name) {
        const existingColumnWithSameName = state.columns.find(
          col => col.name === updates.name && col.id !== id
        );
        
        // If a column with the same name exists, merge tasks into it
        if (existingColumnWithSameName) {
          const sourceTasks = state.tasks[id] || [];
          const targetColumnId = existingColumnWithSameName.id;
          const targetTasks = state.tasks[targetColumnId] || [];
          
          // Move all tasks from source column to target column
          const movedTasks = sourceTasks.map(task => ({
            ...task,
            columnId: targetColumnId,
            updatedAt: new Date().toISOString(),
          }));
          
          const updatedTasks = { ...state.tasks };
          // Remove tasks from source column
          delete updatedTasks[id];
          // Add tasks to target column (append to end)
          updatedTasks[targetColumnId] = [...targetTasks, ...movedTasks];
          
          // Remove the source column since we're merging into existing one
          return {
            ...state,
            columns: state.columns.filter(col => col.id !== id),
            tasks: updatedTasks,
          };
        }
      }
      
      // Normal update: just update the column properties
      return {
        ...state,
        columns: state.columns.map(col => col.id === id ? { ...col, ...updates } : col),
      };
    });
  }, [updateState]);

  const deleteColumn = useCallback((id: string) => {
    updateState((state) => {
      const updatedTasks = { ...state.tasks };
      delete updatedTasks[id];
      
      return {
        ...state,
        columns: state.columns.filter(col => col.id !== id),
        tasks: updatedTasks,
      };
    });
  }, [updateState]);

  const moveTask = useCallback((taskId: string, targetColumnId: string, newOrder: number) => {
    updateState((state) => {
      let task: Task | undefined;
      let sourceColumnId: string | undefined;
      
      // Find the task and its source column
      for (const columnId in state.tasks) {
        const foundTask = state.tasks[columnId].find(t => t.id === taskId);
        if (foundTask) {
          task = foundTask;
          sourceColumnId = columnId;
          break;
        }
      }
      
      if (!task || !sourceColumnId) return state;
      
      const updatedTasks = { ...state.tasks };
      
      // Remove from source column
      updatedTasks[sourceColumnId] = updatedTasks[sourceColumnId].filter(t => t.id !== taskId);
      
      // Add to target column at the specified position
      const targetTasks = updatedTasks[targetColumnId] || [];
      const taskToMove = { ...task, columnId: targetColumnId, updatedAt: new Date().toISOString() };
      targetTasks.splice(newOrder, 0, taskToMove);
      updatedTasks[targetColumnId] = targetTasks;
      
      return { ...state, tasks: updatedTasks };
    });
  }, [updateState]);

  const reorderTasks = useCallback((columnId: string, taskIds: string[]) => {
    updateState((state) => {
      const columnTasks = state.tasks[columnId] || [];
      const taskMap = new Map(columnTasks.map(t => [t.id, t]));
      
      const reorderedTasks = taskIds
        .map(id => taskMap.get(id))
        .filter((t): t is Task => t !== undefined)
        .map((task, index) => ({ ...task, updatedAt: new Date().toISOString() }));
      
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [columnId]: reorderedTasks,
        },
      };
    });
  }, [updateState]);

  const reorderColumns = useCallback((columnIds: string[]) => {
    updateState((state) => {
      const columnMap = new Map(state.columns.map(c => [c.id, c]));
      const reorderedColumns = columnIds.map((id, index) => {
        const column = columnMap.get(id);
        if (column) {
          return { ...column, order: index };
        }
        return column;
      }).filter((c): c is Column => c !== undefined);

      return {
        ...state,
        columns: reorderedColumns,
      };
    });
  }, [updateState]);

  const addAttachment = useCallback((taskId: string, file: File) => {
    return new Promise<Attachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const attachment: Attachment = {
          id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          data,
        };

        updateState((state) => {
          const updatedTasks = { ...state.tasks };
          
          for (const columnId in updatedTasks) {
            const taskIndex = updatedTasks[columnId].findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              updatedTasks[columnId] = [...updatedTasks[columnId]];
              const task = updatedTasks[columnId][taskIndex];
              updatedTasks[columnId][taskIndex] = {
                ...task,
                attachments: [...(task.attachments || []), attachment],
                updatedAt: new Date().toISOString(),
              };
              break;
            }
          }
          
          return { ...state, tasks: updatedTasks };
        });

        resolve(attachment);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, [updateState]);

  const removeAttachment = useCallback((taskId: string, attachmentId: string) => {
    updateState((state) => {
      const updatedTasks = { ...state.tasks };
      
      for (const columnId in updatedTasks) {
        const taskIndex = updatedTasks[columnId].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          updatedTasks[columnId] = [...updatedTasks[columnId]];
          const task = updatedTasks[columnId][taskIndex];
          updatedTasks[columnId][taskIndex] = {
            ...task,
            attachments: (task.attachments || []).filter(a => a.id !== attachmentId),
            updatedAt: new Date().toISOString(),
          };
          break;
        }
      }
      
      return { ...state, tasks: updatedTasks };
    });
  }, [updateState]);

  const getSortedTasks = useCallback((columnId: string) => {
    const columnTasks = tasks[columnId] || [];
    
    const favorites = columnTasks.filter(t => t.isFavorite);
    const nonFavorites = columnTasks.filter(t => !t.isFavorite);

    const sortByName = (a: Task, b: Task) => a.name.localeCompare(b.name);

    const sortedFavorites = [...favorites].sort(sortByName);
    const sortedNonFavorites = [...nonFavorites].sort(sortByName);

    return [...sortedFavorites, ...sortedNonFavorites];
  }, [tasks]);

  const sortedColumns = useMemo(() => {
    return [...columns].sort((a, b) => a.order - b.order);
  }, [columns]);

  return {
    tasks: getAllTasks(), // Return flat array for backward compatibility
    columns: sortedColumns,
    createTask,
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
  };
}

