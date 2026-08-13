import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, CreditCard, CalendarCheck, ChevronRight,
  Star, User, AlertCircle, CheckCircle2, Clock, Flame, ClipboardList
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/apiClient';
import { supabase } from '../lib/supabase';
import ProfileImageUpload from '../components/ProfileImageUpload';

// Mock Data removed as it will be dynamically computed.

const sessionBreakdown = [
  { name: 'Present', value: 22, color: '#22C55E' },
  { name: 'Late', value: 4, color: '#F59E0B' },
  { name: 'Absent', value: 4, color: '#EF4444' },
];



const tournaments = [
  { name: 'Junior State Cricket Cup', date: '2024-08-15', status: 'REGISTERED', type: 'upcoming' },
  { name: 'District T20 Trophy', date: '2024-09-02', status: 'PENDING', type: 'upcoming' },
  { name: 'Inter-Academy Showdown', date: '2024-07-05', status: 'COMPLETED', type: 'past' },
];

const MOTIVATIONAL_QUOTES = [
  "🏆 Champions keep playing until they get it right.",
  "🔥 Hard work beats talent when talent doesn't work hard.",
  "⭐ Don't stop when you're tired. Stop when you're done.",
  "⚡ The only bad workout is the one that didn't happen.",
  "💪 Success is what comes after you stop making excuses.",
  "🚀 Push yourself, because no one else is going to do it for you."
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-black/10 dark:bg-white/10 rounded-xl ${className}`} />
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl p-3 shadow-2xl">
      {label && <p className="text-xs font-semibold text-foreground/50 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}{p.unit || ''}
        </p>
      ))}
    </div>
  );
};

// ─── Fee Status Card ──────────────────────────────────────────────────────────

const FeeCard = ({ fee, onPayClick }) => {
  if (!fee) return (
    <motion.div variants={cardVariants} className={`glass-card p-6 border border-black/10 dark:border-white/10 relative overflow-hidden flex items-center justify-center`}>
      <p className="text-foreground/50">No upcoming fees</p>
    </motion.div>
  );

  const cfg = {
    PAID: { color: '#22C55E', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, label: 'Paid' },
    PENDING: { color: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock, label: 'Pending' },
    OVERDUE: { color: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle, label: 'Overdue' },
  }[fee.status] || { color: '#22C55E', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, label: 'Paid' };

  const Icon = cfg.icon;

  return (
    <motion.div variants={cardVariants} className={`glass-card p-6 border ${cfg.border} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: cfg.color }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground/60 font-medium">Fee Status</p>
          <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">
            ₹{fee.amount?.toLocaleString('en-IN') || 0}
          </p>
          <p className="text-xs text-foreground/50 mt-1">Due: {fee.dueDate || 'N/A'}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} border ${cfg.border}`}
          style={{ color: cfg.color }}>
          <Icon className="w-3.5 h-3.5" /> {cfg.label}
        </span>
      </div>
      {(fee.status === 'OVERDUE' || fee.status === 'PENDING') && (
        <button
          onClick={onPayClick}
          className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-foreground transition-all active:scale-[0.98] shadow-lg"
          style={{ background: `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color})`, boxShadow: `0 8px 24px ${cfg.color}40` }}>
          Pay Now →
        </button>
      )}
    </motion.div>
  );
};

// ─── Tournament Card ──────────────────────────────────────────────────────────

const TournamentCard = ({ t }) => {
  const statusCfg = {
    REGISTERED: { color: '#22C55E', bg: 'bg-emerald-500/10', label: 'Registered' },
    PENDING: { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'Pending' },
    COMPLETED: { color: '#9C57F3', bg: 'bg-purple-500/10', label: 'Completed' },
  }[t.status] || {};

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-black/10 dark:hover:border-white/10">
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
        <Trophy className="w-5 h-5 text-[#9C57F3]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">{t.name}</p>
        <p className="text-xs text-foreground/50 mt-0.5">{t.date}</p>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusCfg.bg} flex-shrink-0`}
        style={{ color: statusCfg.color }}>
        {statusCfg.label}
      </span>
      <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-[#9C57F3] group-hover:translate-x-1 transition-all" />
    </div>
  );
};

