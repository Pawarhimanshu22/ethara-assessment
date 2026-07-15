import { create } from 'zustand'

export const useProjectStore = create((set) => ({
  projects: [],
  selectedProject: null,

  setProjects: (projects) =>
    set({
      projects,
    }),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),

  updateProject: (updatedProject) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === updatedProject.id
          ? updatedProject
          : project
      ),
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter(
        (project) => project.id !== id
      ),
    })),

  setSelectedProject: (project) =>
    set({
      selectedProject: project,
    }),

  clearSelectedProject: () =>
    set({
      selectedProject: null,
    }),
}))