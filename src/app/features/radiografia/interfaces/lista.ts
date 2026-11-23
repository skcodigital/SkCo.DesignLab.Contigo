import { Gestion } from '@features/radiografia/interfaces/radiografia';

/** Fila de un listado: quién lo gestiona y las celdas (la primera es el nombre del cliente). */
export interface FilaLista {
  readonly gestion: Gestion;
  readonly celdas: readonly string[];
}

/** Listado de ejemplo ("de la cifra al listado de clientes"). */
export interface DefLista {
  readonly titulo: string;
  readonly sub: string;
  readonly total: number;
  readonly dueno: number;
  readonly agencia: number;
  readonly otras: number;
  /** El director ve todos los clientes de la empresa (sin agregados ni candado). */
  readonly todosDirector?: boolean;
  readonly cols: readonly string[];
  readonly filas: readonly FilaLista[];
}

export type FiltroLista = 'todos' | Gestion;

/** Resumen sobre la tabla ("FP Asignado: 171 · Agencia Norte: 30 · …"). */
export interface ItemResumenLista {
  readonly gestion: Gestion;
  readonly etiqueta: string;
  readonly valor: number;
  readonly sufijo?: string;
  readonly apagado?: boolean;
}

/** Lo que pinta el panel lateral para una lista, una vista y una empresa. */
export interface VistaLista {
  readonly titulo: string;
  readonly sub: string;
  readonly cols: readonly string[];
  readonly filas: readonly FilaLista[];
  readonly resumen: readonly ItemResumenLista[];
  /** Mensaje del candado (clientes de otros asesores): número en negrita + resto del texto. */
  readonly candado: { readonly cifra: string; readonly texto: string } | null;
  readonly conFiltro: boolean;
  readonly filtroInicial: FiltroLista;
  /** Lista como modal centrada (`drawer--full`). */
  readonly completa: boolean;
  /** Total contra el que se calcula "Mostrando X de Y"; `null` = según el filtro. */
  readonly totalVisible: number | null;
  readonly dueno: number;
  readonly agencia: number;
  readonly otras: number;
}
