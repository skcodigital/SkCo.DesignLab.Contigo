import { AGENDA_NOM, DEC_CAT, TEXTOS } from '../constants/textos';
import { CLIENTE } from '../data/conversaciones.mock';
import { AgendaConVia, AgendaSeguimiento, EstadoConversacion } from '../interfaces/conversacion';
import { deIso, fLarga, horaTxt } from './formato';

/** Título del evento de seguimiento. */
export const tituloAgenda = (): string => 'Seguimiento ' + TEXTOS.tituloJourney.toLowerCase() + ' · ' + CLIENTE.nombre;

/** Descripción del evento (sin cifras del cliente: viaja a herramientas externas). */
export function detalleAgenda(st: EstadoConversacion): string {
  const dec = st.dec && st.dec !== 'fuera' ? ' Decisión del cliente: ' + DEC_CAT[st.dec] + '.' : '';
  return 'Reunión de seguimiento de Planeación Pro.' + dec;
}

/** Duración de la reunión de seguimiento. */
const DURACION_MIN = 30;
/** Zona horaria de los eventos (Colombia). */
const ZONA = 'America/Bogota';
const OFFSET = '-05:00';

const dos = (n: number): string => String(n).padStart(2, '0');

/** Inicio y fin (local) a partir de `AAAA-MM-DD` y `HH:MM`. */
function rango(fecha: string, hora: string): [Date, Date] {
  const [a, m, d] = fecha.split('-').map(Number);
  const [h, mi] = hora.split(':').map(Number);
  const ini = new Date(a, m - 1, d, h, mi);
  return [ini, new Date(ini.getTime() + DURACION_MIN * 60000)];
}
/** `20261128T100000` */
const compacta = (d: Date): string =>
  d.getFullYear() + dos(d.getMonth() + 1) + dos(d.getDate()) + 'T' + dos(d.getHours()) + dos(d.getMinutes()) + '00';
/** `2026-11-28T10:00:00-05:00` */
const isoZona = (d: Date): string =>
  d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate()) + 'T' + dos(d.getHours()) + ':' + dos(d.getMinutes()) + ':00' + OFFSET;

/** Google Calendar: evento nuevo con la fecha y la hora elegidas. */
export function urlGoogle(titulo: string, detalle: string, fecha: string, hora: string): string {
  const [ini, fin] = rango(fecha, hora);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(titulo) +
    '&details=' + encodeURIComponent(detalle) + '&dates=' + compacta(ini) + '/' + compacta(fin) + '&ctz=' + encodeURIComponent(ZONA);
}

/** Microsoft Teams: reunión nueva con la fecha y la hora elegidas. */
export function urlTeams(titulo: string, detalle: string, fecha: string, hora: string): string {
  const [ini, fin] = rango(fecha, hora);
  return 'https://teams.microsoft.com/l/meeting/new?subject=' + encodeURIComponent(titulo) + '&content=' + encodeURIComponent(detalle) +
    '&startTime=' + encodeURIComponent(isoZona(ini)) + '&endTime=' + encodeURIComponent(isoZona(fin));
}

const textoIcs = (t: string): string => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/**
 * «Otros» (solo en móvil): no hay enlace web para el calendario del celular, así que se descarga un .ics que abre
 * el calendario de iOS o Android con la fecha y la hora elegidas.
 */
export function icsSeguimiento(titulo: string, detalle: string, fecha: string, hora: string, ahora: Date = new Date()): string {
  const [ini, fin] = rango(fecha, hora);
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DesignLab Contigo//Planeacion Pro//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:seguimiento-' + ahora.getTime() + '@designlab-contigo',
    'DTSTAMP:' + compacta(ahora),
    'DTSTART;TZID=' + ZONA + ':' + compacta(ini),
    'DTEND;TZID=' + ZONA + ':' + compacta(fin),
    'SUMMARY:' + textoIcs(titulo),
    'DESCRIPTION:' + textoIcs(detalle),
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}

export const nombreAgenda = AGENDA_NOM;

/** Reunión confirmada por el asesor (con fecha y hora). */
export const agendada = (a: AgendaSeguimiento | null): a is AgendaConVia => a?.estado === 'si' && !!a.via && !!a.fecha && !!a.hora;

/** Herramienta elegida (agendada o por confirmar). */
export const conVia = (a: AgendaSeguimiento | null): a is AgendaConVia => !!a?.via && a.estado !== 'borrador';

/** `28 nov 2026, 10:00 a. m.` */
export const cuandoAgenda = (a: AgendaSeguimiento): string => fLarga(deIso(a.fecha)) + ', ' + horaTxt(a.hora);
