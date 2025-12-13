import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  const TEST_KEY = 'test-key';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should return initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));
      
      expect(result.current[0]).toBe('initial');
    });


    it('should handle objects as initial value', () => {
      const initialObject = { name: 'test', count: 0 };
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, initialObject));
      
      expect(result.current[0]).toEqual(initialObject);
    });

    it('should handle arrays as initial value', () => {
      const initialArray = [1, 2, 3];
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, initialArray));
      
      expect(result.current[0]).toEqual(initialArray);
    });

  });

  describe('Setting Values', () => {
    it('should update object values', () => {
      const { result } = renderHook(() => 
        useLocalStorage(TEST_KEY, { name: 'test', count: 0 })
      );
      
      act(() => {
        result.current[1]({ name: 'updated', count: 5 });
      });
      
      expect(result.current[0]).toEqual({ name: 'updated', count: 5 });
    });

    it('should update array values', () => {
      const { result } = renderHook(() => useLocalStorage(TEST_KEY, [1, 2, 3]));
      
      act(() => {
        result.current[1]([4, 5, 6]);
      });
      
      expect(result.current[0]).toEqual([4, 5, 6]);
    });

  });

  describe('Migration', () => {


    it('should not apply migration when localStorage is empty', () => {
      const migrate = jest.fn((oldValue: any) => oldValue);
      
      const { result } = renderHook(() => 
        useLocalStorage(TEST_KEY, 'initial', migrate)
      );
      
      expect(result.current[0]).toBe('initial');
      expect(migrate).not.toHaveBeenCalled();
    });

  });
});

