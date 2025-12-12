import { useLocalStorage } from '../hooks/useLocalStorage';
import { renderHook, act } from '@testing-library/react';
import { Task } from '../types/Task';
import { Column } from '../types/Column';

interface BoardState {
  columns: Column[];
  tasks: {
    [columnId: string]: Task[];
  };
}

describe('LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('reads from localStorage on initialization', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('handles complex objects', () => {
    const initialValue: BoardState = { columns: [], tasks: {} };
    const { result } = renderHook(() => useLocalStorage<BoardState>('board', initialValue));

    act(() => {
      result.current[1]({ 
        columns: [],
        tasks: {
          'todo': [{ 
            id: '1', 
            name: 'Test Task', 
            description: '', 
            deadline: null, 
            isFavorite: false, 
            columnId: 'todo', 
            imageUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attachments: [] 
          }]
        }
      });
    });

    expect(result.current[0].tasks['todo']).toHaveLength(1);
    expect(result.current[0].tasks['todo'][0].id).toBe('1');
    const stored = JSON.parse(localStorage.getItem('board') || '{}');
    expect(stored.tasks.todo).toHaveLength(1);
  });

  it('handles localStorage errors gracefully', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = jest.fn(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');

    Storage.prototype.getItem = originalGetItem;
  });
});

