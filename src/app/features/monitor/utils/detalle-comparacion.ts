import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { FilaTabla, GrupoCasillas, OpcionesTabla, ValoresCasillas } from '@features/monitor/interfaces/comunes';
import {
  ActivoComparado,
  FilaComparacion,
  PuntoRiesgoRetorno,
  TipoActivo,
} from '@features/monitor/interfaces/detalle';
import { capitalizar, formatearNumero } from '@features/monitor/utils/formatos';
import { nombreIndicador, truncarDosDecimales } from '@features/monitor/utils/graficas';
import { ICONO_AYUDA, iconoFlecha } from '@features/monitor/utils/detalle-tablas';

/**
 * Tabla de comparación del Monitor exterior (`setTableOptionsPortFolioComparar`, `dataTableCompararPortfolio`,
 * `formaterDataMixesTable`): filas por activo, nombres con el plazo del CDT, «Ver más», formato de los CDT y el
 * aviso de activos sin datos en el periodo.
 */

const C = TEXTOS_DETALLE.comparacion;
const T = TEXTOS_DETALLE.tablas;
const D = TEXTOS.definiciones;

/**
 * `splitCdtTermName`: con CDT el nombre llega «<activo> - <plazo> (<CDT>)»; separa el activo del CDT filtrado
 * («CDT A 30 días»).
 */
export function separarPlazoCdt(nombre: string | null | undefined): { base: string; plazo: string } | null {
  const m = /^(.+)\s+-\s+[^-]*\(([^()]+)\)\s*$/.exec(nombre ?? '');
  if (!m) {
    return null;
  }
  const plazo = m[2].trim().toLowerCase().replace(/\bdias\b/g, 'días');
  return { base: m[1].trim(), plazo: `CDT ${plazo.charAt(0).toUpperCase()}${plazo.slice(1)}` };
}

/** Nombre de la fila según el tipo de activo (las mezclas solo con la primera mayúscula). */
function nombreFila(a: ActivoComparado): string {
  switch (a.tipo) {
    case 'indicador':
      return nombreIndicador(a.clave, a.nombre);
    case 'mezcla':
      return `${a.nombre.charAt(0).toUpperCase()}${a.nombre.slice(1).toLowerCase()}`;
    case 'referencia':
      return capitalizar(a.nombre);
    default:
      return a.nombre;
  }
}

const dos = (v: number | null | undefined): string => (v ?? 0).toFixed(2);

/** Fila de un activo con medidas (los indicadores truncan los valores a 2 decimales). */
function fila(a: ActivoComparado): FilaComparacion | null {
  const m = a.metricas;
  if (!m || (a.tipo !== 'cdt' && (!m.valorInicial || !a.color))) {
    return null;
  }
  const truncar = a.tipo === 'indicador';
  return {
    clave: a.clave,
    nombre: nombreFila(a),
    valorInicial: truncar ? truncarDosDecimales(m.valorInicial) : m.valorInicial,
    valorFinal: truncar ? truncarDosDecimales(m.valorFinal) : m.valorFinal,
    variacion: dos(m.variacion),
    volatilidad: a.tipo === 'cdt' ? null : dos(m.volatilidad),
    tea: dos(m.tea),
    retorno: a.tipo === 'cdt' ? null : dos(m.retorno),
    color: a.color,
    tipo: a.tipo,
    ...(a.imagen ? { imagen: a.imagen } : {}),
  };
}

/** Filas de la tabla: de mayor a menor valor inicial, sin las series ocultas desde la leyenda. */
export function filasComparacion(
  activos: readonly ActivoComparado[],
  ocultas: readonly string[] = [],
): FilaComparacion[] {
  return activos
    .map(fila)
    .filter((f): f is FilaComparacion => !!f)
    .sort((a, b) => b.valorInicial - a.valorInicial)
    .filter((f) => !ocultas.includes(f.clave));
}

