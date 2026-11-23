// Cálculos puros de la ruta de acción (metas sugeridas, resumen enviado y seguimiento).
import { SEGUIMIENTO } from '@features/radiografia/data/ruta-accion.mock';
import { ParteTexto } from '@features/radiografia/interfaces/radiografia';
import { TEXTOS_RUTA } from '@features/radiografia/constants/textos-ruta';
import { ConfigRuta, MetaForm, MetaId, MetaRuta, ModificacionRuta, Plazo } from '@features/radiografia/interfaces/ruta-accion';
import { fmt1, fmtFechaLarga, fmtHora, fmtNum } from '@features/radiografia/utils/formato';

/** Faltantes para llegar a `v`% de `base` partiendo de `actual` (puede ser ≤ 0). */
function faltantes(base: number, v: number, actual: number): number {
  return Math.ceil((base * v) / 100) - actual;
}

/** Penetración resultante (en %) con `v` clientes nuevos. */
export function penetracion(v: number, cfg: ConfigRuta): number {
  return ((cfg.hoy.clientes + v) / cfg.hoy.empleados) * 100;
}

/** Texto bajo cada meta de la modal (lo que implica el valor escrito). */
export function textoCalcMeta(id: MetaId, v: number, cfg: ConfigRuta): string {
  const { hoy } = cfg;
  switch (id) {
    case 'activar':
      return `Penetración resultante: ${fmtNum(penetracion(v, cfg), 1)}% (hoy ${cfg.penetracionHoy})`;
    case 'profundizar': {
      const f = faltantes(hoy.clientes, v, hoy.clientes2p);
      return f > 0 ? `+${fmtNum(f)} clientes con 2 o más productos` : 'Ya se cumple hoy';
    }
    case 'consolidar': {
      const f = faltantes(hoy.afiliados, v, hoy.agencia);
      return f > 0 ? `+${fmtNum(f)} afiliados a FPOB con Agencia Norte` : 'Ya se cumple hoy';
    }
    case 'retener':
      return 'Clientes nuevos menos perdidos en el año';
  }
}

/** Línea del resumen de la confirmación ("Metas de la ruta"). */
export function textoResumenMeta(id: MetaId, v: number, cfg: ConfigRuta): string {
  switch (id) {
    case 'activar':
      return `Activar: +${fmtNum(v)} clientes nuevos`;
    case 'profundizar':
      return `Profundizar: cross-sell 2P+ de ${cfg.baseProfundizar}% a ${fmtNum(v)}%`;
    case 'consolidar':
      return `Consolidar: share de FPOB de ${cfg.baseConsolidar}% a ${fmtNum(v)}%`;
    case 'retener':
      return `Retener: neto anual ≥ +${fmtNum(v)}`;
  }
}

/** Valor de la meta en la unidad de seguimiento (penetración en % para Activar). */
export function valorMeta(id: MetaId, v: number, cfg: ConfigRuta): number {
  return id === 'activar' ? penetracion(v, cfg) : v;
}

/** Formato de seguimiento: % con un decimal, o neto con signo para Retener. */
export function fmtSeguimiento(id: MetaId, n: number): string {
  return id === 'retener' ? (n > 0 ? '+' : '') + n : fmt1(n) + '%';
}

/** Cumplimiento (0–100): cuánto del camino entre el dato al crear la meta y la meta ya se recorrió. */
export function cumplimientoMeta(id: MetaId, v: number, cfg: ConfigRuta): number {
  const d = SEGUIMIENTO[id];
  const meta = valorMeta(id, v, cfg);
  return Math.max(0, Math.min(100, Math.round(((d.hoyDemo - d.ini) / (meta - d.ini || 1)) * 100)));
}

/** "Hoy 34,2% · meta 45,0%" bajo la barra de cumplimiento de cada cajita. */
export function textoAvanceMeta(id: MetaId, v: number, cfg: ConfigRuta): string {
  const d = SEGUIMIENTO[id];
  return 'Hoy ' + fmtSeguimiento(id, d.hoyDemo) + ' · meta ' + fmtSeguimiento(id, valorMeta(id, v, cfg));
}

