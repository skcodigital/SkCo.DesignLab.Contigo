import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { FondoComparable } from '@features/monitor/interfaces/cliente';
import { GrupoCasillas, OpcionSeleccion, ValoresCasillas } from '@features/monitor/interfaces/comunes';
import { desdeIso } from '@features/monitor/utils/fechas';

/**
 * «Portafolios SK» del panel «Comparar» (`btn-comparar`): filtros de clasificación y perfil («Otros» agrupa los
 * que no tienen), portafolios desactualizados (más de 30 días sin valor de unidad) y lo marcado.
 */

const SIN_CLASIFICACION = ['NA', 'Sin clasificación'];
const SIN_PERFIL = ['NA', 'Sin perfil', ''];

/**
 * `buildSelectOptions`: la primera opción es el título (valor vacío) y luego los valores sin repetir, con los
 * vacíos como «Otros».
 */
export function opcionesFiltroFondos(
  fondos: readonly FondoComparable[],
  campo: 'clasificacion' | 'perfil',
  titulo: string,
): OpcionSeleccion[] {
  const otros = TEXTOS_CLIENTE.comparar.otros;
  const valores = [...new Set(fondos.map((f) => f[campo]))].map((v) =>
    v === 'NA' || v === 'Sin clasificación' ? otros : v,
  );
  return [{ nombre: titulo, valor: '' }, ...valores.map((v) => ({ nombre: v, valor: v }))];
}

/** Sin valor de unidad en los últimos 30 días. */
export function fondoDesactualizado(ultimaFecha: string, hoy: Date): boolean {
  const fecha = desdeIso(ultimaFecha);
  if (!fecha) {
    return false;
  }
  const limite = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 30);
  return fecha < limite;
}

/** «Datos desactualizados. Última fecha de valor unitario: dd/mm/yyyy». */
export function tooltipFondoDesactualizado(ultimaFecha: string): string {
  const [anio, mes, dia] = ultimaFecha.split('-');
  return TEXTOS_CLIENTE.comparar.desactualizado(`${dia}/${mes}/${anio}`);
}

export interface FiltrosFondos {
  clasificacion: string;
  perfil: string;
  mostrarInactivos: boolean;
}

function coincide(valor: string, filtro: string, vacios: readonly string[]): boolean {
  if (!filtro) {
    return true;
  }
  return filtro === TEXTOS_CLIENTE.comparar.otros ? vacios.includes(valor) : valor === filtro;
}

/** `filteredFunds`: sin los desactualizados (salvo que se pidan) y con la clasificación y el perfil elegidos. */
export function fondosVisibles(fondos: readonly FondoComparable[], f: FiltrosFondos, hoy: Date): FondoComparable[] {
  return fondos.filter(
    (x) =>
      (f.mostrarInactivos || !fondoDesactualizado(x.ultimaFechaValorUnidad, hoy)) &&
      coincide(x.clasificacion, f.clasificacion, SIN_CLASIFICACION) &&
      coincide(x.perfil, f.perfil, SIN_PERFIL),
  );
}

/** Tarjetas de los portafolios (con el aviso de desactualizado). */
export function grupoFondos(fondos: readonly FondoComparable[], hoy: Date): GrupoCasillas {
  return {
    opciones: fondos.map((x) => ({
      nombre: x.nombre,
      valor: x.clave,
      ...(fondoDesactualizado(x.ultimaFechaValorUnidad, hoy)
        ? { avisoDesactualizado: tooltipFondoDesactualizado(x.ultimaFechaValorUnidad) }
        : {}),
    })),
  };
}

/** Lo marcado como valores de las casillas. */
export function valoresFondos(seleccionados: readonly string[]): ValoresCasillas {
  return Object.fromEntries(seleccionados.map((c) => [c, true]));
}

/** De las casillas a la lista marcada, conservando el orden en que se marcaron. */
export function seleccionFondos(previos: readonly string[], valores: ValoresCasillas): string[] {
  const quedan = previos.filter((c) => valores[c]);
  const nuevos = Object.keys(valores).filter((c) => valores[c] && !previos.includes(c));
  return [...quedan, ...nuevos];
}
