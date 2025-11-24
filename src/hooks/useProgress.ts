import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { milestoneService, progressService } from '../services/api';
import type { Milestone, ProgressUpdate } from '../types';

export const useMilestones = (projectId: string | number) => {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => milestoneService.getByProjectId(projectId).then(res => res.data),
    enabled: !!projectId,
  });
};

export const useProgressUpdates = (projectId: string | number) => {
  return useQuery({
    queryKey: ['progress-updates', projectId],
    queryFn: () => progressService.getByProjectId(projectId).then(res => res.data),
    enabled: !!projectId,
  });
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) =>
      milestoneService.create(milestone).then(res => res.data), 
    onSuccess: (newMilestone) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', newMilestone.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Error creating milestone:', error);
    }
  });
};

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, milestone }: { id: string | number; milestone: Partial<Milestone> }) =>
      milestoneService.update(id, milestone).then(res => res.data), 
    onSuccess: (updatedMilestone) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', updatedMilestone.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Error updating milestone:', error);
    }
  });
};

export const useCreateProgressUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: Omit<ProgressUpdate, 'id' | 'createdAt'>) =>
      progressService.create(update).then(res => res.data), 
    onSuccess: (newUpdate) => {
      queryClient.invalidateQueries({ queryKey: ['progress-updates', newUpdate.projectId] });
    },
  });
};