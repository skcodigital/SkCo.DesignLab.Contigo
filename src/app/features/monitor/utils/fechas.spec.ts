import {
  aIso,
  compararDias,
  desdeIso,
  mismoDia,
  NOMBRES_CALENDARIO,
  normalizarFechaIso,
  restarAnios,
  restarMeses,
  semanasDelMes,
} from '@features/monitor/utils/fechas';

describe('fechas', () => {
  it('aIso y desdeIso van y vuelven en hora local', () => {
    const fecha = new Date(2026, 0, 5);
    expect(aIso(fecha)).toBe('2026-01-05');
    expect(desdeIso('2026-01-05')?.getTime()).toBe(fecha.getTime());
    expect(desdeIso('05/01/2026')).toBeNull();
  });

  it('restarMeses deja el último día si el día no existe (como moment)', () => {
    expect(aIso(restarMeses(new Date(2026, 2, 31), 1))).toBe('2026-02-28');
    expect(aIso(restarMeses(new Date(2024, 2, 31), 1))).toBe('2024-02-29');
    expect(aIso(restarMeses(new Date(2026, 0, 15), 3))).toBe('2025-10-15');
    expect(aIso(restarMeses(new Date(2026, 10, 12), 6))).toBe('2026-05-12');
  });

  it('restarAnios maneja el 29 de febrero', () => {
    expect(aIso(restarAnios(new Date(2024, 1, 29), 1))).toBe('2023-02-28');
    expect(aIso(restarAnios(new Date(2026, 10, 12), 5))).toBe('2021-11-12');
  });

  it('compara días sin la hora', () => {
    const a = new Date(2026, 4, 2, 8);
    const b = new Date(2026, 4, 2, 20);
    expect(mismoDia(a, b)).toBe(true);
    expect(compararDias(a, b)).toBe(0);
    expect(compararDias(new Date(2026, 4, 1), b)).toBeLessThan(0);
  });

  describe('normalizarFechaIso', () => {
    it('acepta los formatos de producción en orden', () => {
      expect(normalizarFechaIso('2026-08-09')).toBe('2026-08-09');
      expect(normalizarFechaIso('08/09/2026')).toBe('2026-08-09');
      expect(normalizarFechaIso('25/09/2026')).toBe('2026-09-25');
      expect(normalizarFechaIso('2026/09/25')).toBe('2026-09-25');
    });

    it('acepta Date y textos libres; null si no es fecha', () => {
      expect(normalizarFechaIso(new Date(2026, 6, 4))).toBe('2026-07-04');
      expect(normalizarFechaIso('2026-07-04T10:00:00')).toBe('2026-07-04');
      expect(normalizarFechaIso('no es fecha')).toBeNull();
      expect(normalizarFechaIso(null)).toBeNull();
      expect(normalizarFechaIso('')).toBeNull();
    });
  });

  it('semanasDelMes arma 6 semanas desde el lunes y marca los días de otros meses', () => {
    // Noviembre de 2026 empieza en domingo.
    const semanas = semanasDelMes(2026, 10);
    expect(semanas).toHaveLength(6);
    expect(semanas.every((s) => s.length === 7)).toBe(true);
    expect(aIso(semanas[0][0].fecha)).toBe('2026-10-26');
    expect(semanas[0][0].fuera).toBe(true);
    expect(aIso(semanas[0][6].fecha)).toBe('2026-11-01');
    expect(semanas[0][6].fuera).toBe(false);
    expect(semanas[5][6].fuera).toBe(true);
  });

  it('trae los nombres del calendario de cada configuración regional', () => {
    expect(NOMBRES_CALENDARIO['es-CO'].diasCortos[0]).toBe('LU');
    expect(NOMBRES_CALENDARIO['es-CO'].mesesCortos[8]).toBe('sept');
    expect(NOMBRES_CALENDARIO['en-US'].mesesLargos[10]).toBe('November');
    expect(NOMBRES_CALENDARIO['en-US'].diasCortos[6]).toBe('Su');
  });
});
