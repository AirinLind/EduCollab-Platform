import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService, userService } from '../services/api';
import type { TeamMember, TeamInvite } from '../types';

export const useTeamMembers = (projectId: string | number) => {
  return useQuery({
    queryKey: ['team-members', projectId],
    queryFn: () => teamService.getByProjectId(projectId).then(res => res.data),
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: Omit<TeamMember, 'id' | 'joinedAt'>) =>
      teamService.addMember(member).then(res => res.data),
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', newMember.projectId] });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => teamService.removeMember(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
};

export const useCreateTeamInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invite: Omit<TeamInvite, 'id' | 'createdAt' | 'status'>) =>
      teamService.createInvite(invite).then(res => res.data),
    onSuccess: (newInvite) => {
      queryClient.invalidateQueries({ queryKey: ['team-invites', newInvite.inviteeEmail] });
    },
  });
};

export const useUserInvites = (userId: string | number) => {
  return useQuery({
    queryKey: ['team-invites', userId],
    queryFn: () => teamService.getUserInvites(userId).then(res => res.data),
  });
};

export const useUserByEmail = (email: string) => {
  return useQuery({
    queryKey: ['user', email],
    queryFn: () => userService.getByEmail(email),
    enabled: !!email,
  });
};

export const useUpdateTeamInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: TeamInvite['status'] }) =>
      Promise.resolve({ id, status }),
    onSuccess: (updatedInvite) => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
    },
  });
};