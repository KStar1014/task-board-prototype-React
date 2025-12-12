import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Board } from '../components/Board';
import { useBoardState } from '../hooks/useBoardState';

jest.mock('../hooks/useBoardState');

const mockUseBoardState = useBoardState as jest.MockedFunction<typeof useBoardState>;

const mockTask = {
  id: 'task-1',
  name: 'Test Task',
  description: 'Test Description',
  deadline: null,
  isFavorite: false,
  columnId: 'todo',
  imageUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachments: [
    {
      id: 'att-1',
      name: 'test-image.png',
      type: 'image/png',
      data: 'data:image/png;base64,test',
    },
  ],
};

const mockBoardState = {
  tasks: [mockTask],
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
  addAttachment: jest.fn().mockResolvedValue({
    id: 'att-2',
    name: 'new-image.png',
    type: 'image/png',
    data: 'data:image/png;base64,new',
  }),
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

describe('Attachments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBoardState.mockReturnValue(mockBoardState as any);
  });

  it('displays attachment count on task card', () => {
    renderBoard();
    expect(screen.getByText('1 attachment')).toBeInTheDocument();
  });

  it('shows attachments in task details', async () => {
    renderBoard();
    const taskCard = screen.getByText('Test Task');
    fireEvent.click(taskCard);

    await waitFor(() => {
      expect(screen.getByText('Attachments (1)')).toBeInTheDocument();
    });
  });

  it('allows adding attachments', async () => {
    renderBoard();
    const taskCard = screen.getByText('Test Task');
    fireEvent.click(taskCard);

    await waitFor(() => {
      expect(screen.getByText('Add Image')).toBeInTheDocument();
    });
  });
});

