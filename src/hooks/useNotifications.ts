import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/api';
import type { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getUserNotifications(user!.id).then(res => res.data),
    enabled: !!user,
  });
};

export const useUnreadNotificationsCount = () => {
  const { data: notifications } = useNotifications();

  return notifications?.filter(notification => !notification.isRead).length || 0;
};

export const useCreateNotification = () => {
  return useMutation({
    mutationFn: (notification: Omit<Notification, 'id' | 'createdAt'>) =>
      notificationService.create(notification).then(res => res.data),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string | number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });
};