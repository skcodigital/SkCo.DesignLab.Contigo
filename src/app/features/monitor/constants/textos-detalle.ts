/**
 * Textos que arma el TS del detalle del Monitor (los del template viven en cada template). Copiados de producción;
 * los propios del laboratorio están marcados.
 */
export const TEXTOS_DETALLE = {
  pestanas: {
    desempeno: 'Desempeño',
    tendencia: 'Tendencia',
    rebalanceos: 'Rebalanceos',
    documentos: 'Documentos',
    disponiblePronto: '¡Disponible pronto!',
  },

  /** Prefijo del título del detalle de una mezcla. */
  mezclaInvested: 'Mezcla Invest-ed',

  /** «Desempeño del {etiqueta} en diferentes periodos.» */
  etiquetasActivo: {
    portafolio: 'portafolio',
    indicador: 'indicador',
    cdt: 'CDT',
    referencia: 'portafolio de la competencia',
  },

  documentos: {
    'ficha-tecnica': 'Ficha técnica',
    'informe-mensual': 'Informe mensual',
    prospecto: 'Prospecto',
  },

  tablas: {
    personalizaColumnas: 'Personaliza las columnas',
    copiarEnExcel: 'Copia la tabla y pégala en Excel.',
    periodo: 'Periodo',
    porcentaje: 'Porcentaje',
    nombre: 'Nombre',
    valorInicial: 'Valor inicial',
    valorFinal: 'Valor final',
    variacion: 'Variación',
    volatilidad: 'Volatilidad',
    tir: 'TIR',
    tea: 'TEA',
    retorno: 'Retorno',
  },

  comparacion: {
    verMas: 'Ver más',
    retirar: 'Retirar de la experiencia',
    tasaInicialCdt: 'Tasa promedio inicial del período (%)',
    tasaFinalCdt: 'Tasa promedio final del período (%)',
    variacionCdt: 'Variación en puntos porcentuales (p.p.)',
    retornoCdt: 'No aplica para CDTs de tasa',
    sinDatosGrafica: 'No hay datos disponibles para el elemento seleccionado.',
    sufijoMezcla: '(Invest-ed)',
  },

  riesgoRetorno: {
    ejeX: 'Riesgo (Volatilidad)',
    ejeY: 'Retorno (Rendimiento)',
    sinDatos: 'No hay datos disponibles',
    tooltip: (riesgo: string, retorno: string) => `Riesgo: ${riesgo}%<br/>Retorno: ${retorno}%`,
  },

  contratos: {
    sinProductos:
      'El cliente aún no tiene productos activos. Cuando los tenga, aparecerán en la gráfica. Mientras tanto, puedes agregar portafolios para comparar.',
  },

  listas: {
    todos: 'Todos',
    tipoAhorro: 'Tipo ahorro',
    desactualizado: (fecha: string) => `Datos desactualizados. Último reporte a la Superfinanciera: ${fecha}`,
    tooltipCdt: (plazo: string) => `Tasa promedio de captación de CDTs ${plazo}`,
    sinClasificar: 'Sin clasificar',
    sinInformacion: 'Sin información',
  },
} as const;
