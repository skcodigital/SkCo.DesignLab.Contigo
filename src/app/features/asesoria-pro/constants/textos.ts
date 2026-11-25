import { Decision, EstadoConv, Motivo, Preferencia, RespuestaRx } from '../interfaces/conversacion';
import { TipoCaja } from '../interfaces/calculo';

/** Partes del journey (barra de pasos y resumen). */
export const PARTES = ['Situación', 'Opciones', 'Decisión', 'Cierre'] as const;
/** Nombres de las etapas en la base de datos («Etapas conversadas»). */
/** «Etapas conversadas» del texto para el cliente: el paso 1 cubre la necesidad y la situación. */
export const ETAPAS_BD = [['Necesidad', 'Situación'], ['Opciones'], ['Decisión'], ['Cierre']] as const;

export const MOTIVO: Readonly<Record<Motivo, string>> = {
  liquidez: 'Necesidad de liquidez',
  vivienda: 'Compra de vivienda',
  objetivo: 'Objetivo personal',
  rendimientos: 'Rendimientos o expectativas no cumplidas',
  otro: 'Otro',
};

export const FUERA_DE_ALCANCE: Readonly<Record<'rendimientos' | 'otro', string>> = {
  rendimientos: 'Por ahora este acompañamiento solo abarca temas de liquidez, muy pronto contarás con una ruta específica para esta misión.',
  otro: 'Este acompañamiento cubre retiros por una necesidad de dinero (liquidez, vivienda u objetivo personal). Si el motivo es otro (otra entidad, el servicio o un cambio de portafolio), anótalo y cierra la conversación como fuera de alcance.',
};

export const ESTADO_CONV: Readonly<Record<EstadoConv, string>> = {
  'en-curso': 'En curso',
  'cerrada-seguimiento': 'Cerrado · en seguimiento',
  finalizada: 'Completado',
};

/** Estado de la conversación en el historial de la ficha: [etiqueta, tono]. */
export const TONO_HISTORIAL: Readonly<Record<EstadoConv, readonly [string, 'abierto' | 'seguimiento' | 'completado']>> = {
  'en-curso': ['En curso', 'abierto'],
  'cerrada-seguimiento': ['En seguimiento', 'seguimiento'],
  finalizada: ['Completado', 'completado'],
};

export const ADV_CORTA =
  'Desde Skandia no tenemos conocimiento del uso que el cliente dio a estos aportes como renta exenta en declaraciones pasadas.';
export const ADV_RESTO =
  ' Si los usó, lo que se retire sin cumplir requisitos (10 años de permanencia, cumplimiento de requisitos de pensión o vivienda) se convierte en ingreso en el año gravable del retiro.';
export const ADV_USTED =
  'Desde Skandia no tenemos conocimiento del uso que usted dio a estos aportes como renta exenta en declaraciones pasadas.' + ADV_RESTO;
export const GLOSA_RENTA_EXENTA =
  'Ingreso que no paga impuesto en la declaración de renta. Los aportes voluntarios pueden declararse como renta exenta, con límites y requisitos; eso solo lo saben usted o su contador.';
export const TIPO_CREDITO =
  'Crédito Impulso. Otorgado por el Fondo de Capital Privado Skandia Alternativo - Crédito Impulso administrado por Skandia Fiduciaria S.A.';
export const TASA_TXT = '17,78 % E.A.';

export const RX_TXT: Readonly<Record<RespuestaRx, string>> = { si: 'Sí', no: 'No', nosabe: 'No sabe' };

export const NOM_CAJA: Readonly<Record<TipoCaja, string>> = {
  retiro: 'Retiro',
  credito: 'Crédito Impulso',
  total: 'Retiro total',
  combo: 'Retiro + Crédito Impulso',
};

export const DEC_NOM: Readonly<Record<Decision, string>> = {
  retiro: 'Retiro',
  total: 'Retiro total',
  combo: 'Retiro + Crédito Impulso',
  credito: 'Crédito Impulso',
  noretira: 'No retira',
  pensara: 'Lo va a pensar',
  fuera: 'Fuera de alcance',
};

