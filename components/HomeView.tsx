import React, { useState } from 'react';
import { AppLanguage } from '../types';

interface HomeViewProps {
  lang: AppLanguage;
  setLang: (l: AppLanguage) => void;
  onChatStart: (prompt?: string) => void;
  onCategorySelect: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ lang, setLang, onChatStart, onCategorySelect }) => {
  const [showLangPicker, setShowLangPicker] = useState(false);

  const languages: { code: AppLanguage; name: string; flag: string }[] = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'JP', name: '日本語', flag: '🇯🇵' },
    { code: 'KR', name: '한국어', flag: '🇰🇷' },
    { code: 'FR', name: 'Français', flag: '🇫🇷' },
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'PT', name: 'Português', flag: '🇵🇹' },
    { code: 'RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'AR', name: 'العربية', flag: '🇸🇦' },
  ];

  const t: Record<string, any> = {
    EN: { greeting: "Hi, I'm Link!", sub: "web-link · warm-link · win-link", ask: "Popular Questions", workPermit: "Apply for Work Permit", metro: "Metro Guide", visa: "Visa Tips", explore: "Explore Jing'an", placeholder: "Ask Link anything..." },
    CN: { greeting: "嗨，我是 Link！", sub: "web-link · warm-link · win-link", ask: "热门探索", workPermit: "申请工作许可", metro: "地铁指南", visa: "签证贴士", explore: "探索静安区", placeholder: "问问 Link 任何事..." },
    JP: { greeting: "こんにちは、Linkです！", sub: "web-link · warm-link · win-link", ask: "人気の質問", workPermit: "就劳許可を申請", metro: "地下铁ガイド", visa: "ビザのヒント", explore: "静安を探索", placeholder: "Linkに質問..." },
    KR: { greeting: "안녕, 나는 Link야!", sub: "web-link · warm-link · win-link", ask: "자주 묻는 질문", workPermit: "취업 허가 신청", metro: "메트로 가이드", visa: "메뉴얼 팁", explore: "정안구 탐색", placeholder: "Link에게 질문..." },
    FR: { greeting: "Salut, je suis Link !", sub: "web-link · warm-link · win-link", ask: "Questions populaires", workPermit: "Permis de travail", metro: "Guide du métro", visa: "Conseils visa", explore: "Explorer Jing'an", placeholder: "Demandez à Link..." },
    ES: { greeting: "¡Hola, soy Link!", sub: "web-link · warm-link · win-link", ask: "Preguntas populares", workPermit: "Permiso de trabajo", metro: "Guía del metro", visa: "Consejos de visa", explore: "Explorar Jing'an", placeholder: "Pregunta a Link..." },
    DE: { greeting: "Hallo, ich bin Link!", sub: "web-link · warm-link · win-link", ask: "Beliebte Fragen", workPermit: "Arbeitserlaubnis", metro: "U-Bahn Guide", visa: "Visum Tipps", explore: "Jing'an erkunden", placeholder: "Frag Link etwas..." },
    IT: { greeting: "Ciao, sono Link!", sub: "web-link · warm-link · win-link", ask: "Domande popolari", workPermit: "Permesso di lavoro", metro: "Guida Metro", visa: "Consigli Visto", explore: "Esplora Jing'an", placeholder: "Chiedi a Link..." },
    PT: { greeting: "Olá, sou o Link!", sub: "web-link · warm-link · win-link", ask: "Perguntas Populares", workPermit: "Permissão de trabalho", metro: "Guia do Metro", visa: "Dicas de Visto", explore: "Explorar Jing'an", placeholder: "Pergunte ao Link..." },
    RU: { greeting: "Привет, я Линк!", sub: "web-link · warm-link · win-link", ask: "Популярные вопросы", workPermit: "Разрешение на работу", metro: "Метро гид", visa: "Советы по визе", explore: "Изучить Цзиньань", placeholder: "Спроси Линка..." },
    AR: { greeting: "أهلاً، أنا لينك!", sub: "web-link · warm-link · win-link", ask: "أسئلة شائعة", workPermit: "تصريح العمل", metro: "دليل المترو", visa: "نصائح التأشيرة", explore: "استكشف جينغآن", placeholder: "اسأل لينك أي شيء..." }
  };

  const currentT = t[lang] || t['EN'];

  const shDecor = [
    { char: '🥟', top: '12%', left: '8%', scale: '1.2', delay: '0s' },
    { char: '🗼', top: '35%', left: '88%', scale: '1.5', delay: '2s' },
    { char: '🚲', top: '65%', left: '5%', scale: '1.1', delay: '1.5s' },
    { char: '☕', top: '85%', left: '20%', scale: '1.3', delay: '3s' },
    { char: '🏙️', top: '75%', left: '78%', scale: '1.4', delay: '0.5s' },
    { char: '✨', top: '20%', left: '70%', scale: '0.9', delay: '4s' },
    { char: '🥢', top: '50%', left: '15%', scale: '1.0', delay: '1s' },
    { char: '🏮', top: '5%', left: '80%', scale: '1.2', delay: '2.5s' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar bg-[#f6fcf9] dark:bg-[#0a140f] relative overflow-hidden">
      
      {/* Dynamic Vitality Background Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-15%] w-[100%] aspect-square rounded-full bg-primary/15 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-5%] left-[-20%] w-[90%] aspect-square rounded-full bg-blue-400/10 blur-[100px] animate-blob" style={{ animationDelay: '3s' }}></div>
        
        {/* SH Emoji Stream */}
        {shDecor.map((el, i) => (
          <div 
            key={i} 
            className="floating-emoji animate-float-slow text-2xl"
            style={{ 
                top: el.top, 
                left: el.left, 
                animationDelay: el.delay,
                transform: `scale(${el.scale})`
            }}
          >
            {el.char}
          </div>
        ))}
      </div>

      {/* FIXED Language Button to ensure visibility */}
      <button 
          onClick={() => setShowLangPicker(true)}
          className="fixed top-8 right-8 z-[60] size-12 rounded-2xl bg-white/20 backdrop-blur-3xl border border-white/40 flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all hover:bg-white/40 group overflow-hidden"
      >
          <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-700">translate</span>
      </button>

      {/* Header Section */}
      <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[4.5rem] shadow-[0_30px_70px_-15px_rgba(19,236,128,0.45)] relative z-10 overflow-hidden shrink-0">
        
        {/* Header Grid Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>

        <div className="flex justify-between items-start mb-4 relative z-20">
          <div className="flex flex-col group cursor-default pr-20"> {/* PR-20 to avoid language button */}
            <div className="flex items-center gap-3">
              <h1 className="text-white text-3xl font-black leading-none tracking-tighter transition-all group-hover:scale-105">SHANG HAI!</h1>
              <div className="flex gap-1 animate-bounce">
                <div className="size-2 rounded-full bg-white shadow-lg"></div>
                <div className="size-2 rounded-full bg-white/60 shadow-lg"></div>
              </div>
            </div>
            <h1 className="text-white text-6xl font-black leading-none italic mt-2 drop-shadow-2xl tracking-tighter shimmer-text animate-neon-shift">we Link!</h1>
            <div className="flex items-center gap-3 mt-4">
                <div className="h-[3px] w-10 bg-white/60 rounded-full"></div>
                <p className="text-white font-black text-[11px] tracking-[0.35em] uppercase opacity-90 whitespace-nowrap">{currentT.sub}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 relative z-10">
            {/* Live indicator removed here and moved to a better spot or just smaller */}
            <div className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[9px] text-white font-black uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        {/* AI Greeting Card */}
        <div className="flex items-center gap-5 bg-white/25 backdrop-blur-3xl p-5 rounded-[3.5rem] border border-white/45 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.2)] mt-12 relative z-20 animate-float-fast">
          <div className="size-16 rounded-[2rem] border-2 border-white bg-white overflow-hidden shadow-2xl shrink-0 relative group">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1AnjqkPoQm3pk-3kBpy77PCfjcc07Zlnpv4KgNiT4VZBC_YvZXFAgnfszjD5gYRcQ8AKG5tNiApQEfIJe4bjL5dP2uYBqK-NbYj07H-cC60gV85aAnOtQ6ebK6shs4tAtEPG0qJMPw-svNd8gylzgFUgBUtHPJsJsMN5oO8v8QoKdWgJwSj8_lK38sclH6lOz86DuHl2t9ANsHnIm_goxAjNsgLD3_WVL3aukvFRT2THSx2jSXX5UknXszs_L9D-0YQ0srpuDMiw" 
              className="size-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500" 
              alt="Link Avatar" 
            />
            <div className="absolute top-0 right-0 p-1">
                <div className="size-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-black text-2xl leading-none tracking-tight mb-1">{currentT.greeting}</h2>
            <p className="text-white/80 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5">
               <span className="material-symbols-outlined text-sm">rocket_launch</span>
               Link Guide AI
            </p>
          </div>
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-white">
             <span className="material-symbols-outlined font-black">bolt</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-6 -mt-12 relative z-30 mb-8 space-y-12 pb-10">
        <div className="glass rounded-[3.5rem] p-8 shadow-[0_35px_80px_-20px_rgba(0,0,0,0.15)] animate-slide-up stagger-1 border-t-4 border-primary">
          <h3 className="text-slate-900 dark:text-white text-2xl font-black mb-7 flex items-center gap-4">
            <div className="size-11 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <span className="material-symbols-outlined text-primary font-black text-2xl">star</span>
            </div>
            {currentT.ask}
          </h3>
          <div className="space-y-4">
            <ActionCard icon="work" label={currentT.workPermit} color="bg-orange-500" onClick={() => onChatStart(lang === 'CN' ? "如何申请上海工作许可？" : "How to apply for a Shanghai work permit?")}/>
            <ActionCard icon="directions_subway" label={currentT.metro} color="bg-blue-600" onClick={() => onChatStart(lang === 'CN' ? "上海地铁支付方式" : "Shanghai metro payment options")} />
            <ActionCard icon="badge" label={currentT.visa} color="bg-emerald-500" onClick={() => onChatStart(lang === 'CN' ? "上海工作签证流程" : "Shanghai work visa process")} />
          </div>
        </div>

        <div className="relative rounded-[3.5rem] aspect-[16/11] overflow-hidden shadow-2xl cursor-pointer active:scale-[0.96] transition-all group animate-slide-up stagger-2 border-2 border-transparent hover:border-primary/40" onClick={onCategorySelect}>
          <img src="https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop" className="absolute inset-0 size-full object-cover transition-transform duration-1000 group-hover:scale-110 z-0" alt="Artistic Shanghai" style={{ filter: 'grayscale(0.3) contrast(1.1) brightness(0.85) hue-rotate(160deg) saturate(1.1)', objectPosition: 'center bottom' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/95 via-transparent to-transparent z-10" />
          <div className="absolute top-8 right-8 z-20">
            <div className="bg-primary/95 text-[#0d1b14] px-7 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl animate-pulse flex items-center gap-2">
              <span className="material-symbols-outlined text-sm font-black">local_fire_department</span>
              Hot Zone
            </div>
          </div>
          <div className="absolute bottom-10 left-10 z-20 transition-all group-hover:translate-x-3">
            <div className="flex items-center gap-3 mb-4">
              <span className="size-3 bg-primary rounded-full animate-ping shadow-[0_0_20px_rgba(19,236,128,1)]"></span>
              <p className="text-primary text-[12px] font-black uppercase tracking-[0.5em] drop-shadow-2xl">{lang === 'EN' ? "CITY FAVORITE" : "城市热门"}</p>
            </div>
            <h4 className="text-white text-5xl font-black tracking-tighter drop-shadow-2xl leading-none italic">{currentT.explore}</h4>
            <p className="text-white/60 text-xs font-bold mt-3 tracking-widest uppercase">Click to dive in</p>
          </div>
        </div>
      </main>

      {/* Floating Chat Input Section */}
      <div className="px-6 pb-16 relative z-40 animate-slide-up stagger-3">
        <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-3xl p-3 rounded-full border border-white/70 dark:border-white/15 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.35)] flex items-center gap-3 group focus-within:ring-4 focus-within:ring-primary/30 transition-all">
          <div className="pl-6 flex items-center gap-3">
             <span className="material-symbols-outlined text-primary font-black text-2xl">chat_bubble</span>
             <button onClick={() => onChatStart()} className="text-slate-400 text-lg font-black text-left py-4 outline-none">
                {currentT.placeholder}
             </button>
          </div>
          <button onClick={() => onChatStart()} className="ml-auto size-16 rounded-full bg-primary text-[#0d1b14] flex items-center justify-center shadow-2xl shadow-primary/50 active:scale-90 hover:scale-110 transition-all group-hover:rotate-6">
            <span className="material-symbols-outlined font-black text-3xl">send</span>
          </button>
        </div>
      </div>

      {/* Language Picker Bottom Sheet */}
      {showLangPicker && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 bg-black/40 backdrop-blur-sm transition-all duration-300" onClick={() => setShowLangPicker(false)}>
          <div 
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-100 dark:border-white/10 flex justify-between items-center shrink-0">
              <h3 className="text-2xl font-black dark:text-white tracking-tighter italic">Select Language</h3>
              <button onClick={() => setShowLangPicker(false)} className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {languages.map((l) => (
                <button 
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setShowLangPicker(false);
                  }}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${lang === l.code ? 'bg-primary/20 border border-primary/40' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{l.flag}</span>
                    <span className={`text-lg font-black tracking-tight ${lang === l.code ? 'text-primary' : 'text-slate-800 dark:text-slate-100'}`}>
                      {l.name}
                    </span>
                  </div>
                  {lang === l.code && <span className="material-symbols-outlined text-primary font-black">check_circle</span>}
                </button>
              ))}
            </div>
            <div className="p-4 shrink-0">
               <div className="h-1.5 w-16 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-2"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionCard: React.FC<{ icon: string, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center p-5 bg-slate-50/80 dark:bg-zinc-800/60 rounded-[2.5rem] hover:bg-white dark:hover:bg-zinc-700 transition-all border-b-4 border-transparent hover:border-primary group hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] card-active text-left gap-5 h-auto min-h-[80px]"
  >
    <div className={`size-14 rounded-2xl flex items-center justify-center text-white ${color} shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0 self-center`}>
      <span className="material-symbols-outlined text-2xl font-bold">{icon}</span>
    </div>
    <div className="flex-1 min-w-0 flex items-center h-full">
      <span className="text-slate-800 dark:text-slate-100 font-black text-lg sm:text-xl tracking-tight leading-tight block truncate whitespace-normal">
        {label}
      </span>
    </div>
    <div className="flex items-center justify-center size-10 rounded-full bg-slate-100/90 dark:bg-zinc-800 transition-all group-hover:bg-primary group-hover:text-[#0d1b14] shrink-0 self-center">
        <span className="material-symbols-outlined transition-colors group-hover:font-black">arrow_forward</span>
    </div>
  </button>
);

export default HomeView;