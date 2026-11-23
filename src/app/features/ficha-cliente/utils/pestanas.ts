import { PanelFicha, PanelProducto, PestanaFichaId, PestanaProducto, PestanaProductoId } from '../interfaces/pestanas';
import { DetalleProducto, TipoProducto } from '../interfaces/productos';
import { PESTANA_POR_DEFECTO, PESTANAS_FICHA, PESTANAS_PRODUCTO } from '../constants/pestanas';

/** Convierte el query param `?tab=` en una pestaña válida (si no existe, Productos). */
export function normalizarPestana(valor: string | null | undefined): PestanaFichaId {
  return PESTANAS_FICHA.find((p) => p.id === valor)?.id ?? PESTANA_POR_DEFECTO;
}

/** Las pestañas sin contenido propio comparten el panel vacío "en construcción". */
export function panelDePestana(id: PestanaFichaId): PanelFicha {
  return id === 'copiloto' || id === 'productos' ? id : 'otros';
}

/** Convierte el query param `?tipo=` de la ficha del producto (por defecto, Multifund). */
export function normalizarTipoProducto(valor: string | null | undefined): TipoProducto {
  return valor === 'fic' ? 'fic' : 'mf';
}

/** Secciones que muestra cada producto, con la etiqueta de Cuentas propia del producto. */
export function pestanasDeProducto(producto: DetalleProducto): PestanaProducto[] {
  return PESTANAS_PRODUCTO.filter((p) => !p.solo || p.solo === producto.tipo).map((p) =>
    p.id === 'cuentas' ? { ...p, etiqueta: producto.etiquetaCuentas } : p,
  );
}

/** Composición tiene panel propio; Movimientos solo en el FIC; el resto, panel vacío. */
export function panelDeProducto(id: PestanaProductoId, tipo: TipoProducto): PanelProducto {
  if (id === 'composicion') return 'composicion';
  return id === 'movimientos' && tipo === 'fic' ? 'movimientos' : 'otros';
}
