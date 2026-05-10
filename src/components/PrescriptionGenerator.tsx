import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Medal, 
  Stethoscope, 
  Download, 
  Edit3, 
  ChevronLeft,
  Plus,
  ArrowRight,
  Pill,
  Upload,
  X,
  ChevronDown,
  Search,
  Settings,
  Trash2,
  Check
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import download from 'downloadjs';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { Medicine, ChiefComplaint, ExaminationFinding } from '../types';
import { storageService } from '../services/storageService';

function SearchableDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder,
  labelField = 'name',
  searchPlaceholder = 'Search...',
  multiSelect = false
}: { 
  options: any[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string,
  labelField?: string,
  searchPlaceholder?: string,
  multiSelect?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt => {
    const label = (opt[labelField] || opt.value || '').toString().toLowerCase();
    return label.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (val: string) => {
    if (multiSelect) {
      if (!value) {
        onChange(val);
      } else if (!value.split('\n').some(item => item.trim() === val.trim())) {
        onChange(`${value}\n${val}`);
      }
    } else {
      onChange(val);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer flex justify-between items-center transition-all h-[38px] group hover:border-black"
      >
        <span className={`text-sm font-bold truncate ${!value ? 'text-slate-400' : 'text-black'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] left-0 right-0 top-full mt-1 bg-white border border-black shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-xl overflow-hidden min-w-[240px]"
          >
            <div className="p-2 border-b border-black/5 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-black outline-none font-bold"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto scrollbar-hide py-1">
              {filtered.length > 0 ? (
                filtered.map((opt, idx) => (
                  <button
                    key={opt.id || idx}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    onClick={() => handleSelect(opt[labelField] || opt.value)}
                  >
                    <p className="text-[13px] font-black text-black uppercase tracking-tight leading-tight">
                      {opt[labelField] || opt.value}
                    </p>
                    {opt.brand && (
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{opt.brand} | {opt.category}</p>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-[10px] text-slate-300 uppercase font-black tracking-[0.2em]">No Matches</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PresetManagerModal({ 
  isOpen, 
  onClose, 
  type, 
  items, 
  onSave, 
  onDelete 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  type: 'C/C' | 'O/E', 
  items: any[], 
  onSave: (val: string, id?: string) => Promise<void>, 
  onDelete: (id: string) => Promise<void> 
}) {
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!newValue.trim()) return;
    setIsSaving(true);
    try {
      await onSave(newValue.trim(), editingId || undefined);
      setNewValue('');
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-black"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-black uppercase tracking-widest">Manage {type} Presets</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input 
              className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:border-black outline-none font-bold text-sm"
              placeholder={`Add new ${type}...`}
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
            />
            <button 
              onClick={handleSave}
              disabled={isSaving || !newValue.trim()}
              className="px-4 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {editingId ? <Check size={20} /> : <Plus size={20} />}
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            <AnimatePresence initial={false}>
              {items.map(item => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group"
                >
                  <span className="text-sm font-bold text-slate-700 truncate mr-4">{item.value}</span>
                  <div className="flex gap-1 transition-opacity">
                    <button 
                      onClick={() => {
                        setNewValue(item.value);
                        setEditingId(item.id);
                      }}
                      className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-black transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {items.length === 0 && (
              <div className="py-10 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">No presets saved</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface PrescriptionData {
  doctor: {
    name: string;
    degree: string;
    specialization: string;
    regNo: string;
    mobile: string;
    address: string;
  };
  patient: {
    name: string;
    gender: string;
    age: string;
    date: string;
  };
  clinical: {
    chiefComplaint: string;
    onExamination: string;
    advice: string;
  };
  medicines: {
    id: string;
    name: string;
    dosage: string;
    duration: string;
  }[];
}

export default function PrescriptionGenerator({ medicines }: { medicines: Medicine[] }) {
  const [data, setData] = useState<PrescriptionData>({
    doctor: {
      name: 'Dr. Md. Atikur Rahman',
      degree: '',
      specialization: 'GENERAL PHYSICIAN',
      regNo: 'D-18950',
      mobile: '01321-930094',
      address: ''
    },
    patient: {
      name: '',
      gender: '',
      age: '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    },
    clinical: {
      chiefComplaint: '',
      onExamination: '',
      advice: ''
    },
    medicines: [
      { id: '1', name: '', dosage: '', duration: '' }
    ]
  });

  const [chiefComplaints, setChiefComplaints] = useState<ChiefComplaint[]>([]);
  const [examinationFindings, setExaminationFindings] = useState<ExaminationFinding[]>([]);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetModalType, setPresetModalType] = useState<'C/C' | 'O/E'>('C/C');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string>('');

  const [medicinesText, setMedicinesText] = useState('');
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const draftId = currentUser?.uid;
        let finalData = null;

        // 1. Try Firebase if logged in
        if (draftId) {
          const firebaseData = await storageService.getPrescriptionDraft(draftId);
          if (firebaseData) finalData = firebaseData;
        }

        // 2. Try localStorage if no Firebase data or not logged in
        if (!finalData) {
          const savedData = localStorage.getItem('last_prescription_data');
          if (savedData) {
            try {
              finalData = JSON.parse(savedData);
            } catch (e) {
              console.error("Failed to parse localStorage data", e);
            }
          }
        }

        // 3. Apply data if found
        if (finalData) {
          setData(prev => ({
            ...prev,
            ...finalData,
            // Ensure doctor info stays if the draft was missing it or had defaults
            doctor: { ...prev.doctor, ...(finalData.doctor || {}) },
            patient: { ...prev.patient, ...(finalData.patient || {}) },
            clinical: { ...prev.clinical, ...(finalData.clinical || {}) },
            medicines: finalData.medicines || prev.medicines
          }));
        }
      } catch (err) {
        console.error("Error fetching draft:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchDraft();
    
    const savedSig = localStorage.getItem('doctor_signature');
    if (savedSig) setSignatureUrl(savedSig);
    loadPresets();
  }, [currentUser]);

  useEffect(() => {
    if (!isLoaded) return;

    const syncToFirebase = async () => {
      // Still keep a local backup for crash recovery, but it's secondary
      localStorage.setItem('last_prescription_data', JSON.stringify(data));

      if (currentUser?.uid) {
        try {
          await storageService.savePrescriptionDraft(currentUser.uid, data);
        } catch (e) {
          console.error("Firebase sync error:", e);
        }
      }
    };

    // Debounce the cloud sync
    const timeoutId = setTimeout(syncToFirebase, 600);
    return () => clearTimeout(timeoutId);
  }, [data, isLoaded, currentUser]);

  const loadPresets = async () => {
    const cc = await storageService.getChiefComplaints();
    const ef = await storageService.getExaminationFindings();
    setChiefComplaints(cc);
    setExaminationFindings(ef);
  };

  const handleSavePreset = async (value: string, id?: string) => {
    if (presetModalType === 'C/C') {
      await storageService.saveChiefComplaint({ id, value });
    } else {
      await storageService.saveExaminationFinding({ id, value });
    }
    loadPresets();
  };

  const handleDeletePreset = async (id: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      if (presetModalType === 'C/C') {
        await storageService.deleteChiefComplaint(id);
      } else {
        await storageService.deleteExaminationFinding(id);
      }
      loadPresets();
    }
  };

  const addMedicine = () => {
    setData({
      ...data,
      medicines: [...data.medicines, { id: Date.now().toString(), name: '', dosage: '', duration: '' }]
    });
  };

  const removeMedicine = (id: string) => {
    if (data.medicines.length > 1) {
      setData({
        ...data,
        medicines: data.medicines.filter(m => m.id !== id)
      });
    }
  };

  const updateMedicine = (id: string, field: keyof typeof data.medicines[0], value: string) => {
    setData({
      ...data,
      medicines: data.medicines.map(m => m.id === id ? { ...m, [field]: value } : m)
    });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSignatureUrl(base64);
        localStorage.setItem('doctor_signature', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    setSignatureUrl('');
    localStorage.removeItem('doctor_signature');
  };

  const handleDownload = async () => {
    const pageElements = document.querySelectorAll('.prescription-page');
    if (!pageElements.length || isDownloading) return;
    
    setIsDownloading(true);
    
    const downloadOptions = {
        quality: 0.95,
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: 794,
        height: 1123,
        skipFonts: true, // Often helps with mobile/iframe issues
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
    };

    const triggerDownload = async (blob: Blob, name: string, isPdf: boolean = false) => {
      try {
        const mimeType = isPdf ? 'application/pdf' : 'image/jpeg';
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        // For mobile/APK environments, Share API is much better
        if (navigator.share && isMobile) {
          try {
            const file = new File([blob], name, { type: mimeType });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  files: [file],
                  title: isPdf ? 'Prescription PDF' : 'Prescription Image',
                  text: 'Medical Prescription'
                });
                return;
              } catch (innerErr) {
                console.error('Share intent failed', innerErr);
              }
            }
          } catch (shareErr) {
            console.error('Share failed, falling back to download', shareErr);
          }
        }
        
        // Use downloadjs to trigger the download from the Blob reliably
        download(blob, name, mimeType);
      } catch (err) {
        console.error('Download trigger failed', err);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    };

    try {
      // Small delay to ensure any pending UI updates are flushed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const patientName = data.patient.name.trim().replace(/\s+/g, '_') || 'patient';
      const dateStr = data.patient.date.replace(/-/g, '');
      const fileName = `prescription_${patientName}_${dateStr}`;

      if (pageElements.length === 1) {
        // Single page -> JPG
        const element = pageElements[0] as HTMLElement;
        
        const dataUrl = await toJpeg(element, {
          quality: 0.95,
          pixelRatio: 2.5,
          backgroundColor: '#ffffff',
          cacheBust: true,
          skipFonts: true,
          style: {
            transform: 'none',
            margin: '0'
          }
        });
        
        // Convert dataUrl to Blob for triggerDownload
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await triggerDownload(blob, `${fileName}.jpg`, false);
      } else {
        // Multiple pages -> PDF
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pageElements.length; i++) {
          const element = pageElements[i] as HTMLElement;
          const dataUrl = await toJpeg(element, {
            quality: 0.85,
            pixelRatio: 1.5, // Reduced for smaller PDF size on mobile
            backgroundColor: '#ffffff',
            cacheBust: true,
            skipFonts: true,
            style: {
              transform: 'none',
              margin: '0'
            }
          });
          
          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }
        
        const pdfBlob = pdf.output('blob');
        await triggerDownload(pdfBlob, `${fileName}.pdf`, true);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা স্ক্রিনশট নিন।');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
  };

  // Pagination Logic
  const MEDICINES_PER_PAGE = 8; // Reduced further to 8 for guaranteed footer space
  const medicineChunks = [];
  for (let i = 0; i < data.medicines.length; i += MEDICINES_PER_PAGE) {
    medicineChunks.push(data.medicines.slice(i, i + MEDICINES_PER_PAGE));
  }
  const totalPages = Math.max(1, medicineChunks.length);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center gap-6 pb-20 animate-in fade-in duration-500">
        {/* Controls */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg sticky top-4 z-[200]">
          <button 
            onClick={() => setIsGenerating(false)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-100 rounded-xl font-bold text-black hover:bg-slate-200 transition-all"
          >
            <Edit3 className="h-4 w-4" />
            <span className="hidden md:inline">Edit Form</span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-2" />

          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center p-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all shadow-md group disabled:opacity-50"
            title="Download Prescription"
          >
            {isDownloading ? (
               <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Prescription Preview Area */}
        <div className="w-full flex-1 bg-slate-200/50 flex flex-col items-center gap-12 p-4 md:p-12 overflow-auto scrollbar-hide min-h-screen">
          {Array.from({ length: totalPages }).map((_, pageIdx) => (
            <div 
              key={pageIdx} 
              className="relative shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white rounded-sm overflow-hidden"
              style={{
                width: 'min(794px, 95vw)',
                aspectRatio: '210 / 297',
              }}
            >
              {/* Scale Wrapper for Preview Only */}
              <div 
                style={{ 
                  transform: 'scale(var(--preview-scale, 1))',
                  transformOrigin: 'top left',
                  width: '794px',
                  height: '1123px'
                } as any}
                ref={(el) => {
                  if (el) {
                    const updateScale = () => {
                      const containerWidth = el.parentElement!.clientWidth;
                      const pageWidth = 794; 
                      const scale = containerWidth / pageWidth;
                      el.style.setProperty('--preview-scale', scale.toString());
                    };
                    updateScale();
                    window.addEventListener('resize', updateScale);
                  }
                }}
              >
                {/* captured element - NO transform here */}
                <div 
                  className="prescription-page bg-white flex flex-col p-12 text-black relative" 
                  style={{ 
                    width: '794px', 
                    height: '1123px',
                    minWidth: '794px',
                    minHeight: '1123px'
                  }}
                >
                  {/* Doctor/Clinic Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-0.5">
                      <h1 className="text-[26px] font-bold leading-tight">{data.doctor.name}</h1>
                      <p className="text-[17px] font-medium">{data.doctor.degree}</p>
                      <p className="text-[17px] font-medium">{data.doctor.specialization}</p>
                      <p className="text-[17px] font-medium">Reg: {data.doctor.regNo}</p>
                      <p className="text-[17px] font-medium">Mobile: {data.doctor.mobile}</p>
                    </div>
                    <div className="pt-2 text-right">
                      <p className="text-[18px] font-bold">Date: {data.patient.date}</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-300 mb-2"></div>

                  {/* Patient Info Bar */}
                  <div className="flex items-center text-[18px] font-bold mb-2 flex-wrap gap-y-2">
                    <div className="flex items-baseline mr-10">
                      <span className="whitespace-nowrap">Patient Name:</span>
                      <span className="ml-1 px-1">{data.patient.name}</span>
                    </div>
                    <div className="flex items-baseline mr-10">
                      <span className="whitespace-nowrap">Gender:</span>
                      <span className="ml-1 px-1">{data.patient.gender}</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="whitespace-nowrap">Age:</span>
                      <span className="ml-1 px-1">{data.patient.age}</span>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-300 mb-6"></div>

                  {/* Main Content Body */}
                  <div className="flex-1 flex gap-10">
                    {/* Left Column: Clinical Notes */}
                    <div className="w-[260px] shrink-0 border-r border-slate-200 pr-6">
                      {pageIdx === 0 && (
                        <div className="space-y-10 pt-4">
                          <div>
                            <h4 className="text-[20px] font-black mb-2">C/C:</h4>
                            <div className="text-[17px] font-bold whitespace-pre-wrap pl-2 leading-tight">{data.clinical.chiefComplaint}</div>
                          </div>
                          <div>
                            <h4 className="text-[20px] font-black mb-2">O/E:</h4>
                            <div className="text-[17px] font-bold whitespace-pre-wrap pl-2 leading-tight">{data.clinical.onExamination}</div>
                          </div>
                          <div>
                            <h4 className="text-[20px] font-black mb-2">ADV:</h4>
                            <div className="text-[17px] font-bold whitespace-pre-wrap pl-2 leading-tight">{data.clinical.advice}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Rx (Medicines) */}
                    <div className="flex-1 pt-4 relative">
                      {pageIdx === 0 && (
                        <div className="mb-4">
                          <span className="text-[54px] font-serif font-black italic leading-none">Rx</span>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {(medicineChunks[pageIdx] || []).map((m, mIdx) => (
                          <div key={m.id} className="pb-3 border-b border-dashed border-slate-300 last:border-0 mb-3">
                            <div className="flex items-start gap-4">
                              <span className="text-[20px] font-bold min-w-[30px]">{ (pageIdx * MEDICINES_PER_PAGE) + mIdx + 1}.</span>
                              <div className="flex-1">
                                <p className="text-[20px] font-bold mb-1">{m.name}</p>
                                <div className="flex gap-12 text-[17px] font-medium text-slate-800 ml-6 italic">
                                  <span>{m.dosage}</span>
                                  <span>{m.duration}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Signature Area (Only on Last Page) - Moved to follow medicines immediately */}
                      {pageIdx === totalPages - 1 && (
                        <div className="mt-24 mb-8 flex flex-col items-start px-2">
                          {signatureUrl && (
                            <div className="h-20 flex items-end -mb-1 relative z-10">
                              <img src={signatureUrl} alt="Signature" className="max-h-full max-w-[220px] object-contain mix-blend-darken" />
                            </div>
                          )}
                          <div className="border-t border-slate-400 pt-1 min-w-[220px]">
                             <p className="text-[20px] font-black leading-tight">{data.doctor.name}</p>
                             <p className="text-[16px] font-bold text-slate-700 leading-tight">{data.doctor.degree}</p>
                             <p className="text-[16px] font-bold text-slate-700 leading-tight">{data.doctor.specialization}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Area: Footer Only */}
                  <div className="mt-auto">
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Generated by Dr. Atikur Rahman Digital Assistant</span>
                      <span>Page {pageIdx + 1} of {totalPages}</span>
                    </div>
                  </div>

                  {/* Watermark/Logo placeholder */}
                  <div className="absolute right-12 bottom-12 opacity-[0.03] pointer-events-none -z-10">
                     <Stethoscope size={400} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in slide-in-from-bottom-2 duration-300 px-4 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-black uppercase tracking-tight italic">Prescription Generator</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Digital Medical Management</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Doctor Row - Editable */}
        <details className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
          <summary className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-slate-400" />
              <h3 className="text-sm font-black uppercase tracking-wider">Doctor Information</h3>
            </div>
            <ChevronDown size={18} className="text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="p-6 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Doctor Name</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black text-sm"
                  value={data.doctor.name}
                  onChange={e => setData({...data, doctor: {...data.doctor, name: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Degrees / Qualification</label>
                <input 
                  type="text"
                  placeholder="MBBS, BCS"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black text-sm"
                  value={data.doctor.degree}
                  onChange={e => setData({...data, doctor: {...data.doctor, degree: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specialization</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black text-sm"
                  value={data.doctor.specialization}
                  onChange={e => setData({...data, doctor: {...data.doctor, specialization: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registration No</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black text-sm"
                  value={data.doctor.regNo}
                  onChange={e => setData({...data, doctor: {...data.doctor, regNo: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black text-sm"
                  value={data.doctor.mobile}
                  onChange={e => setData({...data, doctor: {...data.doctor, mobile: e.target.value}})}
                />
              </div>
            </div>
          </div>
        </details>

        {/* Patient Row */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
           <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-400" />
              <h3 className="text-sm font-black uppercase tracking-wider">Patient Details</h3>
           </div>
           
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Name</label>
              <input 
                type="text"
                placeholder="Name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black text-sm"
                value={data.patient.name}
                onChange={e => setData({...data, patient: {...data.patient, name: e.target.value}})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black h-[46px] text-sm"
                value={data.patient.gender}
                onChange={e => setData({...data, patient: {...data.patient, gender: e.target.value}})}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age</label>
              <input 
                type="text"
                placeholder="Age"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black text-sm"
                value={data.patient.age}
                onChange={e => setData({...data, patient: {...data.patient, age: e.target.value}})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black text-sm"
                value={data.patient.date}
                onChange={e => setData({...data, patient: {...data.patient, date: e.target.value}})}
              />
            </div>
          </div>
        </div>

        {/* Clinical Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chief Complaint (C/C)</label>
              <button 
                onClick={() => {
                  setPresetModalType('C/C');
                  setIsPresetModalOpen(true);
                }}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-black"
                title="Manage Presets"
              >
                <Settings size={14} />
              </button>
            </div>
            <SearchableDropdown 
              options={chiefComplaints}
              value={data.clinical.chiefComplaint}
              onChange={val => setData({...data, clinical: {...data.clinical, chiefComplaint: val}})}
              placeholder="Select C/C"
              labelField="value"
              searchPlaceholder="Search complaints..."
              multiSelect={true}
            />
            <textarea 
              placeholder="Or type custom C/C here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black min-h-[80px] resize-none text-sm"
              value={data.clinical.chiefComplaint}
              onChange={e => setData({...data, clinical: {...data.clinical, chiefComplaint: e.target.value}})}
            />
          </div>
          <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">On Examination (O/E)</label>
              <button 
                onClick={() => {
                  setPresetModalType('O/E');
                  setIsPresetModalOpen(true);
                }}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-black"
                title="Manage Presets"
              >
                <Settings size={14} />
              </button>
            </div>
            <SearchableDropdown 
              options={examinationFindings}
              value={data.clinical.onExamination}
              onChange={val => setData({...data, clinical: {...data.clinical, onExamination: val}})}
              placeholder="Select O/E"
              labelField="value"
              searchPlaceholder="Search findings..."
              multiSelect={true}
            />
            <textarea 
              placeholder="Or type custom O/E here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black min-h-[80px] resize-none text-sm"
              value={data.clinical.onExamination}
              onChange={e => setData({...data, clinical: {...data.clinical, onExamination: e.target.value}})}
            />
          </div>
          <div className="space-y-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Advice (Adv)</label>
            <textarea 
              placeholder="e.g. Drink plenty of water"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-bold text-black min-h-[140px] resize-none text-sm"
              value={data.clinical.advice}
              onChange={e => setData({...data, clinical: {...data.clinical, advice: e.target.value}})}
            />
          </div>
        </div>

        {/* Preset Management Modal */}
        <AnimatePresence>
          {isPresetModalOpen && (
            <PresetManagerModal 
              isOpen={isPresetModalOpen}
              onClose={() => setIsPresetModalOpen(false)}
              type={presetModalType}
              items={presetModalType === 'C/C' ? chiefComplaints : examinationFindings}
              onSave={handleSavePreset}
              onDelete={handleDeletePreset}
            />
          )}
        </AnimatePresence>

        {/* Dynamic Medicine Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
           <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
              <Pill className="h-5 w-5 text-black" />
              <h3 className="text-sm font-black uppercase tracking-wider">Rx - Medicines</h3>
           </div>

           <div className="space-y-3">
             {data.medicines.map((m, idx) => (
                <div key={m.id} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 rounded-xl relative border border-slate-100 group">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Medicine Name</label>
                    <SearchableDropdown 
                      options={medicines}
                      value={m.name}
                      onChange={val => updateMedicine(m.id, 'name', val)}
                      placeholder="Select Medicine"
                      labelField="name"
                      searchPlaceholder="Search medicines..."
                    />
                  </div>
                  <div className="w-full md:w-28 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dose</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-black text-center text-sm"
                      placeholder="1+0+1"
                      value={m.dosage}
                      onChange={e => updateMedicine(m.id, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-40 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-black text-sm"
                      placeholder="1 week"
                      value={m.duration}
                      onChange={e => updateMedicine(m.id, 'duration', e.target.value)}
                    />
                  </div>
                  {data.medicines.length > 1 && (
                    <button 
                      onClick={() => removeMedicine(m.id)}
                      className="md:opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-md hover:bg-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
             
             <div className="flex justify-center pt-2">
                <button 
                  onClick={addMedicine}
                  className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-full hover:bg-black hover:text-white transition-all shadow-sm border border-slate-200"
                  title="Add Medicine"
                >
                  <Plus className="h-5 w-5" />
                </button>
             </div>
           </div>
        </div>

        {/* Signature Area (Simplified) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider">Upload Signature</h3>
               </div>
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-slate-100 text-black border border-slate-200 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-200 transition-all"
                >
                  Choose Image
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleSignatureUpload} accept="image/*" />
            </div>

            <div className="shrink-0">
              {signatureUrl ? (
                <div className="relative">
                  <div className="w-40 h-20 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                    <img src={signatureUrl} alt="Preview" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  </div>
                  <button 
                    onClick={clearSignature}
                    className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-40 h-20 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-300 font-bold text-[10px] uppercase">No signature</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <motion.button 
            onClick={handleGenerate}
            disabled={!data.patient.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-12 py-4 bg-[#96c93d] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#85b336] transition-all flex items-center gap-4 shadow-xl shadow-lime-100 disabled:opacity-50 disabled:grayscale whitespace-nowrap"
          >
            Generate Prescription
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}


function InputGroup({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all font-medium text-black"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function InputGroupDark({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white/10 border-none rounded-xl focus:ring-2 focus:ring-white transition-all font-medium text-white placeholder:text-white/20"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
