import { SerieLinea } from '@features/monitor/interfaces/comunes';

/**
 * Modelos de vista del detalle del Monitor: gráfica de contratos (cliente), comparación (exterior), detalle de un
 * activo (modal con Desempeño, Tendencia, Rebalanceos y Documentos) y listas de comparación (referencias de la
 * competencia, mezclas Invest-ed y CDT). Son modelos de vista en español, no contratos de servicios.
 */

// ───────────────────────────── Series deterministas ─────────────────────────────

/**
 * Receta de una serie de valores sin `Math.random`: el valor de hoy y su comportamiento hacia atrás. La misma
 * receta da siempre los mismos puntos, para cualquier rango de fechas (ver `utils/detalle-series.ts`).
 */
export interface DefinicionSerie {
  /** Cambia la forma de las oscilaciones. */
  semilla: number;
  /** Valor en «hoy» (valor de unidad, saldo, tasa…). */
  valorHoy: number;
  /** Crecimiento anual compuesto, en %. */
  rentabilidadAnual: number;
  /** Amplitud de las oscilaciones, en % del valor. */
  volatilidad: number;
  /** Solo días hábiles (indicadores, divisas y CDT); los portafolios tienen valor todos los días. */
  soloHabiles?: boolean;
  /** Primer día con datos (ISO). Antes no hay puntos. */
  inicio?: string;
  /** Decimales del valor (por defecto 2). */
  decimales?: number;
}

/** Punto de una serie del detalle: fecha, valor real y valor normalizado (base 1.000 al inicio del rango). */
export interface PuntoSerie {
  /** `YYYY-MM-DD`. */
  fechaIso: string;
  /** Etiqueta del eje X, como la de producción («5 nov 26»). */
  etiqueta: string;
  valor: number | null;
  valorNormalizado: number | null;
  /** Rendimiento y saldo del contrato ese día (solo contratos del cliente). */
  rendimiento?: number | null;
  saldo?: number | null;
  /** Fecha de corte del extracto (ISO o ''). */
  fechaExtracto?: string;
}

/** Medidas de un activo en un rango: las columnas de las tablas de comparación y de tendencia. */
export interface MetricasActivo {
  valorInicial: number;
  valorFinal: number;
  /** % (puntos porcentuales en los CDT). */
  variacion: number;
  volatilidad: number | null;
  tea: number;
  retorno: number | null;
}

// ───────────────────────────── Detalle de un activo ─────────────────────────────

/** Tipo de activo del Monitor. `referencia` es un portafolio de la competencia (benchmark). */
export type TipoActivo = 'portafolio' | 'mezcla' | 'referencia' | 'indicador' | 'divisa' | 'cdt';

/** Fila de la tabla de desempeño (y de las tarjetas de rendimiento en móvil). */
export interface PeriodoDesempeno {
  periodo: string;
  variacion: number | null;
  volatilidad: number | null;
  /** Solo el Monitor del cliente muestra la TIR. */
  tir: number | null;
  tea: number | null;
  retorno: number | null;
}

/** Porción de una composición (clases de activo o portafolios de una mezcla). */
export interface ClaseActivo {
  nombre: string;
  /** %. */
  porcentaje: number;
}

/** Portafolio que compone una mezcla: su peso y la receta de su valor de unidad. */
export interface PortafolioMezcla {
  /** Identificador corto: es el nombre de la serie en la gráfica de tendencia. */
  id: string;
  nombre: string;
  porcentaje: number;
  serie: DefinicionSerie;
}

/** Tendencia de una mezcla Invest-ed: composición, comportamiento y tabla para cualquier periodo. */
export interface TendenciaMezcla {
  portafolios: readonly PortafolioMezcla[];
}

/** Tendencia de un activo que no es mezcla (pestaña deshabilitada en producción). */
export interface TendenciaActivo {
  categorias: readonly ClaseActivo[];
  etiquetas: readonly string[];
  series: readonly { nombre: string; datos: readonly number[] }[];
}

/** Un rebalanceo de una mezcla: composición antes y después. */
export interface Rebalanceo {
  /** `dd/MM/yyyy`, como lo muestra producción. */
  fecha: string;
  antes: readonly ClaseActivo[];
  despues: readonly ClaseActivo[];
}

export type TipoDocumento = 'ficha-tecnica' | 'informe-mensual' | 'prospecto';

/** Documento vigente de un portafolio o una mezcla. */
export interface DocumentoActivo {
  tipo: TipoDocumento;
  /** Fecha de corte ISO. */
  fechaCorte: string;
}

/**
 * Todo lo que muestra el detalle de un activo (`details-portfolio`). Los datos que en producción llegaban de
 * servicios aquí vienen completos; `null` en `desempeno` o `documentos` pinta el estado de error.
 */
export interface ActivoDetalle {
  id: string;
  tipo: Exclude<TipoActivo, 'divisa'>;
  nombre: string;
  descripcion?: string;
  /** Logo de la compañía (portafolios de la competencia, solo en el cliente). */
  imagenCompania?: string | null;
  desempeno: readonly PeriodoDesempeno[] | null;
  tendencia?: TendenciaMezcla;
  tendenciaActivo?: TendenciaActivo;
  rebalanceos?: readonly Rebalanceo[];
  documentos?: readonly DocumentoActivo[] | null;
}

