import { PORTAFOLIOS_OSCAR, PRODUCTOS_CONTRATO_OSCAR } from '@features/monitor/data/cliente.mock';
import { FONDOS_COMPARABLES } from '@features/monitor/data/cliente-comparar.mock';
import { HOY_MONITOR } from '@features/monitor/data/detalle-catalogos.mock';
import { CONTRATOS_OSCAR } from '@features/monitor/data/detalle-cliente.mock';
import { FilaTabla } from '@features/monitor/interfaces/comunes';
import { activosCliente, SELECCION_VACIA } from '@features/monitor/utils/cliente-comparacion';
import { filasContratos } from '@features/monitor/utils/cliente-contratos';
import { filaMezclaExpandible, filasCompararPortafolios, filasMezclas } from '@features/monitor/utils/cliente-filas';
import {
  fondoDesactualizado,
  fondosVisibles,
  grupoFondos,
  opcionesFiltroFondos,
  seleccionFondos,
} from '@features/monitor/utils/cliente-fondos';
import { filasPortafolios } from '@features/monitor/utils/cliente-portafolios';
import { CASILLAS_PORTAFOLIOS, opcionesTablaPortafolios } from '@features/monitor/utils/cliente-tabla-portafolios';
import {
  casillasContratos,
  flechaComparado,
  flechaContrato,
  opcionesTablaCompararPortafolios,
  opcionesTablaContratos,
  opcionesTablaMezclas,
} from '@features/monitor/utils/cliente-tablas';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';
import { vistaFilas, columnasTabla } from '@features/monitor/utils/tabla';

const YTD = { inicio: '2026-01-01', fin: '2026-11-12' };
const PALETA = COLORES_GRAFICA.cliente;

