import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  User,
  CreditCard,
  History,
  CheckCircle2,
  X,
  Wallet,
  BadgePercent,
  ArrowRight,
  ChevronDown,
  PackagePlus,
  Loader2
} from 'lucide-react';
import { Medicine, SaleItem, Customer, Sale } from '../types';

interface SalesPOSProps {
  medicines: Medicine[];
  customers: Customer[];
  onCompleteSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;
}

import InvoiceModal from './InvoiceModal';

export default function SalesPOS({ medicines, customers, onCompleteSale }: SalesPOSProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit'>('Cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  
  const [showInvoicedModal, setShowInvoiceModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Categories dropdown state
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const medDropdownRef = useRef<HTMLDivElement>(null);

  // Customer dropdown state
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (medDropdownRef.current && !medDropdownRef.current.contains(event.target as Node)) {
        setIsMedDropdownOpen(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicineId === medicine.id);
    
    if (existingItem) {
      if (existingItem.quantity + 1 > medicine.quantity) {
        alert('Not enough stock!');
        return;
      }
      setCart(cart.map(item => 
        item.medicineId === medicine.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.pricePerUnit }
          : item
      ));
    } else {
      setCart([...cart, {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: 1,
        pricePerUnit: medicine.salePrice,
        total: medicine.salePrice
      }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const medicine = medicines.find(m => m.id === id);
    setCart(cart.map(item => {
      if (item.medicineId === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (medicine && newQty > medicine.quantity) {
          alert('Not enough stock!');
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.pricePerUnit };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.medicineId !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const tax = 0; 
  const finalTotal = Math.max(0, subtotal - discount);
  
  const currentPaidAmount = paymentMethod === 'Cash' ? finalTotal : (Number(paidAmount) || 0);
  const dueAmount = Math.max(0, finalTotal - currentPaidAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Credit' && !selectedCustomerId) {
      alert("Please select a customer for credit (Baki) sale.");
      return;
    }

    setIsSaving(true);
    try {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

      const sale: Omit<Sale, 'id' | 'date'> = {
        items: cart,
        subtotal,
        discount,
        tax,
        total: finalTotal,
        paidAmount: currentPaidAmount,
        dueAmount: dueAmount,
        paymentMethod,
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomer?.name || 'Walking Customer'
      };

      const completedSale = await onCompleteSale(sale);
      setLastSale(completedSale);
      setShowInvoiceModal(true);
      
      // Reset form
      setCart([]);
      setDiscount(0);
      setPaymentMethod('Cash');
      setSelectedCustomerId('');
      setPaidAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-160px)] animate-in fade-in duration-500">
      {/* Left: Product POS Area */}
      <div className="flex-1 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Medicine</label>
          
          <div className="relative w-full" ref={medDropdownRef}>
            <div 
              onClick={() => setIsMedDropdownOpen(!isMedDropdownOpen)}
              className={`w-full px-5 py-4 bg-white border-2 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${isMedDropdownOpen ? 'border-blue-600 ring-4 ring-blue-500/10' : 'border-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-400" />
                <span className={`text-base font-bold ${isMedDropdownOpen ? 'text-slate-400' : 'text-slate-700'}`}>
                  Search & Add Medicines...
                </span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform duration-200 text-slate-400 ${isMedDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </div>

            {isMedDropdownOpen && (
              <div className="absolute z-[100] left-0 right-0 top-[calc(100%+8px)] bg-white border-2 border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b-2 border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Type medicine name..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none outline-none text-slate-800 font-bold rounded-xl text-sm"
                      value={medSearch}
                      onChange={(e) => setMedSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-[350px] overflow-y-auto py-1">
                  {medicines.filter(m => 
                    m.quantity > 0 && 
                    (m.name.toLowerCase().includes(medSearch.toLowerCase()) || 
                     m.brand.toLowerCase().includes(medSearch.toLowerCase()))
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(m);
                        setIsMedDropdownOpen(false);
                        setMedSearch('');
                      }}
                      className="w-full text-left px-6 py-4 transition-all hover:bg-blue-50 border-b last:border-0 border-slate-50 flex justify-between items-center group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm uppercase tracking-tight group-hover:text-blue-700">{m.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{m.brand} • {m.quantity} in stock</span>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="font-black text-slate-800 text-base">{m.salePrice.toFixed(2)}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Plus size={16} />
                        </div>
                      </div>
                    </button>
                  ))}
                  {medicines.filter(m => 
                    m.quantity > 0 &&
                    (m.name.toLowerCase().includes(medSearch.toLowerCase()) || 
                     m.brand.toLowerCase().includes(medSearch.toLowerCase()))
                  ).length === 0 && (
                    <div className="px-6 py-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50">
                      No matching medicines
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Removed Quick Instructions Area */}
      </div>

      {/* Right: Cart & Checkout Area */}
      <div className="w-full lg:w-[480px] shrink-0 pb-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-600" />
              <h3 className="font-black uppercase tracking-widest text-slate-800 text-xs text-blue-600">Sales Cart</h3>
            </div>
            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter">
              <span className="font-mono mr-1.5 text-emerald-600">{cart.length}</span>
              Items Selected
            </span>
          </div>

          <div className="space-y-1">
             {cart.length > 0 ? (
               <div className="border-2 border-slate-400 rounded-none overflow-hidden shadow-sm bg-white">
                 <div className="max-h-[350px] overflow-y-auto overflow-x-hidden">
                   <table className="w-full text-left border-collapse table-fixed">
                     <thead className="sticky top-0 z-10 bg-[#1A43A2] border-b-2 border-slate-400">
                       <tr>
                         <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest border-r border-white/20 w-[45%] text-center">Item Name</th>
                         <th className="px-2 py-3 text-[10px] font-black text-white uppercase tracking-widest border-r border-white/20 text-center w-[20%] text-center">Qty</th>
                         <th className="px-2 py-3 text-[10px] font-black text-white uppercase tracking-widest border-r border-white/20 text-center w-[25%] text-center">Total</th>
                         <th className="px-2 py-3 text-[10px] font-black text-white uppercase tracking-widest text-center w-[10%] text-center"></th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-400">
                       {cart.map(item => (
                         <tr key={item.medicineId} className="group hover:bg-slate-50 transition-colors">
                           <td className="px-4 py-4 border-r border-slate-400">
                              <p className="font-bold text-black uppercase text-xs truncate" title={item.medicineName}>{item.medicineName}</p>
                              <p className="text-[9px] text-slate-600 font-bold tracking-widest">{item.pricePerUnit.toFixed(2)} / UNIT</p>
                           </td>
                           <td className="px-2 py-4 border-r border-slate-400 text-center">
                              <input 
                                type="number"
                                min="0"
                                value={item.quantity}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const medicine = medicines.find(m => m.id === item.medicineId);
                                  if (medicine && val > medicine.quantity) {
                                    alert('Not enough stock!');
                                    return;
                                  }
                                  setCart(cart.map(c => c.medicineId === item.medicineId ? { ...c, quantity: val, total: val * c.pricePerUnit } : c));
                                }}
                                className="w-full max-w-[60px] px-2 py-1.5 bg-white border-2 border-slate-300 rounded-none text-center font-black text-xs text-black focus:border-black outline-none transition-all"
                              />
                           </td>
                           <td className="px-2 py-4 border-r border-slate-400 text-center font-black text-black text-sm">
                             {item.total.toFixed(2)}
                           </td>
                           <td className="px-2 py-4 border-b border-slate-400">
                             <div className="flex justify-center items-center">
                               <button 
                                 onClick={() => removeFromCart(item.medicineId)} 
                                 className="w-8 h-8 flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-all"
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             ) : (
                <div className="py-16 text-center space-y-3 bg-slate-50/50 border-2 border-dashed border-slate-200">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-200 shadow-sm">
                     <ShoppingCart size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cart is currently empty</p>
                </div>
             )}
          </div>

          <div className="space-y-6 pt-4">
            {/* Sales Mode Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`py-3.5 rounded-xl font-black uppercase tracking-[0.2em] transition-all text-[10px] flex items-center justify-center gap-2 ${paymentMethod === 'Cash' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-slate-300'}`}
              >
                <Wallet size={14} />
                Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('Credit')}
                className={`py-3.5 rounded-xl font-black uppercase tracking-[0.2em] transition-all text-[10px] flex items-center justify-center gap-2 ${paymentMethod === 'Credit' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-slate-300'}`}
              >
                <CreditCard size={14} />
                Credit (Baki)
              </button>
            </div>

            {/* Discount Section */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Discount</label>
               <div className="relative">
                  <BadgePercent className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-800 text-sm shadow-sm"
                    value={discount || ''}
                    onChange={e => setDiscount(Number(e.target.value))}
                  />
               </div>
            </div>

            {/* If Baki, show Customer & Partial Payment Selection */}
            {paymentMethod === 'Credit' && (
              <div className="space-y-4 pt-2 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2 relative" ref={customerDropdownRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Customer</label>
                    <div 
                      onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                      className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl cursor-pointer flex justify-between items-center transition-all ${isCustomerDropdownOpen ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-orange-200'} font-bold text-slate-800 text-sm shadow-sm`}
                    >
                      <span>
                        {selectedCustomerId 
                          ? customers.find(c => c.id === selectedCustomerId)?.name + ` (${customers.find(c => c.id === selectedCustomerId)?.mobile})`
                          : 'Choose Customer...'}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 text-slate-400 ${isCustomerDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </div>

                    {isCustomerDropdownOpen && (
                      <div className="absolute z-[100] left-0 right-0 top-[calc(100%+8px)] bg-white border-2 border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b-2 border-slate-100">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                              autoFocus
                              type="text" 
                              placeholder="Search customer..."
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none outline-none text-slate-800 font-bold rounded-xl text-sm"
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
                              }}
                              className={`w-full text-left px-5 py-4 text-sm font-bold transition-all hover:bg-orange-50 border-b border-slate-50/50 last:border-0 ${
                                selectedCustomerId === c.id ? 'text-orange-600 bg-orange-50/20' : 'text-slate-800'
                              } uppercase`}
                            >
                              <p className="font-black">{c.name}</p>
                              <p className="text-[10px] text-slate-400">{c.mobile}</p>
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Paid Amount (Nagad)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full px-4 py-3.5 bg-white border-2 border-orange-200 rounded-xl focus:border-orange-500 outline-none font-bold text-slate-800 text-sm shadow-sm"
                      value={paidAmount}
                      onChange={e => setPaidAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 bg-slate-50/50 rounded-3xl space-y-3">
               <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                 <span className="uppercase tracking-widest">Subtotal</span>
                 <span>{subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold text-rose-500">
                 <span className="uppercase tracking-widest">Discount</span>
                 <span>{discount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Payable Amount</span>
                 <span className={`text-3xl font-black ${paymentMethod === 'Credit' ? 'text-orange-600' : 'text-blue-600'}`}>
                   {finalTotal.toFixed(2)}
                 </span>
               </div>
               {paymentMethod === 'Credit' && dueAmount > 0 && (
                 <div className="flex justify-between items-center text-[10px] font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-xl mt-2 tracking-widest">
                   <span>DUE (BAKI)</span>
                   <span>{dueAmount.toFixed(2)}</span>
                 </div>
               )}
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isSaving}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:scale-100 text-xs ${paymentMethod === 'Cash' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-orange-600 text-white shadow-orange-500/30'}`}
            >
              {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
              {isSaving ? 'Processing...' : 'Complete Sale'}
              {!isSaving && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {showInvoicedModal && lastSale && (
        <InvoiceModal 
          sale={lastSale} 
          onClose={() => {
            setShowInvoiceModal(false);
            setCart([]);
            setSelectedCustomerId('');
            setDiscount(0);
            setPaymentMethod('Cash');
            setPaidAmount('');
          }} 
        />
      )}

    </div>
  );
}
