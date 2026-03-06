
import React, { useState, useMemo, useEffect } from 'react';
import { AppLanguage, UserProfile } from '../types';

interface EnhancedComment {
  id: string;
  author: string;
  text: string;
  avatar: string;
  likes: number;
  time: string;
  timestamp: number;
  isUser?: boolean;
  replies?: EnhancedComment[];
}

interface ConnectViewProps {
  lang: AppLanguage;
  userProfile?: UserProfile | null;
  onAiChatStart?: (prompt: string) => void;
}

const ConnectView: React.FC<ConnectViewProps> = ({ lang, userProfile, onAiChatStart }) => {
  const [activeTab, setActiveTab] = useState('Discovery');
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [activeSubPage, setActiveSubPage] = useState<'radar' | 'topics' | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'new'>('hot');
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);
  
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({});
  const [commentTrees, setCommentTrees] = useState<Record<string, EnhancedComment[]>>({});
  const [newCommentInput, setNewCommentInput] = useState('');
  
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [joinedActivities, setJoinedActivities] = useState<Set<string>>(new Set());
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null);
  const [applicationNote, setApplicationNote] = useState('');
  const [waved, setWaved] = useState<Set<string>>(new Set());

  // AI Hint state
  const [showAiHint, setShowAiHint] = useState(true);

  // Dismissal and Toast logic
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(new Set());
  const [confirmDismissId, setConfirmDismissId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Digest State
  const [showDigestModal, setShowDigestModal] = useState(false);
  const [isDigestLoading, setIsDigestLoading] = useState(false);

  // Dynamic Affinity Tracking for "Guess You Like" Logic
  const [affinityScores, setAffinityScores] = useState<Record<string, number>>({});

  const trackInteraction = (category: string, weight: number = 1) => {
    setAffinityScores(prev => ({
      ...prev,
      [category]: (prev[category] || 0) + weight
    }));
  };

  const dismissPost = (id: string) => {
    setHiddenPostIds(prev => new Set(prev).add(id));
    setToast("Got it! We'll show less of this.");
    setTimeout(() => setToast(null), 3000);
  };
  
  const avatars = {
    guide: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1AnjqkPoQm3pk-3kBpy77PCfjcc07Zlnpv4KgNiT4VZBC_YvZXFAgnfszjD5gYRcQ8AKG5tNiApQEfIJe4bjL5dP2uYBqK-NbYj07H-cC60gV85aAnOtQ6ebK6shs4tAtEPG0qJMPw-svNd8gylzgFUgBUtHPJsJsMN5oO8v8QoKdWgJwSj8_lK38sclH6lOz86DuHl2t9ANsHnIm_goxAjNsgLD3_WVL3aukvFRT2THSx2jSXX5UknXszs_L9D-0YQ0srpuDMiw",
    you: "https://lh3.googleusercontent.com/aida-public/AB6AXuBec6QstvBcsp7IjIxA8NzP9FM944pZm98ROmF9xVhBFJeXxdC7PytKRIkrDSJcp5bhNXANMjW00IDwhCklXY2jYsQRKTMozR4yXPpg3FrFFuCnHb1I2vid0RvmsqhNaNSRCQeA33VSqBrZhoO55FaSrWtZaX7nSpYEa56_lqXXqU_6ixx8kWM7RjAtfHf5EWMAku3G9h0IOjMhml-xOSAxcgEv1L0gNPLlvSxBSdVnBoHt6dbAqvHCcIk-S_M8qJ8ai53-fMrdwEQ",
  };

  const closeModal = () => {
    setSelectedDetail(null);
    setNewCommentInput('');
    setReplyTo(null);
    setActiveApplicationId(null);
    setApplicationNote('');
  };

  const addComment = (targetId: string) => {
    if (!newCommentInput.trim()) return;
    
    // Interaction Tracking: Commenting increases category affinity
    trackInteraction(selectedDetail?.category || selectedDetail?.tag || 'General', 2);

    const newComm: EnhancedComment = {
      id: Date.now().toString(),
      author: "You",
      text: newCommentInput,
      avatar: avatars.you,
      likes: 0,
      time: "Just now",
      timestamp: Date.now(),
      isUser: true,
      replies: []
    };

    setCommentTrees(prev => {
      const existing = [...(prev[targetId] || getInitialComments(targetId))];
      if (replyTo) {
        const addToReplies = (list: EnhancedComment[]): EnhancedComment[] => {
          return list.map(c => {
            if (c.id === replyTo.id) {
              return { ...c, replies: [...(c.replies || []), newComm] };
            }
            if (c.replies && c.replies.length > 0) {
              return { ...c, replies: addToReplies(c.replies) };
            }
            return c;
          });
        };
        return { ...prev, [targetId]: addToReplies(existing) };
      }
      return { ...prev, [targetId]: [newComm, ...existing] };
    });

    setNewCommentInput('');
    setReplyTo(null);
  };

  const handleLike = (topicId: string, commentId: string) => {
    // Interaction Tracking: Liking increases category affinity
    trackInteraction(selectedDetail?.category || selectedDetail?.tag || 'General', 1);

    setCommentTrees(prev => {
      const existing = [...(prev[topicId] || getInitialComments(topicId))];
      const fixedLikeRecursive = (list: EnhancedComment[]): EnhancedComment[] => {
        return list.map(c => {
          if (c.id === commentId) return { ...c, likes: c.likes + 1 };
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: fixedLikeRecursive(c.replies) };
          }
          return c;
        });
      };
      return { ...prev, [topicId]: fixedLikeRecursive(existing) };
    });
  };

  const handleVote = (pollId: string, optionIndex: number) => {
    // Interaction Tracking: Voting increases category affinity
    trackInteraction(selectedDetail?.category || selectedDetail?.tag || 'General', 1.5);

    setPollVotes(prev => {
      if (prev[pollId] === optionIndex) {
        const next = { ...prev };
        delete next[pollId];
        return next;
      }
      return { ...prev, [pollId]: optionIndex };
    });
  };

  const getInitialComments = (id: string): EnhancedComment[] => {
    const specialized: Record<string, EnhancedComment[]> = {
      'rel1': [
        { id: 'da1', author: "Guide", text: "🏮 Link's Tip: Be yourself! Shanghai's dating scene moves fast, but honesty goes a long way.", avatar: avatars.guide, likes: 12, time: "1h ago", timestamp: Date.now() - 3600000, replies: [] },
        { id: 'da2', author: "City_Lifer", text: "Totally agree on the red flags. If they only want to meet at 11 PM on Wulumuqi Rd, run! 😂", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lifer", likes: 25, time: "30m ago", timestamp: Date.now() - 1800000, replies: [] }
      ],
      'dance2': [
        { id: 'sc1', author: "SalsaFan", text: "I've tried the studio near Jing'an temple, the instructors are super patient!", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dance", likes: 18, time: "2h ago", timestamp: Date.now() - 7200000, replies: [] },
        { id: 'sc2', author: "Guide", text: "Pro tip: Beginner classes usually fill up fast on Tuesday nights. Book in advance! 💃", avatar: avatars.guide, likes: 9, time: "1h ago", timestamp: Date.now() - 3600000, replies: [] }
      ],
      'm3': [
        { id: 'vc1', author: "VinylAddict", text: "The collection of 90s Cantopop at Uptown Records is unmatched.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vinyl", likes: 42, time: "5h ago", timestamp: Date.now() - 18000000, replies: [] },
        { id: 'vc2', author: "Melody", text: "Do they have listening stations? I'd love to hear some city pop before buying.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Music", likes: 15, time: "2h ago", timestamp: Date.now() - 7200000, replies: [] }
      ],
      'cult1': [
        { id: 'tc1', author: "Guide", text: "Actually, some places in Xintiandi offer a hybrid experience! A mix of both worlds. 🍵🧁", avatar: avatars.guide, likes: 33, time: "3h ago", timestamp: Date.now() - 10800000, replies: [] },
        { id: 'tc2', author: "TeaLover", text: "Nothing beats a traditional Puerh in a rain-drenched courtyard though.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tea", likes: 27, time: "1h ago", timestamp: Date.now() - 3600000, replies: [] }
      ]
    };

    return specialized[id] || [
      { 
        id: '1', author: "Guide", text: "🏮 Modu Tip: Welcome to the discussion! Let's keep it friendly and helpful. ✨", 
        avatar: avatars.guide, likes: 24, time: "2h ago", timestamp: Date.now() - 7200000, 
        replies: [
          { id: '1-1', author: "City_Lifer", text: "So true! Sharing is caring in this city.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lifer", likes: 5, time: "1h ago", timestamp: Date.now() - 3600000 }
        ]
      },
    ];
  };

  const currentComments = useMemo(() => {
    if (!selectedDetail) return [];
    const id = selectedDetail.id || selectedDetail.title;
    const list = [...(commentTrees[id] || getInitialComments(id))];
    if (sortBy === 'hot') return list.sort((a, b) => b.likes - a.likes);
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [commentTrees, selectedDetail, sortBy]);

  // Social Radar Algorithm: Match strategy based on Shared Interest Tags
  const buddies = useMemo(() => {
    const rawBuddies = [
      { name: "Yuki", dist: "0.8km", flag: "🇯🇵", zone: "Jing'an", match: "98%", hobbyIcon: "local_cafe", tags: ["Latte Art", "Vintage", "Coffee"], avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki", bio: "I've been in SH for 2 years! Always looking for the next hidden cafe in Jing'an. Let's explore together?", languages: ["JP", "EN", "CN"] },
      { name: "Alex", dist: "1.2km", flag: "🇺🇸", zone: "Xuhui", match: "85%", hobbyIcon: "directions_bike", tags: ["Road Cycling", "Tech", "Gadgets"], avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", bio: "Tech lead by day, night rider by... night. Looking for a weekend Puxi-Pudong loop partner.", languages: ["EN", "CN"] },
      { name: "Chloe", dist: "1.5km", flag: "🇫🇷", zone: "Bund", match: "92%", hobbyIcon: "palette", tags: ["Exhibition", "Jazz", "Art"], avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe", bio: "Art enthusiast. Usually found at M50 or West Bund. Love red wine and smooth jazz.", languages: ["FR", "EN"] },
    ];

    if (!userProfile) return rawBuddies;

    return rawBuddies.map(buddy => {
      // Calculate shared tags count
      const shared = buddy.tags.filter(bt => 
        userProfile.interests.some(ui => bt.toLowerCase().includes(ui.toLowerCase()))
      ).length;
      
      // Matching Algorithm: 50% base + weight per shared tag
      let matchVal = 50 + (shared * 15);
      if (matchVal > 99) matchVal = 99;
      
      return { ...buddy, match: `${matchVal}%` };
    }).sort((a, b) => parseInt(b.match) - parseInt(a.match));
  }, [userProfile]);

  const topics = [
    { 
      id: 't1', 
      title: "Shanghai Social 'Hidden Rules'", 
      tag: "Culture", 
      participants: 1240, 
      desc: "Is it rude to split the bill in a local restaurant? Exploring 'Modu' social etiquette. Is it true people prefer coffee over cocktails for first meets?", 
      icon: "gavel",
      hotRank: "#1 Trending",
      perspectives: [
        { label: "Traditional", text: "Paying is a sign of respect and face." },
        { label: "Modern Gen-Z", text: "AA is standard for casual hangouts." }
      ]
    },
    { 
      id: 't2', 
      title: "Expat Help & Support", 
      tag: "Mutual Aid", 
      participants: 850, 
      desc: "Banking apps, health codes, or apartment hunting? Ask the veteran expats anything! We're here to help you settle in.", 
      icon: "handshake",
      hotRank: "Active Help",
      perspectives: [
        { label: "New Arrival", text: "How do I setup my first bank account?" },
        { label: "Veteran", text: "Check our wiki for the top 5 mini-programs." }
      ]
    },
  ];

  const interestData: Record<string, { community: any, posts: any[] }> = {
    'Discovery': {
      community: { id: 'c1', name: 'Shanghai Newbies', members: 4500, img: 'https://images.unsplash.com/photo-1493932484895-752d1471eab5?q=80&w=1000&auto=format&fit=crop', activities: ['Welcome Tea', 'App Guide Session', 'Bund Photo Walk'], desc: "The ultimate hub for everyone new to the magic of Shanghai. We share tips on settling in and making the most of your first year.", category: 'Discovery' },
      posts: [
        { id: 'd1', type: 'post', title: "Hidden Speakeasy in Jing'an", author: "Anna W.", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop", desc: "Found a library that turns into a bar at 8PM! 🤫 The entrance is behind the third bookshelf on the left.", category: 'Nightlife' },
        { id: 'd2', type: 'announcement', author: "Welink Admin", text: "New simplified visa renewal service starts Monday.", title: "Visa Policy Update", category: 'Discovery' }
      ]
    },
    'Art': {
      community: { id: 'c2', name: 'West Bund Sketchers', members: 890, img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop', activities: ['Plein Air Weekend', 'Oil Painting Workshop', 'Exhibition Tour'], desc: "We capture the spirit of Shanghai, one sketch at a time. All skill levels welcome!", category: 'Art' },
      posts: [
        { id: 'a1', type: 'post', title: "M50 New Exhibit: Future SH", author: "Chen L.", img: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop", desc: "The VR installation is mind-blowing! It shows Shanghai in 2124.", category: 'Art' },
        { id: 'a2', type: 'poll', tag: "Weekly Vote", title: "Best Art Museum for Date Night?", options: [{text: "TeamLab Borderless", votes: 45}, {text: "Power Station of Art", votes: 62}, {text: "Museum of Art Pudong", votes: 31}], desc: "Cast your vote for the best atmosphere!", category: 'Art' },
        { id: 'a3', type: 'post', title: "West Bund Museum Picnic", author: "ArtLover", img: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?q=80&w=1000&auto=format&fit=crop", desc: "The sunset by the museum is just magical. Perfect for sketching with a coffee.", category: 'Art' }
      ]
    },
    'Reading': {
      community: { id: 'c5', name: 'Shanghai Bookworms', members: 2100, img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000&auto=format&fit=crop', activities: ['Sunday Classics', 'Sci-Fi Night', 'Poetry Slam'], desc: "A cozy haven for literature lovers. From Lu Xun to contemporary global fiction.", category: 'Reading' },
      posts: [
        { 
          id: 'r1', 
          type: 'activity', 
          title: "Monthly Book Club: 'Shanghai Girls'", 
          author: "Librarian Li", 
          img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000&auto=format&fit=crop", 
          desc: "Join us for a deep dive into Lisa See's masterpiece at Garden Books. A story of two sisters and their journey from Shanghai to Los Angeles.",
          registration: "Free. Limited to 20 seats. Scan QR code at the venue.",
          date: "Next Saturday, 2:00 PM",
          location: "Garden Books, Changle Rd",
          category: 'Reading'
        },
        { id: 'r2', type: 'post', title: "Favorite Quiet Reading Spot", author: "BookNook", img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000&auto=format&fit=crop", desc: "Checking out the new library in Xuhui. It's so quiet and peaceful with huge windows.", category: 'Reading' }
      ]
    },
    'Music': {
      community: { id: 'c6', name: 'Vinyl & Jazz SH', members: 1500, img: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?q=80&w=1000&auto=format&fit=crop', activities: ['Live House Crawl', 'Vinyl Swap', 'Jazz Improvisation'], desc: "Connecting the beats of the city. From underground techno to classic blue note jazz.", category: 'Music' },
      posts: [
        { 
          id: 'm1', 
          type: 'activity', 
          title: "West Bund Music Festival", 
          author: "Vibe Master", 
          img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop", 
          desc: "A weekend of electronic and indie music by the river. 3 stages, 40 artists.",
          registration: "Tickets available on Damai. 20% discount for members.",
          date: "Oct 15-16, All Day",
          location: "West Bund Camp, Longteng Ave",
          category: 'Music'
        },
        { id: 'm2', type: 'poll', tag: "Beat Check", title: "Best Venue for Underground Techno?", options: [{text: "Heim", votes: 56}, {text: "Potent", votes: 42}, {text: "Elevator", votes: 89}], desc: "Cast your vote for the best sound system in town!", category: 'Music' },
        { id: 'm3', type: 'post', title: "Vinyl Shop Discoveries", author: "SpinIt", img: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=1000&auto=format&fit=crop", desc: "Found some rare 90s C-Pop vinyls at a small shop in Puxi today! The warm analog sound is unbeatable.", category: 'Music' }
      ]
    },
    'Culture': {
      community: { id: 'c7', name: 'East-West Exchange', members: 1100, img: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1000&auto=format&fit=crop', activities: ['Culture Workshop', 'Language Exchange', 'Tea Ceremony'], desc: "Where Orient meets Occident. Exploring the hybrid soul of modern Shanghai through shared stories and cross-cultural dialogue.", category: 'Culture' },
      posts: [
        { id: 'cult1', type: 'post', title: "Traditional Tea vs Afternoon Tea", author: "Tea Master", img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000&auto=format&fit=crop", desc: "In Shanghai, you can have a Kung Fu tea ceremony in the morning and English high tea by 3 PM. Which is your vibe? We explore the social nuances and etiquette of both.", category: 'Culture' },
        { id: 'cult2', type: 'poll', tag: "Weekly Vote", title: "Best Lane House Walk?", options: [{text: "Julu Road", votes: 88}, {text: "Wukang Road", votes: 156}, {text: "Yuyuan Road", votes: 112}], desc: "Which street captures the 'Old SH' charm best?", category: 'Culture' }
      ]
    },
    'Dance': {
      community: { id: 'c8', name: 'SH Swing & Salsa', members: 950, img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop', activities: ['Social Night', 'Beginner Bootcamp', 'Riverside Salsa'], desc: "Dancing through the streets of the city. Join the rhythm and find your partner on the floor.", category: 'Dance' },
      posts: [
        { id: 'dance2', type: 'post', title: "Best Salsa Studios in Jing'an", author: "Lina", img: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1000&auto=format&fit=crop", desc: "Top 3 places to learn if you're a complete beginner. Small classes and great instructors! I've personally tried these and the vibe is amazing.", category: 'Dance' }
      ]
    },
    'Relationships': {
      community: { id: 'c9', name: 'Love in the Modu', members: 3200, img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&auto=format&fit=crop', activities: ['Single Mixer', 'Couple Cooking Class', 'Friendship Picnic'], desc: "Finding connection in a fast-paced metropolis. From dating to deep friendships, we navigate the heart of Shanghai together.", category: 'Relationships' },
      posts: [
        { id: 'rel1', type: 'post', title: "Dating App Dos and Don'ts", author: "Coach Sam", img: "https://images.unsplash.com/photo-1516131206008-dd041a9764fd?q=80&w=1000&auto=format&fit=crop", desc: "A guide for expats navigating the local dating scene. Profile tips, red flags to watch for, and the best places for a first meeting in Puxi.", category: 'Relationships' }
      ]
    },
    'Sports': {
      community: { id: 'c3', name: 'Puxi Night Cyclists', members: 1200, img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000&auto=format&fit=crop', activities: ['Puxi Night Ride', 'Suzhou Day Trip'], desc: "Fast wheels, night lights, and the best cycling community in Puxi.", category: 'Sports' },
      posts: [
        { id: 's1', type: 'poll', tag: "Weekly Vote", title: "Next Community Run Route?", options: [{text: "Suzhou Creek", votes: 42}, {text: "Fuxing Park", votes: 28}], desc: "Help us decide the next scenic route for our morning jog!", category: 'Sports' },
        { id: 's2', type: 'post', title: "Morning Puxi Cycling", author: "PedalPro", img: "https://images.unsplash.com/photo-1474139224675-8442316a7d85?q=80&w=1000&auto=format&fit=crop", desc: "Fresh air and quiet streets. Best way to start the day in Shanghai before the traffic hits.", category: 'Sports' }
      ]
    },
    'Food': {
      community: { id: 'c4', name: 'Coffee Snobs SH', members: 3200, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop', activities: ['Cupping Class', 'Roastery Tour'], desc: "Because life is too short for bad coffee. Join our curated tours and find your new favorite brew.", category: 'Food' },
      posts: [
        { id: 'f1', type: 'poll', tag: "Taste Test", title: "Best Xiao Long Bao?", options: [{text: "Din Tai Fung", votes: 85}, {text: "Lin Long Fang", votes: 120}], desc: "The ultimate showdown of juicy soup dumplings!", category: 'Food' },
        { id: 'f2', type: 'post', title: "New Hidden Cafe in Jing'an", author: "CaffeineQueen", img: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=1000&auto=format&fit=crop", desc: "The entrance is so hidden, but the beans are worth the search. Look for the yellow door near West Nanjing Rd.", category: 'Food' }
      ]
    }
  };

  // Logic: "Guess You Like" Strategy for content re-ranking
  const processedPosts = useMemo(() => {
    const data = interestData[activeTab] || interestData['Discovery'];
    if (!userProfile) return data.posts;

    return [...data.posts].sort((a, b) => {
      // 1. Initial Weight from Profile Interests
      const categoryA = (a.category || a.tag || '').toLowerCase();
      const categoryB = (b.category || b.tag || '').toLowerCase();
      
      const interestA = userProfile.interests.some(ui => categoryA.includes(ui.toLowerCase()));
      const interestB = userProfile.interests.some(ui => categoryB.includes(ui.toLowerCase()));
      
      let scoreA = interestA ? 20 : 0;
      let scoreB = interestB ? 20 : 0;
      
      // 2. Dynamic Weight from Interaction History (Affinity Scores)
      scoreA += (affinityScores[a.category || a.tag || 'General'] || 0);
      scoreB += (affinityScores[b.category || b.tag || 'General'] || 0);
      
      return scoreB - scoreA;
    });
  }, [activeTab, userProfile, affinityScores, hiddenPostIds]);

  // Initial tab landing based on interests
  useEffect(() => {
    if (userProfile && userProfile.interests.length > 0 && activeTab === 'Discovery') {
       const interestToTab: Record<string, string> = {
         'art': 'Art', 'museum': 'Art',
         'reading': 'Reading', 'history': 'Reading',
         'music': 'Music', 'jazz': 'Music', 'livemusic': 'Music',
         'food': 'Food', 'coffee': 'Food', 'brunch': 'Food', 'wine': 'Food',
         'fitness': 'Sports', 'cycling': 'Sports', 'hiking': 'Sports', 'skating': 'Sports',
         'nightlife': 'Dance', 'dance': 'Dance',
         'travel': 'Discovery'
       };
       
       for (const interest of userProfile.interests) {
         if (interestToTab[interest]) {
           setActiveTab(interestToTab[interest]);
           break;
         }
       }
    }
  }, [userProfile]);

  const currentTabContent = useMemo(() => {
    return interestData[activeTab] || interestData['Discovery'];
  }, [activeTab]);

  const labels: Record<string, any> = {
    EN: { 
      radar: "Social Radar", 
      topics: "Trending Topics", 
      superHub: "Super Hub", 
      forum: "Forum Discussion", 
      registration: "How to Join", 
      date: "When", 
      location: "Where", 
      apply: "Apply to Join", 
      applied: "Applied", 
      subNote: "Application Note (Optional)", 
      seeMore: "See All", 
      hot: "Hot", 
      new: "New", 
      wave: "Say Hi", 
      requestSent: "You are now friends",
      chatNow: "Chat Now",
      dismissTitle: "Reduce Recommendations?",
      dismissDesc: "Do you want to see fewer activities like this?",
      confirm: "Confirm",
      cancel: "Cancel",
      enterHubChat: "Join Hub Group Chat",
      alreadyInHub: "Already in Hub",
      applyToHub: "Apply to Hub"
    },
    CN: { 
      radar: "社交雷达", 
      topics: "热门动态", 
      superHub: "超级社区", 
      forum: "讨论广场", 
      registration: "报名方式", 
      date: "活动时间", 
      location: "活动地点", 
      apply: "申请报名", 
      applied: "已报名", 
      subNote: "申请说明 (可选)", 
      seeMore: "查看更多", 
      hot: "最热", 
      new: "最新", 
      wave: "打个招呼", 
      requestSent: "你们已成为好友",
      chatNow: "立刻聊天",
      dismissTitle: "减少此类推荐？",
      dismissDesc: "是否减少此类活动推送？",
      confirm: "确认",
      cancel: "取消",
      enterHubChat: "加入社团群聊",
      alreadyInHub: "已加入社团",
      applyToHub: "申请加入社团"
    }
  };
  const curL = labels[lang] || labels['EN'];

  const renderPostItem = (item: any) => {
    if (hiddenPostIds.has(item.id)) return null;

    if (item.type === 'poll') {
      return <PollCard key={item.id} {...item} onVote={(id, idx) => handleVote(id, idx)} votedIndex={pollVotes[item.id] ?? null} onClick={() => setSelectedDetail({...item, type: 'poll-detail'})} />;
    }
    if (item.type === 'activity') {
      return <SocialCard key={item.id} id={item.id} {...item} onDismiss={(id) => setConfirmDismissId(id)} onClick={() => setSelectedDetail({...item, type: 'activity-detail'})} isActivity />;
    }
    if (item.type === 'announcement') {
      return <UpdateCard key={item.id} {...item} onClick={() => setSelectedDetail({...item, type: 'announcement'})} />;
    }
    return <SocialCard key={item.id} id={item.id} {...item} onClick={() => setSelectedDetail({...item, type: 'post'})} />;
  };

  const handleBuddyMessage = () => {
    if (!newCommentInput.trim()) return;
    setWaved(prev => new Set(prev).add(selectedDetail.name));
    setNewCommentInput('');
  };

  const aiMessagePrompt = userProfile 
    ? (lang === 'CN' 
        ? `我想参加本周六在徐汇滨江关于 ${userProfile.interests[0] || '城市探索'} 的热门活动。`
        : `I want to join the hot event this Sat at West Bund regarding ${userProfile.interests[0] || 'City Discovery'}.`)
    : "Tell me more about upcoming weekend events.";

  const handleViewDigest = () => {
    setIsDigestLoading(true);
    setTimeout(() => {
      setIsDigestLoading(false);
      setShowDigestModal(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar relative overflow-hidden pb-32">
      <div className="absolute top-0 right-0 size-80 bg-primary/10 blur-[120px] animate-blob pointer-events-none"></div>

      {/* Dismiss Confirmation Dialog */}
      {confirmDismissId && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setConfirmDismissId(null)}>
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl max-w-xs w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-xl font-black text-slate-900 dark:text-white italic mb-4">{curL.dismissTitle}</h4>
            <p className="text-sm font-bold text-slate-500 mb-8">{curL.dismissDesc}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDismissId(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-500 font-black rounded-2xl active:scale-95 transition-all"
              >
                {curL.cancel}
              </button>
              <button 
                onClick={() => {
                  if (confirmDismissId) dismissPost(confirmDismissId);
                  setConfirmDismissId(null);
                }}
                className="flex-1 py-3 bg-primary text-[#0d1b14] font-black rounded-2xl active:scale-95 shadow-lg shadow-primary/20 transition-all"
              >
                {curL.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-[#0d1b14] dark:bg-zinc-800 text-white rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 text-xs font-bold whitespace-nowrap border border-white/10">
          {toast}
        </div>
      )}

      {/* Main Header */}
      <div className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 py-5 border-b border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="size-11 rounded-2xl bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-[#0d1b14]"><span className="material-symbols-outlined font-black">hub</span></div>
             <h2 className="text-[#0d1b14] dark:text-white text-2xl font-black italic tracking-tighter">Connect!</h2>
          </div>
          <div className="flex gap-2">
            <button className="size-10 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors">
                <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <button className="size-10 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-slate-500 relative">
               <span className="material-symbols-outlined text-[20px]">notifications</span>
               <span className="absolute top-2 right-2 size-2 bg-primary rounded-full animate-ping"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <section className="px-6 pt-8 animate-slide-up stagger-1">
          <div className="flex justify-between items-center mb-6 px-1">
             <h3 className="text-[#0d1b14] dark:text-white text-xl font-black tracking-tighter italic leading-none">{curL.radar}</h3>
             <button onClick={() => setActiveSubPage('radar')} className="text-[10px] text-primary font-black uppercase tracking-[0.2em] hover:opacity-70 transition-all flex items-center gap-1.5">
               {curL.seeMore}
               <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
             </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-6 px-6">
            {buddies.map((buddy, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center gap-3 min-w-[150px] bg-white dark:bg-zinc-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:border-primary/40 transition-all cursor-pointer group relative active:scale-95"
                onClick={() => setSelectedDetail({ type: 'buddy', ...buddy, title: buddy.name })}
              >
                <div className="absolute top-4 left-4 text-xs grayscale group-hover:grayscale-0 transition-all">{buddy.flag}</div>
                <div className="size-20 rounded-full overflow-hidden border-[3px] border-slate-50 dark:border-zinc-800 group-hover:border-primary transition-all p-1">
                   <img src={buddy.avatar} className="size-full rounded-full" alt={buddy.name} />
                </div>
                <div className="text-center">
                   <p className="text-sm font-black dark:text-white flex items-center justify-center gap-1">{buddy.name} <span className="material-symbols-outlined text-[14px] text-primary">verified</span></p>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 mb-2">{buddy.dist} · {buddy.zone}</p>
                   <div className="flex flex-wrap justify-center gap-1">
                      {buddy.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 dark:bg-primary/5 text-primary text-[8px] font-black rounded-full border border-primary/20 uppercase tracking-tight">
                          {tag}
                        </span>
                      ))}
                   </div>
                </div>
                <div className="absolute bottom-[-10px] bg-primary text-[#0d1b14] text-[9px] font-black px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  {buddy.match} Match
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 pt-10 animate-slide-up stagger-2">
          <div className="flex justify-between items-center mb-6 px-1">
             <h3 className="text-[#0d1b14] dark:text-white text-xl font-black tracking-tighter italic leading-none">{curL.topics}</h3>
             <button onClick={() => setActiveSubPage('topics')} className="text-[10px] text-primary font-black uppercase tracking-[0.2em] hover:opacity-70 transition-all flex items-center gap-1.5">
               {curL.seeMore}
               <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
             </button>
          </div>
          <div className="flex flex-col gap-4">
            {topics.map(topic => (
              <div key={topic.id} className="flex items-center gap-5 p-5 glass dark:bg-zinc-900 rounded-[2.5rem] border border-white/60 dark:border-white/5 shadow-xl hover:border-primary/40 transition-all cursor-pointer group" onClick={() => setSelectedDetail({ ...topic, type: 'topic' })}>
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform"><span className="material-symbols-outlined text-primary text-2xl">{topic.icon}</span></div>
                <div className="flex-1 overflow-hidden">
                    <h4 className="font-black dark:text-white text-base truncate tracking-tight">{topic.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{topic.tag} · {topic.participants} debating</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 px-6 pb-20">
          <div className="flex gap-3 mb-10 overflow-x-auto no-scrollbar py-2">
            {['Discovery', 'Art', 'Reading', 'Music', 'Culture', 'Dance', 'Relationships', 'Sports', 'Food'].map(cat => (
              <SelectionChip key={cat} active={activeTab === cat} icon={
                cat === 'Discovery' ? 'explore' : cat === 'Art' ? 'palette' : cat === 'Reading' ? 'book' : cat === 'Music' ? 'music_note' : cat === 'Culture' ? 'language' : cat === 'Dance' ? 'nightlife' : cat === 'Relationships' ? 'favorite' : cat === 'Sports' ? 'fitness_center' : 'restaurant'
              } label={cat} onClick={() => setActiveTab(cat)} />
            ))}
          </div>
          <div className="space-y-12 animate-slide-up">
             <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                   <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{curL.superHub}</h4>
                   <button 
                     onClick={handleViewDigest}
                     className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95 transition-all group"
                   >
                     <span className="material-symbols-outlined text-[14px] text-white animate-pulse">auto_awesome</span>
                     <span className="text-[9px] font-black text-white uppercase tracking-wider">
                       {lang === 'CN' ? '查看简报' : 'View Digest'}
                     </span>
                   </button>
                </div>

                {/* AI Helper Message - Link Insight */}
                {showAiHint && userProfile && (
                  <div 
                    onClick={() => onAiChatStart?.(aiMessagePrompt)}
                    className="bg-primary/10 dark:bg-primary/5 border border-primary/20 rounded-[2.5rem] p-6 flex items-start gap-5 animate-slide-up relative overflow-hidden group shadow-lg shadow-primary/5 transition-all hover:border-primary/40 cursor-pointer active:scale-[0.98]"
                  >
                      <div className="absolute top-[-20%] right-[-10%] size-24 bg-primary/10 blur-[40px] pointer-events-none group-hover:bg-primary/20 transition-all"></div>
                      <div className="size-16 rounded-[1.8rem] overflow-hidden shrink-0 border-2 border-white dark:border-zinc-800 shadow-2xl relative">
                          <img src={avatars.guide} className="size-full object-cover scale-110" />
                          <div className="absolute top-0 right-0 p-1">
                              <div className="size-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                          </div>
                      </div>
                      <div className="flex-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] animate-sparkle">auto_awesome</span>
                              Link Insight
                          </p>
                          <p className="text-[15px] font-bold leading-relaxed text-slate-800 dark:text-slate-200">
                              {lang === 'CN' 
                                ? `Hi! 检测到你喜欢 ${userProfile.interests[0] || '骑行'}，本周六在徐汇滨江有热门活动，要参加吗？✨`
                                : `Hi! Detected you're into ${userProfile.interests[0] || 'Cycling'}. There's a hot event this Sat at West Bund. Join us? 🏮`
                              }
                          </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowAiHint(false); }} 
                        className="size-10 rounded-2xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md text-slate-400 flex items-center justify-center shadow-sm hover:bg-white dark:hover:bg-zinc-700 transition-all"
                      >
                          <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                  </div>
                )}

                <div className="relative group cursor-pointer overflow-hidden rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5" onClick={() => setSelectedDetail({ ...currentTabContent.community, type: 'community' })}>
                   <div className="h-64 w-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url("${currentTabContent.community.img}")` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                   </div>
                   <div className="absolute bottom-8 left-8 right-8">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="material-symbols-outlined text-primary text-sm animate-pulse">groups</span>
                         <p className="text-white text-[11px] font-black uppercase tracking-[0.4em]">{currentTabContent.community.members} Members Online</p>
                      </div>
                      <h4 className="text-white text-3xl font-black italic tracking-tighter leading-none">{currentTabContent.community.name}</h4>
                      <p className="text-[9px] text-primary/80 font-black uppercase tracking-widest mt-1 italic animate-pulse">Suggested for you based on interests ✨</p>
                   </div>
                </div>
             </div>
             <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                   <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Active Pulse</h4>
                </div>
                <div className="grid grid-cols-2 gap-5 items-start">
                  <div className="flex flex-col gap-5">{processedPosts.filter((_, i) => i % 2 === 0).map(item => renderPostItem(item))}</div>
                  <div className="flex flex-col gap-5">{processedPosts.filter((_, i) => i % 2 !== 0).map(item => renderPostItem(item))}</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-all duration-300" onClick={closeModal}>
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={closeModal} className="absolute top-6 right-6 size-10 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-xl text-slate-800 dark:text-white flex items-center justify-center shadow-sm border border-white/20 z-50 hover:bg-black/20 transition-all">
              <span className="material-symbols-outlined text-xl font-black">close</span>
            </button>

            <div className="relative shrink-0">
              {selectedDetail.img ? (
                <div className="h-64 w-full bg-cover bg-center" style={{ backgroundImage: `url("${selectedDetail.img}")` }}>
                   <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-transparent"></div>
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary/40 animate-pulse">image</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-10 pt-4">
              <div className="flex items-center gap-3 mb-6">
                 <div className="px-3 py-1 border border-slate-200 dark:border-white/10 rounded-xl inline-block bg-white dark:bg-zinc-900 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {selectedDetail.type === 'community' ? 'Hub' : 
                        selectedDetail.type === 'buddy' ? 'Profile' : 
                        selectedDetail.type === 'activity-detail' ? 'Activity' : 'Topic'}
                    </span>
                 </div>
                 {selectedDetail.flag && <span className="text-xl">{selectedDetail.flag}</span>}
              </div>
              
              {selectedDetail.type === 'buddy' ? (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex flex-col gap-1 mb-4">
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{selectedDetail.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedDetail.dist} · {selectedDetail.zone}</p>
                  </div>
                  
                  <div className="relative group overflow-hidden rounded-[2.5rem] aspect-square border-4 border-slate-50 dark:border-zinc-800 shadow-xl bg-slate-100">
                     <img src={selectedDetail.avatar} className="size-full object-cover" alt={selectedDetail.name} />
                  </div>

                  <div className="p-6 bg-primary/10 rounded-[2.5rem] border border-primary/20 shadow-inner">
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 italic leading-relaxed">"{selectedDetail.bio}"</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.tags?.map((t: string, i: number) => (
                      <span key={i} className={`px-4 py-2 bg-white dark:bg-zinc-800 border rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${userProfile?.interests.some(ui => t.toLowerCase().includes(ui.toLowerCase())) ? 'border-primary text-primary' : 'border-slate-100 dark:border-white/5'}`}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter mb-6 italic">{selectedDetail.title || selectedDetail.name}</h3>
                  
                  {selectedDetail.type === 'community' && (
                    <div className="space-y-6 mb-10 animate-slide-up">
                      <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-white/5">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">"{selectedDetail.desc}"</p>
                      </div>
                      <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Members</span>
                            <span className="text-xl font-black dark:text-white">{selectedDetail.members}</span>
                          </div>
                          <div className="h-10 w-px bg-slate-100 dark:bg-white/5"></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Type</span>
                            <span className="text-xl font-black dark:text-white">Active Hub</span>
                          </div>
                      </div>
                    </div>
                  )}

                  {selectedDetail.type === 'activity-detail' && (
                    <div className="space-y-6 mb-10 animate-slide-up">
                      <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-[2rem] border-l-4 border-primary">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">"{selectedDetail.desc}"</p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <InfoRow icon="calendar_month" label={curL.date} value={selectedDetail.date} />
                        <InfoRow icon="location_on" label={curL.location} value={selectedDetail.location} />
                        <InfoRow icon="how_to_reg" label={curL.registration} value={selectedDetail.registration} />
                      </div>
                    </div>
                  )}

                  {selectedDetail.type === 'poll-detail' && (
                    <div className="space-y-6 mb-10 animate-slide-up">
                      <div className="p-6 bg-primary/5 rounded-[2rem] border-l-4 border-primary/20 mb-6">
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">"{selectedDetail.desc}"</p>
                      </div>
                      <div className="space-y-3">
                          {selectedDetail.options?.map((opt: any, idx: number) => {
                            const votedIndex = pollVotes[selectedDetail.id] ?? null;
                            const voted = votedIndex !== null;
                            const isSelected = votedIndex === idx;
                            const totalVotes = selectedDetail.options.reduce((acc: number, curr: any) => acc + curr.votes, 0) + (voted ? 1 : 0);
                            const percentage = Math.round(((opt.votes + (isSelected ? 1 : 0)) / totalVotes) * 100);
                            
                            return (
                              <div 
                                key={idx} 
                                onClick={() => handleVote(selectedDetail.id, idx)}
                                className={`relative h-14 rounded-2xl border flex items-center px-6 overflow-hidden transition-all cursor-pointer hover:border-primary/20 ${isSelected ? 'border-primary shadow-sm bg-primary/5' : 'border-slate-100 dark:border-white/5'}`}
                              >
                                {voted && <div className="absolute left-0 top-0 h-full bg-primary opacity-15 transition-all duration-700" style={{ width: `${percentage}%` }}></div>}
                                <div className="flex-1 flex justify-between items-center relative z-10">
                                  <span className="text-sm font-black truncate pr-4">{opt.text}</span>
                                  {voted && <span className="text-[10px] font-black text-primary">{percentage}%</span>}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {(selectedDetail.type === 'topic' || selectedDetail.type === 'post') && (
                    <div className="space-y-6 mb-10 animate-slide-up">
                      <div className="p-8 bg-[#f0f9f4] dark:bg-green-900/10 rounded-[2rem] border-l-4 border-[#22c55e] shadow-sm">
                        <p className="text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          "{selectedDetail.desc}"
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedDetail.type !== 'buddy' && (
                <div className="border-t-2 border-slate-50 dark:border-white/5 mt-10 pt-10">
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter flex items-center gap-3">
                        {curL.forum}
                        <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full not-italic font-black border border-primary/20">{currentComments.length}</span>
                     </h4>
                     <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
                        <button onClick={() => setSortBy('hot')} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${sortBy === 'hot' ? 'bg-primary text-[#0d1b14] shadow-sm' : 'text-slate-400'}`}>{curL.hot}</button>
                        <button onClick={() => setSortBy('new')} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${sortBy === 'new' ? 'bg-primary text-[#0d1b14] shadow-sm' : 'text-slate-400'}`}>{curL.new}</button>
                     </div>
                  </div>
                  
                  <div className="space-y-8 pb-4">
                    {currentComments.map((c) => (
                      <CommentItem key={c.id} comment={c} onLike={() => handleLike(selectedDetail.id || selectedDetail.title, c.id)} onReply={() => setReplyTo({ id: c.id, name: c.author })} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Area */}
            <div className="p-10 border-t-2 border-slate-50 dark:border-white/5 bg-white dark:bg-zinc-950 shrink-0">
               {selectedDetail.type === 'community' ? (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => joinedGroups.has(selectedDetail.id) ? null : setJoinedGroups(new Set([...joinedGroups, selectedDetail.id]))} 
                      className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 ${joinedGroups.has(selectedDetail.id) ? 'bg-zinc-800 text-slate-400' : 'bg-primary text-[#0d1b14] shadow-primary/30'}`}
                    >
                      <span className="material-symbols-outlined">{joinedGroups.has(selectedDetail.id) ? 'check_circle' : 'add_circle'}</span>
                      {joinedGroups.has(selectedDetail.id) ? curL.alreadyInHub : curL.applyToHub}
                    </button>
                    {joinedGroups.has(selectedDetail.id) && (
                      <button 
                        onClick={() => onAiChatStart?.(`JOIN_GROUP:${selectedDetail.name}`)}
                        className="w-full py-5 rounded-[2rem] bg-[#0d1b14] dark:bg-zinc-700 text-primary font-black text-lg shadow-xl shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-4 border border-primary/20 animate-in slide-in-from-bottom-2"
                      >
                        <span className="material-symbols-outlined">forum</span>
                        {curL.enterHubChat}
                      </button>
                    )}
                  </div>
               ) : selectedDetail.type === 'activity-detail' ? (
                 <div className="space-y-4">
                   {!joinedActivities.has(selectedDetail.id) && activeApplicationId !== selectedDetail.id && (
                     <button onClick={() => setActiveApplicationId(selectedDetail.id)} className="w-full py-5 rounded-[2rem] bg-primary text-[#0d1b14] font-black text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all">{curL.apply}</button>
                   )}
                   {activeApplicationId === selectedDetail.id && (
                     <div className="space-y-4 animate-in fade-in zoom-in-95">
                        <textarea value={applicationNote} onChange={(e) => setApplicationNote(e.target.value)} placeholder={curL.subNote} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-sm font-bold min-h-[80px]" />
                        <button onClick={() => { setJoinedActivities(new Set([...joinedActivities, selectedDetail.id])); setActiveApplicationId(null); }} className="w-full py-4 rounded-2xl bg-primary text-[#0d1b14] font-black shadow-lg">Submit Application</button>
                     </div>
                   )}
                   {joinedActivities.has(selectedDetail.id) && (
                     <div className="w-full py-5 rounded-[2rem] bg-zinc-800 text-slate-400 font-black text-center flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span> {curL.applied}
                     </div>
                   )}
                 </div>
               ) : selectedDetail.type === 'buddy' ? (
                 waved.has(selectedDetail.name) ? (
                   <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in-95 gap-4 w-full">
                     <div className="flex items-center gap-3 text-primary">
                       <span className="material-symbols-outlined font-black">check_circle</span>
                       <p className="text-sm font-black uppercase tracking-widest">{curL.requestSent}</p>
                     </div>
                     <button 
                       onClick={() => onAiChatStart?.(`SOCIAL_CHAT:${JSON.stringify(selectedDetail)}`)}
                       className="w-full py-4 rounded-2xl bg-[#0d1b14] dark:bg-zinc-800 text-primary font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border border-primary/20"
                     >
                       <span className="material-symbols-outlined">forum</span>
                       {curL.chatNow}
                     </button>
                   </div>
                 ) : (
                   <div className="flex gap-4 animate-slide-up">
                     <input 
                       value={newCommentInput} 
                       onChange={(e) => setNewCommentInput(e.target.value)} 
                       placeholder={`Say hi to ${selectedDetail.name}...`} 
                       className="flex-1 bg-slate-100 dark:bg-zinc-900 border-none rounded-[1.5rem] px-6 py-4 text-base font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/20" 
                     />
                     <button 
                       onClick={handleBuddyMessage}
                       className="size-16 rounded-[1.5rem] bg-primary text-[#0d1b14] flex items-center justify-center shadow-xl active:scale-90 transition-all shrink-0"
                     >
                       <span className="material-symbols-outlined font-black text-2xl">send</span>
                     </button>
                   </div>
                 )
               ) : (
                 <div className="flex flex-col gap-3">
                   {replyTo && (
                     <div className="flex items-center justify-between px-4 py-2 bg-primary/10 rounded-xl text-[10px] font-black text-primary">
                        <span>Replying to {replyTo.name}</span>
                        <button onClick={() => setReplyTo(null)} className="material-symbols-outlined text-sm">close</button>
                     </div>
                   )}
                   <div className="flex gap-4">
                     <input value={newCommentInput} onChange={(e) => setNewCommentInput(e.target.value)} placeholder="Share your voice..." className="flex-1 bg-slate-100 dark:bg-zinc-900 border-none rounded-[1.5rem] px-6 py-4 text-base font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/20" />
                     <button onClick={() => addComment(selectedDetail.id || selectedDetail.title)} className="size-16 rounded-[1.5rem] bg-primary text-[#0d1b14] flex items-center justify-center shadow-xl active:scale-90 transition-all shrink-0"><span className="material-symbols-outlined font-black text-2xl">send</span></button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGES (Radar & Topics) */}
      {activeSubPage === 'radar' && (
        <div className="fixed inset-0 z-[100] bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-500 flex flex-col">
           <header className="p-6 pt-10 border-b dark:border-white/5 flex items-center gap-5">
              <button onClick={() => setActiveSubPage(null)} className="size-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition-all"><span className="material-symbols-outlined">arrow_back</span></button>
              <div>
                <h3 className="text-2xl font-black dark:text-white tracking-tighter italic leading-none">{curL.radar}</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Live in Shanghai</p>
              </div>
           </header>
           <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-24">
              <div className="grid grid-cols-2 gap-4">
                {buddies.map((buddy, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm text-center relative group active:scale-95 transition-all" onClick={() => setSelectedDetail({ type: 'buddy', ...buddy, title: buddy.name })}>
                    <div className="size-20 rounded-full mx-auto overflow-hidden border-[3px] border-slate-50 dark:border-zinc-800 p-1 mb-4"><img src={buddy.avatar} className="size-full rounded-full" /></div>
                    <p className="text-sm font-black dark:text-white mb-1">{buddy.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{buddy.dist} · {buddy.zone}</p>
                    <div className="mt-4 px-3 py-1 bg-primary/10 rounded-full border border-primary/20"><span className="text-[10px] font-black text-primary">{buddy.match} Match</span></div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {activeSubPage === 'topics' && (
        <div className="fixed inset-0 z-[100] bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-500 flex flex-col">
           <header className="p-6 pt-10 border-b dark:border-white/5 flex items-center gap-5">
              <button onClick={() => setActiveSubPage(null)} className="size-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition-all"><span className="material-symbols-outlined">arrow_back</span></button>
              <div>
                <h3 className="text-2xl font-black dark:text-white tracking-tighter italic leading-none">{curL.topics}</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Current Modu Debates</p>
              </div>
           </header>
           <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-24">
              {topics.map(topic => (
                <div key={topic.id} className="p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm relative group cursor-pointer" onClick={() => setSelectedDetail({ ...topic, type: 'topic' })}>
                  <div className="flex items-center gap-4 mb-5">
                     <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">{topic.icon}</span></div>
                     <div><h4 className="font-black dark:text-white text-xl tracking-tight">{topic.title}</h4><p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{topic.tag}</p></div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-6 line-clamp-2 leading-relaxed italic">"{topic.desc}"</p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm text-gray-400">groups</span>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{topic.participants} Active Debaters</p>
                    </div>
                    <div className="px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full text-[10px] font-black uppercase text-gray-500 tracking-widest">{topic.hotRank}</div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Digest Loading Overlay */}
      {isDigestLoading && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative size-24 mb-8">
             <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <span className="material-symbols-outlined text-3xl text-primary animate-pulse">auto_awesome</span>
             </div>
          </div>
          <p className="text-white font-black text-lg tracking-tight animate-pulse">
            {lang === 'CN' ? 'Link 正在阅读 1,284 条消息...' : 'Link is reading 1,284 messages...'}
          </p>
        </div>
      )}

      {/* Digest Modal */}
      {showDigestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowDigestModal(false)}>
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/10" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                   <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Weekly Digest</span>
                   </div>
                   <button onClick={() => setShowDigestModal(false)} className="size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all text-white">
                     <span className="material-symbols-outlined text-sm font-black">close</span>
                   </button>
                 </div>
                 <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-2">
                   {lang === 'CN' ? '社区本周简报' : 'Community Weekly Digest'}
                 </h3>
                 <p className="text-white/80 text-xs font-bold">
                   {lang === 'CN' ? 'Link 为你精选的 3 个高光时刻 ✨' : '3 Highlights curated by Link ✨'}
                 </p>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
               
               {/* 1. Trending */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                      {lang === 'CN' ? '本周热议' : 'Trending'}
                    </h4>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                      “武康路郁金香花开，如何避开人流拍照？” 🌷📸
                    </p>
                    <div className="mt-3 flex gap-2">
                       <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black rounded-lg uppercase tracking-wider">
                         {lang === 'CN' ? '实用指南' : 'Practical Guide'}
                       </span>
                    </div>
                  </div>
               </div>

               {/* 2. Expert Tip */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                      {lang === 'CN' ? '避坑专家' : 'Expert Tip'}
                    </h4>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="text-primary">@John</span> 详细分享了居留许可延期的最新流程。 📝✅
                    </p>
                    <div className="mt-3 flex gap-2">
                       <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black rounded-lg uppercase tracking-wider">
                         {lang === 'CN' ? '实用指南' : 'Practical Guide'}
                       </span>
                    </div>
                  </div>
               </div>

               {/* 3. Hidden Gem */}
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏠</span>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                      {lang === 'CN' ? '隐藏好店' : 'Hidden Gem'}
                    </h4>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                      永康路新开的复古黑胶咖啡馆。 ☕️🎵
                    </p>
                    <div className="mt-3 flex gap-2">
                       <span className="px-2 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black rounded-lg uppercase tracking-wider">
                         {lang === 'CN' ? '本地探店' : 'Local Discovery'}
                       </span>
                    </div>
                  </div>
               </div>

               {/* Star User */}
               <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-500/10">
                     <div className="size-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20 text-2xl">
                        🏆
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1">
                          {lang === 'CN' ? '本周社区之星' : 'Community Star'}
                        </p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          <span className="text-lg mr-1">@Sarah_W</span>
                          <span className="text-xs opacity-60">Most Replies</span>
                        </p>
                     </div>
                     <div className="text-right">
                        <span className="text-xl font-black text-yellow-500">+50</span>
                        <p className="text-[8px] font-black text-yellow-600/60 uppercase">Points</p>
                     </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectionChip: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex h-12 shrink-0 items-center justify-center gap-x-3 rounded-full px-6 border transition-all active:scale-95 ${active ? 'bg-primary border-primary shadow-xl shadow-primary/30 text-[#0d1b14] scale-105' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-700 text-[#0d1b14] dark:text-white'}`}>
    <span className={`material-symbols-outlined text-xl ${active ? 'text-[#0d1b14]' : 'text-primary'}`}>{icon}</span>
    <p className="text-sm font-black tracking-tighter uppercase whitespace-nowrap">{label}</p>
  </button>
);

const SocialCard: React.FC<{ id: string; img?: string; title: string; author?: string; onClick: () => void; onDismiss?: (id: string) => void; isActivity?: boolean }> = ({ id, img, title, author, onClick, onDismiss, isActivity }) => (
  <div onClick={onClick} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-[0.98] cursor-pointer hover:border-primary/40 group flex flex-col h-full relative">
    {img && <div className="h-40 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url("${img}")` }}></div>}
    {isActivity && (
      <>
        <div className="absolute top-4 right-4 bg-primary text-[#0d1b14] text-[8px] font-black px-2 py-1 rounded-full shadow-lg z-10 uppercase tracking-widest">Activity</div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss?.(id); }}
          className="absolute top-4 left-4 size-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center z-10 hover:bg-black/60 transition-all border border-white/20"
        >
          <span className="material-symbols-outlined text-[18px] font-black">close</span>
        </button>
      </>
    )}
    <div className="p-5 flex-1 flex flex-col justify-between">
      <p className="text-[#0d1b14] dark:text-white text-sm font-black leading-tight tracking-tight mb-3 group-hover:text-primary transition-colors">{title}</p>
      {author && (
        <div className="flex items-center gap-2.5">
          <div className="size-5 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-[9px]">{author[0]}</div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{author}</span>
        </div>
      )}
    </div>
  </div>
);

const UpdateCard: React.FC<{ author: string; text: string; title?: string; onClick: () => void }> = ({ author, text, title, onClick }) => (
  <div onClick={onClick} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 border-l-4 border-l-primary cursor-pointer active:scale-[0.98] transition-all group">
    <div className="flex items-center gap-3 mb-4">
        <div className="size-9 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-primary text-lg">verified</span></div>
        <div className="overflow-hidden"><p className="text-[10px] font-black leading-none dark:text-white uppercase tracking-widest truncate">{author}</p></div>
    </div>
    <h5 className="text-sm font-black dark:text-white mb-2 leading-tight tracking-tight group-hover:text-primary transition-colors">{title}</h5>
    <p className="text-[#0d1b14] dark:text-white text-xs font-bold leading-relaxed line-clamp-2 opacity-60">{text}</p>
  </div>
);

const PollCard: React.FC<{ id: string; tag: string; title: string; options: { text: string; votes: number }[]; desc: string; onVote: (id: string, index: number) => void; votedIndex: number | null; onClick: () => void; }> = ({ id, tag, title, options, onVote, votedIndex, onClick }) => {
  const voted = votedIndex !== null;
  const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0) + (voted ? 1 : 0);
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-[0.98] hover:border-primary/40 group overflow-hidden cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
          <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">{tag}</span>
          <span className="material-symbols-outlined text-gray-200 group-hover:text-primary">poll</span>
      </div>
      <h4 className="text-[#0d1b14] dark:text-white text-sm font-black leading-tight tracking-tight mb-3 group-hover:text-primary transition-colors">{title}</h4>
      <div className="space-y-2.5 mt-4">
        {options.slice(0, 3).map((opt, idx) => {
          const isSelected = votedIndex === idx;
          const percentage = Math.round(((opt.votes + (isSelected ? 1 : 0)) / totalVotes) * 100);
          return (
            <div 
              key={idx} 
              onClick={(e) => { e.stopPropagation(); onVote(id, idx); }}
              className={`relative h-10 rounded-xl border flex items-center px-4 overflow-hidden transition-all cursor-pointer hover:border-primary/20 ${isSelected ? 'border-primary shadow-sm bg-primary/5' : 'border-slate-50 dark:border-white/5'}`}
            >
              {voted && <div className="absolute left-0 top-0 h-full bg-primary opacity-20 transition-all" style={{ width: `${percentage}%` }}></div>}
              <span className="text-[11px] font-black relative z-10 truncate">{opt.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: string, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-50 dark:border-white/5 shadow-sm">
    <span className="material-symbols-outlined text-primary">{icon}</span>
    <div className="flex-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const CommentItem: React.FC<{ comment: EnhancedComment, onLike: () => void, onReply: () => void, depth?: number }> = ({ comment, onLike, onReply, depth = 0 }) => (
  <div className={`flex gap-4 animate-slide-up ${depth > 0 ? 'ml-12 mt-4' : ''}`}>
    <div className="size-10 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 shadow-md bg-white">
       <img src={comment.avatar} className="size-full object-cover" />
    </div>
    <div className="flex-1">
       <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{comment.author}</p>
          <span className="text-[9px] font-bold text-slate-300">{comment.time}</span>
       </div>
       <div className={`p-4 rounded-[1.8rem] border ${comment.isUser ? 'rounded-tr-none bg-primary/20 border-primary/30' : 'rounded-tl-none bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 shadow-sm'}`}>
         <p className="text-sm font-bold leading-relaxed">{comment.text}</p>
       </div>
       <div className="flex items-center gap-6 mt-2 ml-2">
          <button onClick={onLike} className="flex items-center gap-1.5 group">
             <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary transition-colors">favorite</span>
             <span className="text-[10px] font-black text-slate-400 group-hover:text-primary">{comment.likes}</span>
          </button>
          <button onClick={onReply} className="flex items-center gap-1.5 group">
             <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary transition-colors">reply</span>
             <span className="text-[10px] font-black text-slate-400 group-hover:text-primary">Reply</span>
          </button>
       </div>
       {comment.replies && comment.replies.map(r => (
         <CommentItem key={r.id} comment={r} onLike={() => {}} onReply={() => {}} depth={depth + 1} />
       ))}
    </div>
  </div>
);

export default ConnectView;
