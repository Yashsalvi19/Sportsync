import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export const Tournaments = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      return [
        { id: 1, name: 'Winter Championship', startDate: '2023-12-01', endDate: '2023-12-05', status: 'UPCOMING' },
        { id: 2, name: 'Summer Slam', startDate: '2023-06-15', endDate: '2023-06-20', status: 'COMPLETED' },
      ];
    },
  });

  const columns = [
    { key: 'name', label: 'Tournament Name' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'status', label: 'Status', render: (val) => {
      let colorClass = '';
      if (val === 'COMPLETED') colorClass = 'bg-success/20 text-success';
      else if (val === 'UPCOMING') colorClass = 'bg-primary/20 text-primary';
      else colorClass = 'bg-warning/20 text-warning';
      return <span className={`px-2 py-1 rounded-md text-xs font-bold ${colorClass}`}>{val}</span>;
    }},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-foreground/60 mt-1">Manage academy tournaments and registrations.</p>
        </div>
        <button className="btn-primary flex items-center">
          <Trophy className="w-4 h-4 mr-2" /> Create Tournament
        </button>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        {isLoading ? (
          <div className="py-10 text-center text-foreground/50">Loading tournaments...</div>
        ) : (
          <DataTable columns={columns} data={data || []} onEdit={(item) => console.log('Edit', item)} onDelete={(item) => console.log('Delete', item)} />
        )}
      </motion.div>
    </div>
  );
};
