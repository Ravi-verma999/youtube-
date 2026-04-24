/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Menu, 
  Home, 
  PlaySquare, 
  Clock, 
  ThumbsUp, 
  ChevronRight, 
  MoreVertical,
  Bell,
  Video as VideoIcon,
  Mic,
  History,
  Sparkles,
  Send,
  MessageSquare,
  SkipForward,
  Shield,
  Download,
  Share,
  Music,
  Maximize,
  Minimize,
  Settings,
  X,
  Zap,
  Lock,
  CheckCircle2,
  AlertCircle,
  Tag,
  Type,
  Hash,
  Layout,
  Plus,
  Share2
} from 'lucide-react';
import { Video } from './types';
import { 
  getTrendingVideos, 
  aiSearchVideos, 
  getAdvancedInsights, 
  chatWithVideo,
  getRecommendations,
  getCreatorSuggestions
} from './services/geminiService';

const KING_ACTIVATION_CODE = "KING-2026";

const KING_ELITE_COLLECTION: Video[] = [
  { id: 'hHrn076Kg28', title: 'Deep Space Cinema - 4K High Fidelity', channel: 'Hans Zimmer', thumbnail: 'https://i.ytimg.com/vi/hHrn076Kg28/mqdefault.jpg', views: '200M views', time: '8 years ago', duration: '4:15' },
  { id: 'ScMzIvxBSi4', title: 'MKBHD: The Future is Here (Review)', channel: 'Marques Brownlee', thumbnail: 'https://i.ytimg.com/vi/ScMzIvxBSi4/mqdefault.jpg', views: '15M views', time: '1 year ago', duration: '29:56' },
  { id: '9bZkp7q19f0', title: 'Psy - Gangnam Style (Official 4K)', channel: 'officialpsy', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg', views: '5.2B views', time: '12 years ago', duration: '4:12' },
  { id: '0e3GPea1Tyg', title: '$456,000 Squid Game In Real Life!', channel: 'MrBeast', thumbnail: 'https://i.ytimg.com/vi/0e3GPea1Tyg/mqdefault.jpg', views: '650M views', time: '3 years ago', duration: '25:41' }
];

type KingView = 'home' | 'player' | 'creator' | 'shorts' | 'settings' | 'history' | 'subscriptions';

export default function App() {
  const [isActivated, setIsActivated] = useState(false);
  const [activationInput, setActivationInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [activationError, setActivationError] = useState(false);
  
  const [currentView, setCurrentView] = useState<KingView>('home');
  const [videos, setVideos] = useState<Video[]>(KING_ELITE_COLLECTION);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState('Auto');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  
  const [watchHistory, setWatchHistory] = useState<Video[]>([]);
  const [currentShortIndex, setCurrentShortIndex] = useState(0);

  const [creatorTopic, setCreatorTopic] = useState('');
  const [creatorData, setCreatorData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [activeFilter, setActiveFilter] = useState('All');
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    uploadDate: 'Any time',
    duration: 'Any',
    type: 'Video',
    sortBy: 'Relevance'
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const active = localStorage.getItem('yt_cinema_active_v9');
    const savedEmail = localStorage.getItem('yt_user_email');
    const savedHistory = localStorage.getItem('yt_watch_history');

    if (active === 'true' && savedEmail) {
      setIsActivated(true);
      setEmailInput(savedEmail);
    }

    if (savedHistory) {
      try {
        setWatchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }

    loadVideos(true);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
  }, []);

  const getQualityParam = () => {
    switch(videoQuality) {
      case '1080p': return '&vq=hd1080';
      case '720p': return '&vq=hd720';
      case '480p': return '&vq=large';
      default: return '';
    }
  };

  const cycleQuality = () => {
    const qualities = ['Auto', '1080p', '720p', '480p'];
    const next = qualities[(qualities.indexOf(videoQuality) + 1) % qualities.length];
    setVideoQuality(next);
  };

  const sendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackMsg('');
      setIsFeedbackOpen(false);
    }, 3000);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'YouTube Cinema v9.5',
          text: 'Check out this ad-free YouTube experience with technical support for latest gadgets from Verma Visit!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('App link copied to clipboard!');
    }
  };

  const loadVideos = async (initial = false) => {
    setIsSearching(true);
    const data = await getTrendingVideos();
    if (data.length > 0) setVideos(prev => initial ? data : [...prev, ...data]);
    setIsSearching(false);
  };

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (activationInput.toUpperCase() === KING_ACTIVATION_CODE && emailInput.includes('@')) {
      setIsActivated(true);
      localStorage.setItem('yt_cinema_active_v9', 'true');
      localStorage.setItem('yt_user_email', emailInput);
    } else {
      setActivationError(true);
      setTimeout(() => setActivationError(false), 2000);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    
    setIsSearching(true);
    setVideos([]); // Clear videos to show new results are coming
    setCurrentView('home');
    setSelectedVideo(null);
    setIsMiniPlayer(false);
    setIsMobileSearchVisible(false);
    
    try {
      const results = await aiSearchVideos(query);
      setVideos(results.length > 0 ? results : KING_ELITE_COLLECTION);
    } catch (error) {
      setVideos(KING_ELITE_COLLECTION);
    } finally {
      setIsSearching(false);
    }
  };

  const selectVideo = async (video: Video) => {
    setSelectedVideo(video);
    setCurrentView('player');
    setIsMiniPlayer(false);
    
    // Update history
    setWatchHistory(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      const updated = [video, ...filtered].slice(0, 50);
      localStorage.setItem('yt_watch_history', JSON.stringify(updated));
      return updated;
    });

    const insight = await getAdvancedInsights(video.title, video.channel);
    setAiInsight(insight);
  };

  const nextShort = () => {
    setCurrentShortIndex(prev => (prev + 1) % videos.length);
  };

  const generateCreatorTools = async () => {
    if (!creatorTopic.trim()) return;
    setIsGenerating(true);
    try {
      const results = await getCreatorSuggestions(creatorTopic);
      setCreatorData(results);
    } catch (error) {
      setCreatorData("Deep SEO extraction encounterd an error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isActivated) {
    return (
      <div className="activation-bg">
        <div className="activation-glow" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-md text-center space-y-8">
          <div className="w-20 h-20 bg-red-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-red-600/30 font-black italic">Y</div>
          <div className="space-y-4">
             <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Station Secure</h1>
             <p className="text-yt-gray text-sm px-8">Enter your credentials for ad-free cinema access.</p>
          </div>
          <form onSubmit={handleActivation} className="space-y-4">
             <input type="email" placeholder="Email Address" className="input-code text-left px-6 text-sm"
               value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
             <input type="text" placeholder="ACTIVATION CODE" className={`input-code ${activationError ? 'border-red-500 animate-shake text-red-500' : ''}`}
               value={activationInput} onChange={(e) => setActivationInput(e.target.value)} required />
             <button type="submit" className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">Unlock Station</button>
             <div className="flex flex-col gap-1 items-center">
                <p className="text-[10px] text-yt-gray/50 tracking-[0.3em]">CODE: KING-2026</p>
                <p className="text-[10px] text-red-600/50 font-bold">LIMITED TIME ACCESS</p>
             </div>
          </form>
          <div className="pt-8 border-t border-white/5">
             <p className="text-[10px] text-[#444] uppercase tracking-tighter">Powered by Verma Visit Tech Group</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col text-white no-scrollbar font-sans selection:bg-red-600/30">
      
      {/* 100% YouTube Standard Responsive Header */}
      <header className="h-14 bg-[#0f0f0f] flex items-center justify-between px-2 sm:px-4 sticky top-0 z-[110]">
        <AnimatePresence>
          {isMobileSearchVisible ? (
            <motion.div 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: 20 }}
               className="absolute inset-0 bg-[#0f0f0f] z-[120] flex items-center px-4 gap-2"
            >
               <button onClick={() => setIsMobileSearchVisible(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
               </button>
               <form onSubmit={handleSearch} className="flex-1 flex group h-10">
                  <input 
                    type="text" 
                    placeholder="Search YouTube"
                    className="flex-1 bg-[#121212] border border-[#303030] rounded-l-full px-4 outline-none text-base focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="bg-[#222] px-5 border border-l-0 border-[#303030] rounded-r-full">
                     <Search size={20} className="text-[#888]" />
                  </button>
               </form>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Left: Brand */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-fit">
          <button onClick={() => setCurrentView('settings')} className="p-2 hover:bg-white/10 rounded-full cursor-pointer hidden sm:block"><Menu size={20} /></button>
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => { setSelectedVideo(null); setCurrentView('home'); }}>
            <div className="bg-red-600 px-1 py-0.5 rounded-sm"><PlaySquare size={18} fill="white" stroke="none" /></div>
            <span className="text-xl font-bold tracking-tighter text-white">YouTube</span>
          </div>
        </div>

        {/* Center: Search Bar (Desktop Wide) */}
        <div className="hidden sm:flex flex-1 max-w-[720px] items-center justify-center gap-4 px-4">
          <form onSubmit={handleSearch} className="flex-1 flex max-w-[600px] h-10 group">
             <div className="flex-1 flex items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 group-focus-within:border-blue-500 transition-all ml-1 shadow-inner">
                <Search size={16} className="text-[#888] group-focus-within:block hidden mr-3" />
                <input 
                  type="text" 
                  placeholder="Search"
                  className="w-full bg-transparent outline-none text-base placeholder:text-[#888] font-normal"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button 
               type="submit" 
               className="bg-[#222] px-5 flex items-center justify-center border border-l-0 border-[#303030] rounded-r-full hover:bg-white/5 transition-colors cursor-pointer w-16"
               title="Search"
             >
                <Search size={20} className="text-[#888] group-hover:text-white transition-colors" />
             </button>
          </form>
          <button type="button" className="w-10 h-10 bg-[#181818] rounded-full flex items-center justify-center hover:bg-[#2a2a2a] transition-colors cursor-pointer" title="Search with your voice">
             <Mic size={20} />
          </button>
        </div>

        {/* Right: Tools & Mobile Search Trigger */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-fit justify-end">
           <button onClick={() => setIsMobileSearchVisible(true)} className="p-2 hover:bg-white/10 rounded-full sm:hidden">
              <Search size={22} />
           </button>
           <button onClick={() => setCurrentView('creator')} className="p-2 hover:bg-white/10 rounded-full cursor-pointer hidden xs:block" title="Create"><Plus size={22} /></button>
           <button className="p-2 hover:bg-white/10 rounded-full cursor-pointer"><Bell size={22} /></button>
           <div 
             onClick={() => setCurrentView('settings')}
             className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center font-bold text-xs border border-white/10 ml-1 cursor-pointer shadow-lg overflow-hidden active:scale-90 transition-transform"
           >
              <div className="bg-gradient-to-tr from-blue-600 to-amber-500 w-full h-full flex items-center justify-center text-[10px]">V</div>
           </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[240px] hidden xl:flex flex-col p-3 no-scrollbar shrink-0">
           <SidebarItem icon={<Home size={22} />} label="Home" active={currentView === 'home'} onClick={() => {setSelectedVideo(null); setCurrentView('home');}} />
           <SidebarItem icon={<Zap size={22} />} label="Shorts" active={currentView === 'shorts'} onClick={() => setCurrentView('shorts')} />
           <SidebarItem icon={<PlaySquare size={22} />} label="Subscriptions" active={currentView === 'subscriptions'} onClick={() => setCurrentView('subscriptions')} />
           <hr className="my-3 border-[#303030]" />
           <SidebarItem icon={<VideoIcon size={22} />} label="Creator Studio" active={currentView === 'creator'} onClick={() => setCurrentView('creator')} />
           <SidebarItem icon={<History size={22} />} label="History" active={currentView === 'history'} onClick={() => setCurrentView('history')} />
           <SidebarItem icon={<Music size={22} />} label="Music Mode" active={isAudioOnly} onClick={() => setIsAudioOnly(!isAudioOnly)} />
           <SidebarItem icon={<Settings size={22} />} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
           <SidebarItem icon={<AlertCircle size={22} />} label="Help & Feedback" onClick={() => setIsFeedbackOpen(true)} />
           <hr className="my-3 border-[#303030]" />
           {isInstallable && (
             <SidebarItem icon={<Download size={22} />} label="Install App" onClick={handleInstallApp} />
           )}
           <SidebarItem icon={<Share2 size={22} />} label="Share App" onClick={handleShareApp} />
           <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-2 text-red-500">
                 <Shield size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest italic">Ghost Engine v9.1</span>
              </div>
              <p className="text-[10px] text-yt-gray leading-relaxed">Secured ad-free session active for ravinehla00</p>
           </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-[#0f0f0f]">
          <AnimatePresence mode="wait">
            
            {/* HOME VIEW */}
            {currentView === 'home' && !selectedVideo && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6 max-w-[1920px] mx-auto space-y-6">
                 
                 {/* Category Pills & Search Filters */}
                 <div className="sticky top-0 bg-[#0f0f0f] z-[50] -mx-4 px-4 py-2 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex gap-3 overflow-x-auto no-scrollbar flex-1">
                          {['All', 'Verma Tech', 'Gadgets', 'Trending', 'Live', 'Music', 'Gaming', 'News', 'Smartphones', 'Unboxing', 'SEO Pro'].map((cat) => (
                            <button 
                              key={cat} 
                              onClick={() => setActiveFilter(cat)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeFilter === cat ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                              {cat}
                            </button>
                          ))}
                       </div>
                       {searchQuery && (
                         <button 
                           onClick={() => setIsSearchFilterOpen(!isSearchFilterOpen)}
                           className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${isSearchFilterOpen ? 'bg-red-600 text-white' : 'bg-white/5 text-yt-gray hover:bg-white/10'}`}
                         >
                            <Settings size={14} /> Filters
                         </button>
                       )}
                    </div>

                    <AnimatePresence>
                       {isSearchFilterOpen && searchQuery && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }} 
                           animate={{ height: 'auto', opacity: 1 }} 
                           exit={{ height: 0, opacity: 0 }}
                           className="overflow-hidden border-t border-white/5 pt-4 pb-2"
                         >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
                               <FilterGroup label="Upload Date" options={['Last hour', 'Today', 'This week', 'This month']} value={searchFilters.uploadDate} onChange={(v) => setSearchFilters({...searchFilters, uploadDate: v})} />
                               <FilterGroup label="Duration" options={['Under 4 minutes', '4-20 minutes', 'Over 20 minutes']} value={searchFilters.duration} onChange={(v) => setSearchFilters({...searchFilters, duration: v})} />
                               <FilterGroup label="Type" options={['Video', 'Channel', 'Playlist', 'Movie']} value={searchFilters.type} onChange={(v) => setSearchFilters({...searchFilters, type: v})} />
                               <FilterGroup label="Sort By" options={['Relevance', 'Upload date', 'View count', 'Rating']} value={searchFilters.sortBy} onChange={(v) => setSearchFilters({...searchFilters, sortBy: v})} />
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>

                 {/* Verma Visit Announcement */}
                 <div className="announcement-banner relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-1">
                       <div className="flex items-center gap-2 text-red-500 font-black text-sm uppercase tracking-widest">
                          <Sparkles size={14} fill="currentColor" /> Verma Cinema Access
                       </div>
                       <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Verma Visit for new gadgets and tech gadgets at lowest price and apps</h2>
                       <p className="text-white/40 text-xs italic">Authentic tech library synced with ad-free architecture.</p>
                       
                       {isInstallable && (
                         <button 
                           onClick={handleInstallApp}
                           className="mt-4 w-fit bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                         >
                           <Download size={16} /> Install App Now
                         </button>
                       )}
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
                       <PlaySquare size={160} />
                    </div>
                 </div>

                 <div className={searchQuery ? "flex flex-col gap-4 max-w-5xl mx-auto" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10"}>
                    {isSearching ? (
                       Array(15).fill(0).map((_, i) => <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />)
                    ) : (
                       videos.map((v, i) => (
                         searchQuery ? (
                            <div key={`${v.id}-${i}`} className="flex flex-col sm:flex-row gap-4 p-2 group cursor-pointer hover:bg-white/5 rounded-2xl transition-all" onClick={() => selectVideo(v)}>
                               <div className="w-full sm:w-72 md:w-80 aspect-video relative rounded-xl overflow-hidden bg-white/5 shrink-0 shadow-lg border border-white/5">
                                  <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" referrerPolicy="no-referrer" />
                                  <div className="absolute bottom-1 right-1 bg-black/90 px-1.5 py-0.5 rounded text-[11px] font-bold">{v.duration}</div>
                               </div>
                               <div className="flex-1 space-y-2 py-1">
                                  <h4 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">{v.title}</h4>
                                  <p className="text-xs text-yt-gray">{v.views} • {v.time} ago</p>
                                  <div className="flex items-center gap-2 py-2">
                                     <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center font-bold text-[10px] border border-white/5">{v.channel[0]}</div>
                                     <span className="text-xs text-yt-gray font-bold hover:text-white transition-colors">{v.channel}</span>
                                  </div>
                                  <p className="text-[11px] text-yt-gray/50 line-clamp-2 leading-relaxed font-sans max-w-2xl">
                                     This premium content is curated by Verma Visit. Experience ad-free native playback and high-quality gadget reviews tailored for your tech journey.
                                  </p>
                                  <div className="flex gap-2">
                                     <div className="bg-red-600/10 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">4K Active</div>
                                     <div className="bg-white/5 text-yt-gray px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">Verified</div>
                                  </div>
                               </div>
                            </div>
                         ) : (
                            <div key={`${v.id}-${i}`} className="yt-card group" onClick={() => selectVideo(v)}>
                               <div className="yt-thumbnail shadow-2xl relative overflow-hidden rounded-xl border border-white/5 bg-white/5 aspect-video">
                                  <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" referrerPolicy="no-referrer" />
                                  <div className="absolute bottom-1 right-1 bg-black/90 px-1.5 py-0.5 rounded text-[11px] font-bold">{v.duration}</div>
                               </div>
                               <div className="flex gap-3 mt-3 px-1">
                                  <div className="w-9 h-9 rounded-full bg-[#222] shrink-0 flex items-center justify-center font-bold text-xs border border-white/5">{v.channel[0]}</div>
                                  <div className="min-w-0">
                                     <h4 className="font-bold text-[15px] leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">{v.title}</h4>
                                     <p className="text-xs text-yt-gray mt-1 truncate">{v.channel}</p>
                                     <p className="text-[11px] text-yt-gray/50 mt-0.5">{v.views} • Verma Tech Verified</p>
                                  </div>
                               </div>
                            </div>
                         )
                       ))
                    )}
                 </div>
              </motion.div>
            )}

            {/* CREATOR STUDIO */}
            {currentView === 'creator' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-10 max-w-5xl mx-auto space-y-12">
                 <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-red-600/30 text-white"><Sparkles size={32} /></div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic">Creator Studio Pro</h2>
                    <p className="text-yt-gray text-sm sm:text-base max-w-xl mx-auto">Elite AI tools for viral title optimization, keywords, and hashtags.</p>
                 </div>

                 <div className="bg-[#121212] border border-[#303030] rounded-[2.5rem] p-6 sm:p-12 space-y-10 shadow-2xl">
                    <div className="space-y-6">
                       <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#555] ml-2 flex items-center gap-2"><Type size={14} /> Topic / Content Analysis</label>
                       <div className="flex flex-col sm:flex-row gap-4">
                          <input 
                            type="text" 
                            className="creator-input flex-1" 
                            placeholder="e.g. Best Gadgets under 500Rs..." 
                            value={creatorTopic}
                            onChange={(e) => setCreatorTopic(e.target.value)}
                          />
                          <button onClick={generateCreatorTools} disabled={isGenerating} className="bg-red-600 px-8 py-4 sm:py-0 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all shadow-xl shadow-red-600/20 text-sm">Generate SEO</button>
                       </div>
                    </div>

                    {creatorData && (
                       <div className="result-card animate-in fade-in zoom-in duration-500">
                          <div className="flex items-center justify-between border-b border-white/5 pb-6">
                             <div className="flex items-center gap-3 text-amber-500">
                                <Sparkles size={24} />
                                <h3 className="text-xl font-bold tracking-tight">SEO Performance Data</h3>
                             </div>
                             <div className="badge-creator font-black text-[9px]">Verified AI Output</div>
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none font-sans leading-relaxed text-white/90 whitespace-pre-line py-4">
                             {creatorData}
                          </div>
                       </div>
                    )}
                 </div>
              </motion.div>
            )}

            {/* PLAYER VIEW */}
            {currentView === 'player' && selectedVideo && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 flex flex-col xl:flex-row gap-8 max-w-[1850px] mx-auto pb-24">
                 <div className="flex-1 space-y-6">
                    <div className={`video-player-container bg-black rounded-xl overflow-hidden aspect-video border border-white/5 shadow-2xl relative ${isAudioOnly ? 'mp3-mode-active' : ''}`}>
                       {isAudioOnly ? (
                          <div className="flex flex-col items-center justify-center h-full space-y-4">
                             <div className="mp3-glow" />
                             <h3 className="text-xl font-bold italic tracking-widest text-red-600">MUSIC ENGINE LIVE</h3>
                             <p className="text-xs text-[#555] uppercase font-bold tracking-tighter">Ad-Free Background Audio Mode</p>
                          </div>
                       ) : (
                         <iframe 
                            key={`${selectedVideo.id}-${videoQuality}`}
                            src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}${getQualityParam()}`}
                            className="w-full h-full"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                         />
                       )}
                    </div>

                    <div className="space-y-6 px-1">
                       <h2 className="text-2xl font-bold leading-tight">{selectedVideo.title}</h2>
                       
                       {/* DIRECT ACTION BAR */}
                       <div className="flex flex-wrap items-center gap-3 py-5 border-y border-white/5 no-scrollbar overflow-x-auto">
                          <div className="flex items-center gap-4 mr-6 shrink-0">
                             <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center font-bold text-red-600 border border-white/10">{selectedVideo.channel[0]}</div>
                             <div className="flex flex-col min-w-0"><span className="font-bold text-[15px] leading-tight truncate">{selectedVideo.channel}</span><span className="text-[11px] text-[#555] font-bold">Verma Tech Certified</span></div>
                             <button className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm ml-4 hover:bg-[#e5e5e5] active:scale-95 transition-all shadow-xl uppercase tracking-tighter">Subscribe</button>
                          </div>
                          
                          <div className="h-8 w-px bg-white/10 mx-2" />
                          
                          <button onClick={() => setIsAudioOnly(!isAudioOnly)} className={`action-btn ${isAudioOnly ? 'bg-red-600/20 text-red-500 border-red-600/30' : ''}`}><Music size={18} /> MP3 Mode</button>
                          <button onClick={() => setIsMiniPlayer(true)} className="action-btn"><Minimize size={18} /> Pop-up</button>
                          <button onClick={() => {}} className="action-btn"><Download size={18} /> Download</button>
                          <button className="action-btn"><Share size={18} /> Share</button>
                          
                          <div className="h-8 w-px bg-white/10 mx-2" />
                          
                          <button onClick={() => setPlaybackSpeed(s => s === 2 ? 0.5 : s + 0.5)} className="action-btn bg-blue-600/10 border-blue-600/20 text-blue-400">
                             <Settings size={16} /> {playbackSpeed}x
                          </button>
                          
                          <button onClick={cycleQuality} className="action-btn bg-amber-600/10 border-amber-600/20 text-amber-500">
                             <Maximize size={16} /> {videoQuality}
                          </button>
                       </div>

                       {/* AI Insights Card */}
                       <div className="bg-[#121212] p-6 sm:p-8 rounded-3xl border border-white/5">
                          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-[#555] mb-4">
                             <Sparkles size={16} className="text-amber-500" /> Verma Intelligence Sync
                          </div>
                          <p className="text-white/80 leading-relaxed text-[15px] font-sans italic opacity-90">{aiInsight || "Extracting deep cinematic synthesis..."}</p>
                       </div>
                    </div>
                 </div>

                 {/* SIDEBAR RECOMMENDATIONS */}
                 <div className="w-full xl:w-[420px] shrink-0 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#555] px-2 italic">Suggested Experience</h3>
                    <div className="space-y-4">
                       {videos.slice(0, 8).map((v, i) => (
                         <div key={`${v.id}-siderec-${i}`} className="flex gap-3 group cursor-pointer" onClick={() => selectVideo(v)}>
                            <div className="w-40 h-24 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-white/5 shadow-md">
                               <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0 flex-1">
                               <h4 className="text-[13px] font-bold line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">{v.title}</h4>
                               <p className="text-[11px] text-yt-gray mt-2 truncate">{v.channel}</p>
                               <span className="text-[9px] font-black text-red-600 uppercase mt-1">High Quality</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {/* SHORTS VIEW */}
            {currentView === 'shorts' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center bg-black">
                 <div className="h-full w-full max-w-[500px] relative overflow-hidden flex flex-col group">
                    {videos[currentShortIndex] ? (
                      <div className="relative w-full h-full">
                         <iframe 
                            key={`short-${videos[currentShortIndex].id}`}
                            src={`https://www.youtube.com/embed/${videos[currentShortIndex].id}?autoplay=1&controls=0&modestbranding=1&rel=0&origin=${window.location.origin}`}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media; fullscreen"
                            referrerPolicy="no-referrer-when-downgrade"
                         />
                         
                         {/* Simple Overlay - Hidden until hover/focus on mobile */}
                         <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center gap-3 mb-3">
                               <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center font-bold text-sm border border-white/10">
                                  {videos[currentShortIndex].channel[0]}
                               </div>
                               <span className="font-bold text-white text-[15px]">@{videos[currentShortIndex].channel.replace(/\s+/g, '').toLowerCase()}</span>
                               <button className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-90 ml-2">Subscribe</button>
                            </div>
                            <p className="text-sm font-medium text-white/90 mb-4 line-clamp-2">
                               {videos[currentShortIndex].title}
                            </p>
                         </div>

                         {/* Action Bar */}
                         <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                            <ShortsIcon icon={<ThumbsUp size={28} />} label="Like" />
                            <ShortsIcon icon={<MessageSquare size={28} />} label="Comments" />
                            <ShortsIcon icon={<Share2 size={28} />} label="Share" onClick={handleShareApp} />
                            <ShortsIcon icon={<SkipForward size={28} className="text-red-600" />} label="Next" onClick={nextShort} />
                         </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                         <Zap size={32} className="text-red-600 animate-pulse" />
                         <p className="text-xs text-yt-gray">Loading Shorts...</p>
                      </div>
                    )}
                 </div>
              </motion.div>
            )}

            {/* SETTINGS VIEW */}
            {currentView === 'settings' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 sm:p-10 max-w-4xl mx-auto space-y-12">
                 <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => setCurrentView('home')} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">Station Settings</h2>
                 </div>

                 <div className="bg-[#121212] border border-[#303030] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 sm:p-12 border-b border-white/5 flex flex-col sm:flex-row items-center gap-8">
                       <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-red-600 via-amber-500 to-blue-600">
                          <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-4xl font-black italic text-white shadow-inner">V</div>
                       </div>
                       <div className="flex-1 text-center sm:text-left space-y-2">
                          <h3 className="text-2xl font-bold">Verma User Elite</h3>
                          <p className="text-yt-gray text-sm">{emailInput || 'ravinehla00@gmail.com'} • Ghost ID #8291</p>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                             <div className="bg-red-600/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/20">Cinema Pro</div>
                             <div className="bg-blue-600/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20">Ad-Free Native</div>
                             <div className="bg-amber-600/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-600/20">Verma Tech Dev</div>
                          </div>
                       </div>
                    </div>

                 <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <h4 className="text-xs font-black uppercase tracking-widest text-[#555] flex items-center gap-2"><Maximize size={14} /> Display & Playback</h4>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all cursor-pointer">
                             <span className="text-sm font-bold">Auto-Play Next Video</span>
                             <div className="w-10 h-6 bg-red-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all cursor-pointer">
                             <span className="text-sm font-bold">Ambient Lighting Engine</span>
                             <div className="w-10 h-6 bg-red-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all cursor-pointer">
                             <span className="text-sm font-bold">Ghost Mode (Anoymous)</span>
                             <div className="w-10 h-6 bg-white/10 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h4 className="text-xs font-black uppercase tracking-widest text-[#555] flex items-center gap-2"><Download size={14} /> App & Deployment</h4>
                       <div className="space-y-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                             <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Installation Helper</p>
                             <p className="text-[11px] text-yt-gray">Tap "Add to Home Screen" to install this cinema station just like a native app. Ad-free engine will persist across all launches.</p>
                             <button onClick={handleInstallApp} className="w-full py-2 bg-white text-black text-[10px] font-black uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all">Install Now</button>
                          </div>
                          <button onClick={handleShareApp} className="w-full text-left p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all flex items-center justify-between">
                             <span className="text-sm font-bold">Export Station Link</span>
                             <Share2 size={18} />
                          </button>
                          <button onClick={() => { setWatchHistory([]); localStorage.removeItem('yt_watch_history'); }} className="w-full text-left p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all flex items-center justify-between group">
                             <span className="text-sm font-bold group-hover:text-red-500 transition-colors">Clear Watch Engine History</span>
                             <History size={18} />
                          </button>
                       </div>
                    </div>
                 </div>
                 </div>
              </motion.div>
            )}

            {/* SUBSCRIPTIONS / HISTORY / ETC */}
            {(currentView === 'history' || currentView === 'subscriptions') && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-red-600 border border-white/10 shrink-0">
                        {currentView === 'history' ? <History size={24} /> : <PlaySquare size={24} />}
                     </div>
                     <h3 className="text-2xl font-black tracking-tight uppercase italic">{currentView} Engine</h3>
                  </div>

                  {currentView === 'history' && watchHistory.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                       {watchHistory.map((v, i) => (
                         <div key={`${v.id}-history-${i}`} className="yt-card group flex flex-col" onClick={() => selectVideo(v)}>
                            <div className="aspect-video relative rounded-xl overflow-hidden border border-white/5 bg-white/5">
                               <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                               <div className="absolute bottom-1 right-1 bg-black/90 px-1 py-0.5 rounded text-[10px] font-bold">{v.duration}</div>
                            </div>
                            <div className="mt-3">
                               <h4 className="text-sm font-bold line-clamp-2 leading-tight group-hover:text-red-500">{v.title}</h4>
                               <p className="text-[11px] text-yt-gray mt-1">{v.channel}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center space-y-6 max-w-xl mx-auto bg-white/5 rounded-[2.5rem] border border-white/5">
                       <p className="text-yt-gray text-sm">Synchronizing your local ad-free cache database. Recent activity for "{emailInput || 'ravinehla00'}" is being extracted from the cloud...</p>
                       <button onClick={() => setCurrentView('home')} className="px-8 py-3 bg-white text-black rounded-full font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">Back to Cinema</button>
                    </div>
                  )}
               </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Mini Player */}
      <AnimatePresence>
        {selectedVideo && isMiniPlayer && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-20 right-6 w-80 sm:w-96 aspect-video bg-black z-[120] rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden group"
          >
             <iframe src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1`} className="w-full h-full" />
             <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsMiniPlayer(false)} className="p-1.5 bg-black/80 rounded-full hover:bg-white/10 border border-white/5"><Maximize size={16} /></button>
                <button onClick={() => setSelectedVideo(null)} className="p-1.5 bg-black/80 rounded-full hover:bg-white/10 border border-white/5"><X size={16} /></button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
               onClick={() => setIsFeedbackOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl space-y-6"
            >
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-red-600">
                     <AlertCircle size={24} />
                     <h3 className="text-xl font-bold uppercase tracking-tighter">Support & Feedback</h3>
                  </div>
                  <button onClick={() => setIsFeedbackOpen(false)}><X size={24} /></button>
               </div>

               <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-start gap-4">
                  <Sparkles size={20} className="text-red-500 shrink-0 mt-1" />
                  <div>
                     <p className="text-sm font-bold text-white">Same-Day Resolution Promise</p>
                     <p className="text-[11px] text-yt-gray">Your tech queries and gadget problems are solved within 24 hours by the Verma tech team.</p>
                  </div>
               </div>

               {feedbackSent ? (
                 <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full mx-auto flex items-center justify-center">
                       <CheckCircle2 size={32} />
                    </div>
                    <p className="font-bold text-lg">Feedback Received!</p>
                    <p className="text-sm text-yt-gray">The Verma team is already investigating your query.</p>
                 </motion.div>
               ) : (
                 <form onSubmit={sendFeedback} className="space-y-4">
                    <textarea 
                      className="w-full bg-black border border-white/10 rounded-2xl p-4 h-40 text-sm outline-none focus:border-red-600 transition-all font-sans"
                      placeholder="Describe your problem or gadget query (e.g., Error 153, Tech support needed...)"
                      value={feedbackMsg}
                      onChange={(e) => setFeedbackMsg(e.target.value)}
                    />
                    <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">Submit Query</button>
                 </form>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bar */}
      <footer className="xl:hidden h-14 bg-[#0f0f0f] border-t border-[#303030] flex items-center justify-around sticky bottom-0 z-[120] px-6">
         <button onClick={() => {setSelectedVideo(null); setCurrentView('home');}} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-white' : 'text-[#888]'}`}><Home size={22} /><span className="text-[10px] font-medium">Home</span></button>
         <button onClick={handleShareApp} className="flex flex-col items-center gap-1 text-[#888]"><Share2 size={22} /><span className="text-[10px] font-medium">Share</span></button>
         {isInstallable ? (
           <button onClick={handleInstallApp} className="flex flex-col items-center gap-1 text-red-600 animate-pulse"><Download size={22} /><span className="text-[10px] font-medium">Install</span></button>
         ) : (
           <button onClick={() => setCurrentView('shorts')} className={`flex flex-col items-center gap-1 ${currentView === 'shorts' ? 'text-white' : 'text-[#888]'}`}><Zap size={22} /><span className="text-[10px] font-medium">Shorts</span></button>
         )}
         <button onClick={() => setCurrentView('creator')} className={`flex flex-col items-center gap-1 ${currentView === 'creator' ? 'text-white' : 'text-[#888]'}`}><Layout size={22} /><span className="text-[10px] font-medium">Creator</span></button>
         <div 
           onClick={() => setCurrentView('settings')}
           className={`w-8 h-8 rounded-full bg-[#333] flex items-center justify-center font-bold text-[10px] border border-white/5 active:scale-90 transition-transform ${currentView === 'settings' ? 'text-red-500 border-red-600' : 'text-white'}`}
         >V</div>
      </footer>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-6 px-3 py-2 rounded-xl transition-all w-full text-left ${active ? 'bg-white/10 font-bold' : 'hover:bg-white/5 text-[#f1f1f1]'}`}>
      <div className={active ? 'text-red-600 scale-110' : ''}>{icon}</div>
      <span className="text-[14px] leading-none">{label}</span>
    </button>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (v: string) => void }) {
   return (
      <div className="flex flex-col gap-3">
         <h5 className="text-[10px] font-black uppercase tracking-widest text-[#555]">{label}</h5>
         <div className="flex flex-col gap-1">
            {options.map(opt => (
               <button 
                  key={opt}
                  onClick={() => onChange(opt)}
                  className={`text-left text-xs py-1 px-2 rounded-md transition-colors ${value === opt ? 'text-white font-bold bg-white/10' : 'text-yt-gray hover:text-white hover:bg-white/5'}`}
               >
                  {opt}
               </button>
            ))}
         </div>
      </div>
   );
}

function ShortsIcon({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
   return (
      <button onClick={onClick} className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
         <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-2xl">
            {icon}
         </div>
         <span className="text-[10px] font-bold drop-shadow-md">{label}</span>
      </button>
   );
}
