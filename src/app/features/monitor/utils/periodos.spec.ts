import {
  OPCIONES_PERIODO,
  PERIODO,
  PILDORAS_PERIODO,
  rangoPorPeriodo,
  rangoVisible,
} from '@features/monitor/utils/periodos';

describe('periodos', () => {
  const hoy = new Date(2026, 10, 12);

  it('ofrece los periodos de producción en orden', () => {
    expect(OPCIONES_PERIODO.map((o) => o.valor)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 10]);
    expect(OPCIONES_PERIODO[3].nombre).toBe('Año en curso (YTD)');
    expect(PILDORAS_PERIODO.map((p) => [p.etiqueta, p.valor])).toEqual([
      ['Últ. mes', 1],
      ['Últ. 6 meses', 3],
      ['Últ. 12 meses', 5],
    ]);
  });

  it('calcula los rangos desde hoy', () => {
    expect(rangoPorPeriodo(PERIODO.ultimoMes, hoy)).toEqual({ inicio: '2026-10-12', fin: '2026-11-12' });
    expect(rangoPorPeriodo(PERIODO.ultimos3Meses, hoy)).toEqual({ inicio: '2026-08-12', fin: '2026-11-12' });
    expect(rangoPorPeriodo(PERIODO.ultimos6Meses, hoy)).toEqual({ inicio: '2026-05-12', fin: '2026-11-12' });
    expect(rangoPorPeriodo(PERIODO.anioEnCurso, hoy)).toEqual({ inicio: '2026-01-01', fin: '2026-11-12' });
    expect(rangoPorPeriodo(PERIODO.ultimoAnio, hoy)).toEqual({ inicio: '2025-11-12', fin: '2026-11-12' });
    expect(rangoPorPeriodo(PERIODO.anioAnterior, hoy)).toEqual({ inicio: '2025-01-01', fin: '2025-12-31' });
    expect(rangoPorPeriodo(PERIODO.ultimos3Anios, hoy)).toEqual({ inicio: '2023-11-12', fin: '2026-11-12' });
    expect(rangoPorPeriodo(PERIODO.ultimos5Anios, hoy)).toEqual({ inicio: '2021-11-12', fin: '2026-11-12' });
  });

  it('«Personalizado» no trae fechas y un valor desconocido cae en «Último mes»', () => {
    expect(rangoPorPeriodo(PERIODO.personalizado, hoy)).toEqual({ inicio: '', fin: '' });
    expect(rangoPorPeriodo('10', hoy)).toEqual({ inicio: '', fin: '' });
    expect(rangoPorPeriodo(99, hoy)).toEqual(rangoPorPeriodo(PERIODO.ultimoMes, hoy));
  });

  it('muestra el rango como DD/Mmm/YYYY', () => {
    expect(rangoVisible(PERIODO.ultimos6Meses, { inicio: '', fin: '' }, hoy)).toEqual({
      inicio: '12/May/2026',
      fin: '12/Nov/2026',
    });
  });

  it('con «Personalizado» muestra el rango elegido', () => {
    expect(rangoVisible(PERIODO.personalizado, { inicio: '2026-02-03', fin: '2026-09-30' }, hoy)).toEqual({
      inicio: '03/Feb/2026',
      fin: '30/Sep/2026',
    });
    expect(rangoVisible(PERIODO.personalizado, { inicio: '', fin: '' }, hoy)).toEqual({ inicio: '', fin: '' });
  });
});