// ─── Custom Donut Label ───────────────────────────────────────────────────────

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const studentId = user?.id; // The Supabase user UUID

  // GPay Modal State
  const [showGPayModal, setShowGPayModal] = useState(false);

  // Fetch Attendance
  const { data: attendanceData, isLoading: attLoading } = useQuery({
    queryKey: ['attendance', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const res = await apiClient.get(`/attendance/student/${studentId}`);
      return res.data.data || [];
    },
    enabled: !!studentId
  });

  // Fetch Fees
  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ['fees', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const res = await apiClient.get(`/fees/student/${studentId}`);
      return res.data.data || [];
    },
    enabled: !!studentId
  });

  // Fetch Tournaments
  const { data: tournamentsData, isLoading: tourLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const res = await apiClient.get(`/tournaments`);
      return res.data.data || [];
    }
  });

  // Fetch Assessments
  const { data: assessmentsData, isLoading: assLoading } = useQuery({
    queryKey: ['studentAssessments', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const res = await apiClient.get(`/assessments/student/${studentId}`);
      return res.data.data || [];
    },
    enabled: !!studentId
  });

  // Dynamically compute date-wise scores from live assessments data
  const datewiseScores = useMemo(() => {
    if (!assessmentsData || assessmentsData.length === 0) return [];

    // Sort assessments chronologically for the chart
    const sorted = [...assessmentsData].sort((a, b) => new Date(a.assessmentDate) - new Date(b.assessmentDate));

    return sorted.map(ass => {
      const date = new Date(ass.assessmentDate);
      const dateStr = date.toLocaleString('default', { day: '2-digit', month: 'short' });
      // Calculate percentage score
      const percentage = (ass.score / (ass.maxScore || 100)) * 100;
      
      return {
        date: dateStr,
        score: Math.round(percentage)
      };
    });
  }, [assessmentsData]);

  const loading = attLoading || feesLoading || tourLoading || assLoading;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-16 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Calculate real attendance stats
  const totalSessions = attendanceData?.length || 0;
  const presentSessions = attendanceData?.filter(a => a.status === 'PRESENT').length || 0;
  const lateSessions = attendanceData?.filter(a => a.status === 'LATE').length || 0;
  const absentSessions = attendanceData?.filter(a => a.status === 'ABSENT').length || 0;

  const realSessionBreakdown = [
    { name: 'Present', value: presentSessions, color: '#22C55E' },
    { name: 'Late', value: lateSessions, color: '#F59E0B' },
    { name: 'Absent', value: absentSessions, color: '#EF4444' },
  ];
  const attendancePct = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;
  const pctColor = attendancePct >= 80 ? '#22C55E' : attendancePct >= 60 ? '#F59E0B' : '#EF4444';

  // Calculate streaks
  let currentStreak = 0;
  let maxStreak = 0;
  if (attendanceData && attendanceData.length > 0) {
    const sortedData = [...attendanceData].sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
    let tempStreak = 0;
    for (const record of sortedData) {
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else if (record.status === 'ABSENT') {
        tempStreak = 0;
      }
    }
    const descData = [...sortedData].reverse();
    for (const record of descData) {
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        currentStreak++;
      } else if (record.status === 'ABSENT') {
        break;
      }
    }
  }

  // Get most recent pending fee
  const pendingFees = feesData?.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE') || [];
  const latestFee = pendingFees.length > 0 ? pendingFees[0] : (feesData?.length > 0 ? feesData[0] : null);

  return (
    <div className="space-y-8">

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <ProfileImageUpload 
            user={user} 
            onUploadSuccess={(url) => {
              // Same as coach, just reload for now to see it instantly without complex state lifting
              setTimeout(() => window.location.reload(), 1500);
            }}
            onError={(err) => alert(err)}
          />
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Hey, {user?.user_metadata?.first_name || 'Student'} 👋
            </h1>
            <p className="text-foreground/50 text-sm mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Assigned Coach: <span className="text-[#9C57F3] font-semibold">Sarah Jenkins</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Status Grid ────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Fee Card */}
        <FeeCard fee={latestFee} onPayClick={() => setShowGPayModal(true)} />

        {/* Attendance Quick Stat */}
        <motion.div variants={cardVariants} className="glass-card p-6 flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-foreground" opacity={0.08} strokeWidth="3.5" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={pctColor}
                strokeWidth="3.5" strokeDasharray={`${attendancePct}, 100`}
                strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${pctColor})` }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-foreground">
              {attendancePct}%
            </span>
          </div>
          <div>
            <p className="text-sm text-foreground/60 font-medium">Attendance</p>
            <p className="text-xl font-extrabold text-foreground mt-1">{presentSessions} / {totalSessions || 1}</p>
            <p className={`text-xs mt-1 font-semibold ${attendancePct >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {attendancePct >= 80 ? '✓ On Track' : 'Needs Improvement'}
            </p>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div variants={cardVariants} className="glass-card p-6 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at bottom right, #F59E0B, transparent 70%)' }} />
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Flame className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-foreground/60 font-medium">Current Streak</p>
            <p className="text-3xl font-extrabold text-foreground tracking-tight mt-1">{currentStreak} <span className="text-lg font-semibold text-foreground/50">days</span></p>
            <p className="text-xs text-amber-400 font-semibold mt-1">Personal best: {maxStreak} days</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Charts Row 1 ───────────────────────────────────────────── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Radial Attendance */}
        <motion.div variants={cardVariants} className="glass-card p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-foreground text-sm">Attendance Rate</h3>
              <p className="text-xs text-foreground/50 mt-0.5">This semester</p>
            </div>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart innerRadius="60%" outerRadius="90%" data={[{ value: attendancePct, fill: pctColor }]} startAngle={90} endAngle={-270}>
              <RadialBar background={{ fill: 'currentColor', opacity: 0.05 }} className="text-foreground" dataKey="value" cornerRadius={8} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-extrabold" fontSize={28} fontWeight={800}>{attendancePct}%</text>
              <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground/50" fontSize={11}>Attendance</text>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="w-full flex justify-between text-xs text-foreground/50 mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Present: {presentSessions}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Late: {attendanceData?.filter(a => a.status === 'LATE').length || 0}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Absent: {attendanceData?.filter(a => a.status === 'ABSENT').length || 0}</span>
          </div>
        </motion.div>

        {/* Date-wise Score Bar Chart */}
        <motion.div variants={cardVariants} className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Assessment History</h3>
              <p className="text-xs text-foreground/50 mt-0.5">Scores across recent assessments</p>
            </div>
            <Star className="w-4 h-4 text-[#9C57F3]" />
          </div>
          <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
            <div style={{ minWidth: `${Math.max(60 * (datewiseScores?.length || 0), 300)}px`, height: '185px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datewiseScores} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.5} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05, radius: 8 }} />
                  <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]}>
                    {datewiseScores.map((entry, idx) => (
                      <Cell key={idx} fill={entry.score >= 90 ? '#22C55E' : entry.score >= 75 ? '#9C57F3' : entry.score > 0 ? '#F59E0B' : 'rgba(156, 163, 175, 0.1)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Assessments List */}
        <motion.div variants={cardVariants} className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Recent Assessments</h3>
              <p className="text-xs text-foreground/50 mt-0.5">Feedback and scores</p>
            </div>
            <ClipboardList className="w-4 h-4 text-[#9C57F3]" />
          </div>
          <div className="flex-1 overflow-auto pr-2 space-y-3 custom-scrollbar max-h-[185px]">
            {assessmentsData?.length > 0 ? (
              assessmentsData.map(assessment => (
                <div key={assessment.id} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{assessment.title}</p>
                      <p className="text-xs text-foreground/50">Coach {assessment.coachName}</p>
                    </div>
                    <span className="bg-[#9C57F3]/10 text-[#9C57F3] px-2 py-1 rounded-md text-xs font-bold border border-[#9C57F3]/20">
                      {assessment.score} / {assessment.maxScore}
                    </span>
                  </div>
                  {assessment.feedback && (
                    <p className="text-xs text-foreground/70 bg-black/5 dark:bg-white/5 p-2 rounded-lg italic">
                      "{assessment.feedback}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-foreground/50 text-sm font-semibold border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                No assessments assigned yet
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Charts Row 2: Donut + Heatmap ──────────────────────────── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Donut / Pie Chart */}
        <motion.div variants={cardVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Session Breakdown</h3>
              <p className="text-xs text-foreground/50 mt-0.5">Overall distribution</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={realSessionBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" labelLine={false} label={renderCustomLabel}>
                {realSessionBreakdown.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} style={{ filter: `drop-shadow(0 0 6px ${entry.color}80)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {realSessionBreakdown.map(s => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-foreground/60">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.name}: <span className="font-bold text-foreground">{s.value}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Motivational Marquee ─────────────────────────────────────── */}
        <motion.div variants={cardVariants} className="lg:col-span-2 flex flex-col justify-center overflow-hidden">
          <div 
            className="relative w-full overflow-hidden py-3"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', 
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' 
            }}
          >
            <motion.div
              className="flex whitespace-nowrap w-max gap-12"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 30, repeat: Infinity }}
            >
              {/* Double the list for seamless looping */}
              {[...MOTIVATIONAL_QUOTES, ...MOTIVATIONAL_QUOTES].map((quote, idx) => (
                <span key={idx} className="text-[#9C57F3] font-bold text-sm uppercase tracking-widest drop-shadow-md">
                  {quote} <span className="mx-6 text-foreground/30">•</span>
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

      </motion.div>

      {/* ── Tournament Center ───────────────────────────────────────── */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-foreground">Tournament Center</h3>
            <p className="text-xs text-foreground/50 mt-0.5">Your registrations & upcoming events</p>
          </div>
          <button className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Browse Events
          </button>
        </div>
        <div className="space-y-1">
          {tournamentsData?.length > 0 ? (
            tournamentsData.map((t, idx) => <TournamentCard key={idx} t={t} />)
          ) : (
            <div className="py-8 text-center text-foreground/40 text-sm font-semibold border border-dashed border-black/10 dark:border-white/10 rounded-xl">
              No upcoming tournaments found
            </div>
          )}
        </div>
      </motion.div>

      {/* ── GPay Payment Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showGPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowGPayModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-card border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-lg p-3">
                <img src="/gpay.png" alt="Google Pay" className="w-full h-full object-contain" />

              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2">Pay via GPay</h3>
              <p className="text-sm text-foreground/70 mb-6">
                Please send the exact amount of <span className="font-bold text-foreground">₹{latestFee?.amount || 0}</span> to the academy's official GPay number:
              </p>

              <div className="bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl py-4 px-6 w-full mb-6">
                <p className="text-3xl font-extrabold tracking-widest text-[#22C55E] drop-shadow-md">
                  +91 98765 43210
                </p>
                <p className="text-xs text-foreground/50 mt-2 font-medium">Academy Account: Sarah Jenkins</p>
              </div>

              <div className="w-full space-y-3">
                <p className="text-xs text-foreground/40 italic">
                  Take a screenshot of the payment receipt and share it with your coach for verification.
                </p>
                <button
                  onClick={() => setShowGPayModal(false)}
                  className="w-full py-3 rounded-xl font-bold text-foreground bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-all border border-black/10 dark:border-white/10"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
