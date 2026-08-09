import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export const Coaches = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      return [
        { id: 1, firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah@sportsync.com', specialization: 'Cricket', hireDate: '2023-01-15' },
        { id: 2, firstName: 'Mike', lastName: 'Raina', email: 'mike@sportsync.com', specialization: 'Batting', hireDate: '2023-05-22' },
      ];
    },
  });

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'specialization', label: 'Specialization', render: (val) => <span className="bg-accent/10 text-accent px-2 py-1 rounded-md text-xs font-medium">{val}</span> },
    { key: 'hireDate', label: 'Hire Date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coaches</h1>
          <p className="text-foreground/60 mt-1">Manage academy coaching staff.</p>
        </div>
        <button className="btn-primary flex items-center">
          <UserPlus className="w-4 h-4 mr-2" /> Add Coach
        </button>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        {isLoading ? (
          <div className="py-10 text-center text-foreground/50">Loading coaches...</div>
        ) : (
          <DataTable columns={columns} data={data || []} onEdit={(item) => console.log('Edit', item)} onDelete={(item) => console.log('Delete', item)} />
        )}
      </motion.div>
    </div>
  );
};
