import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/api';
import type { Comment } from '../types';

export const useComments = (projectId: number | string) => {
  return useQuery({
    queryKey: ['comments', projectId],
    queryFn: () => commentService.getByProjectId(projectId).then(res => res.data),
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) =>
      commentService.create(comment).then(res => res.data),
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({ queryKey: ['comments', newComment.projectId] });
    },
  });
};