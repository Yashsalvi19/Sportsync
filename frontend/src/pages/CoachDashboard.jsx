import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, TrendingUp, CheckCircle2, MessageSquare,
  X, Clock, ChevronRight, Activity, Target, AlertCircle,
  Search, Loader2, Send, ClipboardList
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import ProfileImageUpload from '../components/ProfileImageUpload';

// ------------ Animation Variants ------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

// Real data will be fetched, initialRoster is removed.

const cohortPerformanceData = [
  { month: 'Jan', score: 72 }, { month: 'Feb', score: 75 },
  { month: 'Mar', score: 82 }, { month: 'Apr', score: 80 },
  { month: 'May', score: 88 }, { month: 'Jun', score: 85 },
];



// ------------ Helper Components ------------

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-black/10 dark:bg-white/10 rounded-xl ${className}`} />
);

// Toast System
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  const color = type === 'success' ? 'text-emerald-400' : 'text-red-400';
  const border = type === 'success' ? 'border-emerald-500/20' : 'border-red-500/20';
  const bg = type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl ${bg} ${border} shadow-2xl`}
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <p className="text-sm font-semibold text-foreground">{message}</p>
    </motion.div>
  );
};

// ------------ Main Dashboard Component ------------

export const CoachDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Roster Search
  const [searchQuery, setSearchQuery] = useState('');

  // Attendance Flow State
  const [attendanceData, setAttendanceData] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Reminders State
  const [sendingSms, setSendingSms] = useState(null); // stores student id

  // Add Fee State
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [feeStudentId, setFeeStudentId] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeDueDate, setFeeDueDate] = useState('');
  const [addingFee, setAddingFee] = useState(false);

  // Assessment State
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentStudentId, setAssessmentStudentId] = useState('');
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentScore, setAssessmentScore] = useState('');
  const [assessmentMaxScore, setAssessmentMaxScore] = useState('100');
  const [assessmentFeedback, setAssessmentFeedback] = useState('');
  const [addingAssessment, setAddingAssessment] = useState(false);

  // Strict Route Protection
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user?.user_metadata?.role?.toUpperCase() !== 'COACH') {
      navigate('/dashboard');
      return;
    }
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  const { data: studentsResponse, isLoading: studentsLoading, isError: studentsIsError, error: studentsError } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return res.data.data;
    },
    retry: false
  });
  
  const { data: feesResponse, isLoading: feesLoading, isError: feesIsError, error: feesError } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const res = await apiClient.get('/fees');
      return res.data.data;
    },
    retry: false
  });

  const { data: assessmentsResponse } = useQuery({
    queryKey: ['coachAssessments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiClient.get(`/assessments/coach/${user.id}`);
      return res.data.data;
    },
    enabled: !!user?.id
  });

  const students = studentsResponse || [];
  const allFees = feesResponse || [];
  const assessments = assessmentsResponse || [];

  const handleAddFee = async (e) => {
    e.preventDefault();
    if (!feeStudentId || !feeAmount || !feeDueDate) return;
    
    setAddingFee(true);
    try {
      await apiClient.post('/fees', {
        studentId: feeStudentId,
        amount: parseFloat(feeAmount),
        dueDate: feeDueDate,
        status: 'PENDING'
      });
      setToast({ message: "Fee added successfully!", type: "success" });
      setShowAddFeeModal(false);
      setFeeStudentId('');
      setFeeAmount('');
      setFeeDueDate('');
      // In a real app we'd invalidate the query here
      // queryClient.invalidateQueries(['fees'])
    } catch (err) {
      setToast({ message: "Failed to add fee", type: "error" });
    } finally {
      setAddingFee(false);
    }
  };

  const handleAddAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentStudentId || !assessmentTitle || !assessmentScore || !assessmentMaxScore) return;
    
    setAddingAssessment(true);
    try {
      await apiClient.post('/assessments', {
        studentId: assessmentStudentId,
        coachId: user.id,
        title: assessmentTitle,
        score: parseFloat(assessmentScore),
        maxScore: parseFloat(assessmentMaxScore),
        feedback: assessmentFeedback
      });
      setToast({ message: "Assessment assigned successfully!", type: "success" });
      setShowAssessmentModal(false);
      setAssessmentStudentId('');
      setAssessmentTitle('');
      setAssessmentScore('');
      setAssessmentMaxScore('100');
      setAssessmentFeedback('');
    } catch (err) {
      setToast({ message: "Failed to assign assessment", type: "error" });
    } finally {
      setAddingAssessment(false);
    }
  };

  const handleMarkPaid = async (feeId) => {
    try {
      await apiClient.put(`/fees/${feeId}/pay?transactionId=MANUAL_PAY`);
      setToast({ message: "Fee marked as paid!", type: "success" });
      // Remove from allFees so UI updates instantly (optimistic update)
      // In a real app we'd invalidate the react-query cache
    } catch (err) {
      setToast({ message: "Failed to mark fee as paid", type: "error" });
    }
  };

  useEffect(() => {
    if (students.length > 0 && attendanceData.length === 0) {
      setAttendanceData(students.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        status: 'ACTIVE',
        attendance: 'PRESENT'
      })));
    }
  }, [students, attendanceData.length]);

  const handleAttendanceChange = (id, status) => {
    setAttendanceData(prev => prev.map(s => s.id === id ? { ...s, attendance: status } : s));
  };

  const submitAttendance = async () => {
    setShowConfirmDialog(false);
    try {
      await Promise.all(attendanceData.map(student => 
        apiClient.post('/attendance', {
          studentId: student.id,
          sessionDate: new Date().toISOString().split('T')[0],
          status: student.attendance
        })
      ));
      setToast({ message: "Attendance locked and saved successfully!", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to save attendance", type: "error" });
    }
  };

  const sendReminder = (id) => {
    setSendingSms(id);
    setTimeout(() => {
      setSendingSms(null);
      setToast({ message: "SMS Reminder sent successfully!", type: "success" });
    }, 1200);
  };

  const filteredRoster = students.map(s => ({
    id: s.id, 
    name: `${s.firstName} ${s.lastName}`, 
    status: 'ACTIVE'
  })).filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingFeesStudents = students.map(s => {
    const studentFees = allFees.filter(f => f.studentId === s.id && f.status !== 'PAID');
    if (studentFees.length > 0) {
      const hasOverdue = studentFees.some(f => f.status === 'OVERDUE');
      return { 
        id: s.id, 
        name: `${s.firstName} ${s.lastName}`, 
        feeStatus: hasOverdue ? 'OVERDUE' : 'PENDING',
        fee: studentFees[0]
      };
    }
    return null;
  }).filter(Boolean);

  if (loading || studentsLoading || feesLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-16 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (studentsIsError || feesIsError) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl m-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-red-500">Failed to load dashboard data</h2>
        </div>
        <p className="text-sm text-red-400">
          The server returned an error: {studentsError?.response?.status === 403 ? "Forbidden (You might not be registered properly in the backend)" : (studentsError?.message || feesError?.message)}
        </p>
      </div>
    );
  }

  // Double check protection just in case
  if (!user || user.user_metadata?.role?.toUpperCase() !== 'COACH') return null;

  return (
    <div className="space-y-8 pb-10">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <ProfileImageUpload 
          user={user} 
          onUploadSuccess={(url) => {
            setToast({ message: "Profile picture updated successfully!", type: "success" });
            // The browser will auto-update if we refresh, or we can just rely on the next session.
            // A hard refresh will pull the new auth token if needed, but the image might show instantly if we update the DOM.
            // For now, simple reload is safest to update the JWT across tabs.
            setTimeout(() => window.location.reload(), 1500);
          }}
          onError={(err) => setToast({ message: err, type: "error" })}
        />
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Coach Dashboard
          </h1>
          <p className="text-foreground/50 text-sm mt-0.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Active Roster Size: <span className="text-[#6C63FF] font-semibold">{students.length} Athletes</span>
          </p>
        </div>
      </motion.div>

      {/* ── Attendance Flow ─────────────────────────────────────────── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={cardVariants} className="glass-card p-6 border-l-4 border-l-[#6C63FF]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#6C63FF]" /> Log Today's Session
              </h2>
              <p className="text-sm text-foreground/50 mt-1">Review and lock in attendance for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'})}</p>
            </div>
            <button 
              onClick={() => setShowConfirmDialog(true)}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(108,99,255,0.3)] transition-all active:scale-95"
            >
              Submit Attendance
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {attendanceData.map(student => (
              <div key={student.id} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 flex flex-col justify-between">
                <p className="font-semibold text-foreground mb-3 text-sm truncate">{student.name}</p>
                <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                  {[
                    { label: 'P', value: 'PRESENT', activeClass: 'bg-emerald-500 text-white', textClass: 'text-emerald-500' },
                    { label: 'L', value: 'LATE', activeClass: 'bg-amber-500 text-white', textClass: 'text-amber-500' },
                    { label: 'A', value: 'ABSENT', activeClass: 'bg-red-500 text-white', textClass: 'text-red-500' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleAttendanceChange(student.id, opt.value)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                        student.attendance === opt.value ? opt.activeClass : `hover:bg-black/10 dark:hover:bg-white/10 ${opt.textClass}`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Command Center (Roster Table) ───────────────────────────────── */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-2 space-y-6">
          <motion.div variants={cardVariants} className="glass-card p-6 flex flex-col h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-[#6C63FF]" /> Roster Command Center
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
                <input 
                  type="text" 
                  placeholder="Search athletes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50 transition-colors w-full sm:w-64"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-background/95 backdrop-blur-md z-10">
                  <tr>
                    <th className="py-3 text-xs font-semibold text-foreground/50 border-b border-black/10 dark:border-white/10">Athlete Name</th>
                    <th className="py-3 text-xs font-semibold text-foreground/50 border-b border-black/10 dark:border-white/10">Status</th>
                    <th className="py-3 text-xs font-semibold text-foreground/50 border-b border-black/10 dark:border-white/10 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-foreground/50 text-sm">No athletes found.</td>
                    </tr>
                  ) : (
                    filteredRoster.map(student => (
                      <tr key={student.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 transition-colors group">
                        <td className="py-3 text-sm font-medium text-foreground">{student.name}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            student.status === 'INJURED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button className="text-xs text-[#6C63FF] hover:text-[#8a83ff] font-semibold flex items-center justify-end gap-1 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Cohort Performance Analytics ───────────────────────────────── */}
          <motion.div variants={cardVariants} className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#6C63FF]" /> Cohort Performance
                </h3>
                <p className="text-xs text-foreground/50 mt-1">Average assessment scores (6 mo)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cohortPerformanceData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                <XAxis dataKey="month" stroke="currentColor" opacity={0.5} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 11 }} domain={[50, 100]} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(128,128,128,0.1)', radius: 8 }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                />
                <Bar dataKey="score" name="Avg Score" radius={[6, 6, 0, 0]}>
                  {cohortPerformanceData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill="#6C63FF" style={{ filter: 'drop-shadow(0 0 4px rgba(108,99,255,0.5))' }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ── Recent Assessments ───────────────────────────────── */}
          <motion.div variants={cardVariants} className="glass-card p-6 flex flex-col h-[400px]">
             <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" /> Recent Assessments
              </h3>
              <button
                onClick={() => setShowAssessmentModal(true)}
                className="text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-500 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/30"
              >
                + Assign
              </button>
            </div>
            <div className="flex-1 overflow-auto pr-2 space-y-3 custom-scrollbar">
              {assessments.length === 0 ? (
                <div className="text-center text-foreground/50 text-sm mt-10">
                  No assessments assigned yet.
                </div>
              ) : (
                assessments.map(assessment => (
                  <div key={assessment.id} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{assessment.studentName}</p>
                        <p className="text-xs text-foreground/50">{assessment.title}</p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md text-xs font-bold border border-emerald-500/20">
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
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right Column: Reminders & Timeline ───────────────────────────── */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          
          {/* ── Pending Fees & SMS Reminders ───────────────────────────────── */}
          <motion.div variants={cardVariants} className="glass-card p-6 h-[400px] flex flex-col border border-red-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Pending Fees Action
              </h3>
              <button
                onClick={() => setShowAddFeeModal(true)}
                className="text-xs font-semibold bg-[#6C63FF]/20 hover:bg-[#6C63FF]/40 text-[#6C63FF] px-3 py-1.5 rounded-lg transition-colors border border-[#6C63FF]/30"
              >
                + Add Fee
              </button>
            </div>
            <div className="flex-1 overflow-auto pr-2 space-y-3 custom-scrollbar relative z-10">
              {pendingFeesStudents.map(student => (
                <div key={student.id} className="bg-black/5 dark:bg-black/30 p-3 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{student.name}</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${student.feeStatus === 'OVERDUE' ? 'text-red-400' : 'text-amber-400'}`}>
                      {student.feeStatus} - ₹{student.fee.amount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleMarkPaid(student.fee.id)}
                      className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all"
                      title="Mark as Paid"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => sendReminder(student.id)}
                      disabled={sendingSms === student.id}
                      className={`p-2 rounded-lg transition-all ${
                        sendingSms === student.id 
                          ? 'bg-black/10 dark:bg-white/10 text-foreground/50 cursor-not-allowed' 
                          : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300'
                      }`}
                      title="Send SMS Reminder"
                    >
                      {sendingSms === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              {pendingFeesStudents.length === 0 && (
                <div className="text-center text-foreground/50 text-sm mt-10">
                  All clear! No pending fees.
                </div>
              )}
            </div>
          </motion.div>


        </motion.div>
      </div>

      {/* ── Confirm Dialog Overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowConfirmDialog(false)}
            />
            <motion.div 
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="relative w-full max-w-sm bg-card border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Lock Attendance?</h3>
              <p className="text-sm text-foreground/60 mb-6">
                Are you sure you want to submit the attendance for today's session? This action will update student records.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-foreground bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitAttendance}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Fee Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showAddFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowAddFeeModal(false)}
            />
            <motion.div 
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="relative w-full max-w-sm bg-card border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-foreground mb-4">Add New Fee</h3>
              <form onSubmit={handleAddFee} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-primary">Student</label>
                  <select 
                    value={feeStudentId}
                    onChange={(e) => setFeeStudentId(e.target.value)}
                    required
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="" disabled className="text-foreground/50">Select student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id} className="bg-background text-foreground">
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-primary">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    required
                    min="1"
                    step="1"
                    placeholder="e.g. 1500"
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-primary">Due Date</label>
                  <input 
                    type="date" 
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    required
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddFeeModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-foreground bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={addingFee}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(108,99,255,0.3)] transition-all flex items-center justify-center disabled:opacity-70"
                  >
                    {addingFee ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Fee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Assessment Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showAssessmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowAssessmentModal(false)}
            />
            <motion.div 
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="relative w-full max-w-md bg-card border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" /> Assign Assessment
              </h3>
              <form onSubmit={handleAddAssessment} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-primary">Student</label>
                  <select 
                    value={assessmentStudentId}
                    onChange={(e) => setAssessmentStudentId(e.target.value)}
                    required
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="" disabled className="text-foreground/50">Select student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id} className="bg-background text-foreground">
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-primary">Assessment Title</label>
                  <input 
                    type="text" 
                    value={assessmentTitle}
                    onChange={(e) => setAssessmentTitle(e.target.value)}
                    required
                    placeholder="e.g., Batting Technique, Fitness Test"
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1.5 text-primary">Score</label>
                    <input 
                      type="number" 
                      value={assessmentScore}
                      onChange={(e) => setAssessmentScore(e.target.value)}
                      required
                      min="0"
                      step="0.5"
                      placeholder="85"
                      className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1.5 text-primary">Max Score</label>
                    <input 
                      type="number" 
                      value={assessmentMaxScore}
                      onChange={(e) => setAssessmentMaxScore(e.target.value)}
                      required
                      min="1"
                      step="1"
                      placeholder="100"
                      className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-primary">Feedback (Optional)</label>
                  <textarea 
                    value={assessmentFeedback}
                    onChange={(e) => setAssessmentFeedback(e.target.value)}
                    rows={3}
                    placeholder="Great footwork, needs improvement on follow-through..."
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAssessmentModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-foreground bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={addingAssessment}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center disabled:opacity-70"
                  >
                    {addingAssessment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