// ───────────────────────────── Gráfica de contratos (cliente) ─────────────────────────────

/** Contrato (o activo agregado con «Comparar») de la gráfica de contratos del cliente. */
export interface ContratoGrafica {
  /** Clave de la serie («Multifund 061»). */
  clave: string;
  nombreProducto: string;
  /** Nombre de la leyenda; si falta: el producto en lo comparado y la clave en los contratos propios. */
  nombreVisible?: string;
  color: string;
  /** Agregado con «Comparar»: se puede retirar desde la leyenda. */
  removible: boolean;
  tipo?: 'cdt' | 'indicador' | 'contrato';
  imagen?: string;
  compania?: string;
  puntos: readonly PuntoSerie[];
}

/**
 * Receta de un contrato del cliente: su valor de unidad en el tiempo y las unidades, para que el saldo de hoy
 * (unidades × valor de unidad) y los rendimientos cuadren con la ficha del producto.
 */
export interface DefinicionContrato {
  /** Número del contrato (sin «#»). */
  contrato: string;
  /** Producto: con los 3 últimos dígitos del contrato forma la clave de la serie («Multifund 061»). */
  producto: string;
  nombreProducto: string;
  unidades: number;
  /** Rendimientos acumulados a hoy. */
  rendimientosHoy: number;
  serie: DefinicionSerie;
}

/** Lo que pinta la gráfica de contratos (`buildChartData`). */
export interface DatosGraficaContratos {
  etiquetas: string[];
  series: SerieLinea[];
  yMin: number;
  yMax: number;
}

// ───────────────────────────── Comparación (exterior) ─────────────────────────────

/** Receta de un activo que se puede comparar: con un rango da su serie y sus medidas (ver `detalle-activos.ts`). */
export interface DefinicionActivo {
  clave: string;
  nombre: string;
  tipo: TipoActivo;
  serie: DefinicionSerie;
  imagen?: string;
  compania?: string;
  /** Color propio (CDT); si falta, lo pone la paleta según el tipo. */
  color?: string;
  detalle?: ActivoDetalle;
}

/** Activo agregado a la comparación del Monitor exterior (fila de la tabla y serie de las gráficas). */
export interface ActivoComparado {
  /** Clave de la serie y de la fila. */
  clave: string;
  /** Nombre del catálogo (en indicadores, el del catálogo: la UVR se muestra como «Inflación»). */
  nombre: string;
  tipo: TipoActivo;
  color: string;
  /** Logo de la compañía (portafolios de la competencia). */
  imagen?: string;
  compania?: string;
  puntos: readonly PuntoSerie[];
  /** `null`: sin datos en el periodo (no va en la tabla). */
  metricas: MetricasActivo | null;
  /** Si viene, la fila abre el detalle del activo («Ver más»). */
  detalle?: ActivoDetalle;
}

/** Fila de la tabla de comparación (`AssetsToCompareMap`). */
export interface FilaComparacion {
  clave: string;
  nombre: string;
  valorInicial: number;
  valorFinal: number;
  variacion: string;
  volatilidad: string | null;
  tea: string;
  retorno: string | null;
  color: string;
  tipo: TipoActivo;
  imagen?: string;
  [clave: string]: unknown;
}

/** Punto de la gráfica de riesgo y retorno. */
export interface PuntoRiesgoRetorno {
  clave: string;
  nombre: string;
  volatilidad: string | null;
  retorno: string | null;
  color: string;
}

export type PestanaComparacion = 'tendencia' | 'riesgo-retorno';

// ───────────────────────────── Listas de comparación ─────────────────────────────

/** Portafolio de la competencia dentro de su compañía. */
export interface PortafolioReferencia {
  id: string;
  nombre: string;
  /** Tipo de ahorro («voluntario», «obligatorio»…). */
  tipo: string;
  /** Último dato reportado (ISO): si es de antes del año en curso, está desactualizado. */
  fechaMaxima: string;
}

/** Compañía de la competencia con sus portafolios. */
export interface CompaniaReferencia {
  id: string;
  nombre: string;
  imagen?: string;
  portafolios: readonly PortafolioReferencia[];
}

/** Portafolio de la competencia elegido (`BenchmarkFondo`). */
export interface ReferenciaSeleccionada {
  idCompania: string;
  idPortafolio: string;
  tipo: string;
}

/** Fila de la lista de referencias, ya aplanada. */
export interface ItemReferencia {
  id: string;
  idCompania: string;
  nombrePortafolio: string;
  tipo: string;
  tipoVisible: string;
  nombreCompania: string;
  imagenCompania: string;
  fechaMaxima: string;
}

/** Mezcla Invest-ed. */
export interface MezclaInversion {
  id: number;
  /** En mayúsculas, como el catálogo de producción («CAUTA»). */
  nombre: string;
  descripcion: string;
}

/** Plazo CDT que se puede comparar. */
export interface PlazoCdt {
  subcuenta: string;
  /** «A 30 DIAS». */
  descripcion: string;
  color: string;
}
