import { DiaCalendario, MesCalendario } from '../interfaces/composicion';
import { TEXTOS_FICHA } from '../constants/textos';

const MESES = TEXTOS_FICHA.calendario.meses;
const MS_DIA = 864e5;

const dosDigitos = (n: number): string => String(n).padStart(2, '0');

/** "12/11/2026" */
export function formatoFechaCorta(d: Date): string {
  return dosDigitos(d.getDate()) + '/' + dosDigitos(d.getMonth() + 1) + '/' + d.getFullYear();
}

/** "12 de noviembre de 2026" */
export function formatoFechaLarga(d: Date): string {
  return d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
}

export function mismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Días calendario entre `desde` y `hasta` (redondeado, positivo si `desde` es anterior). */
export function diasEntre(desde: Date, hasta: Date): number {
  return Math.round((hasta.getTime() - desde.getTime()) / MS_DIA);
}

export function primerDiaDelMes(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function sumarMeses(mes: Date, n: number): Date {
  return new Date(mes.getFullYear(), mes.getMonth() + n, 1);
}

/**
 * Mes del calendario de "Fecha de corte": semanas de lunes a domingo, días fuera de [minima, hoy]
 * deshabilitados y navegación limitada a ese rango.
 */
export function construirMes(vista: Date, seleccion: Date, hoy: Date, minima: Date): MesCalendario {
  const y = vista.getFullYear();
  const m = vista.getMonth();
  const total = new Date(y, m + 1, 0).getDate();
  const dias: DiaCalendario[] = [];
  for (let dia = 1; dia <= total; dia++) {
    const fecha = new Date(y, m, dia);
    dias.push({
      dia,
      fecha,
      deshabilitado: fecha > hoy || fecha < minima,
      hoy: mismoDia(fecha, hoy),
      seleccionado: mismoDia(fecha, seleccion),
      etiqueta: formatoFechaLarga(fecha),
    });
  }
  return {
    titulo: MESES[m].charAt(0).toUpperCase() + MESES[m].slice(1) + ' ' + y,
    vacios: (new Date(y, m, 1).getDay() + 6) % 7,
    dias,
    puedeAnterior: !(y < minima.getFullYear() || (y === minima.getFullYear() && m <= minima.getMonth())),
    puedeSiguiente: !(y > hoy.getFullYear() || (y === hoy.getFullYear() && m >= hoy.getMonth())),
  };
}
