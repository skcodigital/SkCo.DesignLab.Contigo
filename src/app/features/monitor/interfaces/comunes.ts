/**
 * Modelos de vista de las piezas comunes del Monitor (sin negocio). Los comparten el Monitor del cliente
 * (`/ficha/monitor`) y el Monitor exterior (`/monitor`).
 */

/** Vista de producción de la que viene una pieza: los dos repos difieren en detalles de estilo y formato. */
export type VistaMonitor = 'cliente' | 'exterior';

/**
 * Configuración regional de los números. En producción el Monitor del cliente corre con `es-CO`
 * (1.234,56) y el exterior con `en-US` (1,234.56).
 */
export type FormatoRegional = 'es-CO' | 'en-US';

/** Tipo de aviso: define el color del ícono y su fondo (`bg-*-sk` / `text-*-sk`). */
export type TipoAviso = 'success' | 'info' | 'error' | 'warning';

/** Opción de una lista desplegable. */
export interface OpcionSeleccion {
  nombre: string;
  valor: string | number;
}

/** Rango de fechas en formato ISO (`YYYY-MM-DD`). Vacío = sin fecha. */
export interface RangoFechas {
  inicio: string;
  fin: string;
}

/** Píldora de periodo del selector móvil. */
export interface PildoraPeriodo {
  etiqueta: string;
  valor: number;
}

/** Casilla de verificación. */
export interface OpcionCasilla {
  nombre: string;
  valor: string;
  /** Si viene, la tarjeta muestra el ícono de alerta con este texto en un tooltip. */
  avisoDesactualizado?: string;
}

/** Grupo de casillas con título opcional. */
export interface GrupoCasillas {
  titulo?: string;
  opciones: readonly OpcionCasilla[];
}

/** Valor marcado de cada casilla, por su `valor`. */
export type ValoresCasillas = Readonly<Record<string, boolean>>;

/** Botón del grupo de selección múltiple. */
export interface OpcionBoton {
  id: string;
  etiqueta: string;
}

/** Fila de las tarjetas de rendimiento por periodo. */
export interface PeriodoRendimiento {
  periodo: string;
  variacion: number | null;
  volatilidad: number | null;
  tea: number | null;
  retorno: number | null;
}

/** Etiqueta (tag) del encabezado del desplegable. */
export interface EtiquetaDesplegable {
  tipo: TipoAviso;
  texto: string;
}

// ───────────────────────────── Íconos ─────────────────────────────

/**
 * Íconos en SVG que reemplazan la fuente de íconos del portal (`icon-*`). La equivalencia con la clase de
 * producción está en `components/comunes/icono/icono.ts`.
 */
export type NombreIcono =
  | 'adjuntar'
  | 'alerta'
  | 'buscar'
  | 'buscar-mas'
  | 'calendario'
  | 'camara'
  | 'cerrar'
  | 'chevron-abajo'
  | 'chevron-arriba'
  | 'chevron-derecha'
  | 'chevron-izquierda'
  | 'circulo-chevron-derecha'
  | 'circulo-chevron-izquierda'
  | 'circulo-check'
  | 'circulo-dolar'
  | 'circulo-exclamacion'
  | 'circulo-pregunta'
  | 'circulo-x'
  | 'cohete'
  | 'comparar'
  | 'copiar'
  | 'corazon'
  | 'descargar'
  | 'editar'
  | 'estrella'
  | 'filtro'
  | 'flecha-arriba'
  | 'flecha-baja'
  | 'flecha-sube'
  | 'flecha-izquierda'
  | 'flecha-verde'
  | 'flecha-roja'
  | 'globo'
  | 'grafica-barras'
  | 'grafica-linea'
  | 'grafica-linea-sube'
  | 'intercambiar'
  | 'lapiz'
  | 'noticias'
  | 'ordenar'
  | 'pantalla'
  | 'portatil'
  | 'recibo'
  | 'refrescar'
  | 'reloj'
  | 'triangulo-alerta'
  | 'archivo'
  | 'barra-lateral'
  | 'info';

/**
 * Ícono de una celda o encabezado de la tabla: uno de los SVG del Monitor (con color opcional) o una
 * imagen (logo de una compañía, por ejemplo).
 */
