import { FormatoRegional } from '@features/monitor/interfaces/comunes';

/**
 * Formatos de números, dinero, fechas y texto del Monitor. Reemplazan `DecimalPipe` (con el `LOCALE_ID` de cada
 * vista: `es-CO` en el Monitor del cliente, `en-US` en el exterior), `toLocaleString('es-CO')`, moment y el pipe
 * `capitalize` de producción.
 */

const formateadores = new Map<string, Intl.NumberFormat>();

function formateador(formato: string, opciones: Intl.NumberFormatOptions): Intl.NumberFormat {
  const clave = `${formato}|${JSON.stringify(opciones)}`;
  let f = formateadores.get(clave);
  if (!f) {
    f = new Intl.NumberFormat(formato, opciones);
    formateadores.set(clave, f);
  }
  return f;
}

/**
 * Equivale a `DecimalPipe` con `'1.{minimo}-{maximo}'`. Devuelve '' si el valor no es numérico (el pipe de
 * producción fallaba con texto no numérico).
 */
export function formatearNumero(
  valor: number | string,
  minimo: number,
  maximo: number,
  formato: FormatoRegional,
): string {
  const n = Number(valor);
  if (valor === '' || Number.isNaN(n)) {
    return '';
  }
  return formateador(formato, { minimumFractionDigits: minimo, maximumFractionDigits: maximo }).format(n);
}

/** Equivale a `Number(valor).toLocaleString('es-CO')` (hasta 3 decimales, sin mínimo). */
export function numeroColombiano(valor: number | string): string {
  return formateador('es-CO', {}).format(Number(valor));
}

/** Equivale a `toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`. */
export function numeroColombianoDosDecimales(valor: number | string): string {
  return formateador('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(valor));
}

/** Pesos colombianos sin decimales, como `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })`. */
export function formatearPesos(valor: number | string): string {
  return formateador('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(valor));
}

/** `YYYY-MM-DD` sin hora. */
const SOLO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

function dosDigitos(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** `dd/MM/yyyy` de una fecha (texto que entienda `new Date` o un `Date`), en hora local, como producción. */
export function formatearFechaCorta(valor: string | Date): string {
  // `new Date('YYYY-MM-DD')` se lee como UTC y en Colombia mostraría el día anterior: esa forma se arma en hora local.
  const soloFecha = typeof valor === 'string' ? SOLO_FECHA.exec(valor) : null;
  const fecha = soloFecha
    ? new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]))
    : new Date(valor);
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

/**
 * Pipe `capitalize` de producción: todo a minúsculas y mayúscula al inicio de cada palabra. Usa `\b\w` como
 * producción, así que una letra tras una tilde también sube («DíAs»).
 */
export function capitalizar(texto: string): string {
  if (!texto) {
    return texto;
  }
  return texto.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
