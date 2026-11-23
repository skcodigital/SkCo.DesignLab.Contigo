import { describe, expect, it } from 'vitest';
import { enmascararMontos, formatoDecimal, formatoPesos } from './montos';

describe('enmascararMontos', () => {
  it('enmascara un monto suelto', () => {
    expect(enmascararMontos('$358.900.109')).toBe('$ ••••••');
  });

  it('enmascara solo los montos y conserva el resto del texto', () => {
    expect(enmascararMontos('Rendimientos $5.662.279 y $ 2.000.000')).toBe('Rendimientos $ •••••• y $ ••••••');
  });

  it('no toca textos sin montos', () => {
    expect(enmascararMontos('13.5%')).toBe('13.5%');
    expect(enmascararMontos('En proceso')).toBe('En proceso');
  });
});

describe('formatos', () => {
  it('formatoPesos redondea y agrupa miles', () => {
    expect(formatoPesos(34275924.4)).toBe('$ 34.275.924');
  });

  it('formatoDecimal fija decimales con coma', () => {
    expect(formatoDecimal(1222.77, 2)).toBe('1.222,77');
    expect(formatoDecimal(9.1, 2)).toBe('9,10');
  });
});
