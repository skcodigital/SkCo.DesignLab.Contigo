import {
  capitalizar,
  formatearFechaCorta,
  formatearNumero,
  formatearPesos,
  numeroColombiano,
  numeroColombianoDosDecimales,
} from '@features/monitor/utils/formatos';

describe('formatos', () => {
  describe('formatearNumero (DecimalPipe)', () => {
    it('usa coma decimal en el cliente (es-CO) y punto en el exterior (en-US)', () => {
      expect(formatearNumero(1234.567, 2, 2, 'es-CO')).toBe('1.234,57');
      expect(formatearNumero(1234.567, 2, 2, 'en-US')).toBe('1,234.57');
    });

    it('respeta mínimo y máximo de decimales', () => {
      expect(formatearNumero(3, 0, 2, 'en-US')).toBe('3');
      expect(formatearNumero(3.14159, 0, 3, 'en-US')).toBe('3.142');
      expect(formatearNumero(-0.5, 2, 2, 'es-CO')).toBe('-0,50');
    });

    it('acepta texto numérico y devuelve vacío si no es número', () => {
      expect(formatearNumero('12.5', 2, 2, 'en-US')).toBe('12.50');
      expect(formatearNumero('abc', 2, 2, 'en-US')).toBe('');
      expect(formatearNumero('', 2, 2, 'en-US')).toBe('');
    });
  });

  it('numeroColombiano agrupa con punto y deja hasta 3 decimales', () => {
    expect(numeroColombiano(4321.5)).toBe('4.321,5');
    expect(numeroColombiano(7000)).toBe('7.000');
    expect(numeroColombiano(0.12345)).toBe('0,123');
  });

  it('numeroColombianoDosDecimales siempre muestra 2 decimales', () => {
    expect(numeroColombianoDosDecimales(7.1)).toBe('7,10');
    expect(numeroColombianoDosDecimales(-2)).toBe('-2,00');
  });

  it('formatearPesos da pesos sin decimales', () => {
    expect(formatearPesos(2500000).replace(/\s/g, ' ')).toBe('$ 2.500.000');
    expect(formatearPesos('1999.6').replace(/\s/g, ' ')).toBe('$ 2.000');
  });

  it('formatearFechaCorta da dd/MM/yyyy en hora local', () => {
    expect(formatearFechaCorta('2026-03-07T12:00:00')).toBe('07/03/2026');
    expect(formatearFechaCorta(new Date(2026, 10, 12))).toBe('12/11/2026');
    // Solo fecha: sin el corrimiento a UTC que la mostraría un día antes en Colombia
    expect(formatearFechaCorta('2026-11-12')).toBe('12/11/2026');
  });

  it('capitalizar sube la primera letra de cada palabra (con el mismo límite de palabra de producción)', () => {
    expect(capitalizar('FONDO DE PRUEBA')).toBe('Fondo De Prueba');
    expect(capitalizar('cdt a 90 días')).toBe('Cdt A 90 DíAs');
    expect(capitalizar('')).toBe('');
  });
});
