import { describe, expect, it } from 'vitest';
import { FichaStore } from './ficha.store';

describe('FichaStore', () => {
  it('arranca en Productos, con saldos visibles y el Multifund en Composición y saldos', () => {
    const s = new FichaStore();
    expect(s.pestana()).toBe('productos');
    expect(s.panel()).toBe('productos');
    expect(s.enMision()).toBe(false);
    expect(s.saldosOcultos()).toBe(false);
    expect(s.producto().tipo).toBe('mf');
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

  it('abrir el FIC vuelve a Composición y saldos y habilita Movimientos', () => {
    const s = new FichaStore();
    s.abrirSeccionProducto('detalles');
    s.abrirProducto('fic');
    expect(s.pestanaProducto()).toBe('composicion');
    expect(s.nombreProducto()).toBe('Viaje ✈️');
    s.abrirSeccionProducto('movimientos');
    expect(s.panelProducto()).toBe('movimientos');
    s.abrirSeccionProducto('cuentas');
    expect(s.etiquetaPestanaProducto()).toBe('Cuentas');
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
