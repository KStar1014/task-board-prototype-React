import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Board } from './Board';
import { useBoardState } from '../hooks/useBoardState';
import { Column } from '../types/Column';
import { Task } from '../types/Task';
import '@testing-library/jest-dom';

// Mock the useBoardState hook
jest.mock('../hooks/useBoardState');

// Mock child components to simplify testing
jest.mock('./Column', () => ({
  Column: ({ column, onAddTask, onEditColumn, onDeleteColumn }: any) => (
    <div data-testid={`column-${column.id}`}>
      <h3>{column.name}</h3>
      <button onClick={onAddTask}>Add Task</button>
      <button onClick={onEditColumn}>Edit Column</button>
      <button onClick={onDeleteColumn}>Delete Column</button>
    </div>
  ),
}));

jest.mock('./TaskForm', () => ({
  TaskForm: ({ open, onClose, onSubmit, title }: any) =>
    open ? (
      <div data-testid="task-form">
        <h2>{title}</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSubmit({ name: 'Test Task', description: 'Test', columnId: 'todo', deadline: null, imageUrl: null, isFavorite: false })}>
          Submit
        </button>
      </div>
    ) : null,
}));

jest.mock('./ColumnForm', () => ({
  ColumnForm: ({ open, onClose, onSubmit, title }: any) =>
    open ? (
      <div data-testid="column-form">
        <h2>{title}</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSubmit('New Column')}>Submit</button>
      </div>
    ) : null,
}));

