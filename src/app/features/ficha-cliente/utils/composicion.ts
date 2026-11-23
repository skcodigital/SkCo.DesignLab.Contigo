import { FilaComposicion, Fondo } from '../interfaces/composicion';
import { TEXTOS_FICHA } from '../constants/textos';
import { diasEntre, formatoFechaLarga } from './fechas';

/**
 * Recalcula los portafolios a una fecha de corte (datos de ejemplo del prototipo): descuenta el
 * rendimiento E.A. por los días transcurridos, ajusta rendimientos y hace oscilar la E.A. histórica.
 * Los porcentajes se redondean y el último absorbe la diferencia para sumar 100.
 */
export function calcularComposicion(fondos: readonly Fondo[], hoy: Date, fecha: Date): FilaComposicion[] {
  const dias = diasEntre(fecha, hoy);
  const recalculados = fondos.map((f, i) => {
    const factor = Math.pow(1 + f.ea / 100, -dias / 365);
    const saldo = f.saldo * factor;
    return {
      ...f,
      saldo,
      valorUnidad: f.valorUnidad * factor,
      rendimientos: Math.max(0, f.rendimientos - (f.saldo - saldo)),
      ea: dias === 0 ? f.ea : f.ea + 0.55 * Math.sin(dias / 37 + i * 1.7),
    };
  });
  const total = recalculados.reduce((acc, f) => acc + f.saldo, 0);
  const pcts = recalculados.map((f) => Math.round((f.saldo / total) * 100));
  if (pcts.length) pcts[pcts.length - 1] = 100 - pcts.slice(0, -1).reduce((a, b) => a + b, 0);
  return recalculados.map((f, i) => ({ ...f, porcentaje: pcts[i] }));
}

/** Fondo de la dona: un tramo por portafolio, acumulando los porcentajes. */
export function gradienteDona(filas: readonly FilaComposicion[]): string {
  let desde = 0;
  const tramos = filas.map((f, i) => {
    const hasta = i === filas.length - 1 ? 100 : desde + f.porcentaje;
    const tramo = `${f.color} ${desde}% ${hasta}%`;
    desde = hasta;
    return tramo;
  });
  return `conic-gradient(${tramos.join(',')})`;
}

/** "Composición al 12 de noviembre de 2026: 65 % Skandia Renta Fija Pesos, 35 % …" */
export function etiquetaDona(filas: readonly FilaComposicion[], fecha: Date): string {
  return (
    TEXTOS_FICHA.composicion.donaPrefijo +
    formatoFechaLarga(fecha) +
    ': ' +
    filas.map((f) => `${f.porcentaje} % ${f.nombre}`).join(', ')
  );
}
