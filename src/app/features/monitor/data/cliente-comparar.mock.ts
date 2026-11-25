import { PORTAFOLIOS_SKANDIA } from '@features/monitor/data/detalle-catalogos.mock';
import { FondoComparable } from '@features/monitor/interfaces/cliente';

/**
 * Datos del panel «Comparar» del Monitor del cliente que no están en los catálogos del detalle: la clasificación,
 * el perfil y la última fecha de valor de unidad de cada portafolio Skandia (los filtros de «Portafolios SK»).
 * Ficticios; «NA» y «Sin perfil» se agrupan en «Otros», como en producción.
 */
const FILTROS: Readonly<Record<string, Omit<FondoComparable, 'clave' | 'nombre'>>> = {
  FPVSTGCONS: { clasificacion: 'Estrategias', perfil: 'Conservador', ultimaFechaValorUnidad: '2026-11-11' },
  FPVSTGMOD: { clasificacion: 'Estrategias', perfil: 'Moderado', ultimaFechaValorUnidad: '2026-11-11' },
  FPVLIQCOL: { clasificacion: 'Liquidez', perfil: 'Conservador', ultimaFechaValorUnidad: '2026-11-11' },
  FICEFECTIVO: { clasificacion: 'Liquidez', perfil: 'Conservador', ultimaFechaValorUnidad: '2026-11-11' },
  FVPRFMAR29: { clasificacion: 'NA', perfil: 'Sin perfil', ultimaFechaValorUnidad: '2026-11-10' },
  FPVACCCOL: { clasificacion: 'Renta variable', perfil: 'Mayor riesgo', ultimaFechaValorUnidad: '2026-09-30' },
};

/** Portafolios Skandia del panel «Comparar» (`fundsListData`). */
export const FONDOS_COMPARABLES: readonly FondoComparable[] = PORTAFOLIOS_SKANDIA.map((p) => ({
  clave: p.clave,
  nombre: p.nombre,
  ...(FILTROS[p.clave] ?? { clasificacion: 'NA', perfil: 'Sin perfil', ultimaFechaValorUnidad: '2026-11-11' }),
}));
