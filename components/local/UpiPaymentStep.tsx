"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  orderNumber:  string;
  amount:       number;       // INR
  upi: {
    vpa:          string;
    payeeName:    string;
    instructions: string;
  };
  onSubmit:     (utr: string) => Promise<void> | void;
  onSkip:       () => void;
  submitting:   boolean;
};

/** Build the upi:// payment URI consumed by every Indian UPI app. */
function buildUpiUri(vpa: string, payeeName: string, amount: number, orderNumber: string): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName || "Merchant",
    am: amount.toFixed(2),
    cu: "INR",
    tn: `Order ${orderNumber}`,
  });
  // URLSearchParams uses + for spaces; UPI apps want %20. Convert.
  return `upi://pay?${params.toString().replace(/\+/g, "%20")}`;
}

export default function UpiPaymentStep({
  orderNumber, amount, upi, onSubmit, onSkip, submitting,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [utr, setUtr]             = useState("");
  const [error, setError]         = useState("");
  const [copied, setCopied]       = useState(false);

  const upiUri = buildUpiUri(upi.vpa, upi.payeeName, amount, orderNumber);

  // Generate QR client-side as a data URL
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(upiUri, {
      margin: 1,
      width:  280,
      color:  { dark: "#1f3d2b", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { /* silent — fall back to text */ });
    return () => { cancelled = true; };
  }, [upiUri]);

  function handleConfirm() {
    setError("");
    const clean = utr.trim();
    // UTR/RRN is typically 12 digits (sometimes 16 alphanumeric for IMPS). Accept either.
    if (!/^[A-Za-z0-9]{8,22}$/.test(clean)) {
      setError("Enter your UTR / transaction reference number from your UPI app (8–22 chars).");
      return;
    }
    void onSubmit(clean);
  }

  function copyVpa() {
    navigator.clipboard?.writeText(upi.vpa).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 bg-brand-mint/40 border-b border-brand-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-sage">Step 2 of 2 · Payment</p>
          <h2 className="text-base font-bold text-brand-green mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
            Pay ₹{amount.toFixed(0)} via UPI
          </h2>
          <p className="text-xs text-brand-muted mt-1">
            Order <span className="font-mono">{orderNumber}</span>
          </p>
        </div>

        {/* QR + intent button */}
        <div className="p-5 grid sm:grid-cols-2 gap-5 items-center">
          {/* QR */}
          <div className="flex flex-col items-center text-center">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Scan to pay via UPI" className="w-56 h-56 rounded-xl border border-brand-border" />
            ) : (
              <div className="w-56 h-56 rounded-xl bg-gray-100 animate-pulse" />
            )}
            <p className="text-xs text-brand-muted mt-3">Scan with any UPI app</p>
          </div>

          {/* Right column — payee details + intent button */}
          <div className="space-y-4">
            <div className="bg-brand-mint/30 rounded-xl p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-brand-muted">Paying to</p>
              <p className="font-bold text-brand-green">{upi.payeeName || "Merchant"}</p>
              <button
                onClick={copyVpa}
                className="text-xs font-mono text-brand-dark hover:text-brand-green flex items-center gap-1.5"
              >
                {upi.vpa}
                <span className="text-[10px] text-brand-muted">{copied ? "✓ copied" : "📋"}</span>
              </button>
              <p className="text-xs text-brand-muted pt-1">
                Amount: <span className="font-bold text-brand-dark">₹{amount.toFixed(0)}</span>
              </p>
            </div>

            <a
              href={upiUri}
              className="block w-full text-center bg-brand-green text-white text-sm font-bold py-3 rounded-full hover:bg-brand-mid transition-colors"
            >
              Open my UPI app
            </a>
            <p className="text-[11px] text-brand-muted text-center">
              On mobile this launches GPay / PhonePe / Paytm directly with the amount pre-filled.
            </p>
          </div>
        </div>
      </div>

      {/* Screenshot reminder — high visibility */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex gap-4">
        <div className="text-3xl shrink-0">📸</div>
        <div>
          <h3 className="text-sm font-bold text-amber-900 mb-1">Important — share a payment screenshot on WhatsApp</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            After paying, take a screenshot of the &quot;Payment Successful&quot; screen from your UPI app
            and send it on the WhatsApp chat that opens next. This helps us verify and ship your order faster.
          </p>
        </div>
      </div>

      {upi.instructions && (
        <div className="bg-white border border-brand-border rounded-2xl px-5 py-4">
          <p className="text-xs font-bold text-brand-green uppercase tracking-wider mb-2">Note from the seller</p>
          <p className="text-sm text-brand-dark leading-relaxed whitespace-pre-line">{upi.instructions}</p>
        </div>
      )}

      {/* UTR entry */}
      <div className="bg-white rounded-2xl border border-brand-border p-5">
        <label className="block text-sm font-bold text-brand-green mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Enter UTR / Transaction Reference
        </label>
        <p className="text-xs text-brand-muted mb-3">
          After paying, your UPI app shows a 12-digit UTR (sometimes called &quot;Transaction ID&quot; or &quot;UPI Ref. No.&quot;).
          Paste it below so we can find your payment quickly.
        </p>
        <input
          type="text"
          inputMode="numeric"
          value={utr}
          onChange={(e) => setUtr(e.target.value.replace(/\s+/g, ""))}
          placeholder="e.g. 312345678901"
          className="w-full px-4 py-3 text-sm font-mono tracking-wide border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-sage bg-white"
        />
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSkip}
          disabled={submitting}
          className="flex-1 px-5 py-3 border border-brand-border rounded-full text-sm font-semibold text-brand-muted hover:text-brand-green hover:border-brand-green transition-colors disabled:opacity-50"
        >
          I&apos;ll pay later via WhatsApp
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg shadow-[#25D366]/20"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/>
          </svg>
          {submitting ? "Confirming…" : "I've paid — Send WhatsApp"}
        </button>
      </div>
    </div>
  );
}
