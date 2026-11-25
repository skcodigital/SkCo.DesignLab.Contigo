import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import {
  FilaTabla,
  GrupoCasillas,
  IconoTabla,
  OpcionesTabla,
  ValoresCasillas,
  VistaMonitor,
} from '@features/monitor/interfaces/comunes';
import { PeriodoDesempeno } from '@features/monitor/interfaces/detalle';

/**
 * Opciones de las tablas del detalle (`FullTableOptions` de producción): desempeño por periodos y tabla de la
 * tendencia de una mezcla. La de comparación del exterior está en `detalle-comparacion.ts`.
 */

const T = TEXTOS_DETALLE.tablas;
const D = TEXTOS.definiciones;

/** Ícono de ayuda (?) de los encabezados (`icon-Circle-question-line text-info-sk`). */
export const ICONO_AYUDA: IconoTabla = { icono: 'circulo-pregunta', color: 'var(--sk-color-info)' };

/**
 * Flecha verde o roja según el signo (`icon-increase-arrow` / `icon-decrease-arrow`). El exterior las achica a
 * 10px con una regla global; en el cliente quedan del tamaño del ícono de la tabla (15px).
 */
export function iconoFlecha(positiva: boolean, vista: VistaMonitor): IconoTabla {
  return {
    icono: positiva ? 'flecha-sube' : 'flecha-baja',
    color: positiva ? 'var(--sk-color-primary)' : '#e03430',
    ...(vista === 'exterior' ? { tamano: 10 } : {}),
  };
}

/** `getIconColumn`: sin valor (o 0) no hay flecha; positivo sube y lo demás baja. */
export function flechaPorValor(valor: unknown, vista: VistaMonitor): IconoTabla | null {
  const n = Number(valor);
  if (!valor || Number.isNaN(n)) {
    return null;
  }
  return iconoFlecha(n > 0, vista);
}

// ───────────────────────────── Desempeño ─────────────────────────────

/**
 * Tabla de desempeño (`buildPerformanceTableOptions` / `TABLE_PERFORMANCE_OPTION`). El cliente muestra la TIR
 * salvo cuando el activo se está comparando (`conTir = false`); el exterior nunca la muestra.
 */
export function opcionesTablaDesempeno(
  periodos: readonly PeriodoDesempeno[],
  conTir: boolean,
  vista: VistaMonitor,
): OpcionesTabla {
  const columnas = [
    { clave: 'periodo', etiqueta: T.periodo, tipo: 'texto' as const, ayuda: '' },
    { clave: 'variacion', etiqueta: T.variacion, tipo: 'porcentaje' as const, ayuda: D.variacion },
    { clave: 'volatilidad', etiqueta: T.volatilidad, tipo: 'porcentaje' as const, ayuda: D.volatilidad },
    ...(conTir ? [{ clave: 'tir', etiqueta: T.tir, tipo: 'porcentaje' as const, ayuda: D.tirCliente }] : []),
    { clave: 'tea', etiqueta: T.tea, tipo: 'porcentaje' as const, ayuda: D.tea },
    { clave: 'retorno', etiqueta: T.retorno, tipo: 'porcentaje' as const, ayuda: D.retorno },
  ];
  const conFlecha = new Set(['variacion', 'volatilidad', 'tir', 'tea']);
  return {
    claves: columnas.map((c) => c.clave),
    etiquetas: columnas.map((c) => c.etiqueta),
    tiposColumna: columnas.map((c) => c.tipo),
    datos: periodos.map((p) => ({ ...p })),
    ordenable: false,
    conAcciones: false,
    conPaginador: false,
    ocultarAccionesPredeterminadas: { analizarConSami: true, copiar: false, personalizar: true, graficar: true },
    alineaciones: columnas.map(() => 'center' as const),
    iconosColumna: (fila: FilaTabla) =>
      columnas.map((c) => (conFlecha.has(c.clave) ? flechaPorValor(fila[c.clave], vista) : null)),
    posicionIconosColumna: () => columnas.map((c) => (conFlecha.has(c.clave) ? 'fin' : '')),
    iconosEncabezado: columnas.map((c) => (c.ayuda ? ICONO_AYUDA : null)),
    posicionIconosEncabezado: columnas.map((c) => (c.ayuda ? 'fin' : '')),
    tooltipsIconosEncabezado: columnas.map((c) => c.ayuda),
    // Algunas medidas no son calculables en el periodo: se muestran con «-».
    formatoCelda: (_fila, _clave, valor) => (valor == null ? '-' : null),
  };
}

