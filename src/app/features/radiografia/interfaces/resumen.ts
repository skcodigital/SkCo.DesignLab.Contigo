import { ClaveLista, Direccion, Gestion, ParteTexto } from '@features/radiografia/interfaces/radiografia';

/** Tooltip de ayuda (`.tip-wrap`) junto a una etiqueta. */
export interface AyudaTip {
  /** Ícono de advertencia (`.tip--warning`) en lugar del de ayuda. */
  readonly aviso?: boolean;
  readonly etiqueta: string;
  readonly partes: readonly ParteTexto[];
}

/** Variación frente a octubre de 2025 (`nc-rx-variacion`). */
export interface VariacionKpi {
  readonly direccion: Direccion;
  readonly texto: string;
  readonly etiqueta: string;
  readonly detalle: string;
}

/** Línea del desglose de una tarjeta: "FP Asignado: **13,7%** · 171 clientes". */
export interface DesgloseKpi {
  readonly gestion: Gestion;
  readonly etiqueta: string;
  readonly valor: string;
  readonly resto: string;
}

/** Tarjeta (`.kpi`) del Resumen. */
export interface KpiResumen {
  readonly etiqueta: string;
  readonly ayuda?: AyudaTip;
  readonly valor: string;
  /** La cifra abre un listado de clientes. */
  readonly lista?: { readonly clave: ClaveLista; readonly etiqueta: string };
  readonly variacion?: VariacionKpi;
  readonly sub: string;
  readonly desglose?: readonly DesgloseKpi[];
}

export type IconoGrupo = 'savings' | 'insure';

export interface ProductoEmpresa {
  readonly nombre: string;
  /** Saldo o prima; sin monto en la vista bloqueada. */
  readonly monto?: string;
  readonly meta: string;
}

/** Grupo del acordeón "Productos de la empresa". */
export interface GrupoProductos {
  readonly titulo: string;
  readonly icono: IconoGrupo;
  readonly productos: readonly ProductoEmpresa[];
}

export type GestionLeyenda = Gestion | 'vacio';

export interface ItemLeyenda {
  readonly gestion: GestionLeyenda;
  readonly texto: string;
}

/** Ruta de penetración: clientes activos hoy por quién los atiende, hoy y meta. */
export interface RutaPenetracion {
  readonly aria: string;
  /** Ancho (%) de cada tramo; el orden coincide con la leyenda. */
  readonly segmentos: readonly { readonly gestion: Gestion; readonly ancho: number }[];
  readonly hoy: { readonly pos: number; readonly etiqueta: string };
  readonly meta: { readonly pos: number; readonly etiqueta: string };
  readonly leyenda: readonly ItemLeyenda[];
  readonly alerta: readonly ParteTexto[];
}

/** Candado de un tramo agregado: decorativo (director) o con etiqueta para lectores (FP Asignado). */
export type CandadoTramo = 'decorativo' | 'agregado';

export interface TramoLinea {
  readonly gestion: Gestion;
  readonly ancho: number;
  /** Valor pintado dentro del tramo (los tramos chicos van sin texto). */
  readonly valor?: string;
  readonly candado?: CandadoTramo;
}

export interface DetalleLinea {
  readonly gestion: Gestion;
  readonly etiqueta: string;
  readonly valor: string;
  readonly resto: string;
}

/** Línea de negocio de "Activos administrados por línea de negocio". */
export interface LineaNegocio {
  readonly nombre: string;
  readonly subtitulos: readonly string[];
  readonly clientes?: string;
  readonly total?: boolean;
  /** aria-label de la barra; también alimenta el tooltip (igual que el prototipo). */
  readonly aria: string;
  readonly tramos: readonly TramoLinea[];
  readonly detalle: readonly DetalleLinea[];
  readonly nota?: string;
}

/** Bloque de Relación integral. */
export interface RelacionIntegral {
  readonly titulo: string;
  readonly sub: string;
  readonly leyenda: readonly ItemLeyenda[];
  readonly lineas: readonly LineaNegocio[];
  readonly hallazgo: readonly ParteTexto[];
}
