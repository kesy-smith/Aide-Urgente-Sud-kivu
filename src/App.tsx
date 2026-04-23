import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  User as UserIcon, 
  ChevronRight, 
  Home, 
  Search, 
  LogOut, 
  Sun, 
  Moon, 
  Languages, 
  LifeBuoy,
  Heart,
  Stethoscope,
  Utensils,
  Wallet,
  AlertTriangle,
  Menu,
  X,
  CheckCircle2,
  MoreVertical,
  Download
} from 'lucide-react';

// ... (other components)

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-4 right-4 z-50 sm:bottom-8 sm:right-8 sm:left-auto sm:w-80"
    >
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF3B30] rounded-2xl flex items-center justify-center">
            <Download size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-white leading-none">Installer l'App</p>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Utilisation Offline & Directe</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleInstall}
            className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Installer
          </button>
          <button onClick={() => setIsVisible(false)} className="text-gray-500">
            <X size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
import { AuthProvider, useAuth } from './AuthContext';
import { HelpRequest, RequestCategory, RequestStatus } from './types';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db, getFirebaseState } from './lib/firebase';
import { cn } from './lib/utils';
import { handleFirestoreError } from './lib/error_handler';
import './i18n';

const FirebaseDiagnostic = () => {
  const [status, setStatus] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = async () => {
      const state = await getFirebaseState();
      setStatus(state);
      // Only show alert for ACTUAL configuration errors
      // Ignore "offline" state as it's normal during usage
      const isConfigError = 
        state.installations === 'failed' || 
        (state.firestore !== 'ok' && state.firestore !== 'offline');

      if (isConfigError) {
        setShow(true);
      }
    };
    const timer = setTimeout(check, 1500); // Delay to let firebase init
    return () => clearTimeout(timer);
  }, []);

  if (!show || !status) return null;

  return (
    <div className={cn(
      "fixed top-4 left-4 right-4 z-[9999] bg-[#FF3B30] text-white p-6 rounded-3xl shadow-2xl transition-all duration-500 border border-white/20",
      expanded ? "max-h-[80vh] overflow-y-auto" : "max-h-20 overflow-hidden"
    )}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <div className="text-[11px] font-black uppercase tracking-tight">
            ALERTE : Configuration Firebase incomplète
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!expanded && (
            <button 
              onClick={() => setExpanded(true)}
              className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              Réparer
            </button>
          )}
          <button onClick={() => setShow(false)} className="opacity-50 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-white/20">
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase opacity-60 tracking-widest">Étape 1 : Autoriser le domaine</h4>
          <p className="text-xs font-bold leading-relaxed">
            Copiez ces domaines et ajoutez-les dans "Authorized domains" sur Firebase :
          </p>
          <code className="block bg-black/20 p-3 rounded-xl text-[10px] font-mono break-all select-all">
            {window.location.hostname}<br/>
            ais-pre-lvz23uszakbdpgjty2gx5a-14482715882.europe-west2.run.app
          </code>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase opacity-60 tracking-widest">Étape 2 : API Installations</h4>
          <p className="text-xs font-bold leading-relaxed">
            Assurez-vous que l'API Installations est activée dans votre Google Cloud Console.
          </p>
        </div>

        <button 
          onClick={() => setExpanded(false)}
          className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
          Fermer le guide
        </button>
      </div>
    </div>
  );
};

