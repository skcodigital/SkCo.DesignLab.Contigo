import {
  CDT_COMPARABLES,
  HOY_MONITOR,
  INDICADORES,
  MEZCLAS,
  MEZCLAS_COMPARABLES,
  PORTAFOLIOS_SKANDIA,
  REFERENCIAS_COMPARABLES,
} from '@features/monitor/data/detalle-catalogos.mock';
import { DefinicionActivo, DefinicionSerie, DocumentoActivo } from '@features/monitor/interfaces/detalle';
import { CatalogoExterior, PortafolioLista, SeleccionExterior } from '@features/monitor/interfaces/exterior';
import { periodosDesempeno } from '@features/monitor/utils/detalle-series';

/**
 * Catálogos ficticios de «Selecciona y compara» del Monitor exterior: los del detalle (portafolios Skandia,
 * divisas e indicadores, mezclas, competencia y CDT) más los portafolios, divisas e indicadores que completan las
 * listas, y los filtros de la lista de portafolios. Nombres públicos de Skandia o genéricos; cifras inventadas.
 */

const DOCUMENTOS: readonly DocumentoActivo[] = [
  { tipo: 'ficha-tecnica', fechaCorte: '2026-10-30' },
  { tipo: 'informe-mensual', fechaCorte: '2026-10-30' },
  { tipo: 'prospecto', fechaCorte: '2025-06-20' },
];

function portafolio(clave: string, nombre: string, serie: DefinicionSerie): DefinicionActivo {
  return {
    clave,
    nombre,
    tipo: 'portafolio',
    serie,
    detalle: { id: clave, tipo: 'portafolio', nombre, desempeno: periodosDesempeno(serie, HOY_MONITOR), documentos: DOCUMENTOS },
  };
}

/** Portafolios Skandia que completan la lista (además de los del detalle). */
const PORTAFOLIOS_ADICIONALES: readonly DefinicionActivo[] = [
  portafolio('FPVRFCOL', 'FPV Renta Fija Colombia', { semilla: 6.3, valorHoy: 11873.6, rentabilidadAnual: 9.2, volatilidad: 0.8 }),
  portafolio('FPVRVGLOB', 'FPV Renta Variable Global', { semilla: 7.7, valorHoy: 21430.18, rentabilidadAnual: 15.8, volatilidad: 4.9 }),
  portafolio('FPVALTERN', 'FPV Alternativos', { semilla: 8.2, valorHoy: 11264.05, rentabilidadAnual: 10.1, volatilidad: 1.7 }),
  portafolio('FICMULTIP', 'FIC Skandia Multiplazo', { semilla: 9.4, valorHoy: 14092.33, rentabilidadAnual: 9.6, volatilidad: 0.6 }),
  portafolio('FPVACCUSA', 'FPV Acciones Estados Unidos', { semilla: 10.6, valorHoy: 24318.9, rentabilidadAnual: 17.2, volatilidad: 5.8 }),
  portafolio('FPVDEUCORP', 'FPV Deuda Corporativa', { semilla: 11.3, valorHoy: 10215.47, rentabilidadAnual: 8.4, volatilidad: 1.3 }),
  portafolio('FVPRFMAR25', 'FVP Renta Fija Marzo 2025-I', { semilla: 12.1, valorHoy: 10402.88, rentabilidadAnual: 9.9, volatilidad: 0.7 }),
];

/** Divisas e indicadores que completan las listas (además de los del detalle). */
const INDICADORES_ADICIONALES: readonly DefinicionActivo[] = [
  { clave: 'GBP', nombre: 'Libra esterlina', tipo: 'divisa', serie: { semilla: 7.2, valorHoy: 5231.64, rentabilidadAnual: -0.8, volatilidad: 3.0, soloHabiles: true } },
  { clave: 'JPY', nombre: 'Yen', tipo: 'divisa', serie: { semilla: 8.5, valorHoy: 26.41, rentabilidadAnual: -4.4, volatilidad: 3.6, soloHabiles: true } },
  { clave: 'IBR', nombre: 'IBR Plazo 1 mes', tipo: 'indicador', serie: { semilla: 9.1, valorHoy: 8.92, rentabilidadAnual: -6.5, volatilidad: 1.2, soloHabiles: true, decimales: 3 } },
  { clave: 'DTF', nombre: 'DTF 90 días', tipo: 'indicador', serie: { semilla: 9.8, valorHoy: 9.31, rentabilidadAnual: -5.2, volatilidad: 1.0, soloHabiles: true } },
  { clave: 'SP500', nombre: 'S&P 500', tipo: 'indicador', serie: { semilla: 10.4, valorHoy: 6248.17, rentabilidadAnual: 13.9, volatilidad: 4.1, soloHabiles: true } },
  { clave: 'TES10', nombre: 'TES 10 años', tipo: 'indicador', serie: { semilla: 11.7, valorHoy: 11.08, rentabilidadAnual: -3.0, volatilidad: 1.5, soloHabiles: true } },
];