export type IconoTabla =
  | { icono: NombreIcono; color?: string; tamano?: number }
  | { imagen: string; alt?: string };

// ───────────────────────────── Tabla ─────────────────────────────

/** Fila de la tabla: los valores se leen por la clave de cada columna. */
export type FilaTabla = Readonly<Record<string, unknown>>;

/** Tipo de dato de una columna: define formato y ordenamiento. */
export type TipoColumna = 'texto' | 'numero' | 'dinero' | 'porcentaje' | 'fecha' | 'accion';

export type Alineacion = 'start' | 'center' | 'end';

/** Posición de un ícono respecto al texto de la celda o del encabezado. */
export type PosicionIcono = '' | 'inicio' | 'fin';

/** Estilos en línea (`[style]`) por propiedad CSS. */
export type Estilos = Readonly<Record<string, string>>;

/** Claves de las acciones predeterminadas del menú de la tabla. */
export type ClaveAccionTabla = 'personalizar' | 'copiar' | 'graficar' | 'analizarConSami';

/** Acción del menú de acciones de la tabla (columna verde fija a la derecha). */
export interface AccionTabla {
  clave: string;
  nombre: string;
  icono: NombreIcono | { imagen: string };
  tooltip?: string;
  textoDeshabilitada?: string;
}

/** Acción por fila (botón con ícono al inicio o al final de la fila). */
export interface AccionFila {
  clave: string;
  nombre: string;
  icono: NombreIcono;
  /** Si viene, la acción solo se muestra en las filas donde devuelve `true`. */
  visible?: (fila: FilaTabla) => boolean;
}

/** Configuración de la tabla completa (`full-table` de producción). */
export interface OpcionesTabla {
  claves: readonly string[];
  etiquetas: readonly string[];
  datos: readonly FilaTabla[];
  alineaciones?: readonly Alineacion[];
  tiposColumna?: readonly TipoColumna[];
  ordenable: boolean;
  conPaginador: boolean;
  /** Columna verde fija a la derecha con el menú de acciones y la flecha de cada fila. */
  conAcciones: boolean;
  desactivarColumnaAcciones?: boolean;
  /** Tooltip de la flecha de cada fila (por defecto «Ir»). */
  etiquetaColumnaAccion?: string;
  ocultarAccionesPredeterminadas?: Partial<Record<ClaveAccionTabla, boolean>>;
  accionesDeshabilitadas?: readonly string[];
  accionesPropias?: readonly AccionTabla[];
  /** Alto máximo en px: la tabla queda con scroll vertical y encabezado fijo. */
  altoMaximo?: number;
  /** Columnas visibles por clave (las que la persona eligió en «Personalizar»). Sin esto, todas. */
  columnasVisibles?: Readonly<Record<string, boolean>>;
  /** Casillas del popover «Personalizar» del menú de acciones. */
  casillasPersonalizar?: GrupoCasillas;
  mostrarColumnaIndice?: boolean;
  tipoColumnaIndice?: 'numero' | 'punto';
  coloresPunto?: readonly string[];
  /** Claves de las columnas cuyo encabezado no se muestra (la celda del encabezado queda vacía). */
  encabezadosOcultos?: readonly string[];
  tooltipsEncabezado?: readonly string[];
  iconosEncabezado?: readonly (IconoTabla | null)[];
  posicionIconosEncabezado?: readonly PosicionIcono[];
  tooltipsIconosEncabezado?: readonly string[];
  iconosColumna?: (fila: FilaTabla) => readonly (IconoTabla | null)[];
  posicionIconosColumna?: (fila: FilaTabla) => readonly PosicionIcono[];
  tooltipsIconosColumna?: (fila: FilaTabla) => readonly string[];
  conAccionesFila?: boolean;
  accionesFila?: readonly AccionFila[];
  posicionAccionesFila?: 'inicio' | 'fin';
  tooltipFila?: (fila: FilaTabla, indice: number) => string;
  tooltipCelda?: (fila: FilaTabla, clave: string) => string;
  /** Formato propio por celda; `null` usa el formato del tipo de columna. */
  formatoCelda?: (fila: FilaTabla, clave: string, valor: unknown) => string | null;
  /** Segunda línea pequeña debajo del texto de la celda. */
  subtituloCelda?: (fila: FilaTabla, clave: string) => string | null;
  estiloFila?: (fila: FilaTabla, indice: number) => Estilos;
  /** Estilos del contenedor de la celda por clave (también `'point'` y `'row-actions'`). */
  estiloColumna?: Readonly<Record<string, Estilos>>;
  estiloValor?: Readonly<Record<string, Estilos>>;
  estiloEncabezado?: Readonly<Record<string, Estilos>>;
  estiloCelda?: Readonly<Record<string, Estilos>>;
  estiloContenedorIcono?: Readonly<Record<string, Estilos>>;
  estiloIcono?: Readonly<Record<string, Estilos>>;
}

