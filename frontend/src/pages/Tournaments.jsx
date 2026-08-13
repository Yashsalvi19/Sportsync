import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../components/DataTable';
import { Trophy, Plus, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

export const Tournaments = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = user?.user_metadata?.role || 'STUDENT';
  const canManage = role === 'COACH' || role === 'ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING'
  });

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const response = await apiClient.get('/tournaments');
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newTournament) => {
      const response = await apiClient.post('/tournaments', newTournament);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournaments']);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', startDate: '', endDate: '', status: 'UPCOMING' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

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
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-foreground/60 mt-1">Manage academy tournaments and registrations.</p>
        </div>
        {canManage && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center">
            <Trophy className="w-4 h-4 mr-2" /> Create Tournament
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        {isLoading ? (
          <div className="py-10 text-center text-foreground/50">Loading tournaments...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={tournaments || []} 
            onEdit={canManage ? (item) => console.log('Edit', item) : undefined} 
            onDelete={canManage ? (item) => console.log('Delete', item) : undefined} 
          />
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-black/10 dark:border-white/10"
            >
              <div className="px-6 py-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-primary" />
                  Create Tournament
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5 opacity-70" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Tournament Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g., Summer Slam 2026"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                    placeholder="Tournament details..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">End Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="btn-primary py-2 flex items-center justify-center"
                  >
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                    Create
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
