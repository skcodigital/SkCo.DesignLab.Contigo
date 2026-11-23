import { fmtNum, fmtPesos, fmtVariacion, pct, signo } from '@features/radiografia/utils/formato';

describe('formato', () => {
  it('fmtNum usa coma decimal de es-CO', () => {
    expect(fmtNum(33, 1)).toBe('33,0');
    expect(fmtNum(9.24, 1)).toBe('9,2');
  });

  it('fmtPesos antepone el signo pesos con separador de miles', () => {
    expect(fmtPesos(27400)).toBe('$' + (27400).toLocaleString('es-CO'));
    expect(fmtPesos(410)).toBe('$410');
  });

  it('signo usa el menos tipográfico', () => {
    expect(signo(3)).toBe('+3');
    expect(signo(-2)).toBe('−2');
    expect(signo(0)).toBe('0');
  });

  it('pct redondea al entero', () => {
    expect(pct(239, 412)).toBe(58);
  });

  it('fmtVariacion con un decimal, coma y signo', () => {
    expect(fmtVariacion(4.83)).toBe('+4,8%');
    expect(fmtVariacion(-7.31)).toBe('−7,3%');
    expect(fmtVariacion(0)).toBe('0,0%');
  });
});
