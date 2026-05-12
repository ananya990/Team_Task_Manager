import { create } from 'zustand';

import { Project, Pagination } from '@/types';

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  setProjects: (projects: Project[], pagination?: Pagination) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectStore>()((set) => ({
  projects: [],
  currentProject: null,
  pagination: null,
  isLoading: false,
  error: null,

  setProjects: (projects, pagination) =>
    set({ projects, pagination }),

  setCurrentProject: (currentProject) =>
    set({ currentProject }),

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),

  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p._id === project._id ? project : p
      ),
      currentProject:
        state.currentProject?._id === project._id
          ? project
          : state.currentProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter(
        (p) => p._id !== id
      ),
      currentProject:
        state.currentProject?._id === id
          ? null
          : state.currentProject,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));