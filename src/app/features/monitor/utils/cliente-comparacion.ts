import { TEXTOS } from '@features/monitor/constants/textos';
import {
  CDT_COMPARABLES,
  INDICADORES,
  MEZCLAS,
  MEZCLAS_COMPARABLES,
  PLAZOS_CDT,
  PORTAFOLIOS_SKANDIA,
  REFERENCIAS_COMPARABLES,
} from '@features/monitor/data/detalle-catalogos.mock';
import { SeleccionComparar } from '@features/monitor/interfaces/cliente';
import { RangoFechas } from '@features/monitor/interfaces/comunes';
import { ActivoComparado, DefinicionActivo, PlazoCdt, ReferenciaSeleccionada } from '@features/monitor/interfaces/detalle';
import { activoComparado } from '@features/monitor/utils/detalle-activos';

/**
 * Lo comparado en la página del Monitor del cliente (panel «Comparar»): la selección, las claves de cada activo
 * (con el sufijo del plazo cuando hay un CDT aplicado) y los activos en el rango con los colores que les daba
 * producción (`handleResults`, el registro de colores de indicadores y `getNextAvailableColor`).
 */

export const SELECCION_VACIA: SeleccionComparar = {
  portafolios: [],
  divisas: [],
  indicadores: [],
  mezclas: [],
  referencias: [],
  cdt: [],
};

/** Hay algo marcado (`hasActiveFilters`). */
export function haySeleccion(s: SeleccionComparar): boolean {
  return Object.values(s).some((lista: readonly unknown[]) => lista.length > 0);
}

/**
 * `isKeyCovered`: la clave es la misma o una de las dos es la otra con el sufijo del plazo de un CDT
 * («FPVLIQCOL» ↔ «FPVLIQCOL_30»).
 */
export function claveCubierta(candidata: string, claves: readonly string[]): boolean {
  return claves.some((k) => k === candidata || candidata.startsWith(`${k}_`) || k.startsWith(`${candidata}_`));
}

/** Clave de una mezcla: su nombre, como en producción. */
export function claveMezcla(id: number): string {
  return MEZCLAS.find((m) => m.id === id)?.nombre ?? String(id);
}

export function claveReferencia(r: ReferenciaSeleccionada): string {
  return `${r.idCompania}_${r.idPortafolio}`;
}

export function claveCdt(subcuenta: string): string {
  return `CDT-${subcuenta}`;
}

/**
 * Quita de la selección el activo de esa clave (retirado desde la leyenda o la tabla). El panel lo desmarca y,
 * si era un CDT, lo demás vuelve a pedirse sin él.
 */
export function quitarDeSeleccion(s: SeleccionComparar, clave: string): SeleccionComparar {
  const queda = (c: string): boolean => !claveCubierta(clave, [c]);
  return {
    portafolios: s.portafolios.filter(queda),
    divisas: s.divisas.filter(queda),
    indicadores: s.indicadores.filter(queda),
    mezclas: s.mezclas.filter((id) => queda(claveMezcla(id))),
    referencias: s.referencias.filter((r) => queda(claveReferencia(r))),
    cdt: s.cdt.filter((sub) => queda(claveCdt(sub))),
  };
}

/** Plazo con el que se compara: el del primer CDT aplicado. */
export function plazoAplicado(s: SeleccionComparar, plazos: readonly PlazoCdt[] = PLAZOS_CDT): PlazoCdt | undefined {
  return s.cdt.length ? plazos.find((p) => p.subcuenta === s.cdt[0]) : undefined;
}

/** Activos comparados de una selección, por grupo y en el orden en que los grafica producción. */
export interface ActivosCliente {
  fondos: ActivoComparado[];
  /** Indicadores y divisas, en el orden del catálogo. */
  indicadores: ActivoComparado[];
  mezclas: ActivoComparado[];
  referencias: ActivoComparado[];
  cdt: ActivoComparado[];
}

/** Lista de todos los activos: los agregados (fondos, indicadores, mezclas) y luego competencia y CDT. */
export function listaActivos(a: ActivosCliente): ActivoComparado[] {
  return [...a.fondos, ...a.indicadores, ...a.mezclas, ...a.referencias, ...a.cdt];
}

