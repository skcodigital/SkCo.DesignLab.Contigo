import { ComisionMes, MesAnio, PuntoComision, SegmentoDistribucion, ValorIndicador } from '../interfaces/logros';

/** Último mes cerrado a partir de «hoy» (el mes en curso todavía no se puede consultar). */
export function ultimoMesCerrado(hoy: Date): MesAnio {
  const mes = hoy.getMonth() - 1;
  return mes < 0 ? { anio: hoy.getFullYear() - 1, mes: 11 } : { anio: hoy.getFullYear(), mes };
}

/** Meses que aún no han cerrado: no se pueden elegir. */
export function esMesFuturo(anio: number, mes: number, ultimo: MesAnio): boolean {
  return anio > ultimo.anio || (anio === ultimo.anio && mes > ultimo.mes);
}

/** Meses de diferencia entre `mes` y el último mes cerrado (negativo hacia atrás). */
export function desfaseMeses(mes: MesAnio, ultimo: MesAnio): number {
  return (mes.anio - ultimo.anio) * 12 + (mes.mes - ultimo.mes);
}

/**
 * Datos de ejemplo de los indicadores para un mes (`k` = desfase) y un asesor (`null` = todos), a partir de los valores
 * del último mes cerrado. Misma fórmula del prototipo: valores redondeados a cien mil y variación entera.
 */
export function indicadoresDelMes(
  base: readonly ValorIndicador[],
  k: number,
  asesor: number | null,
): ValorIndicador[] {
  const a = asesor ?? -1;
  return base.map((d, i) => {
    const fa = asesor === null ? 1 : 0.18 + 0.05 * ((a * 37 + i * 11) % 7);
    const f = (1 + 0.06 * Math.sin(k * 1.3 + i) + 0.01 * k) * fa;
    const valor = Math.round((d.valor * f) / 100000) * 100000;
    const variacion =
      k === 0 && asesor === null ? d.variacion : Math.round(d.variacion + 2 * Math.sin(k * 0.9 + i * 2 + (a + 1) * 1.7));
    return { valor, variacion };
  });
}

/**
 * Siguiente botón habilitado de la grilla de meses al moverse `paso` posiciones (flechas: ±1 horizontal, ±4 vertical).
 * Salta los deshabilitados de uno en uno en la misma dirección. -1 si no hay a dónde ir.
 */
export function siguienteHabilitado(desde: number, paso: number, deshabilitados: readonly boolean[]): number {
  let j = desde + paso;
  while (j >= 0 && j < deshabilitados.length && deshabilitados[j]) j += paso > 0 ? 1 : -1;
  return j >= 0 && j < deshabilitados.length ? j : -1;
}

// ===== Gráfica de comisiones (viewBox 0 0 400 120) =====
const ANCHO_GRAFICA = 400;
const ALTO_GRAFICA = 120;

export function puntosComisiones(meses: readonly ComisionMes[]): PuntoComision[] {
  const n = meses.length;
  return meses.map((m, i) => ({
    ...m,
    x: (ANCHO_GRAFICA * (i + 0.5)) / n,
    left: ((i + 0.5) / n) * 100,
    top: Math.round((m.y / ALTO_GRAFICA) * 1000) / 10,
  }));
}

/** Atributo `points` de la polilínea: «16.7,47.0 50.0,57.8 …». */
export function polilinea(puntos: readonly PuntoComision[]): string {
  return puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

// ===== Dona de distribución =====

/** Fondo `conic-gradient` de la dona a partir de los porcentajes de cada segmento. */
export function gradienteConico(segmentos: readonly SegmentoDistribucion[]): string {
  let acumulado = 0;
  const tramos = segmentos.map((s) => {
    const desde = acumulado;
    acumulado += s.porcentaje;
    return `${s.color} ${desde}% ${acumulado}%`;
  });
  return `conic-gradient(${tramos.join(',')})`;
}

/** Ángulo (0–360°, en sentido horario desde las 12) del punto (dx, dy) respecto al centro de la dona. */
export function anguloDesdeCentro(dx: number, dy: number): number {
  return ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
}

/** Segmento de la dona que ocupa el ángulo dado. */
export function segmentoDeAngulo(angulo: number, porcentajes: readonly number[]): number {
  let acumulado = 0;
  for (let i = 0; i < porcentajes.length; i++) {
    acumulado += porcentajes[i];
    if ((angulo * 100) / 360 < acumulado) return i;
  }
  return porcentajes.length - 1;
}

/** Punto medio del anillo del segmento `k` (donde se ancla el tooltip al recorrer la dona con teclado). */
export function puntoMedioSegmento(
  k: number,
  porcentajes: readonly number[],
  radio = 46,
  centro = 56,
): { x: number; y: number } {
  const inicio = porcentajes.slice(0, k).reduce((a, p) => a + p, 0);
  const medio = ((inicio + porcentajes[k] / 2) / 100) * 2 * Math.PI;
  return { x: centro + radio * Math.sin(medio), y: centro - radio * Math.cos(medio) };
}
