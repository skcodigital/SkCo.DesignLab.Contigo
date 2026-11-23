import { describe, expect, it } from 'vitest';
import { ProductoStore } from './producto.store';

describe('ProductoStore', () => {
  it('arranca con el Multifund en Composición a la fecha de hoy', () => {
    const s = new ProductoStore();
    const v = s.vista();
    expect(v.segmento).toBe('actual');
    expect(v.estado).toBe('efectivo');
    expect(v.fechaTexto).toBe('12/11/2026');
    expect(v.contrato).toBe('100000063061');
    expect(v.filas).toHaveLength(6);
    expect(v.total).toBe('$ 52.732.191');
  });

  it('la fecha de corte recalcula filas, total, dona y etiqueta', () => {
    const s = new ProductoStore();
    s.elegirFechaCorte(new Date(2026, 2, 3));
    const v = s.vista();
    expect(v.fechaTexto).toBe('03/03/2026');
    expect(v.total).not.toBe('$ 52.732.191');
    expect(v.etiquetaDona).toContain('3 de marzo de 2026');
    expect(v.gradiente).toMatch(/^conic-gradient\(/);
  });

  it('cargar el FIC trae su único portafolio y reinicia segmento y fecha', () => {
    const s = new ProductoStore();
    s.elegirSegmento('standing');
    s.elegirFechaCorte(new Date(2026, 0, 2));
    s.cargarProducto('fic');
    const v = s.vista();
    expect(v.tipo).toBe('fic');
    expect(v.segmento).toBe('actual');
    expect(v.fechaTexto).toBe('12/11/2026');
    expect(v.filas.map((f) => f.nombre)).toEqual(['FIC Skandia Efectivo']);
    expect(v.total).toBe('$ 8.415.300');
  });

  it('elige el estado de los saldos', () => {
    const s = new ProductoStore();
    s.elegirEstado('proceso');
    expect(s.vista().estado).toBe('proceso');
  });
});
