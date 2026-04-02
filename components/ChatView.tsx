import React, { useState, useRef, useEffect } from 'react';
import { Message, AppLanguage, UserProfile } from '../types';
import { sendMessageToLink } from '../services/geminiService';

interface ChatViewProps {
  lang: AppLanguage;
  userProfile: UserProfile | null;
  history: Message[];
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  onBack: () => void;
  initialPrompt: string | null;
  clearInitialPrompt: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ lang, userProfile, history, setHistory, onBack, initialPrompt, clearInitialPrompt }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [viewMode, setViewMode] = useState<'private' | 'group'>('private');
  const [hubName, setHubName] = useState<string | null>(null);
  const [groupHistory, setGroupHistory] = useState<Message[]>([]);
  const [buddy, setBuddy] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const processedPromptRef = useRef<string | null>(null);

  const avatars = {
    guide: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1AnjqkPoQm3pk-3kBpy77PCfjcc07Zlnpv4KgNiT4VZBC_YvZXFAgnfszjD5gYRcQ8AKG5tNiApQEfIJe4bjL5dP2uYBqK-NbYj07H-cC60gV85aAnOtQ6ebK6shs4tAtEPG0qJMPw-svNd8gylzgFUgBUtHPJsJsMN5oO8v8QoKdWgJwSj8_lK38sclH6lOz86DuHl2t9ANsHnIm_goxAjNsgLD3_WVL3aukvFRT2THSx2jSXX5UknXszs_L9D-0YQ0srpuDMiw",
  };

  const currentHistory = viewMode === 'group' ? groupHistory : history;

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current && !isSearchOpen) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history, groupHistory, isTyping, isSearchOpen, viewMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        // Fix: Properly destructure element properties from the ref and calculate isNearBottom
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (currentHistory.length > 5) {
          setShowJumpButton(!isNearBottom);
        }
      }
    };
    const el = scrollRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [currentHistory.length]);

  useEffect(() => {
    if (initialPrompt && processedPromptRef.current !== initialPrompt) {
      processedPromptRef.current = initialPrompt;
      if (initialPrompt.startsWith('JOIN_GROUP:')) {
        const name = initialPrompt.replace('JOIN_GROUP:', '');
        handleJoinHubChat(name);
      } else if (initialPrompt.startsWith('SOCIAL_CHAT:')) {
        try {
          const buddyData = JSON.parse(initialPrompt.replace('SOCIAL_CHAT:', ''));
          handleStartBuddyChat(buddyData);
        } catch (e) {
          console.error("Failed to parse buddy data", e);
        }
      } else if (viewMode === 'private') {
        handleSend(initialPrompt);
      }
      clearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: textToSend, timestamp: Date.now() };
    
    const addMessageUnique = (prev: Message[], newMessage: Message) => {
      const lastMsg = prev[prev.length - 1];
      // Prevent duplicate messages sent within a short timeframe (2s)
      if (lastMsg && lastMsg.text === newMessage.text && lastMsg.sender === newMessage.sender && (Date.now() - lastMsg.timestamp < 2000)) {
        return prev;
      }
      return [...prev, newMessage];
    };

    if (viewMode === 'group') {
      setGroupHistory(prev => addMessageUnique(prev, userMessage));
    } else {
      setHistory(prev => addMessageUnique(prev, userMessage));
    }
    
    setInput('');
    setIsTyping(true);
    const minDelay = new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (viewMode === 'private') {
        if (buddy) {
          await minDelay;
          const lowerText = textToSend.toLowerCase();
          let insight: string | null = null;
          
          if (lowerText.includes("aa") || lowerText.includes("买单") || lowerText.includes("bill") || lowerText.includes("split")) {
            insight = lang === 'CN'
              ? "💡 **Link's Cultural Insight**: ‘AA’ 在中国社交中意味着‘平分账单’（Split the bill）。这在朋友聚餐或同事聚会中非常普遍。通常大家会先由一个人买单，然后其他人通过微信或支付宝转账给买单的人。这是一种既公平又轻松的社交方式。💸"
              : "💡 **Link's Cultural Insight**: In China, 'AA' means 'splitting the bill'. It's very common among friends or colleagues. Usually, one person pays the full bill first, and others then transfer their share via WeChat Pay or Alipay. It's a fair and stress-free way to handle social expenses! 💸";
          } else if (lowerText.includes("约饭") || lowerText.includes("下次") || lowerText.includes("next time") || lowerText.includes("meal") || lowerText.includes("etiquette") || lowerText.includes("礼仪")) {
             insight = lang === 'CN'
                ? "💡 **Link's Cultural Insight**: 在中国社交中，‘下次约饭’往往是一种礼貌的告别方式（Non-verbal cue），并不一定意味着具体的邀约。如果对方没有提到具体的时间和地点，您可以将其理解为‘很高兴见到你，保持联系’。这样可以避免期待落空带来的尴尬。😊"
                : "💡 **Link's Cultural Insight**: In Chinese social context, 'Next time let's have a meal' (下次约饭) is often a polite way to say goodbye (a non-verbal cue) rather than a concrete invitation. If no specific time or place is mentioned, it's best understood as 'It was great seeing you, let's stay in touch.' This helps avoid the social awkwardness of waiting for an invite that might not come. 😊";
          }

          const buddyResponse: Message = { 
            id: (Date.now() + 1).toString(), 
            sender: 'ai', 
            text: lang === 'CN' 
              ? `听起来不错！我很想了解更多关于你的事。😊` 
              : `That sounds great! I'd love to hear more about that. 😊`, 
            timestamp: Date.now() 
          };
          
          const newMessages = [buddyResponse];
          if (insight) {
            newMessages.push({
              id: (Date.now() + 2).toString(),
              sender: 'ai',
              text: insight,
              timestamp: Date.now() + 1,
              isInsight: true
            });
          }
          setHistory(prev => {
             if (newMessages.length > 0) {
                const lastMsg = prev[prev.length - 1];
                const firstNew = newMessages[0];
                if (lastMsg && lastMsg.text === firstNew.text && lastMsg.sender === firstNew.sender && (Date.now() - lastMsg.timestamp < 2000)) {
                   return prev;
                }
             }
             return [...prev, ...newMessages];
          });
        } else {
          const adminKeywords = /配偶|工作许可|孩子|入学|公寓|人才|续签|spouse|work permit|enrollment|apartment|talent|renewal/i;
        const infoKeywords = /医院|诊所|宠物|打疫苗|附近|哪里|周末活动|活动|咖啡|天气|交通|费用|hospital|clinic|pet|vaccination|nearby|where|weekend|event|coffee|cafe|weather|traffic|cost|west bund|regarding|nightlife/i;
        
        const isMatch = adminKeywords.test(textToSend) || infoKeywords.test(textToSend);
        
        let aiResponseText = "";
        let groundingMetadata: any = null;
        if (!isMatch && textToSend.length < 15 && !textToSend.includes('?') && !textToSend.includes('？') && !textToSend.includes('hi') && !textToSend.includes('你好')) {
           aiResponseText = lang === 'CN' 
             ? "我还在学习中！您可以试试问：‘配偶如何申请工作许可？’、‘附近有哪些国际医院？’ 或 ‘怎么申请人才公寓？’"
             : "I'm still learning! Try asking: 'How to apply for a spouse work permit?', 'Are there international hospitals nearby?' or 'How to apply for talent housing?'";
        } else {
           const lowerText = textToSend.toLowerCase();
           if (lowerText.includes("aa") || lowerText.includes("买单") || lowerText.includes("bill") || lowerText.includes("split")) {
             aiResponseText = lang === 'CN'
               ? "‘AA’ 在中国社交中意味着‘平分账单’（Split the bill）。这在朋友聚餐或同事聚会中非常普遍。通常大家会先由一个人买单，然后其他人通过微信或支付宝转账给买单的人。这是一种既公平又轻松的社交方式。💸"
               : "In China, 'AA' means 'splitting the bill'. It's very common among friends or colleagues. Usually, one person pays the full bill first, and others then transfer their share via WeChat Pay or Alipay. It's a fair and stress-free way to handle social expenses! 💸";
           } else if (lowerText.includes("约饭") || lowerText.includes("下次") || lowerText.includes("next time") || lowerText.includes("meal") || lowerText.includes("etiquette") || lowerText.includes("礼仪")) {
             aiResponseText = lang === 'CN'
               ? "在中国社交中，‘下次约饭’往往是一种礼貌的告别方式（Non-verbal cue），并不一定意味着具体的邀约。如果对方没有提到具体的时间和地点，您可以将其理解为‘很高兴见到你，保持联系’。这样可以避免期待落空带来的尴尬。😊"
               : "In Chinese social context, 'Next time let's have a meal' (下次约饭) is often a polite way to say goodbye (a non-verbal cue) rather than a concrete invitation. If no specific time or place is mentioned, it's best understood as 'It was great seeing you, let's stay in touch.' This helps avoid the social awkwardness of waiting for an invite that might not come. 😊";
           } else if (lowerText.includes("天气") || lowerText.includes("weather")) {
             aiResponseText = lang === 'CN' 
               ? "本周六西岸天气晴朗，气温约 18-24°C，非常适合户外艺术漫步！☀️" 
               : "The weather at West Bund this Saturday will be sunny, around 18-24°C. Perfect for an outdoor Art Walk! ☀️";
           } else if (lowerText.includes("交通") || lowerText.includes("get there") || lowerText.includes("direction")) {
             aiResponseText = lang === 'CN'
               ? "您可以乘坐地铁 11 号线到龙耀路站，步行约 10 分钟即可到达西岸美术馆。🚇"
               : "You can take Metro Line 11 to Longyao Road Station. It's about a 10-minute walk to the West Bund Museum. 🚇";
           } else if (lowerText.includes("费用") || lowerText.includes("cost") || lowerText.includes("how much")) {
             aiResponseText = lang === 'CN'
               ? "本次艺术漫步活动是免费的，但参观美术馆内的特定特展可能需要单独购票。🎨"
               : "The Art Walk event itself is free, though specific special exhibitions inside the museum may require separate tickets. 🎨";
           } else if (lowerText.includes("west bund")) {
             aiResponseText = "Checking events...";
           } else {
             const response = await sendMessageToLink(textToSend, lang, history, userProfile, userLocation || undefined);
             aiResponseText = response.text;
             groundingMetadata = response.groundingMetadata;
           }
        }

        await minDelay;
        const aiMessage: Message = { 
          id: (Date.now() + 1).toString(), 
          sender: 'ai', 
          text: aiResponseText, 
          timestamp: Date.now(), 
          userQuery: textToSend,
          groundingMetadata: groundingMetadata
        };
        setHistory(prev => addMessageUnique(prev, aiMessage));
      }
    } else {
      // Simple mock for Group Chat responses
        await minDelay;
        const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: "That sounds great! Looking forward to seeing everyone there! ✨", timestamp: Date.now() };
        setGroupHistory(prev => addMessageUnique(prev, aiMessage));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleJoinHubChat = (name: string) => {
    setViewMode('group');
    setBuddy(null);
    setHubName(name);
    const userName = "Alex"; 
    setGroupHistory([
      { id: 'h1', sender: 'ai', text: `Welcome to the ${name} Hub! 🏮`, timestamp: Date.now() - 2000 },
      { id: 'h2', sender: 'ai', text: `@${userName} Welcome to the community! This is your group space for ${name}. Feel free to share tips, ask questions, or just say hi to fellow members! ✨`, timestamp: Date.now() }
    ]);
  };

  const handleStartBuddyChat = (buddyData: any) => {
    setViewMode('private');
    setBuddy(buddyData);
    
    // Generate icebreakers based on common interests and context
    const commonInterests = userProfile?.interests?.filter(interest => 
      buddyData.interests?.some((bi: string) => bi.toLowerCase() === interest.toLowerCase())
    ) || [];
    
    const mainInterest = commonInterests.length > 0 ? commonInterests[0] : (buddyData.interests?.[0] || 'Shanghai');
    
    const icebreakers = lang === 'CN' ? [
      `嗨！看到你也喜欢 ${mainInterest}，最近西岸那边有相关的活动，要一起去看看吗？🎨`,
      `最近上海天气不错，很适合去户外 ${mainInterest}，你一般去哪里？☀️`,
      `很高兴认识你！作为同样对 ${mainInterest} 感兴趣的人，你觉得上海最棒的地方是哪里？✨`
    ] : [
      `Hi! I see you're into ${mainInterest} too. There's a cool event at West Bund lately, want to check it out? 🎨`,
      `The weather in Shanghai is great lately, perfect for some outdoor ${mainInterest}. Where do you usually go? ☀️`,
      `Great to meet you! As a fellow ${mainInterest} enthusiast, what's your favorite spot in Shanghai? ✨`
    ];

    setHistory([
      { 
        id: 'b1', 
        sender: 'ai', 
        text: lang === 'CN' 
          ? `嗨！我是 ${buddyData.name}。很高兴认识你！✨` 
          : `Hi! I'm ${buddyData.name}. Great to meet you! ✨`, 
        timestamp: Date.now(),
        icebreakers: icebreakers
      }
    ]);
  };

  const handleJoinGroup = () => {
    setViewMode('group');
    const userName = "Alex"; // Placeholder as used in screenshot
    // Preferred interest detection
    const isArtInterested = userProfile?.interests?.some(i => i.toLowerCase().includes('art') || i.toLowerCase().includes('museum'));
    const interestEN = isArtInterested ? "art enthusiast" : "cycling enthusiast";
    
    setGroupHistory([
      { id: 'g1', sender: 'ai', text: `Welcome to the group chat! 🏮`, timestamp: Date.now() - 2000 },
      { id: 'g2', sender: 'ai', text: `@${userName} Welcome ${userName}! He is also a ${interestEN}. You guys can discuss routes for this Saturday! 🚲✨`, timestamp: Date.now() }
    ]);
  };

  const scrollToMessage = (id: string) => {
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const matchingMessages = searchQuery.trim() 
    ? currentHistory.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const labels: Record<AppLanguage, string> = {
    EN: "Ask Link anything...", 
    CN: "问问 Link 任何事...", 
    JP: "Linkに質問...", 
    KR: "Link에게 질문...", 
    FR: "Demandez à Link...", 
    ES: "Pregunta a Link...",
    DE: "Frag Link etwas...",
    IT: "Chiedi a Link...",
    PT: "Perгunte ao Link...",
    RU: "Спроси Линка...",
    AR: "اسأل لينك أي شيء..."
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowJumpButton(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200/80 dark:bg-yellow-500/40 text-slate-900 dark:text-white rounded px-1">{part}</mark> 
        : part
    );
  };

  const getHeaderTitle = () => {
    if (buddy) return buddy.name;
    if (viewMode !== 'group') return 'we Link!';
    if (hubName) return hubName;
    return 'West Bund Art Walk Group';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#f0fff4] to-white dark:from-[#0a140f] dark:to-[#050a08] relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[25%] right-[5%] text-4xl animate-float-slow">🥟</div>
        <div className="absolute top-[60%] left-[8%] text-3xl animate-float-fast" style={{ animationDelay: '1.5s' }}>🏮</div>
        <div className="absolute bottom-[20%] right-[15%] text-5xl animate-float-slow" style={{ animationDelay: '3s' }}>🗼</div>
      </div>

      <header className="sticky top-0 z-50 glass px-6 py-6 flex flex-col gap-4 border-b border-slate-100 dark:border-white/10 shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <button 
            onClick={viewMode === 'group' ? () => { if (hubName) onBack(); else setViewMode('private'); } : onBack} 
            className="size-10 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 active:scale-90 transition-all hover:bg-primary/20 hover:text-primary"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#13ec80]" />
              <h2 className="text-slate-900 dark:text-white font-black text-lg tracking-tighter italic">
                {getHeaderTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`size-10 rounded-2xl flex items-center justify-center transition-all ${isSearchOpen ? 'bg-primary text-[#0d1b14]' : 'bg-slate-50 dark:bg-zinc-800 text-slate-400'}`}
            >
              <span className="material-symbols-outlined font-black">{isSearchOpen ? 'close' : 'search'}</span>
            </button>
            <div className="size-10 rounded-full border-2 border-primary/30 p-1">
              <img 
                src={buddy ? buddy.avatar : avatars.guide} 
                className="size-full object-cover rounded-full" 
                alt={buddy ? buddy.name : "Link"} 
              />
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="animate-in slide-in-from-top duration-300">
            <div className="relative">
              <input 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search Chat"
                className="w-full h-12 bg-white dark:bg-zinc-900 border-2 border-primary/20 focus:border-primary rounded-2xl px-12 text-sm font-bold transition-all shadow-inner"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
            </div>
          </div>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-36 relative z-10">
        
        {viewMode === 'private' && !buddy && (
          <div className="animate-slide-up mb-10">
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-primary/20 shadow-xl flex items-center gap-5">
                <div className="size-16 rounded-[1.8rem] overflow-hidden shrink-0 border-2 border-primary shadow-lg bg-slate-50">
                  <img src={avatars.guide} className="size-full object-cover" alt="Link" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">Link</h3>
                     <div className="px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20"><p className="text-[8px] font-black text-primary uppercase tracking-widest">Assistant</p></div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Your 24/7 Official City Guide</p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {lang === 'CN' 
                      ? "我是 Link，您的上海全能生活助手！无论是办事还是探索美食，我随时为您效劳。🏮" 
                      : "I'm Link, your all-in-one SH assistant! Ready to help you with anything from admin to hidden cafes. ✨"}
                  </p>
                </div>
              </div>
          </div>
        )}

        {currentHistory.map((msg, index) => (
          <div 
            key={msg.id} 
            id={`msg-${msg.id}`}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="max-w-[95%] flex flex-col gap-2">
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-2 mb-1 ml-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">
                    {(buddy && !msg.isInsight) ? buddy.name : 'Link'}
                  </span>
                </div>
              )}
              <div 
                className={`chat-text transition-all w-fit text-left ${
                  msg.sender === 'user' 
                    ? 'px-5 py-3 text-[15px] leading-relaxed shadow-lg border bg-primary text-[#0d1b14] font-bold rounded-2xl rounded-tr-none shadow-primary/20 border-primary-dark/20 ml-auto' 
                    : ''
                }`}
              >
                {msg.sender === 'ai' ? (
                  <AiMessageContent 
                    text={msg.text} 
                    lang={lang} 
                    onRelatedClick={handleSend} 
                    userQuery={msg.userQuery}
                    searchQuery={searchQuery}
                    onRegister={() => setIsRegistered(true)}
                    isRegistered={isRegistered}
                    onJoinGroup={handleJoinGroup}
                    isGroup={viewMode === 'group'}
                    buddy={buddy}
                    icebreakers={msg.icebreakers}
                    isInsight={msg.isInsight}
                    groundingMetadata={msg.groundingMetadata}
                  />
                ) : highlightText(msg.text, searchQuery)}
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-2 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start pl-2 animate-slide-up">
             <div className="px-5 py-3 glass dark:bg-zinc-900 rounded-2xl flex gap-1.5 shadow-md items-center">
               <span className="size-2 bg-primary rounded-full animate-bounce"></span>
               <span className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.2s]"></span>
               <span className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.4s]"></span>
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/98 to-transparent z-50">
        <div className="max-w-md mx-auto relative">
          {showJumpButton && !isSearchOpen && (
            <button 
              onClick={scrollToBottom}
              className="absolute -top-12 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-white dark:bg-zinc-800 border-2 border-primary/30 rounded-full shadow-2xl text-[10px] font-black text-primary uppercase tracking-widest hover:scale-105 active:scale-95 transition-all animate-bounce"
            >
              ✨ Jump to Latest
            </button>
          )}
          <div className="flex items-center gap-4 glass dark:bg-zinc-900 p-3 rounded-full border shadow-2xl focus-within:ring-4 focus-within:ring-primary/20 transition-all overflow-hidden">
            <button className="size-11 flex items-center justify-center rounded-full text-slate-300 hover:text-primary transition-all active:scale-90 shrink-0">
              <span className="material-symbols-outlined text-[26px] font-black">add_circle</span>
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] py-3 px-1 dark:text-white font-bold placeholder:text-slate-400 min-w-0" 
              placeholder={labels[lang]}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="size-11 flex items-center justify-center rounded-full bg-primary text-[#0d1b14] shadow-lg active:scale-90 transition-all hover:scale-105 disabled:opacity-30 shrink-0"
            >
              <span className="material-symbols-outlined font-black text-xl">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AiMessageContent: React.FC<{ 
  text: string; 
  lang: AppLanguage; 
  onRelatedClick: (q: string) => void; 
  userQuery?: string; 
  searchQuery?: string;
  onRegister: () => void;
  isRegistered: boolean;
  onJoinGroup: () => void;
  isGroup: boolean;
  buddy?: any;
  icebreakers?: string[];
  isInsight?: boolean;
  groundingMetadata?: any;
}> = ({ text, lang, onRelatedClick, userQuery = "", searchQuery = "", onRegister, isRegistered, onJoinGroup, isGroup, buddy, icebreakers, isInsight, groundingMetadata }) => {
  const [showFaq, setShowFaq] = useState(false);
  const [localRegStatus, setLocalRegStatus] = useState<'none' | 'confirming' | 'submitting' | 'success'>('none');
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [isInsightExpanded, setIsInsightExpanded] = useState(true);

  const highlightText = (content: string, query: string) => {
    if (!query.trim()) return content;
    const parts = content.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200/80 dark:bg-yellow-500/40 text-slate-900 dark:text-white rounded px-1">{part}</mark> 
        : part
    );
  };

  if (isInsight) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-[90%]">
        <div 
          onClick={() => setIsInsightExpanded(!isInsightExpanded)}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            isInsightExpanded 
              ? 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-500/20 shadow-lg' 
              : 'bg-white/50 dark:bg-zinc-800/50 border-slate-100 dark:border-white/5 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-lg font-black">lightbulb</span>
              <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.15em] italic">
                {lang === 'CN' ? "Link 的文化洞察" : "Link's Cultural Insight"}
              </p>
            </div>
            <span className={`material-symbols-outlined text-slate-400 text-sm transition-transform ${isInsightExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>
          
          {isInsightExpanded && (
            <div className="mt-3 text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed animate-slide-up">
              {text.replace(/💡 \*\*Link's Cultural Insight\*\*: /g, '').replace(/💡 \*\*Link 的文化洞察\*\*: /g, '')}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (buddy) {
    return (
      <div className="flex flex-col gap-3">
        <div className="px-5 py-3 glass dark:bg-zinc-900 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none font-medium border-white/50 dark:border-white/5 shadow-lg flex flex-col gap-3 text-left">
          <div className="font-medium space-y-3 text-slate-800 dark:text-slate-100 leading-relaxed text-left">
            {text.split('\n\n').map((para, i) => <p key={i}>{highlightText(para, searchQuery)}</p>)}
          </div>
        </div>
        {icebreakers && icebreakers.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 animate-slide-up">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest ml-2 mb-1">
              {lang === 'CN' ? '推荐开场白' : 'Suggested Icebreakers'}
            </p>
            <div className="flex flex-col gap-2">
              {icebreakers.map((ib, idx) => (
                <button
                  key={idx}
                  onClick={() => onRelatedClick(ib)}
                  className="text-left px-4 py-3 bg-white/80 dark:bg-zinc-800/80 border border-primary/20 rounded-2xl text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:border-primary transition-all shadow-sm active:scale-[0.98]"
                >
                  {ib}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const t = {
    CN: {
      materials: "所需材料：",
      otherAsk: "其他用户也问过：",
      q1: "办理流程需要多久？",
      q2: "收费标准是多少？",
      q3: "可以线上预约吗？",
      map: "地图查看",
      call: "拨打电话",
      policy: "VIEW FULL POLICY",
      join: "我想去",
      members: "12 位好友已参加",
      startsIn: "2 天后开始",
      regAuto: "已为您从账户信息中自动填写。报名成功！✨",
      regProcessing: "正在处理您的报名请求...",
      faqTitle: "关于本活动，您可以问我：",
      faqWeather: "天气如何？",
      faqTraffic: "怎么过去？",
      faqCost: "有什么费用？",
      joined: "已报名",
      successHeader: "SUCCESS",
      formTitle: "报名信息确认",
      formSub: "Link 已根据您的账户为您自动填写表单：",
      confirmBtn: "确认并报名",
      labelName: "姓名",
      labelPhone: "手机号",
      labelEmail: "邮箱",
      regSuccessMsg: "报名成功！这次活动有 5 个也是刚来上海的‘Newbies’，我把你们拉进一个临时活动群了，大家可以先认识一下！🏮",
      joinGroup: "JOIN GROUP CHAT",
    },
    EN: {
      materials: "Required Materials:",
      otherAsk: "Other users also asked:",
      q1: "How long is the process?",
      q2: "What are the fees?",
      q3: "Can I book online?",
      map: "View on Map",
      call: "Call",
      policy: "VIEW FULL POLICY",
      join: "I'm interested",
      members: "12 members joined",
      startsIn: "Starts in 2 days",
      regAuto: "I've auto-filled the form using your account info. Registration successful! ✨",
      regProcessing: "Processing your registration...",
      faqTitle: "About this event, you can ask:",
      faqWeather: "How's the weather?",
      faqTraffic: "How to get there?",
      faqCost: "Are there any costs?",
      joined: "Joined",
      successHeader: "SUCCESS",
      formTitle: "Registration Confirmation",
      formSub: "Link has auto-filled the form using your account info:",
      confirmBtn: "Confirm & Register",
      labelName: "Name",
      labelPhone: "Phone",
      labelEmail: "Email",
      regSuccessMsg: "Success! There are 5 other 'Newbies' who just arrived in SH for this event. I've added you to a temporary activity group, feel free to say hi! 🥂",
      joinGroup: "JOIN GROUP CHAT",
    }
  }[lang === 'CN' ? 'CN' : 'EN'];

  const isGreeting = text.includes("Welcome to Shanghai") || text.includes("欢迎来到上海");
  const isAdmin = /配偶|工作许可|孩子|入学|公寓|人才|续签|spouse|work permit|enrollment|apartment|talent|renewal/i.test(userQuery);
  const isLocation = /医院|诊所|宠物|打疫苗|附近|哪里|咖啡|餐厅|饭店|美食|好吃|推荐|hospital|clinic|pet|vaccination|nearby|where|coffee|cafe|restaurant|food|eat|recommend/i.test(userQuery);
  const isEvent = /西岸|艺术|活动|west bund|art|event|weekend|nightlife/i.test(userQuery);
  const isEventRAG = /天气|交通|费用|weather|traffic|cost|get there|direction|how much|west bund|nightlife/i.test(userQuery);

  // Extract interest from query for dynamic card content
  const interestMatch = userQuery.match(/regarding\s+(.*?)(\.|!|$)/i) || userQuery.match(/关于\s+(.*?)(\.|!|$)/i);
  const currentInterest = interestMatch ? interestMatch[1].trim() : (lang === 'CN' ? '艺术' : 'Art');

  const handleInterestClick = () => {
    setLocalRegStatus('confirming');
  };

  const handleFinalConfirm = () => {
    setLocalRegStatus('submitting');
    setTimeout(() => {
      setLocalRegStatus('success');
      onRegister();
    }, 1200);
  };

  // Reusable participation UI component for consistency
  const renderParticipationSection = (showExtraButtons: boolean = false) => {
    if (isRegistered || localRegStatus === 'success') {
      return (
        <div className="flex flex-col gap-4 animate-slide-up">
          <div className="bg-primary/10 border-2 border-primary/20 p-5 rounded-[1.5rem] shadow-inner flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary font-black text-lg">check_circle</span>
              </div>
              <p className="text-[12px] font-black text-primary uppercase tracking-[0.2em]">{t.successHeader}</p>
            </div>
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">{t.regAuto}</p>
          </div>
          <div className="p-5 bg-[#0d1b14] dark:bg-zinc-800 rounded-3xl border border-primary/20 shadow-xl animate-slide-up flex flex-col gap-4">
             <p className="text-[13px] font-bold text-slate-200 dark:text-slate-100 leading-relaxed italic">
               {t.regSuccessMsg}
             </p>
             <button 
               className="w-full py-4 bg-[#0d1b14] dark:bg-zinc-700 text-primary font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border border-primary/20"
               onClick={onJoinGroup}
             >
               <span className="material-symbols-outlined text-lg">forum</span>
               {t.joinGroup}
             </button>
          </div>
        </div>
      );
    }

    if (localRegStatus === 'confirming') {
      return (
        <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 animate-slide-up shadow-inner">
           <h4 className="text-[13px] font-black text-primary uppercase tracking-widest mb-2 italic">{t.formTitle}</h4>
           <p className="text-[10px] font-bold text-slate-500 mb-4">{t.formSub}</p>
           <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-[11px] font-bold text-slate-400">{t.labelName}</span>
                <span className="text-[12px] font-black text-slate-800 dark:text-white">Alex Chen</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-[11px] font-bold text-slate-400">{t.labelPhone}</span>
                <span className="text-[12px] font-black text-slate-800 dark:text-white">138****8888</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[11px] font-bold text-slate-400">{t.labelEmail}</span>
                <span className="text-[12px] font-black text-slate-800 dark:text-white">alex.c@example.com</span>
              </div>
           </div>
           <button 
            onClick={handleFinalConfirm}
            className="w-full py-3 bg-primary text-[#0d1b14] font-black rounded-xl shadow-lg active:scale-95 transition-all"
           >
             {t.confirmBtn}
           </button>
        </div>
      );
    }

    if (localRegStatus === 'submitting') {
      return (
        <div className="bg-primary/10 border-2 border-primary/20 p-5 rounded-[1.5rem] animate-slide-up shadow-inner flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[12px] font-black text-primary uppercase tracking-[0.2em]">{t.regProcessing}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <button 
          onClick={handleInterestClick}
          className="w-full py-4 bg-primary text-[#0d1b14] font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-3"
        >
           <span className="material-symbols-outlined text-lg">celebration</span>
           {t.join}
        </button>
      </div>
    );
  };

  // Special Highly Integrated Activity Card
  if (isEvent) {
    return (
      <div className="animate-slide-up flex flex-col gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl w-full max-w-[340px]">
           <div className="relative h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1554941068-a252680d25d9?q=80&w=800&auto=format&fit=crop")` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-4 left-4 bg-primary/95 text-[#0d1b14] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                 <span className="material-symbols-outlined text-[16px] animate-sparkle">auto_awesome</span>
                 <span className="text-[9px] font-black uppercase tracking-widest">Link Insight</span>
              </div>
              <div className="absolute bottom-4 left-6">
                 <p className="text-white text-lg font-black tracking-tight leading-tight italic">West Bund {currentInterest} Event 🎨</p>
                 <p className="text-white/80 text-[10px] font-bold mt-1 uppercase tracking-widest">Saturday · Oct 19, 14:00</p>
              </div>
           </div>
           <div className="p-6">
              <p className="text-[13px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic mb-5">
                 {lang === 'CN' 
                   ? `Hello! 我是 Link，很高兴能帮你探索本周六西岸充满活力的${currentInterest}场景！西岸正举办精彩活动，不容错过。`
                   : `Hello! I'm Link, and I'm so excited to help you explore the vibrant ${currentInterest} scene at West Bund this Saturday! It's buzzing.`
                 }
              </p>
              <div className="flex items-center justify-between py-4 border-y border-slate-50 dark:border-white/5 mb-6">
                 <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} className="size-6 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />)}
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t.members}</span>
                 </div>
                 <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">
                    {t.startsIn}
                 </div>
              </div>
              
              {renderParticipationSection(true)}

              {showQuickQuestions && (localRegStatus === 'none' && !isRegistered) && (
                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.faqTitle}</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: t.faqWeather, q: lang === 'CN' ? "天气如何？" : "How's the weather?" },
                      { label: t.faqTraffic, q: lang === 'CN' ? "怎么过去？" : "How to get there?" },
                      { label: t.faqCost, q: lang === 'CN' ? "有什么费用？" : "Are there any costs?" }
                    ].map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { onRelatedClick(item.q); }}
                        className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:text-primary transition-all"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  if (isAdmin && !isGreeting) {
    const isApartment = /公寓|人才|apartment|talent/i.test(userQuery);
    const materials = isApartment ? [
      "Labor contract (more than 1 year) / 劳动合同 (1年以上)",
      "Educational certificate / 学历证明 (本科及以上)",
      "Residence Permit / 居留许可",
      "Company registration info / 单位注册信息"
    ] : [
      "Valid Passport / 有效护照",
      "Legalized Marriage Certificate / 结婚证公证件",
      "Residence Permit of Spouse / 配偶居留许可",
      "Employer Invitation Letter / 雇主邀请函"
    ];

    return (
      <div className="px-5 py-3 glass dark:bg-zinc-900 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none font-medium border-white/50 dark:border-white/5 shadow-lg flex flex-col gap-4 text-left">
        <p className="font-medium text-slate-800 dark:text-slate-100">{highlightText(text, searchQuery)}</p>
        <div className="p-4 bg-primary/10 dark:bg-primary/5 rounded-xl border border-primary/20 shadow-inner text-left">
          <p className="font-black text-primary text-sm mb-2 uppercase tracking-widest">{t.materials}</p>
          <ul className="space-y-2">
            {materials.map((m, i) => (
              <li key={i} className="text-[13px] flex items-start gap-2">
                <span className="text-primary font-black mt-1.5 size-1 rounded-full bg-primary shrink-0"></span>
                <span className="font-bold text-slate-700 dark:text-slate-200 leading-snug">{highlightText(m, searchQuery)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-1 border-t border-slate-100 dark:border-white/5 pt-3">
          <button 
            onClick={() => setShowFaq(!showFaq)} 
            className="flex items-center justify-between w-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors py-1 group"
          >
            {t.otherAsk}
            <span className={`material-symbols-outlined transition-transform duration-300 ${showFaq ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
          </button>
          <div className={`overflow-hidden transition-all duration-400 ${showFaq ? 'max-h-[300px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col gap-2">
              {[t.q1, t.q2, t.q3].map((q, i) => (
                <button key={i} onClick={() => onRelatedClick(q)} className="text-left text-xs py-3 px-4 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 font-bold hover:border-primary/50 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLocation && !isGreeting) {
    const isCoffee = /咖啡|coffee|cafe/i.test(userQuery);
    const groundingChunks = groundingMetadata?.groundingChunks;
    const venues = groundingChunks?.map((chunk: any) => ({
      name: chunk.maps?.title || chunk.web?.title,
      addr: chunk.maps?.uri || chunk.web?.uri,
      tel: "", // Not always available in grounding
      uri: chunk.maps?.uri || chunk.web?.uri
    })).filter((v: any) => v.name) || [];

    const displayVenues = venues.length > 0 ? venues : (isCoffee ? [
      { name: "Manner Coffee (Jing'an)", addr: "818 West Nanjing Road", tel: "400-123-4567", uri: "#" },
      { name: "Seesaw Coffee (Reel Mall)", addr: "1601 Nanjing West Road, 5F", tel: "021-3456-7890", uri: "#" }
    ] : [
      { name: "Jiahui Health (Xuhui)", addr: "689 Guiping Road, Xuhui", tel: "400-868-3000", uri: "#" },
      { name: "SinoUnited Health", addr: "1376 Nanjing West Road", tel: "400-186-2116", uri: "#" }
    ]);

    return (
      <div className="px-5 py-3 glass dark:bg-zinc-900 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none font-medium border-white/50 dark:border-white/5 shadow-lg flex flex-col gap-4 text-left">
        <p className="font-medium text-slate-800 dark:text-slate-100 leading-relaxed">{highlightText(text, searchQuery)}</p>
        <div className="space-y-3">
          {displayVenues.map((v: any, i: number) => (
            <div 
              key={i} 
              className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-slate-100 dark:border-white/10 shadow-md animate-slide-up hover:border-primary/30 transition-all group" 
              style={{ animationDelay: `${i * 0.15}s` }} onClick={() => v.uri && window.open(v.uri, '_blank')}
            >
              <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight mb-2 group-hover:text-primary transition-colors text-left">{highlightText(v.name, searchQuery)}</h4>
              <div className="space-y-1 mb-3">
                <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2 text-left">
                  <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  {highlightText(v.addr, searchQuery)}
                </p>
                {v.tel && (
                  <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2 text-left">
                    <span className="material-symbols-outlined text-[14px] text-primary">phone</span>
                    {v.tel}
                  </p>
                )}
              </div>
              <button className="w-full py-2 px-5 bg-primary/10 text-primary font-black rounded-lg text-[10px] flex items-center justify-start gap-2 active:scale-95 transition-all uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px] font-black">map</span>
                {t.map}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-3 glass dark:bg-zinc-900 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none font-medium border-white/50 dark:border-white/5 shadow-lg flex flex-col gap-3 text-left">
      <div className="font-medium space-y-3 text-slate-800 dark:text-slate-100 leading-relaxed text-left">
        {text.split('\n\n').map((para, i) => <p key={i}>{highlightText(para, searchQuery)}</p>)}
      </div>
      
      {/* Event Participation re-confirmation buttons for follow-up responses */}
      {isEventRAG && (
        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
          {renderParticipationSection(false)}
        </div>
      )}

      {!isGreeting && text.length > 40 && !isEventRAG && !isGroup && (
        <button className="w-fit py-2 px-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-[11px] flex items-center gap-2 hover:bg-primary/20 transition-all uppercase tracking-widest">
          <span className="material-symbols-outlined text-[14px] font-black">policy</span>
          {t.policy}
        </button>
      )}
    </div>
  );
};

export default ChatView;
