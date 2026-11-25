import { ACTIVOS_EXTERIOR_CON_CDT, ACTIVOS_EXTERIOR_EJEMPLO } from '@features/monitor/data/detalle-exterior.mock';
import { HOY_MONITOR, PLAZOS_CDT, PORTAFOLIOS_SKANDIA } from '@features/monitor/data/detalle-catalogos.mock';
import { ActivoComparado } from '@features/monitor/interfaces/detalle';
import { activoComparado, activosComparados, diasPlazo, puntosTasaMovil } from '@features/monitor/utils/detalle-activos';
import {
  activosSinDatos,
  COLUMNAS_COMPARACION,
  datosRiesgoRetorno,
  filasComparacion,
  opcionesTablaComparacion,
  sentidoFlecha,
  separarPlazoCdt,
  tieneDetalle,
} from '@features/monitor/utils/detalle-comparacion';
import { armarTendencia, tooltipTendencia } from '@features/monitor/utils/detalle-graficas';
import { opcionesRiesgoRetorno } from '@features/monitor/utils/detalle-riesgo-retorno';

const RANGO = { inicio: '2026-10-12', fin: '2026-11-12' };

describe('detalle-comparacion', () => {
  it('separa el plazo del CDT del nombre', () => {
    expect(separarPlazoCdt('FPV Strategist Conservador - Rentabilidad móvil 90 días (A 90 DIAS)')).toEqual({
      base: 'FPV Strategist Conservador',
      plazo: 'CDT A 90 días',
    });
    expect(separarPlazoCdt('FIC Skandia Efectivo')).toBeNull();
  });

  it('arma las filas de mayor a menor valor inicial con el nombre de cada tipo', () => {
    const filas = filasComparacion(ACTIVOS_EXTERIOR_EJEMPLO);
    expect(filas.length).toBe(6);
    filas.slice(1).forEach((f, i) => expect(f.valorInicial).toBeLessThanOrEqual(filas[i].valorInicial));
    const nombres = filas.map((f) => f.nombre);
    expect(nombres).toContain('Inflación');
    expect(nombres).toContain('Paciente');
    expect(nombres).toContain('Acciones Globales');
    expect(filasComparacion(ACTIVOS_EXTERIOR_EJEMPLO, ['US$']).some((f) => f.clave === 'US$')).toBe(false);
  });

  it('riesgo y retorno deja fuera los CDT', () => {
    expect(datosRiesgoRetorno(ACTIVOS_EXTERIOR_CON_CDT).some((d) => d.clave.startsWith('CDT-'))).toBe(false);
    expect(filasComparacion(ACTIVOS_EXTERIOR_CON_CDT).some((f) => f.tipo === 'cdt')).toBe(true);
  });

  it('solo mezclas y portafolios abren el detalle', () => {
    const porClave = (c: string) => ACTIVOS_EXTERIOR_EJEMPLO.find((a) => a.clave === c);
    expect(tieneDetalle(porClave('PACIENTE'))).toBe(true);
    expect(tieneDetalle(porClave('1_AA02'))).toBe(true);
    expect(tieneDetalle(porClave('US$'))).toBe(false);
  });

  it('lista los activos sin datos en el orden de producción', () => {
    const vacio = (a: ActivoComparado): ActivoComparado => ({ ...a, puntos: [], metricas: null });
    const texto = activosSinDatos(ACTIVOS_EXTERIOR_EJEMPLO.map(vacio));
    expect(texto).toBe(
      'Dólar (US$), UVR (UVR), FPV Strategist Conservador, FIC Skandia Efectivo, Paciente (Invest-ed), Acciones Globales (ADMINISTRADORA ANDINA)',
    );
  });

  it('flecha del listado móvil', () => {
    expect(sentidoFlecha('0')).toBe('sube');
    expect(sentidoFlecha('-1.2%')).toBe('baja');
    expect(sentidoFlecha(null)).toBeNull();
  });

  it('tabla: «Ver más», formato de CDT y plazo como subtítulo', () => {
    const filas = filasComparacion(ACTIVOS_EXTERIOR_CON_CDT);
    const o = opcionesTablaComparacion(filas, COLUMNAS_COMPARACION, true, (f) => f['clave'] === 'PACIENTE_90');
    const cdt = filas.find((f) => f.tipo === 'cdt') ?? filas[0];
    expect(o.tooltipCelda?.(cdt, 'valorInicial')).toBe('Tasa promedio inicial del período (%)');
    expect(o.formatoCelda?.(cdt, 'variacion', -0.25)).toBe('-0.25 p.p.');
    expect(o.formatoCelda?.(cdt, 'valorFinal', 9.5)).toBe('9.50%');
    expect(o.formatoCelda?.(cdt, 'retorno', null)).toBe('-');
    const portafolio = filas.find((f) => f.clave === 'FPVSTGCONS_90') ?? filas[0];
    expect(o.formatoCelda?.(portafolio, 'nombre', portafolio.nombre)).toBe('FPV Strategist Conservador');
    expect(o.subtituloCelda?.(portafolio, 'nombre')).toBe('CDT A 90 días');
    const mezcla = filas.find((f) => f.clave === 'PACIENTE_90') ?? filas[0];
    expect(o.tooltipCelda?.(mezcla, 'nombre')).toBe('Ver más');
    expect(o.tooltipCelda?.(portafolio, 'nombre')).toBe(portafolio.nombre);
  });
});

