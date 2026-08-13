import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Activity, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';

// Explicit Zod schema definition
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const Login = () => {
  const [globalError, setGlobalError] = useState('');
  const [loginType, setLoginType] = useState('STUDENT');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setGlobalError('');

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Role Validation Based on Selected Slider
      const role = (authData.user?.user_metadata?.role || 'STUDENT').toUpperCase();
      
      if (loginType === 'COACH' && role !== 'COACH' && role !== 'ADMIN') {
        await supabase.auth.signOut();
        throw new Error("Access denied: You are not registered as a Coach.");
      }
      
      if (loginType === 'STUDENT' && role === 'COACH') {
        await supabase.auth.signOut();
        throw new Error("Please use the Coach login portal.");
      }

      navigate('/dashboard');
    } catch (err) {
      setGlobalError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col ${loginType === 'STUDENT' ? 'md:flex-row' : 'md:flex-row-reverse'} font-sans overflow-hidden bg-black`}>
      
      {/* Visual Split - High Res Background with Glassmorphic Overlay */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="absolute inset-0 z-0 md:relative md:w-1/2 overflow-hidden bg-gradient-to-br from-[#492489] to-[#0E0236]"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-all duration-1000"
          style={{ backgroundImage: loginType === 'COACH' ? 'url("/coach-bg.png")' : 'url("/cricket-academy.png")' }} 
        />
        
        {/* Glassmorphic Overlay with Branding */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12">
          <motion.div 
            layout
            className="hidden md:flex bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-black/20 dark:border-white/20 p-12 rounded-3xl shadow-2xl flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 border border-white/30 shadow-inner">
              <Activity className="w-8 h-8 text-foreground" />
            </div>
            <motion.h1 
              className="text-4xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#9C57F3] to-[#22C55E]"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              SportSync
            </motion.h1>
            <p className="text-[#DBC2FA] text-lg text-center max-w-sm font-medium leading-relaxed">
              Empowering academies with elite management tools, from court to cloud.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Interactive Form Half */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10 min-h-screen md:min-h-0 md:bg-[#F8FAFC] md:dark:bg-[#0B1220]"
      >
        <motion.div 
          layout
          className="w-full max-w-md p-6 sm:p-10 md:p-0"
        >
          {/* Mobile Only Header (Since the big overlay is hidden on mobile) */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 border border-primary/30 shadow-inner">
              <Activity className="w-6 h-6 text-foreground" />
            </div>
            <motion.h1 
              className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#9C57F3] to-[#22C55E]"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              SportSync
            </motion.h1>
          </div>
          {/* Slider Toggle */}
          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-xl mb-10 relative w-full max-w-[280px] mx-auto md:mx-0 shadow-inner border border-black/5 dark:border-white/5">
            {['STUDENT', 'COACH'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setLoginType(type);
                  setGlobalError('');
                }}
                className={`flex-1 relative py-2.5 text-sm font-bold z-10 transition-colors ${
                  loginType === type ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {type === 'STUDENT' ? 'Student Login' : 'Coach Login'}
                {loginType === type && (
                  <motion.div
                    layoutId="loginTypePill"
                    className="absolute inset-0 bg-[#7733D7] rounded-lg -z-10 shadow-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-[#F5EFFC] tracking-tight">
              {loginType === 'STUDENT' ? 'Welcome Athlete' : 'Welcome Coach'}
            </h2>
            <p className="text-slate-500 dark:text-[#BA8AF5] mt-2 font-medium text-sm">
              Please enter your details to sign in.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-start"
              >
                <AlertCircle className="w-5 h-5 text-[#EF4444] mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm font-medium text-[#EF4444]">{globalError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-[#DBC2FA]">Email</label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7733D7] transition-colors" />
                <input 
                  type="email" 
                  {...register('email')}
                  className="w-full bg-white dark:bg-black/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#7733D7]/50 focus:border-[#7733D7] transition-all text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400"
                  placeholder={loginType === 'STUDENT' ? "athlete@sportsync.com" : "coach@sportsync.com"}
                />
              </div>
              {errors.email && (
                <p className="text-[#EF4444] text-xs font-medium mt-1.5 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-[#DBC2FA]">Password</label>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7733D7] transition-colors" />
                <input 
                  type="password" 
                  {...register('password')}
                  className="w-full bg-white dark:bg-black/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#7733D7]/50 focus:border-[#7733D7] transition-all text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-[#EF4444] text-xs font-medium mt-1.5 ml-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 mb-8">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-[#7733D7] peer-checked:border-[#7733D7] transition-colors" />
                  <svg className="absolute w-3 h-3 left-0.5 top-0.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-foreground" viewBox="0 0 14 14" fill="none">
                    <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-2 group-hover:text-slate-900 dark:group-hover:text-foreground transition-colors">Remember for 30 days</span>
              </label>
              <a href="#" className="text-sm font-semibold text-[#7733D7] hover:text-[#9C57F3] transition-colors">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#7733D7] hover:bg-[#492489] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-[#7733D7]/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/signup')} 
              className="text-[#7733D7] hover:text-[#9C57F3] font-semibold transition-colors"
            >
              Sign up
            </button>
          </div>

          <div className="mt-12 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} The trio Org. All rights reserved.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
