import { motion } from 'framer-motion';
import { Users, UserSquare2, Trophy, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, students: 240 },
  { name: 'Feb', revenue: 3000, students: 250 },
  { name: 'Mar', revenue: 5000, students: 270 },
  { name: 'Apr', revenue: 4500, students: 260 },
  { name: 'May', revenue: 6000, students: 300 },
  { name: 'Jun', revenue: 5500, students: 310 },
];

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 flex items-start justify-between"
  >
    <div>
      <p className="text-foreground/60 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
      <p className={`text-sm mt-2 font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
        {trend >= 0 ? '+' : ''}{trend}% from last month
      </p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
      <Icon className="w-6 h-6" />
    </div>
  </motion.div>
);

export const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-foreground/60 mt-1">Welcome back. Here is what's happening at SportSync today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="312" icon={Users} trend={12} />
        <StatCard title="Active Coaches" value="24" icon={UserSquare2} trend={4} />
        <StatCard title="Monthly Revenue" value="₹42,500" icon={IndianRupee} trend={8} />
        <StatCard title="Active Tournaments" value="3" icon={Trophy} trend={0} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-bold mb-6">Revenue & Growth</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
              <YAxis stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};
