import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';
import { CreditCard, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export const Fees = () => {
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.user_metadata?.role === 'STUDENT';
  const { data, isLoading } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      return [
        { id: 1, studentName: 'Alice Johnson', amount: 5000, dueDate: '2023-11-01', status: 'PAID', paymentDate: '2023-10-20' },
        { id: 2, studentName: 'Bob Smith', amount: 5000, dueDate: '2023-11-01', status: 'PENDING', paymentDate: null },
        { id: 3, studentName: 'Charlie Brown', amount: 5000, dueDate: '2023-10-01', status: 'OVERDUE', paymentDate: null },
      ];
    },
  });

  const columns = [
    { key: 'studentName', label: 'Student Name' },
    { key: 'amount', label: 'Amount', render: (val) => <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-1" />{val.toLocaleString('en-IN')}</span> },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status', render: (val) => {
      let colorClass = '';
      if (val === 'PAID') colorClass = 'bg-success/20 text-success';
      else if (val === 'OVERDUE') colorClass = 'bg-danger/20 text-danger';
      else colorClass = 'bg-warning/20 text-warning';
      return <span className={`px-2 py-1 rounded-md text-xs font-bold ${colorClass}`}>{val}</span>;
    }},
    { key: 'paymentDate', label: 'Paid On', render: (val) => val || '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fees & Payments</h1>
          <p className="text-foreground/60 mt-1">Manage academy fee collection.</p>
        </div>
        {!isStudent && (
          <button className="btn-primary flex items-center">
            <CreditCard className="w-4 h-4 mr-2" /> Generate Invoice
          </button>
        )}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        {isLoading ? (
          <div className="py-10 text-center text-foreground/50">Loading fee records...</div>
        ) : (
          <DataTable columns={columns} data={data || []} onEdit={!isStudent ? (item) => console.log('Mark Paid', item) : undefined} />
        )}
      </motion.div>
    </div>
  );
};
