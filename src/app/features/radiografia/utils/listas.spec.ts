import { armarLista, filtrarFilas, totalLista } from '@features/radiografia/utils/listas';

describe('armarLista', () => {
  it('director con PAC ve todos los clientes, sin filtro ni candado', () => {
    const l = armarLista('clientes', 'director', 'con')!;
    expect(l.titulo).toBe('Clientes de Skandia en la empresa (412)');
    expect(l.conFiltro).toBe(false);
    expect(l.candado).toBeNull();
    expect(l.resumen.map((r) => r.etiqueta)).toEqual(['FP Asignado: ', 'Agencia Norte: ', 'Otras agencias: ']);
    expect(l.resumen[2].apagado).toBe(false);
    expect(totalLista(l, l.filtroInicial)).toBe(412);
  });

  it('director con PAC en monoproducto: filtro por asesor y candado de otras agencias', () => {
    const l = armarLista('monoproducto', 'director', 'con')!;
    expect(l.conFiltro).toBe(true);
    expect(l.candado?.cifra).toBe('130 clientes');
    expect(l.resumen[2].apagado).toBe(true);
    expect(filtrarFilas(l, 'agencia').every((f) => f.gestion === 'agencia')).toBe(true);
    expect(totalLista(l, 'todos')).toBe(92 + 17);
    expect(totalLista(l, 'dueno')).toBe(92);
  });

  it('FP Asignado ve solo sus clientes, sin la columna "Atendido por"', () => {
    const l = armarLista('clientes', 'dueno', 'con')!;
    expect(l.titulo).toBe('Tus clientes en esta empresa (171)');
    expect(l.cols).not.toContain('Atendido por');
    expect(l.filas.every((f) => f.gestion === 'dueno' && f.celdas.length === l.cols.length)).toBe(true);
    expect(l.filtroInicial).toBe('dueno');
    expect(l.candado?.cifra).toBe('241 clientes');
    expect(l.resumen[1].sufijo).toBe(' (agregado)');
  });

  it('el asesor (otro FP) ve solo lo suyo, sin candado', () => {
    const l = armarLista('perdidos', 'fp', 'con')!;
    expect(l.titulo).toBe('Tus clientes perdidos en 2026 (1)');
    expect(l.candado).toBeNull();
    expect(l.resumen).toHaveLength(1);
  });

  it('sin PAC: detalle de la agencia del director, sin filtro', () => {
    const l = armarLista('monoproducto', 'director', 'sin')!;
    expect(l.titulo).toBe('Clientes monoproducto (7)');
    expect(l.conFiltro).toBe(false);
    expect(l.resumen[0].etiqueta).toBe('Tu agencia: ');
    expect(l.candado?.cifra).toBe('3 clientes');
    expect(totalLista(l, 'todos')).toBe(4);
  });
});
