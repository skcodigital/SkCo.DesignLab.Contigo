import { RangoFechas } from '@features/monitor/interfaces/comunes';
import {
  ActivoComparado,
  DefinicionActivo,
  PlazoCdt,
  PuntoSerie,
  TipoActivo,
} from '@features/monitor/interfaces/detalle';
import { COLORES_GRAFICA, COLORES_GRAFICA_COMPARAR } from '@features/monitor/utils/graficas';
import { aIso, desdeIso } from '@features/monitor/utils/fechas';
import {
  diasEntre,
  metricasPuntos,
  metricasTasa,
  puntosSerie,
  redondear,
  valorSerie,
} from '@features/monitor/utils/detalle-series';

/**
 * Activos de la comparación a partir de sus recetas: puntos y medidas del rango, color según el tipo (como los
 * asignaba producción) y, con un CDT elegido, la rentabilidad móvil en el plazo del CDT.
 */

/** Días del plazo de un CDT a partir de su descripción («A 30 DIAS» → 30). */
export function diasPlazo(plazo: PlazoCdt): number {
  return Number(/(\d+)/.exec(plazo.descripcion)?.[1] ?? 30);
}

/** Plazo como lo muestra producción junto al activo comparado contra un CDT («CDT A 30 días»). */
export function plazoVisible(plazo: PlazoCdt): string {
  const texto = plazo.descripcion.trim().toLowerCase().replace(/\bdias\b/g, 'días');
  return `CDT ${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
}

/**
 * Rentabilidad efectiva anual móvil en `dias` (en %), día a día dentro del rango: la serie con la que producción
 * compara un portafolio contra un CDT.
 */
export function puntosTasaMovil(
  activo: DefinicionActivo,
  rango: RangoFechas,
  hoy: Date,
  dias: number,
): PuntoSerie[] {
  return puntosSerie(activo.serie, rango, hoy).map((p) => {
    const k = diasEntre(desdeIso(p.fechaIso) as Date, hoy);
    const tasa = ((Number(p.valor) / valorSerie(activo.serie, k + dias)) ** (365 / dias) - 1) * 100;
    return { ...p, valor: redondear(tasa), valorNormalizado: redondear(tasa) };
  });
}

/** Color de la paleta por tipo: portafolios desde el final, indicadores y divisas desde la mitad de la segunda. */
export function colorPorTipo(tipo: TipoActivo, indice: number): string {
  const base = COLORES_GRAFICA.exterior;
  switch (tipo) {
    case 'portafolio':
      return base[base.length - 1 - (indice % base.length)];
    case 'indicador':
    case 'divisa': {
      const mitad = Math.floor(COLORES_GRAFICA_COMPARAR.length / 2);
      return COLORES_GRAFICA_COMPARAR[(mitad + indice) % COLORES_GRAFICA_COMPARAR.length];
    }
    case 'mezcla':
      return base[(2 + indice) % base.length];
    default:
      return COLORES_GRAFICA_COMPARAR[indice % COLORES_GRAFICA_COMPARAR.length];
  }
}

/**
 * Un activo comparado en el rango. Con `plazo` (CDT elegido) los demás activos pasan a su rentabilidad móvil en
 * ese plazo y su nombre lleva «- Rentabilidad móvil N días (A N DIAS)», como lo devolvía el servicio.
 */
export function activoComparado(
  def: DefinicionActivo,
  rango: RangoFechas,
  hoy: Date,
  color: string,
  plazo?: PlazoCdt,
): ActivoComparado {
  const comun = {
    tipo: def.tipo,
    color: def.color ?? color,
    ...(def.imagen ? { imagen: def.imagen } : {}),
    ...(def.compania ? { compania: def.compania } : {}),
    ...(def.detalle ? { detalle: def.detalle } : {}),
  };
  if (def.tipo === 'cdt') {
    const puntos = puntosSerie(def.serie, rango, hoy);
    return { ...comun, clave: def.clave, nombre: def.nombre, puntos, metricas: metricasTasa(puntos) };
  }
  const base = puntosSerie(def.serie, rango, hoy);
  if (!plazo) {
    return { ...comun, clave: def.clave, nombre: def.nombre, puntos: base, metricas: metricasPuntos(base) };
  }
  const dias = diasPlazo(plazo);
  return {
    ...comun,
    clave: `${def.clave}_${dias}`,
    nombre: `${def.nombre} - Rentabilidad móvil ${dias} días (${plazo.descripcion})`,
    puntos: puntosTasaMovil(def, rango, hoy, dias),
    metricas: metricasPuntos(base),
  };
}

/**
 * Activos elegidos en el rango, con el color de cada tipo en el orden en que se eligieron. Si alguno es un CDT,
 * el resto se compara en su plazo (el del primer CDT).
 */
export function activosComparados(
  defs: readonly DefinicionActivo[],
  rango: RangoFechas,
  hoy: Date,
  plazos: readonly PlazoCdt[] = [],
): ActivoComparado[] {
  const cdt = defs.find((d) => d.tipo === 'cdt');
  const plazo = cdt ? plazos.find((p) => cdt.clave === `CDT-${p.subcuenta}`) : undefined;
  const contador = new Map<string, number>();
  return defs.map((d) => {
    const grupo = d.tipo === 'divisa' ? 'indicador' : d.tipo;
    const i = contador.get(grupo) ?? 0;
    contador.set(grupo, i + 1);
    return activoComparado(d, rango, hoy, colorPorTipo(d.tipo, i), plazo);
  });
}

/** Rango ISO de `dias` hacia atrás desde hoy (útil para las pruebas y los ejemplos). */
export function rangoUltimosDias(hoy: Date, dias: number): RangoFechas {
  return { inicio: aIso(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dias)), fin: aIso(hoy) };
}
