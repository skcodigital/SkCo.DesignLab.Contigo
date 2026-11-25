import { TipoProducto } from '@features/ficha-cliente/interfaces/productos';
import { RangoFechas, ValoresCasillas } from '@features/monitor/interfaces/comunes';
import {
  ActivoDetalle,
  DefinicionSerie,
  ReferenciaSeleccionada,
  TipoActivo,
} from '@features/monitor/interfaces/detalle';

/**
 * Modelos de vista de la página del Monitor del cliente (`/ficha/monitor`): contratos y portafolios de Óscar, el
 * panel «Comparar», las tablas y el visor de transacciones. Son modelos de vista en español, no contratos de
 * servicios.
 */

/** Pestaña de la página: «Contratos» o «Portafolios». */
export type VistaCliente = 'contratos' | 'portafolios';

/**
 * Escenario de la página en el laboratorio (`?estado=` en la URL): los datos de Óscar, el error de los servicios
 * o un cliente sin productos.
 */
export type EscenarioCliente = 'normal' | 'error' | 'sin-datos';

/** Periodo y rango de una pestaña. `rango` es el que se grafica (con «Personalizado» sin fechas, el anterior). */
export interface PeriodoPestana {
  periodo: number;
  rango: RangoFechas;
  /** Rango elegido en el selector de fechas («Personalizado»); `null` mientras no se elige. */
  personalizado: RangoFechas | null;
}

// ───────────────────────────── Datos del cliente ─────────────────────────────

/** Producto de un contrato del cliente: código del catálogo (torta y filtro) y la ficha a la que lleva. */
export interface ProductoContrato {
  contrato: string;
  /** Código del producto («MFUND», «FCO»). */
  codigo: string;
  /** Producto de la ficha que abre el clic en la tabla de contratos. */
  tipo: TipoProducto;
  /** Meta del contrato en la ficha («Potencializar mi inversión»). */
  meta: string;
  /** Nombre del producto («Fondo Voluntario de Pensión Skandia Multifund»). */
  nombreProducto: string;
}

/** Movimiento de un portafolio del cliente (visor de transacciones). */
export interface MovimientoPortafolio {
  /** `YYYY-MM-DD`. */
  fecha: string;
  contrato: string;
  /** «Adición», «Retiro parcial», «Ajuste»… */
  tipo: string;
  /** En pesos, con signo: positivo entra, negativo sale. */
  valor: number;
  /** «Ocultar devoluciones» lo esconde. */
  devolucion?: boolean;
}

/** Portafolio de un contrato del cliente con su serie de valor de unidad y sus movimientos. */
export interface PortafolioCliente {
  id: string;
  nombre: string;
  contrato: string;
  /** Código del producto del contrato. */
  producto: string;
  /** `YYYY-MM-DD`: desde aquí hay valor de unidad en la gráfica. */
  fechaPrimeraCompra: string;
  unidades: number;
  saldo: number;
  /** Rendimientos acumulados a hoy (los de la ficha). */
  rendimientos: number;
  serie: DefinicionSerie;
  detalle: ActivoDetalle;
  movimientos: readonly MovimientoPortafolio[];
}

/** Portafolio Skandia que se puede comparar, con los datos de los filtros del panel. */
export interface FondoComparable {
  clave: string;
  nombre: string;
  clasificacion: string;
  perfil: string;
  /** `YYYY-MM-DD` del último valor de unidad: con más de 30 días está desactualizado. */
  ultimaFechaValorUnidad: string;
}

// ───────────────────────────── «Comparar» ─────────────────────────────

/** Lo marcado en el panel «Comparar» (borrador) o lo aplicado con «Aplicar». */
export interface SeleccionComparar {
  /** Claves de los portafolios Skandia, en el orden en que se marcaron. */
  portafolios: readonly string[];
  divisas: readonly string[];
  indicadores: readonly string[];
  /** Ids de las mezclas Invest-ed. */
  mezclas: readonly number[];
  referencias: readonly ReferenciaSeleccionada[];
  /** Subcuentas de los CDT. */
  cdt: readonly string[];
}

