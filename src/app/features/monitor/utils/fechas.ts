import { FormatoRegional } from '@features/monitor/interfaces/comunes';

/** Fechas del Monitor sin moment: ISO local, restas de meses/años y el calendario del selector de fechas. */

function dosDigitos(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** `YYYY-MM-DD` de una fecha, en hora local. */
export function aIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

/** Fecha local a partir de `YYYY-MM-DD` (o `null` si el texto no tiene ese formato). */
export function desdeIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) {
    return null;
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function diasDelMes(anio: number, mes: number): number {
  return new Date(anio, mes + 1, 0).getDate();
}

/** Resta meses como moment: si el día no existe en el mes destino queda en el último día (31-mar − 1 = 28/29-feb). */
export function restarMeses(fecha: Date, meses: number): Date {
  const total = fecha.getFullYear() * 12 + fecha.getMonth() - meses;
  const anio = Math.floor(total / 12);
  const mes = total - anio * 12;
  const dia = Math.min(fecha.getDate(), diasDelMes(anio, mes));
  return new Date(anio, mes, dia);
}

/** Resta años como moment (29-feb − 1 año = 28-feb). */
export function restarAnios(fecha: Date, anios: number): Date {
  return restarMeses(fecha, anios * 12);
}

/** Mismo día calendario (sin hora). */
export function mismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Compara días calendario: negativo si `a` es antes que `b`. */
export function compararDias(a: Date, b: Date): number {
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() -
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
}

const FORMATOS_ESTRICTOS: readonly { patron: RegExp; orden: readonly ['a' | 'm' | 'd', 'a' | 'm' | 'd', 'a' | 'm' | 'd'] }[] = [
  { patron: /^(\d{4})-(\d{2})-(\d{2})$/, orden: ['a', 'm', 'd'] },
  { patron: /^(\d{2})\/(\d{2})\/(\d{4})$/, orden: ['m', 'd', 'a'] },
  { patron: /^(\d{2})\/(\d{2})\/(\d{4})$/, orden: ['d', 'm', 'a'] },
  { patron: /^(\d{4})\/(\d{2})\/(\d{2})$/, orden: ['a', 'm', 'd'] },
];

function fechaValida(anio: number, mes: number, dia: number): boolean {
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasDelMes(anio, mes - 1);
}

/**
 * `normalizeDateToISO` de producción: acepta `YYYY-MM-DD`, `MM/DD/YYYY`, `DD/MM/YYYY` y `YYYY/MM/DD` (en ese
 * orden, estrictos) o cualquier texto que entienda `new Date`. `null` si no es una fecha válida.
 */
export function normalizarFechaIso(valor: string | Date | null | undefined): string | null {
  if (!valor) {
    return null;
  }
  if (valor instanceof Date) {
    return aIso(valor);
  }
  for (const { patron, orden } of FORMATOS_ESTRICTOS) {
    const m = patron.exec(valor);
    if (!m) {
      continue;
    }
    const partes = { a: 0, m: 0, d: 0 };
    orden.forEach((parte, i) => (partes[parte] = Number(m[i + 1])));
    if (fechaValida(partes.a, partes.m, partes.d)) {
      return `${partes.a}-${dosDigitos(partes.m)}-${dosDigitos(partes.d)}`;
    }
  }
  const libre = new Date(valor);
  return Number.isNaN(libre.getTime()) ? null : aIso(libre);
}

/** Meses abreviados del rango visible del periodo (producción los tiene fijos en español). */
export const MESES_RANGO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;

/** Nombres del calendario (datos de localización de Angular que usaba el datepicker de ng-bootstrap). */
export interface NombresCalendario {
  mesesLargos: readonly string[];
  mesesCortos: readonly string[];
  /** De lunes a domingo (el calendario empieza en lunes). */
  diasCortos: readonly string[];
}

export const NOMBRES_CALENDARIO: Readonly<Record<FormatoRegional, NombresCalendario>> = {
  'es-CO': {
    mesesLargos: [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ],
    mesesCortos: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'],
    diasCortos: ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'],
  },
  'en-US': {
    mesesLargos: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    mesesCortos: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    diasCortos: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  },
};

/** Día de la cuadrícula del calendario; `fuera` = de otro mes (se pinta vacío). */
export interface DiaCalendario {
  fecha: Date;
  fuera: boolean;
}

/** Las 6 semanas (de lunes a domingo) que pinta el calendario para un mes. */
export function semanasDelMes(anio: number, mes: number): DiaCalendario[][] {
  const primero = new Date(anio, mes, 1);
  const desfase = (primero.getDay() + 6) % 7;
  const semanas: DiaCalendario[][] = [];
  for (let s = 0; s < 6; s++) {
    const semana: DiaCalendario[] = [];
    for (let d = 0; d < 7; d++) {
      const fecha = new Date(anio, mes, 1 - desfase + s * 7 + d);
      semana.push({ fecha, fuera: fecha.getMonth() !== mes });
    }
    semanas.push(semana);
  }
  return semanas;
}
