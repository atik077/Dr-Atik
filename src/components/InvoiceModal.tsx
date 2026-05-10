import React from 'react';
import { X, Receipt } from 'lucide-react';
import { Sale } from '../types';

interface InvoiceModalProps {
  sale: Sale;
  onClose: () => void;
}

export default function InvoiceModal({ sale, onClose }: InvoiceModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative font-mono text-xs text-black border-2 border-black max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="p-6 border-b-2 border-black relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>

          <div className="text-center space-y-2">
            <p className="text-2xl font-black uppercase tracking-tighter">Dr. Atikur Rahman</p>
            <p className="text-[10px] tracking-widest opacity-60">Uttara Sector 4, Dhaka | 01711223344</p>
            <div className="inline-block px-3 py-1 bg-black text-white text-[10px] uppercase font-black tracking-widest mt-2">
              Invoice No: INV-{sale.id.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Customer Details</p>
                <p className="text-sm font-black">{sale.customerName}</p>
                <p className="opacity-60">General Customer</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Transaction Info</p>
                <p>{new Date(sale.date).toLocaleDateString()}</p>
                <p>{new Date(sale.date).toLocaleTimeString()}</p>
                <p className="font-black pt-1">{sale.paymentMethod} SALE</p>
              </div>
          </div>

          <div className="space-y-4">
            <table className="w-full text-left">
              <thead className="border-b border-black sticky top-0 bg-white">
                <tr>
                  <th className="py-2 w-1/2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 uppercase font-black text-[10px]">
                      {item.medicineName}
                      <span className="block text-[8px] font-normal opacity-60">@{item.pricePerUnit.toFixed(2)}</span>
                    </td>
                    <td className="py-3 text-center opacity-60">{item.quantity}</td>
                    <td className="py-3 text-right font-bold">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t-2 border-black bg-slate-50 space-y-3">
           <div className="flex justify-between">
              <span className="uppercase opacity-60">Subtotal</span>
              <span className="font-bold">{sale.subtotal.toFixed(2)}</span>
           </div>
           {sale.discount > 0 && (
             <div className="flex justify-between text-rose-600">
                <span className="uppercase opacity-60 italic">Discount</span>
                <span className="font-bold">-{sale.discount.toFixed(2)}</span>
             </div>
           )}
           <div className="flex justify-between items-center bg-black p-4 text-white">
              <span className="font-black uppercase tracking-widest text-[10px]">Total Amount</span>
              <span className="text-xl font-black">{sale.total.toFixed(2)}</span>
           </div>

           <div className="text-center pt-4 opacity-40 italic">
            <p>Thank you for choosing Dr. Atikur Rahman!</p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 mt-2 bg-white border-2 border-black font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
