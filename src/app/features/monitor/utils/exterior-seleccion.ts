import { RangoFechas } from '@features/monitor/interfaces/comunes';
import { DefinicionActivo, ReferenciaSeleccionada } from '@features/monitor/interfaces/detalle';
import {
  CatalogoExterior,
  EstadoExterior,
  SeleccionExterior,
  TipoIndicador,
} from '@features/monitor/interfaces/exterior';
import { PERIODO, rangoPorPeriodo } from '@features/monitor/utils/periodos';

/**
 * Selección de «Selecciona y compara» del Monitor exterior: de las claves elegidas a las recetas de la comparación,
 * retirar un activo desde la gráfica o la tabla, el rango que se consulta y cuándo se aplica un cambio.
 */

/** Hay algo elegido en alguna lista (habilita «Restablece» y «Graficar selección»). */
export function haySeleccion(s: SeleccionExterior): boolean {
  return !!(s.portafolios.length || s.indicadores.length || s.mezclas.length || s.referencias.length || s.cdts.length);
}

/** Clave del activo de un portafolio de la competencia (`<compañía>_<portafolio>`). */
export function claveReferencia(r: ReferenciaSeleccionada): string {
  return `${r.idCompania}_${r.idPortafolio}`;
}

const buscar = (lista: readonly DefinicionActivo[], clave: string | undefined): DefinicionActivo | undefined =>
  clave === undefined ? undefined : lista.find((d) => d.clave === clave);

/**
 * Recetas de lo elegido, por grupos como los armaba producción (portafolios, divisas, indicadores, mezclas,
 * competencia y CDT) y en el orden en que se eligió dentro de cada grupo. Lo que no está en el catálogo se ignora.
 */
export function definicionesSeleccion(s: SeleccionExterior, c: CatalogoExterior): DefinicionActivo[] {
  const indicadores = (tipo: TipoIndicador) =>
    s.indicadores.filter((i) => i.tipo === tipo).map((i) => buscar(c.indicadores, i.clave));
  return [
    ...s.portafolios.map((clave) => buscar(c.portafolios, clave)),
    ...indicadores('divisa'),
    ...indicadores('indicador'),
    ...s.mezclas.map((id) => buscar(c.mezclasComparables, c.mezclas.find((m) => m.id === id)?.nombre)),
    ...s.referencias.map((r) => buscar(c.referencias, claveReferencia(r))),
    ...s.cdts.map((subcuenta) => buscar(c.cdts, `CDT-${subcuenta}`)),
  ].filter((d): d is DefinicionActivo => !!d);
}

/**
 * Receta de la serie `clave` de la comparación. Con un CDT elegido la clave trae el plazo (`<clave>_<días>`):
 * gana la receta de clave más larga que coincide.
 */
export function definicionDeClave(defs: readonly DefinicionActivo[], clave: string): DefinicionActivo | undefined {
  return defs
    .filter((d) => clave === d.clave || clave.startsWith(`${d.clave}_`))
    .sort((a, b) => b.clave.length - a.clave.length)[0];
}

/** La selección sin el activo de una receta. */
export function quitarDefinicion(s: SeleccionExterior, def: DefinicionActivo, c: CatalogoExterior): SeleccionExterior {
  switch (def.tipo) {
    case 'portafolio':
      return { ...s, portafolios: s.portafolios.filter((p) => p !== def.clave) };
    case 'divisa':
    case 'indicador':
      return { ...s, indicadores: s.indicadores.filter((i) => !(i.tipo === def.tipo && i.clave === def.clave)) };
    case 'mezcla': {
      const id = c.mezclas.find((m) => m.nombre === def.clave)?.id;
      return { ...s, mezclas: s.mezclas.filter((m) => m !== id) };
    }
    case 'referencia':
      return { ...s, referencias: s.referencias.filter((r) => claveReferencia(r) !== def.clave) };
    case 'cdt':
      return { ...s, cdts: s.cdts.filter((sc) => `CDT-${sc}` !== def.clave) };
    default:
      return s;
  }
}

/** Retira de la selección el activo de la serie `clave` (leyenda o tabla de la comparación). */
export function quitarActivo(s: SeleccionExterior, clave: string, c: CatalogoExterior): SeleccionExterior {
  const def = definicionDeClave(definicionesSeleccion(s, c), clave);
  return def ? quitarDefinicion(s, def, c) : s;
}

/**
 * Rango que se consulta para el periodo. Con «Personalizado» sin las dos fechas no hay rango (`null`): la página
 * conserva el anterior, como producción, que no volvía a consultar hasta tener el rango completo.
 */
export function rangoDeConsulta(periodo: number, rango: RangoFechas, hoy: Date): RangoFechas | null {
  if (Number(periodo) !== PERIODO.personalizado) {
    return rangoPorPeriodo(periodo, hoy);
  }
  return rango.inicio && rango.fin ? rango : null;
}

/**
 * En escritorio cada clic grafica al momento. En la modal de móvil, portafolios, divisas, indicadores y mezclas
 * esperan a «Graficar selección»; la competencia y los CDT se grafican al momento (así se suscribía producción).
 */
export function aplicaAlMomento(cambio: Partial<SeleccionExterior>, enModal: boolean): boolean {
  return !enModal || cambio.referencias !== undefined || cambio.cdts !== undefined;
}

const ESTADOS: readonly EstadoExterior[] = ['error', 'ejemplo', 'ejemplo-cdt'];

/** Estado de ejemplo pedido en la URL (`?estado=…`), o `null` si no es uno conocido. */
export function estadoExterior(valor: string | null | undefined): EstadoExterior | null {
  const v = (valor ?? '').trim().toLowerCase();
  return ESTADOS.find((e) => e === v) ?? null;
}
