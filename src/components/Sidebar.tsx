import React from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  PackagePlus, 
  Wallet,
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Users,
  FileText
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'sales', label: 'Sales (POS)', icon: ShoppingCart },
    { id: 'collection', label: 'Collection', icon: Wallet },
    { id: 'purchases', label: 'Purchases', icon: PackagePlus },
    { id: 'prescription', label: 'Prescription Generate', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Fixed Header Section */}
        <div className="p-8 pb-4 shrink-0 pt-[calc(env(safe-area-inset-top)+2rem)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/30">
                <Pill className="text-white h-6 w-6" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase">Dr. Atikur Rahman</h1>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors lg:hidden"
            >
              <X className="h-6 w-6 text-slate-400" />
            </button>
          </div>


        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          <nav className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 mb-4">Main Menu</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative mb-1",
                  activeTab === item.id 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  activeTab === item.id ? "text-white scale-110" : "text-slate-500 group-hover:text-blue-400"
                )} />
                <span className="font-bold text-sm uppercase tracking-wider text-left">{item.label}</span>
                {activeTab === item.id && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Fixed Footer Section */}
        <div className="p-4 pt-2 shrink-0 border-t border-white/5 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="space-y-1 mb-4">
            <button className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-300">
              <Settings className="h-5 w-5" />
              <span className="font-bold text-sm uppercase tracking-wider text-left">Settings</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 text-rose-400 hover:text-white hover:bg-rose-500 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-rose-500/20"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-bold text-sm uppercase tracking-wider text-left">Logout</span>
            </button>
          </div>
          
          <div className="text-center pb-2">
             <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">v2.1.0 Enterprise</p>
          </div>
        </div>
      </aside>
    </>
  );
}
