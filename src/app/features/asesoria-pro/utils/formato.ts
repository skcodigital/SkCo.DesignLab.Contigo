import { HOY } from '../data/conversaciones.mock';

/** Pesos sin decimales: `$1.234.567` / `-$1.234`. */
export function pesos(n: number): string {
  return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('es-CO');
}

/** Porcentaje con `d` decimales: `14,15 %`. */
export function pct(v: number, d: number): string {
  return v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }) + ' %';
}

/** Miles con punto, vacío para 0 (campos de monto). */
export function miles(n: number): string {
  return n ? n.toLocaleString('es-CO') : '';
}

/** Solo los dígitos de un texto, como número (máximo 15 dígitos). */
export function soloDigitos(txt: string): number {
  return +txt.replace(/\D/g, '').slice(0, 15);
}

export function masDias(d: number, desde: Date = HOY): Date {
  return new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + d);
}

export function iso(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function deIso(s: string): Date {
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a, m - 1, d);
}

/** `16 nov 2026` (formato del navegador, como en Angular). */
export function fLarga(d: Date): string {
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** `16 nov`. */
export function fCorta(d: Date): string {
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/** `28/10/2026`. */
export function fNumerica(d: Date): string {
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

/** `16 nov` con los meses fijos de la pestaña en Angular (sin depender del navegador). */
export function fechaCorta(d: Date): string {
  return d.getDate() + ' ' + MESES_CORTOS[d.getMonth()];
}
