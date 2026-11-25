import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { OpcionSeleccion } from '@features/monitor/interfaces/comunes';
import {
  CompaniaReferencia,
  ItemReferencia,
  MezclaInversion,
  ReferenciaSeleccionada,
} from '@features/monitor/interfaces/detalle';

/**
 * Lógica de las listas de comparación: portafolios de la competencia (`benchmark-list`), mezclas Invest-ed
 * (`mezcla-invest-list`) y CDT (`cdt-list`).
 */

const L = TEXTOS_DETALLE.listas;

// ───────────────────────────── Referencias de la competencia ─────────────────────────────

const primeraMayuscula = (t: string): string => (t ? `${t.charAt(0).toUpperCase()}${t.slice(1)}` : '');

/** Compañías para el filtro de entidad: «Todos» y cada compañía sin repetir. */
export function opcionesEntidad(companias: readonly CompaniaReferencia[]): OpcionSeleccion[] {
  const nombres = [...new Set(companias.map((c) => c.nombre).filter(Boolean))];
  return [{ nombre: L.todos, valor: L.todos }, ...nombres.map((n) => ({ nombre: n, valor: n }))];
}

/** Tipos de ahorro para el filtro: «Tipo ahorro» y cada tipo con la primera letra en mayúscula. */
export function opcionesTipoAhorro(companias: readonly CompaniaReferencia[]): OpcionSeleccion[] {
  const tipos = [
    ...new Set(companias.flatMap((c) => c.portafolios).map((p) => p.tipo?.toLowerCase()).filter(Boolean)),
  ].map(primeraMayuscula);
  return [{ nombre: L.tipoAhorro, valor: L.tipoAhorro }, ...tipos.map((t) => ({ nombre: t, valor: t }))];
}

/** Portafolios de todas las compañías en una sola lista, sin repetir compañía + portafolio. */
export function aplanarReferencias(companias: readonly CompaniaReferencia[]): ItemReferencia[] {
  const vistos = new Set<string>();
  return companias
    .flatMap((c) =>
      c.portafolios.map((p) => ({
        id: p.id,
        idCompania: c.id,
        nombrePortafolio: p.nombre,
        tipo: p.tipo,
        tipoVisible: p.tipo ? `${p.tipo.charAt(0).toUpperCase()}${p.tipo.slice(1).toLowerCase()}` : '',
        nombreCompania: c.nombre,
        imagenCompania: c.imagen ?? '',
        fechaMaxima: p.fechaMaxima,
      })),
    )
    .filter((item) => {
      const clave = `${item.idCompania}_${item.id}`;
      if (vistos.has(clave)) {
        return false;
      }
      vistos.add(clave);
      return true;
    });
}

/** Último dato de antes del 1 de enero del año de `hoy`: portafolio desactualizado o inactivo. */
export function desactualizado(fechaMaxima: string, hoy: Date): boolean {
  if (!fechaMaxima) {
    return false;
  }
  return new Date(fechaMaxima) < new Date(hoy.getFullYear(), 0, 1);
}

/** Filtros de la lista de referencias. */
export interface FiltrosReferencias {
  entidad: string | number;
  tipo: string | number;
  termino: string;
  mostrarInactivos: boolean;
}

/** Portafolios que pasan los filtros de entidad, tipo, búsqueda por nombre y desactualizados. */
export function filtrarReferencias(items: readonly ItemReferencia[], f: FiltrosReferencias, hoy: Date): ItemReferencia[] {
  const termino = f.termino.toLowerCase();
  return items.filter((item) => {
    if (!f.mostrarInactivos && desactualizado(item.fechaMaxima, hoy)) {
      return false;
    }
    const entidad = !f.entidad || f.entidad === L.todos || item.nombreCompania === f.entidad;
    const tipo = !f.tipo || f.tipo === L.tipoAhorro || item.tipoVisible.toLowerCase() === String(f.tipo).toLowerCase();
    const busqueda = !termino || item.nombrePortafolio.toLowerCase().includes(termino);
    return entidad && tipo && busqueda;
  });
}

/** Tooltip de un portafolio: compañía y tipo, salvo los que ya están filtrados. `null` si no queda nada. */
export function tooltipReferencia(item: ItemReferencia, f: Pick<FiltrosReferencias, 'entidad' | 'tipo'>): string | null {
  const partes: string[] = [];
  if (!f.entidad || f.entidad === L.todos) {
    partes.push(item.nombreCompania);
  }
  if (!f.tipo || f.tipo === L.tipoAhorro) {
    partes.push(item.tipoVisible);
  }
  return partes.length ? partes.join(' · ') : null;
}

/** Tooltip del ícono de desactualizado: «… Último reporte a la Superfinanciera: dd/mm/aaaa». */
export function tooltipDesactualizado(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return L.desactualizado(`${dia}/${mes}/${anio}`);
}

/** Marca o desmarca un portafolio de la competencia. */
export function alternarReferencia(
  seleccion: readonly ReferenciaSeleccionada[],
  item: ItemReferencia,
): ReferenciaSeleccionada[] {
  const esta = seleccion.some((s) => s.idCompania === item.idCompania && s.idPortafolio === item.id);
  return esta
    ? seleccion.filter((s) => !(s.idCompania === item.idCompania && s.idPortafolio === item.id))
    : [...seleccion, { idCompania: item.idCompania, idPortafolio: item.id, tipo: item.tipo }];
}

// ───────────────────────────── Mezclas Invest-ed ─────────────────────────────

/** Perfil de riesgo de cada mezcla (`perfilMap`) y su orden. */
const PERFILES: Readonly<Record<string, { tipo: string; tooltip: string }>> = {
  CAUTA: { tipo: 'Conservador', tooltip: 'Perfil conservador' },
  DISCRETA: { tipo: 'Conservador', tooltip: 'Perfil conservador' },
  PACIENTE: { tipo: 'Moderado', tooltip: 'Perfil moderado' },
  DINÁMICA: { tipo: 'Moderado', tooltip: 'Perfil moderado' },
  DECIDIDA: { tipo: 'Agresivo', tooltip: 'Perfil arriesgado' },
  AUDAZ: { tipo: 'Agresivo', tooltip: 'Perfil arriesgado' },
};
const ORDEN_PERFIL: Readonly<Record<string, number>> = { Conservador: 1, Moderado: 2, Agresivo: 3 };

export interface MezclaConPerfil extends MezclaInversion {
  perfil: string;
  tooltip: string;
}

/** Mezclas con su perfil, de la más conservadora a la más arriesgada. */
export function mezclasPorPerfil(mezclas: readonly MezclaInversion[]): MezclaConPerfil[] {
  return mezclas
    .map((m) => ({
      ...m,
      perfil: PERFILES[m.nombre]?.tipo ?? L.sinClasificar,
      tooltip: PERFILES[m.nombre]?.tooltip ?? L.sinInformacion,
    }))
    .sort((a, b) => (ORDEN_PERFIL[a.perfil] ?? 99) - (ORDEN_PERFIL[b.perfil] ?? 99));
}

/** `titlecase` de Angular: primera letra de cada palabra en mayúscula y el resto en minúscula. */
export function tituloPalabras(texto: string): string {
  return texto
    .split(/(\s+)/)
    .map((p) => (p.trim() ? `${p.charAt(0).toUpperCase()}${p.slice(1).toLowerCase()}` : p))
    .join('');
}

/** Agrega o quita un id de una selección. */
export function alternarId<T>(seleccion: readonly T[], id: T): T[] {
  return seleccion.includes(id) ? seleccion.filter((x) => x !== id) : [...seleccion, id];
}
