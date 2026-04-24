import { Video } from '../types';

const FALLBACK_VIDEOS: Record<string, Video[]> = {
  'All': [
    { id: 'hHrn076Kg28', title: 'Deep Space Cinema - 4K High Fidelity', channel: 'Hans Zimmer', thumbnail: 'https://i.ytimg.com/vi/hHrn076Kg28/mqdefault.jpg', views: '200M views', time: '8 years ago', duration: '4:15' },
    { id: 'ScMzIvxBSi4', title: 'MKBHD: The Future is Here (Review)', channel: 'Marques Brownlee', thumbnail: 'https://i.ytimg.com/vi/ScMzIvxBSi4/mqdefault.jpg', views: '15M views', time: '1 year ago', duration: '29:56' },
    { id: '9bZkp7q19f0', title: 'Psy - Gangnam Style (Official 4K)', channel: 'officialpsy', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg', views: '5.2B views', time: '12 years ago', duration: '4:12' },
    { id: '0e3GPea1Tyg', title: '$456,000 Squid Game In Real Life!', channel: 'MrBeast', thumbnail: 'https://i.ytimg.com/vi/0e3GPea1Tyg/mqdefault.jpg', views: '650M views', time: '3 years ago', duration: '25:41' },
    { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', channel: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg', views: '8.4B views', time: '7 years ago', duration: '4:42' },
    { id: 'jgwWqEl69N8', title: 'iPhone 15 Pro Review: The Titanium Age', channel: 'MKBHD', thumbnail: 'https://i.ytimg.com/vi/jgwWqEl69N8/mqdefault.jpg', views: '12M views', time: '5 months ago', duration: '18:24' }
  ],
  'Music': [
    { id: 'hHrn076Kg28', title: 'Interstellar Main Theme (Hans Zimmer Official)', channel: 'Hans Zimmer', thumbnail: 'https://i.ytimg.com/vi/hHrn076Kg28/mqdefault.jpg', views: '200M views', time: '8 years ago', duration: '4:15' },
    { id: 'kJQP7kiw5Fk', title: 'Despacito ft. Daddy Yankee', channel: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg', views: '8.4B views', time: '7 years ago', duration: '4:42' },
    { id: '9bZkp7q19f0', title: 'Gangnam Style', channel: 'officialpsy', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg', views: '5.2B views', time: '12 years ago', duration: '4:12' }
  ],
  'Tech': [
    { id: 'ScMzIvxBSi4', title: 'The Apple Vision Pro Review', channel: 'Marques Brownlee', thumbnail: 'https://i.ytimg.com/vi/ScMzIvxBSi4/mqdefault.jpg', views: '15M views', time: '1 year ago', duration: '29:56' },
    { id: 'jgwWqEl69N8', title: 'iPhone 15 Pro Review', channel: 'MKBHD', thumbnail: 'https://i.ytimg.com/vi/jgwWqEl69N8/mqdefault.jpg', views: '12M views', time: '5 months ago', duration: '18:24' }
  ]
};

export function getLocalFallback(query: string): Video[] {
  const q = query.toLowerCase();
  for (const key in FALLBACK_VIDEOS) {
    if (q.includes(key.toLowerCase())) return FALLBACK_VIDEOS[key];
  }
  return FALLBACK_VIDEOS['All'];
}
