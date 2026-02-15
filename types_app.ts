
import { ReactNode } from 'react';

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
  type?: 'instruction' | 'camera' | 'profile' | 'security';
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
  lessons: Lesson[];
}

export interface Achievement {
  id: string;
  title: string;
  icon: ReactNode;
  unlocked: boolean;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export interface AppState {
  view: 'home' | 'module' | 'lesson' | 'training' | 'achievements' | 'camera_sim' | 'ai_guide';
  activeModuleId?: number;
  activeLessonId?: string;
}