/** "Hoy 33,0% → meta 45,0%" (listado de metas y confirmación de descarte). */
export function textoHoyMeta(id: MetaId, v: number, cfg: ConfigRuta): string {
  const d = SEGUIMIENTO[id];
  return 'Hoy ' + fmtSeguimiento(id, d.ini) + ' → meta ' + fmtSeguimiento(id, valorMeta(id, v, cfg));
}

/** Detalle de la meta que se descarta. */
export function textoDetalleDescarte(m: MetaRuta, cfg: ConfigRuta): string {
  return textoHoyMeta(m.id, m.valor, cfg) + ' · Creada el ' + fmtFechaLarga(m.inicio);
}

/** Texto de la meta en cada cajita de la ruta, recalculado con el valor actual. */
export function partesMetaCajita(id: MetaId, v: number, cfg: ConfigRuta): readonly ParteTexto[] {
  const { hoy } = cfg;
  switch (id) {
    case 'activar':
      return [
        { t: 'Meta: ' },
        { t: '+' + fmtNum(v) + ' clientes', b: true },
        { t: ' → ' },
        { t: fmtNum(penetracion(v, cfg), 1) + '%', b: true },
      ];
    case 'profundizar':
      return [
        { t: 'Meta: 2P+ de ' + cfg.baseProfundizar + '% a ' },
        { t: fmtNum(v) + '%', b: true },
        { t: ' (+' + Math.max(0, faltantes(hoy.clientes, v, hoy.clientes2p)) + ' clientes)' },
      ];
    case 'consolidar':
      return [
        { t: 'Meta: share de ' + cfg.baseConsolidar + '% a ' },
        { t: fmtNum(v) + '%', b: true },
        { t: ' (+' + Math.max(0, faltantes(hoy.afiliados, v, hoy.agencia)) + ' afiliados)' },
      ];
    case 'retener':
      return [{ t: 'Meta: neto anual ' }, { t: '≥ +' + fmtNum(v), b: true }];
  }
}

/** Días de plazo elegidos (0 = sin plazo). */
export function diasPlazo(plazo: Plazo, diasOtro: number): number {
  if (plazo === 'otro') return Number(diasOtro) || 0;
  return Number(plazo) || 0;
}

/** "1 día" / "15 días". */
export function textoPlazo(dias: number): string {
  return dias === 1 ? '1 día' : `${dias} días`;
}

/** Metas iniciales de la modal: todas incluidas con el valor sugerido. */
export function metasIniciales(cfg: ConfigRuta, ids: readonly MetaId[]): MetaForm[] {
  return ids.map((id) => ({ id, incluida: true, valor: cfg.sugeridas[id], sugerida: cfg.sugeridas[id] }));
}

/** "Última modificación: 20 de noviembre de 2026, 3:05 p. m. · por ti" leída desde cada vista. */
export function textoModificacion(mod: ModificacionRuta | null, enDueno: boolean): string {
  if (!mod) return '';
  const cuando = fmtFechaLarga(mod.fecha) + ', ' + fmtHora(mod.fecha);
  const yo = enDueno ? mod.quien === 'dueno' : mod.quien === 'director';
  const otro = enDueno ? TEXTOS_RUTA.directorComercial : TEXTOS_RUTA.fpAsignadoConRol;
  return TEXTOS_RUTA.ultimaModificacion + cuando + ' · por ' + (yo ? TEXTOS_RUTA.porTi : otro);
}

/** Sin PAC: a quién va la ruta en la descripción de la modal ("ti", el asesor elegido o "el FP Asignado"). */
export function destinatarioModal(fp: string | null): string {
  if (!fp) return TEXTOS_RUTA.elFpAsignado;
  return fp.startsWith('Tú') ? TEXTOS_RUTA.porTi : fp;
}

/** Sin PAC: sujeto y verbo de la confirmación ("El FP Asignado la recibió…", "La recibiste…"). */
export function destinatarioConfirmacion(fp: string | null): { readonly quien: string; readonly resto: string } {
  if (!fp) return { quien: TEXTOS_RUTA.elFpAsignadoMayus, resto: TEXTOS_RUTA.laRecibio };
  return fp.startsWith('Tú') ? { quien: 'La', resto: TEXTOS_RUTA.recibiste } : { quien: fp, resto: TEXTOS_RUTA.laRecibio };
}
