// Formatos numéricos y de fecha del prototipo (locale es-CO).

/** Número con `d` decimales fijos (`fmt` del prototipo). */
export function fmtNum(n: number, d = 0): string {
  return n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** Número con un decimal (`fmt1`). */
export function fmt1(n: number): string {
  return fmtNum(n, 1);
}

/** Millones con signo pesos, sin la "M" (`m$`): 27400 → "$27.400". */
export function fmtPesos(v: number): string {
  return '$' + v.toLocaleString('es-CO');
}

/** Entero con signo: +3, −2 (signo menos tipográfico) o 0. */
export function signo(n: number): string {
  return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
}

/** Porcentaje entero de `n` sobre `t`. */
export function pct(n: number, t: number): number {
  return Math.round((n / t) * 100);
}

/** "20 de noviembre de 2026". */
export function fmtFechaLarga(d: Date): string {
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "3:05 p. m.". */
export function fmtHora(d: Date): string {
  return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
}

/** Variación porcentual con un decimal y coma: +4,8% / −7,3% / 0,0%. */
export function fmtVariacion(v: number): string {
  return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ',') + '%';
}