// ───────────────────────────── Tendencia de una mezcla ─────────────────────────────

/** Casillas de «Personaliza» de la tabla de tendencia (`CHECKBOX_CUSTOM_COLUMNS_TRENDING`). */
export const CASILLAS_TENDENCIA: GrupoCasillas = {
  titulo: T.personalizaColumnas,
  opciones: [
    { valor: 'porcentaje', nombre: T.porcentaje },
    { valor: 'nombre', nombre: T.nombre },
    { valor: 'valorInicial', nombre: T.valorInicial },
    { valor: 'valorFinal', nombre: T.valorFinal },
    { valor: 'variacion', nombre: T.variacion },
    { valor: 'volatilidad', nombre: T.volatilidad },
    { valor: 'tea', nombre: T.tea },
    { valor: 'retorno', nombre: T.retorno },
  ],
};

/** Todas las columnas de la tendencia visibles (`showColumns` de producción). */
export const COLUMNAS_TENDENCIA: ValoresCasillas = Object.fromEntries(
  CASILLAS_TENDENCIA.opciones.map((o) => [o.valor, true]),
);

const ESTILO_TEXTO_TABLA = {
  'background-color': 'transparent',
  border: 'none',
  padding: '4px 0px',
  'font-size': '12px',
  'font-family': 'Open Sans',
} as const;

/** Tabla de la tendencia de una mezcla (`TRENDING_TABLE_OPTIONS`): punto de color, % y nombre sin encabezado. */
export function opcionesTablaTendencia(
  filas: readonly FilaTabla[],
  columnasVisibles: ValoresCasillas,
  vista: VistaMonitor,
): OpcionesTabla {
  const claves = CASILLAS_TENDENCIA.opciones.map((o) => o.valor);
  const ayudas = ['', '', D.valorInicial, D.valorFinal, D.variacion, D.volatilidad, D.tea, D.retorno];
  return {
    claves,
    etiquetas: CASILLAS_TENDENCIA.opciones.map((o) => o.nombre),
    tiposColumna: ['porcentaje', 'texto', 'dinero', 'dinero', 'porcentaje', 'porcentaje', 'porcentaje', 'porcentaje'],
    alineaciones: ['end', 'start', 'center', 'center', 'center', 'center', 'center', 'center'],
    datos: filas,
    ordenable: false,
    conAcciones: false,
    conPaginador: false,
    mostrarColumnaIndice: true,
    tipoColumnaIndice: 'punto',
    coloresPunto: filas.map((f) => String(f['color'] ?? '')),
    encabezadosOcultos: ['porcentaje', 'nombre'],
    columnasVisibles,
    casillasPersonalizar: CASILLAS_TENDENCIA,
    iconosColumna: (fila: FilaTabla) => [
      null,
      null,
      null,
      null,
      flechaPorValor(fila['variacion'], vista),
      flechaPorValor(fila['volatilidad'], vista),
      flechaPorValor(fila['tea'], vista),
      null,
    ],
    posicionIconosColumna: () => ['', '', '', '', 'fin', 'fin', 'fin', ''],
    iconosEncabezado: ayudas.map((a) => (a ? ICONO_AYUDA : null)),
    posicionIconosEncabezado: ayudas.map((a) => (a ? 'fin' : '')),
    tooltipsIconosEncabezado: ayudas,
    estiloColumna: {
      point: { 'background-color': 'transparent', border: 'none', width: 'max-content', padding: '4px 0px' },
      porcentaje: { ...ESTILO_TEXTO_TABLA, width: '100%', 'font-weight': '700' },
      nombre: { ...ESTILO_TEXTO_TABLA, width: 'max-content', 'font-weight': '400' },
    },
  };
}