/** Datos de riesgo y retorno: todo menos los CDT (no tienen retorno), sin filtrar por la leyenda. */
export function datosRiesgoRetorno(activos: readonly ActivoComparado[]): PuntoRiesgoRetorno[] {
  return filasComparacion(activos)
    .filter((f) => f.tipo !== 'cdt')
    .map((f) => ({ clave: f.clave, nombre: f.nombre, volatilidad: f.volatilidad, retorno: f.retorno, color: f.color }));
}

const TIPOS_CON_DETALLE: readonly TipoActivo[] = ['mezcla', 'portafolio', 'referencia'];

/** La fila abre el detalle («Ver más», «Más información»): mezclas, portafolios Skandia y de la competencia. */
export function tieneDetalle(a: ActivoComparado | undefined): boolean {
  return !!a?.detalle && TIPOS_CON_DETALLE.includes(a.tipo);
}

const GRUPOS_SIN_DATOS: readonly (readonly TipoActivo[])[] = [['indicador', 'divisa'], ['portafolio'], ['mezcla'], ['referencia']];

/**
 * Activos elegidos sin puntos en el periodo (`validateEmptyData`), en el orden de producción: indicadores y divisas
 * con su id, portafolios, mezclas con «(Invest-ed)» y portafolios de la competencia con su compañía. Los CDT no
 * cuentan.
 */
export function activosSinDatos(activos: readonly ActivoComparado[]): string {
  return GRUPOS_SIN_DATOS.flatMap((tipos) =>
    activos
      .filter((a) => tipos.includes(a.tipo) && !a.puntos.some((p) => p.valor != null))
      .map((a) => {
        if (a.tipo === 'indicador' || a.tipo === 'divisa') {
          return `${a.nombre} (${a.clave})`;
        }
        if (a.tipo === 'mezcla') {
          return `${capitalizar(a.nombre)} ${C.sufijoMezcla}`;
        }
        return a.tipo === 'referencia' ? `${capitalizar(a.nombre)} (${a.compania ?? ''})` : a.nombre;
      }),
  ).join(', ');
}

/** Flecha del listado móvil y de la tabla (`mobileArrowIcon`): con valor, 0 o más sube; negativo baja. */
export function sentidoFlecha(valor: unknown): 'sube' | 'baja' | null {
  const n = parseFloat(String(valor ?? '').replace('%', '').trim());
  if (Number.isNaN(n)) {
    return null;
  }
  return n >= 0 ? 'sube' : 'baja';
}

// ───────────────────────────── Opciones de la tabla ─────────────────────────────

/** Casillas de «Personaliza» (sin la columna del nombre, que siempre se ve). */
export const CASILLAS_COMPARACION: GrupoCasillas = {
  titulo: T.personalizaColumnas,
  opciones: [
    { valor: 'valorInicial', nombre: T.valorInicial },
    { valor: 'valorFinal', nombre: T.valorFinal },
    { valor: 'variacion', nombre: T.variacion },
    { valor: 'volatilidad', nombre: T.volatilidad },
    { valor: 'tea', nombre: T.tea },
    { valor: 'retorno', nombre: T.retorno },
  ],
};

export const COLUMNAS_COMPARACION: ValoresCasillas = {
  nombre: true,
  valorInicial: true,
  valorFinal: true,
  variacion: true,
  volatilidad: true,
  tea: true,
  retorno: true,
};

const TOOLTIPS_CDT: Readonly<Record<string, string>> = {
  valorInicial: C.tasaInicialCdt,
  valorFinal: C.tasaFinalCdt,
  variacion: C.variacionCdt,
  retorno: C.retornoCdt,
};

/** Formato de las celdas de un CDT: tasas con %, variación en p.p. y sin volatilidad ni retorno. */
function formatoCdt(clave: string, valor: unknown): string | null {
  const n = Number(valor);
  if (clave === 'valorInicial' || clave === 'valorFinal') {
    return valor == null || n === 0 ? '-' : `${formatearNumero(n, 2, 2, 'en-US') || '-'}%`;
  }
  if (clave === 'variacion') {
    return valor == null ? '-' : `${n >= 0 ? '+' : ''}${formatearNumero(n, 2, 2, 'en-US') || '0'} p.p.`;
  }
  return clave === 'retorno' || clave === 'volatilidad' ? '-' : null;
}

