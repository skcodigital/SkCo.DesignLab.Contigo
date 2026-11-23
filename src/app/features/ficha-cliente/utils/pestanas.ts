import { PanelFicha, PestanaFichaId } from '../interfaces/pestanas';
import { PESTANA_POR_DEFECTO, PESTANAS_FICHA } from '../constants/pestanas';

/** Convierte el query param `?tab=` en una pestaña válida (si no existe, Productos). */
export function normalizarPestana(valor: string | null | undefined): PestanaFichaId {
  return PESTANAS_FICHA.find((p) => p.id === valor)?.id ?? PESTANA_POR_DEFECTO;
}

/** Las pestañas sin contenido propio comparten el panel vacío "en construcción". */
export function panelDePestana(id: PestanaFichaId): PanelFicha {
  return id === 'copiloto' || id === 'productos' ? id : 'otros';
}
