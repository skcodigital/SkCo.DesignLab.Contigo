import {
  Alineacion,
  FilaTabla,
  IconoTabla,
  OpcionesTabla,
  PosicionIcono,
  TipoColumna,
  ValoresCasillas,
  VistaMonitor,
} from '@features/monitor/interfaces/comunes';
import { formatearFechaCorta, formatearNumero } from '@features/monitor/utils/formatos';

/**
 * Lógica pura de la tabla del Monitor: ordenamiento (`SortingTableService`), paginador, formato de celdas y el
 * texto que se copia al portapapeles.
 */

export function compararTextos(a: string, b: string, ascendente: boolean): number {
  return ascendente ? a.localeCompare(b) : b.localeCompare(a);
}

export function compararNumeros(a: number, b: number, ascendente: boolean): number {
  return ascendente ? a - b : b - a;
}

export function compararFechas(a: Date, b: Date, ascendente: boolean): number {
  return ascendente ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
}

const TIPOS_NUMERICOS: readonly (TipoColumna | undefined)[] = ['numero', 'dinero', 'porcentaje'];

/**
 * Copia ordenada de las filas por una columna, como `sortData` de producción: números con `Number`, texto y
 * acción con `localeCompare`, fechas con `Date` ('-' o '' cuentan como `ahora`). Sin tipo conocido no reordena.
 */
export function ordenarFilas(
  filas: readonly FilaTabla[],
  clave: string,
  tipo: TipoColumna | undefined,
  ascendente: boolean,
  ahora: Date = new Date(),
): FilaTabla[] {
  const copia = [...filas];
  if (TIPOS_NUMERICOS.includes(tipo)) {
    return copia.sort((a, b) => compararNumeros(Number(a[clave]), Number(b[clave]), ascendente));
  }
  if (tipo === 'texto' || tipo === 'accion') {
    return copia.sort((a, b) => compararTextos(String(a[clave] ?? ''), String(b[clave] ?? ''), ascendente));
  }
  if (tipo === 'fecha') {
    const fecha = (v: unknown): Date => (v === '-' || v === '' ? ahora : new Date(String(v)));
    return copia.sort((a, b) => compararFechas(fecha(a[clave]), fecha(b[clave]), ascendente));
  }
  return copia.sort(() => (ascendente ? 1 : 0));
}

/** Páginas que muestra el paginador: todas si son 3 o menos; si no, primera, «...», vecinas, «...» y última. */
export function paginasPaginador(actual: number, total: number): (number | '...')[] {
  const paginas: (number | '...')[] = [];
  if (total <= 3) {
    for (let i = 1; i <= total; i++) {
      paginas.push(i);
    }
    return paginas;
  }
  if (actual > 2) {
    paginas.push(1, '...');
  }
  if (actual > 1) {
    paginas.push(actual - 1);
  }
  paginas.push(actual);
  if (actual < total) {
    paginas.push(actual + 1);
  }
  if (actual < total - 1) {
    paginas.push('...', total);
  }
  return paginas;
}

/** Filas de la página actual (todas si la tabla no tiene paginador). */
export function filasDePagina<T>(filas: readonly T[], pagina: number, tamano: number, conPaginador: boolean): T[] {
  if (!conPaginador) {
    return [...filas];
  }
  const inicio = (pagina - 1) * tamano;
  return filas.slice(inicio, inicio + tamano);
}

/** Tamaños del selector de página: los base más el total de filas, ordenados (como producción). */
export function tamanosPagina(base: readonly number[], totalFilas: number): number[] {
  const tamanos = base.includes(totalFilas) ? [...base] : [...base, totalFilas];
  return tamanos.sort((a, b) => a - b);
}

/**
 * Texto de una celda según el tipo de columna (`formatData` de producción). La tabla siempre formatea en `en-US`
 * (`$ 1,234.50`); el porcentaje lleva hasta 3 decimales en el Monitor del cliente y 2 en el exterior. Sin valor
 * muestra '-', o nada si la celda tiene ícono.
 */
export function formatearCelda(
  valor: unknown,
  tipo: TipoColumna | undefined,
  vista: VistaMonitor,
  conIcono = false,
): string {
  if (valor === '-') {
    return '-';
  }
  if (!valor && String(valor) !== '0') {
    return conIcono ? '' : '-';
  }
  switch (tipo) {
    case 'fecha':
      return formatearFechaCorta(String(valor));
    case 'dinero':
      return `$ ${formatearNumero(valor as number | string, 2, 2, 'en-US') || String(valor)}`;
    case 'porcentaje':
      return `${formatearNumero(valor as number | string, 0, vista === 'cliente' ? 3 : 2, 'en-US') || String(valor)} %`;
    case 'numero':
      return formatearNumero(valor as number | string, 0, 2, 'en-US') || String(valor);
    default:
      return String(valor);
  }
}

/** Valor de una celda tal como se pega en Excel (la tabla copia los números sin formato). */
function celdaParaCopiar(texto: string, tipo: TipoColumna | undefined, vista: VistaMonitor): string {
  if (vista === 'cliente' && tipo === 'texto') {
    // Los textos solo numéricos van como fórmula de texto para que Excel no los vuelva notación científica.
    return /^\d+$/.test(texto) ? `="${texto}"` : texto;
  }
  const esPorcentaje = texto.includes('%');
  const numero = Number(texto.replace(/[$\s%]/g, '').replace(/,/g, ''));
  if (Number.isNaN(numero)) {
    return texto;
  }
  if (vista === 'cliente') {
    return esPorcentaje ? (numero / 100).toString() : numero.toString();
  }
  return esPorcentaje ? `${numero.toFixed(2)}%` : numero.toFixed(2);
}

