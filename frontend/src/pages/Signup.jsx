import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Activity, Loader2, AlertCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import apiClient from '../api/apiClient';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'COACH'], { required_error: 'Please select a role' }),
});

export const Signup = () => {
  const [globalError, setGlobalError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'STUDENT' }
  });

  const onSubmit = async (data) => {
    setGlobalError('');

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
          }
        }
      });

      if (error) throw error;

      // Register the user in the Spring Boot backend database
      try {
        await apiClient.post('/auth/register', {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: `ROLE_${data.role}`
        });
      } catch (backendErr) {
        console.error('Backend registration failed:', backendErr);
        // Depending on your requirements, you could throw the error here
        // to prevent navigation if backend sync fails.
      }

      // Navigate to dashboard or show success message
      navigate('/dashboard');
    } catch (err) {
      setGlobalError(err.message || 'Error signing up. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* Visual Split */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#492489] to-[#0E0236]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: 'url("/cricket-academy.png")' }} 
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-black/20 dark:border-white/20 p-12 rounded-3xl shadow-2xl flex flex-col items-center"
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
              Join the elite sports academy platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Half */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1220] p-8 relative transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-[#F5EFFC] tracking-tight">Create an account</h2>
            <p className="text-slate-500 dark:text-[#BA8AF5] mt-2 font-medium text-sm">Please enter your details to sign up.</p>
          </div>

          <AnimatePresence>
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
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-[#DBC2FA]">First Name</label>
                <div className="relative group">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7733D7] transition-colors" />
                  <input 
                    type="text" 
                    {...register('firstName')}
                    className="w-full bg-white dark:bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-black/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#7733D7]/50 focus:border-[#7733D7] transition-all text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400"
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-[#EF4444] text-xs font-medium mt-1.5 ml-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div className="w-1/2">
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-[#DBC2FA]">Last Name</label>
                <div className="relative group">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7733D7] transition-colors" />
                  <input 
                    type="text" 
                    {...register('lastName')}
                    className="w-full bg-white dark:bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-black/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#7733D7]/50 focus:border-[#7733D7] transition-all text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400"
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-[#EF4444] text-xs font-medium mt-1.5 ml-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-[#DBC2FA]">Email</label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7733D7] transition-colors" />
                <input 
                  type="email" 
                  {...register('email')}
                  className="w-full bg-white dark:bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-black/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#7733D7]/50 focus:border-[#7733D7] transition-all text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400"
                  placeholder="student@sportsync.com"
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
                  className="w-full bg-white dark:bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-black/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#7733D7]/50 focus:border-[#7733D7] transition-all text-sm text-slate-900 dark:text-foreground placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-[#EF4444] text-xs font-medium mt-1.5 ml-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-[#DBC2FA]">Role</label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" value="STUDENT" {...register('role')} className="peer sr-only" />
                  <div className="text-center py-2.5 rounded-xl border border-slate-200 dark:border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 font-medium text-sm transition-all peer-checked:bg-[#7733D7]/10 peer-checked:border-[#7733D7] peer-checked:text-[#7733D7] dark:peer-checked:text-[#DBC2FA]">
                    Student
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" value="COACH" {...register('role')} className="peer sr-only" />
                  <div className="text-center py-2.5 rounded-xl border border-slate-200 dark:border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 font-medium text-sm transition-all peer-checked:bg-[#7733D7]/10 peer-checked:border-[#7733D7] peer-checked:text-[#7733D7] dark:peer-checked:text-[#DBC2FA]">
                    Coach
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="text-[#EF4444] text-xs font-medium mt-1.5 ml-1">{errors.role.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#7733D7] hover:bg-[#492489] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-[#7733D7]/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/login')} 
              className="text-[#7733D7] hover:text-[#9C57F3] font-semibold transition-colors"
            >
              Sign in
            </button>
          </div>
          
          <div className="mt-12 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} The trio Org. All rights reserved.
          </div>
        </motion.div>
      </div>
    </div>
  );
};
