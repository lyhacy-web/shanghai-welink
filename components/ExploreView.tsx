import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppLanguage, UserProfile } from '../types';

interface ExploreViewProps {
  lang: AppLanguage;
  userProfile: UserProfile | null;
}

const ExploreView: React.FC<ExploreViewProps> = ({ lang, userProfile }) => {
  const [activeCategory, setActiveCategory] = useState('Housing');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const t: Partial<Record<AppLanguage, any>> = {
    EN: { title: "city picks", subtitle: "SH Welink", search: "Housing, health, schools...", housing: "Housing", health: "Healthcare", edu: "Education", vr: "3D Housing Preview", seeAll: "See all", liveVr: "Live VR" },
    CN: { title: "城市精选", subtitle: "SH Welink", search: "住房、医疗、教育...", housing: "住房", health: "医疗", edu: "教育", vr: "3D 住房预览", seeAll: "查看全部", liveVr: "实景 VR" },
    JP: { title: "都市の選択", subtitle: "SH Welink", search: "住宅、健康、学校...", housing: "住宅", health: "医療", edu: "教育", vr: "3D 住宅プレビュー", seeAll: "すべて表示", liveVr: "ライブ VR" },
    KR: { title: "도시 선택", subtitle: "SH Welink", search: "주택, 건강, 학교...", housing: "주택", health: "의료", edu: "교육", vr: "3D 주택 미리보기", seeAll: "모두 보기", liveVr: "라이브 VR" },
    FR: { title: "Sélection", subtitle: "SH Welink", search: "Logement, santé, écoles...", housing: "Logement", health: "Santé", edu: "Éducation", vr: "Aperçu 3D", seeAll: "Tout voir", liveVr: "VR en direct" },
    ES: { title: "Selección", subtitle: "SH Welink", search: "Vivienda, salud, escuelas...", housing: "Vivienda", health: "Salud", edu: "Educación", vr: "Vista 3D", seeAll: "Ver todo", liveVr: "VR en vivo" },
  };

  const currentT = t[lang] || t.EN;

  const housingRef = useRef<HTMLDivElement>(null);
  const healthcareRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>, category: string) => {
    setActiveCategory(category);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const closeModal = () => setSelectedItem(null);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-1/4 right-[-10%] size-64 bg-primary/10 blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-[-10%] size-80 bg-blue-400/5 blur-[120px] animate-blob pointer-events-none" style={{ animationDelay: '3s' }}></div>

      {/* Consolidated Sticky Header Section */}
      <div className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-100 dark:border-white/5 shadow-sm">
        {/* Top Header */}
        <div className="flex items-center p-5 pb-2 justify-between">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex size-11 shrink-0 items-center"
          >
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-2xl size-10 border-2 border-primary shadow-lg animate-pulse-glow"
              style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCG2uax_7EgixMasAX0mnZCpjvG2FGHY_JjuoDu7vgzb0T3dtuFM8_xufhzS6CAw7mfrYTB7MFm_NkEhxDoWfZv52BYo6z3_f_jGHD3iQBYhHEDDvr7qNKlbE8F69mTjVGGfGN1RWrxPyaXZJbDVtPRT8kQs2NOPROzF-Wl2L3lTpQ8J33FPGcZBQ9bMrfx_NfnN65fI0724sD2nkvYBZma-u8KgYKaK9qrEl6r8SwslewP8qMUpsNUkpztJHV1NWV4gFvwRAKtNu0")` }}
            />
          </motion.div>
          <div className="flex flex-col items-center flex-1">
            <h2 className="text-[#0d1b14] dark:text-white text-2xl font-black tracking-tighter italic leading-none drop-shadow-sm">{currentT?.title || 'city picks'}</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">{currentT?.subtitle || 'SH Welink'}</p>
          </div>
          <div className="w-11"></div>
        </div>

        {/* Compact Search Bar */}
        <div className="px-5 py-3">
          <div className="flex w-full items-center rounded-2xl bg-white dark:bg-zinc-800 shadow-xl border border-slate-100 dark:border-white/10 px-5 py-3 group focus-within:ring-2 focus-within:ring-primary/30 transition-all">
            <span className="material-symbols-outlined text-primary text-[22px] animate-sparkle">search</span>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 pl-3 text-slate-900 dark:text-white font-bold placeholder:text-slate-400" 
              placeholder={currentT?.search || "Housing, health, schools..."}
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-4 px-5 py-4 overflow-x-auto no-scrollbar">
          <CategoryChip active={activeCategory === 'Housing'} icon="home" label={currentT?.housing || "Housing"} onClick={() => scrollTo(housingRef, 'Housing')} />
          <CategoryChip active={activeCategory === 'Healthcare'} icon="medical_services" label={currentT?.health || "Healthcare"} onClick={() => scrollTo(healthcareRef, 'Healthcare')} />
          <CategoryChip active={activeCategory === 'Education'} icon="school" label={currentT?.edu || "Education"} onClick={() => scrollTo(educationRef, 'Education')} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-5 space-y-12">
        {/* Housing VR Section */}
        <motion.div 
          ref={housingRef} 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="scroll-mt-48 pt-6"
        >
          <SectionHeader title={currentT?.vr || "3D Housing Preview"} linkText={currentT?.seeAll || "See all"} />
          <div className="mt-5">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col rounded-[2.5rem] shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden cursor-pointer transition-all group border border-slate-50 dark:border-white/5"
              onClick={() => setSelectedItem({
                type: 'housing',
                title: "Jing'an Luxury Lofts",
                price: "¥18,000/mo",
                location: "Jing'an District · 5 min to Metro",
                desc: "Beautifully designed industrial lofts with floor-to-ceiling windows and smart home integration.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB14kTXkJIpzi9cT7v12x4F51xFIl-MtsFOXEEuAGchM3XVPDeBFFMGX6fCl5XCzi-M5ClKuE_l8LG9mK1VtxixacEyxkhPMdSRj-XCa2MUHvGzPUAgnbl-deRXcXU4QV-KfSTVhHocmsOCM2dCYriGsqaMlgFHqszsrV6mm7vFfr33tF30648zm8W1MyqeEA-6QYs8U6xy_e3l6rUC8f3Ddxnq-1cdZroqw3D8gcs22mzP0z8-MbEoLJtQlFVhxot79IfLtoqq2kA"
              })}
            >
              <div 
                className="relative w-full aspect-[16/9] bg-center bg-cover overflow-hidden"
                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB14kTXkJIpzi9cT7v12x4F51xFIl-MtsFOXEEuAGchM3XVPDeBFFMGX6fCl5XCzi-M5ClKuE_l8LG9mK1VtxixacEyxkhPMdSRj-XCa2MUHvGzPUAgnbl-deRXcXU4QV-KfSTVhHocmsOCM2dCYriGsqaMlgFHqszsrV6mm7vFfr33tF30648zm8W1MyqeEA-6QYs8U6xy_e3l6rUC8f3Ddxnq-1cdZroqw3D8gcs22mzP0z8-MbEoLJtQlFVhxot79IfLtoqq2kA")` }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-700"></div>
                <div className="absolute top-4 left-4 bg-primary/95 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl animate-pulse">
                  <span className="material-symbols-outlined text-sm font-black">view_in_ar</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Live VR</span>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <p className="text-primary text-[10px] font-black tracking-widest uppercase mb-1">Featured Elite</p>
                    <span className="text-primary font-black italic text-lg tracking-tighter">¥18,000<span className="text-[10px] opacity-60 ml-0.5">/mo</span></span>
                </div>
                <p className="text-[#0d1b14] dark:text-white text-2xl font-black tracking-tighter leading-none mb-1">Jing'an Lofts</p>
                <div className="flex items-center gap-1.5 mt-2">
                    <div className="size-2 rounded-full bg-primary animate-ping"></div>
                    <p className="text-gray-400 text-xs font-bold">500m to Metro Line 2/7</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Healthcare Section */}
        <motion.div 
          ref={healthcareRef} 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="scroll-mt-48"
        >
          <SectionHeader title="Healthcare Elite" icon="filter_list" />
          <div className="mt-5 space-y-5">
            <MedicalCard 
              title="Jiahui International" 
              location="Xuhui · Global Standard" 
              tag="TOP CHOICE" 
              tags={['Billing Integration', 'Multilingual']}
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuCvqaLcMUKPwfDrLgJf-I65sezOKAWs8xExGc0LrdKWanPiKA0iYyGROxNjfM_o3CwzG5r2KpiNcGriJwALzliyQI3u5XZQ-q7LKeKeBM0Q5KeGQQA5gj-p_Xn9j4RXGDQEk9cJ3-wR8l7Z9mOsqA-MDSAknmbi80K1ROaFRyq0UNadhNBDXCVMGN0Wm8GYjoSh1DVKPloHGFLTHVw9U9qgqGz1qWoIH3yM1sMtw_uFxwU2uWHDfd8sGyf35TFE8LEDGTQHkj3ZpfA"
              onClick={() => setSelectedItem({
                type: 'medical',
                title: "Jiahui Health",
                location: "689 Guiping Rd, Xuhui",
                tags: ["English", "Direct Billing", "24/7 ER"],
                desc: "Premier international hospital group providing end-to-end healthcare with international teams.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvqaLcMUKPwfDrLgJf-I65sezOKAWs8xExGc0LrdKWanPiKA0iYyGROxNjfM_o3CwzG5r2KpiNcGriJwALzliyQI3u5XZQ-q7LKeKeBM0Q5KeGQQA5gj-p_Xn9j4RXGDQEk9cJ3-wR8l7Z9mOsqA-MDSAknmbi80K1ROaFRyq0UNadhNBDXCVMGN0Wm8GYjoSh1DVKPloHGFLTHVw9U9qgqGz1qWoIH3yM1sMtw_uFxwU2uWHDfd8sGyf35TFE8LEDGTQHkj3ZpfA"
              })}
            />
          </div>
        </motion.div>

        {/* Education Section */}
        <motion.div 
          ref={educationRef} 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="scroll-mt-48 pb-12"
        >
          <SectionHeader title="Global Education" />
          <div className="flex gap-5 mt-5 overflow-x-auto no-scrollbar pb-8">
            <SchoolCard 
              curriculum="IB World" 
              name="SCIS Hongqiao Campus" 
              location="Hongqiao · 1.2 km" 
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuCHCptnZwpr-MNTcyo8r_VYx-hss0Ki39RLNjF2bc8bNdIPdfMVugTjBZPaJKQugIdDLG8igNyWUuGBY0-ER8YXIT-1u5rpVdPhqnTfJ9sVXoZ_SqkLiz1krxNfiQc8gsPTJyyX1o_4BRWfvlYQV6WGnkMtm45wBJ35zNOf18AqB8HsOaipHE3ZPK536dzdU6djmhd1P3Ye0JvhGTaaEKw5rD49JXOz0nPvObDuQCSSMwA8e7XRbT2QYpQkgkhDAl6aq-wCJmgy47A"
              onClick={() => setSelectedItem({
                type: 'school',
                title: "SCIS Hongqiao",
                location: "Xianxia Rd, Hongqiao",
                tags: ["K-12", "Multicultural", "IB"],
                desc: "SCIS provides a truly diverse environment with students from over 60 nationalities.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHCptnZwpr-MNTcyo8r_VYx-hss0Ki39RLNjF2bc8bNdIPdfMVugTjBZPaJKQugIdDLG8igNyWUuGBY0-ER8YXIT-1u5rpVdPhqnTfJ9sVXoZ_SqkLiz1krxNfiQc8gsPTJyyX1o_4BRWfvlYQV6WGnkMtm45wBJ35zNOf18AqB8HsOaipHE3ZPK536dzdU6djmhd1P3Ye0JvhGTaaEKw5rD49JXOz0nPvObDuQCSSMwA8e7XRbT2QYpQkgkhDAl6aq-wCJmgy47A"
              })}
            />
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 bg-black/40 backdrop-blur-md transition-all duration-300" 
            onClick={closeModal}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-60 w-full bg-cover bg-center" style={{ backgroundImage: `url("${selectedItem.img}")` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button onClick={closeModal} className="absolute top-6 right-6 size-12 rounded-full bg-white/20 backdrop-blur-xl text-white flex items-center justify-center active:scale-90 transition-transform">
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-3xl font-black dark:text-white tracking-tighter leading-none">{selectedItem.title}</h3>
                  {selectedItem.price && <span className="text-primary font-black text-xl italic">{selectedItem.price}</span>}
                </div>
                <p className="text-sm text-gray-500 font-bold mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                  {selectedItem.location}
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed mb-8">{selectedItem.desc}</p>
                <div className="flex gap-2.5 flex-wrap mb-10">
                  {selectedItem.tags?.map((t: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-primary/10 text-primary text-[11px] font-black rounded-xl uppercase tracking-widest">{t}</span>
                  ))}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-5 rounded-[2rem] bg-primary text-[#0d1b14] font-black text-lg shadow-2xl shadow-primary/30 transition-all hover:brightness-105"
                >
                  Schedule Visit
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryChip: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <motion.button 
    whileTap={{ scale: 0.95 }}
    onClick={onClick} 
    className={`flex h-12 shrink-0 items-center justify-center gap-x-3 rounded-full px-6 border transition-all ${active ? 'bg-primary border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-white dark:bg-zinc-800 border-slate-100 dark:border-zinc-700 shadow-sm'}`}
  >
    <span className={`material-symbols-outlined text-xl ${active ? 'text-[#0d1b14]' : 'text-primary animate-pulse'}`}>{icon}</span>
    <p className={`${active ? 'text-[#0d1b14] font-black' : 'text-slate-800 dark:text-slate-100 font-bold'} text-sm tracking-tight whitespace-nowrap`}>{label}</p>
  </motion.button>
);

