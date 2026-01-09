export type QuadrantId = 'q1' | 'q2' | 'q3' | 'q4';
export type Category = 'work' | 'personal';

export interface Log {
  id: string;
  text: string;
  time: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  quadrant: QuadrantId;
  category: Category;
  completed: boolean;
  createdTime: string;
  logs: Log[];
  images: string[]; // Base64 strings
}

export const QUADRANT_CONFIG: Record<QuadrantId, { title: string; subtitle: string; bg: string; border: string }> = {
  q1: { title: '🔥 重要且緊急', subtitle: '立即處理', bg: 'bg-red-50', border: 'border-red-400' },
  q2: { title: '📅 重要但不緊急', subtitle: '排程規劃', bg: 'bg-blue-50', border: 'border-blue-400' },
  q3: { title: '⚡ 緊急但不重要', subtitle: '授權他人', bg: 'bg-yellow-50', border: 'border-yellow-400' },
  q4: { title: '☕ 不重要也不緊急', subtitle: '考慮刪除', bg: 'bg-gray-100', border: 'border-gray-300' },
};