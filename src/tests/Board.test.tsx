import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Board } from '../components/Board';
import { useBoardState } from '../hooks/useBoardState';

jest.mock('../hooks/useBoardState');

const mockUseBoardState = useBoardState as jest.MockedFunction<typeof useBoardState>;

const mockBoardState = {
  tasks: [],
  columns: [
    { id: 'todo', name: 'To Do', order: 0 },
    { id: 'in-progress', name: 'In Progress', order: 1 },
  ],
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
  getSortedTasks: jest.fn((columnId: string) => []),
  updateColumnSortOption: jest.fn(),
};

const renderBoard = () => {
  return render(
    <BrowserRouter>
      <Board />
    </BrowserRouter>
  );
};

describe('Board', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBoardState.mockReturnValue(mockBoardState as any);
  });

  it('renders the board with columns', () => {
    renderBoard();
    expect(screen.getByText('Task Board')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('opens column form when Add Column is clicked', () => {
    renderBoard();
    const addColumnButton = screen.getByLabelText('Add new column');
    fireEvent.click(addColumnButton);
    expect(screen.getByText('Create Column')).toBeInTheDocument();
  });

  it('creates a new column', async () => {
    renderBoard();
    const addColumnButton = screen.getByLabelText('Add new column');
    fireEvent.click(addColumnButton);

    const nameInput = screen.getByLabelText('Column Name');
    fireEvent.change(nameInput, { target: { value: 'New Column' } });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBoardState.createColumn).toHaveBeenCalledWith('New Column');
    });
  });

  it('opens task form when Add Task is clicked', () => {
    renderBoard();
    const addTaskButtons = screen.getAllByText('Add Task');
    fireEvent.click(addTaskButtons[0]);
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });
});

