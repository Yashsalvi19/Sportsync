import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';
import { CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/apiClient';

export const Attendance = () => {
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.user_metadata?.role === 'STUDENT';
  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/attendance');
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching attendance:', error);
        return [];
      }
    },
  });

  const columns = [
    { key: 'studentName', label: 'Athlete Name' },
    { key: 'sessionDate', label: 'Session Date' },
    { key: 'status', label: 'Status', render: (val) => {
      let colorClass = '';
      if (val === 'PRESENT') colorClass = 'bg-success/20 text-success';
      else if (val === 'ABSENT') colorClass = 'bg-danger/20 text-danger';
      else if (val === 'LATE') colorClass = 'bg-warning/20 text-warning';
      else colorClass = 'bg-foreground/10 text-foreground';
      return <span className={`px-2 py-1 rounded-md text-xs font-bold ${colorClass}`}>{val}</span>;
    }},
    { key: 'markedByCoachName', label: 'Marked By' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-foreground/60 mt-1">Track student daily presence.</p>
        </div>
        {!isStudent && (
          <button className="btn-primary flex items-center">
            <CheckSquare className="w-4 h-4 mr-2" />
            Mark Attendance
          </button>
        )}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        {isLoading ? (
          <div className="py-10 text-center text-foreground/50">Loading records...</div>
        ) : (
          <DataTable columns={columns} data={data || []} onEdit={!isStudent ? (item) => console.log('Edit', item) : undefined} />
        )}
      </motion.div>
    </div>
  );
};
