import { FECHA_HOY } from '@features/ficha-cliente/data/composicion.mock';
import {
  ActivoDetalle,
  ClaseActivo,
  CompaniaReferencia,
  DefinicionActivo,
  DefinicionSerie,
  DocumentoActivo,
  MezclaInversion,
  PlazoCdt,
  Rebalanceo,
  TendenciaActivo,
  TendenciaMezcla,
} from '@features/monitor/interfaces/detalle';
import { periodosDesempeno } from '@features/monitor/utils/detalle-series';

/**
 * Catálogos ficticios que comparten las dos vistas del Monitor: lo que se puede comparar (portafolios Skandia,
 * divisas e indicadores, mezclas Invest-ed, portafolios de la competencia y CDT) con su detalle. Los nombres de
 * portafolios y mezclas son los públicos de Skandia; compañías de la competencia, cifras y series son inventadas.
 */

/** «Hoy» del Monitor en el laboratorio: el mismo de la ficha de Óscar (12 de noviembre de 2026). */
export const HOY_MONITOR = FECHA_HOY;

/** Logo ficticio (círculo de color con la inicial) en SVG embebido: no hay imágenes externas. */
function logo(inicial: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="${color}"/>` +
    `<text x="16" y="21" font-family="Arial" font-size="15" font-weight="700" text-anchor="middle" fill="#fff">${inicial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const documentos = (mes: number): DocumentoActivo[] => [
  { tipo: 'ficha-tecnica', fechaCorte: `2026-${String(mes).padStart(2, '0')}-30` },
  { tipo: 'informe-mensual', fechaCorte: `2026-${String(mes).padStart(2, '0')}-30` },
  { tipo: 'prospecto', fechaCorte: '2025-02-14' },
];

/** Tendencia de ejemplo de un portafolio que no es mezcla (la pestaña está deshabilitada en producción). */
const TENDENCIA_ACTIVO: TendenciaActivo = {
  categorias: [
    { nombre: 'Deuda privada', porcentaje: 46.2 },
    { nombre: 'Deuda pública', porcentaje: 22.8 },
    { nombre: 'Liquidez', porcentaje: 12.5 },
    { nombre: 'Alternativos', porcentaje: 9.1 },
    { nombre: 'Rf. internacional', porcentaje: 4.6 },
    { nombre: 'Rv. internacional', porcentaje: 2.9 },
    { nombre: 'Acciones Colombia', porcentaje: 1.9 },
  ],
  etiquetas: ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
  series: [
    { nombre: 'Portafolio', datos: [1000, 1006, 1013, 1009, 1018, 1026, 1031, 1040] },
    { nombre: 'Deuda privada', datos: [1000, 1004, 1010, 1012, 1017, 1021, 1027, 1032] },
    { nombre: 'Liquidez', datos: [1000, 1003, 1006, 1009, 1012, 1015, 1018, 1021] },
    { nombre: 'Acciones Colombia', datos: [1000, 992, 1011, 1024, 1002, 1019, 1036, 1029] },
  ],
};

// ───────────────────────────── Portafolios Skandia ─────────────────────────────

function portafolio(clave: string, nombre: string, serie: DefinicionSerie, mesDocumentos: number): DefinicionActivo {
  const detalle: ActivoDetalle = {
    id: clave,
    tipo: 'portafolio',
    nombre,
    desempeno: periodosDesempeno(serie, HOY_MONITOR),
    tendenciaActivo: TENDENCIA_ACTIVO,
    documentos: documentos(mesDocumentos),
  };
  return { clave, nombre, tipo: 'portafolio', serie, detalle };
}

export const PORTAFOLIOS_SKANDIA: readonly DefinicionActivo[] = [
  portafolio('FPVSTGCONS', 'FPV Strategist Conservador', { semilla: 1.1, valorHoy: 13542.18, rentabilidadAnual: 9.4, volatilidad: 1.1 }, 10),
  portafolio('FPVSTGMOD', 'FPV Strategist Moderado', { semilla: 2.4, valorHoy: 15873.42, rentabilidadAnual: 11.6, volatilidad: 2.4 }, 10),
  portafolio('FPVLIQCOL', 'FPV Strategist Liquidez Col', { semilla: 0.7, valorHoy: 2847.55, rentabilidadAnual: 7.49, volatilidad: 0.25 }, 9),
  portafolio('FICEFECTIVO', 'FIC Skandia Efectivo', { semilla: 3.9, valorHoy: 13287.45, rentabilidadAnual: 9.12, volatilidad: 0.3 }, 10),
  portafolio('FVPRFMAR29', 'FVP Renta Fija Marzo 2029-I', { semilla: 5.2, valorHoy: 10886.64, rentabilidadAnual: 9.76, volatilidad: 0.9 }, 9),
  portafolio('FPVACCCOL', 'FPV Acciones Colombia', { semilla: 4.4, valorHoy: 9412.77, rentabilidadAnual: 14.2, volatilidad: 5.5, inicio: '2026-03-02' }, 10),
];

// ───────────────────────────── Divisas e indicadores ─────────────────────────────

export const INDICADORES: readonly DefinicionActivo[] = [
  { clave: 'US$', nombre: 'Dólar', tipo: 'divisa', serie: { semilla: 3.3, valorHoy: 4012.35, rentabilidadAnual: -3.1, volatilidad: 3.2, soloHabiles: true } },
  { clave: 'EUR', nombre: 'Euro', tipo: 'divisa', serie: { semilla: 6.1, valorHoy: 4655.1, rentabilidadAnual: -1.2, volatilidad: 2.8, soloHabiles: true } },
  { clave: 'UVR', nombre: 'UVR', tipo: 'indicador', serie: { semilla: 0.2, valorHoy: 397.4182, rentabilidadAnual: 5.1, volatilidad: 0.05, soloHabiles: true, decimales: 4 } },
  { clave: 'COLCAP', nombre: 'COLCAP', tipo: 'indicador', serie: { semilla: 2.9, valorHoy: 1712.44, rentabilidadAnual: 18.4, volatilidad: 4.8, soloHabiles: true } },
];

// ───────────────────────────── Mezclas Invest-ed ─────────────────────────────

export const MEZCLAS: readonly MezclaInversion[] = [
  { id: 6, nombre: 'AUDAZ', descripcion: 'Mezcla de mayor riesgo, con más renta variable global.' },
  { id: 1, nombre: 'CAUTA', descripcion: 'Mezcla conservadora, con énfasis en renta fija y liquidez.' },
  { id: 4, nombre: 'DINÁMICA', descripcion: 'Mezcla moderada que equilibra renta fija y variable.' },
  { id: 2, nombre: 'DISCRETA', descripcion: 'Mezcla conservadora con algo de renta variable.' },
  { id: 5, nombre: 'DECIDIDA', descripcion: 'Mezcla de riesgo alto, para horizontes largos.' },
  { id: 3, nombre: 'PACIENTE', descripcion: 'Mezcla moderada para metas de mediano plazo.' },
];

/** Peso (%) de cada portafolio de una mezcla: renta fija, variable global, liquidez, alternativos, rf. internacional. */
const PESOS: Readonly<Record<string, readonly number[]>> = {
  CAUTA: [55.4, 6.2, 24.1, 5.8, 8.5],
  DISCRETA: [48.7, 12.9, 17.3, 9.6, 11.5],
  PACIENTE: [38.5, 24.1, 12.4, 15.0, 10.0],
  DINÁMICA: [31.2, 32.6, 8.7, 16.4, 11.1],
  DECIDIDA: [22.9, 44.3, 5.2, 18.1, 9.5],
  AUDAZ: [14.6, 58.2, 3.1, 17.2, 6.9],
};

const COMPONENTES = [
  { id: 'FPV_RFCOL', nombre: 'Renta Fija Colombia', serie: { semilla: 1.5, valorHoy: 12118.27, rentabilidadAnual: 9.9, volatilidad: 1.0 } },
  { id: 'FPV_RVGLOB', nombre: 'Renta Variable Global', serie: { semilla: 3.1, valorHoy: 18650.03, rentabilidadAnual: 15.3, volatilidad: 4.4 } },
  { id: 'FPV_LIQ', nombre: 'Liquidez', serie: { semilla: 0.4, valorHoy: 2847.55, rentabilidadAnual: 7.49, volatilidad: 0.25 } },
  { id: 'FPV_ALT', nombre: 'Alternativos', serie: { semilla: 4.8, valorHoy: 11402.9, rentabilidadAnual: 10.7, volatilidad: 1.8 } },
  { id: 'FPV_RFINT', nombre: 'Renta Fija Internacional', serie: { semilla: 2.2, valorHoy: 10533.61, rentabilidadAnual: 6.8, volatilidad: 2.1 } },
] as const;

function tendenciaMezcla(nombre: string): TendenciaMezcla {
  const pesos = PESOS[nombre] ?? PESOS['PACIENTE'];
  return { portafolios: COMPONENTES.map((c, i) => ({ ...c, porcentaje: pesos[i] })) };
}

function rebalanceos(nombre: string): Rebalanceo[] {
  const pesos = PESOS[nombre] ?? PESOS['PACIENTE'];
  const clases = (desfase: number): ClaseActivo[] =>
    COMPONENTES.map((c, i) => ({ nombre: c.nombre, porcentaje: Math.max(1, pesos[i] + (i % 2 ? -desfase : desfase)) }));
  return [
    { fecha: '15/10/2026', antes: clases(2.4), despues: clases(0) },
    { fecha: '14/07/2026', antes: clases(-1.6), despues: clases(2.4) },
    { fecha: '15/04/2026', antes: clases(3.1), despues: clases(-1.6) },
  ];
}

/** Valor de unidad y comportamiento de cada mezcla según su perfil. */
const SERIES_MEZCLA: Readonly<Record<string, DefinicionSerie>> = {
  CAUTA: { semilla: 0.9, valorHoy: 1124.38, rentabilidadAnual: 8.7, volatilidad: 0.8 },
  DISCRETA: { semilla: 1.7, valorHoy: 1146.91, rentabilidadAnual: 9.6, volatilidad: 1.2 },
  PACIENTE: { semilla: 2.6, valorHoy: 1171.55, rentabilidadAnual: 10.8, volatilidad: 1.9 },
  DINÁMICA: { semilla: 3.4, valorHoy: 1198.02, rentabilidadAnual: 11.9, volatilidad: 2.6 },
  DECIDIDA: { semilla: 4.1, valorHoy: 1226.47, rentabilidadAnual: 13.1, volatilidad: 3.4 },
  AUDAZ: { semilla: 5.3, valorHoy: 1259.8, rentabilidadAnual: 14.6, volatilidad: 4.3 },
};

/** Detalle de una mezcla: desempeño, tendencia, rebalanceos y documentos. */
export function detalleMezcla(m: MezclaInversion): ActivoDetalle {
  return {
    id: String(m.id),
    tipo: 'mezcla',
    nombre: m.nombre,
    descripcion: m.descripcion,
    desempeno: periodosDesempeno(SERIES_MEZCLA[m.nombre], HOY_MONITOR),
    tendencia: tendenciaMezcla(m.nombre),
    rebalanceos: rebalanceos(m.nombre),
    documentos: documentos(10),
  };
}

/** Mezclas como activos comparables (la clave es el nombre, como en producción). */
export const MEZCLAS_COMPARABLES: readonly DefinicionActivo[] = MEZCLAS.map((m) => ({
  clave: m.nombre,
  nombre: m.nombre,
  tipo: 'mezcla' as const,
  serie: SERIES_MEZCLA[m.nombre],
  detalle: detalleMezcla(m),
}));

// ───────────────────────────── Competencia ─────────────────────────────

export const COMPANIAS_REFERENCIA: readonly CompaniaReferencia[] = [
  {
    id: '1',
    nombre: 'ADMINISTRADORA ANDINA',
    imagen: logo('A', '#368CB5'),
    portafolios: [
      { id: 'AA01', nombre: 'RENTA FIJA PESOS', tipo: 'VOLUNTARIO', fechaMaxima: '2026-11-10' },
      { id: 'AA02', nombre: 'ACCIONES GLOBALES', tipo: 'VOLUNTARIO', fechaMaxima: '2026-11-10' },
      { id: 'AA03', nombre: 'MODERADO', tipo: 'OBLIGATORIO', fechaMaxima: '2026-11-09' },
    ],
  },
  {
    id: '2',
    nombre: 'FIDUCIARIA DEL VALLE',
    imagen: logo('V', '#BC6995'),
    portafolios: [
      { id: 'FV01', nombre: 'FIC LIQUIDEZ', tipo: 'FIC', fechaMaxima: '2026-11-11' },
      { id: 'FV02', nombre: 'FIC DEUDA CORPORATIVA', tipo: 'FIC', fechaMaxima: '2025-08-29' },
    ],
  },
  {
    id: '3',
    nombre: 'PENSIONES CORDILLERA',
    imagen: logo('C', '#9EB23B'),
    portafolios: [
      { id: 'PC01', nombre: 'CONSERVADOR', tipo: 'OBLIGATORIO', fechaMaxima: '2026-11-10' },
      { id: 'PC02', nombre: 'MAYOR RIESGO', tipo: 'OBLIGATORIO', fechaMaxima: '2026-11-10' },
      { id: 'PC03', nombre: 'RETIRO PROGRAMADO', tipo: 'VOLUNTARIO', fechaMaxima: '2024-12-31' },
    ],
  },
];

/** Portafolios de la competencia como activos comparables (clave `<compañía>_<portafolio>`). */
export const REFERENCIAS_COMPARABLES: readonly DefinicionActivo[] = COMPANIAS_REFERENCIA.flatMap((c, ci) =>
  c.portafolios.map((p, pi) => {
    const serie: DefinicionSerie = {
      semilla: 7 + ci * 1.3 + pi * 0.6,
      valorHoy: 9800 + ci * 2650.4 + pi * 1310.75,
      rentabilidadAnual: 7.8 + ci * 1.1 + pi * 1.6,
      volatilidad: 0.8 + pi * 1.4,
    };
    const clave = `${c.id}_${p.id}`;
    return {
      clave,
      nombre: p.nombre,
      tipo: 'referencia' as const,
      compania: c.nombre,
      imagen: c.imagen,
      serie,
      detalle: {
        id: clave,
        tipo: 'referencia' as const,
        nombre: p.nombre,
        imagenCompania: c.imagen,
        desempeno: periodosDesempeno(serie, HOY_MONITOR),
        tendenciaActivo: TENDENCIA_ACTIVO,
      },
    };
  }),
);

// ───────────────────────────── CDT ─────────────────────────────

export const PLAZOS_CDT: readonly PlazoCdt[] = [
  { subcuenta: '30', descripcion: 'A 30 DIAS', color: '#ED3833' },
  { subcuenta: '60', descripcion: 'A 60 DIAS', color: '#F59E0B' },
  { subcuenta: '90', descripcion: 'A 90 DIAS', color: '#8B5CF6' },
  { subcuenta: '180', descripcion: 'A 180 DIAS', color: '#14B8A6' },
  { subcuenta: '360', descripcion: 'A 360 DIAS', color: '#6366F1' },
];

/** Tasas promedio de captación por plazo (media móvil de 4 semanas, en %). */
export const CDT_COMPARABLES: readonly DefinicionActivo[] = PLAZOS_CDT.map((p, i) => ({
  clave: `CDT-${p.subcuenta}`,
  nombre: `CDT ${p.descripcion.charAt(0)}${p.descripcion.slice(1).toLowerCase().replace('dias', 'días')}`,
  tipo: 'cdt' as const,
  color: p.color,
  serie: { semilla: 8 + i, valorHoy: 8.85 + i * 0.32, rentabilidadAnual: -4, volatilidad: 2.5, soloHabiles: true },
}));
