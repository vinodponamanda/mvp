import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Cog, 
  Truck, 
  CheckCheck, 
  XCircle,
} from 'lucide-react';

export default function StatusBadge({ status, type = 'order' }) {
  if (type === 'order') {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Proof
          </span>
        );
      case 'Artwork_Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
            Proof Approved
          </span>
        );
      case 'In_Production':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300 shadow-xs">
            <Cog className="w-3.5 h-3.5 text-orange-700 animate-spin" />
            Printing / Pressing
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-900 border border-stone-300 shadow-xs">
            <Truck className="w-3.5 h-3.5 text-stone-700" />
            Dispatched
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-300 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {status}
          </span>
        );
    }
  }

  if (type === 'payment') {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            PAID
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
            UNPAID
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-900 border border-rose-300">
            REFUNDED
          </span>
        );
      default:
        return <span className="text-xs text-slate-600 font-semibold">{status}</span>;
    }
  }

  if (type === 'boolean') {
    return status ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Draft
      </span>
    );
  }

  return null;
}
