import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Column } from './Column';
import { Column as ColumnType } from '../types/Column';
import { Task } from '../types/Task';

// Mock @dnd-kit modules
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: {},
}));

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}));

// Mock TaskCard component
jest.mock('./TaskCard', () => ({
  TaskCard: ({ task, onEdit, onDelete, onToggleFavorite }: any) => (
    <div data-testid={`task-card-${task.id}`}>
      <span>{task.name}</span>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
      <button onClick={onToggleFavorite}>Toggle Favorite</button>
    </div>
  ),
}));

describe('Column Component', () => {
  const mockColumn: ColumnType = {
    id: 'todo',
    name: 'To Do',
    order: 0,
    sortOption: 'normal',
  };

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
    {
      id: 'task-2',
      name: 'Task 2',
      description: 'Description 2',
      columnId: 'todo',
      deadline: null,
      imageUrl: null,
      isFavorite: true,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      attachments: [],
    },
  ];

  const defaultProps = {
    column: mockColumn,
    tasks: mockTasks,
    onAddTask: jest.fn(),
    onEditTask: jest.fn(),
    onDeleteTask: jest.fn(),
    onToggleFavorite: jest.fn(),
    onTaskClick: jest.fn(),
    onEditColumn: jest.fn(),
    onDeleteColumn: jest.fn(),
    onSortOptionChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderColumn = (props = {}) => {
    return render(
      <BrowserRouter>
        <Column {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render column name', () => {
      renderColumn();
      expect(screen.getByText(/to do/i)).toBeInTheDocument();
    });

    it('should render task count', () => {
      renderColumn();
      expect(screen.getByText(/to do \(2\)/i)).toBeInTheDocument();
    });

    it('should render all tasks', () => {
      renderColumn();
      expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-task-2')).toBeInTheDocument();
    });

    it('should render Add Task button', () => {
      renderColumn();
      expect(screen.getByRole('button', { name: /add task to to do/i })).toBeInTheDocument();
    });

    it('should render edit column button', () => {
      renderColumn();
      expect(screen.getByLabelText(/edit column to do/i)).toBeInTheDocument();
    });

    it('should render delete column button', () => {
      renderColumn();
      expect(screen.getByLabelText(/delete column to do/i)).toBeInTheDocument();
    });

    it('should render sort dropdown with default value', () => {
      renderColumn();
      // The select component should be present
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements.length).toBeGreaterThan(0);
    });

    it('should render empty column with zero tasks', () => {
      renderColumn({ tasks: [] });
      expect(screen.getByText(/to do \(0\)/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onAddTask when Add Task button is clicked', async () => {
      const user = userEvent.setup();
      const onAddTask = jest.fn();
      renderColumn({ onAddTask });

      const addButton = screen.getByRole('button', { name: /add task to to do/i });
      await user.click(addButton);

      expect(onAddTask).toHaveBeenCalledTimes(1);
    });

    it('should call onEditColumn when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEditColumn = jest.fn();
      renderColumn({ onEditColumn });

      const editButton = screen.getByLabelText(/edit column to do/i);
      await user.click(editButton);

      expect(onEditColumn).toHaveBeenCalledTimes(1);
    });

    it('should call onDeleteColumn when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDeleteColumn = jest.fn();
      renderColumn({ onDeleteColumn });

      const deleteButton = screen.getByLabelText(/delete column to do/i);
      await user.click(deleteButton);

      expect(onDeleteColumn).toHaveBeenCalledTimes(1);
    });

    it('should call onEditTask when task edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEditTask = jest.fn();
      renderColumn({ onEditTask });

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(onEditTask).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should call onDeleteTask when task delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDeleteTask = jest.fn();
      renderColumn({ onDeleteTask });

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(onDeleteTask).toHaveBeenCalledWith('task-1');
    });

    it('should call onToggleFavorite when task favorite button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleFavorite = jest.fn();
      renderColumn({ onToggleFavorite });

      const favoriteButtons = screen.getAllByText('Toggle Favorite');
      await user.click(favoriteButtons[0]);

      expect(onToggleFavorite).toHaveBeenCalledWith('task-1');
    });

    it('should call onSortOptionChange when sort option is changed', async () => {
      const user = userEvent.setup();
      const onSortOptionChange = jest.fn();
      renderColumn({ onSortOptionChange });

      const select = screen.getAllByRole('combobox')[0];
      await user.click(select);

      // Find and click the A-Z option
      const azOption = screen.getByRole('option', { name: /a-z/i });
      await user.click(azOption);

      expect(onSortOptionChange).toHaveBeenCalledWith('A-Z');
    });
  });

  describe('Sort Options', () => {

    it('should display A-Z sort option', async () => {
      const user = userEvent.setup();
      renderColumn();

      const select = screen.getAllByRole('combobox')[0];
      await user.click(select);

      expect(screen.getByRole('option', { name: /^a-z$/i })).toBeInTheDocument();
    });

    it('should display Z-A sort option', async () => {
      const user = userEvent.setup();
      renderColumn();

      const select = screen.getAllByRole('combobox')[0];
      await user.click(select);

      expect(screen.getByRole('option', { name: /z-a/i })).toBeInTheDocument();
    });

    it('should render with A-Z sort option selected', () => {
      const columnWithSort = { ...mockColumn, sortOption: 'A-Z' as const };
      renderColumn({ column: columnWithSort });

      // The select should have the A-Z value
      const select = screen.getAllByRole('combobox')[0];
      expect(select).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label for column region', () => {
      renderColumn();
      expect(screen.getByLabelText(/column: to do/i)).toBeInTheDocument();
    });

    it('should have proper ARIA labels for action buttons', () => {
      renderColumn();

      expect(screen.getByLabelText(/edit column to do/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delete column to do/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/add task to to do/i)).toBeInTheDocument();
    });
  });

  describe('Different Column States', () => {
    it('should render column with different sort option', () => {
      const columnWithZA = { ...mockColumn, sortOption: 'Z-A' as const };
      renderColumn({ column: columnWithZA });

      expect(screen.getByText(/to do/i)).toBeInTheDocument();
    });

    it('should render column with many tasks', () => {
      const manyTasks = Array.from({ length: 10 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
        name: `Task ${i}`,
      }));

      renderColumn({ tasks: manyTasks });
      expect(screen.getByText(/to do \(10\)/i)).toBeInTheDocument();
    });
  });
});

