import { RangoFechas } from '@features/monitor/interfaces/comunes';
import {
  DefinicionSerie,
  MetricasActivo,
  PeriodoDesempeno,
  PuntoSerie,
} from '@features/monitor/interfaces/detalle';
import { aIso, desdeIso, restarAnios, restarMeses } from '@features/monitor/utils/fechas';

/**
 * Series deterministas del detalle (sin `Math.random`): una receta (`DefinicionSerie`) da el valor de cualquier
 * día contado hacia atrás desde «hoy», así que los puntos de un mismo día son iguales en cualquier rango. De ahí
 * salen también las medidas (variación, volatilidad, TEA, retorno) que en producción calculaba el servicio.
 */

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;
const MS_DIA = 86_400_000;

/** Redondea a `decimales` (por defecto 2). */
export function redondear(valor: number, decimales = 2): number {
  const f = 10 ** decimales;
  return Math.round(valor * f) / f;
}

/** Etiqueta del eje X como la de producción: día sin cero, mes corto y año de dos cifras («5 nov 26»). */
export function etiquetaAmigable(fecha: Date): string {
  return `${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]} ${String(fecha.getFullYear()).slice(2)}`;
}

/** Días calendario de `desde` a `hasta` (sin importar la hora ni el horario de verano). */
export function diasEntre(desde: Date, hasta: Date): number {
  const a = Date.UTC(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const b = Date.UTC(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b - a) / MS_DIA);
}

/** Oscilación suave de la receta en el día `k` (suma de senos con fase según la semilla). */
function oscilacion(def: DefinicionSerie, k: number): number {
  const s = def.semilla;
  return (
    (def.volatilidad / 100) *
    (0.55 * Math.sin(k / 11 + s) + 0.3 * Math.sin(k / 4.3 + s * 1.7) + 0.15 * Math.sin(k * 1.37 + s * 2.3))
  );
}

/** Valor de la serie `dias` días antes de hoy (en hoy es exactamente `valorHoy`). */
export function valorSerie(def: DefinicionSerie, dias: number): number {
  const tasaDiaria = Math.log(1 + def.rentabilidadAnual / 100) / 365;
  const valor = def.valorHoy * Math.exp(-tasaDiaria * dias + oscilacion(def, dias) - oscilacion(def, 0));
  return redondear(valor, def.decimales ?? 2);
}

function esHabil(fecha: Date): boolean {
  const dia = fecha.getDay();
  return dia !== 0 && dia !== 6;
}

/**
 * Puntos de la receta entre las fechas del rango (sin pasar de hoy ni antes de su inicio). El valor normalizado
 * es base 1.000 en el primer punto, como el que graficaba producción.
 */
export function puntosSerie(def: DefinicionSerie, rango: RangoFechas, hoy: Date): PuntoSerie[] {
  const desdeRango = desdeIso(rango.inicio);
  const hastaRango = desdeIso(rango.fin);
  if (!desdeRango || !hastaRango) {
    return [];
  }
  const inicio = def.inicio ? desdeIso(def.inicio) : null;
  const desde = inicio && inicio > desdeRango ? inicio : desdeRango;
  const hasta = hastaRango > hoy ? hoy : hastaRango;
  const puntos: PuntoSerie[] = [];
  let base: number | null = null;
  for (let f = new Date(desde); f <= hasta; f = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 1)) {
    if (def.soloHabiles && !esHabil(f)) {
      continue;
    }
    const valor = valorSerie(def, diasEntre(f, hoy));
    base ??= valor;
    puntos.push({
      fechaIso: aIso(f),
      etiqueta: etiquetaAmigable(f),
      valor,
      valorNormalizado: redondear((valor / base) * 1000, 6),
    });
  }
  return puntos;
}

/** Desviación estándar muestral. */
function desviacion(valores: readonly number[]): number {
  if (valores.length < 2) {
    return 0;
  }
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  return Math.sqrt(valores.reduce((a, v) => a + (v - media) ** 2, 0) / (valores.length - 1));
}

/**
 * Medidas de un activo en los puntos del rango: variación y retorno del periodo, volatilidad anualizada de los
 * retornos diarios y TEA. `null` si no hay puntos con valor.
 */
export function metricasPuntos(puntos: readonly PuntoSerie[]): MetricasActivo | null {
  const conValor = puntos.filter((p): p is PuntoSerie & { valor: number } => p.valor != null);
  if (!conValor.length) {
    return null;
  }
  const primero = conValor[0];
  const ultimo = conValor[conValor.length - 1];
  const dias = diasEntre(desdeIso(primero.fechaIso) as Date, desdeIso(ultimo.fechaIso) as Date);
  const factor = ultimo.valor / primero.valor;
  const retornos = conValor.slice(1).map((p, i) => Math.log(p.valor / conValor[i].valor));
  const puntosPorAnio = dias > 0 ? ((conValor.length - 1) * 365) / dias : 0;
  const variacion = redondear((factor - 1) * 100);
  return {
    valorInicial: primero.valor,
    valorFinal: ultimo.valor,
    variacion,
    volatilidad: redondear(desviacion(retornos) * Math.sqrt(puntosPorAnio) * 100),
    tea: dias > 0 ? redondear((factor ** (365 / dias) - 1) * 100) : 0,
    retorno: variacion,
  };
}

/**
 * Medidas de una serie de tasas (CDT): valores en %, variación en puntos porcentuales, TEA igual a la tasa final
 * y sin volatilidad ni retorno (no aplican).
 */
export function metricasTasa(puntos: readonly PuntoSerie[]): MetricasActivo | null {
  const conValor = puntos.filter((p): p is PuntoSerie & { valor: number } => p.valor != null);
  if (!conValor.length) {
    return null;
  }
  const inicial = conValor[0].valor;
  const final = conValor[conValor.length - 1].valor;
  return {
    valorInicial: inicial,
    valorFinal: final,
    variacion: redondear(final - inicial),
    volatilidad: null,
    tea: final,
    retorno: null,
  };
}

/** Periodos de la tabla de desempeño: nombre y fecha de inicio a partir de hoy. */
const PERIODOS_DESEMPENO: readonly { periodo: string; desde: (hoy: Date) => Date }[] = [
  { periodo: '30 días', desde: (h) => restarMeses(h, 1) },
  { periodo: '90 días', desde: (h) => restarMeses(h, 3) },
  { periodo: '180 días', desde: (h) => restarMeses(h, 6) },
  { periodo: 'Año corrido', desde: (h) => new Date(h.getFullYear(), 0, 1) },
  { periodo: '1 año', desde: (h) => restarAnios(h, 1) },
  { periodo: '3 años', desde: (h) => restarAnios(h, 3) },
];

/**
 * Filas de la tabla de desempeño de una receta. La TIR (solo cliente) se aproxima a la TEA descontando el efecto
 * de los flujos; sin historia suficiente para el periodo, la fila queda sin medidas («-»).
 */
export function periodosDesempeno(def: DefinicionSerie, hoy: Date): PeriodoDesempeno[] {
  return PERIODOS_DESEMPENO.map(({ periodo, desde }) => {
    const inicio = desde(hoy);
    const conHistoria = !def.inicio || (desdeIso(def.inicio) as Date) <= inicio;
    const m = conHistoria ? metricasPuntos(puntosSerie(def, { inicio: aIso(inicio), fin: aIso(hoy) }, hoy)) : null;
    return {
      periodo,
      variacion: m?.variacion ?? null,
      volatilidad: m?.volatilidad ?? null,
      tir: m ? redondear(m.tea - 0.37) : null,
      tea: m?.tea ?? null,
      retorno: m?.retorno ?? null,
    };
  });
}
