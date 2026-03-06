
import React, { useState } from 'react';
import { AppLanguage, UserProfile } from '../types';

interface OnboardingSurveyProps {
  lang: AppLanguage;
  onComplete: (profile: UserProfile) => void;
}

const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ lang, onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    occupation: '',
    nationality: '',
    durationInSH: '',
    interests: []
  });
  const [customOccupation, setCustomOccupation] = useState('');

  const totalSteps = 4;

  const nationalities = [
    { id: 'China', label: 'China', flag: '🇨🇳' },
    { id: 'USA', label: 'USA', flag: '🇺🇸' },
    { id: 'UK', label: 'UK', flag: '🇬🇧' },
    { id: 'France', label: 'France', flag: '🇫🇷' },
    { id: 'Japan', label: 'Japan', flag: '🇯🇵' },
    { id: 'Korea', label: 'Korea', flag: '🇰🇷' },
    { id: 'Germany', label: 'Germany', flag: '🇩🇪' },
    { id: 'Canada', label: 'Canada', flag: '🇨🇦' },
    { id: 'Australia', label: 'Australia', flag: '🇦🇺' },
    { id: 'Italy', label: 'Italy', flag: '🇮🇹' },
    { id: 'Singapore', label: 'Singapore', flag: '🇸🇬' },
    { id: 'Other', label: 'Other', flag: '🏳️' },
  ];

  const occupations = [
    { id: 'tech', label: 'Tech / IT', cn: '科技 / 互联网', icon: 'terminal' },
    { id: 'finance', label: 'Finance', cn: '金融 / 银行', icon: 'payments' },
    { id: 'education', label: 'Education', cn: '教育 / 教师', icon: 'school' },
    { id: 'art', label: 'Creative / Art', cn: '创意 / 艺术', icon: 'palette' },
    { id: 'student', label: 'Student', cn: '学生', icon: 'book' },
    { id: 'hospitality', label: 'Hospitality', cn: '酒店 / 餐饮', icon: 'hotel' },
    { id: 'entrepreneur', label: 'Entrepreneur', cn: '创业者', icon: 'rocket_launch' },
    { id: 'other', label: 'Other', cn: '其他', icon: 'more_horiz' },
  ];

  const durations = [
    { id: 'new', label: 'Just Arrived (< 1 month)', cn: '刚到上海 (< 1个月)' },
    { id: 'settling', label: 'Settling In (1-6 months)', cn: '逐渐适应 (1-6个月)' },
    { id: 'resident', label: 'Resident (1-3 years)', cn: '定居 (1-3年)' },
    { id: 'veteran', label: 'City Veteran (3+ years)', cn: '资深市民 (3年以上)' },
  ];

  const interestOptions = [
    { id: 'brunch', label: 'Brunch', icon: 'egg_alt' },
    { id: 'nightlife', label: 'Nightlife', icon: 'nightlife' },
    { id: 'tech', label: 'Tech-Talk', icon: 'terminal' },
    { id: 'art', label: 'Art Gallery', icon: 'palette' },
    { id: 'fitness', label: 'Fitness', icon: 'fitness_center' },
    { id: 'coffee', label: 'Coffee', icon: 'local_cafe' },
    { id: 'jazz', label: 'Jazz', icon: 'music_note' },
    { id: 'cycling', label: 'Cycling', icon: 'directions_bike' },
    { id: 'history', label: 'Old SH History', icon: 'history_edu' },
    { id: 'fashion', label: 'Fashion', icon: 'apparel' },
    { id: 'wine', label: 'Wine Tasting', icon: 'wine_bar' },
    { id: 'photo', label: 'Photography', icon: 'photo_camera' },
    { id: 'food', label: 'Local Food', icon: 'bakery_dining' },
    { id: 'travel', label: 'Weekend Getaway', icon: 'train' },
    { id: 'pets', label: 'Pet Friendly', icon: 'pets' },
    { id: 'wellness', label: 'Spa & Wellness', icon: 'spa' },
    { id: 'hiking', label: 'Hiking', icon: 'terrain' },
    { id: 'yoga', label: 'Yoga & Zen', icon: 'self_improvement' },
    { id: 'gaming', label: 'Gaming', icon: 'sports_esports' },
    { id: 'cooking', label: 'Cooking', icon: 'cooking' },
    { id: 'livemusic', label: 'Live Music', icon: 'mic_external_on' },
    { id: 'museum', label: 'Museums', icon: 'account_balance' },
    { id: 'skating', label: 'Skating', icon: 'skateboarding' },
    { id: 'volunteer', label: 'Volunteer', icon: 'volunteer_activism' },
  ];

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      const finalProfile = {
        ...profile,
        occupation: profile.occupation === 'other' ? customOccupation : profile.occupation
      };
      onComplete(finalProfile);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled = () => {
    if (step === 1) return !profile.nationality;
    if (step === 2) {
      if (!profile.occupation) return true;
      if (profile.occupation === 'other' && !customOccupation.trim()) return true;
      return false;
    }
    if (step === 3) return !profile.durationInSH;
    if (step === 4) return profile.interests.length < 2;
    return false;
  };

  const content = {
    EN: {
      sub: "Tell us a bit about yourself so Link can guide you better.",
      step1Title: "Where are you from?",
      step2Title: "What do you do?",
      step3Title: "City Experience",
      step4Title: "What's your vibe?",
      step4Sub: "SELECT AT LEAST 2 INTERESTS TO UNLOCK CITY PICKS.",
      next: "Continue",
      back: "Go Back",
      finish: "Unlock My Shanghai",
      customOccPlaceholder: "Type your occupation...",
    },
    CN: {
      sub: "填写简单的信息，让 Link 为您提供更精准的城市指南。",
      step1Title: "您的国籍是？",
      step2Title: "您的职业是？",
      step3Title: "在沪时间",
      step4Title: "您的兴趣点",
      step4Sub: "选择至少 2 个兴趣标签来定制您的推荐。",
      next: "下一步",
      back: "返回",
      finish: "开启我的上海之旅",
      customOccPlaceholder: "请输入您的职业...",
    }
  }[lang === 'CN' ? 'CN' : 'EN'];

  return (
    <div className="fixed inset-0 z-[200] bg-background-light dark:bg-background-dark flex flex-col items-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] size-96 bg-primary/20 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-5%] left-[-10%] size-80 bg-blue-400/10 blur-[100px] animate-blob" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md h-full flex flex-col p-8 pt-10 sm:pt-14">
        <div className="flex gap-2 mb-6 sm:mb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          {step === 1 && (
            <div className="animate-slide-up space-y-6">
              <div className="space-y-2">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{content.step1Title}</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">{content.sub}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {nationalities.map(n => (
                  <button 
                    key={n.id}
                    onClick={() => setProfile(prev => ({...prev, nationality: n.id}))}
                    className={`flex items-center gap-3 p-4 rounded-[1.5rem] border-2 transition-all ${profile.nationality === n.id ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-[1.02]' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5'}`}
                  >
                    <span className="text-xl">{n.flag}</span>
                    <span className={`text-sm font-black tracking-tight ${profile.nationality === n.id ? 'text-[#0d1b14]' : 'text-slate-700 dark:text-slate-300'}`}>{n.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up space-y-6">
              <div className="space-y-2">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{content.step2Title}</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">{content.sub}</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {occupations.map(o => (
                    <button 
                      key={o.id}
                      onClick={() => setProfile(prev => ({...prev, occupation: o.id}))}
                      className={`flex items-center gap-5 p-4 rounded-[1.8rem] border-2 transition-all ${profile.occupation === o.id ? 'bg-primary border-primary shadow-xl shadow-primary/20' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5'}`}
                    >
                      <div className={`size-10 rounded-2xl flex items-center justify-center ${profile.occupation === o.id ? 'bg-[#0d1b14]/10' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined font-black text-xl">{o.icon}</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className={`text-base font-black tracking-tight ${profile.occupation === o.id ? 'text-[#0d1b14]' : 'text-slate-800 dark:text-slate-200'}`}>{o.label}</p>
                        <p className={`text-[10px] font-bold opacity-60 ${profile.occupation === o.id ? 'text-[#0d1b14]' : ''}`}>{o.cn}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {profile.occupation === 'other' && (
                  <div className="mt-4 animate-in slide-in-from-top fade-in duration-300">
                    <input 
                      autoFocus
                      type="text"
                      value={customOccupation}
                      onChange={(e) => setCustomOccupation(e.target.value)}
                      placeholder={content.customOccPlaceholder}
                      className="w-full bg-white dark:bg-zinc-800 border-2 border-primary/40 rounded-[1.5rem] px-6 py-4 text-base font-bold shadow-lg focus:border-primary outline-none transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up space-y-6">
              <div className="space-y-2">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none">{content.step3Title}</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">{lang === 'CN' ? '您在上海生活多久了？' : 'How long have you lived in Shanghai?'}</p>
              </div>

              <div className="space-y-3">
                {durations.map(d => (
                  <button 
                    key={d.id}
                    onClick={() => setProfile(prev => ({...prev, durationInSH: d.id}))}
                    className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${profile.durationInSH === d.id ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-[1.02]' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300'}`}
                  >
                    <span className={`text-base font-black tracking-tight ${profile.durationInSH === d.id ? 'text-[#0d1b14]' : ''}`}>{lang === 'CN' ? d.cn : d.label}</span>
                    {profile.durationInSH === d.id && <span className="material-symbols-outlined text-[#0d1b14] font-black">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-slide-up space-y-4">
              <div className="space-y-1">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-tight">{content.step4Title}</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">{content.step4Sub}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-12">
                {interestOptions.map(i => (
                  <button 
                    key={i.id}
                    onClick={() => handleInterestToggle(i.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 h-32 rounded-[2rem] border-2 transition-all group ${profile.interests.includes(i.id) ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-[1.03]' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/5'}`}
                  >
                    <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${profile.interests.includes(i.id) ? 'bg-[#0d1b14]/10 text-[#0d1b14]' : 'bg-primary/10 text-primary'}`}>
                      <span className="material-symbols-outlined text-3xl font-black">{i.icon}</span>
                    </div>
                    <span className={`text-[11px] font-black tracking-tighter uppercase text-center w-full truncate px-1 ${profile.interests.includes(i.id) ? 'text-[#0d1b14]' : 'text-slate-500 dark:text-slate-400'}`}>
                      {i.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex gap-3 shrink-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="flex-1 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 text-slate-500 font-black text-sm active:scale-95 transition-all"
            >
              {content.back}
            </button>
          )}
          <button 
            disabled={isNextDisabled()}
            onClick={nextStep}
            className={`flex-[2] py-4 rounded-[1.8rem] font-black text-base shadow-2xl active:scale-95 transition-all ${isNextDisabled() ? 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed' : 'bg-primary text-[#0d1b14] shadow-primary/40'}`}
          >
            {step === totalSteps ? content.finish : content.next}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSurvey;
