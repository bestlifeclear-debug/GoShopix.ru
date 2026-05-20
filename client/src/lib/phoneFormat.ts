/** Оставляет до 11 цифр, нормализует к формату РФ (+7). */
export function digitsRuPhone(value: string): string {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('8')) d = `7${d.slice(1)}`;
  if (d.length > 0 && !d.startsWith('7')) d = `7${d}`;
  return d.slice(0, 11);
}

/** Маска: +7 (999) 000-00-00 */
export function formatRuPhoneDisplay(value: string): string {
  const d = digitsRuPhone(value);
  if (d.length === 0) return '';
  if (d.length <= 1) return '+7';

  const rest = d.slice(1);
  const p1 = rest.slice(0, 3);
  const p2 = rest.slice(3, 6);
  const p3 = rest.slice(6, 8);
  const p4 = rest.slice(8, 10);

  let out = '+7';
  if (p1) out += ` (${p1}`;
  if (p1.length === 3) out += ')';
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

export function isRuPhoneComplete(value: string): boolean {
  return digitsRuPhone(value).length === 11;
}
