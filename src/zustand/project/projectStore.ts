import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Project {
  id: string;
  encoded_id: string;
  title: string;
  description: string;
  priority?: string;
  created_on: string;
  created_by_name: string;
  added_employees: any[];
  added_clients: any[];
}

interface ProjectState {
  projects: Project[];
  project: Project | null;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  resetProjects: () => void;

  setProject: (project: Project) => void;
  updateCurrentProject: (updates: Partial<Project>) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set) => ({
        projects: [],
        project: null,

        // array methods
        setProjects: (projects) => set({ projects }),
        addProject: (project) =>
          set((state) => ({ projects: [project, ...state.projects] })),
        updateProject: (id, updates) =>
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          })),
        removeProject: (id) =>
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
          })),
        resetProjects: () => set({ projects: [] }),

        // single project methods
        setProject: (project) => set({ project }),
        updateCurrentProject: (updates) =>
          set((state) =>
            state.project ? { project: { ...state.project, ...updates } } : {}
          ),
        resetProject: () => set({ project: null }),
      }),
      {
        name: 'projects-storage',
      }
    )
  )
);
