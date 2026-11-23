// Textos que arma el TS de la radiografía. El copy estático vive en los templates.
import { PlanEmpresa, TabId, Vista } from '@features/radiografia/interfaces/radiografia';

/** Nombre de cada pestaña (título de "volver a las secciones" en celular y del informe PDF). */
export function nombrePestana(id: TabId, vista: Vista, plan: PlanEmpresa): string {
  switch (id) {
    case 'resumen':
      return 'Resumen';
    case 'dueno':
      return plan === 'sin' ? 'Asesores en la empresa' : 'Equipo asignado';
    case 'clientes':
      return vista === 'fp' ? 'Tus clientes' : 'Clientes';
    case 'relacion':
      return vista === 'fp' ? 'Tus líneas' : 'Relación integral';
    case 'plan':
      return 'Plan corporativo';
    case 'ruta':
      return 'Ruta comercial';
  }
}

export const TEXTOS = {
  ruta: {
    tituloCrear: 'Crear Ruta de Acción',
    tituloEditar: 'Editar ruta de acción',
    botonCrear: 'Crear Ruta de Acción',
    botonGuardar: 'Guardar cambios',
    enviada: 'Ruta de acción enviada',
    actualizada: 'Ruta de acción actualizada',
    verEnviada: 'Ver ruta de acción enviada',
    editadaSugerida: 'Editada · sugerida: ',
    metaSugerida: '· Meta sugerida',
    usarSugerida: 'Usar la sugerida',
    editada: 'editada',
    sinMetas: 'La ruta no tiene metas. Puedes añadirlas desde Editar ruta.',
    ultimaModificacion: 'Última modificación: ',
    porTi: 'ti',
    directorComercial: 'tu director comercial',
    fpAsignadoConRol: 'Juan Alberto Rodríguez González (FP Asignado)',
    estado: { curso: 'En curso', lograda: 'Lograda', descartada: 'Descartada' },
    descartarMeta: 'Descartar meta: ',
    nuevaMeta: 'Nueva meta: ',
    elFpAsignado: 'el FP Asignado',
    elFpAsignadoMayus: 'El FP Asignado',
  },
  lista: {
    mostrando: (n: number, total: number): string =>
      `Mostrando ${n} de ${total}. Descarga el listado para verlos todos.`,
  },
  sinPac: {
    sinFp: 'Sin FP Asignado',
    fpAsignado: 'FP Asignado: ',
    cambiarFp: 'Cambiar FP Asignado',
  },
} as const;
