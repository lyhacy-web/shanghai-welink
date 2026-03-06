
import React, { useState } from 'react';
import { AppLanguage } from '../types';

interface ProfileViewProps {
  lang: AppLanguage;
  onEditProfile: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ lang, onEditProfile }) => {
  const [activeSubView, setActiveSubView] = useState<string | null>(null);

  // Added missing language variants to fix the Record type error
  const t: Record<AppLanguage, any> = {
    EN: { name: "City Adventurer", lv: "Lvl 10 Pioneer", acc: "Account Details", saved: "My Favorites", creds: "Welink Points", set: "Settings", out: "Sign Out", tagline: "web-link · warm-link · win-link" },
    CN: { name: "城市探险者", lv: "10级先锋向导", acc: "个人中心", saved: "我的收藏", creds: "Welink 积分", set: "通用设置", out: "退出登录", tagline: "web-link · warm-link · win-link" },
    JP: { name: "都市冒険家", lv: "レベル10ガイド", acc: "アカウント詳細", saved: "お気に入り", creds: "Welink クレジット", set: "設定", out: "サインアウト", tagline: "web-link · warm-link · win-link" },
    KR: { name: "도시 모험가", lv: "레벨 10 가이드", acc: "계정 상세", saved: "즐겨찾기", creds: "Welink 크레딧", set: "설정", out: "로그아웃", tagline: "web-link · warm-link · win-link" },
    FR: { name: "Aventurier", lv: "Pionnier Niv 10", acc: "Compte", saved: "Favoris", creds: "Crédits", set: "Paramètres", out: "Déconnexion", tagline: "web-link · warm-link · win-link" },
    ES: { name: "Aventurero", lv: "Pionero Nivel 10", acc: "Cuenta", saved: "Favoritos", creds: "Créditos", set: "Ajustes", out: "Salir", tagline: "web-link · warm-link · win-link" },
    DE: { name: "Stadtabenteurer", lv: "Pionier Stufe 10", acc: "Kontodetails", saved: "Favoriten", creds: "Welink-Punkte", set: "Einstellungen", out: "Abmelden", tagline: "web-link · warm-link · win-link" },
    IT: { name: "Avventuriero Urbano", lv: "Pioniere Liv 10", acc: "Dettagli Account", saved: "Preferiti", creds: "Punti Welink", set: "Impostazioni", out: "Disconnetti", tagline: "web-link · warm-link · win-link" },
    PT: { name: "Aventureiro Urbano", lv: "Pioneiro Nível 10", acc: "Detalhes da Conta", saved: "Favoritos", creds: "Pontos Welink", set: "Configurações", out: "Sair", tagline: "web-link · warm-link · win-link" },
    RU: { name: "Городской исследователь", lv: "Пионер 10-го уровня", acc: "Детали аккаунта", saved: "Избранное", creds: "Баллы Welink", set: "Настройки", out: "Выйти", tagline: "web-link · warm-link · win-link" },
    AR: { name: "مكتشف المدينة", lv: "رائد مستوى 10", acc: "تفاصيل الحساب", saved: "مفضلاتي", creds: "نقاط Welink", set: "الإعدادات", out: "تسجيل الخروج", tagline: "web-link · warm-link · win-link" }
  };

  const currentT = t[lang] || t['EN'];

  return (
    <div className="flex flex-col h-full bg-[#f6fcf9] dark:bg-[#0a140f] overflow-hidden relative">
      
      {/* Background Decor Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[30%] left-[-10%] size-72 bg-primary/15 blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[-10%] size-60 bg-blue-400/10 blur-[80px] animate-blob" style={{ animationDelay: '3s' }}></div>
        <span className="absolute top-[40%] right-[10%] text-4xl opacity-[0.1] animate-float">🧗</span>
        <span className="absolute bottom-[10%] left-[15%] text-3xl opacity-[0.1] animate-float" style={{ animationDelay: '2s' }}>🎒</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 relative z-10">
        <header className="p-10 pb-24 bg-primary rounded-b-[4.5rem] shadow-[0_25px_50px_-12px_rgba(19,236,128,0.3)] flex flex-col items-center relative overflow-hidden">
          {/* Animated Background Text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] rotate-12 select-none pointer-events-none">
            <h1 className="text-white text-[130px] font-black whitespace-nowrap">we Link!</h1>
          </div>
          
          <div className="size-32 rounded-[2.5rem] border-4 border-white p-1.5 bg-white shadow-2xl relative z-10 group rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="size-full rounded-[2rem] bg-cover bg-center shadow-inner" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBec6QstvBcsp7IjIxA8NzP9FM944pZm98ROmF9xVhBFJeXxdC7PytKRIkrDSJcp5bhNXANMjW00IDwhCklXY2jYsQRKTMozR4yXPpg3FrFFuCnHb1I2vid0RvmsqhNaNSRCQeA33VSqBrZhoO55FaSrWtZaX7nSpYEa56_lqXXqU_6ixx8kWM7RjAtfHf5EWMAku3G9h0IOjMhml-xOSAxcgEv1L0gNPLlvSxBSdVnBoHt6dbAqvHCcIk-S_M8qJ8ai53-fMrdwEQ")` }} />
            <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl p-2 shadow-xl animate-bounce">
              <span className="material-symbols-outlined text-primary font-black">verified_user</span>
            </div>
          </div>
          
          {/* 修复：取消 shimmer 效果，增强字体清晰度 */}
          <h2 className="mt-8 text-4xl font-black text-[#0d1b14] leading-none relative z-10 tracking-tighter italic drop-shadow-sm">City Explorer</h2>
          <div className="mt-4 px-5 py-1.5 bg-[#0d1b14]/10 rounded-full backdrop-blur-md relative z-10">
            <p className="text-[#0d1b14] font-black text-[11px] uppercase tracking-[0.3em]">{currentT.lv}</p>
          </div>
        </header>

        <div className="px-8 -mt-14 space-y-6 relative z-20">
          <div className="glass dark:bg-zinc-900/80 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/60 dark:border-white/5 overflow-hidden animate-slide-up">
            <ProfileItem icon="person" label={currentT.acc} onClick={() => setActiveSubView('Account Details')} />
            <ProfileItem icon="favorite" label={currentT.saved} onClick={() => setActiveSubView('Favorites')} />
            <ProfileItem icon="token" label={currentT.creds} onClick={() => setActiveSubView('Points')} />
            <ProfileItem icon="settings" label={currentT.set} onClick={() => setActiveSubView('Settings')} />
            <ProfileItem icon="logout" label={currentT.out} color="text-rose-500" onClick={() => alert('Signing out...')} />
          </div>

          <div className="pt-16 pb-8 flex flex-col items-center animate-slide-up stagger-1">
             <div className="flex items-center gap-4 mb-3 opacity-40">
               <h1 className="text-primary text-2xl font-black italic tracking-tighter">we Link!</h1>
               <div className="size-1.5 bg-slate-300 rounded-full"></div>
               <p className="text-[10px] font-black tracking-[0.4em] text-slate-300 uppercase">V 2.6.0</p>
             </div>
             <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em]">{currentT.tagline}</p>
          </div>
        </div>
      </div>

      {/* Detail Overlay */}
      {activeSubView && (
        <div className="absolute inset-0 z-[60] bg-[#f6fcf9] dark:bg-[#0a140f] animate-in slide-in-from-right duration-500 flex flex-col">
          <header className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center gap-5">
            <button onClick={() => setActiveSubView(null)} className="size-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center active:scale-90 transition-all hover:bg-primary/20 hover:text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h3 className="text-2xl font-black dark:text-white tracking-tighter italic">{activeSubView}</h3>
          </header>
          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
            {activeSubView === 'Account Details' && (
              <div className="space-y-6 animate-slide-up">
                 <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-slate-50 dark:border-white/5">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Membership Profile</p>
                    <div className="space-y-4">
                       <AccountInfoRow label="Display Name" value="Shanghai Explorer" />
                       <AccountInfoRow label="UID" value="8821-0012-SH" />
                       <AccountInfoRow label="Member Since" value="Jan 2024" />
                       <AccountInfoRow label="Current Zone" value="Jing'an District" />
                       <AccountInfoRow label="Email" value="expl***@welink.sh" />
                    </div>
                 </div>
                 <button 
                   onClick={onEditProfile}
                   className="w-full py-5 bg-primary text-[#0d1b14] font-black rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
                 >
                   Edit Profile
                 </button>
              </div>
            )}
            {activeSubView === 'Favorites' && (
              <div className="space-y-5 animate-slide-up">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Collection Feed</p>
                <FavCard icon="local_cafe" name="Seesaw Coffee" loc="Jing'an · Food" />
                <FavCard icon="view_in_ar" name="Xuhui Luxury Loft" loc="Xuhui · Housing" />
                <FavCard icon="palette" name="M50 Gallery" loc="Putuo · Art" />
              </div>
            )}
            {activeSubView === 'Points' && (
              <div className="flex flex-col items-center py-12 animate-slide-up">
                <div className="size-52 rounded-full border-[12px] border-primary/20 flex flex-col items-center justify-center mb-10 shadow-2xl relative">
                  <div className="absolute inset-0 rounded-full border-[4px] border-primary animate-ping opacity-20"></div>
                  <span className="text-6xl font-black tracking-tighter italic shimmer-text">2,450</span>
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] mt-2 opacity-60">Total Points</span>
                </div>
                <div className="w-full space-y-4">
                  <PointRow label="Check-in Reward" val="+50" />
                  <PointRow label="Community Guide" val="+200" />
                  <PointRow label="Feedback Bonus" val="+100" />
                </div>
              </div>
            )}
            {activeSubView === 'Settings' && (
              <div className="space-y-5 animate-slide-up">
                <SettingToggle label="Dark Mode" active={true} />
                <SettingToggle label="Smart Notifications" active={true} />
                <SettingToggle label="Precision Location" active={false} />
                <SettingToggle label="Language Auto-Detect" active={true} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AccountInfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-white/5 last:border-0">
    <span className="text-sm font-bold text-gray-400">{label}</span>
    <span className="text-sm font-black dark:text-white">{value}</span>
  </div>
);

const ProfileItem: React.FC<{ icon: string; label: string; onClick: () => void; color?: string }> = ({ icon, label, onClick, color = "text-slate-800 dark:text-slate-200" }) => (
  <button onClick={onClick} className="flex w-full items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-slate-50 last:border-b-0 group">
    <div className="flex items-center gap-6">
      <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:rotate-6 shadow-sm"><span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span></div>
      <span className={`font-black text-lg tracking-tight ${color}`}>{label}</span>
    </div>
    <div className="size-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-primary transition-all">
        <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0d1b14] group-hover:font-black group-hover:translate-x-0.5 transition-all">chevron_right</span>
    </div>
  </button>
);

const FavCard: React.FC<{ icon: string; name: string; loc: string }> = ({ icon, name, loc }) => (
  <div className="p-5 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-50 dark:border-white/5 shadow-xl flex items-center gap-5 hover:shadow-primary/10 transition-shadow">
    <div className="size-16 bg-primary/20 rounded-[1.5rem] flex items-center justify-center"><span className="material-symbols-outlined text-primary text-3xl">{icon}</span></div>
    <div><p className="font-black text-lg dark:text-white tracking-tight">{name}</p><p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">{loc}</p></div>
    <button className="ml-auto size-10 rounded-full border border-slate-100 dark:border-zinc-800 flex items-center justify-center text-rose-500"><span className="material-symbols-outlined">favorite</span></button>
  </div>
);

const PointRow: React.FC<{ label: string; val: string }> = ({ label, val }) => (
  <div className="flex justify-between p-5 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-slate-50 dark:border-white/5">
    <span className="font-black tracking-tight dark:text-white">{label}</span>
    <span className="text-primary font-black italic tracking-tighter">{val}</span>
  </div>
);

const SettingToggle: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex justify-between items-center p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-50 dark:border-white/5 shadow-xl">
    <span className="font-black text-lg tracking-tight dark:text-white">{label}</span>
    <div className={`w-14 h-8 rounded-full p-1.5 transition-colors cursor-pointer ${active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200'}`}>
        <div className={`size-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </div>
  </div>
);

export default ProfileView;
