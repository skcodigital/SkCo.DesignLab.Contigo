import { describe, expect, it } from 'vitest';
import { construirMes, diasEntre, formatoFechaCorta, formatoFechaLarga, mismoDia, sumarMeses } from './fechas';

const HOY = new Date(2026, 10, 12);
const MIN = new Date(2025, 10, 12);

describe('formatos de fecha', () => {
  it('corta y larga', () => {
    expect(formatoFechaCorta(HOY)).toBe('12/11/2026');
    expect(formatoFechaCorta(new Date(2026, 0, 5))).toBe('05/01/2026');
    expect(formatoFechaLarga(HOY)).toBe('12 de noviembre de 2026');
  });

  it('mismoDia ignora la hora y diasEntre cuenta días', () => {
    expect(mismoDia(HOY, new Date(2026, 10, 12, 18, 30))).toBe(true);
    expect(diasEntre(new Date(2026, 10, 2), HOY)).toBe(10);
    expect(sumarMeses(new Date(2026, 0, 1), -1)).toEqual(new Date(2025, 11, 1));
  });
});

describe('construirMes', () => {
  it('noviembre de 2026: empieza en domingo, bloquea días futuros y la flecha siguiente', () => {
    const mes = construirMes(new Date(2026, 10, 1), HOY, HOY, MIN);
    expect(mes.titulo).toBe('Noviembre 2026');
    expect(mes.vacios).toBe(6);
    expect(mes.dias).toHaveLength(30);
    expect(mes.dias[11]).toMatchObject({ dia: 12, hoy: true, seleccionado: true, deshabilitado: false });
    expect(mes.dias[12].deshabilitado).toBe(true);
    expect(mes.puedeSiguiente).toBe(false);
    expect(mes.puedeAnterior).toBe(true);
  });

  it('noviembre de 2025: bloquea días antes del mínimo y la flecha anterior', () => {
    const mes = construirMes(new Date(2025, 10, 1), HOY, HOY, MIN);
    expect(mes.dias[10].deshabilitado).toBe(true);
    expect(mes.dias[11].deshabilitado).toBe(false);
    expect(mes.puedeAnterior).toBe(false);
    expect(mes.puedeSiguiente).toBe(true);
  });
});
