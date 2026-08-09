import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare2, CalendarCheck, CreditCard, Trophy, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { name: 'Dashboard',    path: '/dashboard',   icon: LayoutDashboard },
  { name: 'Coaches',      path: '/coaches',     icon: UserSquare2 },
  { name: 'Students',     path: '/students',    icon: Users },
  { name: 'Attendance',   path: '/attendance',  icon: CalendarCheck },
  { name: 'Fees',         path: '/fees',        icon: CreditCard },
  { name: 'Tournaments',  path: '/tournaments', icon: Trophy },
];

import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const SidebarContent = ({ onLinkClick = () => {} }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const logout = useAuthStore((state) => state.logout);
  const userRole = useAuthStore((state) => state.user?.user_metadata?.role) || 'STUDENT';
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredLinks = links.filter(link => {
    if (userRole === 'STUDENT') {
      return ['Dashboard', 'Coaches', 'Tournaments'].includes(link.name);
    }
    if (userRole === 'COACH') {
      return ['Dashboard', 'Students', 'Attendance', 'Tournaments'].includes(link.name);
    }
    return true; // ADMIN sees everything
  });

  return (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center px-6 border-b border-white/10 flex-shrink-0">
        <img
          src="/logo.png"
          alt="SportSync Logo"
          className="w-8 h-8 object-contain mr-3"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 className="text-xl font-bold tracking-wide text-foreground">SportSync</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath.startsWith(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={onLinkClick}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${
                isActive ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground/70'
              }`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-xl text-danger/80 hover:bg-danger/10 hover:text-danger transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export const Sidebar = ({ mobileOpen, onClose }) => {
  return (
    <>
      {/* Desktop */}
      <aside className="w-64 h-screen hidden md:flex flex-col bg-card backdrop-blur-md border-r border-white/10 fixed left-0 top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-[#0E0236] border-r border-white/10 z-50 flex flex-col md:hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors text-foreground/70"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent onLinkClick={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