/** Evento de una celda de tipo `accion` o de una acción por fila. */
export interface EventoFila {
  clave: string;
  fila: FilaTabla;
}

// ───────────────────────────── Gráficas ─────────────────────────────

/** Tipo de serie: define el formato del valor en el tooltip y la marca de la leyenda. */
export type TipoSerie = 'cdt' | 'indicador' | 'divisa' | 'fondo' | 'portafolio' | 'contrato' | 'mezcla';

/** Chip de la leyenda propia de las gráficas. */
export interface SerieLeyenda {
  /** Clave de la serie en ECharts (la que activa/desactiva la leyenda). */
  nombre: string;
  /** Texto del chip; si no viene se usa `nombreProducto` o `nombre`. */
  nombreVisible?: string;
  nombreProducto?: string;
  color: string;
  /** Línea punteada (CDT): el chip muestra un guion en vez del punto. */
  punteada?: boolean;
  imagen?: string;
  /** Tooltip del chip (nombre de la compañía, capitalizado). */
  compania?: string;
  /** No capitalizar el texto del chip en el Monitor exterior (indicadores y divisas). */
  sinCapitalizar?: boolean;
  /** Muestra la «x» para retirarla de la experiencia (activos agregados con «Comparar»). */
  removible?: boolean;
  tipo?: TipoSerie;
}

/** Punto de una serie de la gráfica de líneas principal. ECharts grafica `value`. */
export interface PuntoLinea {
  value: number | null;
  /** Valor que muestra el tooltip (`null` = sin dato ese día: no se muestra). */
  valorTooltip?: number | null;
  /** El valor del tooltip es una tasa (se muestra con %). */
  esTasa?: boolean;
  rendimiento?: number | string | null;
  saldo?: number | string | null;
  /** Etiqueta de la fecha que muestra el tooltip (si falta, la del eje). */
  fecha?: string;
  /** Fecha ISO del punto (para el aviso de saldos y rendimientos). */
  fechaIso?: string;
  /** Nombre de la serie en el tooltip. */
  nombre: string;
  /** Fecha de corte del extracto ('' o '-' = sin fecha). */
  fechaExtracto?: string;
  imagen?: string;
  tipo?: TipoSerie;
  removible?: boolean;
}

/** Serie de la gráfica de líneas principal. */
export interface SerieLinea extends SerieLeyenda {
  datos: readonly PuntoLinea[];
  /** Línea suavizada (por defecto `true`). */
  suave?: boolean;
  /** Grosor de la línea punteada (CDT: 1.5). */
  grosor?: number;
}

/** Datos de saldo y rendimiento de un punto (el detalle que aparece tras la cuenta regresiva del tooltip). */
export interface DetallePunto {
  rendimiento?: number | string | null;
  saldo?: number | string | null;
  fechaExtracto?: string;
}

/** Serie de la gráfica de líneas compacta (tendencia y evolución de un activo). */
export interface SerieLineaCompacta {
  nombre: string;
  /** Valores graficados (normalizados). */
  datos: readonly number[];
  /** Valores reales que muestra el tooltip, por posición. */
  valoresReales: readonly number[];
  color: string;
  suave: boolean;
  simbolo?: string;
  tamanoSimbolo?: number;
}

/** Porción de la torta con título y tarjeta de tooltip (composición actual). */
export interface PorcionTorta {
  nombre: string;
  /** Porcentaje. */
  valor: number;
  color: string;
  /** Saldo en pesos que muestra el tooltip. */
  saldo?: number | string;
}

/** Porción de la torta compacta (tendencia y rebalanceos). */
export interface PorcionTortaCompacta {
  nombre: string;
  valor: number;
  color: string;
}
