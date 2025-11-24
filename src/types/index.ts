export type User = {
  id: number | string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'mentor';
  avatar?: string;
  bio?: string;
  createdAt: string;
};

export type Project = {
  id: number | string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'archived';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  ownerId: number | string;
  teamMembers?: TeamMember[];
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  repositoryUrl?: string;
  demoUrl?: string;
  maxTeamSize?: number;
  lookingForMembers?: boolean;
  likes?: number;
  ratings?: ProjectRating[];
  progress?: number;
  milestones?: Milestone[];
};

export type Comment = {
  id: number | string;
  content: string;
  authorId: number | string;
  projectId: number | string;
  createdAt: string;
  updatedAt: string;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

export type CreateProjectData = {
  title: string;
  description: string;
  status: Project['status'];
  difficulty: Project['difficulty'];
  tags: string[];
  deadline?: string;
  repositoryUrl?: string;
  demoUrl?: string;
  maxTeamSize?: number;
  lookingForMembers?: boolean;
};

export type TeamMember = {
  id: number | string;
  userId: number | string;
  projectId: number | string;
  role: 'owner' | 'member' | 'mentor';
  joinedAt: string;
};

export type TeamInvite = {
  id: number | string;
  projectId: number | string;
  inviteeEmail: string;
  inviterId: number | string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

export type ProjectRating = {
  id: number | string;
  projectId: number | string;
  userId: number | string;
  rating: number; // 1-5
  createdAt: string;
};

export type ProjectLike = {
  id: number | string;
  projectId: number | string;
  userId: number | string;
  createdAt: string;
};

export type Milestone = {
  id: number | string;
  projectId: number | string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgressUpdate = {
  id: number | string;
  projectId: number | string;
  authorId: number | string;
  content: string;
  milestoneId?: number | string;
  createdAt: string;
};

export type Notification = {
  id: number | string;
  userId: number | string;
  type: 'invite' | 'milestone' | 'comment' | 'rating' | 'system';
  title: string;
  message: string;
  relatedId?: number | string; 
  isRead: boolean;
  createdAt: string;
};