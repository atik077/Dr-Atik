import React, { useState, useEffect } from 'react';
import { Customer, CustomerTransaction, Sale } from '../types';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  History,
  CreditCard,
  Receipt,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Printer
} from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  onSave: (customer: Partial<Customer>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  sales: Sale[];
  transactions: CustomerTransaction[];
  onAddTransaction: (tx: Omit<CustomerTransaction, 'id' | 'date'>) => Promise<void>;
}

import InvoiceModal from './InvoiceModal';

export default function CustomerManager({ 
  customers, 
  onSave, 
  onDelete, 
  sales, 
  transactions,
  onAddTransaction 
}: CustomerManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [viewingTransactions, setViewingTransactions] = useState<Customer | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    fathersName: '',
    mobile: '',
    address: '',
    dueBalance: 0
  });

  // Sync sub-views with browser history for physical back button
  useEffect(() => {
    const handlePopstate = (event: PopStateEvent) => {
      // If we're popping away from a subview, close them
      if (!event.state || !event.state.subView) {
        setIsFormOpen(false);
        setIsPaymentOpen(false);
        setViewingTransactions(null);
        setViewingSale(null);
      } else if (event.state.subView === 'customer-form') {
        setIsFormOpen(true);
      } else if (event.state.subView === 'customer-payment') {
        setIsPaymentOpen(true);
      } else if (event.state.subView === 'customer-history') {
        setViewingTransactions(event.state.customer);
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  const pushSubViewState = (subView: string, extra: any = {}) => {
    const currentTab = (window.history.state && window.history.state.tab) || 'customers';
    window.history.pushState({ tab: currentTab, subView, ...extra }, '', '');
  };

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'Cash',
    note: ''
  });

  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cust.mobile.includes(searchTerm)
  );

  // Get all transactions for specific customer (Sales and Payments)
  const getCustomerTransactions = (customerId: string) => {
    return transactions
      .filter(tx => tx.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const customerTxs = viewingTransactions ? getCustomerTransactions(viewingTransactions.id) : [];
  
  // Calculate running balance for the sorted transactions
  const getEnrichedTransactions = (txs: CustomerTransaction[]) => {
    // We need them in chronological order to calculate balance
    const chrono = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = 0;
    const enriched = chrono.map(tx => {
      if (tx.type === 'SALE') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
      return { ...tx, runningBalance: balance };
    });
    // Return them in reverse chronological (latest first)
    return enriched.reverse();
  };

  const enrichedTxs = viewingTransactions ? getEnrichedTransactions(customerTxs) : [];

  // Pagination logic
  const totalPages = Math.ceil(enrichedTxs.length / itemsPerPage);
  const paginatedTxs = enrichedTxs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenForm = (cust?: Customer) => {
    if (cust) {
      setEditingCustomer(cust);
      setFormData(cust);
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        fathersName: '',
        mobile: '',
        address: '',
        dueBalance: 0
      });
    }
    setIsFormOpen(true);
    pushSubViewState('customer-form');
    setActiveMenuId(null);
    setViewingTransactions(null);
  };

  const handleOpenPayment = (cust: Customer) => {
    setPaymentCustomer(cust);
    setPaymentData({
      amount: 0,
      paymentMethod: 'Cash',
      note: ''
    });
    setIsPaymentOpen(true);
    pushSubViewState('customer-payment');
    setActiveMenuId(null);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentCustomer && paymentData.amount > 0) {
      setIsSaving(true);
      try {
        await onAddTransaction({
          customerId: paymentCustomer.id,
          type: 'PAYMENT',
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          note: paymentData.note || 'Payment collection'
        });
        setPaymentData({
          amount: 0,
          paymentMethod: 'Cash',
          note: ''
        });
        setIsPaymentOpen(false);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ ...formData, id: editingCustomer?.id });
      if (!editingCustomer) {
        setFormData({
          name: '',
          fathersName: '',
          mobile: '',
          address: '',
          dueBalance: 0
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const findSale = (saleId?: string) => {
    if (!saleId) return null;
    return sales.find(s => s.id === saleId) || null;
  };

  if (viewingTransactions) {
    return (
      <div className="space-y-6 text-black animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-black pb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                window.history.back();
              }} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter">Transaction History</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{viewingTransactions.name} ({viewingTransactions.mobile})</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-black overflow-hidden bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#1A43A2] border-b-2 border-black text-white">
                  <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border-r border-white/20">Date</th>
                  <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border-r border-white/20">Type</th>
                  <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border-r border-white/20">Reference</th>
                  <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest border-r border-white/20">Amount</th>
                  <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
              {paginatedTxs.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 border-r border-slate-400 text-xs font-bold text-slate-800">
                    {new Date(tx.date).toLocaleDateString()}
                    <span className="block text-[9px] text-slate-400 font-mono tracking-tighter">{new Date(tx.date).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-400">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${tx.type === 'SALE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-400">
                    {tx.type === 'SALE' && tx.referenceId ? (
                      <button 
                        onClick={() => setViewingSale(findSale(tx.referenceId))}
                        className="text-blue-600 font-black hover:underline text-[10px] flex items-center justify-center gap-1.5 w-full"
                      >
                        <Receipt size={12} />
                        INV-{tx.referenceId.slice(-6).toUpperCase()}
                      </button>
                    ) : (
                      <span className="text-[9px] font-black text-slate-400 uppercase italic">{tx.note || tx.paymentMethod}</span>
                    )}
                  </td>
                  <td className={`px-4 py-2.5 border-r border-slate-400 font-black text-xs ${tx.type === 'SALE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {tx.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 font-black text-slate-800 text-xs bg-slate-50/20">
                    {(tx as any).runningBalance.toFixed(2)}
                  </td>
                </tr>
              ))}
                {customerTxs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-slate-400 bg-slate-50/30">
                      <History className="h-14 w-14 mx-auto mb-4 opacity-5" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-300">No transaction records found for this client</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-black text-sm transition-all ${currentPage === page ? 'bg-[#1A43A2] text-white' : 'hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Payment Collection Modal */}
        {isPaymentOpen && paymentCustomer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-none border-2 border-black shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="bg-[#1A43A2] p-6 text-white border-b-2 border-black flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest">Payment Collection</h3>
                    <p className="text-[10px] font-bold opacity-80 uppercase mt-0.5 tracking-widest">{paymentCustomer.name}</p>
                  </div>
                  <button onClick={() => window.history.back()} className="hover:bg-white/10 p-2 rounded-full">
                    <X size={20} />
                  </button>
               </div>
               
               <form onSubmit={handlePaymentSubmit} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Amount</label>
                    <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg">
                      <p className="text-2xl font-black text-rose-600">{paymentCustomer.dueBalance.toFixed(2)}</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Collection Amount</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                      <input 
                        type="number"
                        step="0.01"
                        autoFocus
                        max={paymentCustomer.dueBalance}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-none focus:border-emerald-500 outline-none transition-all font-black text-xl"
                        placeholder="0.00"
                        value={paymentData.amount || ''}
                        onChange={e => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Method</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-none font-bold uppercase text-xs"
                        value={paymentData.paymentMethod}
                        onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                      >
                        <option value="Cash">Cash</option>
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Bank">Bank</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Note (Optional)</label>
                      <input 
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-none font-bold text-xs"
                        placeholder="Remarks..."
                        value={paymentData.note}
                        onChange={e => setPaymentData({...paymentData, note: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                   <button 
                     type="button" 
                     onClick={() => window.history.back()}
                     className="flex-1 py-4 border-2 border-slate-200 font-bold uppercase text-xs tracking-widest hover:bg-slate-50"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     disabled={isSaving}
                     className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                     {isSaving && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                     {isSaving ? 'Processing...' : 'Submit Payment'}
                   </button>
                 </div>
               </form>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {viewingSale && (
          <InvoiceModal 
            sale={viewingSale} 
            onClose={() => setViewingSale(null)} 
          />
        )}
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="space-y-6 text-black animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-black pb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-tighter">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Customer Name" 
              value={formData.name} 
              onChange={(v: string) => setFormData({...formData, name: v})} 
              placeholder="Enter full name"
              required
            />
            <FormInput 
              label="Father's Name" 
              value={formData.fathersName} 
              onChange={(v: string) => setFormData({...formData, fathersName: v})} 
              placeholder="Enter father's name"
            />
            <FormInput 
              label="Mobile Number" 
              value={formData.mobile} 
              onChange={(v: string) => setFormData({...formData, mobile: v})} 
              placeholder="e.g. 017xxxxxxxx"
              required
            />
            <FormInput 
              label="Initial Due Balance" 
              type="number"
              value={formData.dueBalance} 
              onChange={(v: string) => setFormData({...formData, dueBalance: parseFloat(v) || 0})} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-black uppercase tracking-widest ml-1">Address</label>
            <textarea 
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black font-medium min-h-[100px]"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Enter full address details..."
            />
          </div>

          <div className="pt-6 flex gap-4 max-w-md">
            <button 
              type="button" 
              onClick={() => window.history.back()}
              className="flex-1 py-3 bg-slate-100 text-black border border-slate-300 rounded-lg font-bold hover:bg-slate-200 transition-all uppercase text-sm tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-3 bg-black text-white rounded-lg font-bold hover:bg-slate-800 transition-all active:scale-95 uppercase text-sm tracking-widest shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              {isSaving ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Save Customer')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black pb-2 mt-0">
        <div>
          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter">Customer Management</h2>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-black text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add Customer
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center border-b border-slate-200 pb-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
          <input 
            type="text" 
            placeholder="Search by name or mobile..." 
            className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-black mt-2 overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-[#1A43A2] border-b border-black">
                <th className="px-4 py-2 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center">SL</th>
                <th className="px-4 py-2 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center">Name</th>
                <th className="px-4 py-2 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center">Father's Name</th>
                <th className="px-4 py-2 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center">Mobile</th>
                <th className="px-4 py-2 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center">Address</th>
                <th className="px-4 py-2 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center">Due Balance</th>
                <th className="px-4 py-2 text-xs font-bold text-white uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust, index) => (
                <tr key={cust.id} className="border-b border-black hover:bg-slate-50 transition-colors relative">
                  <td className="px-4 py-2 border-r border-black text-center font-bold text-slate-500 bg-slate-50/50">{index + 1}</td>
                  <td className="px-4 py-2 border-r border-black font-bold text-black text-center">{cust.name}</td>
                  <td className="px-4 py-2 border-r border-black text-sm text-black text-center">{cust.fathersName || '-'}</td>
                  <td className="px-4 py-2 border-r border-black text-sm font-medium text-black text-center">{cust.mobile}</td>
                  <td className="px-4 py-2 border-r border-black text-xs text-black max-w-[200px] truncate text-center">{cust.address || '-'}</td>
                  <td className="px-4 py-2 border-r border-black text-center font-black text-rose-600 bg-rose-50/20">
                    {cust.dueBalance.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center relative">
                    <div className="flex justify-center">
                      <button 
                        id={`menu-trigger-${cust.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === cust.id ? null : cust.id);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-full transition-all text-black"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {activeMenuId === cust.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-[100]" 
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div 
                            className="fixed z-[101] w-48 bg-white border border-black shadow-2xl animate-in zoom-in-95 duration-200"
                            style={{
                              top: document.getElementById(`menu-trigger-${cust.id}`)?.getBoundingClientRect().bottom ? (document.getElementById(`menu-trigger-${cust.id}`)?.getBoundingClientRect().bottom || 0) + 4 : 0,
                              right: window.innerWidth - (document.getElementById(`menu-trigger-${cust.id}`)?.getBoundingClientRect().right || 0),
                              transformOrigin: 'top right'
                            }}
                          >
                            <button 
                              onClick={() => {
                                setEditingCustomer(cust);
                                setFormData(cust);
                                setIsFormOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 border-b border-black/10 text-left"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Profile
                            </button>
                            <button 
                              onClick={() => {
                                setViewingTransactions(cust);
                                pushSubViewState('customer-history', { customer: cust });
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-black hover:bg-slate-50 border-b border-black/10 text-left"
                            >
                              <History className="h-4 w-4 text-[#1A43A2]" />
                              Transaction
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Delete this customer?')) {
                                  onDelete(cust.id);
                                }
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 text-left"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-20 text-black">
              <User className="h-16 w-16 mx-auto mb-4 opacity-10" />
              <p className="font-medium">No customers found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, type = 'text', value, onChange, placeholder, required }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-black uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} 
        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black font-medium placeholder:text-slate-300"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
