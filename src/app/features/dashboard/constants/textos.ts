/** Textos que arma el TS del dashboard (avisos, etiquetas dinámicas). Copiados tal cual del prototipo. */
export const TEXTOS = {
  avisos: {
    soloLectura: 'Vista de solo lectura: la conversación la inicia el asesor.',
    soloConversacionOscar: 'En el prototipo solo la misión de Óscar tiene la conversación completa.',
    soloFichaOscar: 'En el prototipo solo está disponible la ficha de Óscar.',
    completada: 'Esta misión ya está completada. Su acuerdo quedó registrado en la ficha del cliente.',
    descartada: (nombre: string) => `Descartaste la misión de ${nombre}. Registramos el motivo.`,
    todasLasMisiones: 'La sección general de Planeación Pro está en diseño.',
    agregarModulo: 'Agregar módulos llega con Personalizar.',
  },
  planeacion: {
    quienPropio: 'Tus misiones esta semana',
    quienAsesor: (nombre: string) => `Misiones de ${nombre} esta semana`,
    vacioSinMisiones: 'Esta semana no hay misiones sugeridas.',
    vacioCompletasPropio: 'Completaste tus misiones de la semana. El lunes llegan las siguientes.',
    vacioCompletasAsesor: 'Ya atendió las misiones de esta semana.',
    progresoPre: { propio: 'Has completado', asesor: 'Ha completado' },
    progresoAria: (pre: string, n: number, total: number) => `${pre} ${n} de ${total} misiones de la semana`,
    chip: { alta: 'Prioridad alta', seg: 'Misión iniciada' },
    ampliar: { aria: 'Ampliar módulo', tooltip: 'Ampliar' },
    reducir: { aria: 'Reducir módulo', tooltip: 'Reducir' },
    guia: (nombre: string) => `Revisa con ${nombre} su portafolio y sus objetivos.`,
  },
  ojo: {
    mostrar: 'Mostrar saldos',
    ocultar: 'Ocultar saldos',
    ariaMisiones: { mostrar: 'Mostrar saldos de las misiones', ocultar: 'Ocultar saldos de las misiones' },
    ariaLogros: { mostrar: 'Mostrar saldos de logros', ocultar: 'Ocultar saldos de logros' },
  },
  logros: {
    asesorVacio: 'Asesor',
    mesAria: (mes: string, anio: number) => `${mes} ${anio}`,
    puntoAria: (mes: string, valor: string) => `${mes}: ${valor}`,
    saldoOculto: 'saldo oculto',
    donaTooltip: (porcentaje: number) => `${porcentaje}% de tus clientes`,
  },
} as const;
