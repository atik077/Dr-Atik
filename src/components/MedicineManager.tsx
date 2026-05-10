import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { Medicine, Category } from '../types';
import { generateMedicineDescription } from '../services/geminiService';

interface MedicineManagerProps {
  medicines: Medicine[];
  onSave: (medicine: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function MedicineManager({ medicines, onSave, onDelete }: MedicineManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    category: 'Tablet' as Category,
    description: '',
    purchasePrice: '' as any,
    salePrice: '' as any,
    quantity: '' as any,
    expiryDate: '',
    supplierName: '',
  });

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenForm = (med?: Medicine) => {
    if (med) {
      setEditingMedicine(med);
      setFormData({
        name: med.name,
        genericName: med.genericName,
        brand: med.brand,
        category: med.category,
        description: med.description,
        purchasePrice: med.purchasePrice,
        salePrice: med.salePrice,
        quantity: med.quantity,
        expiryDate: med.expiryDate,
        supplierName: med.supplierName,
      });
    } else {
      setEditingMedicine(null);
      setFormData({
        name: '',
        genericName: '',
        brand: '',
        category: 'Tablet',
        description: '',
        purchasePrice: '',
        salePrice: '',
        quantity: '',
        expiryDate: '',
        supplierName: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!formData.name || !formData.genericName) {
      alert("Please enter a medicine name and generic name first.");
      return;
    }
    setIsLoadingDescription(true);
    const desc = await generateMedicineDescription(formData.name, formData.genericName, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsLoadingDescription(false);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ ...formData, id: editingMedicine?.id });
      // Reset form if it was a new entry
      if (!editingMedicine) {
        setFormData({
          name: '',
          genericName: '',
          brand: '',
          category: 'Tablet',
          description: '',
          purchasePrice: '',
          salePrice: '',
          quantity: '',
          expiryDate: '',
          supplierName: '',
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const categories: string[] = [
    'All', 'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Drops', 'Injection', 'Ointment', 
    'Cream', 'Gel', 'Lotion', 'Eye Drop', 'Ear Drop', 'Nasal Spray', 'Inhaler', 
    'Suppository', 'IV Fluid', 'Other'
  ];

  if (isFormOpen) {
    return (
      <div className="space-y-6 text-black animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-black pb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFormOpen(false)} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold uppercase tracking-tighter">
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Medicine Name" 
              value={formData.name} 
              onChange={(v: string) => setFormData({...formData, name: v})} 
              placeholder="e.g. Paracetamol"
              required
            />
            <FormInput 
              label="Generic Name" 
              value={formData.genericName} 
              onChange={(v: string) => setFormData({...formData, genericName: v})} 
              placeholder="e.g. Acetaminophen"
              required
            />
            <FormInput 
              label="Brand Name" 
              value={formData.brand} 
              onChange={(v: string) => setFormData({...formData, brand: v})} 
              placeholder="e.g. Napa"
            />
            <div className="space-y-2 relative" ref={categoryDropdownRef}>
              <label className="text-xs font-bold text-black uppercase tracking-widest ml-1">Category*</label>
              <div 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full px-4 py-3 bg-white border ${isCategoryOpen ? 'border-[#8ABE53] ring-1 ring-[#8ABE53]' : 'border-slate-300'} rounded-lg cursor-pointer flex justify-between items-center transition-all text-black font-medium shadow-sm hover:border-slate-400`}
              >
                <span className={!formData.category ? 'text-slate-400' : ''}>{formData.category || 'Select Category'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 text-slate-400 ${isCategoryOpen ? 'rotate-180' : 'rotate-0'}`} />
              </div>

              {isCategoryOpen && (
                <div className="absolute z-[100] left-0 right-0 top-[calc(100%+4px)] bg-[#FCF8FF] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 bg-[#FCF8FF]">
                    <div className="relative border-b-2 border-[#8267BE] pb-2">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Search Category"
                        className="w-full text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-1">
                    {categories.filter(c => c !== 'All').filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({...formData, category: c as Category});
                          setIsCategoryOpen(false);
                          setCategorySearch('');
                        }}
                        className={`w-full text-left px-5 py-4 text-[13px] font-bold tracking-tight transition-all hover:bg-slate-100 border-b border-slate-50/50 last:border-0 ${
                          formData.category === c ? 'text-[#8267BE] bg-white' : 'text-slate-800'
                        } uppercase`}
                      >
                        {c}
                      </button>
                    ))}
                    {categories.filter(c => c !== 'All').filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                      <div className="px-5 py-8 text-center text-slate-400 text-xs italic font-medium">
                        No matching categories found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 relative group">
            <label className="text-xs font-bold text-black uppercase tracking-widest ml-1 flex justify-between items-center">
              Description
              <button 
                type="button"
                onClick={handleGenerateAI}
                disabled={isLoadingDescription}
                className="text-black text-[10px] font-black uppercase flex items-center gap-1 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors border border-black"
              >
                {isLoadingDescription ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Generate with AI
              </button>
            </label>
            <textarea 
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-black font-medium min-h-[120px]"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe usage, dosage, and warnings..."
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <FormInput 
              label="Purchase Price" 
              type="number" 
              value={formData.purchasePrice} 
              onChange={(v: string) => setFormData({...formData, purchasePrice: v === '' ? '' : parseFloat(v)})} 
              placeholder="0.00"
              required
            />
            <FormInput 
              label="Sale Price" 
              type="number" 
              value={formData.salePrice} 
              onChange={(v: string) => setFormData({...formData, salePrice: v === '' ? '' : parseFloat(v)})} 
              placeholder="0.00"
              required
            />
            <FormInput 
              label="Quantity" 
              type="number" 
              value={formData.quantity} 
              onChange={(v: string) => setFormData({...formData, quantity: v === '' ? '' : parseInt(v)})} 
              placeholder="Quantity"
              required
            />
            <FormInput 
              label="Expiry Date" 
              type="date" 
              value={formData.expiryDate} 
              onChange={(v: string) => setFormData({...formData, expiryDate: v})} 
              required
            />
            <div className="col-span-2">
              <FormInput 
                label="Supplier Name" 
                value={formData.supplierName} 
                onChange={(v: string) => setFormData({...formData, supplierName: v})} 
                placeholder="Enter supplier name"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4 max-w-md">
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="flex-1 py-3 bg-slate-100 text-black border border-slate-300 rounded-lg font-bold hover:bg-slate-200 transition-all uppercase text-sm tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-3 bg-black text-white rounded-lg font-bold hover:bg-slate-800 transition-all active:scale-95 uppercase text-sm tracking-widest shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : (editingMedicine ? 'Update Medicine' : 'Save Medicine')}
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
          <h2 className="text-2xl font-bold text-black uppercase tracking-tighter">Inventory Management</h2>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-black text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add Medicine
        </button>
      </div>

      {/* Filters (No card style) */}
      <div className="flex flex-col md:flex-row gap-4 items-center border-b border-slate-200 pb-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
          <input 
            type="text" 
            placeholder="Search medicine..." 
            className="w-full pl-12 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                categoryFilter === cat 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table with borders and no card background */}
      <div className="overflow-hidden border border-black rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-black min-w-max">
            <thead>
              <tr className="bg-[#1A43A2] border-b border-black">
                <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center whitespace-nowrap">Medicine Name</th>
                <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center whitespace-nowrap">Brand Name</th>
                <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center whitespace-nowrap">Category</th>
                <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-widest text-center border-r border-black whitespace-nowrap">Stock</th>
                <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center whitespace-nowrap">Price</th>
                <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-widest border-r border-black text-center whitespace-nowrap">Expiry</th>
                <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-widest text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((med) => {
                const isLowStock = med.quantity < 10;
                const isExpired = new Date(med.expiryDate) < new Date();
                
                return (
                  <tr key={med.id} className="border-b border-black hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 border-r border-black whitespace-nowrap text-left">
                      <p className="font-bold text-black">{med.name}</p>
                      <p className="text-[10px] text-black/40 italic">{med.genericName}</p>
                    </td>
                    <td className="px-4 py-3 border-r border-black whitespace-nowrap text-center">
                      <p className="text-sm font-medium text-black">{med.brand}</p>
                    </td>
                    <td className="px-4 py-3 border-r border-black whitespace-nowrap text-center">
                      <span className="text-black text-xs font-bold uppercase transition-all">
                        {med.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center border-r border-black whitespace-nowrap">
                      <span className={`font-bold text-base ${isLowStock ? 'text-red-600 underline decoration-2' : 'text-black'}`}>
                        {med.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-black whitespace-nowrap text-center font-bold text-sm">
                      {med.salePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 border-r border-black whitespace-nowrap text-center text-sm">
                      <p className={`font-medium ${isExpired ? 'text-red-600 font-black' : 'text-black'}`}>
                        {new Date(med.expiryDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => handleOpenForm(med)}
                          className="p-1.5 text-black hover:text-[#1A43A2] hover:bg-blue-50 border border-slate-200 rounded transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(med.id)}
                          className="p-1.5 text-black hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMedicines.length === 0 && (
            <div className="text-center py-20 text-black">
              <Pill className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No medicines found matching your criteria.</p>
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

function Pill({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
  );
}
