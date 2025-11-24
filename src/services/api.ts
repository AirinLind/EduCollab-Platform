import axios from 'axios';
import type { 
  Project, Comment, User, CreateProjectData, 
  TeamMember, TeamInvite, ProjectRating,
  Milestone, ProgressUpdate, Notification 
} from '../types';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const projectService = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string | number) => api.get<Project>(`/projects/${id}`), 
  create: (project: CreateProjectData & { 
    ownerId: number; 
    teamMembers: number[]; 
    createdAt: string; 
    updatedAt: string; 
  }) => 
    api.post<Project>('/projects', project),
  update: (id: string | number, project: Partial<Project>) => 
    api.patch<Project>(`/projects/${id}`, project),
  delete: (id: string | number) => api.delete(`/projects/${id}`),
};

export const commentService = {
  getByProjectId: (projectId: string | number) =>
    api.get<Comment[]>(`/comments?projectId=${projectId}`),
  create: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Comment>('/comments', {
      ...comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  delete: (id: string | number) => api.delete(`/comments/${id}`), 
};

export const teamService = {
  getByProjectId: (projectId: string | number) => 
    api.get<TeamMember[]>(`/team-members?projectId=${projectId}`),
  
  addMember: (member: Omit<TeamMember, 'id' | 'joinedAt'>) => 
    api.post<TeamMember>('/team-members', {
      ...member,
      joinedAt: new Date().toISOString(),
    }),
  
  removeMember: (id: string | number) => 
    api.delete(`/team-members/${id}`),
  
  createInvite: (invite: Omit<TeamInvite, 'id' | 'createdAt' | 'status'>) => 
    api.post<TeamInvite>('/team-invites', {
      ...invite,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }),
  
  getUserInvites: (userId: string | number) => 
    api.get<TeamInvite[]>(`/team-invites?inviteeEmail=${userId}`),
};

export const userService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string | number) => api.get<User>(`/users/${id}`),
  getByEmail: (email: string) => 
    api.get<User[]>(`/users?email=${email}`).then(res => res.data[0]),
};

export const ratingService = {
  getProjectRatings: (projectId: string | number) =>
    api.get<ProjectRating[]>(`/project-ratings?projectId=${projectId}`),
  
  addRating: (rating: Omit<ProjectRating, 'id' | 'createdAt'>) =>
    api.post<ProjectRating>('/project-ratings', {
      ...rating,
      createdAt: new Date().toISOString(),
    }),
  
  updateRating: (id: string | number, rating: number) =>
    api.patch<ProjectRating>(`/project-ratings/${id}`, { rating }),
  };

export const milestoneService = {
  getByProjectId: (projectId: string | number) =>
    api.get<Milestone[]>(`/milestones?projectId=${projectId}`),
  
  create: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Milestone>('/milestones', {
      ...milestone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  
  update: (id: string | number, milestone: Partial<Milestone>) =>
    api.patch<Milestone>(`/milestones/${id}`, {
      ...milestone,
      updatedAt: new Date().toISOString(),
    }),
  
  delete: (id: string | number) => api.delete(`/milestones/${id}`),
};

export const progressService = {
  getByProjectId: (projectId: string | number) =>
    api.get<ProgressUpdate[]>(`/progress-updates?projectId=${projectId}`),
  
  create: (update: Omit<ProgressUpdate, 'id' | 'createdAt'>) =>
    api.post<ProgressUpdate>('/progress-updates', {
      ...update,
      createdAt: new Date().toISOString(),
    }),
};

export const notificationService = {
  getUserNotifications: (userId: string | number) =>
    api.get<Notification[]>(`/notifications?userId=${userId}&_sort=createdAt&_order=desc`),
  
  create: (notification: Omit<Notification, 'id' | 'createdAt'>) =>
    api.post<Notification>('/notifications', {
      ...notification,
      createdAt: new Date().toISOString(),
    }),
  
  markAsRead: (id: string | number) =>
    api.patch<Notification>(`/notifications/${id}`, { isRead: true }),
  
  markAllAsRead: (userId: string | number) => {
    return api.get<Notification[]>(`/notifications?userId=${userId}&isRead=false`)
      .then(response => {
        const updates = response.data.map(notification =>
          api.patch(`/notifications/${notification.id}`, { isRead: true })
        );
        return Promise.all(updates);
      });
  },
  
  delete: (id: string | number) => api.delete(`/notifications/${id}`),
};