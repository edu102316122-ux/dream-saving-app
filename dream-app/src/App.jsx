import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, updateDoc, deleteDoc, writeBatch, addDoc, query, orderBy } from 'firebase/firestore';
import { 
  Trash2, 
  ChevronLeft, 
  User as UserIcon,
  Home,
  X,
  Edit2,
  ListOrdered,
  Smile,
  Plane,
  Cake,
  Wallet,
  Lock,
  MoreHorizontal,
  Target,
  Dices,
  Settings,
  Calculator,
  History,
  TrendingUp,
  CreditCard,
  ArrowRight,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  Sparkles,
  Heart
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyB87Cw8sueuC7Jo1Ud5RAEX3tFdQ3xM3tw",
  authDomain: "dream-saving-app.firebaseapp.com",
  projectId: "dream-saving-app",
  storageBucket: "dream-saving-app.firebasestorage.app",
  messagingSenderId: "93657624771",
  appId: "1:93657624771:web:341c4bd4cacccb715ef276"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'dream-saving-v23';

// 慶祝動畫組件
const CelebrationEffect = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-[300] pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="absolute animate-celebrate"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            backgroundColor: ['#8E9775', '#E28E8E', '#EBC49F', '#92B4EC', '#F4D160'][Math.floor(Math.random() * 5)],
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${Math.random() * 2 + 3}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
};

