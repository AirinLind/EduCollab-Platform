import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/api';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll().then(res => res.data),
  });
};

export const useUser = (id: number | string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id).then(res => res.data),
  });
};