describe('detalle-activos', () => {
  it('lee los días del plazo y calcula la rentabilidad móvil', () => {
    expect(diasPlazo(PLAZOS_CDT[2])).toBe(90);
    const puntos = puntosTasaMovil(PORTAFOLIOS_SKANDIA[3], RANGO, HOY_MONITOR, 30);
    expect(puntos.length).toBe(32);
    expect(Math.abs(Number(puntos.at(-1)?.valor) - 9.12)).toBeLessThan(5);
  });

  it('con un CDT los demás activos pasan a tasa y cambian de nombre', () => {
    const [portafolio, cdt] = activosComparados(
      [PORTAFOLIOS_SKANDIA[0], { ...PORTAFOLIOS_SKANDIA[0], clave: 'CDT-30', tipo: 'cdt', color: '#ED3833' }],
      RANGO,
      HOY_MONITOR,
      PLAZOS_CDT,
    );
    expect(portafolio.clave).toBe('FPVSTGCONS_30');
    expect(portafolio.nombre).toBe('FPV Strategist Conservador - Rentabilidad móvil 30 días (A 30 DIAS)');
    expect(cdt.color).toBe('#ED3833');
    expect(activoComparado(PORTAFOLIOS_SKANDIA[0], RANGO, HOY_MONITOR, '#000').clave).toBe('FPVSTGCONS');
  });
});

describe('detalle-graficas', () => {
  it('arma la tendencia con fechas comunes, leyenda y eje', () => {
    const d = armarTendencia(ACTIVOS_EXTERIOR_EJEMPLO);
    expect(d).not.toBeNull();
    expect(d?.series.length).toBe(6);
    expect(d?.leyenda.every((l) => l.removible)).toBe(true);
    expect(d?.leyenda.find((l) => l.nombre === 'UVR')?.nombreVisible).toBe('Inflación');
    expect(d?.etiquetas.at(-1)).toBe('12 nov 26');
    expect(armarTendencia([])).toBeNull();
  });

  it('el tooltip muestra pesos, números de indicadores y el aviso de inflación', () => {
    const d = armarTendencia(ACTIVOS_EXTERIOR_EJEMPLO);
    if (!d) {
      throw new Error('sin tendencia');
    }
    const ultimo = d.etiquetas.length - 1;
    const params = d.series.map((s) => {
      const serie = s as { name: string; color: string; data: unknown[] };
      return { seriesName: serie.name, color: serie.color, axisValue: d.etiquetas[ultimo], data: serie.data[ultimo] };
    });
    const html = tooltipTendencia(params, d, false);
    expect(html).toContain('<b>12 nov 26</b>');
    expect(html).toContain('<b>FIC Skandia Efectivo</b>: $13,287.45');
    expect(html).toContain('Muestra la variación acumulada de la inflación');
    const conCdt = tooltipTendencia(params, d, true);
    expect(conCdt).toContain('13,287.45%');
  });

  it('riesgo y retorno sin puntos muestra el texto de sin datos', () => {
    const vacio = opcionesRiesgoRetorno([], [], () => undefined) as { graphic?: { style?: { text?: string } } };
    expect(vacio.graphic?.style?.text).toBe('No hay datos disponibles');
    const datos = datosRiesgoRetorno(ACTIVOS_EXTERIOR_EJEMPLO);
    const o = opcionesRiesgoRetorno(datos, [datos[0].clave], () => undefined) as { series: unknown[] };
    expect(o.series.length).toBe(datos.length - 1);
  });
});
