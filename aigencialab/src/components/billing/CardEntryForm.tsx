'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CreditCard } from 'lucide-react';

interface CardTokenData {
  token: string;
  last4: string;
  brand: string;
  expiry: string; // MM/YY
}

interface CardEntryFormProps {
  onSubmit: (data: CardTokenData) => Promise<void>;
  loading: boolean;
}

// Detect card brand from first digits (BIN)
function detectBrand(num: string): string {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  return 'Tarjeta';
}

// Format card number with spaces: 4 4 4 4
function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

// Format expiry as MM/YY
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function CardEntryForm({ onSubmit, loading }: CardEntryFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [brand, setBrand] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mpReady, setMpReady] = useState(false);

  // Load MercadoPago SDK
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey) {
      console.warn('[CardEntryForm] NEXT_PUBLIC_MP_PUBLIC_KEY not set');
      setMpReady(true); // Allow form to show even without MP for UX
      return;
    }

    if (typeof window.MercadoPago !== 'undefined') {
      setMpReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => setMpReady(true);
    document.head.appendChild(script);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const rawNumber = cardNumber.replace(/\s/g, '');
    const [expMonth, expYear] = expiry.split('/');
    const last4 = rawNumber.slice(-4);
    const detectedBrand = detectBrand(rawNumber);

    // Basic validation
    if (rawNumber.length < 13) {
      setValidationError('Número de tarjeta inválido.');
      return;
    }
    if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
      setValidationError('Fecha de vencimiento inválida (MM/AA).');
      return;
    }
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (parseInt(expYear) < currentYear || (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
      setValidationError('La tarjeta está vencida.');
      return;
    }
    if (cvv.length < 3) {
      setValidationError('CVV inválido.');
      return;
    }
    if (holderName.trim().length < 3) {
      setValidationError('Ingresa el nombre como aparece en la tarjeta.');
      return;
    }

    // Tokenize via MercadoPago SDK (never sends raw data to our backend)
    try {
      const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
      let token = '';

      if (publicKey && typeof window.MercadoPago !== 'undefined') {
        const mp = new window.MercadoPago(publicKey);
        const tokenResult = await mp.createCardToken({
          cardNumber: rawNumber,
          cardExpirationMonth: expMonth,
          cardExpirationYear: `20${expYear}`,
          securityCode: cvv,
          cardholderName: holderName.trim(),
        });
        if (tokenResult.error) {
          throw new Error(tokenResult.error.message ?? 'Error tokenizando tarjeta');
        }
        token = tokenResult.id;
      } else {
        // Fallback: generate a mock token for environments without MP key
        // In production this should always use the real MP SDK
        console.warn('[CardEntryForm] MP SDK not available, using mock token');
        token = `mock_token_${Date.now()}`;
      }

      await onSubmit({
        token,
        last4,
        brand: detectedBrand,
        expiry: `${expMonth}/${expYear}`,
      });
    } catch (err: any) {
      setValidationError(err.message ?? 'No se pudo procesar la tarjeta. Verifique los datos e intente nuevamente.');
    }
  };

  const inputClass = 'w-full bg-slate-800 text-white placeholder-slate-500 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all';
  const labelClass = 'block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
          {validationError}
        </p>
      )}

      {/* Card Number */}
      <div>
        <label className={labelClass}>Número de tarjeta</label>
        <div className="relative">
          <input
            id="card-number-input"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={e => {
              const formatted = formatCardNumber(e.target.value);
              setCardNumber(formatted);
              setBrand(detectBrand(formatted));
            }}
            className={`${inputClass} pr-16`}
            required
          />
          {brand && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {brand}
            </span>
          )}
        </div>
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Vencimiento</label>
          <input
            id="card-expiry-input"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={expiry}
            onChange={e => setExpiry(formatExpiry(e.target.value))}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>CVV</label>
          <input
            id="card-cvv-input"
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className={labelClass}>Nombre del titular</label>
        <input
          id="card-holder-input"
          type="text"
          autoComplete="cc-name"
          placeholder="Como aparece en la tarjeta"
          value={holderName}
          onChange={e => setHolderName(e.target.value.toUpperCase())}
          className={inputClass}
          required
        />
      </div>

      {/* Submit */}
      <button
        id="card-submit-btn"
        type="submit"
        disabled={loading || !mpReady}
        className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Validando tarjeta...</>
        ) : (
          <><CreditCard className="w-4 h-4" /> Guardar tarjeta</>
        )}
      </button>
    </form>
  );
}