export const DEC_CAT: Readonly<Record<Decision, string>> = {
  retiro: 'Retiro parcial',
  total: 'Retiro total',
  combo: 'Retiro + Crédito Impulso',
  credito: 'Toma el Crédito Impulso',
  noretira: 'No retira',
  pensara: 'Lo va a pensar',
  fuera: 'Fuera de alcance',
};

export const PREF_A_DECISION: Readonly<Record<Preferencia, Decision>> = {
  retiro: 'retiro',
  total: 'total',
  combo: 'combo',
  credito: 'credito',
  noretira: 'noretira',
};

/** Herramientas para agendar la reunión de seguimiento. */
export const AGENDA_NOM = {
  google: 'Google Calendar',
  teams: 'Microsoft Teams',
  ios: 'Calendario de iOS',
} as const;

export const PROXIMOS_PASOS = {
  resumen: 'Enviar resumen de la conversación al cliente',
} as const;

/** Avisos, mensajes y etiquetas dinámicas que arma el TS. */
export const TEXTOS = {
  introCarga: 'Preparando tu misión con Óscar…',
  avisoDescarte: (nombre: string) => `Descartaste la misión de ${nombre.split(' ')[0]}. Registramos el motivo.`,
  sinMotivo: '—',
  misionEnCurso: (n: number) => `En curso · ${n} de 4 etapas`,
  /** Tarjeta de misión de la ficha (Planeación Pro). El dashboard tiene su propio texto. */
  guiaTitulo: (nombre: string) => `Acompaña a ${nombre.split(' ')[0]} a tomar las mejores decisiones a la hora de retirar.`,
  guiaTexto:
    'Si tu cliente ha decidido o tiene pensado realizar un retiro en Multifund puedes realizar acompañamiento a través de las etapas de Planeación Pro.',
  iniciar: 'Iniciar acompañamiento',
  continuar: 'Continuar acompañamiento',
  progreso: 'de 1 completada esta semana',
  conversacionDel: (fecha: string, min: number) => `Conversación del ${fecha}${min ? ` · ${min} min` : ''}`,
  tituloJourney: 'Acompañamiento al retirar',
  introJourney: 'Acompaña a tu cliente a tomar la mejor decisión para su retiro Multifund',
  pasoActual: ' (actual)',
  pasoCompleta: ' (completa)',
  pasoPendiente: ' (pendiente)',
  porDefinir: 'Por definir',
  fueraDeAlcance: (motivo: string) => `${motivo} (fuera de alcance)`,
  cierreFinalizado: 'Journey finalizado. Resultado observado: ',
  cierreCoincide: ' · coincide con la decisión.',
  cierreSeguimiento: (fecha: string) =>
    `Cierre registrado. El journey queda en seguimiento hasta el ${fecha} para observar el resultado en la transaccionalidad.`,
  viviendaSinRetencion: 'En este caso el retiro no causa retención contingente.',
  penSi: 'Con requisitos de pensión el retiro no causa retención contingente.',
  penSinMarca: 'En Contigo el cliente no tiene la marca de beneficio tributario.',
  ningunoCubre: (monto: string) => `Ningún contrato cubre ${monto}: elige uno y el Crédito Impulso puede cubrir lo que falta.`,
  alcanzaCredito: (puede: string, monto: string) =>
    `Hoy puede retirar ${puede}. Para cubrir ${monto}, la opción es el Crédito Impulso.`,
  anticipo: (ibc: boolean) =>
    `Lo que se retiene hoy es un anticipo: se descuenta del impuesto en la declaración de renta. El posible impuesto es una estimación orientativa${ibc ? ' con el IBC' : ''}: no reemplaza la declaración de renta.`,
  notaIbc: 'estimado con el IBC',
  notaRespuestas: 'estimado con sus respuestas',
  notaTarifa: (t: string) => `estimado con la tarifa de ${t}% ingresada por el asesor`,
  notaEspecial: 'con la condición especial',
  ajustar: 'Ajustar',
  tramRetiroT: '¿Cómo se tramita el retiro?',
  tramCreditoT: 'Solicitar el crédito',
  tramRetiroAria: 'Cómo se tramita el retiro',
  tramCreditoAria: 'Solicitud del crédito',
  tramNotaVivienda: 'Queda como acción pendiente al registrar el cierre.',
  tramNotaRetiro: 'Queda como acción pendiente al registrar el cierre. El retiro especificado tarda unos 3 días',
  tramNotaCredito: 'Queda como acción pendiente al registrar el cierre. Desde aquí todavía no se solicita.',
  porCertificar: (v: string) => `Aportes por certificar (${v}): no se pueden retirar hasta que se certifiquen.`,
  sigueInvertidoCerrado: 'Sigue invertido con lo que decidió: ',
  sigueInvertidoSi: 'Sigue invertido si decide: ',
  faltaTramRetiro: 'Elige cómo se tramita el retiro antes de registrar el cierre.',
  faltaTramCredito: 'Confirma la solicitud del crédito antes de registrar el cierre.',
  accionEspecificado: 'Retiro especificado: descargar formato',
  accionPortal: 'Tramitar por el portal',
  accionCredito: 'Solicitar el crédito',
  cierreRegistrado: (dec: string) => `Cierre registrado: ${dec}.`,
  cierrePendientes: (p: string) => ` Quedan pendientes: ${p}.`,
  llamadaAgendada: (via: string, cuando: string) => `Reunión de seguimiento agendada en ${via} para el ${cuando}`,
  registrarCierre: 'Registrar cierre',
  cierreHecho: 'Cierre registrado',
  copiar: 'Copiar',
  copiado: 'Copiado',
  noCopiado: 'No se pudo copiar',
  toastFuera: ['Acompañamiento finalizado', 'Queda registrado con el motivo: rendimientos o expectativas no cumplidas.'],
  toastRentaExentaPrimero: [
    'Primero responde la renta exenta',
    'Antes de ajustar el IBC, indica si el valor total del retiro se usó como renta exenta.',
  ] as const,
  toastCierrePrimero: ['Registra el cierre primero', 'El resumen se genera al registrar la decisión.'],
  toastEnviado: ['Resumen enviado al cliente', 'Queda registrado el envío; el envío real al cliente aún no está conectado.'],
  toastExcel: ['Descarga simulada', 'En el prototipo no se genera el Excel de aportes.'],
} as const;

