// Cálculos puros del Plan corporativo (aportes/retiros, evolución del AUM, variación) y de la
// gestión de la agencia del FP Asignado por año.
import { AUM_ETIQUETAS, AUM_MESES } from '@features/radiografia/data/plan.mock';
import { DatosPlan, GestionAnio } from '@features/radiografia/interfaces/clientes';
import { Direccion } from '@features/radiografia/interfaces/radiografia';
import { fmtPesos, fmtVariacion, signo } from '@features/radiografia/utils/formato';

export interface ParDineroVm {
  readonly anio: string;
  readonly aportes: string;
  readonly retiros: string;
  readonly altoAportes: number;
  readonly altoRetiros: number;
  readonly neta: string;
  readonly aria: string;
}

/** Aportes y retiros anuales: alto proporcional a los aportes máximos (170 px). */
export function paresDinero(anios: DatosPlan['anios'], alto = 170): ParDineroVm[] {
  const max = Math.max(...anios.map((a) => a[1]));
  return anios.map(([anio, a, r]) => ({
    anio,
    aportes: fmtPesos(a),
    retiros: fmtPesos(r),
    altoAportes: Math.round((a / max) * alto),
    altoRetiros: Math.round((r / max) * alto),
    neta: 'Neta +' + fmtPesos(a - r) + ' M',
    aria: `${anio}: aportes ${fmtPesos(a)} millones, retiros ${fmtPesos(r)} millones, neta ${fmtPesos(a - r)} millones`,
  }));
}

export interface PuntoAumVm {
  readonly x: string;
  readonly y: string;
  readonly yValor: string;
  readonly valor: string;
  readonly etiqueta: string;
}

export interface GraficaAumVm {
  /** Alturas (y) de las 4 líneas de la grilla. */
  readonly grilla: readonly string[];
  readonly area: string;
  readonly linea: string;
  readonly puntos: readonly PuntoAumVm[];
  /** Línea base del eje X (texto de los meses en y + 22). */
  readonly yEje: number;
  readonly aria: string;
}

const X0 = 50;
const X1 = 510;
const Y0 = 190;
const Y1 = 30;

/** Evolución del AUM en el último año (SVG 560 × 220). */
export function graficaAum(pts: readonly number[]): GraficaAumVm {
  const vmax = Math.ceil(Math.max(...pts) / 10000) * 10000;
  const xy = pts.map((v, i) => ({
    x: X0 + (AUM_MESES[i] / 12) * (X1 - X0),
    y: Y0 - (v / vmax) * (Y0 - Y1),
    v,
    t: AUM_ETIQUETAS[i],
  }));
  const linea = xy.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  const ultimo = xy[xy.length - 1];
  return {
    grilla: [0, 1, 2, 3].map((k) => (Y0 - (k / 3) * (Y0 - Y1)).toFixed(1)),
    area: `${linea} L${ultimo.x.toFixed(1)} ${Y0} L${xy[0].x.toFixed(1)} ${Y0} Z`,
    linea,
    puntos: xy.map((p) => ({
      x: p.x.toFixed(1),
      y: p.y.toFixed(1),
      yValor: (p.y - 12).toFixed(1),
      valor: fmtPesos(p.v),
      etiqueta: p.t,
    })),
    yEje: Y0 + 22,
    aria: 'Evolución del AUM en el último año, en millones: ' + pts.map(fmtPesos).join(', '),
  };
}

export interface VariacionVm {
  readonly direccion: Direccion;
  readonly texto: string;
  readonly etiqueta: string;
  readonly detalle: string;
}

/** Variación del AUM frente a octubre de 2025, con su semáforo. */
export function variacionAum(aum: number, anterior: number): VariacionVm {
  const v = ((aum - anterior) / anterior) * 100;
  const texto = fmtVariacion(v);
  const direccion: Direccion = v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
  const semaforo = { up: 'verde', down: 'rojo', flat: 'amarillo' }[direccion];
  return {
    direccion,
    texto,
    etiqueta: `Variación ${texto} frente a octubre de 2025. Semáforo ${semaforo}.`,
    detalle: `Hoy ${fmtPesos(aum)} M · oct 2025: ${fmtPesos(anterior)} M`,
  };
}

/** "Distribuidos en 1 Plan" / "Distribuidos en 3 Planes". */
export function textoContratos(n: number): string {
  return 'Distribuidos en ' + n + (n === 1 ? ' Plan' : ' Planes');
}

export interface GestionVm {
  readonly nuevos: number;
  readonly de: string;
  readonly nuevosSub: string;
  readonly participes: number;
  readonly participesSub: string;
  readonly contratos: number;
  readonly contratosSub: string;
  readonly neto: string;
  readonly netoNegativo: boolean;
  readonly netoSub: string;
}

/** Indicadores de gestión de la agencia en un año (2026 va a octubre). */
export function vmGestion(anio: number, actual: GestionAnio, previo: GestionAnio | undefined): GestionVm {
  const corte = anio === 2026 ? ' (a octubre)' : '';
  const neto = actual.nuevos - actual.perdidos;
  return {
    nuevos: actual.nuevos,
    de: 'de ' + actual.empresa,
    nuevosSub: 'Otras agencias vincularon ' + (actual.empresa - actual.nuevos) + corte,
    participes: actual.participes,
    participesSub: previo ? `${previo.participes} en ${anio - 1}${corte}` : 'Vinculados al plan',
    contratos: actual.contratos,
    contratosSub: previo ? `${previo.contratos} en ${anio - 1}` : 'Clientes con 2 o más productos',
    neto: signo(neto),
    netoNegativo: neto < 0,
    netoSub: `${actual.nuevos} nuevos · ${actual.perdidos} perdidos. La empresa: ${signo(actual.netoEmpresa)}`,
  };
}