const SectionHeader: React.FC<{ title: string; linkText?: string; icon?: string }> = ({ title, linkText, icon }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-[#0d1b14] dark:text-white text-2xl font-black tracking-tighter italic">{title}</h2>
    {linkText && <p className="text-primary text-[11px] font-black cursor-pointer uppercase tracking-[0.2em] hover:underline transition-all">See all</p>}
    {icon && <span className="material-symbols-outlined text-gray-300">{icon}</span>}
  </div>
);

const MedicalCard: React.FC<{ title: string; location: string; tag: string; tags: string[]; img: string; onClick: () => void }> = ({ title, location, tag, tags, img, onClick }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    whileTap={{ scale: 0.98 }}
    className="flex items-center gap-5 p-5 rounded-[2.2rem] bg-white dark:bg-zinc-900 shadow-xl border border-slate-50 dark:border-zinc-800 cursor-pointer transition-all hover:shadow-2xl hover:shadow-primary/5 group" 
    onClick={onClick}
  >
    <div className="size-20 rounded-2xl bg-center bg-cover shrink-0 shadow-lg group-hover:rotate-3 transition-transform duration-500" style={{ backgroundImage: `url("${img}")` }}></div>
    <div className="flex-1 overflow-hidden">
      <div className="flex justify-between items-start gap-2 mb-1">
        <h3 className="font-black text-[#0d1b14] dark:text-white text-lg tracking-tight leading-tight truncate">{title}</h3>
        <span className="text-[9px] px-2.5 py-1 rounded-full font-black whitespace-nowrap bg-primary text-[#0d1b14] shadow-sm tracking-widest">{tag}</span>
      </div>
      <p className="text-[11px] font-bold text-gray-400 mb-3 truncate">{location}</p>
      <div className="flex gap-2">
        {tags.map((t, idx) => (
          <span key={idx} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50">{t}</span>
        ))}
      </div>
    </div>
  </motion.div>
);

const SchoolCard: React.FC<{ curriculum: string; name: string; location: string; img: string; onClick: () => void }> = ({ curriculum, name, location, img, onClick }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    whileTap={{ scale: 0.98 }}
    className="min-w-[260px] bg-white dark:bg-zinc-900 rounded-[2.2rem] overflow-hidden shadow-xl border border-slate-50 dark:border-zinc-800 cursor-pointer transition-all group" 
    onClick={onClick}
  >
    <div className="h-36 bg-center bg-cover overflow-hidden" style={{ backgroundImage: `url("${img}")` }}>
        <div className="size-full bg-black/5 group-hover:bg-transparent transition-all duration-700"></div>
    </div>
    <div className="p-6">
      <div className="flex items-center gap-2 mb-2">
          <div className="size-1.5 rounded-full bg-primary animate-sparkle"></div>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{curriculum}</p>
      </div>
      <h4 className="font-black text-xl text-[#0d1b14] dark:text-white h-14 overflow-hidden line-clamp-2 leading-none tracking-tight">{name}</h4>
      <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
            {location}
          </p>
          <div className="size-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary transition-all">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0d1b14] group-hover:font-black">arrow_forward</span>
          </div>
      </div>
    </div>
  </motion.div>
);

export default ExploreView;
