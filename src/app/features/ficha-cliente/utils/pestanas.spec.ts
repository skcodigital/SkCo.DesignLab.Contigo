import { describe, expect, it } from 'vitest';
import { normalizarPestana, panelDePestana } from './pestanas';

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
