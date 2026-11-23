import { describe, expect, it } from 'vitest';
import { ProductoStore } from './producto.store';

describe('ProductoStore', () => {
  it('arranca en Composición a la fecha de hoy', () => {
    const s = new ProductoStore();
    expect(s.segmento()).toBe('actual');
    expect(s.fechaCorteTexto()).toBe('12/11/2026');
    expect(s.filas().map((f) => f.porcentaje)).toEqual([65, 35]);
  });

  it('la fecha de corte recalcula filas, dona y etiqueta', () => {
    const s = new ProductoStore();
    const antes = s.filas()[0].saldo;
    s.elegirFechaCorte(new Date(2026, 2, 3));
    expect(s.fechaCorteTexto()).toBe('03/03/2026');
    expect(s.filas()[0].saldo).toBeLessThan(antes);
    expect(s.etiquetaDona()).toContain('3 de marzo de 2026');
    expect(s.gradiente()).toMatch(/^conic-gradient\(/);
  });

  it('cambia a Standing allocation', () => {
    const s = new ProductoStore();
    s.elegirSegmento('standing');
    expect(s.segmento()).toBe('standing');
  });
});
