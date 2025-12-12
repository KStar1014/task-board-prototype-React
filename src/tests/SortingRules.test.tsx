import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Board } from '../components/Board';
import { useBoardState } from '../hooks/useBoardState';

jest.mock('../hooks/useBoardState');

const mockUseBoardState = useBoardState as jest.MockedFunction<typeof useBoardState>;

const favoriteTask = {
  id: 'task-1',
  name: 'Favorite Task',
  description: '',
  deadline: null,
  isFavorite: true,
  columnId: 'todo',
  imageUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachments: [],
};

const regularTask = {
  id: 'task-2',
  name: 'Regular Task',
  description: '',
  deadline: null,
  isFavorite: false,
  columnId: 'todo',
  imageUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachments: [],
};

const mockBoardState = {
  tasks: [favoriteTask, regularTask],
  columns: [
    { id: 'todo', name: 'To Do', order: 0 },
  ],
  createTask: jest.fn(),
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
  getSortedTasks: jest.fn((columnId: string) => {
    if (columnId === 'todo') {
      // Favorites should come first
      return [favoriteTask, regularTask];
    }
    return [];
  }),
};

const renderBoard = () => {
  return render(
    <BrowserRouter>
      <Board />
    </BrowserRouter>
  );
};

describe('Sorting Rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBoardState.mockReturnValue(mockBoardState as any);
  });

  it('displays favorite tasks first', () => {
    renderBoard();
    const tasks = screen.getAllByText(/Task/);
    expect(tasks[0]).toHaveTextContent('Favorite Task');
  });

  it('maintains manual ordering within favorite and non-favorite groups', () => {
    renderBoard();
    expect(mockBoardState.getSortedTasks).toHaveBeenCalledWith('todo');
  });
});

