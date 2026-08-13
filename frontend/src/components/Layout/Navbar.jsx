import { Bell, User, Menu, X, Info, CheckCircle2, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

export const Navbar = ({ onMenuClick }) => {
  const user = useAuthStore((state) => state.user);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setNotifications(data);
      }
    };

    fetchNotifications();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 md:h-20 bg-background/70 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0 text-foreground/70"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-foreground/70" />
          ) : (
            <Moon className="w-5 h-5 text-foreground/70" />
          )}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5 text-foreground/70" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-background" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-card/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-neo dark:shadow-neo-dark overflow-hidden z-50"
              >
                <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-foreground/50 hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-foreground/50 text-sm">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex gap-3">
                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n.type === 'warning' ? 'bg-amber-500/20 text-amber-500' : n.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                          {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{n.title}</p>
                          <p className="text-xs text-foreground/60 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-foreground/40 mt-1">
                            {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 text-center border-t border-black/10 dark:border-white/10">
                  <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Mark all as read</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <Link to="/profile" className="flex items-center gap-3 pl-3 border-l border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 p-1 pr-3 rounded-full transition-colors group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
              {user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'User' : 'Guest User'}
            </p>
            <p className="text-xs text-foreground/50 capitalize">
              {user ? user.user_metadata?.role?.toLowerCase() || 'student' : 'Visitor'}
            </p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary flex-shrink-0 group-hover:bg-primary/30 group-hover:scale-105 transition-all overflow-hidden">
            {user?.user_metadata?.profile_pic_url ? (
              <img src={user.user_metadata.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
