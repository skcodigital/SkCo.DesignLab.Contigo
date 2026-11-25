/**
 * Textos que arma el TS de las piezas comunes del Monitor (los del template viven en cada template).
 * Copiados de producción; los únicos propios del laboratorio están marcados.
 */
export const TEXTOS = {
  /** Propio del laboratorio: reemplaza descargar imágenes, PDF o archivos. */
  sinDescargas: 'En el laboratorio no se descargan archivos',

  graficas: {
    sinDatos: 'Sin datos disponibles',
    tituloPortafolios: 'Comportamiento de los portafolios',
    tituloContratos: 'Comportamiento de los contratos',
    tituloComposicion: 'Composición actual',
    guardarImagen: 'Save image',
    guardarComoImagen: 'Save as Image',
    sinDatosMensaje: 'No hay datos para mostrar.',
  },

  tooltip: {
    rendimiento: 'Rendimiento',
    saldo: 'Saldo',
    avisoCdt:
      'El valor mostrado para los CDT comparados corresponde al cálculo de la media móvil de las últimas 4 semanas.',
    avisoCorte: 'Los saldos y rendimientos mostrados corresponden a la última fecha de corte del mes anterior',
    cuentaRegresiva: (fecha: string, segundos: number) =>
      `Los saldos y rendimientos a la fecha ${fecha} se mostrarán en ${segundos}`,
    saldosAl: (fecha: string) => `Saldos y rendimientos al${fecha ? ` ${fecha}` : ''}.`,
  },

  normalizacionCdt: {
    aviso:
      'Para hacer comparable esta vista, Monitor muestra la rentabilidad móvil de los portafolios en el mismo plazo de la serie CDT/DTF seleccionada. Esta comparación se expresa en términos de tasa/rentabilidad y no en valor de unidad.',
    tooltip:
      'Serie normalizada para comparación con CDT/DTF. Corresponde a la rentabilidad móvil del portafolio en el plazo seleccionado, calculada a partir de su valor de unidad.',
  },

  inflacion: {
    nombre: 'Inflación',
    aviso:
      'Muestra la variación acumulada de la inflación para el período seleccionado, calculada a partir de la variación de la Unidad de Valor Real (UVR).',
  },

  leyenda: {
    retirar: 'Retirar de la experiencia',
  },

  tabla: {
    personalizar: 'Personalizar',
    personalizarTooltip: 'Personaliza las columnas que quieres visualizar en la tabla',
    copiar: 'Copiar tabla',
    graficar: 'Graficar tabla',
    graficarDeshabilitada: 'Muy pronto podrás graficar los portafolios en la gráfica',
    analizarConSami: 'Analizar con Sami',
    analizarConSamiDeshabilitada:
      'Muy pronto podrás usar la inteligencia artifical de SamiGPT para analizar esta información',
    copiada:
      "La tabla ha sido copiada al portapapeles, presiona las teclas 'ctrl+ v' para pegarla en cualquier aplicación.",
    accionNoDisponible: 'Acción no disponible',
    ir: 'Ir',
    /** Encabezado que la página del Monitor del cliente pone sobre la columna de puntos (con CSS). */
    portafolio: 'Portafolio',
  },

  periodos: {
    ultimoMes: 'Último mes',
    ultimos3Meses: 'Últimos 3 meses',
    ultimos6Meses: 'Últimos 6 meses',
    anioEnCurso: 'Año en curso (YTD)',
    ultimoAnio: 'Último año (últimos 12 meses)',
    anioAnterior: 'Año calendario anterior',
    ultimos3Anios: 'Últimos 3 años',
    ultimos5Anios: 'Últimos 5 años',
    personalizado: 'Personalizado',
    pildoraUltimoMes: 'Últ. mes',
    pildoraUltimos6Meses: 'Últ. 6 meses',
    pildoraUltimos12Meses: 'Últ. 12 meses',
  },

  definiciones: {
    valorInicial: 'Precio o valor del activo al inicio del periodo seleccionado.',
    valorFinal: 'Precio o valor del activo al cierre del periodo seleccionado.',
    variacion:
      'Diferencia porcentual entre el valor inicial y el final en el periodo. Refleja si el activo ganó o perdió valor.',
    volatilidad:
      'Medida del nivel de fluctuación del activo en el tiempo. A mayor volatilidad, mayor riesgo y también posibilidad de mayores retornos.',
    tea: 'Equivalente a la rentabilidad anual expresada como tasa compuesta. Facilita la comparación con otras alternativas de inversión.',
    retorno: 'Ganancia o pérdida total generada por el activo en el periodo, expresada en porcentaje.',
    /** La TIR se define distinto en cada vista. */
    tirCliente:
      'Tasa Interna de Retorno anualizada.\n\nMide el rendimiento efectivo anual de este activo considerando el saldo inicial, el saldo final y los flujos de caja realizados durante el período, como aportes y retiros.\n\nNo corresponde a una rentabilidad ajustada por inflación.\n\nFórmula conceptual: es la tasa que iguala el valor de los flujos de caja del período, considerando las fechas de cada movimiento.',
    tirExterior:
      'Tasa Interna de Retorno (TIR): Corresponde a la rentabilidad anualizada calculada con base en todos los flujos de caja (aportes, retiros y rendimientos) registrados en los productos de ahorro e inversión desde el inicio de la relación. Esta tasa permite medir el desempeño real de la inversión a lo largo del tiempo.',
  },

  rendimiento: {
    variacion: 'Variación',
    volatilidad: 'Volatilidad',
    retorno: 'Retorno',
  },

  selectorFechas: {
    placeholder: 'yyyy-mm-dd - yyyy-mm-dd',
  },
} as const;
