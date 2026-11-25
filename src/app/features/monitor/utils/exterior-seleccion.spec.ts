import { HOY_MONITOR, PLAZOS_CDT } from '@features/monitor/data/detalle-catalogos.mock';
import {
  CATALOGO_EXTERIOR,
  SELECCION_EJEMPLO,
  SELECCION_EJEMPLO_CDT,
  SELECCION_VACIA,
} from '@features/monitor/data/exterior-catalogos.mock';
import { ACTIVOS_EXTERIOR_EJEMPLO, SELECCION_EXTERIOR_EJEMPLO } from '@features/monitor/data/detalle-exterior.mock';
import { activosComparados } from '@features/monitor/utils/detalle-activos';
import {
  aplicaAlMomento,
  claveReferencia,
  definicionDeClave,
  definicionesSeleccion,
  estadoExterior,
  haySeleccion,
  quitarActivo,
  rangoDeConsulta,
} from '@features/monitor/utils/exterior-seleccion';
import { PERIODO, rangoPorPeriodo } from '@features/monitor/utils/periodos';

describe('exterior-seleccion', () => {
  it('sabe si hay algo elegido', () => {
    expect(haySeleccion(SELECCION_VACIA)).toBe(false);
    expect(haySeleccion({ ...SELECCION_VACIA, cdts: ['30'] })).toBe(true);
    expect(haySeleccion(SELECCION_EJEMPLO)).toBe(true);
  });

  it('arma las recetas por grupos: portafolios, divisas, indicadores, mezclas, competencia y CDT', () => {
    const defs = definicionesSeleccion(
      {
        portafolios: ['FICEFECTIVO', 'NO-EXISTE'],
        indicadores: [
          { tipo: 'indicador', clave: 'UVR' },
          { tipo: 'divisa', clave: 'EUR' },
        ],
        mezclas: [6],
        referencias: [{ idCompania: '2', idPortafolio: 'FV01', tipo: 'FIC' }],
        cdts: ['30'],
      },
      CATALOGO_EXTERIOR,
    );
    expect(defs.map((d) => d.clave)).toEqual(['FICEFECTIVO', 'EUR', 'UVR', 'AUDAZ', '2_FV01', 'CDT-30']);
  });

  it('la selección de ejemplo da los mismos activos que el ejemplo del detalle', () => {
    const defs = definicionesSeleccion(SELECCION_EJEMPLO, CATALOGO_EXTERIOR);
    expect(defs.map((d) => d.clave)).toEqual(SELECCION_EXTERIOR_EJEMPLO.map((d) => d.clave));
    const activos = activosComparados(defs, rangoPorPeriodo(PERIODO.anioEnCurso, HOY_MONITOR), HOY_MONITOR, PLAZOS_CDT);
    expect(activos.map((a) => a.color)).toEqual(ACTIVOS_EXTERIOR_EJEMPLO.map((a) => a.color));
  });

  it('encuentra la receta de una serie con el sufijo del CDT', () => {
    const defs = definicionesSeleccion(SELECCION_EJEMPLO_CDT, CATALOGO_EXTERIOR);
    expect(definicionDeClave(defs, 'FPVSTGCONS_90')?.clave).toBe('FPVSTGCONS');
    expect(definicionDeClave(defs, '1_AA02_90')?.clave).toBe('1_AA02');
    expect(definicionDeClave(defs, 'CDT-90')?.clave).toBe('CDT-90');
    expect(definicionDeClave(defs, 'OTRA')).toBeUndefined();
  });

  it('retira un activo de su lista (también con el plazo del CDT)', () => {
    expect(quitarActivo(SELECCION_EJEMPLO, 'US$', CATALOGO_EXTERIOR).indicadores).toEqual([
      { tipo: 'indicador', clave: 'UVR' },
    ]);
    expect(quitarActivo(SELECCION_EJEMPLO, 'PACIENTE', CATALOGO_EXTERIOR).mezclas).toEqual([]);
    expect(quitarActivo(SELECCION_EJEMPLO, '1_AA02', CATALOGO_EXTERIOR).referencias).toEqual([]);
    const conCdt = quitarActivo(SELECCION_EJEMPLO_CDT, 'FPVSTGCONS_90', CATALOGO_EXTERIOR);
    expect(conCdt.portafolios).toEqual(['FICEFECTIVO']);
    expect(quitarActivo(SELECCION_EJEMPLO_CDT, 'CDT-90', CATALOGO_EXTERIOR).cdts).toEqual([]);
    expect(quitarActivo(SELECCION_EJEMPLO, 'NADA', CATALOGO_EXTERIOR)).toBe(SELECCION_EJEMPLO);
    expect(claveReferencia({ idCompania: '3', idPortafolio: 'PC01', tipo: 'OBLIGATORIO' })).toBe('3_PC01');
  });

  it('con «Personalizado» solo hay rango con las dos fechas', () => {
    expect(rangoDeConsulta(PERIODO.ultimoMes, { inicio: '', fin: '' }, HOY_MONITOR)).toEqual({
      inicio: '2026-10-12',
      fin: '2026-11-12',
    });
    expect(rangoDeConsulta(PERIODO.personalizado, { inicio: '2026-05-01', fin: '' }, HOY_MONITOR)).toBeNull();
    expect(rangoDeConsulta(PERIODO.personalizado, { inicio: '2026-05-01', fin: '2026-06-30' }, HOY_MONITOR)).toEqual({
      inicio: '2026-05-01',
      fin: '2026-06-30',
    });
  });

  it('en la modal de móvil solo la competencia y los CDT se grafican al momento', () => {
    expect(aplicaAlMomento({ portafolios: ['FICEFECTIVO'] }, false)).toBe(true);
    expect(aplicaAlMomento({ portafolios: ['FICEFECTIVO'] }, true)).toBe(false);
    expect(aplicaAlMomento({ mezclas: [1] }, true)).toBe(false);
    expect(aplicaAlMomento({ referencias: [] }, true)).toBe(true);
    expect(aplicaAlMomento({ cdts: ['30'] }, true)).toBe(true);
  });

  it('reconoce los estados de ejemplo de la URL', () => {
    expect(estadoExterior('error')).toBe('error');
    expect(estadoExterior(' Ejemplo ')).toBe('ejemplo');
    expect(estadoExterior('ejemplo-cdt')).toBe('ejemplo-cdt');
    expect(estadoExterior('otro')).toBeNull();
    expect(estadoExterior(undefined)).toBeNull();
  });
});
