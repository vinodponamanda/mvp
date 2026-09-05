import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const QUICK_REASONS = [
  'Item / blank size out of stock',
  'Artwork file corrupted or too low resolution',
  'Customer requested order cancellation',
  'Delivery address outside service area',
  'Duplicate order placement',
  'Unresponsive customer on WhatsApp confirmation'
];

export default function CancellationModal({ isOpen, onClose, onConfirm, orderNumber }) {
  const [reason, setReason] = useState(QUICK_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = customReason.trim() || reason;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-black text-slate-900 font-['Outfit']">Decline / Cancel Order {orderNumber}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Cancellation Reason
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {QUICK_REASONS.map((r) => (
                <div
                  key={r}
                  onClick={() => {
                    setReason(r);
                    setCustomReason('');
                  }}
                  className={`
                    p-3 rounded-xl border text-xs cursor-pointer font-semibold transition-all
                    ${reason === r && !customReason
                      ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}
                  `}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Or write custom reason (visible to customer)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Specific DTF print requirement not feasible on requested color..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-rose-500 shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
