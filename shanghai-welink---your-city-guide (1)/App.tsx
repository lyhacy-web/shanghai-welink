
import React, { useState, useEffect } from 'react';
import { ViewType, Message, AppLanguage, UserProfile } from './types';
import HomeView from './components/HomeView';
import ExploreView from './components/ExploreView';
import ConnectView from './components/ConnectView';
import ChatView from './components/ChatView';
import ProfileView from './components/ProfileView';
import OnboardingSurvey from './components/OnboardingSurvey';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [sourceView, setSourceView] = useState<ViewType>(ViewType.HOME);
  const [lang, setLang] = useState<AppLanguage>('EN');
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Ni hao! I'm Link. Welcome to Shanghai! ✨ How can I make your day amazing today?",
      timestamp: Date.now()
    }
  ]);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('welink_user_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        // Ensure profile is complete before hiding onboarding
        if (profile.nationality && profile.occupation && profile.durationInSH && profile.interests?.length >= 2) {
          setUserProfile(profile);
          setShowOnboarding(false);
          return;
        }
      }
    } catch (e) {
      console.error("Profile load error:", e);
    }
    setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('welink_user_profile', JSON.stringify(profile));
    setShowOnboarding(false);
  };

  const navigateTo = (view: ViewType, prompt: string | null = null) => {
    setSourceView(currentView);
    setInitialChatPrompt(prompt);
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewType.HOME:
        return <HomeView lang={lang} setLang={setLang} onChatStart={(p) => navigateTo(ViewType.CHAT, p)} onCategorySelect={() => navigateTo(ViewType.EXPLORE)} />;
      case ViewType.EXPLORE:
        return <ExploreView />;
      case ViewType.CONNECT:
        return <ConnectView lang={lang} userProfile={userProfile} onAiChatStart={(p) => navigateTo(ViewType.CHAT, p)} />;
      case ViewType.CHAT:
        return (
          <ChatView 
            lang={lang}
            userProfile={userProfile}
            history={chatHistory} 
            setHistory={setChatHistory} 
            onBack={() => navigateTo(sourceView)} 
            initialPrompt={initialChatPrompt}
            clearInitialPrompt={() => setInitialChatPrompt(null)}
          />
        );
      case ViewType.PROFILE:
        return <ProfileView lang={lang} onEditProfile={() => setShowOnboarding(true)} />;
      default:
        return <HomeView lang={lang} setLang={setLang} onChatStart={(p) => navigateTo(ViewType.CHAT, p)} onCategorySelect={() => navigateTo(ViewType.EXPLORE)} />;
    }
  };

  const labels: Record<string, any> = {
    EN: { home: 'Home', explore: 'Explore', connect: 'Connect', me: 'Me' },
    CN: { home: '首页', explore: '发现', connect: '社区', me: '我的' },
    JP: { home: 'ホーム', explore: '探探', connect: 'つながる', me: 'マイ' },
    KR: { home: '홈', explore: '탐색', connect: '커넥트', me: '프로필' },
    FR: { home: 'Accueil', explore: 'Explorer', connect: 'Connecter', me: 'Moi' },
    ES: { home: 'Inicio', explore: 'Explorar', connect: 'Conectar', me: 'Mi' },
    DE: { home: 'Start', explore: 'Entdecken', connect: 'Verbinden', me: 'Ich' },
    IT: { home: 'Home', explore: 'Esplora', connect: 'Connetti', me: 'Io' },
    PT: { home: 'Início', explore: 'Explorar', connect: 'Conectar', me: 'Eu' },
    RU: { home: 'Главная', explore: 'Обзор', connect: 'Связь', me: 'Я' },
    AR: { home: 'الرئيسية', explore: 'استكشف', connect: 'تواصل', me: 'أنا' }
  };

  const currentLabels = labels[lang] || labels['EN'];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-white dark:bg-[#0a140f] shadow-2xl transition-colors duration-300 font-display">
      
      {showOnboarding && (
        <OnboardingSurvey lang={lang} onComplete={handleOnboardingComplete} />
      )}

      <div className="flex-1 relative overflow-hidden">
        {renderView()}
      </div>

      {!showOnboarding && currentView !== ViewType.CHAT && (
        <nav className="flex justify-around items-center bg-white/95 dark:bg-[#0a140f]/95 backdrop-blur-xl py-3 px-6 border-t border-slate-100 dark:border-white/5 z-50">
          <NavItem icon="home" label={currentLabels.home} active={currentView === ViewType.HOME} onClick={() => navigateTo(ViewType.HOME)} />
          <NavItem icon="grid_view" label={currentLabels.explore} active={currentView === ViewType.EXPLORE} onClick={() => navigateTo(ViewType.EXPLORE)} />
          <NavItem icon="forum" label={currentLabels.connect} active={currentView === ViewType.CONNECT} onClick={() => navigateTo(ViewType.CONNECT)} />
          <NavItem icon="person" label={currentLabels.me} active={currentView === ViewType.PROFILE} onClick={() => navigateTo(ViewType.PROFILE)} />
        </nav>
      )}
      
      {!showOnboarding && (
        <div className="bg-white dark:bg-[#0a140f] pb-2 flex justify-center">
          <div className="w-32 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
    <span className={`material-symbols-outlined text-[28px] ${active ? 'fill-[1]' : ''}`}>{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
