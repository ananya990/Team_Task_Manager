import { create } from 'zustand';

import { Task, Pagination } from '@/types';

interface TaskStore {
  tasks: Task[];
  currentTask: Task | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  setTasks: (tasks: Task[], pagination?: Pagination) => void;
  setCurrentTask: (task: Task | null) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskStore>()((set) => ({
  tasks: [],
  currentTask: null,
  pagination: null,
  isLoading: false,
  error: null,

  setTasks: (tasks, pagination) =>
    set({ tasks, pagination }),

  setCurrentTask: (currentTask) =>
    set({ currentTask }),

  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),

  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === task._id ? task : t
      ),
      currentTask:
        state.currentTask?._id === task._id
          ? task
          : state.currentTask,
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter(
        (t) => t._id !== id
      ),
      currentTask:
        state.currentTask?._id === id
          ? null
          : state.currentTask,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));