/** Etiquetas que arma el TS en el panel de detalle (Contrato · Portafolios · Aportes · Cálculo · Crédito · Impuestos). */
export const TEXTOS_DETALLE = {
  verCalculo: 'Ver cómo se calcula',
  ocultarCalculo: 'Ocultar cálculo',
  beneficios: { si: 'Sí, al tope', no: 'No', nosabe: 'No sabe' },
  sinOtros: 'No tiene o no sabe',
  retiroTotal: 'retiro total',
  retiroPor: (monto: string) => `retiro por ${monto}`,
  hasta: (v: string) => `hasta ${v}`,
  rango: (a: string, b: string) => `${a} a ${b}`,
  estadoAporte: { ex: 'Exento', sr: 'Sin retención al retirar', cc: 'Con retención contingente' },
  tramoSale: { ex: 'exento', sr: 'sin retención', cc: 'con retención' },
  estimadoRespuestas: 'estimado con sus respuestas',
  estimadoIbc: 'estimado con el IBC',
} as const;

/** Etiquetas que arman las etapas Opciones y Acuerdo. */
export const TEXTOS_OPCIONES_ACUERDO = {
  rentaria: (meses: number) => (meses === 1 ? 'Rentaría en 1 mes' : `Rentaría en ${meses} meses`),
  hasta: (v: string) => `hasta ${v}`,
  rango: (a: string, b: string) => `${a} a ${b}`,
  faltan: 'No alcanza: faltan ',
  lineaRetiro: (etiqueta: string, recibe: string) => `${etiqueta} · recibe ${recibe}`,
  lineaCredito: (linea: string) => `Crédito Impulso · ${linea}`,
  enRiesgoSinSenal: '—',
  tramites: { portal: 'Tramitar por el portal', especificado: 'Retiro especificado', credito: 'Solicitar el crédito' },
} as const;
