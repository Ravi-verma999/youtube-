export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  views: string;
  time: string;
  duration: string;
  description?: string;
  publishedAt?: string;
}

export type View = 'home' | 'search' | 'player' | 'history';
