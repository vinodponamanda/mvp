import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, ShieldCheck, IndianRupee, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UpiQrPaymentModal({
  isOpen,
  onClose,
  amount,
  orderNumber,
  upiId = 'manavibeprints@okaxis',
  onPaymentConfirmed
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const upiPayload = `upi://pay?pa=${upiId}&pn=ManaVibePrints&am=${amount}&cu=INR&tn=Order_${orderNumber || 'MVP'}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored
    }
    if (onPaymentConfirmed) onPaymentConfirmed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="text-left">
            <h3 className="text-sm font-black text-slate-900 font-['Outfit']">Scan UPI QR to Pay</h3>
            <p className="text-[11px] text-slate-500 font-medium">PhonePe, Google Pay, Paytm, BHIM</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic UPI QR Code */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50/50 border border-orange-200">
          <div className="p-3 rounded-2xl bg-white shadow-md border border-slate-200">
            <QRCodeSVG
              value={upiPayload}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-3">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Pay Exact Total:</span>
            <span className="text-2xl font-black text-orange-600 font-['Outfit']">
              ₹{amount}
            </span>
          </div>
        </div>

        {/* UPI ID Copy Action */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 truncate">{upiId}</span>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-[11px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy UPI ID'}</span>
          </button>
        </div>

        {/* Confirm Payment Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I Have Completed Payment</span>
        </button>

        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your order proof will be generated immediately</span>
        </div>

      </div>
    </div>
  );
}
