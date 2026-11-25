import { Conversacion, EstadoConversacion } from '../interfaces/conversacion';

/** «Hoy» del prototipo (16 nov 2026). */
export const HOY = new Date(2026, 10, 16);

/** Cliente de la misión. */
export const CLIENTE = {
  id: 'oscar',
  nombre: 'Óscar Camilo Hernández Ramírez',
  /** Fecha de la señal de Dali Oportunidades y de la última conversación (telemetría). */
  senal: '12 nov',
  ultima: '28 oct',
} as const;

/** Estado inicial de una conversación nueva. */
export function nuevaConversacion(): EstadoConversacion {
  return {
    etapa: 1, visitadas: [1], monto: 0, motivo: null, otro: '', cuando: null, fecha: '', fechaTipo: null,
    abierta: null, eligeFecha: false, pen: null, ctMarc: null, ctConf: null,
    pref: null, plazo: null, noRepone: false, rx: null, rxInfo: false, lm: false, dec: null, tram: null,
    np: { resumen: true }, agenda: null, notas: '', validar: false, msg: null,
    cerrado: false, fuera: false, estado: 'en-curso', resultado: null, segHasta: '', enviado: false, segundos: 0,
    imp: { metodo: 'preguntas', paso: 1, ingreso: 18500000, benef: null, otros: null, otrosTmp: 0, dep: null, tarifa: '' },
    cr: null, creditoCombo: null, apVista: 'resumen', rentPer: 'inicio', verCalc: false,
  };
}

/** Conversación anterior del historial (28/10/2026, ya finalizada): se abre en solo lectura. */
export const CONVERSACION_ANTERIOR: Conversacion = {
  id: 0,
  origen: 'historial',
  estado: 'finalizada',
  creada: new Date(2026, 9, 28),
  st: {
    ...nuevaConversacion(),
    etapa: 4, visitadas: [1, 2, 3, 4], monto: 150000000, motivo: 'liquidez', cuando: 'este-mes', fecha: '2026-10-31',
    ctMarc: 'ahorro', ctConf: 'ahorro', pref: 'retiro', rx: 'no', dec: 'retiro', tram: 'portal',
    np: { resumen: true }, cerrado: true, estado: 'finalizada', resultado: 'Retiro parcial',
    segHasta: '2026-11-27', segundos: 720,
  },
};