/** Ícono de una columna con flecha (`getColumnIcons`): sin número no hay; 0 o más sube. */
function flecha(valor: unknown) {
  const s = sentidoFlecha(valor);
  return s ? iconoFlecha(s === 'sube', 'exterior') : null;
}

/**
 * Opciones de la tabla de comparación (`TABLE_PORTFOLIO_OPTIONS_COMPARAR` + lo que arma la página): punto de
 * color, nombre clicable con «Ver más», logo de la compañía, flechas, ayuda en los encabezados y «Retirar».
 */
export function opcionesTablaComparacion(
  filas: readonly FilaComparacion[],
  columnasVisibles: ValoresCasillas,
  conCdt: boolean,
  expandible: (f: FilaTabla) => boolean,
): OpcionesTabla {
  const ayudas = ['', D.valorInicial, D.valorFinal, D.variacion, D.volatilidad, D.tea, D.retorno];
  const plazo = (f: FilaTabla) => (conCdt ? separarPlazoCdt(String(f['nombre'] ?? '')) : null);
  return {
    claves: ['nombre', 'valorInicial', 'valorFinal', 'variacion', 'volatilidad', 'tea', 'retorno'],
    etiquetas: ['nombre', T.valorInicial, T.valorFinal, T.variacion, T.volatilidad, T.tea, T.retorno],
    tiposColumna: ['accion', 'dinero', 'dinero', 'porcentaje', 'porcentaje', 'porcentaje', 'porcentaje'],
    alineaciones: ['start', 'center', 'center', 'center', 'center', 'center', 'center'],
    datos: filas,
    encabezadosOcultos: ['nombre'],
    ordenable: false,
    conAcciones: false,
    conPaginador: false,
    ocultarAccionesPredeterminadas: { analizarConSami: true, copiar: false, personalizar: true, graficar: true },
    mostrarColumnaIndice: true,
    tipoColumnaIndice: 'punto',
    coloresPunto: filas.map((f) => f.color),
    conAccionesFila: true,
    posicionAccionesFila: 'fin',
    accionesFila: [{ clave: 'retirar', nombre: C.retirar, icono: 'circulo-x' }],
    columnasVisibles,
    casillasPersonalizar: CASILLAS_COMPARACION,
    estiloColumna: {
      point: { 'background-color': 'transparent', border: 'none', width: 'max-content', padding: '4px 0px' },
      nombre: {
        'background-color': 'transparent',
        border: 'none',
        'max-width': '180px',
        'min-width': '80px',
        padding: '4px 0px',
        'font-weight': '400',
        'font-size': '12px',
        'font-family': 'Open Sans',
        overflow: 'hidden',
      },
    },
    iconosColumna: (f: FilaTabla) => [
      f['imagen'] ? { imagen: String(f['imagen']) } : null,
      null,
      flecha(f['valorFinal']),
      flecha(f['variacion']),
      null,
      flecha(f['tea']),
      null,
    ],
    posicionIconosColumna: () => ['inicio', '', 'fin', 'fin', '', 'fin', ''],
    iconosEncabezado: ayudas.map((a) => (a ? ICONO_AYUDA : null)),
    posicionIconosEncabezado: ayudas.map((a) => (a ? 'fin' : '')),
    tooltipsIconosEncabezado: ayudas,
    tooltipCelda: (f, clave) => {
      if (f['tipo'] === 'cdt' && TOOLTIPS_CDT[clave]) {
        return TOOLTIPS_CDT[clave];
      }
      if (clave !== 'nombre') {
        return '';
      }
      return expandible(f) ? C.verMas : String(f['nombre'] ?? '');
    },
    subtituloCelda: (f, clave) => (clave === 'nombre' ? (plazo(f)?.plazo ?? null) : null),
    formatoCelda: (f, clave, valor) => {
      if (clave === 'nombre') {
        return plazo(f)?.base ?? null;
      }
      return f['tipo'] === 'cdt' ? formatoCdt(clave, valor) : null;
    },
  };
}