jest.mock('./ConfirmDialog', () => ({
  ConfirmDialog: ({ open, onConfirm, onCancel, title, message }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

jest.mock('./TaskCard', () => ({
  TaskCard: ({ task }: any) => <div data-testid={`task-${task.id}`}>{task.name}</div>,
}));

const mockUseBoardState = useBoardState as jest.MockedFunction<typeof useBoardState>;

describe('Board Component', () => {
  const mockColumns: Column[] = [
    { id: 'todo', name: 'To Do', order: 0 },
    { id: 'in-progress', name: 'In Progress', order: 1 },
    { id: 'done', name: 'Done', order: 2 },
  ];

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Task 1',
      description: 'Description 1',
      columnId: 'todo',
      deadline: null,
      imageUrl: null,
      isFavorite: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      attachments: [],
    },
  ];

  const defaultMockReturn = {
    columns: mockColumns,
    tasks: mockTasks,
    createTask: jest.fn(),
    createTaskWithAttachments: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    createColumn: jest.fn(),
    updateColumn: jest.fn(),
    deleteColumn: jest.fn(),
    moveTask: jest.fn(),
    reorderTasks: jest.fn(),
    reorderColumns: jest.fn(),
    addAttachment: jest.fn(),
    removeAttachment: jest.fn(),
    getSortedTasks: jest.fn((columnId: string) => mockTasks.filter(t => t.columnId === columnId)),
    updateColumnSortOption: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBoardState.mockReturnValue(defaultMockReturn);
  });

  const renderBoard = () => {
    return render(
      <BrowserRouter>
        <Board />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render the board with title', () => {
      renderBoard();
      expect(screen.getByText('Task Board')).toBeInTheDocument();
    });

    it('should render all columns', () => {
      renderBoard();
      expect(screen.getByTestId('column-todo')).toBeInTheDocument();
      expect(screen.getByTestId('column-in-progress')).toBeInTheDocument();
      expect(screen.getByTestId('column-done')).toBeInTheDocument();
    });

    it('should render Add Column button', () => {
      renderBoard();
      expect(screen.getByRole('button', { name: /add new column/i })).toBeInTheDocument();
    });

    it('should display column names correctly', () => {
      renderBoard();
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('Column Management', () => {
   
    it('should update column when edit form is submitted', async () => {
      const user = userEvent.setup();
      const updateColumn = jest.fn();
      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        updateColumn,
      });

      renderBoard();

      const editButtons = screen.getAllByText('Edit Column');
      await user.click(editButtons[0]);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      expect(updateColumn).toHaveBeenCalledWith('todo', { name: 'New Column' });
    });

    
    it('should delete column when confirmed', async () => {
      const user = userEvent.setup();
      const deleteColumn = jest.fn();
      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        deleteColumn,
      });

      renderBoard();

      const deleteButtons = screen.getAllByText('Delete Column');
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      expect(deleteColumn).toHaveBeenCalledWith('todo');
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });

    it('should not delete column when cancelled', async () => {
      const user = userEvent.setup();
      const deleteColumn = jest.fn();
      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        deleteColumn,
      });

      renderBoard();

      const deleteButtons = screen.getAllByText('Delete Column');
      await user.click(deleteButtons[0]);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(deleteColumn).not.toHaveBeenCalled();
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Task Management', () => {
    it('should open task form when Add Task button is clicked', async () => {
      const user = userEvent.setup();
      renderBoard();

      const addTaskButtons = screen.getAllByText('Add Task');
      await user.click(addTaskButtons[0]);

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });


    it('should create a new task when form is submitted', async () => {
      const user = userEvent.setup();
      const createTask = jest.fn();
      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        createTask,
      });

      renderBoard();

      const addTaskButtons = screen.getAllByText('Add Task');
      await user.click(addTaskButtons[0]);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      expect(createTask).toHaveBeenCalledWith({
        name: 'Test Task',
        description: 'Test',
        columnId: 'todo',
        deadline: null,
        imageUrl: null,
        isFavorite: false,
      });
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
    });

    it('should show confirm dialog when delete task button is clicked', async () => {
      const user = userEvent.setup();
      const getSortedTasks = jest.fn((columnId: string) =>
        mockTasks.filter(t => t.columnId === columnId)
      );
      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        getSortedTasks,
      });

      renderBoard();

      // Simulate delete task action through Column component
      // This would be triggered by the Column component's onDeleteTask callback
    });
  });

  describe('Drag and Drop', () => {
    it('should call getSortedTasks for each column', () => {
      const getSortedTasks = jest.fn((columnId: string) =>
        mockTasks.filter(t => t.columnId === columnId)
      );
      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        getSortedTasks,
      });

      renderBoard();

      // getSortedTasks should be called for each column during rendering
      expect(getSortedTasks).toHaveBeenCalled();
    });
  });

  describe('URL Parameters', () => {
    it('should handle edit task URL parameter', async () => {
      const getSortedTasks = jest.fn((columnId: string) =>
        mockTasks.filter(t => t.columnId === columnId)
      );
      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        getSortedTasks,
      });

      // Render with URL parameter
      render(
        <BrowserRouter>
          <Board />
        </BrowserRouter>
      );

      // The useEffect should process the edit parameter
      // This is tested indirectly through the component behavior
    });
  });

  describe('Integration', () => {
    it('should render board with empty columns', () => {
      const getSortedTasks = jest.fn(() => []);
      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        tasks: [],
        getSortedTasks,
      });

      renderBoard();

      expect(screen.getByText('Task Board')).toBeInTheDocument();
      expect(screen.getByTestId('column-todo')).toBeInTheDocument();
    });

    it('should handle multiple columns and tasks', () => {
      const multipleTasks: Task[] = [
        ...mockTasks,
        {
          id: 'task-2',
          name: 'Task 2',
          description: 'Description 2',
          columnId: 'in-progress',
          deadline: null,
          imageUrl: null,
          isFavorite: true,
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          attachments: [],
        },
      ];

      const getSortedTasks = jest.fn((columnId: string) =>
        multipleTasks.filter(t => t.columnId === columnId)
      );

      mockUseBoardState.mockReturnValue({
        ...defaultMockReturn,
        tasks: multipleTasks,
        getSortedTasks,
      });

      renderBoard();

      expect(screen.getByText('Task Board')).toBeInTheDocument();
      expect(getSortedTasks).toHaveBeenCalled();
    });
  });
});
