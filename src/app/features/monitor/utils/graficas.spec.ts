import {
  colorSerie,
  COLORES_GRAFICA,
  COLORES_GRAFICA_COMPARAR,
  esNumerico,
  nombreIndicador,
  percentil,
  posicionTooltip,
  rangoEjeY,
  rangoEjeYTasa,
  rangoYVisible,
  truncarDosDecimales,
  umbralesAtipicos,
} from '@features/monitor/utils/graficas';

describe('graficas', () => {
  it('el cliente tiene un color más que el exterior desde la posición 29', () => {
    expect(COLORES_GRAFICA.cliente).toHaveLength(31);
    expect(COLORES_GRAFICA.exterior).toHaveLength(30);
    expect(COLORES_GRAFICA.cliente[29]).toBe('#ECFFB5');
    expect(COLORES_GRAFICA.exterior[29]).toBe('#6F32C6');
    expect(COLORES_GRAFICA.cliente.slice(0, 29)).toEqual(COLORES_GRAFICA.exterior.slice(0, 29));
    expect(COLORES_GRAFICA_COMPARAR).toHaveLength(30);
  });

  it('colorSerie da la vuelta a la paleta', () => {
    expect(colorSerie(0, ['#a', '#b'])).toBe('#a');
    expect(colorSerie(3, ['#a', '#b'])).toBe('#b');
  });

  it('la UVR se muestra como «Inflación»', () => {
    expect(nombreIndicador('UVR')).toBe('Inflación');
    expect(nombreIndicador('uvr_30', 'UVR 30')).toBe('Inflación');
    expect(nombreIndicador('TRM', 'Dólar')).toBe('Dólar');
    expect(nombreIndicador('TRM')).toBe('TRM');
  });

  it('trunca sin redondear y reconoce números', () => {
    expect(truncarDosDecimales(4123.4789)).toBe(4123.47);
    expect(truncarDosDecimales('-1.239')).toBe(-1.23);
    expect(esNumerico(0)).toBe(true);
    expect(esNumerico('3.5')).toBe(true);
    expect(esNumerico('')).toBe(false);
    expect(esNumerico(null)).toBe(false);
    expect(esNumerico('x')).toBe(false);
  });

  it('percentil lineal', () => {
    expect(percentil([10, 20, 30, 40], 50)).toBe(25);
    expect(percentil([10, 20, 30], 0)).toBe(10);
  });

  describe('umbralesAtipicos', () => {
    it('margen del 10 % del rango, mínimo 20', () => {
      const [abajo, arriba] = umbralesAtipicos([100, 100, 100, 100]);
      expect(abajo).toBe(80);
      expect(arriba).toBe(120);
    });

    it('sin valores da [0, 0]; con menos del mínimo no descarta nada', () => {
      expect(umbralesAtipicos([])).toEqual([0, 0]);
      expect(umbralesAtipicos([1, 2], 4)).toEqual([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]);
    });
  });

  it('rangos del eje Y de valores y de tasas', () => {
    expect(rangoEjeY([200, 1000])).toEqual({ yMin: 198, yMax: 1030 });
    expect(rangoEjeYTasa([-1, 9])).toEqual({ yMin: -2, yMax: 10 });
    expect(rangoEjeYTasa([5, 5])).toEqual({ yMin: 4, yMax: 6 });
  });

  describe('rangoYVisible', () => {
    const series = [
      { datos: [{ value: 100 }, { value: 120 }, { value: null }, { value: 140 }] },
      { datos: [{ value: 90 }, { value: 110 }, { value: 130 }, { value: 200 }] },
    ];

    it('usa solo lo visible en la ventana del zoom, con 5 % de margen', () => {
      expect(rangoYVisible(series, 4, 0, 50)).toEqual({ min: 90 - 1.5, max: 120 + 1.5 });
    });

    it('nunca baja de 0 y devuelve null sin valores', () => {
      expect(rangoYVisible([{ datos: [{ value: 0 }, { value: 100 }] }], 2, 0, 100)?.min).toBe(0);
      expect(rangoYVisible([{ datos: [{ value: null }] }], 1, 0, 100)).toBeNull();
    });
  });

  it('posicionTooltip va a la derecha, pasa a la izquierda si no cabe y no queda negativa', () => {
    expect(posicionTooltip([100, 50], { contentSize: [30, 20], viewSize: [500, 300] })).toEqual([110, 50]);
    expect(posicionTooltip([490, 50], { contentSize: [30, 20], viewSize: [500, 300] })).toEqual([450, 50]);
    expect(posicionTooltip([20, 5], { contentSize: [600, 20], viewSize: [500, 300] })).toEqual([0, 5]);
  });
});