// 鼓勵視窗組件
const EncouragementModal = ({ isOpen, daysLeft, quote }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-md border-2 border-[#8E9775]/20 w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300 text-center pointer-events-auto">
        <div className="w-16 h-16 bg-[#8E9775]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Heart className="text-[#8E9775] fill-[#8E9775]" size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 leading-relaxed">{quote}</h3>
        <div className="inline-block px-4 py-2 bg-slate-900 text-white rounded-2xl text-sm font-bold mt-2">
          距離目標還有 {daysLeft} 天
        </div>
        <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-black">視窗將在三秒後自動關閉</p>
      </div>
    </div>
  );
};

const ElegantModal = ({ isOpen, title, onClose, children, bgColor = "bg-white" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`${bgColor} w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative z-10 border border-white/50 overflow-hidden flex flex-col`}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="text-slate-700 overflow-y-auto no-scrollbar pb-2">
          {children}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading');
  const [profile, setProfile] = useState({ name: '', purpose: '' });
  const [plans, setPlans] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [tempProfile, setTempProfile] = useState({ name: '', purpose: '第一桶金 💰', otherPurpose: '' });

  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [isSalaryAddOpen, setIsSalaryAddOpen] = useState(false);

  const [calcData, setCalcData] = useState({ date: new Date().toISOString().split('T')[0], hours: '8', mins: '0', hourlyRate: '190' });
  const [depositDayIndex, setDepositDayIndex] = useState(null);
  const [depositData, setDepositData] = useState({ amount: '100', date: new Date().toISOString().split('T')[0] });
  
  const quotes = [
    "太棒了！離夢想又近了一步 ✨", "每一分累積，都是對未來的承諾 💰", "你是最棒的，繼續保持喔！🌸",
    "存下的不只是錢，更是生活的底氣 💪", "今天的你也閃閃發亮呢！🌟", "積少成多，夢想終會開花 🌿",
    "慢慢來，比較快，你做得很好 🐢", "每一塊錢都是夢想的敲門磚 🏠", "保持節奏，未來會感謝現在的你 ⏳",
    "給認真的自己一個大大的擁抱 🤗", "存錢是種自律，更是種愛自己的表現 ❤️", "夢想不遠，就在你堅持的每一天裡 🌈",
    "小小的動作，累積成巨大的能量 ⚡", "你正在縮短與夢想的距離 🏃", "今天也為未來存下了快樂 🍦",
    "一步一腳印，目標就在眼前 👣", "看著存款增加，心情也跟著變好了呢 ☀️", "願你的努力，都能換來想要的自由 🕊️",
    "你是自己命運的建築師 🏗️", "為了更好的明天，今天辛苦了 ☕", "存款是為了讓選擇更有底氣 💎",
    "每次存錢，都是在為夢想投票 🗳️", "生活有光，存下希望 💡", "你是最溫柔的夢想實踐家 ☁️",
    "累積驚喜，期待未來的綻放 🌷", "不需要與人比較，今天的你更棒了 🥇", "存錢這件事，你已經贏過很多人了 🏆",
    "小確幸累積久了，就會變成大確幸 🍀", "你是最有耐心的小蜜蜂 🐝", "為夢想加點油，你值得擁有最好的 🚀",
    "每一份堅持，都是未來閃耀的伏筆 🖋️", "別小看今天的努力，那是未來的奇蹟 🎆"
  ];

  const getEmptyPlan = () => ({ 
    name: '✨ 我的夢想計畫', 
    target: '50000', 
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] 
  });

  const [newPlanData, setNewPlanData] = useState(getEmptyPlan());
  const [editPlanData, setEditPlanData] = useState(getEmptyPlan());

  const purposes = [
    { id: 'wealth', label: '第一桶金 💰', icon: Wallet },
    { id: 'travel', label: '瘋狂旅行 ✈️', icon: Plane },
    { id: 'reward', label: '犒賞自己 🍰', icon: Cake },
    { id: 'secret', label: '秘密計畫 ㊙️', icon: Lock },
    { id: 'other', label: '其他', icon: MoreHorizontal }
  ];

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        const isStandardPurpose = purposes.some(p => p.label === data.purpose);
        setTempProfile({
            name: data.name,
            purpose: isStandardPurpose ? data.purpose : '其他',
            otherPurpose: isStandardPurpose ? '' : data.purpose
        });
        if (view === 'loading') setView('main');
      } else {
        setView('onboarding');
      }
    });

    const plansCol = collection(db, 'artifacts', appId, 'users', user.uid, 'plans');
    const unsubPlans = onSnapshot(plansCol, (snap) => {
      const pData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlans(pData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    });

    const salaryCol = collection(db, 'artifacts', appId, 'users', user.uid, 'salaryRecords');
    const unsubSalary = onSnapshot(salaryCol, (snap) => {
      const sData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSalaryRecords(sData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    return () => { unsubProfile(); unsubPlans(); unsubSalary(); };
  }, [user]);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOnboardingNext = () => {
    if (!tempProfile.name.trim()) {
      showNotify("請輸入一個暱稱喔！");
      return;
    }
    setOnboardingStep(2);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const finalPurpose = tempProfile.purpose === '其他' ? tempProfile.otherPurpose : tempProfile.purpose;
    if (tempProfile.purpose === '其他' && !tempProfile.otherPurpose.trim()) {
        showNotify("請填寫您的目標內容喔！");
        return;
    }
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { 
      name: tempProfile.name,
      purpose: finalPurpose || '自由儲蓄'
    });
    showNotify("歡迎回來，" + tempProfile.name + "！✨");
    setView('main');
  };

  const handleMoveOrder = async (index, direction) => {
    if (!user) return;
    const newPlans = [...plans];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newPlans.length) return;
    [newPlans[index], newPlans[targetIndex]] = [newPlans[targetIndex], newPlans[index]];
    const batch = writeBatch(db);
    newPlans.forEach((p, i) => {
      const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'plans', p.id);
      batch.update(ref, { order: i });
    });
    await batch.commit();
  };

  const handleCreatePlan = async () => {
    if (!user) return;
    const planRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'plans'));
    await setDoc(planRef, {
      name: newPlanData.name,
      targetAmount: parseFloat(newPlanData.target) || 0,
      targetDate: newPlanData.targetDate,
      days: {},
      order: plans.length,
      createdAt: Date.now()
    });
    setIsNewPlanOpen(false);
    showNotify("新計畫已啟航！🌿");
  };

  const handleUpdatePlan = async () => {
    if (!user || !activePlanId) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'plans', activePlanId), {
        name: editPlanData.name,
        targetAmount: parseFloat(editPlanData.target) || 0,
        targetDate: editPlanData.targetDate 
      });
      setIsEditPlanOpen(false);
      showNotify("計畫已更新！✨");
    } catch (err) {
      showNotify("更新失敗");
    }
  };

  const handleDeletePlan = async () => {
    if (!user || !activePlanId) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'plans', activePlanId));
    setIsDeleteConfirmOpen(false);
    setView('main');
    showNotify("計畫已刪除 🗑️");
  };

  const handleDeposit = async () => {
    const p = plans.find(x => x.id === activePlanId);
    if (!p || !user) return;
    const newDays = { ...p.days, [depositDayIndex]: { amount: parseFloat(depositData.amount), saved: true, saveDate: depositData.date } };
    const newSaved = Object.values(newDays).reduce((s, d) => s + (d.amount || 0), 0);
    const isNowCompleted = newSaved >= p.targetAmount;
    const wasCompleted = Object.values(p.days || {}).reduce((s, d) => s + (d.amount || 0), 0) >= p.targetAmount;

    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'plans', p.id), { days: newDays });
    setIsDepositOpen(false);
    
    if (isNowCompleted && !wasCompleted) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    } else {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(randomQuote);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }
  };

  const handleUndoDeposit = async () => {
    const p = plans.find(x => x.id === activePlanId);
    if (!p || !user) return;
    const newDays = { ...p.days };
    delete newDays[depositDayIndex]; 
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'plans', p.id), { days: newDays });
    setIsDepositOpen(false);
    showNotify("已撤回紀錄 🔄");
  };

  const handleGlobalDrawCard = () => {
    const randomAmount = Math.floor(Math.random() * (1000 - 10 + 1)) + 10;
    const currentActive = plans.find(p => p.id === activePlanId);
    if (view === 'detail' && currentActive) {
      const nextUnsavedIndex = Array.from({length: 365}).findIndex((_, i) => !currentActive.days?.[i]);
      if (nextUnsavedIndex !== -1) {
        setDepositDayIndex(nextUnsavedIndex);
        setDepositData({ amount: randomAmount.toString(), date: new Date().toISOString().split('T')[0] });
        setIsDepositOpen(true);
        showNotify(`🎲 幸運金額：$${randomAmount}！`);
      }
    } else {
      showNotify(`🎲 幸運金額：$${randomAmount}！`);
    }
  };

  const handleSaveSalaryRecord = async () => {
    if (!user) return;
    const h = parseFloat(calcData.hours) || 0;
    const m = parseFloat(calcData.mins) || 0;
    const rate = parseFloat(calcData.hourlyRate) || 0;
    const finalAmount = Math.round((h + m/60) * rate);
    if (finalAmount <= 0) { showNotify("請輸入正確工資"); return; }
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'salaryRecords'), {
      amount: finalAmount, date: calcData.date, hours: calcData.hours, mins: calcData.mins, rate: calcData.hourlyRate, createdAt: Date.now()
    });
    showNotify(`💰 收入 $${finalAmount} 已記錄！`);
    setIsSalaryAddOpen(false);
  };

  const activePlan = useMemo(() => plans.find(p => p.id === activePlanId), [plans, activePlanId]);

  const stats = useMemo(() => {
    if (!activePlan) return { saved: 0, remaining: 0, daysLeft: 0 };
    const saved = Object.values(activePlan.days || {}).reduce((s, d) => s + (d.amount || 0), 0);
    const remaining = Math.max(0, (activePlan.targetAmount || 0) - saved);
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(activePlan.targetDate); target.setHours(0,0,0,0);
    const diff = target.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return { saved, remaining, daysLeft };
  }, [activePlan]);

  const totalSalaryIncome = useMemo(() => salaryRecords.reduce((sum, rec) => sum + (rec.amount || 0), 0), [salaryRecords]);

  if (view === 'loading') return <div className="h-screen bg-[#FDFDFB] flex items-center justify-center text-slate-400 font-medium tracking-widest">夢想加載中...</div>;

  return (
    <div className="max-w-md mx-auto h-screen bg-[#FDFDFB] overflow-hidden flex flex-col shadow-2xl relative font-sans text-slate-800">
      
      <CelebrationEffect isVisible={showCelebration} />
      <EncouragementModal isOpen={showEncouragement} daysLeft={stats.daysLeft} quote={currentQuote} />

      {/* Onboarding */}
      {view === 'onboarding' && (
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xs space-y-12 py-10">
            <div className="w-24 h-24 bg-[#8E9775]/10 rounded-[2.5rem] flex items-center justify-center mx-auto animate-bounce duration-[2000ms]"><Smile className="w-12 h-12 text-[#8E9775]" /></div>
            {onboardingStep === 1 ? (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">你好呀！<br/>怎麼稱呼你呢？</h1>
                    <p className="text-slate-400 text-sm font-medium">讓我們為你建立專屬的手帳空間</p>
                </div>
                <input className="w-full px-8 py-6 rounded-3xl bg-slate-50 text-center font-bold text-2xl outline-none border-2 border-transparent focus:border-[#8E9775]/20 focus:bg-white transition-all" placeholder="輸入暱稱..." value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} autoFocus />
                <button onClick={handleOnboardingNext} className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-bold shadow-xl flex items-center justify-center gap-2 group">下一步 <ChevronRight className="group-hover:translate-x-1 transition-transform" /></button>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">太棒了，{tempProfile.name}！</h1>
                    <p className="text-slate-400 text-sm font-medium">這次存錢的目標是為了什麼？</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {purposes.map(p => (
                    <button key={p.id} onClick={() => setTempProfile({...tempProfile, purpose: p.label})} className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${tempProfile.purpose === p.label ? 'border-[#8E9775] bg-[#8E9775]/5 scale-105' : 'border-slate-50 bg-slate-50 opacity-60'}`}>
                      <p.icon className={tempProfile.purpose === p.label ? 'text-[#8E9775]' : 'text-slate-400'} size={24} />
                      <span className="text-xs font-bold">{p.label}</span>
                    </button>
                  ))}
                </div>
                {tempProfile.purpose === '其他' && (
                  <div className="animate-in zoom-in-95"><input className="w-full px-6 py-5 rounded-3xl bg-[#8E9775]/5 border-2 border-[#8E9775]/20 font-bold outline-none placeholder:text-slate-300 text-center" placeholder="請輸入您的自定義目標..." value={tempProfile.otherPurpose} onChange={e => setTempProfile({...tempProfile, otherPurpose: e.target.value})} autoFocus /></div>
                )}
                <div className="flex gap-3">
                    <button onClick={() => setOnboardingStep(1)} className="p-5 bg-slate-100 rounded-[1.8rem] text-slate-400"><ChevronLeft /></button>
                    <button onClick={handleSaveProfile} className="flex-1 py-5 bg-[#8E9775] text-white rounded-[1.8rem] font-bold shadow-lg shadow-[#8E9775]/20">開始啟航 ✨</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 目錄 */}
      {view === 'main' && (
        <>
          <header className="p-8 bg-white border-b border-slate-50 flex-shrink-0 flex justify-between items-center z-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{profile.name}，</h1>
                <p className="text-sm font-medium text-[#8E9775] mt-1">為了 {profile.purpose} 努力中 ✨</p>
            </div>
            <button onClick={() => setView('profile_edit')} className="p-3 bg-slate-50 rounded-2xl text-slate-300 hover:text-[#8E9775] transition-colors"><Settings className="w-5 h-5" /></button>
          </header>

          <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] opacity-40">我的儲蓄計畫</h3>
              <div className="flex gap-2">
                {plans.length > 1 && (
                  <button onClick={() => setIsReordering(!isReordering)} className={`px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${isReordering ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    <ArrowUpDown size={12} /> {isReordering ? '完成排序' : '調整順序'}
                  </button>
                )}
                <button onClick={() => { setNewPlanData(getEmptyPlan()); setIsNewPlanOpen(true); }} className="bg-[#8E9775] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold active:scale-95 transition-all shadow-sm shadow-[#8E9775]/20">+ 新計畫</button>
              </div>
            </div>
            
            <div className="space-y-4 pb-40">
              {plans.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center space-y-3">
                  <div className="text-slate-200 flex justify-center"><Target size={40} /></div>
                  <p className="text-slate-300 text-xs font-bold">還沒有計畫嗎？<br/>現在就開啟第一個夢想吧！</p>
                </div>
              ) : (
                plans.map((p, index) => {
                  const total = Object.values(p.days || {}).reduce((s, d) => s + (d.amount || 0), 0);
                  const progress = Math.min((total / (p.targetAmount || 1)) * 100, 100) || 0;
                  const isCompleted = progress >= 100;
                  return (
                    <div key={p.id} onClick={() => { if(!isReordering) { setActivePlanId(p.id); setView('detail'); } }} className={`group p-6 rounded-[2.5rem] border bg-white transition-all relative overflow-hidden ${isReordering ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-50 border-transparent' : 'hover:border-[#8E9775]/30 hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer border-slate-100'} ${isCompleted && !isReordering ? 'ring-1 ring-amber-200 bg-gradient-to-br from-white to-amber-50/20' : ''} animate-in fade-in slide-in-from-bottom-2 flex items-center gap-4`}>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-slate-800 text-lg transition-colors ${!isReordering && 'group-hover:text-[#8E9775]'}`}>{p.name}</span>
                                {isCompleted && <div className="flex items-center gap-1 bg-[#8E9775] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse"><CheckCircle2 size={10} /> 已完成 ✨</div>}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span>$ {total.toLocaleString()}</span>
                              <span>/</span>
                              <span>$ {(p.targetAmount || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className={`font-black text-2xl transition-all ${isCompleted ? 'text-amber-500 scale-110 drop-shadow-sm' : 'text-[#8E9775]'}`}>{Math.floor(progress)}%</div>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden relative">
                          <div className={`h-full transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-amber-400' : 'bg-[#8E9775]'}`} style={{ width: `${progress}%` }}>
                            {isCompleted && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />}
                          </div>
                        </div>
                      </div>
                      {isReordering && (
                        <div className="flex flex-col gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleMoveOrder(index, -1); }} className={`p-2 rounded-xl border ${index === 0 ? 'opacity-20 pointer-events-none' : 'bg-white border-slate-100 text-amber-600 hover:bg-amber-50'}`}><ChevronUp size={20} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveOrder(index, 1); }} className={`p-2 rounded-xl border ${index === plans.length - 1 ? 'opacity-20 pointer-events-none' : 'bg-white border-slate-100 text-amber-600 hover:bg-amber-50'}`}><ChevronDown size={20} /></button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </>
      )}

      {/* 薪資管理 */}
      {view === 'salary' && (
        <>
          <header className="p-8 bg-white border-b border-slate-50 flex-shrink-0 flex justify-between items-center z-10">
            <h1 className="text-2xl font-bold text-slate-900">薪資紀錄</h1>
            <button onClick={() => setIsSalaryAddOpen(true)} className="p-3 bg-[#8E9775] text-white rounded-2xl active:scale-90 transition-all shadow-lg shadow-[#8E9775]/20"><Calculator className="w-5 h-5" /></button>
          </header>
          <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <div className="bg-slate-800 p-8 rounded-[2.8rem] text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><TrendingUp size={80} /></div>
              <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-1">累積總收入紀錄</p>
              <div className="text-4xl font-black text-white tracking-tight">$ {totalSalaryIncome.toLocaleString()}</div>
            </div>
            <div className="space-y-4 pb-40">
              {salaryRecords.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center space-y-3"><div className="text-slate-200 flex justify-center"><History size={40} /></div><p className="text-slate-300 text-xs font-bold">目前無紀錄</p></div>
              ) : (
                salaryRecords.map(rec => (
                  <div key={rec.id} className="bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                                <span className="text-[9px] font-black text-[#8E9775] uppercase">{new Date(rec.date).toLocaleString('zh-TW', {month: 'short'})}</span>
                                <span className="text-lg font-bold text-slate-700">{new Date(rec.date).getDate()}</span>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-slate-800">$ {rec.amount.toLocaleString()}</div>
                                <div className="text-[10px] font-bold text-slate-400">工時 {rec.hours}h {rec.mins}m (時薪 ${rec.rate})</div>
                            </div>
                        </div>
                        <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'salaryRecords', rec.id))} className="p-3 bg-red-50 text-red-300 rounded-xl"><X size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </>
      )}

      {/* 詳情 */}
      {view === 'detail' && activePlan && (
        <>
          <header className="p-6 bg-white flex items-center justify-between border-b border-slate-50 flex-shrink-0 z-10">
            <button onClick={() => setView('main')} className="p-3 bg-slate-50 rounded-2xl text-slate-600 active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">計畫進度</span>
            <div className="flex gap-2">
              <button onClick={() => { setEditPlanData({ name: activePlan.name, target: activePlan.targetAmount.toString(), targetDate: activePlan.targetDate }); setIsEditPlanOpen(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-2xl active:scale-90"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => setIsDeleteConfirmOpen(true)} className="p-3 bg-red-50 text-red-300 rounded-2xl active:scale-90"><Trash2 className="w-4 h-4" /></button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            <div className={`p-8 rounded-[3rem] border mb-8 bg-white shadow-xl animate-in slide-in-from-top-4 relative overflow-hidden ${stats.saved >= activePlan.targetAmount ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/30 shadow-amber-100/50' : 'border-slate-100 shadow-slate-200/50'}`}>
                {stats.saved >= activePlan.targetAmount && <div className="absolute top-4 right-6 text-amber-500 opacity-20"><Sparkles size={60} /></div>}
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">目前儲蓄額</p>
                <h2 className={`text-4xl font-bold tracking-tight ${stats.saved >= activePlan.targetAmount ? 'text-amber-600' : 'text-slate-800'}`}>$ {stats.saved.toLocaleString()}</h2>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {stats.saved >= activePlan.targetAmount ? <span className="text-[10px] bg-[#8E9775] text-white font-black px-3 py-1.5 rounded-xl flex items-center gap-1"><CheckCircle2 size={12} /> 恭喜完成夢想！</span> : <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-3 py-1.5 rounded-xl flex items-center gap-1"><Target size={12} /> 還差 $ {stats.remaining.toLocaleString()}</span>}
                    <span className="text-[10px] bg-slate-100 text-slate-400 font-black px-3 py-1.5 rounded-xl flex items-center gap-1">還有 {stats.daysLeft} 天</span>
                </div>
            </div>
            <div className="grid grid-cols-5 gap-3 pb-40">
              {Array.from({ length: 365 }).map((_, i) => {
                const d = activePlan.days?.[i];
                return (
                  <button key={i} onClick={() => { setDepositDayIndex(i); setDepositData({ amount: d?.saved ? d.amount.toString() : '100', date: d?.saved ? d.saveDate : new Date().toISOString().split('T')[0] }); setIsDepositOpen(true); }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 ${d?.saved ? 'bg-[#8E9775] text-white shadow-lg shadow-[#8E9775]/20' : 'bg-white border border-slate-100 text-slate-300'}`}>
                    <span className="text-[6px] font-bold opacity-50 uppercase">Day</span>
                    <span className="text-xs font-bold">{i+1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 導航 */}
      {(view !== 'onboarding' && view !== 'loading') && (
        <div className="fixed bottom-0 left-0 w-full p-8 flex justify-center z-[150] pointer-events-none">
          <nav className="bg-white/95 backdrop-blur-xl px-10 py-4 rounded-[2.8rem] shadow-2xl border border-white/50 flex gap-10 pointer-events-auto items-center">
            <button onClick={() => { setView('main'); setActivePlanId(null); setIsReordering(false); }} className={`transition-all active:scale-125 ${view === 'main' ? 'text-[#8E9775]' : 'text-slate-300'}`}><Home className="w-6 h-6" /></button>
            <button onClick={() => { setView('salary'); setIsReordering(false); }} className={`transition-all active:scale-125 ${view === 'salary' ? 'text-[#8E9775]' : 'text-slate-300'}`}><History className="w-6 h-6" /></button>
            <button onClick={handleGlobalDrawCard} className="text-slate-300 transition-all hover:text-[#8E9775] active:scale-150 p-2.5 bg-slate-50 rounded-full shadow-inner"><Dices className="w-6 h-6" /></button>
            <button onClick={() => { setView('profile_edit'); setIsReordering(false); }} className={`transition-all active:scale-125 ${view === 'profile_edit' ? 'text-[#8E9775]' : 'text-slate-300'}`}><UserIcon className="w-6 h-6" /></button>
          </nav>
        </div>
      )}

      {/* 各種彈窗 */}
      <ElegantModal isOpen={isEditPlanOpen} title="編輯計畫資訊" onClose={() => setIsEditPlanOpen(false)}>
        <div className="space-y-4">
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-widest">計畫名稱</label><input className="w-full px-6 py-5 rounded-2xl bg-slate-50 font-bold outline-none border border-slate-100" value={editPlanData.name} onChange={e => setEditPlanData({...editPlanData, name: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-widest">目標金額</label><input type="number" className="w-full px-6 py-5 rounded-2xl bg-slate-50 font-bold outline-none border border-slate-100" value={editPlanData.target} onChange={e => setEditPlanData({...editPlanData, target: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-widest">目標日期</label><input type="date" className="w-full px-6 py-5 rounded-2xl bg-slate-50 font-bold outline-none border border-slate-100 text-slate-500 text-center date-input-field" value={editPlanData.targetDate} onChange={e => setEditPlanData({...editPlanData, targetDate: e.target.value})} /></div>
          <button onClick={handleUpdatePlan} className="w-full py-5 bg-[#8E9775] text-white rounded-[1.8rem] font-bold shadow-lg mt-4">儲存變更</button>
        </div>
      </ElegantModal>

      <ElegantModal isOpen={isSalaryAddOpen} title="紀錄收入" onClose={() => setIsSalaryAddOpen(false)} bgColor="bg-slate-50">
        <div className="space-y-6">
          <div className="bg-[#8E9775] p-8 rounded-[2.5rem] text-center shadow-xl border-4 border-white"><p className="text-[10px] font-bold text-white/70 tracking-widest uppercase mb-1">計算金額</p><div className="text-4xl font-black text-white tracking-tight">$ {Math.round((parseFloat(calcData.hours || 0) + parseFloat(calcData.mins || 0)/60) * parseFloat(calcData.hourlyRate || 0)).toLocaleString()}</div></div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 px-2 uppercase">小時</label><input type="number" className="w-full px-6 py-4 rounded-2xl bg-white font-bold outline-none" value={calcData.hours} onChange={e => setCalcData({...calcData, hours: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 px-2 uppercase">分鐘</label><input type="number" className="w-full px-6 py-4 rounded-2xl bg-white font-bold outline-none" value={calcData.mins} onChange={e => setCalcData({...calcData, mins: e.target.value})} /></div>
            </div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 px-2 uppercase">時薪</label><input type="number" className="w-full px-6 py-4 rounded-2xl bg-white font-bold outline-none" value={calcData.hourlyRate} onChange={e => setCalcData({...calcData, hourlyRate: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 px-2 uppercase">日期</label><input type="date" className="w-full px-6 py-4 rounded-2xl bg-white font-bold text-slate-500 date-input-field" value={calcData.date} onChange={e => setCalcData({...calcData, date: e.target.value})} /></div>
          </div>
          <button onClick={handleSaveSalaryRecord} className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-bold shadow-xl">確認儲存</button>
        </div>
      </ElegantModal>

      <ElegantModal isOpen={isDepositOpen} title={`Day ${depositDayIndex + 1} 存款紀錄`} onClose={() => setIsDepositOpen(false)}>
        <div className="space-y-6">
          <div className="space-y-1 text-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">存入金額</label>
            {/* 修改點：移除冗餘背景容器，直接對 input 進行更乾淨的樣式設定，確保點擊區域無阻礙 */}
            <input 
              type="number" 
              inputMode="numeric"
              className="w-full py-8 px-4 rounded-[2rem] bg-slate-50 text-center text-5xl font-bold text-[#8E9775] outline-none border-2 border-transparent focus:border-[#8E9775]/20 focus:bg-white transition-all shadow-inner block"
              value={depositData.amount} 
              onChange={e => setDepositData({...depositData, amount: e.target.value})} 
              autoFocus
            />
          </div>
          <button onClick={handleDeposit} className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-bold shadow-xl active:scale-95 transition-transform">確認存入網格</button>
          {activePlan?.days?.[depositDayIndex]?.saved && <button onClick={handleUndoDeposit} className="w-full py-4 text-red-500 font-bold active:bg-red-50 rounded-2xl">撤回紀錄</button>}
        </div>
      </ElegantModal>

      <ElegantModal isOpen={isNewPlanOpen} title="開啟新夢想" onClose={() => setIsNewPlanOpen(false)}>
        <div className="space-y-4">
          <input className="w-full px-6 py-5 rounded-2xl bg-slate-50 font-bold outline-none border border-slate-100" placeholder="計畫名稱" value={newPlanData.name} onChange={e => setNewPlanData({...newPlanData, name: e.target.value})} />
          <input type="number" className="w-full px-6 py-5 rounded-2xl bg-slate-50 font-bold outline-none border border-slate-100" placeholder="目標總金額" value={newPlanData.target} onChange={e => setNewPlanData({...newPlanData, target: e.target.value})} />
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 px-2 uppercase">目標日期</label><input type="date" className="w-full px-6 py-5 rounded-2xl bg-slate-50 font-bold text-slate-500 text-center date-input-field" value={newPlanData.targetDate} onChange={e => setNewPlanData({...newPlanData, targetDate: e.target.value})} /></div>
          <button onClick={handleCreatePlan} className="w-full py-5 bg-[#8E9775] text-white rounded-[1.8rem] font-bold shadow-lg mt-4">啟動計畫</button>
        </div>
      </ElegantModal>

      <ElegantModal isOpen={isDeleteConfirmOpen} title="確定要刪除嗎？" onClose={() => setIsDeleteConfirmOpen(false)}>
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto"><Trash2 className="w-8 h-8 text-red-400" /></div>
          <div className="flex gap-3"><button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">取消</button><button onClick={handleDeletePlan} className="flex-1 py-4 bg-red-400 text-white rounded-2xl font-bold shadow-lg">確定刪除</button></div>
        </div>
      </ElegantModal>

      {/* 個人檔案編輯 */}
      {view === 'profile_edit' && (
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xs space-y-8 py-20">
            <div className="w-20 h-20 bg-[#8E9775]/10 rounded-[2.2rem] flex items-center justify-center mx-auto mb-2"><UserIcon className="w-10 h-10 text-[#8E9775]" /></div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">個人檔案</h1>
            <input className="w-full px-8 py-5 rounded-2xl bg-slate-50 text-center font-bold text-xl outline-none" value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              {purposes.map(p => (
                <button key={p.id} onClick={() => setTempProfile({...tempProfile, purpose: p.label})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${tempProfile.purpose === p.label ? 'border-[#8E9775] bg-[#8E9775]/10' : 'border-slate-50 bg-slate-50 opacity-50'}`}>
                  <p.icon className={`w-6 h-6 ${tempProfile.purpose === p.label ? 'text-[#8E9775]' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{p.label}</span>
                </button>
              ))}
            </div>
            {tempProfile.purpose === '其他' && <div className="animate-in slide-in-from-top-2"><input className="w-full px-6 py-5 rounded-2xl bg-[#8E9775]/5 border-2 border-[#8E9775]/20 font-bold outline-none text-center" value={tempProfile.otherPurpose} onChange={e => setTempProfile({...tempProfile, otherPurpose: e.target.value})} /></div>}
            <button onClick={handleSaveProfile} className="w-full py-5 bg-slate-800 text-white rounded-2xl font-bold shadow-xl">更新資料</button>
            <button onClick={() => setView('main')} className="text-slate-300 font-bold text-sm">返回首頁</button>
          </div>
        </div>
      )}

      {notification && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] bg-slate-900/90 text-white px-8 py-3.5 rounded-full shadow-2xl font-bold text-[10px] uppercase tracking-widest animate-in slide-in-from-top-4">{notification}</div>}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes celebrate { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        .animate-celebrate { animation-name: celebrate; animation-timing-function: linear; animation-fill-mode: forwards; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .animate-shimmer { animation: shimmer 3s infinite linear; }
        body { background-color: #F8FAFC; margin: 0; overflow: hidden; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
        input[type="number"]::-webkit-inner-spin-button { display: none; }
        .date-input-field { position: relative; cursor: pointer; -webkit-appearance: none; min-height: 3rem; }
        .date-input-field::-webkit-calendar-picker-indicator { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
      `}} />
    </div>
  );
};

export default App;