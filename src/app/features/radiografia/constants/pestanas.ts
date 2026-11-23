import { PlanEmpresa, TabId, Vista } from '@features/radiografia/interfaces/radiografia';

export interface DefPestana {
  readonly id: TabId;
  /** Vistas en las que se ve la pestaña (`data-only` del prototipo). */
  readonly vistas: readonly Vista[];
}

const TODAS: readonly Vista[] = ['director', 'dueno', 'fp'];

/** Pestañas en el orden del prototipo, con las vistas que las ven según la empresa. */
export const PESTANAS: Readonly<Record<PlanEmpresa, readonly DefPestana[]>> = {
  con: [
    { id: 'resumen', vistas: TODAS },
    { id: 'dueno', vistas: ['director'] },
    { id: 'clientes', vistas: TODAS },
    { id: 'relacion', vistas: TODAS },
    { id: 'plan', vistas: TODAS },
    { id: 'ruta', vistas: ['director', 'dueno'] },
  ],
  sin: [
    { id: 'resumen', vistas: TODAS },
    { id: 'dueno', vistas: ['director'] },
    { id: 'clientes', vistas: TODAS },
    { id: 'relacion', vistas: TODAS },
    { id: 'plan', vistas: TODAS },
    { id: 'ruta', vistas: TODAS },
  ],
};

export const TAB_IDS: readonly TabId[] = ['resumen', 'dueno', 'clientes', 'relacion', 'plan', 'ruta'];
