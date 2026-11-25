import { AGENDA_NOM, DEC_CAT, TEXTOS } from '../constants/textos';
import { CLIENTE } from '../data/conversaciones.mock';
import { AgendaSeguimiento, EstadoConversacion } from '../interfaces/conversacion';
import { deIso, fLarga, horaTxt } from './formato';

/** Título del evento de seguimiento. */
export const tituloAgenda = (): string => 'Seguimiento ' + TEXTOS.tituloJourney.toLowerCase() + ' · ' + CLIENTE.nombre;

/** Descripción del evento (sin cifras del cliente: viaja a herramientas externas). */
export function detalleAgenda(st: EstadoConversacion): string {
  const dec = st.dec && st.dec !== 'fuera' ? ' Decisión del cliente: ' + DEC_CAT[st.dec] + '.' : '';
  return 'Llamada de seguimiento de Planeación Pro.' + dec;
}

/** Google Calendar: abre el evento nuevo; el asesor elige fecha y hora allí. */
export const urlGoogle = (titulo: string, detalle: string): string =>
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(titulo) + '&details=' + encodeURIComponent(detalle);

/** Microsoft Teams: abre la reunión nueva; el asesor elige fecha y hora allí. */
export const urlTeams = (titulo: string, detalle: string): string =>
  'https://teams.microsoft.com/l/meeting/new?subject=' + encodeURIComponent(titulo) + '&content=' + encodeURIComponent(detalle);

const dos = (n: number): string => String(n).padStart(2, '0');
const fechaIcs = (d: Date): string =>
  d.getFullYear() + dos(d.getMonth() + 1) + dos(d.getDate()) + 'T' + dos(d.getHours()) + dos(d.getMinutes()) + '00';
const textoIcs = (t: string): string => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/**
 * Calendario de iOS: no tiene enlace web para crear eventos, así que se descarga un .ics que abre Calendario.
 * El .ics exige una fecha: se propone el siguiente día hábil a las 9:00 (30 min) y el asesor la cambia allí.
 */
export function icsSeguimiento(titulo: string, detalle: string, ahora: Date = new Date()): string {
  const ini = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 9, 0);
  while (ini.getDay() === 0 || ini.getDay() === 6) ini.setDate(ini.getDate() + 1);
  const fin = new Date(ini.getTime() + 30 * 60000);
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DesignLab Contigo//Planeacion Pro//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:seguimiento-' + ahora.getTime() + '@designlab-contigo',
    'DTSTAMP:' + fechaIcs(ahora),
    'DTSTART:' + fechaIcs(ini),
    'DTEND:' + fechaIcs(fin),
    'SUMMARY:' + textoIcs(titulo),
    'DESCRIPTION:' + textoIcs(detalle),
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}

export const nombreAgenda = AGENDA_NOM;

/** Llamada confirmada por el asesor (con fecha y hora). */
export const agendada = (a: AgendaSeguimiento | null): a is AgendaSeguimiento => a?.estado === 'si' && !!a.fecha && !!a.hora;

/** `28 nov 2026, 10:00 a. m.` */
export const cuandoAgenda = (a: AgendaSeguimiento): string => fLarga(deIso(a.fecha)) + ', ' + horaTxt(a.hora);
