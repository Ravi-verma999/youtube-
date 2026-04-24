export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  description?: string;
  publishedAt?: string;
}

export type View = 'home' | 'search' | 'player' | 'history';
