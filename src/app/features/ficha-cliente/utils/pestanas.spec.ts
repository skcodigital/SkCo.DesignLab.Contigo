import { describe, expect, it } from 'vitest';
import { PRODUCTOS } from '../data/productos.mock';
import {
  normalizarPestana,
  normalizarTipoProducto,
  panelDePestana,
  panelDeProducto,
  pestanasDeProducto,
} from './pestanas';

describe('pestañas de la ficha', () => {
  it('normaliza el query param tab', () => {
    expect(normalizarPestana('copiloto')).toBe('copiloto');
    expect(normalizarPestana('datos')).toBe('datos');
    expect(normalizarPestana(undefined)).toBe('productos');
    expect(normalizarPestana('inexistente')).toBe('productos');
  });

  it('las pestañas sin contenido usan el panel vacío', () => {
    expect(panelDePestana('copiloto')).toBe('copiloto');
    expect(panelDePestana('productos')).toBe('productos');
    expect(panelDePestana('casos')).toBe('otros');
  });
});

describe('secciones del producto', () => {
  it('normaliza el tipo de producto', () => {
    expect(normalizarTipoProducto('fic')).toBe('fic');
    expect(normalizarTipoProducto(undefined)).toBe('mf');
    expect(normalizarTipoProducto('otro')).toBe('mf');
  });

  it('Multifund: con Comportamiento, sin Retenciones', () => {
    const ids = pestanasDeProducto(PRODUCTOS.mf).map((p) => p.id);
    expect(ids).toEqual(['comportamiento', 'composicion', 'movimientos', 'detalles', 'cuentas', 'actividad']);
    expect(pestanasDeProducto(PRODUCTOS.mf).find((p) => p.id === 'cuentas')?.etiqueta).toBe('Cuentas y débito');
  });

  it('FIC: sin Comportamiento, con Retenciones y "Cuentas"', () => {
    const ps = pestanasDeProducto(PRODUCTOS.fic);
    expect(ps.map((p) => p.id)).toEqual(['composicion', 'movimientos', 'retenciones', 'detalles', 'cuentas', 'actividad']);
    expect(ps.find((p) => p.id === 'cuentas')?.etiqueta).toBe('Cuentas');
  });

  it('Movimientos solo tiene panel en el FIC', () => {
    expect(panelDeProducto('composicion', 'mf')).toBe('composicion');
    expect(panelDeProducto('movimientos', 'fic')).toBe('movimientos');
    expect(panelDeProducto('movimientos', 'mf')).toBe('otros');
    expect(panelDeProducto('retenciones', 'fic')).toBe('otros');
  });
});
