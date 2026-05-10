/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MedicineManager from './components/MedicineManager';
import CustomerManager from './components/CustomerManager';
import SalesPOS from './components/SalesPOS';
import Purchases from './components/Purchases';
import ReportBuilder from './components/ReportBuilder';
import PrescriptionGenerator from './components/PrescriptionGenerator';
import CollectionManager from './components/CollectionManager';
import { storageService } from './services/storageService';
import { Medicine, Sale, Purchase, DashboardStats, Customer, CustomerTransaction } from './types';
import { 
  LogIn, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Pill, 
  Users, 
  Loader2, 
  User,
  LayoutDashboard, 
  ShoppingCart, 
  PackagePlus, 
  BarChart3,
  Menu,
  FileText,
  LogOut 
} from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

import { Toaster, toast } from 'sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReportType, setSelectedReportType] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom tab changer that handles history
  const changeTab = (tab: string, pushState: boolean = true, reportType: any = null) => {
    setActiveTab(tab);
    setSelectedReportType(reportType);
    if (pushState) {
      window.history.pushState({ tab, reportType }, '', '');
    }
  };

  // Data State with immediate cache loading
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  const getInitialStats = (): DashboardStats | null => {
    const cachedData = localStorage.getItem('app_data_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        return parsed.stats || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const [stats, setStats] = useState<DashboardStats | null>(getInitialStats());
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Initial data load
    const cachedData = localStorage.getItem('app_data_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setMedicines(parsed.medicines || []);
        setCustomers(parsed.customers || []);
        setSales(parsed.sales || []);
        setTransactions(parsed.transactions || []);
        setPurchases(parsed.purchases || []);
        // stats already handled in useState initializer
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }
    loadData(!!cachedData);
    
    // Refined keyboard detection for mobile devices
    const updateKeyboardState = () => {
      try {
        const isFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '');
        const visualViewportHeight = window.visualViewport?.height || window.innerHeight;
        const isViewportSmall = visualViewportHeight < window.innerHeight * 0.8;
        
        setIsKeyboardOpen(isFocused || isViewportSmall);
      } catch (e) {
        // Fallback for environments where visualViewport is restricted
      }
    };

    const handleFocus = () => setTimeout(updateKeyboardState, 100);
    const handleResize = () => updateKeyboardState();

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleFocus);
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    // Initial state
    if (!window.history.state) {
      window.history.replaceState({ tab: 'dashboard' }, '', '');
    }

    // Back button handling
    const handlePopState = (event: PopStateEvent) => {
      // If the state has a subView, let the component handle it
      if (event.state && event.state.subView) {
        return;
      }

      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
        setSelectedReportType(event.state.reportType || null);
        setIsSidebarOpen(false);
      } else {
        // If no state exists (meaning we're at the start of history)
        if (activeTab === 'dashboard') {
          // If we've already shown toast, we might want to shut up
          // or just re-push state
          window.history.pushState({ tab: 'dashboard' }, '', '');
        } else {
          setActiveTab('dashboard');
          window.history.replaceState({ tab: 'dashboard' }, '', '');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleFocus);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Only run once on mount

  const loadData = async (silent: boolean = false) => {
    // Only show global loading if we don't have stats yet and it's not a silent reload
    if (!stats && !silent) {
      setIsLoading(true);
    }
    
    try {
      const [meds, custs, sls, txs, prch] = await Promise.all([
        storageService.getMedicines(),
        storageService.getCustomers(),
        storageService.getSales(),
        storageService.getTransactions(),
        storageService.getPurchases(),
      ]);

      setMedicines(meds);
      setCustomers(custs);
      setSales(sls);
      setTransactions(txs);
      setPurchases(prch);

      // Quick computation of stats to avoid another service call
      const today = new Date().toISOString().split('T')[0];
      const todaysSales = sls.filter(s => s.date.startsWith(today));
      const totalSales = todaysSales.reduce((acc, s) => acc + s.total, 0);
      const totalProfit = todaysSales.reduce((acc, s) => {
        return acc + s.items.reduce((itemAcc, item) => {
          const med = meds.find(m => m.id === item.medicineId);
          const margin = med ? (item.pricePerUnit - med.purchasePrice) : 0;
          return itemAcc + (margin * item.quantity);
        }, 0);
      }, 0);

      const newStats = {
        totalSales,
        totalProfit,
        lowStockCount: meds.filter(m => m.quantity < 10).length,
        expiredCount: meds.filter(m => new Date(m.expiryDate) < new Date()).length,
        recentSales: sls.slice(0, 5)
      };
      
      setStats(newStats);
      
      // Save full cache
      localStorage.setItem('app_data_cache', JSON.stringify({
        medicines: meds,
        customers: custs,
        sales: sls,
        transactions: txs,
        purchases: prch,
        stats: newStats
      }));
    } catch (error) {
      console.error("Failed to load data from Firebase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    // logout logic removed for no-login system
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden pt-[env(safe-area-inset-top)]">
      <Toaster position="bottom-center" richColors />
      {/* Top Header Fixed - Increased height to avoid status bar overlap on mobile */}
      <header className="fixed top-0 left-0 right-0 h-24 sm:h-20 pt-[calc(env(safe-area-inset-top)+12px)] bg-white border-b border-slate-100 shadow-sm z-30 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-50 rounded-xl transition-all active:scale-95 group"
          >
            <div className="space-y-1.5">
              <div className="w-6 h-1 bg-slate-600 rounded-full"></div>
              <div className="w-5 h-1 bg-slate-600 rounded-full"></div>
              <div className="w-6 h-1 bg-slate-600 rounded-full"></div>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-[#1A43A2] p-1.5 rounded-lg shadow-lg shadow-blue-900/20">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-black text-xl text-slate-800 tracking-tighter">Dr. Atikur Rahman</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-800 leading-none">Admin User</p>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Online</p>
          </div>
          <div className="h-10 w-10 bg-slate-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
             <User size={20} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* Sidebar Overlay/Drawer */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => changeTab(tab)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onLogout={handleLogout}
      />
      
      {/* Navigation Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
             <Pill className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={24} />
           </div>
           <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-blue-900 animate-pulse">Loading View...</p>
        </div>
      )}
      
      {/* Main Content Area - Scrollable - Adjusted top margin for taller header */}
      <main className={`flex-1 mt-24 sm:mt-20 ${isKeyboardOpen ? 'mb-0' : 'mb-20'} overflow-y-auto px-4 lg:px-8 py-8 container mx-auto max-w-7xl pb-[calc(env(safe-area-inset-bottom)+2rem)]`}>
        {activeTab === 'dashboard' && stats && (
          <Dashboard stats={stats} onNavigate={(tab, type) => changeTab(tab, true, type)} />
        )}


        
        {activeTab === 'medicines' && (
          <MedicineManager 
            medicines={medicines} 
            onSave={async (med) => {
              setIsSaving(true);
              try {
                await storageService.saveMedicine(med);
                await loadData(true);
                toast.success('Medicine saved successfully');
              } catch (e) {
                toast.error('Failed to save medicine');
              } finally {
                setIsSaving(false);
              }
            }}
            onDelete={async (id) => {
              if (window.confirm('Are you sure you want to delete this medicine?')) {
                setIsSaving(true);
                try {
                  await storageService.deleteMedicine(id);
                  await loadData(true);
                  toast.success('Medicine deleted successfully');
                } catch (e) {
                  toast.error('Failed to delete medicine');
                } finally {
                  setIsSaving(false);
                }
              }
            }}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManager 
            customers={customers}
            onSave={async (cust) => {
              setIsSaving(true);
              try {
                await storageService.saveCustomer(cust);
                await loadData(true);
                toast.success('Customer saved successfully');
              } catch (e) {
                toast.error('Failed to save customer');
              } finally {
                setIsSaving(false);
              }
            }}
            onDelete={async (id) => {
              setIsSaving(true);
              try {
                await storageService.deleteCustomer(id);
                await loadData(true);
                toast.success('Customer deleted successfully');
              } catch (e) {
                toast.error('Failed to delete customer');
              } finally {
                setIsSaving(false);
              }
            }}
            sales={sales}
            transactions={transactions}
            onAddTransaction={async (tx) => {
              setIsSaving(true);
              try {
                await storageService.saveTransaction(tx);
                await loadData(true);
                toast.success('Payment received successfully');
              } catch (e) {
                toast.error('Transaction failed');
              } finally {
                setIsSaving(false);
              }
            }}
          />
        )}

        {activeTab === 'sales' && (
          <SalesPOS 
            medicines={medicines}
            customers={customers}
            onCompleteSale={async (sale) => {
              setIsSaving(true);
              try {
                const completed = await storageService.saveSale(sale);
                await loadData(true);
                toast.success('Sale completed successfully');
                return completed;
              } catch (e) {
                toast.error('Failed to complete sale');
                throw e;
              } finally {
                setIsSaving(false);
              }
            }}
          />
        )}

        {activeTab === 'purchases' && (
          <Purchases 
            medicines={medicines}
            purchases={purchases}
            onAddPurchase={async (purchase) => {
              setIsSaving(true);
              try {
                await storageService.savePurchase(purchase);
                await loadData(true);
                toast.success('Stock updated successfully');
              } catch (e) {
                toast.error('Failed to update stock');
              } finally {
                setIsSaving(false);
              }
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportBuilder 
            sales={sales}
            medicines={medicines}
            initialType={selectedReportType}
          />
        )}

        {activeTab === 'collection' && (
          <CollectionManager 
            customers={customers}
            onAddTransaction={async (tx) => {
              setIsSaving(true);
              try {
                await storageService.saveTransaction(tx);
                await loadData(true);
                toast.success('Collection recorded successfully');
              } catch (e) {
                toast.error('Failed to record collection');
              } finally {
                setIsSaving(false);
              }
            }}
          />
        )}

        {activeTab === 'prescription' && (
          <PrescriptionGenerator medicines={medicines} />
        )}
      </main>

      {/* Bottom Menu Fixed */}
      <footer className={`fixed bottom-0 left-0 right-0 h-16 sm:h-20 pb-[env(safe-area-inset-bottom)] bg-[#1A43A2] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-30 flex items-center justify-around px-2 border-t border-white/5 ${isKeyboardOpen ? 'hidden' : 'flex'}`}>
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => changeTab('dashboard')} 
          icon={<LayoutDashboard size={22} />} 
          label="Dash" 
        />
        <NavButton 
          active={activeTab === 'medicines'} 
          onClick={() => changeTab('medicines')} 
          icon={<Pill size={22} />} 
          label="Items" 
        />
        <div className="relative -mt-8">
           <button 
             onClick={() => changeTab('sales')}
             className={`p-4 rounded-full shadow-2xl transition-all duration-300 border-4 border-[#1A43A2] ${activeTab === 'sales' ? 'bg-white text-[#1A43A2] scale-110 shadow-white/20' : 'bg-slate-900 text-white hover:bg-white hover:text-[#1A43A2]'}`}
           >
             <ShoppingCart size={24} />
           </button>
        </div>
        <NavButton 
          active={activeTab === 'customers'} 
          onClick={() => changeTab('customers')} 
          icon={<Users size={22} />} 
          label="Clients" 
        />
        <NavButton 
          active={activeTab === 'prescription'} 
          onClick={() => changeTab('prescription')} 
          icon={<FileText size={22} />} 
          label="Presc" 
        />
      </footer>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <LogOut className="text-rose-600" size={32} />
            </div>
            <h3 className="text-2xl font-black text-center text-slate-900 uppercase tracking-tight">Exit Application?</h3>
            <p className="text-slate-500 text-center font-medium mt-2">Are you sure you want to close the app? Any unsaved work might be lost.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // In a browser, we can't easily "exit", but we can try to close window or just go to previous domain
                  // In Capacitor, App.exitApp() would be used.
                  window.history.go(-2); // Attempt to go back beyond our push state
                  setShowExitConfirm(false);
                }}
                className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
              >
                Exit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Internal Navigation Button Component
function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all duration-300 ${active ? 'text-white' : 'text-blue-100/50 hover:text-white'}`}
    >
      <div className={active ? 'scale-110' : ''}>{icon}</div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
  );
}

function TopNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${active ? 'bg-white/10 text-white shadow-inner' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Navigation components moved to top imports