// --- Components ---

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="z-50 w-full bg-[#121212] pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-white uppercase leading-none">
            {t('app_name').split(' ')[0]} {t('app_name').split(' ')[1]}
          </h1>
          <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase mt-1">
            Sud-Kivu, RDC
          </p>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#1E1E1E] rounded-full p-1 border border-[#2A2A2A]">
            <button 
              onClick={() => i18n.changeLanguage('fr')}
              className={cn(
                "px-3 py-1 text-[10px] font-black rounded-full transition-all",
                i18n.language === 'fr' ? "bg-[#333] text-white shadow-inner" : "text-gray-500"
              )}
            >
              FR
            </button>
            <button 
              onClick={() => i18n.changeLanguage('en')}
              className={cn(
                "px-3 py-1 text-[10px] font-black rounded-full transition-all",
                i18n.language === 'en' ? "bg-[#333] text-white shadow-inner" : "text-gray-500"
              )}
            >
              EN
            </button>
          </div>
          
          {user && (
            <Link 
              to="/profile"
              className="w-10 h-10 rounded-full border-2 border-[#2A2A2A] overflow-hidden"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="m-2 text-gray-500" />
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const TabBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] border-t border-[#2A2A2A] pb-8 pt-4 px-8 sm:hidden">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 group">
          <div className={cn("w-1.5 h-1.5 rounded-full mb-0.5 transition-all", location.pathname === '/' ? "bg-[#FF3B30] opacity-100" : "bg-transparent opacity-0")} />
          <Home size={20} className={cn("transition-colors", location.pathname === '/' ? "text-white" : "text-gray-500")} />
          <span className={cn("text-[8px] font-black uppercase tracking-widest", location.pathname === '/' ? "text-white" : "text-gray-500")}>Flux</span>
        </button>

        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 group opacity-40">
          <div className="w-1.5 h-1.5 rounded-full mb-0.5 bg-transparent opacity-0" />
          <Search size={20} className="text-gray-500" />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Carte</span>
        </button>

        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 group opacity-40">
          <div className="w-1.5 h-1.5 rounded-full mb-0.5 bg-transparent opacity-0" />
          <AlertTriangle size={20} className="text-gray-500" />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Alertes</span>
        </button>

        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 group">
          <div className={cn("w-1.5 h-1.5 rounded-full mb-0.5 transition-all", location.pathname === '/profile' ? "bg-[#FF3B30] opacity-100" : "bg-transparent opacity-0")} />
          <UserIcon size={20} className={cn("transition-colors", location.pathname === '/profile' ? "text-white" : "text-gray-500")} />
          <span className={cn("text-[8px] font-black uppercase tracking-widest", location.pathname === '/profile' ? "text-white" : "text-gray-500")}>Profil</span>
        </button>
      </div>
    </div>
  );
};

