import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { FilaCompararPortafolio, FilaContrato, FilaMezcla } from '@features/monitor/interfaces/cliente';
import {
  AccionFila,
  Estilos,
  FilaTabla,
  GrupoCasillas,
  IconoTabla,
  OpcionesTabla,
  ValoresCasillas,
} from '@features/monitor/interfaces/comunes';

/**
 * Opciones de las tablas de la pestaña Contratos y de lo comparado en la página del Monitor del cliente
 * (`getTableOptionsContracts`, `getTableOptionsMixes`, `TABLE_PORTFOLIO_OPTIONS_COMPARAR`). La de portafolios está
 * en `cliente-tabla-portafolios.ts`.
 */

const C = TEXTOS_CLIENTE.columnas;
const A = TEXTOS_CLIENTE.ayudasContratos;
const D = TEXTOS.definiciones;
const T = TEXTOS_DETALLE.tablas;

const FLECHA_VERDE: IconoTabla = { icono: 'flecha-verde' };
const FLECHA_ROJA: IconoTabla = { icono: 'flecha-roja' };

/** Flecha de la tabla de contratos (`getIcon`): sin número no hay; 0 o más, verde; negativo, roja. */
export function flechaContrato(valor: unknown): IconoTabla | null {
  const n = Number(valor);
  if (Number.isNaN(n)) {
    return null;
  }
  return n >= 0 ? FLECHA_VERDE : FLECHA_ROJA;
}

/** Flecha de lo comparado (`getMixesIconColumn`): positivo, verde; negativo, roja; 0, sin flecha. */
export function flechaComparado(valor: unknown): IconoTabla | null {
  const n = Number(valor);
  if (n > 0) {
    return FLECHA_VERDE;
  }
  return n < 0 ? FLECHA_ROJA : null;
}

// ───────────────────────────── Estilos comunes ─────────────────────────────

export const SIN_FONDO: Estilos = { 'background-color': 'transparent', border: 'none' };
export const AJUSTADA: Estilos = { ...SIN_FONDO, width: 'max-content', padding: '4px 0px' };

/** Columna de texto de 12px en Open Sans con el peso dado (porcentaje y nombre). */
export function textoCelda(peso: '400' | '700'): Estilos {
  return { ...AJUSTADA, 'font-weight': peso, 'font-size': '12px', 'font-family': 'var(--sk-font-body)' };
}

/** Acción «Retirar de la experiencia» de las filas agregadas con «Comparar». */
export const ACCION_RETIRAR: AccionFila = {
  clave: 'retirar',
  nombre: TEXTOS_CLIENTE.retirar,
  icono: 'circulo-x',
  visible: (f: FilaTabla) => !!f['removible'],
};

/** Formato de las celdas de un CDT: tasas con %, variación en p.p. y sin volatilidad. */
function formatoCdt(clave: string, valor: unknown, columnasTasa: readonly string[]): string | null {
  if (clave === 'volatilidad') {
    return '-';
  }
  if (columnasTasa.includes(clave)) {
    return valor == null || Number(valor) === 0 ? '-' : `${Number(valor).toFixed(2)}%`;
  }
  if (clave === 'variacion') {
    return valor == null ? '-' : `${Number(valor) >= 0 ? '+' : ''}${Number(valor).toFixed(2)} p.p.`;
  }
  return null;
}

const subtituloPlazo = (f: FilaTabla, clave: string, columna: string): string | null =>
  clave === columna ? ((f['plazoCdt'] as string | undefined) ?? null) : null;

// ───────────────────────────── Contratos ─────────────────────────────

/** Casillas de «Personaliza» de la tabla de contratos (los rendimientos solo con «Desde el inicio»). */
export function casillasContratos(conRendimientos: boolean): GrupoCasillas {
  return {
    titulo: C.personaliza,
    opciones: [
      { valor: 'porcentaje', nombre: C.porcentajeOpcion },
      { valor: 'valorInicial', nombre: C.valorUnidadInicial },
      { valor: 'valorFinal', nombre: C.valorUnidadFinal },
      { valor: 'variacion', nombre: C.variacion },
      { valor: 'tir', nombre: C.tir },
      ...(conRendimientos ? [{ valor: 'rendimientos', nombre: C.rendimientos }] : []),
      { valor: 'saldo', nombre: C.saldo },
    ],
  };
}

/** Columnas visibles por defecto de la tabla de contratos. */
export const COLUMNAS_CONTRATOS: ValoresCasillas = {
  porcentaje: true,
  nombre: true,
  valorInicial: true,
  valorFinal: true,
  variacion: true,
  tir: true,
  rendimientos: true,
  saldo: true,
};

/**
 * «Indicadores por contrato»: porcentaje, nombre clicable, valores de unidad, variación y TIR con flecha,
 * rendimientos (solo «Desde el inicio») y saldo. Las filas agregadas con «Comparar» abren su detalle («Ver más»)
 * y se pueden retirar; con un CDT, el plazo va debajo del nombre.
 */