describe('cliente-tablas', () => {
  it('flechas: contratos con 0 en verde; lo comparado sin flecha en 0', () => {
    expect(flechaContrato('0')).toEqual({ icono: 'flecha-verde' });
    expect(flechaContrato('-1.2')).toEqual({ icono: 'flecha-roja' });
    expect(flechaContrato(undefined)).toBeNull();
    expect(flechaComparado('0.00')).toBeNull();
    expect(flechaComparado('2')).toEqual({ icono: 'flecha-verde' });
  });

  it('tabla de contratos: rendimientos solo con «Desde el inicio» y «Ver más» solo en lo comparado', () => {
    const filas = filasContratos(CONTRATOS_OSCAR, PRODUCTOS_CONTRATO_OSCAR, YTD, HOY_MONITOR, PALETA, [], false);
    const o = opcionesTablaContratos(filas, false, null);
    expect(o.etiquetas).toEqual(['%', 'nombre', 'Valor Unid. Inicial', 'Valor Unid. Final', 'Variación', 'TIR', 'Saldo actual']);
    expect(o.conAccionesFila).toBe(false);
    expect(o.tooltipCelda?.(filas[0], 'nombre')).toBe('');
    expect(o.tooltipCelda?.({ clave: 'FPVLIQCOL' }, 'nombre')).toBe('Ver más');
    expect(opcionesTablaContratos(filas, true, null).claves).toContain('rendimientos');
    expect(casillasContratos(false).opciones.map((c) => c.valor)).not.toContain('rendimientos');
    expect(casillasContratos(true).opciones.map((c) => c.valor)).toContain('rendimientos');

    const vista = vistaFilas(o, o.datos, columnasTabla(o, o.columnasVisibles ?? null).datos, 'cliente');
    expect(vista[0].celdas.map((c) => c.texto)).toEqual([
      '86.24 %',
      'Fondo Voluntario de... Multifund | 100000063061',
      '$ 10,619.08',
      '$ 11,725.29',
      '10.42 %',
      '11.8 %',
      '$ 52,732,191.00',
    ]);
  });

  it('tabla de lo comparado: CDT en tasa y p.p.; «Ver más» solo en mezclas y competencia', () => {
    const a = activosCliente(
      { ...SELECCION_VACIA, mezclas: [3], indicadores: ['COLCAP'], referencias: [{ idCompania: '1', idPortafolio: 'AA01', tipo: 'VOLUNTARIO' }], cdt: ['30'] },
      YTD,
      HOY_MONITOR,
      PALETA,
      2,
    );
    const filas = filasMezclas(a, 'contratos', new Map(), []);
    expect(filas.map((f) => f.tipo)).toEqual(['mezcla', 'referencia', 'cdt', 'indicador']);
    expect(filasMezclas(a, 'portafolios', new Map(), []).map((f) => f.tipo)).toEqual(['mezcla', 'cdt', 'referencia', 'indicador']);
    expect(filas[0].plazoCdt).toBe('CDT A 30 días');
    const o = opcionesTablaMezclas(filas, filaMezclaExpandible);
    const cdt = filas[2] as FilaTabla;
    expect(o.formatoCelda?.(cdt, 'valorInicial', 8.81)).toBe('8.81%');
    expect(o.formatoCelda?.(cdt, 'variacion', 0.04)).toBe('+0.04 p.p.');
    expect(o.formatoCelda?.(cdt, 'volatilidad', '0.00')).toBe('-');
    expect(o.tooltipCelda?.(filas[0], 'nombre')).toBe('Ver más');
    expect(o.tooltipCelda?.(cdt, 'nombre')).toBe('CDT A 30 días');
    expect(o.iconosColumna?.(filas[1])[0]).toEqual({ imagen: filas[1].imagen });
    expect(filasMezclas(a, 'contratos', new Map(), ['PACIENTE']).length).toBe(3);
  });

  it('«Indicadores para comparar»: nombre con el id y fecha de corte', () => {
    const a = activosCliente({ ...SELECCION_VACIA, portafolios: ['FPVSTGMOD'] }, YTD, HOY_MONITOR, PALETA, 2);
    const filas = filasCompararPortafolios(a.fondos, new Map([['FPVSTGMOD', '#123456']]), []);
    expect(filas.map((f) => [f.nombre, f.fechaCorte, f.color])).toEqual([
      ['FPV Strategist Moderado - FPVSTGMOD', '2026-11-12T00:00:00', '#123456'],
    ]);
    const o = opcionesTablaCompararPortafolios(filas);
    const vista = vistaFilas(o, o.datos, columnasTabla(o, null).datos, 'cliente');
    expect(vista[0].celdas[2].texto).toBe('12/11/2026');
  });

  it('tabla de portafolios: grupos de columnas, píldora de transacciones y fecha de compra', () => {
    const filas = filasPortafolios(PORTAFOLIOS_OSCAR, YTD, HOY_MONITOR, PALETA);
    const o = opcionesTablaPortafolios(filas, null);
    expect(o.claves.length).toBe(15);
    expect(o.encabezadosOcultos).toEqual(['porcentaje', 'nombre']);
    expect(o.posicionAccionesFila).toBe('inicio');
    expect(o.estiloEncabezado?.['saldo']).toEqual({ 'background-color': 'var(--sk-color-info-light)' });
    expect(o.estiloEncabezado?.['tea']).toEqual({ 'background-color': '#ecfdf3' });
    expect(o.iconosColumna?.(filas[0])[14]).toEqual({ icono: 'recibo' });
    expect(o.formatoCelda?.(filas[0], 'fechaPrimeraCompra', '2025-11-12')).toBe('12/11/2025');
    expect(CASILLAS_PORTAFOLIOS.opciones.map((c) => c.valor)).not.toContain('nombre');
  });

  it('«Portafolios SK»: filtros, desactualizados y orden de lo marcado', () => {
    expect(opcionesFiltroFondos(FONDOS_COMPARABLES, 'clasificacion', 'Clasificación').map((o) => o.nombre)).toEqual([
      'Clasificación',
      'Estrategias',
      'Liquidez',
      'Otros',
      'Renta variable',
    ]);
    expect(fondoDesactualizado('2026-09-30', HOY_MONITOR)).toBe(true);
    expect(fondoDesactualizado('2026-11-11', HOY_MONITOR)).toBe(false);
    const filtros = { clasificacion: '', perfil: '', mostrarInactivos: false };
    expect(fondosVisibles(FONDOS_COMPARABLES, filtros, HOY_MONITOR).length).toBe(5);
    expect(fondosVisibles(FONDOS_COMPARABLES, { ...filtros, mostrarInactivos: true }, HOY_MONITOR).length).toBe(6);
    expect(fondosVisibles(FONDOS_COMPARABLES, { ...filtros, clasificacion: 'Otros' }, HOY_MONITOR).map((f) => f.clave)).toEqual([
      'FVPRFMAR29',
    ]);
    const grupo = grupoFondos(FONDOS_COMPARABLES, HOY_MONITOR);
    expect(grupo.opciones.find((o) => o.valor === 'FPVACCCOL')?.avisoDesactualizado).toBe(
      'Datos desactualizados. Última fecha de valor unitario: 30/09/2026',
    );
    expect(seleccionFondos(['B'], { A: true, B: true, C: false })).toEqual(['B', 'A']);
  });
});
