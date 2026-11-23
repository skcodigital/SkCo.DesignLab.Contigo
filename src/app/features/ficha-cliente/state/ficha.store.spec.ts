import { describe, expect, it } from 'vitest';
import { FichaStore } from './ficha.store';

describe('FichaStore', () => {
  it('arranca en Productos, con saldos visibles y la sección Composición del producto', () => {
    const s = new FichaStore();
    expect(s.pestana()).toBe('productos');
    expect(s.panel()).toBe('productos');
    expect(s.enMision()).toBe(false);
    expect(s.saldosOcultos()).toBe(false);
    expect(s.pestanaProducto()).toBe('composicion');
    expect(s.etiquetaPestanaProducto()).toBe('Composición y saldos');
  });

  it('Planeación Pro activa el modo misión y su panel', () => {
    const s = new FichaStore();
    s.abrirPestana('copiloto');
    expect(s.enMision()).toBe(true);
    expect(s.panel()).toBe('copiloto');
    expect(s.etiquetaPestana()).toBe('Planeación Pro');
    s.volverAProductos();
    expect(s.pestana()).toBe('productos');
  });

  it('las pestañas sin contenido muestran el panel vacío', () => {
    const s = new FichaStore();
    s.abrirPestana('documentos');
    expect(s.panel()).toBe('otros');
  });

  it('alterna ojo y ampliar', () => {
    const s = new FichaStore();
    s.alternarSaldos();
    s.alternarAmpliado();
    expect(s.saldosOcultos()).toBe(true);
    expect(s.kpisAmpliados()).toBe(true);
    s.alternarSaldos();
    expect(s.saldosOcultos()).toBe(false);
  });
});
