import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  ShoppingCart,
  ArrowUpRight
} from 'lucide-react';
import { DashboardStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
  onNavigate: (tab: string, reportType?: string) => void;
}

const data = [
  { name: 'Mon', sales: 400 },
  { name: 'Tue', sales: 300 },
  { name: 'Wed', sales: 600 },
  { name: 'Thu', sales: 800 },
  { name: 'Fri', sales: 500 },
  { name: 'Sat', sales: 900 },
  { name: 'Sun', sales: 1100 },
];

export default function Dashboard({ stats, onNavigate }: DashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Today's Sales" 
          value={`${stats.totalSales.toLocaleString()}`} 
          subValue="Revenue collected"
          icon={TrendingUp}
          color="blue"
          onSeeAll={() => onNavigate('reports', 'Sales')}
        />
        <StatCard 
          label="Today's Profit" 
          value={`${stats.totalProfit.toLocaleString()}`} 
          subValue="Net earnings"
          icon={ArrowUpRight}
          color="emerald"
          onSeeAll={() => onNavigate('reports', 'Profit')}
        />
        <StatCard 
          label="Low Stock Alerts" 
          value={stats.lowStockCount.toString()} 
          subValue={`${stats.lowStockCount > 5 ? 'Action needed' : 'Status: Good'}`}
          icon={AlertTriangle}
          color="amber"
          showAlert={stats.lowStockCount > 0}
          onSeeAll={() => onNavigate('reports', 'Inventory')}
        />
        <StatCard 
          label="Expired Medicines" 
          value={stats.expiredCount.toString()} 
          subValue="Check inventory regularly"
          icon={Clock}
          color="rose"
          showAlert={stats.expiredCount > 0}
          onSeeAll={() => onNavigate('reports', 'Expiry')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800">Sales Analytics</h3>
            <select className="bg-slate-50 border-none rounded-lg px-3 py-1 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Recent Sales</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {stats.recentSales.length > 0 ? stats.recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="bg-blue-50 p-3 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">Sale #{sale.id}</p>
                  <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleTimeString()}</p>
                </div>
                <p className="text-sm font-bold text-slate-800">{sale.total.toFixed(2)}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No recent sales</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color, showAlert, onSeeAll }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
      {showAlert && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>
      )}
      <div className={cn("p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110", colors[color])}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h4 className="text-2xl font-black text-slate-800 mt-1">{value}</h4>
      <p className="text-slate-400 text-xs mt-2 font-medium mb-4">{subValue}</p>
      
      <button 
        onClick={onSeeAll}
        className="mt-auto pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A43A2] hover:underline"
      >
        See Full Report
        <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
