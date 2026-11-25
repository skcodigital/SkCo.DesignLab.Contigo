import { TEXTOS_EXTERIOR } from '@features/monitor/constants/textos-exterior';
import { OpcionSeleccion } from '@features/monitor/interfaces/comunes';
import { DefinicionActivo } from '@features/monitor/interfaces/detalle';
import {
  FiltrosPortafolios,
  IndicadorSeleccionado,
  PortafolioLista,
  TipoIndicador,
} from '@features/monitor/interfaces/exterior';
import { desdeIso } from '@features/monitor/utils/fechas';
import { nombreIndicador } from '@features/monitor/utils/graficas';

/**
 * Listas propias del Monitor exterior: filtros de «Portafolios SK» (`portfolio-list`) y las divisas e indicadores
 * (`divisa-indicador`).
 */

const P = TEXTOS_EXTERIOR.portafolios;

function unicos(valores: readonly string[]): string[] {
  return Array.from(new Set(valores.map((v) => v?.trim()).filter((v): v is string => !!v)));
}

/** «Clasificación» (todas) y cada clasificación en el orden del catálogo. */
export function opcionesClasificacion(lista: readonly PortafolioLista[]): OpcionSeleccion[] {
  return [
    { nombre: P.clasificacion, valor: P.clasificacion },
    ...unicos(lista.map((p) => p.clasificacion)).map((c) => ({ nombre: c, valor: c })),
  ];
}

/** «Perfil de riesgo» (todos) y cada perfil; `NA` se muestra como «Otros». */
export function opcionesPerfil(lista: readonly PortafolioLista[]): OpcionSeleccion[] {
  return [
    { nombre: P.perfilRiesgo, valor: P.perfilRiesgo },
    ...unicos(lista.map((p) => p.perfil))
      .map((p) => (p === 'NA' ? P.otros : p))
      .map((p) => ({ nombre: p, valor: p })),
  ];
}

/** Más de 30 días calendario sin valor de unidad. Sin fecha no está desactualizado. */
export function portafolioDesactualizado(fecha: string, hoy: Date): boolean {
  const d = fecha ? desdeIso(fecha) : null;
  if (!d) {
    return false;
  }
  return d < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 30);
}

/** Tooltip del ícono de desactualizado (`dd/mm/aaaa`). */
export function tooltipPortafolioDesactualizado(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return P.desactualizado(`${dia}/${mes}/${anio}`);
}

/** Portafolios que cumplen los filtros; los desactualizados solo con el interruptor encendido. */
export function filtrarPortafolios(
  lista: readonly PortafolioLista[],
  f: FiltrosPortafolios,
  hoy: Date,
): PortafolioLista[] {
  const termino = f.termino.toLowerCase();
  return lista.filter((p) => {
    if (!f.mostrarInactivos && portafolioDesactualizado(p.ultimaFecha, hoy)) {
      return false;
    }
    const clasificacion = !f.clasificacion || f.clasificacion === P.clasificacion || p.clasificacion === f.clasificacion;
    const perfil =
      !f.perfil ||
      f.perfil === P.perfilRiesgo ||
      p.perfil === f.perfil ||
      (f.perfil === P.otros && p.perfil === 'NA');
    const busqueda = !termino || p.nombre.toLowerCase().includes(termino);
    return clasificacion && perfil && busqueda;
  });
}

/** Elemento de las listas de divisas e indicadores, con el nombre que muestra producción (la UVR: «Inflación»). */
export interface ItemIndicador {
  clave: string;
  tipo: TipoIndicador;
  nombre: string;
}

/** Divisas o indicadores del catálogo, en su orden. */
export function itemsIndicador(defs: readonly DefinicionActivo[], tipo: TipoIndicador): ItemIndicador[] {
  return defs
    .filter((d) => d.tipo === tipo)
    .map((d) => ({ clave: d.clave, tipo, nombre: tipo === 'indicador' ? nombreIndicador(d.clave, d.nombre) : d.nombre }));
}

/** Marca o desmarca una divisa o un indicador (los nuevos van al final). */
export function alternarIndicador(
  seleccion: readonly IndicadorSeleccionado[],
  tipo: TipoIndicador,
  clave: string,
): IndicadorSeleccionado[] {
  const esta = seleccion.some((i) => i.tipo === tipo && i.clave === clave);
  return esta ? seleccion.filter((i) => !(i.tipo === tipo && i.clave === clave)) : [...seleccion, { tipo, clave }];
}
