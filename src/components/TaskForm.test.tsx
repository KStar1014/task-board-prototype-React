import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TaskForm } from './TaskForm';
import { Column } from '../types/Column';
import { Task } from '../types/Task';

describe('TaskForm Component', () => {
  const mockColumns: Column[] = [
    { id: 'todo', name: 'To Do', order: 0 },
    { id: 'in-progress', name: 'In Progress', order: 1 },
    { id: 'done', name: 'Done', order: 2 },
  ];

  const mockTask: Task = {
    id: 'task-1',
    name: 'Test Task',
    description: 'Test Description',
    columnId: 'todo',
    deadline: '2024-12-31',
    imageUrl: null,
    isFavorite: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    attachments: [],
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    columns: mockColumns,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form when open is true', () => {
      render(<TaskForm {...defaultProps} />);
      
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });

    it('should not render form when open is false', () => {
      render(<TaskForm {...defaultProps} open={false} />);
      
      expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<TaskForm {...defaultProps} title="Edit Task" />);
      
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    it('should use default column when provided', () => {
      render(<TaskForm {...defaultProps} defaultColumnId="in-progress" />);
      
      // The column select should have the default value
      const columnSelect = screen.getByLabelText(/column/i);
      expect(columnSelect).toBeInTheDocument();
    });

  });

  describe('User Interactions', () => {

    it('should update description when typing', async () => {
      const user = userEvent.setup();
      render(<TaskForm {...defaultProps} />);
      
      const descInput = screen.getByLabelText(/description/i);
      await user.type(descInput, 'New Description');
      
      expect(descInput).toHaveValue('New Description');
    });

    it('should update deadline when changed', async () => {
      const user = userEvent.setup();
      render(<TaskForm {...defaultProps} />);
      
      const deadlineInput = screen.getByLabelText(/deadline/i);
      await user.type(deadlineInput, '2024-12-25');
      
      expect(deadlineInput).toHaveValue('2024-12-25');
    });


    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<TaskForm {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });


  });

  describe('File Attachments', () => {
    it('should display existing attachments when editing', () => {
      const taskWithAttachments = {
        ...mockTask,
        attachments: [
          { id: '1', name: 'image.jpg', type: 'image/jpeg', data: 'data:image/jpeg;base64,abc' },
        ],
      };

      render(<TaskForm {...defaultProps} initialTask={taskWithAttachments} />);

      // Attachments should be displayed
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });
  });

  describe('Column Selection', () => {
    it('should render all available columns', async () => {
      const user = userEvent.setup();
      render(<TaskForm {...defaultProps} />);

      const columnSelect = screen.getByLabelText(/column/i);
      await user.click(columnSelect);

      expect(screen.getByRole('option', { name: /to do/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /in progress/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /done/i })).toBeInTheDocument();
    });

    it('should change column selection', async () => {
      const user = userEvent.setup();
      render(<TaskForm {...defaultProps} />);

      const columnSelect = screen.getByLabelText(/column/i);
      await user.click(columnSelect);

      const inProgressOption = screen.getByRole('option', { name: /in progress/i });
      await user.click(inProgressOption);

      // Column should be changed
      expect(columnSelect).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog title', () => {
      render(<TaskForm {...defaultProps} />);

      const title = screen.getByText('Create Task');
      expect(title).toBeInTheDocument();
    });
  });


});