/** Detalle de un activo abierto en la modal. */
export interface DetalleAbierto {
  activo: ActivoDetalle;
  /** Sin TIR: el activo se abrió desde lo comparado. */
  ocultarTir: boolean;
}

// ───────────────────────────── Filas de las tablas ─────────────────────────────

/** Fila de «Indicadores por contrato»: un contrato del cliente o un portafolio agregado con «Comparar». */
export interface FilaContrato {
  /** Clave de la serie («Multifund 061» o la del portafolio comparado). */
  clave: string;
  /** Texto de la columna del nombre («Fondo Voluntario de... Multifund | 100000063061»). */
  nombre: string;
  /** Solo contratos del cliente: número del contrato y producto de la ficha. */
  contrato?: string;
  tipoProducto?: TipoProducto;
  porcentaje?: string;
  valorInicial: number;
  valorFinal: number;
  variacion: string;
  tir?: string;
  /** Solo con «Desde el inicio». */
  rendimientos?: number;
  saldo: number;
  color: string;
  removible: boolean;
  /** Con un CDT aplicado: el plazo debajo del nombre («CDT A 30 días»). */
  plazoCdt?: string;
  [clave: string]: unknown;
}

/** Fila de la tabla «Mezcla Invest-ed, Competencia, CDTs e Indicadores». */
export interface FilaMezcla {
  clave: string;
  nombre: string;
  tipo: TipoActivo;
  valorInicial: number;
  valorFinal: number;
  /** En los CDT, puntos porcentuales. */
  variacion: number | string | null;
  volatilidad: string;
  tea: string;
  retorno: string | null;
  color: string;
  removible: true;
  imagen?: string;
  plazoCdt?: string;
  [clave: string]: unknown;
}

/** Fila de «Indicadores para comparar» (portafolios Skandia comparados en la pestaña Portafolios). */
export interface FilaCompararPortafolio {
  clave: string;
  nombre: string;
  plazoCdt?: string;
  valorUnidad: number;
  /** `YYYY-MM-DD`. */
  fechaCorte: string;
  saldo: number;
  color: string;
  removible: true;
  [clave: string]: unknown;
}

/** Fila de «Indicadores por portafolio» (y porción de la torta de portafolios). */
export interface FilaPortafolio {
  /** Clave de la serie: id del portafolio y los 3 últimos dígitos del contrato. */
  clave: string;
  id: string;
  nombre: string;
  producto: string;
  contrato: string;
  color: string;
  porcentaje: number;
  fechaPrimeraCompra: string;
  vupCompra: number | null;
  vupVenta: number | null;
  valorUnidad: number;
  saldo: number;
  rendimientoAcumulado: number;
  contribucionAcumulado: number | null;
  rendimientoPeriodo: number | null;
  contribucionPeriodo: number | null;
  retorno: number | null;
  tea: number | null;
  tir: number | null;
  transacciones: number;
  /** Variación del valor de unidad actual frente al promedio de compra (%). */
  variacionCompra: number | null;
  /** Variación del promedio de venta frente al de compra (%). */
  variacionVenta: number | null;
  /** `YYYY-MM-DD`. */
  fechaCorte: string;
  [clave: string]: unknown;
}

/** Fila de la tabla de transacciones de un portafolio. */
export interface FilaTransaccion {
  /** `YYYY-MM-DD`. */
  fecha: string;
  contrato: string;
  unidades: number;
  tipo: string;
  valorUnidad: number;
  total: number;
  devolucion: boolean;
  [clave: string]: unknown;
}

/** Columnas visibles de las tablas de cada pestaña (lo que se elige en «Personaliza»). */
export type ColumnasPorVista = Readonly<Record<VistaCliente, ValoresCasillas | null>>;