// --- Pages ---

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestCategory | 'all'>('all');

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'requests'),
      where('status', 'in', ['open', 'in_progress', 'resolved']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HelpRequest[];
        setRequests(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        handleFirestoreError(error, 'list', 'requests');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.category === filter);

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500 font-black uppercase tracking-widest text-xs">{t('loading')}</div>;

  return (
    <div className="space-y-6 pb-32 sm:pb-8">
      {/* Welcome / Login CTA if not logged in */}
      {!user && (
        <section className="relative overflow-hidden rounded-[40px] bg-[#FF3B30] p-10 text-white shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">
              {t('app_name')}
            </h2>
            <p className="text-white/80 font-bold mb-8 text-sm max-w-xs leading-relaxed">
              {t('slogan')}
            </p>
            <button 
              onClick={signIn}
              className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl"
            >
              {t('login_google')}
            </button>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </section>
      )}

      {/* Quick Actions Grid */}
      {user && (
        <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          onClick={() => navigate('/request/new')}
          className="flex flex-col items-center justify-center p-6 bg-[#FF3B30] rounded-[32px] border border-[#FF453A] shadow-[0_10px_20px_-5px_rgba(255,59,48,0.4)] active:scale-95 transition-all"
        >
          <div className="w-12 h-12 mb-3 bg-white/20 rounded-full flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <span className="text-[11px] font-black leading-tight uppercase tracking-widest text-white text-center">
            {t('ask_help').split(' ')[0]}<br/>{t('ask_help').split(' ')[1] || 'Urgent'}
          </span>
        </button>
        <button 
          onClick={() => setFilter('all')}
          className="flex flex-col items-center justify-center p-6 bg-[#34C759] rounded-[32px] border border-[#30D158] shadow-[0_10px_20px_-5px_rgba(52,199,89,0.3)] active:scale-95 transition-all"
        >
          <div className="w-12 h-12 mb-3 bg-white/20 rounded-full flex items-center justify-center">
            <Heart size={24} className="text-white" />
          </div>
          <span className="text-[11px] font-black leading-tight uppercase tracking-widest text-white text-center">
            {t('help_someone').split(' ')[0]}<br/>{t('help_someone').split(' ')[1] || ''}
          </span>
        </button>
      </div>
      )}

      {/* Category Filter */}
      {user && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {(['all', 'medical', 'food', 'financial', 'emergency'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border",
                  filter === cat 
                    ? "bg-white text-black border-white" 
                    : "bg-[#1E1E1E] text-gray-400 border-[#2A2A2A] hover:border-gray-600"
                )}
              >
                {cat === 'all' ? 'Tout' : t(cat)}
              </button>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
              {t('recent_requests')}
            </p>

            <div className="space-y-3">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request: HelpRequest) => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <div className="py-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                  {t('no_requests')}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const RequestCard = ({ request }: { request: HelpRequest }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getStatusBorder = (status: RequestStatus) => {
    switch (status) {
      case 'open': return 'border-[#0A84FF]'; // Blue
      case 'in_progress': return 'border-[#FF9F0A]'; // Orange
      case 'resolved': return 'border-[#34C759]'; // Green
      default: return 'border-gray-600';
    }
  };

  const getStatusTag = (status: RequestStatus) => {
    switch (status) {
      case 'open': return { bg: 'bg-[#0A84FF]/20', text: 'text-[#0A84FF]', label: t('open') };
      case 'in_progress': return { bg: 'bg-[#FF9F0A]/20', text: 'text-[#FF9F0A]', label: t('in_progress') };
      case 'resolved': return { bg: 'bg-[#34C759]/20', text: 'text-[#34C759]', label: 'Resolue' };
      default: return { bg: 'bg-gray-800', text: 'text-gray-400', label: status };
    }
  };

  const tag = getStatusTag(request.status);

  return (
    <motion.div 
      layout
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate(`/request/${request.id}`)}
      className={cn(
        "bg-[#1E1E1E] border-l-4 p-5 rounded-r-2xl cursor-pointer active:scale-98 transition-all",
        getStatusBorder(request.status)
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{request.title}</h3>
        <div className="flex gap-1">
          {request.urgency === 'high' && (
            <span className="px-2 py-0.5 bg-[#FF3B30]/20 text-[#FF3B30] text-[9px] font-black uppercase rounded">Urgent</span>
          )}
          <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase rounded", tag.bg, tag.text)}>
            {tag.label}
          </span>
        </div>
      </div>
      
      <p className="text-[11px] text-gray-500 mb-4 line-clamp-1 font-medium">
        {request.location.area} • {request.createdAt?.toDate ? new Date(request.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : t('loading')}
      </p>

      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-gray-500 tracking-wider">
          {request.contact.slice(0, 10)}xxxx
        </span>
        <button className="bg-white hover:bg-gray-200 text-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all">
          {t('i_can_help')}
        </button>
      </div>
    </motion.div>
  );
};

const NewRequest = () => {
  const { t } = useTranslation();
  const { user, profile, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'medical' as RequestCategory,
    location: '',
    contact: profile?.phoneNumber || '',
  });

  // Pre-fill phone if profile loads after component mounts
  useEffect(() => {
    if (profile?.phoneNumber && !formData.contact) {
      setFormData(prev => ({ ...prev, contact: profile.phoneNumber }));
    }
  }, [profile]);

  if (!user) return <div className="text-center py-12"><button onClick={signIn} className="bg-[#FF3B30] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest">{t('login_google')}</button></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Optimistic approach: We trigger the write and navigate immediately
    // Firestore persistence will handle the sync in the background
    const requestData = {
      ...formData,
      userName: user?.displayName || 'Anonymous',
      location: { area: formData.location },
      status: 'open',
      userId: user!.uid,
      createdAt: serverTimestamp(),
    };

    try {
      // We don't await the addDoc if we want maximum perceived speed
      // Firestore will batch this and retry if offline/slow
      addDoc(collection(db, 'requests'), requestData).catch(error => {
        console.error("Delayed write error:", error);
        handleFirestoreError(error, 'create', 'requests');
      });
      
      // Give a tiny delay for visual feedback then navigate
      setTimeout(() => {
        navigate('/');
      }, 300);
    } catch (error) {
      handleFirestoreError(error, 'create', 'requests');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto pb-32"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full text-white">
          <Menu size={20} className="rotate-90" />
        </Link>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">{t('ask_help')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#121212] p-8 rounded-[40px] border border-[#2A2A2A] shadow-2xl space-y-8">
        <div>
          <label className="block text-[10px] font-black mb-2 text-gray-500 uppercase tracking-[0.2em]">{t('title')}</label>
          <input 
            required
            type="text" 
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5 outline-none transition-all text-white font-bold"
            placeholder="e.g. Need O+ Blood"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black mb-2 text-gray-500 uppercase tracking-[0.2em]">{t('category')}</label>
          <div className="grid grid-cols-2 gap-3">
            {(['medical', 'food', 'financial', 'emergency'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest",
                  formData.category === cat 
                    ? "bg-[#FF3B30] border-[#FF3B30] text-white" 
                    : "bg-[#1E1E1E] border-[#2A2A2A] text-gray-500"
                )}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black mb-2 text-gray-500 uppercase tracking-[0.2em]">{t('description')}</label>
          <textarea 
            required
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5 outline-none transition-all text-white font-bold"
            placeholder="Tell us how we can help..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black mb-2 text-gray-500 uppercase tracking-[0.2em]">{t('location')}</label>
            <input 
              required
              type="text" 
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5 outline-none transition-all text-white font-bold"
              placeholder="Bukavu"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black mb-2 text-gray-500 uppercase tracking-[0.2em]">{t('contact')}</label>
            <input 
              required
              type="tel" 
              value={formData.contact}
              onChange={e => setFormData({ ...formData, contact: e.target.value })}
              className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5 outline-none transition-all text-white font-bold"
              placeholder="+243..."
            />
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-white hover:bg-gray-200 disabled:opacity-50 text-black p-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
        >
          {loading ? t('loading') : t('submit')}
        </button>
      </form>
    </motion.div>
  );
};

const RequestDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id || !user) {
      if (!user) setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'requests', id), 
      (doc) => {
        if (doc.exists()) {
          setRequest({ id: doc.id, ...doc.data() } as HelpRequest);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Detail fetch error:", error);
        handleFirestoreError(error, 'get', `requests/${id}`);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [id, user]);

  if (loading) return <div className="text-center py-12 text-gray-500 font-black uppercase text-xs tracking-widest">{t('loading')}</div>;
  if (!request) return <div className="text-center py-12 text-white font-black uppercase text-xs tracking-widest">Not found</div>;

  const isOwner = user?.uid === request.userId;

  const updateStatus = async (status: RequestStatus) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'requests', id), { 
        status, 
        volunteerId: status === 'in_progress' ? user?.uid : (request.volunteerId || null),
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `requests/${id}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto pb-32"
    >
       <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="p-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full text-white">
          <Menu size={20} className="rotate-90" />
        </Link>
        <span className="font-black text-gray-500 uppercase tracking-[0.2em] text-[10px]">Détails de la demande</span>
      </div>

      <div className="bg-[#121212] border border-[#2A2A2A] rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 sm:p-12">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-4xl font-black text-white leading-none uppercase tracking-tighter italic">
              {request.title}
            </h1>
            <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", 
              request.status === 'open' ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 
              request.status === 'in_progress' ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]' : 'bg-[#34C759]/20 text-[#34C759]'
            )}>
              {t(request.status)}
            </span>
          </div>

          <p className="text-gray-400 text-xl leading-relaxed mb-10 font-medium">
            {request.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.location.area + ' Sud-Kivu')}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="p-6 bg-[#1E1E1E] border border-[#2A2A2A] rounded-3xl hover:bg-[#262626] transition-colors"
            >
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <MapPin size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('location')}</span>
              </div>
              <p className="font-black text-white flex items-center justify-between">
                {request.location.area}
                <ChevronRight size={14} className="opacity-50" />
              </p>
            </a>
            <div className="p-6 bg-[#1E1E1E] border border-[#2A2A2A] rounded-3xl">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <UserIcon size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Posté Par</span>
              </div>
              <p className="font-black text-white">{request.userName}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-8 sm:p-12 border-t border-[#2A2A2A]">
           {isOwner ? (
             <div className="flex flex-col gap-4">
                {request.status === 'open' && (
                  <button onClick={() => updateStatus('resolved')} className="w-full bg-[#34C759] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} />
                    Marquer comme Résolu
                  </button>
                )}
                <button 
                  onClick={async () => {
                    if(confirm('Supprimer cette demande ?')) {
                      try {
                        await deleteDoc(doc(db, 'requests', id!));
                        navigate('/');
                      } catch (err) {
                        handleFirestoreError(err, 'delete', `requests/${id}`);
                      }
                    }
                  }} 
                  className="w-full text-red-500 font-black uppercase tracking-widest text-[10px] py-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  Supprimer
                </button>
             </div>
           ) : (
             <div className="flex flex-col gap-6">
                <div className="flex gap-4">
                  <a href={`tel:${request.contact}`} className="flex-1 bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all">
                    <Phone size={20} />
                    {t('call')}
                  </a>
                  <a href={`sms:${request.contact}`} className="flex-1 border-2 border-white text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all">
                    {t('message')}
                  </a>
                </div>
                {request.status === 'open' && user && (
                   <button 
                    disabled={actionLoading}
                    onClick={() => updateStatus('in_progress')} 
                    className="w-full bg-[#FF3B30] disabled:bg-gray-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#FF3B30]/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     {actionLoading ? (
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     ) : (
                       t('i_can_help')
                     )}
                   </button>
                )}
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};

const Profile = () => {
  const { t } = useTranslation();
  const { user, profile, refreshProfile, signIn, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phoneNumber: profile?.phoneNumber || '',
    role: profile?.role || 'user' as any,
  });

  if (!user) return <div className="text-center py-12"><button onClick={signIn} className="bg-[#FF3B30] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest">{t('login_google')}</button></div>;

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, 'update', `users/${user?.uid}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-10 pb-32">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Profil</h1>
        <button onClick={() => signOut()} className="text-gray-500 hover:text-[#FF3B30] flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-colors">
          <LogOut size={16} />
          {t('logout')}
        </button>
      </div>

      <div className="bg-[#121212] p-10 rounded-[40px] border border-[#2A2A2A] shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 rounded-full border-2 border-[#2A2A2A] p-2 mb-6">
             <div className="w-full h-full rounded-full overflow-hidden bg-[#1E1E1E]">
                {user.photoURL ? <img src={user.photoURL} alt="p" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <UserIcon size={48} className="m-8 text-gray-700" />}
             </div>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">{profile?.displayName}</h2>
          <span className="text-[#FF3B30] font-black uppercase tracking-[0.3em] text-[9px] mt-2 px-3 py-1 bg-[#FF3B30]/10 rounded-full border border-[#FF3B30]/20">{t(profile?.role || 'user')}</span>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-gray-500">Informations Personnelles</label>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] p-5 rounded-2xl font-bold text-white outline-none"
                  />
                   <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] p-5 rounded-2xl font-bold text-white outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {['user', 'volunteer', 'ngo'].map(r => (
                      <button 
                        key={r}
                        onClick={() => setFormData({...formData, role: r as any})}
                        className={cn("p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", formData.role === r ? "bg-[#FF3B30] border-[#FF3B30] text-white" : "bg-[#1E1E1E] border-[#2A2A2A] text-gray-500")}
                      >
                        {t(r)}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                   <div className="flex justify-between items-center p-5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px] uppercase">{t('phone')}</span>
                    <span className="font-black text-white tracking-widest">{profile?.phoneNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px] uppercase">Email</span>
                    <span className="font-black text-white text-xs">{user.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <button onClick={handleSave} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-xl">
              {t('save')}
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full border border-gray-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-colors hover:bg-white hover:text-black">
              Modifier le Profil
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <FirebaseDiagnostic />
      <PWAInstallButton />
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-red-200 selection:text-red-900">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/request/new" element={<NewRequest />} />
                <Route path="/request/:id" element={<RequestDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
          <TabBar />
        </div>
      </AuthProvider>
    </Router>
  );
}
