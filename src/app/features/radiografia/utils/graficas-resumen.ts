// Tooltips de las gráficas del Resumen y de Relación integral (mismos textos que `datosTip` del prototipo).
import { TIP_RESUMEN } from '@features/radiografia/constants/textos-resumen';
import { DatoTip, Gestion } from '@features/radiografia/interfaces/radiografia';

/** Quita " (agregado)" y el conteo final ("· 838") de un texto de leyenda. */
export function limpiarLeyenda(texto: string): string {
  return texto
    .replace(/\s*\(agregado\)/, '')
    .replace(/\s*·\s*[\d.]+$/, '')
    .trim();
}

/** Ancho de un tramo como porcentaje con hasta un decimal: 13.7 → "13,7%". */
export function fmtAncho(ancho: number): string {
  return ancho.toLocaleString('es-CO', { maximumFractionDigits: 1 }) + '%';
}

/** Tramo de la ruta de penetración: "FP Asignado: 13,7%". */
export function tipRuta(leyenda: string, ancho: number): DatoTip {
  return { titulo: TIP_RESUMEN.clientesActivosHoy, lineas: [limpiarLeyenda(leyenda) + ': ' + fmtAncho(ancho)] };
}

const CLAVE_GESTION: Readonly<Record<Gestion, RegExp>> = {
  dueno: /fp asignado|dueño|^tú|^tus/i,
  agencia: /agencia/i,
  otras: /otras|otros/i,
};

/**
 * Tramo de una línea de negocio: busca en el aria-label de la barra la parte de quien gestiona el tramo
 * ("Total en la empresa: FP Asignado $36.550 M, …" → "FP Asignado $36.550 M").
 */
export function tipLinea(nombre: string, aria: string, gestion: Gestion): DatoTip {
  const partes = aria.split(': ').slice(1).join(': ').split(', ');
  const clave = CLAVE_GESTION[gestion];
  const p = partes.find((x) => clave.test(x) && !(gestion === 'agencia' && /otras/i.test(x))) ?? '';
  return { titulo: nombre, lineas: [p.charAt(0).toUpperCase() + p.slice(1)] };
}