export function opcionesTablaContratos(
  filas: readonly FilaContrato[],
  conRendimientos: boolean,
  columnas: ValoresCasillas | null,
): OpcionesTabla {
  const extra = <T>(valor: T): T[] => (conRendimientos ? [valor] : []);
  return {
    claves: ['porcentaje', 'nombre', 'valorInicial', 'valorFinal', 'variacion', 'tir', ...extra('rendimientos'), 'saldo'],
    etiquetas: [C.porcentaje, 'nombre', C.valorUnidadInicial, C.valorUnidadFinal, C.variacion, C.tir, ...extra(C.rendimientos), C.saldoActual],
    tiposColumna: ['porcentaje', 'accion', 'dinero', 'dinero', 'porcentaje', 'porcentaje', ...extra('dinero' as const), 'dinero'],
    datos: filas,
    coloresPunto: filas.map((f) => f.color),
    ordenable: true,
    conPaginador: false,
    conAcciones: false,
    mostrarColumnaIndice: true,
    columnasVisibles: columnas ?? COLUMNAS_CONTRATOS,
    estiloColumna: { porcentaje: textoCelda('700'), nombre: textoCelda('400'), point: AJUSTADA },
    encabezadosOcultos: ['nombre', 'porcentaje'],
    iconosColumna: (f) => [null, null, null, null, flechaContrato(f['variacion']), flechaContrato(f['tir']), ...extra(null)],
    posicionIconosColumna: () => ['fin', 'fin', '', '', 'fin', 'fin'],
    conAccionesFila: filas.some((f) => f.removible),
    posicionAccionesFila: 'fin',
    accionesFila: [ACCION_RETIRAR],
    tooltipsEncabezado: ['', '', A.valorInicial, A.valorFinal, A.variacion, A.tir, ...extra(A.rendimientos), A.saldo],
    tooltipCelda: (f, clave) => (clave === 'nombre' && !f['contrato'] && f['clave'] ? TEXTOS_CLIENTE.verMas : ''),
    subtituloCelda: (f, clave) => subtituloPlazo(f, clave, 'nombre'),
  };
}

// ───────────────────────────── Lo comparado ─────────────────────────────

/**
 * «Mezcla Invest-ed, Competencia, CDTs e Indicadores»: nombre con el logo de la compañía, valores, variación,
 * volatilidad y TEA con flecha, retorno y «Retirar». Solo las mezclas y la competencia abren el detalle («Ver
 * más»); en las demás el tooltip es el nombre.
 */
export function opcionesTablaMezclas(filas: readonly FilaMezcla[], expandible: (f: FilaTabla) => boolean): OpcionesTabla {
  return {
    claves: ['nombre', 'valorInicial', 'valorFinal', 'variacion', 'volatilidad', 'tea', 'retorno'],
    etiquetas: [T.nombre, T.valorInicial, T.valorFinal, T.variacion, T.volatilidad, T.tea, T.retorno],
    tiposColumna: ['accion', 'dinero', 'dinero', 'porcentaje', 'porcentaje', 'porcentaje', 'porcentaje'],
    alineaciones: ['start', 'center', 'center', 'center', 'center', 'center', 'center'],
    datos: filas,
    coloresPunto: filas.map((f) => f.color),
    ordenable: false,
    conAcciones: false,
    conPaginador: false,
    ocultarAccionesPredeterminadas: { analizarConSami: true, copiar: false, personalizar: true, graficar: true },
    mostrarColumnaIndice: true,
    tipoColumnaIndice: 'punto',
    encabezadosOcultos: ['nombre'],
    conAccionesFila: filas.length > 0,
    posicionAccionesFila: 'fin',
    accionesFila: [ACCION_RETIRAR],
    estiloColumna: { point: SIN_FONDO, nombre: SIN_FONDO },
    iconosColumna: (f) => [
      f['imagen'] ? { imagen: String(f['imagen']) } : null,
      null,
      null,
      flechaComparado(f['variacion']),
      f['tipo'] === 'cdt' ? null : flechaComparado(f['volatilidad']),
      flechaComparado(f['tea']),
      null,
    ],
    posicionIconosColumna: () => ['inicio', '', '', 'fin', 'fin', 'fin', ''],
    formatoCelda: (f, clave, valor) =>
      f['tipo'] === 'cdt' ? formatoCdt(clave, valor, ['valorInicial', 'valorFinal']) : null,
    tooltipCelda: (f, clave) => {
      if (clave !== 'nombre') {
        return '';
      }
      return expandible(f) ? TEXTOS_CLIENTE.verMas : String(f['nombre'] ?? '');
    },
    subtituloCelda: (f, clave) => subtituloPlazo(f, clave, 'nombre'),
    tooltipsEncabezado: ['', D.valorInicial, D.valorFinal, D.variacion, D.volatilidad, D.tea, D.retorno],
  };
}

/** «Indicadores para comparar»: portafolios Skandia comparados en la pestaña Portafolios. */
export function opcionesTablaCompararPortafolios(filas: readonly FilaCompararPortafolio[]): OpcionesTabla {
  return {
    claves: ['nombre', 'valorUnidad', 'fechaCorte', 'saldo'],
    etiquetas: ['nombre', C.valorUnidad, C.fechaCorte, C.saldo],
    tiposColumna: ['accion', 'dinero', 'fecha', 'dinero'],
    alineaciones: ['center', 'center', 'center', 'center'],
    datos: filas,
    coloresPunto: filas.map((f) => f.color),
    encabezadosOcultos: ['nombre'],
    ordenable: false,
    conAcciones: false,
    conPaginador: false,
    ocultarAccionesPredeterminadas: { analizarConSami: true, copiar: false, personalizar: true, graficar: true },
    mostrarColumnaIndice: true,
    tipoColumnaIndice: 'punto',
    estiloColumna: { point: AJUSTADA, nombre: textoCelda('400') },
    formatoCelda: (f, clave, valor) => (f['tipo'] === 'cdt' ? formatoCdt(clave, valor, ['valorUnidad', 'saldo']) : null),
    tooltipCelda: (_f, clave) => (clave === 'nombre' ? TEXTOS_CLIENTE.verMas : ''),
    subtituloCelda: (f, clave) => subtituloPlazo(f, clave, 'nombre'),
    conAccionesFila: filas.length > 0,
    posicionAccionesFila: 'fin',
    accionesFila: [ACCION_RETIRAR],
  };
}
