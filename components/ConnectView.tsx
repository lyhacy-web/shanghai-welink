import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppLanguage, UserProfile } from '../types';

interface ConnectViewProps {
  lang: AppLanguage;
  userProfile: UserProfile | null;
  onAiChatStart: (prompt: string) => void;
}

const ConnectView: React.FC<ConnectViewProps> = ({ lang, userProfile, onAiChatStart }) => {
  const [showDigest, setShowDigest] = useState(false);
  const [loadingDigest, setLoadingDigest] = useState(false);

  const t: Partial<Record<AppLanguage, any>> = {
    EN: { title: "Community Connect", subtitle: "Meet like-minded expats & locals", digest: "Daily Community Digest", generate: "Generate My Digest", loading: "Curating your Shanghai network...", join: "Join Group", chat: "Chat Now" },
    CN: { title: "社区连接", subtitle: "结识志同道合的外籍人士和当地人", digest: "每日社区摘要", generate: "生成我的摘要", loading: "正在为您策划上海网络...", join: "加入群组", chat: "立即聊天" },
    JP: { title: "コミュニティ接続", subtitle: "志を同じくする駐在員や地元の人々と出会う", digest: "毎日のコミュニティダイジェスト", generate: "ダイジェストを生成", loading: "上海ネットワークをキュレート中...", join: "グループに参加", chat: "今すぐチャット" },
    KR: { title: "커뮤니티 연결", subtitle: "뜻이 맞는 외국인 및 현지인 만나기", digest: "일일 커뮤니티 요약", generate: "내 요약 생성", loading: "상하이 네트워크 큐레이팅 중...", join: "그룹 가입", chat: "지금 채팅" },
    FR: { title: "Connexion Communautaire", subtitle: "Rencontrez des expatriés et des locaux", digest: "Résumé Quotidien", generate: "Générer mon résumé", loading: "Curating votre réseau à Shanghai...", join: "Rejoindre", chat: "Discuter" },
    ES: { title: "Conexión Comunitaria", subtitle: "Conoce a expatriados y locales", digest: "Resumen Diario", generate: "Generar mi resumen", loading: "Curando su red en Shanghai...", join: "Unirse", chat: "Chatear" },
  };

  const currentT = t[lang] || t.EN;

  const handleShowDigest = () => {
    setLoadingDigest(true);
    setTimeout(() => {
      setLoadingDigest(false);
      setShowDigest(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[10%] left-[-10%] size-72 bg-primary/10 blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] size-96 bg-blue-400/5 blur-[120px] animate-blob pointer-events-none" style={{ animationDelay: '4s' }}></div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center p-5 justify-between">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="flex size-11 shrink-0 items-center"
          >
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-2xl size-10 border-2 border-primary shadow-lg animate-pulse-glow"
              style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCG2uax_7EgixMasAX0mnZCpjvG2FGHY_JjuoDu7vgzb0T3dtuFM8_xufhzS6CAw7mfrYTB7MFm_NkEhxDoWfZv52BYo6z3_f_jGHD3iQBYhHEDDvr7qNKlbE8F69mTjVGGfGN1RWrxPyaXZJbDVtPRT8kQs2NOPROzF-Wl2L3lTpQ8J33FPGcZBQ9bMrfx_NfnN65fI0724sD2nkvYBZma-u8KgYKaK9qrEl6r8SwslewP8qMUpsNUkpztJHV1NWV4gFvwRAKtNu0")` }}
            />
          </motion.div>
          <div className="flex flex-col items-center flex-1">
            <h2 className="text-[#0d1b14] dark:text-white text-2xl font-black tracking-tighter italic leading-none drop-shadow-sm">{currentT?.title || 'super hub'}</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">{currentT?.subtitle || 'Community Pulse'}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAiChatStart("Tell me about upcoming community events in Shanghai")}
            className="size-11 rounded-2xl bg-primary/20 flex items-center justify-center text-primary"
          >
            <span className="material-symbols-outlined font-black">forum</span>
          </motion.button>
        </div>
      </div>

      <main className="flex-1 px-5 py-8 space-y-10">
        
        {/* AI Digest Entry */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] p-8 bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/30 shadow-2xl overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin-slow">auto_awesome</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-primary text-[#0d1b14] text-[10px] font-black uppercase tracking-widest animate-pulse">New</div>
              <h3 className="text-[#0d1b14] dark:text-white text-xl font-black tracking-tight italic">{currentT?.digest || 'AI-Generated Digest'}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-bold leading-relaxed mb-8 max-w-[80%]">
              {currentT?.loading || 'Stay updated with the most discussed topics and expert tips from our community this week.'}
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShowDigest}
              disabled={loadingDigest}
              className="px-8 py-4 rounded-2xl bg-primary text-[#0d1b14] font-black text-sm shadow-xl shadow-primary/30 flex items-center gap-3 transition-all hover:brightness-105 disabled:opacity-50"
            >
              {loadingDigest ? (
                <>
                  <div className="size-4 border-2 border-[#0d1b14] border-t-transparent rounded-full animate-spin"></div>
                  <span>Link is reading 1,284 messages...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">auto_stories</span>
                  <span>{currentT?.generate || 'View Digest'}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 gap-5">
          <StatCard icon="groups" count="12.4k" label="Active Members" color="text-blue-500" />
          <StatCard icon="forum" count="850+" label="Daily Chats" color="text-emerald-500" />
        </div>

        {/* Hot Topics */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#0d1b14] dark:text-white text-xl font-black tracking-tighter italic">Hot Topics</h3>
            <span className="material-symbols-outlined text-gray-300">trending_up</span>
          </div>
          <div className="space-y-4">
            <TopicCard 
              title="Wukang Road Tulips" 
              author="SarahL" 
              replies={128} 
              img="https://images.unsplash.com/photo-1520323232427-6b6230f750f3?q=80&w=400&auto=format&fit=crop" 
            />
            <TopicCard 
              title="Work Permit Renewal" 
              author="JohnD" 
              replies={56} 
              img="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop" 
            />
          </div>
        </section>

      </main>

      {/* Digest Modal */}
      <AnimatePresence>
        {showDigest && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/60 backdrop-blur-md"
            onClick={() => setShowDigest(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[3.5rem] p-8 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Background Decor */}
              <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary font-black">auto_awesome</span>
                    </div>
                    <h3 className="text-2xl font-black dark:text-white tracking-tighter italic">Weekly Digest</h3>
                  </div>
                  <button onClick={() => setShowDigest(false)} className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-8">
                  <DigestItem 
                    emoji="✨" 
                    title="本周热议" 
                    content="“武康路郁金香花开，如何避开人流拍照？”" 
                  />
                  <DigestItem 
                    emoji="💡" 
                    title="避坑专家" 
                    content="@John 详细分享了居留许可延期的最新流程。" 
                  />
                  <DigestItem 
                    emoji="🏠" 
                    title="隐藏好店" 
                    content="永康路新开的复古黑胶咖啡馆。" 
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDigest(false)}
                  className="w-full mt-10 py-5 rounded-[2rem] bg-primary text-[#0d1b14] font-black text-lg shadow-xl shadow-primary/20"
                >
                  Got it!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; count: string; label: string; color: string }> = ({ icon, count, label, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl"
  >
    <div className={`size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4 ${color}`}>
      <span className="material-symbols-outlined text-2xl font-black">{icon}</span>
    </div>
    <h4 className="text-2xl font-black dark:text-white tracking-tighter leading-none mb-1">{count}</h4>
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
  </motion.div>
);

const TopicCard: React.FC<{ title: string; author: string; replies: number; img: string }> = ({ title, author, replies, img }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className="flex items-center gap-5 p-4 rounded-[2.2rem] bg-white dark:bg-zinc-900 border border-slate-50 dark:border-white/5 shadow-lg group cursor-pointer"
  >
    <div className="size-16 rounded-2xl bg-center bg-cover shrink-0 shadow-md group-hover:rotate-3 transition-transform" style={{ backgroundImage: `url("${img}")` }}></div>
    <div className="flex-1 min-w-0">
      <h4 className="font-black text-[#0d1b14] dark:text-white text-lg tracking-tight truncate leading-none mb-2">{title}</h4>
      <div className="flex items-center gap-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">By {author}</p>
        <div className="size-1 rounded-full bg-slate-200"></div>
        <p className="text-[11px] font-black text-primary uppercase tracking-widest">{replies} Replies</p>
      </div>
    </div>
    <div className="size-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary transition-all">
      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0d1b14] group-hover:font-black">chevron_right</span>
    </div>
  </motion.div>
);

const DigestItem: React.FC<{ emoji: string; title: string; content: string }> = ({ emoji, title, content }) => (
  <div className="flex gap-4">
    <div className="text-2xl pt-1">{emoji}</div>
    <div>
      <h4 className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-1">{title}</h4>
      <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">{content}</p>
    </div>
  </div>
);

export default ConnectView;
