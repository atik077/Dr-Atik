import React, { useState } from 'react';
import { 
  PackagePlus, 
  History, 
  ArrowUpRight, 
  Calendar, 
  User, 
  Layers,
  Search,
  ChevronDown,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Medicine, Purchase } from '../types';

interface PurchasesProps {
  medicines: Medicine[];
  purchases: Purchase[];
  onAddPurchase: (purchase: any) => Promise<void>;
}

export default function Purchases({ medicines, purchases, onAddPurchase }: PurchasesProps) {
  const [selectedMedId, setSelectedMedId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(0);
  const [supplierName, setSupplierName] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const medDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (medDropdownRef.current && !medDropdownRef.current.contains(event.target as Node)) {
        setIsMedDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedMed = medicines.find(m => m.id === selectedMedId);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId || quantity === '' || purchasePrice === '') return;

    setIsSaving(true);
    try {
      await onAddPurchase({
        medicineId: selectedMedId,
        medicineName: selectedMed?.name || '',
        quantity,
        purchasePrice,
        total: Number(quantity) * Number(purchasePrice),
        supplierName: supplierName || selectedMed?.supplierName || '',
      });

      // Reset
      setSelectedMedId('');
      setQuantity(1);
      setPurchasePrice(0);
      setSupplierName('');
      setMedSearch('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Stock Inflow</h2>
        <p className="text-slate-500 font-bold text-sm">Restock inventory and track purchase history.</p>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-slate-100/80 p-1.5 rounded-xl flex w-full border border-slate-200">
          <button 
            onClick={() => setShowHistory(true)}
            className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all duration-300 ${showHistory ? 'bg-white shadow-md text-black' : 'text-slate-500 hover:text-slate-700'}`}
          >
            History
          </button>
          <button 
            onClick={() => setShowHistory(false)}
            className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all duration-300 ${!showHistory ? 'bg-white shadow-md text-black' : 'text-slate-500 hover:text-slate-700'}`}
          >
            New Purchase
          </button>
        </div>
      </div>

      {!showHistory ? (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="pb-4 border-b border-black">
            <h3 className="text-xl font-bold text-black uppercase tracking-tight flex items-center gap-3">
              <PackagePlus className="text-black h-5 w-5" />
              New Stock Entry
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative" ref={medDropdownRef}>
                <label className="text-xs font-bold text-black uppercase tracking-widest ml-1">Select Medicine*</label>
                <div 
                  onClick={() => setIsMedDropdownOpen(!isMedDropdownOpen)}
                  className={`w-full px-4 py-3 bg-white border ${isMedDropdownOpen ? 'border-[#8ABE53] ring-1 ring-[#8ABE53]' : 'border-slate-300'} rounded-lg cursor-pointer flex justify-between items-center transition-all text-black font-medium shadow-sm hover:border-slate-400`}
                >
                  <span className={!selectedMed ? 'text-slate-400' : ''}>
                    {selectedMed ? `${selectedMed.name} (${selectedMed.brand})` : 'Choose medicine...'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 text-slate-400 ${isMedDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                </div>

                {isMedDropdownOpen && (
                  <div className="absolute z-[100] left-0 right-0 top-[calc(100%+4px)] bg-[#FCF8FF] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 bg-[#FCF8FF]">
                      <div className="relative border-b-2 border-[#8267BE] pb-2">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Search Medicine"
                          className="w-full text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                          value={medSearch}
                          onChange={(e) => setMedSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-1">
                      {medicines.filter(m => 
                        m.name.toLowerCase().includes(medSearch.toLowerCase()) || 
                        m.brand.toLowerCase().includes(medSearch.toLowerCase())
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedId(m.id);
                            setPurchasePrice(m.purchasePrice);
                            setIsMedDropdownOpen(false);
                            setMedSearch('');
                          }}
                          className={`w-full text-left px-5 py-4 text-[13px] font-bold tracking-tight transition-all hover:bg-slate-100 border-b border-slate-50/50 last:border-0 ${
                            selectedMedId === m.id ? 'text-[#8267BE] bg-white' : 'text-slate-800'
                          } uppercase`}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold">{m.name}</span>
                            <span className="text-[10px] opacity-60">{m.brand} | {m.category}</span>
                          </div>
                        </button>
                      ))}
                      {medicines.filter(m => 
                        m.name.toLowerCase().includes(medSearch.toLowerCase()) || 
                        m.brand.toLowerCase().includes(medSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-5 py-8 text-center text-slate-400 text-xs italic font-medium">
                          No matching medicines found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-widest ml-1">Supplier Name</label>
                <input 
                  type="text" 
                  placeholder="Enter supplier..."
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black font-medium placeholder:text-slate-300"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-widest ml-1">Quantity (Units)*</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black font-medium placeholder:text-slate-300"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-widest ml-1">Unit Purchase Price*</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black font-medium placeholder:text-slate-300"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
            </div>

            {selectedMed && quantity !== '' && purchasePrice !== '' && (
              <div className="bg-slate-50 p-6 rounded-xl border border-black/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-lg border border-black/10">
                    <Layers className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventory Impact</p>
                    <p className="text-sm font-bold text-black">New quantity will be <span className="text-lg font-black text-blue-600">{selectedMed.quantity + Number(quantity)}</span> units.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Cost</p>
                  <p className="text-3xl font-black text-black">{(Number(quantity) * Number(purchasePrice)).toFixed(2)}</p>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-black text-white rounded-lg font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              {isSaving ? 'Processing...' : 'Confirm Purchase & Update Stock'}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.length > 0 ? (
            purchases.slice().reverse().map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-xl border border-black shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 bg-slate-50 rounded-bl-xl border-l border-b border-black transform translate-x-1 -translate-y-1 group-hover:bg-black group-hover:text-white transition-all">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-black/10">
                      <Calendar className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">{new Date(p.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(p.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-black text-black uppercase leading-none">{p.medicineName}</h4>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Refill Operation</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-black/10">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Quantity</p>
                      <p className="font-bold text-black">{p.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Unit Price</p>
                      <p className="font-bold text-black">{p.purchasePrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black">
                    <div className="flex items-center gap-2">
                       <User className="h-4 w-4 text-slate-400" />
                       <span className="text-[10px] font-bold text-black uppercase truncate max-w-[100px]">{p.supplierName}</span>
                    </div>
                    <p className="text-lg font-black text-black">{p.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-32 space-y-4">
              <History className="h-20 w-20 mx-auto text-slate-100" />
              <div>
                <p className="text-slate-400 font-black uppercase tracking-widest">No history found</p>
                <p className="text-slate-300 text-sm">Start restocking medicines to see history here.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
