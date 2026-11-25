import { DefinicionSerie } from '@features/monitor/interfaces/detalle';
import {
  diasEntre,
  etiquetaAmigable,
  metricasPuntos,
  metricasTasa,
  periodosDesempeno,
  puntosSerie,
  redondear,
  valorSerie,
} from '@features/monitor/utils/detalle-series';

const HOY = new Date(2026, 10, 12);
const DEF: DefinicionSerie = { semilla: 1, valorHoy: 1000, rentabilidadAnual: 10, volatilidad: 1 };

describe('detalle-series', () => {
  it('arma la etiqueta amigable de producción', () => {
    expect(etiquetaAmigable(new Date(2026, 10, 5))).toBe('5 nov 26');
    expect(etiquetaAmigable(new Date(2025, 0, 31))).toBe('31 ene 25');
  });

  it('cuenta días calendario', () => {
    expect(diasEntre(new Date(2026, 0, 1), new Date(2026, 0, 31))).toBe(30);
    expect(diasEntre(new Date(2026, 2, 1), new Date(2026, 2, 31))).toBe(30);
  });

  it('el valor de hoy es el de la receta y la serie es determinista', () => {
    expect(valorSerie(DEF, 0)).toBe(1000);
    expect(valorSerie(DEF, 120)).toBe(valorSerie(DEF, 120));
    expect(valorSerie(DEF, 365)).toBeLessThan(1000);
  });

  it('da los puntos del rango sin pasar de hoy y base 1.000 en el primero', () => {
    const puntos = puntosSerie(DEF, { inicio: '2026-11-01', fin: '2026-11-30' }, HOY);
    expect(puntos.length).toBe(12);
    expect(puntos[0].valorNormalizado).toBe(1000);
    expect(puntos.at(-1)?.fechaIso).toBe('2026-11-12');
    expect(puntos.at(-1)?.valor).toBe(1000);
  });

  it('respeta días hábiles e inicio de la serie', () => {
    const habiles = puntosSerie({ ...DEF, soloHabiles: true }, { inicio: '2026-11-02', fin: '2026-11-08' }, HOY);
    expect(habiles.map((p) => p.fechaIso)).toEqual(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']);
    const conInicio = puntosSerie({ ...DEF, inicio: '2026-11-10' }, { inicio: '2026-11-01', fin: '2026-11-12' }, HOY);
    expect(conInicio.length).toBe(3);
  });

  it('calcula variación, TEA, retorno y volatilidad', () => {
    const m = metricasPuntos([
      { fechaIso: '2025-11-12', etiqueta: '', valor: 100, valorNormalizado: 1000 },
      { fechaIso: '2026-11-12', etiqueta: '', valor: 110, valorNormalizado: 1100 },
    ]);
    expect(m).toEqual({ valorInicial: 100, valorFinal: 110, variacion: 10, volatilidad: 0, tea: 10, retorno: 10 });
    expect(metricasPuntos([])).toBeNull();
  });

  it('mide las tasas en puntos porcentuales', () => {
    const m = metricasTasa([
      { fechaIso: '2026-11-01', etiqueta: '', valor: 9.5, valorNormalizado: 9.5 },
      { fechaIso: '2026-11-12', etiqueta: '', valor: 9.2, valorNormalizado: 9.2 },
    ]);
    expect(m?.variacion).toBe(-0.3);
    expect(m?.volatilidad).toBeNull();
    expect(m?.retorno).toBeNull();
  });

  it('arma la tabla de desempeño; sin historia el periodo queda sin medidas', () => {
    const filas = periodosDesempeno({ ...DEF, inicio: '2025-01-01' }, HOY);
    expect(filas.map((f) => f.periodo)).toEqual(['30 días', '90 días', '180 días', 'Año corrido', '1 año', '3 años']);
    expect(filas[0].tea).not.toBeNull();
    expect(filas[0].tir).toBe(redondear((filas[0].tea ?? 0) - 0.37));
    expect(filas[5].variacion).toBeNull();
  });
});