/** Mezcla con la primera mayúscula y el resto en minúscula («Paciente»). */
function nombreMezcla(nombre: string): string {
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1).toLowerCase()}`;
}

/** Nombre visible del activo: la UVR es «Inflación» y las mezclas solo con la primera mayúscula. */
function conNombreVisible(a: ActivoComparado, def: DefinicionActivo): ActivoComparado {
  const resto = a.nombre.slice(def.nombre.length);
  if (def.tipo === 'mezcla') {
    return { ...a, nombre: `${nombreMezcla(def.nombre)}${resto}` };
  }
  if (def.clave === 'UVR') {
    return { ...a, nombre: `${TEXTOS.inflacion.nombre}${resto}` };
  }
  return a;
}

const porClave = (catalogo: readonly DefinicionActivo[], clave: string): DefinicionActivo | undefined =>
  catalogo.find((d) => d.clave === clave);

/**
 * Activos de la selección en el rango, con sus colores:
 * - portafolios Skandia: la paleta después de los contratos propios (`base`);
 * - indicadores y divisas: la paleta desde la mitad (el registro de colores de producción);
 * - mezclas: después de los portafolios y los indicadores;
 * - competencia: el primer color de la paleta que no use otra referencia o un CDT (`getNextAvailableColor`);
 * - CDT: el color de su plazo.
 * Con un CDT aplicado, lo demás pasa a su rentabilidad móvil en ese plazo.
 */
export function activosCliente(
  s: SeleccionComparar,
  rango: RangoFechas,
  hoy: Date,
  paleta: readonly string[],
  base: number,
): ActivosCliente {
  const plazo = plazoAplicado(s);
  const color = (i: number): string => paleta[i % paleta.length];
  const armar = (def: DefinicionActivo, c: string): ActivoComparado =>
    conNombreVisible(activoComparado(def, rango, hoy, c, plazo), def);

  const fondos = s.portafolios
    .map((clave) => porClave(PORTAFOLIOS_SKANDIA, clave))
    .filter((d): d is DefinicionActivo => !!d)
    .map((d, i) => armar(d, color(base + i)));

  const marcados = new Set([...s.indicadores, ...s.divisas]);
  const mitad = Math.floor(paleta.length / 2);
  const indicadores = INDICADORES.filter((d) => marcados.has(d.clave)).map((d, i) => armar(d, color(mitad + i)));

  const inicioMezclas = base + fondos.length + indicadores.length;
  const mezclas = s.mezclas
    .map((id) => porClave(MEZCLAS_COMPARABLES, claveMezcla(id)))
    .filter((d): d is DefinicionActivo => !!d)
    .map((d, i) => armar(d, color(inicioMezclas + i)));

  const cdt = s.cdt
    .map((sub) => porClave(CDT_COMPARABLES, claveCdt(sub)))
    .filter((d): d is DefinicionActivo => !!d)
    .map((d) => armar(d, d.color ?? color(0)));

  const usados = new Set(cdt.map((a) => a.color));
  const referencias = s.referencias
    .map((r) => porClave(REFERENCIAS_COMPARABLES, claveReferencia(r)))
    .filter((d): d is DefinicionActivo => !!d)
    .map((d) => {
      const libre = paleta.find((c) => !usados.has(c)) ?? paleta[0];
      usados.add(libre);
      return armar(d, libre);
    });

  return { fondos, indicadores, mezclas, referencias, cdt };
}

/** Definición del catálogo de un activo comparado (para abrir su detalle), sin el sufijo del plazo. */
export function definicionComparada(clave: string): DefinicionActivo | undefined {
  const catalogo = [...PORTAFOLIOS_SKANDIA, ...MEZCLAS_COMPARABLES, ...REFERENCIAS_COMPARABLES];
  return catalogo.find((d) => d.clave === clave) ?? catalogo.find((d) => clave.startsWith(`${d.clave}_`));
}

/** Banderas del título de la tabla de lo comparado. */
export interface ContenidoMezclas {
  competencia: boolean;
  cdt: boolean;
  indicadores: boolean;
}

/** `mixesTableTitle`: «Mezcla Invest-ed» y lo demás que haya, con comas y «e» antes del último. */
export function tituloMezclas(
  c: ContenidoMezclas,
  t: { mezclas: string; competencia: string; cdt: string; indicadores: string; union: string },
): string {
  const partes = [t.mezclas];
  if (c.competencia) {
    partes.push(t.competencia);
  }
  if (c.cdt) {
    partes.push(t.cdt);
  }
  if (c.indicadores) {
    partes.push(t.indicadores);
  }
  if (partes.length === 1) {
    return partes[0];
  }
  return `${partes.slice(0, -1).join(', ')} ${t.union} ${partes[partes.length - 1]}`;
}
