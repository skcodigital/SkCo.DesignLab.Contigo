import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { HOY_MONITOR } from '@features/monitor/data/detalle-catalogos.mock';
import { SeleccionComparar } from '@features/monitor/interfaces/cliente';
import {
  activosCliente,
  claveCubierta,
  definicionComparada,
  haySeleccion,
  listaActivos,
  plazoAplicado,
  quitarDeSeleccion,
  SELECCION_VACIA,
  tituloMezclas,
} from '@features/monitor/utils/cliente-comparacion';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';

const YTD = { inicio: '2026-01-01', fin: '2026-11-12' };
const PALETA = COLORES_GRAFICA.cliente;

const SELECCION: SeleccionComparar = {
  portafolios: ['FPVSTGMOD'],
  divisas: ['US$'],
  indicadores: ['UVR'],
  mezclas: [3],
  referencias: [{ idCompania: '1', idPortafolio: 'AA01', tipo: 'VOLUNTARIO' }],
  cdt: [],
};

describe('cliente-comparacion', () => {
  it('sabe si hay algo marcado', () => {
    expect(haySeleccion(SELECCION_VACIA)).toBe(false);
    expect(haySeleccion({ ...SELECCION_VACIA, cdt: ['30'] })).toBe(true);
  });

  it('tolera el sufijo del plazo de un CDT en las claves', () => {
    expect(claveCubierta('FPVLIQCOL_30', ['FPVLIQCOL'])).toBe(true);
    expect(claveCubierta('FPVLIQCOL', ['FPVLIQCOL_30'])).toBe(true);
    expect(claveCubierta('FPVLIQCOL', ['FPVSTGMOD'])).toBe(false);
  });

  it('arma los activos con los colores de producción', () => {
    const a = activosCliente(SELECCION, YTD, HOY_MONITOR, PALETA, 2);
    expect(a.fondos.map((x) => [x.clave, x.color])).toEqual([['FPVSTGMOD', PALETA[2]]]);
    // Indicadores y divisas en el orden del catálogo, desde la mitad de la paleta; la UVR se llama «Inflación».
    expect(a.indicadores.map((x) => [x.clave, x.nombre, x.color])).toEqual([
      ['US$', 'Dólar', PALETA[15]],
      ['UVR', 'Inflación', PALETA[16]],
    ]);
    expect(a.mezclas.map((x) => [x.clave, x.nombre, x.color])).toEqual([['PACIENTE', 'Paciente', PALETA[5]]]);
    // La competencia toma el primer color libre de la paleta.
    expect(a.referencias.map((x) => [x.clave, x.color])).toEqual([['1_AA01', PALETA[0]]]);
    expect(listaActivos(a).map((x) => x.clave)).toEqual(['FPVSTGMOD', 'US$', 'UVR', 'PACIENTE', '1_AA01']);
    expect(a.fondos[0].metricas?.valorFinal).toBe(15873.42);
  });

  it('con un CDT, lo demás pasa a su rentabilidad móvil en ese plazo', () => {
    const s: SeleccionComparar = { ...SELECCION_VACIA, portafolios: ['FPVSTGMOD'], mezclas: [3], cdt: ['30', '90'] };
    expect(plazoAplicado(s)?.descripcion).toBe('A 30 DIAS');
    const a = activosCliente(s, YTD, HOY_MONITOR, PALETA, 2);
    expect(a.fondos[0].clave).toBe('FPVSTGMOD_30');
    expect(a.fondos[0].nombre).toBe('FPV Strategist Moderado - Rentabilidad móvil 30 días (A 30 DIAS)');
    expect(a.mezclas[0].nombre).toBe('Paciente - Rentabilidad móvil 30 días (A 30 DIAS)');
    expect(a.cdt.map((x) => [x.clave, x.color])).toEqual([
      ['CDT-30', '#ED3833'],
      ['CDT-90', '#8B5CF6'],
    ]);
  });

  it('retira un activo de la selección (con o sin sufijo)', () => {
    const s: SeleccionComparar = { ...SELECCION, cdt: ['30'] };
    expect(quitarDeSeleccion(s, 'FPVSTGMOD_30').portafolios).toEqual([]);
    expect(quitarDeSeleccion(s, 'PACIENTE').mezclas).toEqual([]);
    expect(quitarDeSeleccion(s, '1_AA01').referencias).toEqual([]);
    expect(quitarDeSeleccion(s, 'CDT-30').cdt).toEqual([]);
    expect(quitarDeSeleccion(s, 'US$').divisas).toEqual([]);
    expect(quitarDeSeleccion(s, 'US$').indicadores).toEqual(['UVR']);
  });

  it('encuentra la definición de lo comparado para abrir su detalle', () => {
    expect(definicionComparada('FPVSTGMOD_30')?.clave).toBe('FPVSTGMOD');
    expect(definicionComparada('PACIENTE')?.detalle?.tipo).toBe('mezcla');
    expect(definicionComparada('1_AA01')?.detalle?.tipo).toBe('referencia');
    expect(definicionComparada('CDT-30')).toBeUndefined();
  });

  it('titula la tabla de lo comparado como producción', () => {
    const t = TEXTOS_CLIENTE.tituloMezclas;
    expect(tituloMezclas({ competencia: false, cdt: false, indicadores: false }, t)).toBe('Mezcla Invest-ed');
    expect(tituloMezclas({ competencia: false, cdt: false, indicadores: true }, t)).toBe('Mezcla Invest-ed e Indicadores');
    expect(tituloMezclas({ competencia: true, cdt: true, indicadores: true }, t)).toBe(
      'Mezcla Invest-ed, Competencia, CDTs e Indicadores',
    );
  });
});
