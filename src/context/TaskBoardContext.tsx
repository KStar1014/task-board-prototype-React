import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useBoardState } from '../hooks/useBoardState';

type TaskBoardContextType = ReturnType<typeof useBoardState>;

const TaskBoardContext = createContext<TaskBoardContextType | null>(null);

export function TaskBoardProvider({ children }: { children: ReactNode }) {
  const taskBoard = useBoardState();

  return (
    <TaskBoardContext.Provider value={taskBoard}>
      {children}
    </TaskBoardContext.Provider>
  );
}

export function useTaskBoardContext() {
  const context = useContext(TaskBoardContext);
  if (!context) {
    throw new Error('useTaskBoardContext must be used within a TaskBoardProvider');
  }
  return context;
}