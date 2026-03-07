
export enum ViewType {
  HOME = 'HOME',
  EXPLORE = 'EXPLORE',
  CONNECT = 'CONNECT',
  PROFILE = 'PROFILE',
  CHAT = 'CHAT'
}

export type AppLanguage = 'EN' | 'CN' | 'JP' | 'KR' | 'FR' | 'ES' | 'DE' | 'IT' | 'PT' | 'RU' | 'AR';

export interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
  userQuery?: string;
  icebreakers?: string[];
  isInsight?: boolean;
  isWarning?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  imageUrl: string;
}

export interface UserProfile {
  occupation: string;
  nationality: string;
  durationInSH: string;
  interests: string[];
}
