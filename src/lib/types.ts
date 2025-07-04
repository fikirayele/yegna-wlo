

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  strikes: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Report {
  reporterId: string;
  reason: string;
  createdAt: string;
}

export type PostStatus = 'published' | 'warned';

export interface Post {
  id:string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  comments: Comment[];
  likes: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaHint?: string;
  reports: Report[];
  status: PostStatus;
  warningMessage?: string;
}
