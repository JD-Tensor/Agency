import React from 'react';
import { CurrencyCode, normalizeCurrencyCode, USD_TO_INR_RATE } from '../../services/currency';
import { Coins } from 'lucide-react';

interface CurrencyToggleProps {
  value: CurrencyCode | string;
  onChange: (currency: CurrencyCode) => void;
  size?: 'sm' | 'md';
  showRateNotice?: boolean;
  className?: string;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({
  value,
  onChange,
  size = 'md',
  showRateNotice = false,
  className = ''
}) => {
  const current = normalizeCurrencyCode(value);

  const isSmall = size === 'sm';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="inline-flex rounded-lg border border-parchment-300 bg-parchment-100/90 p-0.5 shadow-2xs">
        <button
          type="button"
          onClick={() => onChange('USD')}
          title="Convert all amounts to US Dollars ($)"
          className={`flex items-center gap-1 font-mono font-bold transition rounded-md ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          } ${
            current === 'USD'
              ? 'bg-white text-clay-900 shadow-xs border border-parchment-300'
              : 'text-ink-500 hover:text-ink-900 hover:bg-parchment-200/60'
          }`}
        >
          <span className={current === 'USD' ? 'text-clay-700' : 'text-ink-400'}>$</span>
          <span>USD</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('INR')}
          title="Convert all amounts to Indian Rupees (₹)"
          className={`flex items-center gap-1 font-mono font-bold transition rounded-md ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          } ${
            current === 'INR'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-ink-500 hover:text-ink-900 hover:bg-parchment-200/60'
          }`}
        >
          <span className={current === 'INR' ? 'text-emerald-100' : 'text-ink-400'}>₹</span>
          <span>INR</span>
        </button>
      </div>

      {showRateNotice && (
        <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-ink-500 font-mono bg-white px-1.5 py-0.5 rounded border border-parchment-200">
          <Coins className="w-2.5 h-2.5 text-clay-600" />
          <span>1 USD = ₹{USD_TO_INR_RATE}</span>
        </span>
      )}
    </div>
  );
};

