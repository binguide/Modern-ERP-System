export function formatCurrency(
  amount: number,
  currency: string = 'SAR',
  locale: string = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, locale: string = 'en-US', fractionDigits: number = 2): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
}

export function formatDateTime(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

export function generateDocumentNumber(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`;
}

export function calculatePercentage(part: number, total: number, fractionDigits: number = 2): number {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(fractionDigits));
}

export function calculateLineTotal(quantity: number, unitPrice: number, discount: number = 0): number {
  return Number((quantity * unitPrice - discount).toFixed(4));
}

export function calculateTax(amount: number, taxRate: number): number {
  return Number((amount * (taxRate / 100)).toFixed(4));
}

export function convertCurrency(amount: number, rate: number): number {
  return Number((amount * rate).toFixed(4));
}

export function sumBy<T>(arr: T[], selector: (item: T) => number): number {
  return arr.reduce((sum, item) => sum + selector(item), 0);
}

export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export function getInitials(firstName: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? '';
  const last = lastName?.charAt(0)?.toUpperCase() ?? '';
  return first + last;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
