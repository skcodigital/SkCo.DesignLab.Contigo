import { PestanaFicha, PestanaFichaId, PestanaProducto } from '../interfaces/pestanas';

export const PESTANA_POR_DEFECTO: PestanaFichaId = 'productos';

export const PESTANAS_FICHA: readonly PestanaFicha[] = [
  { id: 'copiloto', etiqueta: 'Planeación Pro' },
  { id: 'productos', etiqueta: 'Productos' },
  { id: 'datos', etiqueta: 'Datos cliente' },
  { id: 'documentos', etiqueta: 'Documentos' },
  { id: 'casos', etiqueta: 'Casos' },
  { id: 'recomendacion', etiqueta: 'Recomendación Prof.', titulo: 'Recomendación profesional' },
  { id: 'actividades', etiqueta: 'Actividades' },
];

export const PESTANAS_PRODUCTO: readonly PestanaProducto[] = [
  { id: 'comportamiento', etiqueta: 'Comportamiento' },
  { id: 'composicion', etiqueta: 'Composición y saldos' },
  { id: 'movimientos', etiqueta: 'Movimientos' },
  { id: 'detalles', etiqueta: 'Detalles' },
  { id: 'cuentas', etiqueta: 'Cuentas y débito' },
  { id: 'actividad', etiqueta: 'Actividad' },
];

/** Media query de la ficha en móvil (el prototipo usa 600px para la navegación por niveles). */
export const MQ_FICHA_MOVIL = '(max-width: 600px)';
