import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Download, 
  Printer, 
  Calendar as CalendarIcon,
  ChevronRight,
  Search,
  Filter,
  ShoppingCart,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { Sale, Medicine } from '../types';

interface ReportProps {
  sales: Sale[];
  medicines: Medicine[];
}

type ReportType = 'Sales' | 'Profit' | 'Inventory' | 'Expiry' | 'IncomeExpense';
type ViewState = 'menu' | 'config' | 'report';

export default function ReportBuilder({ sales, medicines, initialType, purchases = [] }: ReportProps & { purchases?: any[], initialType?: ReportType }) {
  const [view, setView] = useState<ViewState>(initialType ? 'report' : 'menu');
  const [reportType, setReportType] = useState<ReportType>(initialType || 'Sales');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter components
  const filteredSales = sales.filter(sale => {
    const saleDate = sale.date.split('T')[0];
    return saleDate >= fromDate && saleDate <= toDate;
  });

  const filteredPurchases = purchases.filter(p => {
    const pDate = p.date.split('T')[0];
    return pDate >= fromDate && pDate <= toDate;
  });

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalExpense = filteredPurchases.reduce((acc, p) => acc + (p.total || 0), 0);
  
  const totalProfit = filteredSales.reduce((acc, sale) => {
    return acc + sale.items.reduce((itemAcc, item) => {
      const med = medicines.find(m => m.id === item.medicineId);
      const purchasePrice = med ? med.purchasePrice : 0;
      return itemAcc + ((item.pricePerUnit - purchasePrice) * item.quantity);
    }, 0);
  }, 0);

  const lowStockMedicines = medicines.filter(m => m.quantity < 10);
  const expiredMedicines = medicines.filter(m => new Date(m.expiryDate) < new Date());

  const handleReportSelect = (type: ReportType) => {
    setReportType(type);
    if (type === 'Inventory' || type === 'Expiry') {
      setView('report');
    } else {
      setView('config');
    }
  };

  const menuItems = [
    { id: 'Sales', label: "Today's Sales", desc: "Detailed breakdown of all items sold", icon: ShoppingCart, color: "blue" },
    { id: 'Profit', label: "Today's Profit", desc: "Net profit analysis from sales data", icon: TrendingUp, color: "emerald" },
    { id: 'Inventory', label: "Low Stock Alerts", desc: "List of items running out of inventory", icon: AlertTriangle, color: "amber" },
    { id: 'Expiry', label: "Expired Medicines", desc: "Critical list of past-expiry stock", icon: Clock, color: "rose" },
    { id: 'IncomeExpense', label: "Income Expense", desc: "Compare revenue against purchase costs", icon: BarChart3, color: "indigo" },
  ];

  if (view === 'menu') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-6">
        <div className="border-b-2 border-slate-200 pb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-3">
            <BarChart3 size={32} className="text-[#1A43A2]" />
            Reports Center
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">Select a report category to analyze your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleReportSelect(item.id as ReportType)}
              className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:border-[#1A43A2] hover:shadow-md transition-all text-left group"
            >
              <div className={`p-3 rounded-xl border border-slate-100 bg-${item.color}-50 text-${item.color}-600 group-hover:bg-[#1A43A2] group-hover:text-white transition-colors`}>
                <item.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black uppercase text-black group-hover:text-[#1A43A2] transition-colors">{item.label}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.desc}</p>
              </div>
              <ChevronRight size={20} className="text-slate-200 group-hover:text-black transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'config') {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 pt-10">
        <div className="text-center space-y-2">
          <button 
            onClick={() => setView('menu')}
            className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A43A2] flex items-center gap-1 mx-auto mb-2 transition-colors"
          >
            ← Back to Categories
          </button>
          <h2 className="text-3xl font-black uppercase tracking-tight text-black">Set Date Range</h2>
          <p className="text-slate-400 font-medium italic text-sm">Configure the time period for {reportType} report</p>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2">
                <CalendarIcon size={12} className="text-[#1A43A2]" /> From Date
              </label>
              <input 
                type="date" 
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold text-black text-base focus:ring-2 ring-[#1A43A2]/10 focus:border-[#1A43A2] outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2">
                <CalendarIcon size={12} className="text-[#1A43A2]" /> To Date
              </label>
              <input 
                type="date" 
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold text-black text-base focus:ring-2 ring-[#1A43A2]/10 focus:border-[#1A43A2] outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => setView('report')}
            className="w-full py-5 bg-[#1A43A2] text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group"
          >
            Generate Report
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  const renderReportContent = () => {
    switch (reportType) {
      case 'Sales':
        return (
          <div className="overflow-x-auto border-2 border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-900 border-b border-black">
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">ID</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Date</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Customer</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Items</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-right">Total</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest text-center">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 border-r border-slate-100 font-bold text-center text-[11px]">#{sale.id.slice(-6)}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] font-black uppercase">{sale.customerName || 'Cash Sale'}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] text-slate-500">{sale.items.length} Products</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-right font-black text-xs">{sale.total.toFixed(2)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${sale.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-[#1A43A2] border-blue-200'}`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-300 font-black uppercase tracking-[0.1em] text-[10px]">No records found for this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'Profit': {
        const profitItems = filteredSales.flatMap(sale => sale.items.map(item => {
          const med = medicines.find(m => m.id === item.medicineId);
          const cost = med ? med.purchasePrice * item.quantity : 0;
          return {
            date: sale.date,
            medicine: item.medicineName,
            qty: item.quantity,
            saleTotal: item.total,
            cost: cost,
            profit: item.total - cost
          };
        }));

        return (
          <div className="overflow-x-auto border-2 border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-emerald-600 border-b border-black">
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Date</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10">Medicine</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Qty</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-right">Sale Val</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-right">Cost Val</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {profitItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 border-r border-slate-100 font-black uppercase text-[11px]">{item.medicine}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] font-black">{item.qty}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-right text-[11px] font-bold">{item.saleTotal.toFixed(2)}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-right text-[11px] font-bold">{item.cost.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-black text-xs text-emerald-600">{item.profit.toFixed(2)}</td>
                  </tr>
                ))}
                {profitItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-300 font-black uppercase tracking-[0.1em] text-[10px]">No profit data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }
      case 'Inventory':
        return (
          <div className="overflow-x-auto border-2 border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-amber-500 border-b border-black">
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10">Medicine</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Brand</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Category</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest text-center">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockMedicines.map((med) => (
                  <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 border-r border-slate-100 font-black uppercase text-[11px]">{med.name}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] text-slate-500">{med.brand}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[9px] font-black uppercase text-slate-400">{med.category}</td>
                    <td className="px-5 py-3 text-center font-black text-rose-600 text-[11px]">{med.quantity}</td>
                  </tr>
                ))}
                {lowStockMedicines.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-emerald-600 font-black uppercase tracking-[0.1em] text-[10px]">Inventory levels are optimal</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'Expiry':
        return (
          <div className="overflow-x-auto border-2 border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-rose-600 border-b border-black">
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10">Medicine</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Brand</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Expiry</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {expiredMedicines.map((med) => (
                  <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 border-r border-slate-100 font-black uppercase text-[11px]">{med.name}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] text-slate-500">{med.brand}</td>
                    <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] font-black text-rose-600">{new Date(med.expiryDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-center font-black text-rose-600 uppercase text-[8px] tracking-widest">⚠️ Expired</td>
                  </tr>
                ))}
                {expiredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-emerald-600 font-black uppercase tracking-[0.1em] text-[10px]">No expired products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case 'IncomeExpense':
        return (
          <div className="overflow-x-auto border-2 border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-900 border-b border-white/10">
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10 text-center">Date</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10">Type</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest border-r border-white/10">Description</th>
                  <th className="px-5 py-3 text-[9px] font-black text-white uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...filteredSales.map(s => ({ d: s.date, t: 'INCOME', desc: `Sale #${s.id.slice(-6)}`, a: s.total })),
                  ...filteredPurchases.map(p => ({ d: p.date, t: 'EXPENSE', desc: `Purchase: ${p.medicineName}`, a: p.total }))]
                  .sort((a, b) => new Date(b.d).getTime() - new Date(a.d).getTime())
                  .map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 border-r border-slate-100 text-center text-[11px] font-bold text-slate-500">{new Date(item.d).toLocaleDateString()}</td>
                      <td className="px-5 py-3 border-r border-slate-100 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] border uppercase font-black ${item.t === 'INCOME' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                          {item.t}
                        </span>
                      </td>
                      <td className="px-5 py-3 border-r border-slate-100 text-[11px] font-black uppercase">{item.desc}</td>
                      <td className={`px-5 py-3 text-right font-black text-xs ${item.t === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.t === 'INCOME' ? '+' : '-'}{item.a.toFixed(2)}
                      </td>
                    </tr>
                ))}
                {(filteredSales.length + filteredPurchases.length) === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-200 font-black uppercase tracking-[0.1em] text-[10px]">No income or expense records</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-slate-100 pb-4">
        <div>
          <button 
            onClick={() => setView(reportType === 'Inventory' || reportType === 'Expiry' ? 'menu' : 'config')}
            className="text-[9px] font-black uppercase tracking-widest text-[#1A43A2] hover:underline mb-1 flex items-center gap-1 transition-all"
          >
            ← Change Settings
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">{reportType} Report</h2>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
               {new Date(fromDate).toLocaleDateString()} — {new Date(toDate).toLocaleDateString()}
             </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest shadow-sm hover:bg-black transition-all text-[10px] flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportType === 'IncomeExpense' ? (
          <>
            <SummaryCard label="Total Income" value={`${totalRevenue.toFixed(2)}`} color="emerald" icon={TrendingUp} />
            <SummaryCard label="Total Expense" value={`${totalExpense.toFixed(2)}`} color="rose" icon={ShoppingCart} />
            <SummaryCard label="Net Balance" value={`${(totalRevenue - totalExpense).toFixed(2)}`} color="indigo" icon={BarChart3} />
          </>
        ) : (
          <>
            <SummaryCard label="Revenue" value={`${totalRevenue.toFixed(2)}`} color="blue" icon={TrendingUp} />
            <SummaryCard label="Profit" value={`${totalProfit.toFixed(2)}`} color="emerald" icon={TrendingUp} />
            <SummaryCard label="Stock Alert" value={lowStockMedicines.length.toString()} color="amber" icon={AlertTriangle} />
          </>
        )}
      </div>

      <div className="overflow-hidden">
        {renderReportContent()}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, icon: Icon }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <div className={`p-6 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-3 hover:border-slate-300 transition-all`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]} border`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <h4 className="text-2xl font-black tracking-tight text-black">{value}</h4>
      </div>
    </div>
  );
}


function ReportMetric({ label, value, icon: Icon, color, active }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
  };

  return (
    <div className={`p-6 rounded-2xl border-2 shadow-sm relative overflow-hidden transition-all hover:translate-y-[-4px] ${colors[color]} ${active ? 'animate-pulse ring-2 ring-rose-500 ring-offset-2' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-white rounded-xl border border-current shadow-sm">
          <Icon size={20} strokeWidth={3} />
        </div>
        {active && (
           <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-bounce">
              Action Required
           </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <h4 className="text-2xl font-black tracking-tighter text-black">{value}</h4>
    </div>
  );
}
