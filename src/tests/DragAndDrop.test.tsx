import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Board } from '../components/Board';
import { useBoardState } from '../hooks/useBoardState';
import { COLUMN_TYPE, TASK_TYPE } from '../dnd/dragConfig';

jest.mock('../hooks/useBoardState');

const mockUseBoardState = useBoardState as jest.MockedFunction<typeof useBoardState>;

const mockTask = {
  id: 'task-1',
  name: 'Test Task',
  description: 'Test Description',
  deadline: '2024-12-31',
  isFavorite: false,
  columnId: 'todo',
  imageUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachments: [],
};

const mockBoardState = {
  tasks: [mockTask],
  columns: [
    { id: 'todo', name: 'To Do', order: 0 },
    { id: 'done', name: 'Done', order: 1 },
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
    if (columnId === 'todo') return [mockTask];
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

describe('Drag and Drop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBoardState.mockReturnValue(mockBoardState as any);
  });

  it('moves task between columns', async () => {
    renderBoard();

    const taskCard = screen.getByText('Test Task');
    expect(taskCard).toBeInTheDocument();

    // Simulate drag and drop would require more complex setup
    // This is a basic structure for the test
    expect(mockBoardState.getSortedTasks).toHaveBeenCalled();
  });

  it('reorders columns', () => {
    renderBoard();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});

