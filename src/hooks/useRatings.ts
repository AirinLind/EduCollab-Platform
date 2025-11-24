import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useProjectRatings = (projectId: string | number) => {
  return useQuery({
    queryKey: ['project-ratings', projectId],
    queryFn: () => ratingService.getProjectRatings(projectId).then(res => res.data),
    enabled: !!projectId,
  });
};

export const useAddRating = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ projectId, rating }: { projectId: string | number; rating: number }) =>
      ratingService.addRating({
        projectId,
        userId: user!.id,
        rating,
      }).then(res => res.data),
    onSuccess: (newRating) => {
      queryClient.invalidateQueries({ queryKey: ['project-ratings', newRating.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Error adding rating:', error);
    }
  });
};

