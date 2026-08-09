import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { User, Mail, ShieldCheck, MapPin, Phone, Award, Clock, Camera, Loader2, Save, X } from 'lucide-react';

export const Profile = () => {
  const user = useAuthStore((state) => state.user);

  // Fallback for previewing without logging in
  const displayUser = user ? {
    firstName: user.user_metadata?.first_name || '',
    lastName: user.user_metadata?.last_name || '',
    email: user.email || '',
    role: user.user_metadata?.role || 'STUDENT',
    user_metadata: user.user_metadata
  } : {
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@sportsync.com',
    role: 'STUDENT',
  };

  const isStudent = displayUser.role === 'STUDENT';
  const isCoach = displayUser.role === 'COACH';
  const isAdmin = displayUser.role === 'ADMIN';

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(displayUser.user_metadata?.profile_pic_url || '');
  const [formData, setFormData] = useState({
    firstName: displayUser.firstName || '',
    lastName: displayUser.lastName || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
      });
      setAvatarUrl(user.user_metadata?.profile_pic_url || '');
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          profile_pic_url: avatarUrl
        }
      });
      if (error) throw error;
      
      // Update local state implicitly if authStore listens to auth state changes,
      // but to be safe we trigger a session refresh so the store gets the new metadata.
      await supabase.auth.refreshSession();
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-foreground/60 mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shadow-xl overflow-hidden transition-all group-hover:border-primary/50 block relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-success rounded-full border-2 border-background flex items-center justify-center pointer-events-none">
                <ShieldCheck className="w-3 h-3 text-background" />
              </div>
            </div>
            
            {isEditing ? (
              <div className="w-full space-y-3 mb-2">
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input 
                  type="text" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Profile Picture URL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            ) : (
              <h2 className="text-2xl font-bold">{displayUser.firstName} {displayUser.lastName}</h2>
            )}
            <p className="text-primary font-medium text-sm mt-1 uppercase tracking-wider">{displayUser.role}</p>
            
            <div className="w-full mt-6 space-y-4 text-left">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-3 text-foreground/50" />
                <span className="text-foreground/80">{displayUser.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-3 text-foreground/50" />
                <span className="text-foreground/80">+91 98765 43210</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-3 text-foreground/50" />
                <span className="text-foreground/80">Mumbai, India</span>
              </div>
            </div>
            
            <div className="w-full mt-8 flex flex-col gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full btn-primary flex justify-center items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-foreground/70 hover:bg-white/5 transition-colors text-sm font-semibold flex justify-center items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="w-full btn-primary">Edit Profile</button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Role Specific Details */}
        <div className="md:col-span-2 space-y-6">
          
          {isStudent && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary" />
                Student Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Assigned Coach</p>
                  <p className="font-medium">Sarah Jenkins (Tennis)</p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Current Level</p>
                  <p className="font-medium text-success flex items-center">
                    Advanced
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-white/5 sm:col-span-2">
                  <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Emergency Contact</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="font-medium">Mr. Johnson (Father)</p>
                    <p className="text-sm font-medium opacity-80">+91 99999 88888</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isCoach && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary" />
                Coach Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Specialization</p>
                  <p className="font-medium">Tennis / Advanced</p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Joined Date</p>
                  <p className="font-medium flex items-center">
                    Jan 15, 2023
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-white/5 sm:col-span-2">
                  <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Bio</p>
                  <p className="text-sm font-medium mt-1 text-foreground/80 leading-relaxed">
                    Former national level tennis player with over 8 years of coaching experience. 
                    Specializes in technical refinement and mental conditioning for competitive tournaments.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isAdmin && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
                Admin Privileges
              </h3>
              <div className="bg-background/50 p-4 rounded-xl border border-white/5 space-y-3">
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm font-medium">Manage Users</span>
                    <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md">Full Access</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-sm font-medium">Financial Records</span>
                    <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md">Full Access</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">System Settings</span>
                    <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md">Full Access</span>
                 </div>
              </div>
            </motion.div>
          )}

          {/* Common Section: Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary mr-4 relative before:absolute before:top-3 before:left-1/2 before:-translate-x-1/2 before:w-[1px] before:h-10 before:bg-white/10 last:before:hidden" />
                  <div>
                    <p className="text-sm font-medium">Logged in from new device</p>
                    <p className="text-xs text-foreground/50 mt-0.5">{i + 1} day{i > 0 ? 's' : ''} ago • Mumbai, IN</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
