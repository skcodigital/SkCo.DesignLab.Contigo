import { NombreIcono } from '@features/monitor/interfaces/comunes';
import { DefinicionActivo, MezclaInversion, ReferenciaSeleccionada } from '@features/monitor/interfaces/detalle';

/**
 * Modelos de vista de la página del Monitor exterior (`/monitor`): lo elegido en «Selecciona y compara», los
 * catálogos de cada lista y la conversación del asistente. Son modelos de vista en español, no contratos de
 * servicios.
 */

// ───────────────────────────── Listas de «Selecciona y compara» ─────────────────────────────

/** Portafolio Skandia de la lista «Portafolios SK» con sus filtros. */
export interface PortafolioLista {
  /** Clave del activo comparable (la de `DefinicionActivo`). */
  clave: string;
  nombre: string;
  clasificacion: string;
  /** Perfil de riesgo; `NA` se muestra como «Otros». */
  perfil: string;
  /** Última fecha de valor de unidad (ISO): con más de 30 días está desactualizado. */
  ultimaFecha: string;
}

/** Filtros de la lista de portafolios. */
export interface FiltrosPortafolios {
  /** Valor de la lista «Clasificación» ('' o el texto de la opción vacía = todas). */
  clasificacion: string | number;
  perfil: string | number;
  termino: string;
  mostrarInactivos: boolean;
}

/** Tipo de un elemento de las listas «Divisas» e «Indicadores». */
export type TipoIndicador = 'divisa' | 'indicador';

/** Divisa o indicador elegido, en el orden en que se eligió. */
export interface IndicadorSeleccionado {
  tipo: TipoIndicador;
  clave: string;
}

/** Pestañas de la lista de indicadores. */
export type PestanaIndicadores = 'economicos' | 'cdts';

/**
 * Lo elegido en «Selecciona y compara». Cada lista guarda sus claves en el orden en que se marcaron; la
 * comparación las arma por grupos (portafolios, divisas, indicadores, mezclas, competencia y CDT).
 */
export interface SeleccionExterior {
  portafolios: readonly string[];
  indicadores: readonly IndicadorSeleccionado[];
  /** Ids de las mezclas Invest-ed. */
  mezclas: readonly number[];
  referencias: readonly ReferenciaSeleccionada[];
  /** Subcuentas de los plazos CDT. */
  cdts: readonly string[];
}

/** Todo lo que se puede comparar en el Monitor exterior. */
export interface CatalogoExterior {
  portafolios: readonly DefinicionActivo[];
  /** Divisas e indicadores. */
  indicadores: readonly DefinicionActivo[];
  /** Catálogo de mezclas (id y nombre) y sus activos comparables (clave = nombre). */
  mezclas: readonly MezclaInversion[];
  mezclasComparables: readonly DefinicionActivo[];
  /** Portafolios de la competencia (clave `<compañía>_<portafolio>`). */
  referencias: readonly DefinicionActivo[];
  /** Plazos CDT (clave `CDT-<subcuenta>`). */
  cdts: readonly DefinicionActivo[];
}

// ───────────────────────────── Página ─────────────────────────────

/**
 * Estado de ejemplo que se pide por la URL (`/monitor?estado=…`): `error` pinta los errores de los servicios,
 * `ejemplo` arranca con una selección y `ejemplo-cdt` con la misma selección comparada contra un CDT.
 */
export type EstadoExterior = 'error' | 'ejemplo' | 'ejemplo-cdt';

// ───────────────────────────── Asistente ─────────────────────────────

export type RemitenteMensaje = 'usuario' | 'asistente';

/** Mensaje de la conversación del asistente. */
export interface MensajeAsistente {
  id: number;
  remitente: RemitenteMensaje;
  texto: string;
}

/** Acción rápida de la bienvenida del asistente. */
export interface AccionRapida {
  clave: string;
  texto: string;
  icono: NombreIcono;
}

/** Respuesta fija de ejemplo del asistente, con el formato de producción (mensaje y análisis opcional). */
export interface RespuestaAsistente {
  /** Palabras que la eligen en el texto de la persona (sin tildes, en minúscula). */
  palabras: readonly string[];
  mensaje: string;
  resumen?: string;
  analisis?: string;
  recomendacion?: string;
}
