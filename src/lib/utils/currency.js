import { CURRENCIES } from './constants';

/**
 * Formater un montant avec la devise
 * @param {number} amount
 * @param {string} [currencyCode='XAF']
 * @returns {string}
 */
export function formatAmount(amount, currencyCode = 'XAF') {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const decimals = currencyCode === 'XAF' ? 0 : 2;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('fr-FR')} ${currency.symbol}`;
  }
}

/**
 * Formater un montant court (ex: 1.5M, 250K)
 * @param {number} amount
 * @param {string} [currencyCode='XAF']
 * @returns {string}
 */
export function formatAmountShort(amount, currencyCode = 'XAF') {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ${currency.symbol}`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K ${currency.symbol}`;
  }
  return `${amount} ${currency.symbol}`;
}

/**
 * Parser un string en nombre
 * @param {string} value
 * @returns {number}
 */
export function parseAmount(value) {
  const cleaned = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}