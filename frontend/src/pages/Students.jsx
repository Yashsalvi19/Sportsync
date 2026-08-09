import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export const Students = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      return [
        { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', coachName: 'Sarah Jenkins', emergencyContact: 'Mom: 555-0100' },
        { id: 2, firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', coachName: 'Sarah Jenkins', emergencyContact: 'Dad: 555-0101' },
      ];
    },
  });

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'coachName', label: 'Assigned Coach', render: (val) => <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">{val}</span> },
    { key: 'emergencyContact', label: 'Emergency Contact' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-foreground/60 mt-1">Manage all registered academy students.</p>
        </div>
        <button className="btn-primary flex items-center">
          <UserPlus className="w-4 h-4 mr-2" /> Add Student
        </button>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        {isLoading ? (
          <div className="py-10 text-center text-foreground/50">Loading students...</div>
        ) : (
          <DataTable columns={columns} data={data || []} onEdit={(item) => console.log('Edit', item)} onDelete={(item) => console.log('Delete', item)} />
        )}
      </motion.div>
    </div>
  );
};