/**
 * Texto separado por tabuladores que «Copiar tabla» deja en el portapapeles: encabezados y celdas ya formateadas
 * (sin la columna de índice ni las de acciones).
 */
export function textoParaCopiar(
  encabezados: readonly string[],
  filas: readonly (readonly string[])[],
  tipos: readonly (TipoColumna | undefined)[],
  vista: VistaMonitor,
): string {
  let texto = `${encabezados.join('\t')}\n`;
  for (const fila of filas) {
    texto += `${fila.map((celda, i) => celdaParaCopiar(celda.trim(), tipos[i], vista)).join('\t')}\n`;
  }
  return texto;
}

// ───────────────────────────── Columnas y filas de la vista ─────────────────────────────

/** Columna de datos visible: su posición en `claves` (`indice`) y entre las visibles (`posicion`). */
export interface ColumnaDato {
  tipo: 'dato';
  clave: string;
  indice: number;
  posicion: number;
}

/** Columna de la tabla en el orden en que se pinta. */
export type ColumnaTabla =
  | { tipo: 'indice' }
  | { tipo: 'accionesInicio' }
  | ColumnaDato
  | { tipo: 'accionesFin' }
  | { tipo: 'acciones' };

export interface ColumnasTabla {
  datos: ColumnaDato[];
  encabezado: ColumnaTabla[];
  cuerpo: ColumnaTabla[];
}

/**
 * Columnas que se pintan. Con `visibles` solo van las claves marcadas (una clave sin entrada no se ve, como
 * producción). El encabezado y el cuerpo llevan órdenes distintos, como producción: arriba el índice va antes de
 * las acciones por fila y la columna verde de último; abajo es al revés.
 */
export function columnasTabla(o: OpcionesTabla, visibles: ValoresCasillas | null): ColumnasTabla {
  const datos: ColumnaDato[] = [];
  o.claves.forEach((clave, indice) => {
    if (!visibles || visibles[clave]) {
      datos.push({ tipo: 'dato', clave, indice, posicion: datos.length });
    }
  });
  const indice: ColumnaTabla[] = o.mostrarColumnaIndice ? [{ tipo: 'indice' }] : [];
  const inicio: ColumnaTabla[] = o.conAccionesFila && o.posicionAccionesFila === 'inicio' ? [{ tipo: 'accionesInicio' }] : [];
  const fin: ColumnaTabla[] = o.conAccionesFila && o.posicionAccionesFila === 'fin' ? [{ tipo: 'accionesFin' }] : [];
  const acciones: ColumnaTabla[] = o.conAcciones ? [{ tipo: 'acciones' }] : [];
  return {
    datos,
    encabezado: [...indice, ...inicio, ...datos, ...fin, ...acciones],
    cuerpo: [...inicio, ...indice, ...datos, ...acciones, ...fin],
  };
}

/** Tipo de la columna `i` (sin `tiposColumna`, texto). */
export function tipoColumna(o: OpcionesTabla, i: number): TipoColumna | undefined {
  return o.tiposColumna ? o.tiposColumna[i] : 'texto';
}

/** Alineación de la columna `i`: centrada sin `alineaciones`; `null` si la lista no la trae. */
export function alineacionColumna(o: OpcionesTabla, i: number): Alineacion | null {
  return o.alineaciones ? (o.alineaciones[i] ?? null) : 'center';
}

export interface CeldaVista {
  texto: string;
  subtitulo: string | null;
  icono: IconoTabla | null;
  posicionIcono: PosicionIcono;
  tooltipIcono: string;
  tooltip: string;
}

export interface FilaVista {
  fila: FilaTabla;
  indice: number;
  celdas: CeldaVista[];
}

/** Celdas ya formateadas (con ícono, tooltip y subtítulo) de las filas de la página. */
export function vistaFilas(
  o: OpcionesTabla,
  filas: readonly FilaTabla[],
  datos: readonly ColumnaDato[],
  vista: VistaMonitor,
): FilaVista[] {
  return filas.map((fila, indice) => {
    const iconos = o.iconosColumna?.(fila) ?? [];
    const posiciones = o.posicionIconosColumna?.(fila) ?? [];
    const tooltips = o.tooltipsIconosColumna?.(fila) ?? [];
    const celdas = datos.map(({ clave, indice: i }) => {
      const valor = fila[clave];
      const propio = o.formatoCelda?.(fila, clave, valor);
      return {
        texto: propio ?? formatearCelda(valor, tipoColumna(o, i), vista, !!iconos[i]),
        subtitulo: o.subtituloCelda?.(fila, clave) ?? null,
        icono: iconos[i] ?? null,
        posicionIcono: posiciones[i] ?? '',
        tooltipIcono: tooltips[i] ?? '',
        tooltip: o.tooltipCelda?.(fila, clave) ?? '',
      };
    });
    return { fila, indice, celdas };
  });
}
