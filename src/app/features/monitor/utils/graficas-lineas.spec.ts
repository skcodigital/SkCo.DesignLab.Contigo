import { SerieLinea } from '@features/monitor/interfaces/comunes';
import {
  leyendaOculta,
  opcionesLineas,
  opcionesSinDatos,
  seriesLineas,
  seriesLineasCompactas,
  sinDatosLineas,
} from '@features/monitor/utils/graficas-lineas';

describe('graficas-lineas', () => {
  describe('opciones', () => {
    const serie: SerieLinea = {
      nombre: 'clave-1',
      color: '#123456',
      punteada: true,
      grosor: 1.5,
      suave: false,
      datos: [{ value: 10, nombre: 'Uno' }],
    };

    it('arma las series de ECharts', () => {
      expect(seriesLineas([serie])).toEqual([
        {
          name: 'clave-1',
          type: 'line',
          smooth: false,
          showSymbol: false,
          connectNulls: true,
          data: serie.datos,
          itemStyle: { color: '#123456' },
          lineStyle: { type: 'dashed', width: 1.5 },
        },
      ]);
      expect(
        seriesLineasCompactas([
          { nombre: 'A', datos: [1], valoresReales: [1], color: '#a00', suave: true, simbolo: 'circle', tamanoSimbolo: 8 },
        ]),
      ).toEqual([{ name: 'A', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8, data: [1], color: '#a00' }]);
    });

    it('opciones comunes: tooltip por eje, zoom, botón propio de imagen y eje Y oculto', () => {
      const alClic = (): void => undefined;
      const formatter = (): string => '';
      const op = opcionesLineas({
        etiquetas: ['a', 'b'],
        series: [],
        yMin: 1,
        yMax: 9,
        formatter,
        confinarTooltip: true,
        guardar: { clave: 'mySaveImage', titulo: 'Save image', icono: 'path://x', alClic },
      }) as Record<string, unknown>;
      expect(op['tooltip']).toEqual({ trigger: 'axis', enterable: true, confine: true, formatter });
      expect(op['toolbox']).toEqual({
        show: true,
        feature: {
          dataZoom: { yAxisIndex: 'none' },
          restore: {},
          mySaveImage: { show: true, title: 'Save image', icon: 'path://x', onclick: alClic },
        },
      });
      expect(op['yAxis']).toMatchObject({ show: false, min: 1, max: 9, scale: true });
      expect(op['xAxis']).toEqual({ type: 'category', boundaryGap: false, data: ['a', 'b'], splitLine: { show: true } });
      expect(op['dataZoom']).toEqual([{ type: 'slider', show: true, height: 26, bottom: 8 }]);
      expect(op['legend']).toEqual({ show: false });
    });

    it('leyenda oculta y gráfica sin datos', () => {
      expect(leyendaOculta(true)).toMatchObject({ top: 45, show: false });
      expect(leyendaOculta(false)).toMatchObject({ top: 35 });
      expect((opcionesSinDatos() as { title: { text: string } }).title.text).toBe('Sin datos disponibles');
      expect(sinDatosLineas([])).toBe(true);
      expect(sinDatosLineas([{ ...serie, datos: [] }])).toBe(true);
      expect(sinDatosLineas([serie])).toBe(false);
    });
  });
});
