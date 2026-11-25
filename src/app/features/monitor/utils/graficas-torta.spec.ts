import {
  luminancia,
  opcionesTorta,
  opcionesTortaCompacta,
  oscurecer,
  tooltipTorta,
  tooltipTortaCompacta,
} from '@features/monitor/utils/graficas-torta';

describe('graficas-torta', () => {
  it('luminancia y oscurecer', () => {
    expect(luminancia('#ffffff')).toBeCloseTo(1);
    expect(luminancia('#000000')).toBe(0);
    expect(oscurecer('#ffffff', 0.5)).toBe('#808080');
    expect(oscurecer('#204060', 0)).toBe('#204060');
  });

  it('el tooltip muestra nombre, saldo y porcentaje con una píldora del color', () => {
    const html = tooltipTorta({ value: 42.345, name: 'Contrato Uno', data: { color: '#3366aa', saldo: 1250000 } });
    expect(html).toContain('Contrato Uno');
    expect(html.replace(/\s/g, ' ')).toContain('$ 1.250.000');
    expect(html).toContain('42.3%');
    expect(html).toContain('color:#3366aa; background:#3366aa1A');
  });

  it('con un color claro la píldora se oscurece', () => {
    const html = tooltipTorta({ value: 10, name: 'Claro', data: { color: '#f0f0f0' } });
    expect(html).toContain(`color:${oscurecer('#f0f0f0', 0.45)}`);
    expect(html).toContain(`background:${oscurecer('#f0f0f0', 0.1)}33`);
  });

  it('opciones de la torta con título: dona 40–70 %, título según el ancho y tooltip blanco', () => {
    const op = opcionesTorta([{ nombre: 'A', valor: 60, color: '#a00', saldo: 10 }], 'Composición actual', true) as {
      title: { text: string; left: string; textStyle: { fontSize: number } };
      series: { radius: string[]; data: { name: string; value: number; itemStyle: { color: string } }[] };
      tooltip: { backgroundColor: string; borderRadius: number };
    };
    expect(op.title.text).toBe('Composición actual');
    expect(op.title.left).toBe('0px');
    expect(op.title.textStyle.fontSize).toBe(16);
    expect(op.series.radius).toEqual(['40%', '70%']);
    expect(op.series.data[0]).toMatchObject({ name: 'A', value: 60, itemStyle: { color: '#a00' } });
    expect(op.tooltip).toMatchObject({ backgroundColor: '#FFFFFF', borderRadius: 12 });
  });

  it('torta compacta: tooltip oscuro con «valor% - nombre»', () => {
    const op = opcionesTortaCompacta([{ nombre: 'B', valor: 12.5, color: '#0a0' }]) as {
      tooltip: { backgroundColor: string };
    };
    expect(op.tooltip.backgroundColor).toBe('#404040');
    expect(tooltipTortaCompacta({ value: 12.5, name: 'B' })).toBe('12.5% - B');
  });
});
