import { FilaTabla, OpcionesTabla } from '@features/monitor/interfaces/comunes';
import {
  alineacionColumna,
  columnasTabla,
  compararFechas,
  compararNumeros,
  compararTextos,
  filasDePagina,
  formatearCelda,
  ordenarFilas,
  paginasPaginador,
  tamanosPagina,
  textoParaCopiar,
  tipoColumna,
  vistaFilas,
} from '@features/monitor/utils/tabla';

const FILAS: FilaTabla[] = [
  { nombre: 'Portafolio Beta', saldo: 1500, fecha: '2026-03-01T12:00:00' },
  { nombre: 'Portafolio Alfa', saldo: 300.5, fecha: '-' },
  { nombre: 'Portafolio Gamma', saldo: 9000, fecha: '2025-12-31T12:00:00' },
];

function opciones(parcial: Partial<OpcionesTabla> = {}): OpcionesTabla {
  return {
    claves: ['nombre', 'saldo', 'fecha'],
    etiquetas: ['Nombre', 'Saldo', 'Fecha'],
    datos: FILAS,
    tiposColumna: ['texto', 'dinero', 'fecha'],
    ordenable: true,
    conPaginador: false,
    conAcciones: false,
    ...parcial,
  };
}

describe('tabla', () => {
  it('compara textos, números y fechas en ambos sentidos', () => {
    expect(compararTextos('a', 'b', true)).toBeLessThan(0);
    expect(compararTextos('a', 'b', false)).toBeGreaterThan(0);
    expect(compararNumeros(1, 5, true)).toBe(-4);
    expect(compararNumeros(1, 5, false)).toBe(4);
    expect(compararFechas(new Date(2026, 0, 2), new Date(2026, 0, 1), true)).toBeGreaterThan(0);
  });

  describe('ordenarFilas', () => {
    it('ordena números y no modifica la lista original', () => {
      const asc = ordenarFilas(FILAS, 'saldo', 'dinero', true);
      expect(asc.map((f) => f['saldo'])).toEqual([300.5, 1500, 9000]);
      expect(FILAS[0]['nombre']).toBe('Portafolio Beta');
      expect(ordenarFilas(FILAS, 'saldo', 'porcentaje', false).map((f) => f['saldo'])).toEqual([9000, 1500, 300.5]);
    });

    it('ordena textos con localeCompare', () => {
      expect(ordenarFilas(FILAS, 'nombre', 'texto', true).map((f) => f['nombre'])).toEqual([
        'Portafolio Alfa',
        'Portafolio Beta',
        'Portafolio Gamma',
      ]);
    });

    it("ordena fechas tomando '-' como ahora", () => {
      const ahora = new Date(2026, 10, 12);
      expect(ordenarFilas(FILAS, 'fecha', 'fecha', true, ahora).map((f) => f['nombre'])).toEqual([
        'Portafolio Gamma',
        'Portafolio Beta',
        'Portafolio Alfa',
      ]);
    });
  });

  describe('paginasPaginador', () => {
    const casos: [number, number, (number | '...')[]][] = [
      [1, 3, [1, 2, 3]],
      [1, 10, [1, 2, '...', 10]],
      [2, 10, [1, 2, 3, '...', 10]],
      [5, 10, [1, '...', 4, 5, 6, '...', 10]],
      [9, 10, [1, '...', 8, 9, 10]],
      [10, 10, [1, '...', 9, 10]],
    ];
    casos.forEach(([actual, total, esperado]) => {
      it(`página ${actual} de ${total}`, () => expect(paginasPaginador(actual, total)).toEqual(esperado));
    });
  });

  it('pagina las filas solo si hay paginador', () => {
    expect(filasDePagina([1, 2, 3, 4, 5, 6], 2, 4, true)).toEqual([5, 6]);
    expect(filasDePagina([1, 2, 3], 2, 1, false)).toEqual([1, 2, 3]);
  });

  it('agrega el total de filas a los tamaños de página', () => {
    expect(tamanosPagina([5, 10, 20, 100], 7)).toEqual([5, 7, 10, 20, 100]);
    expect(tamanosPagina([5, 10], 10)).toEqual([5, 10]);
  });

  describe('formatearCelda', () => {
    it('formatea por tipo en en-US', () => {
      expect(formatearCelda(1234.5, 'dinero', 'cliente')).toBe('$ 1,234.50');
      expect(formatearCelda(2.5, 'numero', 'cliente')).toBe('2.5');
      expect(formatearCelda('2026-03-01T12:00:00', 'fecha', 'cliente')).toBe('01/03/2026');
      expect(formatearCelda('Texto', 'texto', 'cliente')).toBe('Texto');
    });

    it('el porcentaje lleva 3 decimales en el cliente y 2 en el exterior', () => {
      expect(formatearCelda(1.23456, 'porcentaje', 'cliente')).toBe('1.235 %');
      expect(formatearCelda(1.23456, 'porcentaje', 'exterior')).toBe('1.23 %');
    });

    it('sin valor muestra guion, o nada si la celda tiene ícono; el cero sí se muestra', () => {
      expect(formatearCelda(null, 'dinero', 'cliente')).toBe('-');
      expect(formatearCelda('', 'texto', 'cliente', true)).toBe('');
      expect(formatearCelda('-', 'dinero', 'cliente')).toBe('-');
      expect(formatearCelda(0, 'dinero', 'cliente')).toBe('$ 0.00');
    });
  });

  describe('textoParaCopiar', () => {
    const encabezados = ['Código', 'Saldo', 'Variación'];
    const filas = [['100200', '$ 1,234.50', '2.5 %']];
    const tipos = ['texto', 'dinero', 'porcentaje'] as const;

    it('cliente: números sin formato, % como fracción y códigos como texto', () => {
      expect(textoParaCopiar(encabezados, filas, tipos, 'cliente')).toBe(
        'Código\tSaldo\tVariación\n="100200"\t1234.5\t0.025\n',
      );
    });

    it('exterior: números con 2 decimales y el % pegado', () => {
      expect(textoParaCopiar(encabezados, filas, tipos, 'exterior')).toBe(
        'Código\tSaldo\tVariación\n100200.00\t1234.50\t2.50%\n',
      );
    });

    it('deja el texto que no es número', () => {
      expect(textoParaCopiar(['A'], [['-']], ['dinero'], 'cliente')).toBe('A\n-\n');
    });
  });

  describe('columnas y filas de la vista', () => {
    it('ordena distinto el encabezado y el cuerpo, como producción', () => {
      const c = columnasTabla(
        opciones({ mostrarColumnaIndice: true, conAccionesFila: true, posicionAccionesFila: 'inicio', conAcciones: true }),
        null,
      );
      expect(c.encabezado.map((x) => x.tipo)).toEqual(['indice', 'accionesInicio', 'dato', 'dato', 'dato', 'acciones']);
      expect(c.cuerpo.map((x) => x.tipo)).toEqual(['accionesInicio', 'indice', 'dato', 'dato', 'dato', 'acciones']);
    });

    it('filtra por columnas visibles y conserva la posición original', () => {
      const c = columnasTabla(opciones(), { nombre: true, fecha: true });
      expect(c.datos).toEqual([
        { tipo: 'dato', clave: 'nombre', indice: 0, posicion: 0 },
        { tipo: 'dato', clave: 'fecha', indice: 2, posicion: 1 },
      ]);
    });

    it('tipo y alineación por defecto', () => {
      expect(tipoColumna(opciones({ tiposColumna: undefined }), 1)).toBe('texto');
      expect(alineacionColumna(opciones(), 0)).toBe('center');
      expect(alineacionColumna(opciones({ alineaciones: ['start'] }), 1)).toBeNull();
    });

    it('arma las celdas con formato propio, ícono, tooltip y subtítulo', () => {
      const o = opciones({
        formatoCelda: (_f, clave) => (clave === 'nombre' ? 'Propio' : null),
        iconosColumna: () => [null, { icono: 'flecha-sube', color: '#00c73d' }, null],
        posicionIconosColumna: () => ['', 'fin', ''],
        tooltipCelda: (_f, clave) => (clave === 'nombre' ? 'Ver más' : ''),
        subtituloCelda: (_f, clave) => (clave === 'nombre' ? 'CDT A 90 días' : null),
      });
      const [fila] = vistaFilas(o, [FILAS[0]], columnasTabla(o, null).datos, 'cliente');
      expect(fila.celdas[0]).toEqual({
        texto: 'Propio',
        subtitulo: 'CDT A 90 días',
        icono: null,
        posicionIcono: '',
        tooltipIcono: '',
        tooltip: 'Ver más',
      });
      expect(fila.celdas[1].texto).toBe('$ 1,500.00');
      expect(fila.celdas[1].icono).toEqual({ icono: 'flecha-sube', color: '#00c73d' });
      expect(fila.celdas[1].posicionIcono).toBe('fin');
    });
  });
});
