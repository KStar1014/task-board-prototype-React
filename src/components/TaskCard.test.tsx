import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { TaskCard } from './TaskCard';
import { Task } from '../types/Task';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

describe('TaskCard Component', () => {
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
    task: mockTask,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onToggleFavorite: jest.fn(),
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTaskCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <TaskCard {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render task name', () => {
      renderTaskCard();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should render task description', () => {
      renderTaskCard();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });


    it('should not render description when empty', () => {
      const taskWithoutDescription = { ...mockTask, description: '' };
      renderTaskCard({ task: taskWithoutDescription });
      
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('should render favorite icon when task is favorite', () => {
      const favoriteTask = { ...mockTask, isFavorite: true };
      renderTaskCard({ task: favoriteTask });
      
      const favoriteButton = screen.getByLabelText(/remove from favorites/i);
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should render non-favorite icon when task is not favorite', () => {
      renderTaskCard();
      
      const favoriteButton = screen.getByLabelText(/add to favorites/i);
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should render attachment count when attachments exist', () => {
      const taskWithAttachments = {
        ...mockTask,
        attachments: [
          { id: '1', name: 'file1.jpg', type: 'image/jpeg', data: 'data:image/jpeg;base64,abc' },
          { id: '2', name: 'file2.png', type: 'image/png', data: 'data:image/png;base64,def' },
        ],
      };
      renderTaskCard({ task: taskWithAttachments });
      
      expect(screen.getByText('2 attachments')).toBeInTheDocument();
    });

    it('should render singular attachment text for one attachment', () => {
      const taskWithOneAttachment = {
        ...mockTask,
        attachments: [
          { id: '1', name: 'file1.jpg', type: 'image/jpeg', data: 'data:image/jpeg;base64,abc' },
        ],
      };
      renderTaskCard({ task: taskWithOneAttachment });
      
      expect(screen.getByText('1 attachment')).toBeInTheDocument();
    });

    it('should render image preview when image attachment exists', () => {
      const taskWithImage = {
        ...mockTask,
        attachments: [
          { id: '1', name: 'image.jpg', type: 'image/jpeg', data: 'data:image/jpeg;base64,abc' },
        ],
      };
      renderTaskCard({ task: taskWithImage });
      
      const image = screen.getByAltText('image.jpg');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'data:image/jpeg;base64,abc');
    });
  });

  describe('User Interactions', () => {
    it('should navigate to task details when card is clicked', async () => {
      const user = userEvent.setup();
      renderTaskCard();
      
      const card = screen.getByLabelText(/task: test task/i);
      await user.click(card);
      
      expect(mockNavigate).toHaveBeenCalledWith('/task/task-1');
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      renderTaskCard({ onEdit });

      const editButton = screen.getByLabelText(/edit task/i);
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      renderTaskCard({ onDelete });

      const deleteButton = screen.getByLabelText(/delete task/i);
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should call onToggleFavorite when favorite button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleFavorite = jest.fn();
      renderTaskCard({ onToggleFavorite });

      const favoriteButton = screen.getByLabelText(/add to favorites/i);
      await user.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });


  });

  describe('Accessibility', () => {
    it('should have proper ARIA label for card', () => {
      renderTaskCard();

      expect(screen.getByLabelText(/task: test task/i)).toBeInTheDocument();
    });

    it('should have proper ARIA labels for action buttons', () => {
      renderTaskCard();

      expect(screen.getByLabelText(/add to favorites/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/edit task/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delete task/i)).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should render with isDragging prop', () => {
      renderTaskCard({ isDragging: true });

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should render with disableDrag prop', () => {
      renderTaskCard({ disableDrag: true });

      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });
});

