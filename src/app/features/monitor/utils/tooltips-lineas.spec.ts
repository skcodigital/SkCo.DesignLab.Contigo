import { PuntoLinea, SerieLineaCompacta } from '@features/monitor/interfaces/comunes';
import {
  aParametros,
  avisoTooltip,
  contenidoFaseTooltip,
  ParametroTooltip,
  tooltipLineas,
  tooltipLineasCompacta,
  valorTooltip,
} from '@features/monitor/utils/tooltips-lineas';

const FECHA = '12 nov 26';

function param(color: string, data: Partial<PuntoLinea>, extra: Partial<ParametroTooltip> = {}): ParametroTooltip {
  return { color, dataIndex: 3, data: { value: 1, nombre: 'Serie', fecha: FECHA, ...data }, ...extra };
}

const contrato = { esPortafolio: false, conDetalle: false, esMovil: false };

describe('tooltips-lineas', () => {
  it('aParametros acepta un parámetro o una lista', () => {
    expect(aParametros({ color: '#f00' })).toEqual([{ color: '#f00' }]);
    expect(aParametros([{ color: '#f00' }, null])).toEqual([{ color: '#f00' }]);
  });

  it('avisoTooltip arma un bloque con margen fijo y el estilo de .disclaimer de la vista', () => {
    const cliente = avisoTooltip('Aviso', '11px');
    expect(cliente).toContain('<div class="disclaimer"');
    expect(cliente).toContain('margin-top:8px');
    expect(cliente).toContain('font-size:12px');
    expect(cliente).not.toContain('font-size:11px');
    expect(cliente).not.toContain('<br');
    expect(avisoTooltip('Nota', '11px', 'exterior')).toContain(';font-size:11px');
  });

  it('valorTooltip: % en tasa, número en indicadores y $ en el resto', () => {
    expect(valorTooltip(0.991, true, false)).toBe('0,99%');
    expect(valorTooltip(4321.5, false, true)).toBe('4.321,5');
    expect(valorTooltip(4321.5, false, false)).toBe('$4.321,5');
  });

  describe('tooltipLineas', () => {
    it('muestra fecha, valor, rendimiento y saldo de un contrato y el aviso de corte con fecha', () => {
      const html = tooltipLineas(
        [
          param('#123456', {
            nombre: 'Contrato Uno',
            valorTooltip: 2500.5,
            rendimiento: 120,
            saldo: 80000,
            fechaExtracto: '2026-10-31T12:00:00',
          }),
        ],
        contrato,
      );
      expect(html).toContain(`<strong>${FECHA}</strong>`);
      expect(html).toContain('Contrato Uno');
      expect(html).toContain('<strong>$2.500,5</strong>');
      expect(html).toContain('Rendimiento: $120 - Saldo: $80.000<br/>');
      expect(html).toContain('última fecha de corte del mes anterior (31/10/2026).');
    });

    it('omite las series sin dato ese día y usa la fecha del eje si el punto no la trae', () => {
      const html = tooltipLineas(
        [
          { color: '#111', axisValue: '1 dic 26', data: { value: 1, nombre: 'Con dato', valorTooltip: 7 } },
          { color: '#222', data: { value: null, nombre: 'Sin dato', valorTooltip: null } },
        ],
        contrato,
      );
      expect(html).toContain('<strong>1 dic 26</strong>');
      expect(html).toContain('Con dato');
      expect(html).not.toContain('Sin dato');
    });

    it('en portafolios no muestra rendimiento, saldo ni aviso de corte', () => {
      const html = tooltipLineas(
        [param('#111', { nombre: 'Portafolio Uno', valorTooltip: 1500, rendimiento: 20, saldo: 900 })],
        { ...contrato, esPortafolio: true },
      );
      expect(html).toContain('<strong>$1.500</strong>');
      expect(html).not.toContain('Rendimiento');
      expect(html).not.toContain('fecha de corte');
    });

    it('con CDT: el CDT va punteado en %, lo agregado con «Comparar» pasa a tasa y la nota sale una vez', () => {
      const html = tooltipLineas(
        [
          param('#a00', { nombre: 'Fondo comparado', valorTooltip: 1.2, removible: true }),
          param('#0a0', { nombre: 'Otro comparado', valorTooltip: 0.5, removible: true }),
          param('#00a', { nombre: 'CDT 90 días', valorTooltip: 9.1, tipo: 'cdt', removible: true }),
          param('#aa0', { nombre: 'Contrato propio', valorTooltip: 950, removible: false }),
        ],
        contrato,
      );
      expect(html).toContain('<strong>1,20%</strong>');
      expect(html).toContain('<strong>9,10%</strong>');
      expect(html).toContain('<strong>$950</strong>');
      expect(html).toContain('border-top:2px dashed #00a');
      expect(html).toContain('media móvil de las últimas 4 semanas');
      expect(html.split('Serie normalizada para comparación con CDT/DTF').length - 1).toBe(1);
    });

    it('los indicadores van sin $ y la inflación suma su aviso', () => {
      const html = tooltipLineas(
        [
          param('#a00', { nombre: 'Índice X', valorTooltip: 4000.12, tipo: 'indicador' }),
          param('#0a0', { nombre: 'Inflación', valorTooltip: 350.5, tipo: 'indicador' }),
        ],
        contrato,
      );
      expect(html).toContain('<strong>4.000,12</strong>');
      expect(html).not.toContain('$4.000');
      expect(html).toContain('Unidad de Valor Real (UVR)');
    });

    it('en móvil corta el nombre con puntos suspensivos', () => {
      const html = tooltipLineas([param('#a00', { nombre: 'Nombre largo', valorTooltip: 1 })], {
        ...contrato,
        esMovil: true,
      });
      expect(html).toContain('text-overflow:ellipsis');
    });

    it('con detalle agrega el contenido de la fase (solo en contratos)', () => {
      const params = [param('#a00', { nombre: 'Contrato', valorTooltip: 1 })];
      expect(tooltipLineas(params, { ...contrato, conDetalle: true, contenidoFase: '<i>fase</i>' })).toContain(
        '<div><i>fase</i></div>',
      );
      expect(
        tooltipLineas(params, { ...contrato, esPortafolio: true, conDetalle: true, contenidoFase: '<i>fase</i>' }),
      ).not.toContain('fase');
    });
  });

  describe('contenidoFaseTooltip', () => {
    const params = [
      param('#a00', { nombre: 'Contrato A', fechaIso: '2026-11-03T12:00:00' }),
      param('#0a0', { nombre: 'Contrato B' }),
    ];

    it('sin fase no agrega nada', () => {
      expect(contenidoFaseTooltip(null, params)).toBe('');
    });

    it('cuenta regresiva con la fecha del punto', () => {
      expect(contenidoFaseTooltip({ fase: 'cuenta', segundos: 4 }, params)).toContain(
        'Los saldos y rendimientos a la fecha 03/11/2026 se mostrarán en 4',
      );
    });

    it('carga: dos barras por serie', () => {
      const html = contenidoFaseTooltip({ fase: 'cargando' }, params);
      expect(html.split('border-radius:4px').length - 1).toBe(4);
    });

    it('cargado: rendimiento y saldo por serie con dato y el aviso con la fecha de corte', () => {
      const html = contenidoFaseTooltip(
        {
          fase: 'cargado',
          registros: [
            { rendimiento: 1500, saldo: 250000, fechaExtracto: '2026-10-31T12:00:00' },
            { rendimiento: 0, saldo: 0 },
          ],
        },
        params,
      );
      expect(html).toContain('Rendimiento: $1.500 - Saldo: $250.000');
      expect(html.split('Rendimiento:').length - 1).toBe(1);
      expect(html).toContain('Saldos y rendimientos al 31/10/2026.');
    });
  });

  it('tooltipLineasCompacta muestra el valor real por posición en el formato de la vista', () => {
    const series: SerieLineaCompacta[] = [
      { nombre: 'Uno', datos: [1, 2], valoresReales: [1000.5, 2000], color: '#a00', suave: true },
      { nombre: 'Dos', datos: [1, 2], valoresReales: [0, 0], color: '#0a0', suave: true },
    ];
    const params = [
      { color: '#a00', seriesName: 'Uno', dataIndex: 0, axisValue: 'ene' },
      { color: '#0a0', seriesName: 'Dos', dataIndex: 0, axisValue: 'ene' },
    ];
    const cliente = tooltipLineasCompacta(params, series, 'es-CO');
    expect(cliente.startsWith('<b>ene</b><br>')).toBe(true);
    expect(cliente).toContain('<b>Uno</b>: $1.000,50');
    expect(cliente).toContain('<b>Dos</b>: 0');
    expect(tooltipLineasCompacta(params, series, 'en-US')).toContain('$1,000.50');
  });
});
