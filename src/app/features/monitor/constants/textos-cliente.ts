/**
 * Textos que arma el TS de la página del Monitor del cliente (los del template viven en cada template). Copiados de
 * producción; el laboratorio no agrega textos propios aquí (las descargas usan `TEXTOS.sinDescargas`).
 */
export const TEXTOS_CLIENTE = {
  desdeElInicio: 'Desde el inicio',
  rangoDesconocido: 'Rango desconocido',
  tooltipPantallazo: 'Toma un pantallazo de toda la información visible',
  copiarTablaTooltip: 'Copiar Tabla',
  verMas: 'Ver más',
  retirar: 'Retirar de la experiencia',
  descargarInforme: 'Descargar informe',

  titulos: {
    contratos: 'Indicadores por contrato',
    portafolios: 'Indicadores por portafolio',
  },

  sinPortafolios:
    'El cliente aún no tiene portafolios activos. Cuando los tenga, aparecerán en la gráfica. Mientras tanto, puedes agregar portafolios para comparar.',
  sinDatosMezclas: 'No hay datos disponibles para las mezclas en el período seleccionado.',
  tirCero:
    'El valor de la TIR puede aparecer en cero cuando el cierre de unidades del día anterior no se ha efectuado correctamente o presenta alguna novedad en el procesamiento. Te recomendamos intentar consultar nuevamente más tarde.',

  disclaimers: {
    portafolios:
      'Los rendimientos mostrados corresponden a los generados dentro de cada portafolio, considerando únicamente el periodo en el que los recursos permanecieron invertidos en él. Si los recursos (capital y rendimientos) se trasladaron a otro portafolio, este movimiento se considera como una nueva entrada de dinero, reiniciando el cálculo de rendimientos desde cero en el nuevo portafolio. Es importante tener en cuenta que, en términos acumulados, los rendimientos totales podrían ser mayores al sumar los generados en los portafolios previos y actuales.',
    contratos:
      'El contenido de este mensaje no constituye una recomendación profesional para realizar inversiones, en los términos del artículo 2.40.1.1.2 del Decreto 2555 de 2010. El contenido enviado es descriptivo del comportamiento histórico de portafolios y/o índices y no es material promocional. La rentabilidad pasada no es indicativa de futuros resultados. Recuerde que usted tiene el derecho a recibir una recomendación profesional que tenga en cuenta su perfil de cliente y la conveniencia de los productos, previamente a la selección de productos de inversión simples y complejos.',
  },

  /** Título de la tabla de lo comparado: «Mezcla Invest-ed» y lo que haya, unido con comas y «e». */
  tituloMezclas: {
    mezclas: 'Mezcla Invest-ed',
    competencia: 'Competencia',
    cdt: 'CDTs',
    indicadores: 'Indicadores',
    union: 'e',
  },

  columnas: {
    personaliza: 'Personaliza las columnas',
    porcentaje: '%',
    porcentajeOpcion: 'Porcentaje %',
    valorUnidadInicial: 'Valor Unid. Inicial',
    valorUnidadFinal: 'Valor Unid. Final',
    variacion: 'Variación',
    tir: 'TIR',
    tea: 'TEA',
    rendimientos: 'Rendimientos',
    saldoActual: 'Saldo actual',
    saldo: 'Saldo',
    portafolios: 'Portafolios',
    fechaPrimeraCompra: 'Fecha 1ª compra',
    vupCompra: 'VUP Compra',
    vupVenta: 'VUP Venta',
    valorUnidadActual: 'Valor unidad actual',
    rendimientoAcumulado: 'Rendimiento acumulado',
    contribucionAcumulado: 'Contribución rendimiento acumulado',
    rendimientoPeriodo: 'Rendimiento del período',
    contribucionPeriodo: 'Contribución al rendimiento %',
    retorno: 'Retorno %',
    transacciones: 'Transacciones',
    valorUnidad: 'Valor Unidad',
    fechaCorte: 'Fecha de corte',
  },

  ayudasContratos: {
    valorInicial:
      'Valor de una unidad del contrato en la fecha inicial. Este valor se utiliza como referencia para calcular cómo ha cambiado el precio del contrato hasta la fecha final.',
    valorFinal:
      'Valor actual de una unidad del contrato en la fecha final. Este valor refleja la evolución del contrato en el mercado desde la fecha inicial.',
    variacion:
      'Cambio porcentual del valor del contrato entre la fecha inicial y la fecha final. Indica el rendimiento del contrato durante este periodo. Se calcula como: (Valor final − Valor inicial) / Valor inicial.',
    tir: 'Tasa Interna de Retorno anualizada.\n\nMide el rendimiento efectivo anual de este contrato considerando el saldo inicial, el saldo final y los flujos de caja realizados durante el período, como aportes y retiros.\n\nNo corresponde a una rentabilidad ajustada por inflación.\n\nFórmula conceptual: es la tasa que iguala el valor de los flujos de caja del período, considerando las fechas de cada movimiento.',
    rendimientos:
      'Ganancia o pérdida generada por la inversión del cliente en este contrato, expresada en valor monetario. Se calcula como: Valor actual de la inversión − Capital total aportado.',
    saldo:
      'Valor actual de la inversión del cliente en este contrato. Se calcula como: Número de unidades actuales × Valor de unidad final.',
  },

  ayudasPortafolios: {
    fechaPrimeraCompra:
      'Fecha en la que el cliente realizó su primer aporte en este portafolio. Desde este momento comienza el historial de inversión del cliente en el portafolio.',
    vupCompra:
      'Valor promedio al que el cliente ha comprado unidades en este portafolio. Se calcula como un promedio ponderado, donde las transacciones de mayor monto tienen mayor impacto en el resultado. Este indicador permite identificar el costo promedio de entrada del cliente y compararlo contra el valor actual del portafolio para entender si la posición se encuentra en ganancia o pérdida potencial.',
    vupVenta:
      'Valor promedio al que el cliente ha vendido o retirado unidades de este portafolio. Se calcula como un promedio ponderado, donde las transacciones de mayor monto tienen mayor impacto en el resultado. Este indicador permite analizar a qué niveles el cliente ha realizado retiros históricamente y comparar si sus ventas se realizaron por encima o por debajo de su costo promedio de compra.',
    valorUnidad: 'Valor de la unidad a la fecha de corte.',
    saldo:
      'Valor actual de la inversión del cliente en este portafolio. Se calcula como: Número de unidades actuales × Valor de unidad final.',
    rendimientoAcumulado:
      'Ganancia o pérdida monetaria acumulada generada por este portafolio.\n\nConsolida el resultado histórico del portafolio a nivel cliente, independientemente de los contratos donde haya tenido participación.\n\nConsidera el saldo actual, los aportes y retiros históricos, y el saldo inicial correspondiente.\n\nFórmula:\nRendimiento acumulado = Saldo actual + Retiros acumulados − Aportes acumulados − Saldo inicial\n\nEste indicador no depende del período seleccionado; refleja el resultado acumulado desde el inicio de la relación del cliente con el portafolio.',
    contribucionAcumulado:
      'Porcentaje del rendimiento acumulado total del cliente que fue generado por este portafolio.\n\nFórmula:\nRendimiento acumulado del portafolio = Saldo actual + Retiros acumulados − Aportes acumulados − Saldo inicial\nRendimiento acumulado total del cliente = Suma del rendimiento acumulado de todos los portafolios del cliente\nContribución al rendimiento acumulado % = Rendimiento acumulado del portafolio / Rendimiento acumulado total del cliente × 100\n\nEste indicador permite identificar qué portafolios explican en mayor medida la ganancia o pérdida acumulada total del cliente, independientemente del período seleccionado.',
    rendimientoPeriodo:
      'Ganancia o pérdida generada por este portafolio durante el período seleccionado. El cálculo considera el saldo al inicio del período, los aportes y retiros realizados dentro de la ventana de tiempo, y el saldo al cierre del período. Permite entender cuánto valor generó o perdió el portafolio en ese intervalo específico.',
    contribucionPeriodo:
      'Porcentaje del rendimiento total del cliente que fue generado por este portafolio durante el período seleccionado.\n\nFórmula:\nRendimiento del portafolio = Saldo final + Retiros − Aportes − Saldo inicial\nRendimiento total del cliente = Suma del rendimiento de todos los portafolios del cliente\nContribución al rendimiento % = Rendimiento del portafolio / Rendimiento total del cliente × 100\n\nEste indicador permite identificar qué portafolios explican en mayor medida la ganancia o pérdida total del cliente en el período seleccionado.',
    retorno:
      'Retorno porcentual del portafolio durante el período seleccionado.\n\nMide cuánto representó el rendimiento generado frente al capital neto invertido en el período.\n\nFórmulas:\nRendimiento del período = Saldo final + Retiros − Aportes − Saldo inicial\nCapital invertido = Saldo inicial + Aportes − Retiros\nRetorno % = (Rendimiento del período / Capital invertido) × 100\n\nEste indicador no corresponde a una TIR ni a una rentabilidad anualizada.',
    tea: 'Tasa Efectiva Anual. Rentabilidad anual estimada de la inversión, expresada en %. Indica cuánto habría crecido la inversión en un año si el rendimiento observado durante el periodo analizado se mantuviera constante. Se utiliza para comparar inversiones en términos anuales.',
    tir: 'Tasa Interna de Retorno anualizada.\n\nMide el rendimiento efectivo anual del portafolio de este cliente considerando el saldo inicial, el saldo final y los flujos de caja realizados durante el período, como aportes y retiros.\n\nNo corresponde a una rentabilidad ajustada por inflación.\n\nFórmula conceptual: es la tasa que iguala el valor de los flujos de caja del período, considerando las fechas de cada movimiento.',
    transacciones:
      'Número total de movimientos realizados por el cliente en este portafolio. Incluye operaciones como aportes, retiros o traslados entre portafolios.',
  },

  filtro: {
    categorias: 'Categorias',
    productos: 'Productos',
    seleccionarTodo: 'Seleccionar todo',
    deseleccionarTodo: 'Deseleccionar todo',
    /** Categorías del catálogo de productos (`CATEGORIAS`). */
    categoriasProducto: [
      { nombre: 'Ahorro e inversión', valor: 'V' },
      { nombre: 'Obligatorios', valor: 'O' },
      { nombre: 'Ahorro e inversión (FICS)', valor: 'F' },
      { nombre: 'Seguros', valor: 'S' },
    ],
    /** Productos del catálogo (`PRODUCTOS`) que tiene el cliente de ejemplo. */
    catalogo: [
      { codigo: 'MFUND', descripcion: 'Fondo Voluntario de Pensión Skandia Multifund', categoria: 'V' },
      { codigo: 'FCO', descripcion: 'Fondo de Inversión Colectiva Skandia Efectivo', categoria: 'F' },
    ],
  },

  comparar: {
    clasificacion: 'Clasificación',
    perfil: 'Perfil',
    otros: 'Otros',
    desactualizado: (fecha: string) => `Datos desactualizados. Última fecha de valor unitario: ${fecha}`,
  },

  transacciones: {
    columnas: {
      fecha: 'Fecha',
      contrato: 'Contrato',
      unidades: 'No. Unidades',
      tipo: 'Tipo transacción',
      valorUnidad: 'Valor unidad',
      total: 'Total',
    },
    valor: 'Valor - ',
    retiro: 'Retiro',
    aporte: 'Aporte',
    tendenciaSuperior: 'Línea de Tendencia Sup',
    tendenciaInferior: 'Línea de Tendencia Inf',
    promedioCompra: 'Valor promedio de compra',
    promedioVenta: 'Valor promedio de venta',
    explicacionPromedios: [
      'Valor promedio al que el cliente ha comprado y vendido unidades en este portafolio.',
      'Se calcula considerando todas sus transacciones, dando mayor peso a las de mayor monto.',
      'Permite identificar si el valor actual del portafolio está por encima o por debajo de sus precios promedio de entrada y salida.',
    ],
    guardarImagen: 'Save as Image',
  },
} as const;