/** Todo lo que se puede comparar en el Monitor exterior. */
export const CATALOGO_EXTERIOR: CatalogoExterior = {
  portafolios: [...PORTAFOLIOS_SKANDIA, ...PORTAFOLIOS_ADICIONALES],
  indicadores: [...INDICADORES, ...INDICADORES_ADICIONALES],
  mezclas: MEZCLAS,
  mezclasComparables: MEZCLAS_COMPARABLES,
  referencias: REFERENCIAS_COMPARABLES,
  cdts: CDT_COMPARABLES,
};

/** Clasificación, perfil de riesgo y última fecha de valor de unidad de cada portafolio. */
const FILTROS: Readonly<Record<string, Omit<PortafolioLista, 'clave' | 'nombre'>>> = {
  FPVSTGCONS: { clasificacion: 'Balanceado', perfil: 'Conservador', ultimaFecha: '2026-11-11' },
  FPVSTGMOD: { clasificacion: 'Balanceado', perfil: 'Moderado', ultimaFecha: '2026-11-11' },
  FPVLIQCOL: { clasificacion: 'Liquidez', perfil: 'Conservador', ultimaFecha: '2026-11-11' },
  FICEFECTIVO: { clasificacion: 'Liquidez', perfil: 'Conservador', ultimaFecha: '2026-11-12' },
  FVPRFMAR29: { clasificacion: 'Renta fija', perfil: 'Conservador', ultimaFecha: '2026-11-11' },
  FPVACCCOL: { clasificacion: 'Renta variable', perfil: 'Mayor riesgo', ultimaFecha: '2026-11-11' },
  FPVRFCOL: { clasificacion: 'Renta fija', perfil: 'Moderado', ultimaFecha: '2026-11-11' },
  FPVRVGLOB: { clasificacion: 'Renta variable', perfil: 'Mayor riesgo', ultimaFecha: '2026-11-10' },
  FPVALTERN: { clasificacion: 'Alternativos', perfil: 'Moderado', ultimaFecha: '2026-10-31' },
  FICMULTIP: { clasificacion: 'Liquidez', perfil: 'Conservador', ultimaFecha: '2026-11-12' },
  FPVACCUSA: { clasificacion: 'Renta variable', perfil: 'Mayor riesgo', ultimaFecha: '2026-11-10' },
  FPVDEUCORP: { clasificacion: 'Renta fija', perfil: 'NA', ultimaFecha: '2026-09-30' },
  FVPRFMAR25: { clasificacion: 'Renta fija', perfil: 'NA', ultimaFecha: '2025-03-14' },
};

/** Lista «Portafolios SK»: los dos últimos están desactualizados (más de 30 días sin valor de unidad). */
export const PORTAFOLIOS_LISTA: readonly PortafolioLista[] = CATALOGO_EXTERIOR.portafolios.map((d) => ({
  clave: d.clave,
  nombre: d.nombre,
  ...(FILTROS[d.clave] ?? { clasificacion: '', perfil: 'NA', ultimaFecha: '' }),
}));

/** Nada elegido: así arranca el Monitor exterior. */
export const SELECCION_VACIA: SeleccionExterior = { portafolios: [], indicadores: [], mezclas: [], referencias: [], cdts: [] };

/** `?estado=ejemplo`: la selección de ejemplo del detalle (dos portafolios, dólar, inflación, una mezcla y una referencia). */
export const SELECCION_EJEMPLO: SeleccionExterior = {
  portafolios: ['FPVSTGCONS', 'FICEFECTIVO'],
  indicadores: [
    { tipo: 'divisa', clave: 'US$' },
    { tipo: 'indicador', clave: 'UVR' },
  ],
  mezclas: [3],
  referencias: [{ idCompania: '1', idPortafolio: 'AA02', tipo: 'VOLUNTARIO' }],
  cdts: [],
};

/** `?estado=ejemplo-cdt`: la misma selección sin divisas ni indicadores y con un CDT a 90 días. */
export const SELECCION_EJEMPLO_CDT: SeleccionExterior = { ...SELECCION_EJEMPLO, indicadores: [], cdts: ['90'] };
