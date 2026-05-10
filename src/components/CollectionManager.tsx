import React, { useState, useRef, useEffect } from 'react';
import { Customer, CustomerTransaction } from '../types';
import { 
  Search, 
  ChevronDown,
  Calendar,
  CreditCard,
  CheckCircle2,
  Receipt
} from 'lucide-react';

interface CollectionManagerProps {
  customers: Customer[];
  onAddTransaction: (tx: Omit<CustomerTransaction, 'id' | 'date'>) => Promise<void>;
}

export default function CollectionManager({ customers, onAddTransaction }: CollectionManagerProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!selectedCustomerId || !numAmount || numAmount <= 0) return;

    await onAddTransaction({
      customerId: selectedCustomerId,
      type: 'PAYMENT',
      amount: numAmount,
      paymentMethod: paymentMethod,
      note: note || 'Customer Collection'
    });

    setSuccess(true);
    setAmount('');
    setNote('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-12 px-4 space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-black">Payment Collection</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Step 1: Customer Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black italic">01</span>
            <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Select Customer</label>
          </div>
          
          <div className="relative" ref={customerDropdownRef}>
            <div 
              onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
              className={`w-full px-5 py-3.5 bg-white border-2 border-black rounded-xl cursor-pointer flex justify-between items-center transition-all duration-300 ${isCustomerDropdownOpen ? 'bg-slate-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <Search className="h-5 w-5 text-black" />
                <span className={`text-sm font-black uppercase tracking-tight ${selectedCustomerId ? 'text-black' : 'text-slate-400'}`}>
                  {selectedCustomer 
                    ? `${selectedCustomer.name} (${selectedCustomer.mobile})`
                    : 'Search for customer name or phone...'}
                </span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform duration-300 text-black ${isCustomerDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </div>

            {isCustomerDropdownOpen && (
              <div className="absolute z-[100] left-0 right-0 top-[calc(100%+8px)] bg-white border-2 border-black shadow-2xl rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="p-3 border-b-2 border-black">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Type to filter..."
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 outline-none text-black font-black rounded-lg text-sm"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto py-1">
                  {customers.filter(c => 
                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                    c.mobile.includes(customerSearch)
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerId(c.id);
                        setIsCustomerDropdownOpen(false);
                        setCustomerSearch('');
                        setSuccess(false);
                      }}
                      className={`w-full text-left px-6 py-4 transition-all hover:bg-emerald-600 hover:text-white border-b border-slate-100 last:border-0 flex justify-between items-center group ${selectedCustomerId === c.id ? 'bg-slate-50' : ''}`}
                    >
                      <div className="space-y-0.5">
                        <p className="font-black text-black uppercase tracking-tight text-xs group-hover:text-white transition-colors">{c.name}</p>
                        <p className="text-[10px] font-bold text-black/60 group-hover:text-white/80 uppercase tracking-widest">{c.mobile}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-0.5 group-hover:text-white/80">Due Balance</p>
                        <p className="font-black text-black group-hover:text-white">{c.dueBalance.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                  {customers.filter(c => 
                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                    c.mobile.includes(customerSearch)
                  ).length === 0 && (
                    <div className="px-5 py-8 text-center text-slate-400 text-xs italic font-medium">
                      No matching customers found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Customer Stats */}
        <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
          {selectedCustomer && (
            <div className="flex flex-col gap-1 p-6 border-2 border-black rounded-2xl bg-rose-50/50">
              <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Current Due Balance</span>
              <span className="text-4xl font-black text-black">
                 {selectedCustomer.dueBalance.toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black italic">02</span>
              <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Transaction Details</label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                  <input 
                    type="date"
                    className="w-full pl-14 pr-6 py-4 bg-white border-2 border-black rounded-2xl outline-none font-black text-black text-sm focus:ring-4 ring-black/5"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Enter Amount"
                    className="w-full pl-14 pr-6 py-4 bg-white border-2 border-black rounded-2xl outline-none font-black text-black text-lg placeholder:text-black/20 focus:ring-4 ring-black/5"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <select 
                    className="w-full px-6 py-4 bg-white border-2 border-black rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-black focus:ring-4 ring-black/5"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash">Cash Payment</option>
                    <option value="bKash">bKash (Mobile)</option>
                    <option value="Nagad">Nagad (Mobile)</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
               </div>
               
               <div className="space-y-2">
                  <div className="relative">
                    <Receipt className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                    <input 
                      type="text" 
                      placeholder="Reference (Optional)"
                      className="w-full pl-14 pr-6 py-4 bg-white border-2 border-black rounded-2xl outline-none font-black text-black text-sm placeholder:text-black/20 focus:ring-4 ring-black/5"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                  </div>
               </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              {success ? (
                <div className="bg-emerald-600 text-white py-5 px-8 rounded-2xl flex items-center justify-center gap-3 animate-in zoom-in-95 border-2 border-emerald-700 shadow-[8px_8px_0px_0px_rgba(5,150,105,0.2)]">
                  <CheckCircle2 size={24} className="text-white" />
                  <span className="font-black uppercase tracking-widest text-xs">Payment Processed Successfully</span>
                </div>
              ) : (
                <button 
                  type="submit"
                  disabled={!selectedCustomerId}
                  className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all duration-300 ${
                    selectedCustomerId 
                    ? 'bg-emerald-600 text-white shadow-[8px_8px_0px_0px_rgba(5,150,105,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 border-2 border-emerald-700' 
                    : 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  Confirm Collection
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
