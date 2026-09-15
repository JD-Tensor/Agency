import { DocumentPayload } from '../types/documents';

export type CurrencyCode = 'USD' | 'INR';

export const USD_TO_INR_RATE = 85.0;

export const CURRENCY_CONFIG: Record<CurrencyCode, { code: CurrencyCode; symbol: string; label: string; name: string }> = {
  USD: { code: 'USD', symbol: '$', label: '$ USD', name: 'US Dollar' },
  INR: { code: 'INR', symbol: '₹', label: '₹ INR', name: 'Indian Rupee' }
};

export const getCurrencySymbol = (currency?: string): string => {
  if (!currency) return '$';
  const clean = currency.trim().toUpperCase();
  if (clean === 'INR' || clean === '₹' || clean === 'RS' || clean === 'RS.') return '₹';
  return '$';
};

export const normalizeCurrencyCode = (currency?: string): CurrencyCode => {
  if (!currency) return 'USD';
  const clean = currency.trim().toUpperCase();
  if (clean === 'INR' || clean === '₹' || clean === 'RS' || clean === 'RS.') return 'INR';
  return 'USD';
};

/**
 * Converts a numeric amount between USD and INR using the standard exchange rate (1 USD = ₹85).
 */
export const convertAmount = (
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'USD'
): number => {
  if (typeof amount !== 'number' || isNaN(amount)) return 0;
  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);
  if (from === to) return amount;

  if (from === 'USD' && to === 'INR') {
    return Math.round(amount * USD_TO_INR_RATE);
  }
  if (from === 'INR' && to === 'USD') {
    return Math.round((amount / USD_TO_INR_RATE) * 100) / 100;
  }
  return amount;
};

/**
 * Formats a currency number with appropriate symbol and locale commas.
 * Optional fromCurrency automatically handles conversion.
 */
export const formatMoney = (
  amount: number,
  targetCurrency: CurrencyCode | string = 'USD',
  fromCurrency?: string
): string => {
  const target = normalizeCurrencyCode(targetCurrency);
  const from = fromCurrency ? normalizeCurrencyCode(fromCurrency) : target;
  
  const converted = from !== target ? convertAmount(amount, from, target) : amount;
  const symbol = CURRENCY_CONFIG[target].symbol;

  if (target === 'INR') {
    const formatted = Math.round(converted).toLocaleString('en-IN');
    return `${symbol}${formatted}`;
  } else {
    const formatted = converted.toLocaleString('en-US', {
      minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
    return `${symbol}${formatted}`;
  }
};

/**
 * Automatically translates all monetary fields in a document payload
 * when the user switches between USD and INR.
 */
export const translateDocumentPayload = (
  payload: DocumentPayload,
  targetCurrency: CurrencyCode
): DocumentPayload => {
  const target = normalizeCurrencyCode(targetCurrency);
  const targetSymbol = CURRENCY_CONFIG[target].symbol;

  switch (payload.type) {
    case 'proposal': {
      const data = payload.data;
      const currentCurrency = normalizeCurrencyCode((data as any).currency || 'USD');
      if (currentCurrency === target) return payload;

      const convertedMilestones = (data.milestones || []).map(m => ({
        ...m,
        price: m.price !== undefined ? convertAmount(m.price, currentCurrency, target) : undefined
      }));

      const convertedTiers = (data.pricingTiers || []).map(t => ({
        ...t,
        price: convertAmount(t.price, currentCurrency, target)
      }));

      const convertedFixed = data.fixedTotal !== undefined 
        ? convertAmount(data.fixedTotal, currentCurrency, target) 
        : undefined;

      return {
        type: 'proposal',
        data: {
          ...data,
          currency: target,
          currencySymbol: targetSymbol,
          milestones: convertedMilestones,
          pricingTiers: convertedTiers,
          fixedTotal: convertedFixed
        } as any
      };
    }

    case 'quotation': {
      const data = payload.data;
      const currentCurrency = normalizeCurrencyCode(data.currency || 'USD');
      if (currentCurrency === target) return payload;

      const convertedLineItems = (data.lineItems || []).map(item => ({
        ...item,
        unitPrice: convertAmount(item.unitPrice, currentCurrency, target)
      }));

      const convertedAddons = (data.addonOptions || []).map(addon => ({
        ...addon,
        price: convertAmount(addon.price, currentCurrency, target)
      }));

      return {
        type: 'quotation',
        data: {
          ...data,
          currency: target,
          currencySymbol: targetSymbol,
          lineItems: convertedLineItems,
          addonOptions: convertedAddons
        }
      };
    }

    case 'rate_chart': {
      const data = payload.data;
      const currentCurrency = normalizeCurrencyCode(data.currency || 'USD');
      if (currentCurrency === target) return payload;

      const convertedServices = (data.services || []).map(srv => ({
        ...srv,
        simple: {
          ...srv.simple,
          price: convertAmount(srv.simple.price, currentCurrency, target)
        },
        medium: {
          ...srv.medium,
          price: convertAmount(srv.medium.price, currentCurrency, target)
        },
        complex: {
          ...srv.complex,
          price: convertAmount(srv.complex.price, currentCurrency, target)
        }
      }));

      return {
        type: 'rate_chart',
        data: {
          ...data,
          currency: target,
          currencySymbol: targetSymbol,
          services: convertedServices
        }
      };
    }

    case 'invoice': {
      const data = payload.data;
      const currentCurrency = normalizeCurrencyCode(data.currency || 'USD');
      if (currentCurrency === target) return payload;

      const convertedItems = (data.lineItems || []).map(item => ({
        ...item,
        unitPrice: convertAmount(item.unitPrice, currentCurrency, target)
      }));

      return {
        type: 'invoice',
        data: {
          ...data,
          currency: target,
          currencySymbol: targetSymbol,
          lineItems: convertedItems
        }
      };
    }

    case 'receipt': {
      const data = payload.data;
      const currentCurrency = normalizeCurrencyCode(data.currency || 'USD');
      if (currentCurrency === target) return payload;

      return {
        type: 'receipt',
        data: {
          ...data,
          currency: target,
          currencySymbol: targetSymbol,
          amountPaid: convertAmount(data.amountPaid, currentCurrency, target),
          balanceRemaining: convertAmount(data.balanceRemaining, currentCurrency, target)
        }
      };
    }

    case 'discovery': {
      const data = payload.data;
      // Convert budgetRange if it matches e.g. "$35,000 – $50,000" or similar
      let updatedBudget = data.budgetRange;
      if (target === 'INR' && data.budgetRange?.includes('$')) {
        updatedBudget = data.budgetRange.replace(/\$([0-9,]+)/g, (_, val) => {
          const num = parseFloat(val.replace(/,/g, ''));
          return `₹${Math.round(num * USD_TO_INR_RATE).toLocaleString('en-IN')}`;
        }).replace(/USD/gi, 'INR');
      } else if (target === 'USD' && data.budgetRange?.includes('₹')) {
        updatedBudget = data.budgetRange.replace(/₹([0-9,]+)/g, (_, val) => {
          const num = parseFloat(val.replace(/,/g, ''));
          return `$${Math.round(num / USD_TO_INR_RATE).toLocaleString('en-US')}`;
        }).replace(/INR/gi, 'USD');
      }

      return {
        type: 'discovery',
        data: {
          ...data,
          budgetRange: updatedBudget
        }
      };
    }

    default:
      return payload;
  }
};

