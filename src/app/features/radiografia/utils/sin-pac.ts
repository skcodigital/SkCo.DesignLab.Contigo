// Cálculos puros de las gráficas de la radiografía sin PAC (alturas, arcos de la dona y textos de tooltip).
import { DatoTip, ParteTexto } from '@features/radiografia/interfaces/radiografia';
import { GrupoClientes, LineaNegocio, ParAnual, TramoPct } from '@features/radiografia/interfaces/sin-pac';
import { fmtPesos, pct, signo } from '@features/radiografia/utils/formato';

/** Ancho de un tramo como lo leía el tooltip del prototipo: 5.8 → "5,8%". */
export function textoAncho(ancho: number): string {
  return ancho.toLocaleString('es-CO', { maximumFractionDigits: 1 }) + '%';
}

/** "1 cliente" / "3 clientes". */
export function textoClientes(n: number): string {
  return `${n} ${n === 1 ? 'cliente' : 'clientes'}`;
}

/** Altura en px de una barra proporcional al máximo (mínimo `min`). */
export function altoBarra(v: number, max: number, alto: number, min = 0): number {
  return Math.max(min, Math.round((v / max) * alto));
}

/** Tooltip de la barra de "La oportunidad": "Tu agencia: 7 empleados · 5,8%". */
export function tipOportunidad(t: TramoPct): DatoTip {
  return { titulo: 'Clientes activos', lineas: [`${t.leyenda}: ${t.n} empleados · ${textoAncho(t.ancho)}`] };
}

/** Tooltip de la ruta de penetración: "Tu agencia (Agencia Norte): 5,8%". */
export function tipRuta(t: TramoPct): DatoTip {
  return { titulo: 'Clientes activos hoy', lineas: [`${t.leyenda}: ${textoAncho(t.ancho)}`] };
}

/** Neto de un año de "Evolución de clientes" con su clase (negativo en rojo, cero en gris). */
export function netoPar(p: ParAnual): { readonly texto: string; readonly clase: '' | 'neto-neg' | 'neto-cero' } {
  const neto = p.nuevos - p.perdidos;
  return { texto: 'Neto ' + signo(neto), clase: neto < 0 ? 'neto-neg' : neto === 0 ? 'neto-cero' : '' };
}

export function tipPar(anio: string, nuevos: boolean, valor: number): DatoTip {
  return { titulo: anio, lineas: [`${nuevos ? 'Clientes nuevos' : 'Clientes perdidos'}: ${valor}`] };
}

/** Grupos con su porcentaje entero sobre el total. */
export function conPorcentaje(grupos: readonly GrupoClientes[], total: number): readonly (GrupoClientes & { readonly pct: number })[] {
  return grupos.map((g) => ({ ...g, pct: pct(g.n, total) }));
}

export function tipProductos(g: GrupoClientes, porcentaje: number): DatoTip {
  return { titulo: 'Productos por cliente', lineas: [`${g.nombre}: ${g.n} clientes · ${porcentaje}%`] };
}

export interface ArcoDona {
  readonly dasharray: string;
  readonly offset: string;
}

/** Arcos de la dona (radio 70): cada segmento empieza donde termina el anterior. */
export function arcosDona(valores: readonly number[], total: number, radio = 70): readonly ArcoDona[] {
  const c = 2 * Math.PI * radio;
  let acumulado = 0;
  return valores.map((n) => {
    const largo = (n / total) * c;
    const arco = { dasharray: `${largo.toFixed(2)} ${(c - largo).toFixed(2)}`, offset: (-acumulado).toFixed(2) };
    acumulado += largo;
    return arco;
  });
}

export function tipSegmento(g: GrupoClientes, porcentaje: number): DatoTip {
  return { titulo: 'Clientes por segmento', lineas: [`${g.nombre}: ${textoClientes(g.n)} · ${porcentaje}%`] };
}

/** Tramos de una línea de negocio con el texto de su tooltip (como el aria-label de la barra). */
export function tramosLinea(l: LineaNegocio): {
  readonly aria: string;
  readonly agencia: string;
  readonly otras: string | null;
} {
  const agencia = `Agencia Norte ${fmtPesos(l.agencia)} M`;
  const otras = `otras agencias ${fmtPesos(l.otras)} M`;
  return {
    aria: `${l.nombre}: ${agencia}, ${otras}`,
    agencia,
    otras: l.otras > 0 ? otras.charAt(0).toUpperCase() + otras.slice(1) : null,
  };
}

/** Ruta comercial sin plan: qué falta para armarla (cambia al asignar un FP). */
export function notaRutaSinPac(fpAsignado: string | null): readonly ParteTexto[] {
  if (!fpAsignado) {
    return [
      { t: 'La ruta comercial se arma cuando esta empresa tenga un ' },
      { t: 'Plan de Ahorro Corporativo', b: true },
      { t: ' y un ' },
      { t: 'FP Asignado', b: true },
      { t: ', que será quien haga la gestión dentro de ella.' },
    ];
  }
  return [
    { t: 'Ya asignaste a ' },
    { t: fpAsignado.startsWith('Tú') ? 'ti' : fpAsignado, b: true },
    { t: ' como FP Asignado. Podrás crear la ruta de acción cuando la empresa tenga su ' },
    { t: 'Plan de Ahorro Corporativo', b: true },
    { t: '.' },
  ];
}
