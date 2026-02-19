
export type EducationalLevel = 'Infantil' | 'Primaria' | 'Secundaria' | 'Bachillerato';
export type MainCategory = 'General' | 'PT-AL';

export interface User {
  email: string;
  name: string;
  lastName?: string;
  password?: string;
  bio?: string;
  avatar?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface Resource {
  id: string;
  title: string;
  authorName: string;
  email: string;
  summary: string;
  level: EducationalLevel;
  subject: string;
  courses: string[];
  resourceType: string;
  fileType: 'pdf' | 'html' | 'office' | 'image';
  mainCategory: MainCategory;
  rating: number;
  ratingCount?: number;
  uploadDate: string;
  thumbnail: string;
  contentUrl: string;
  pastedCode?: string;
  kind?: 'material' | 'blog';
  neae?: string;
  desarrolloArea?: string;
}

export interface PrivateMessage {
  id: string;
  from: string; // email
  to: string; // email
  content: string;
  timestamp: number;
  read: boolean;
}

export enum AppView {
  Home = 'home',
  Explore = 'explore',
  Upload = 'upload',
  Account = 'account',
  Detail = 'detail',
  Profile = 'profile',
  TopDocentes = 'top-docentes',
  Messages = 'messages',
  Blog = 'blog' 
}