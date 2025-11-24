import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/api';
import type { CreateProjectData } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll().then(res => res.data),
  });
};

export const useProject = (id: string | number) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Invalid project ID');
      }
      return projectService.getById(id).then(res => res.data);
    },
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (project: CreateProjectData) => {
      if (!user) throw new Error('User must be authenticated');
      
      const projectData = {
        ...project,
        ownerId: user.id,
        teamMembers: [user.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        progress: 0,
      };
      
      const createdProject = await projectService.create(projectData as any).then(res => res.data);
      
      try {
        await fetch('http://localhost:3001/team-members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            projectId: createdProject.id,
            role: 'owner',
            joinedAt: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Error adding owner to team:', error);
      }
      
      return createdProject;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', newProject.id] });
      queryClient.invalidateQueries({ queryKey: ['team-members', newProject.id] });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, project }: { id: string | number; project: Partial<CreateProjectData> }) =>
      projectService.update(id, {
        ...project,
        updatedAt: new Date().toISOString(),
      } as any).then(res => res.data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
    },
    onError: (error) => {
      console.error('Error updating project:', error);
    }
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => projectService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['team-members', deletedId] });
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
    }
  });
};

export const useUpdateProjectProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, progress }: { projectId: string | number; progress: number }) =>
      projectService.update(projectId, {
        progress: Math.min(100, Math.max(0, progress)),
        updatedAt: new Date().toISOString(),
      } as any).then(res => res.data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
    },
    onError: (error) => {
      console.error('Error updating project progress:', error);
    }
  });
};