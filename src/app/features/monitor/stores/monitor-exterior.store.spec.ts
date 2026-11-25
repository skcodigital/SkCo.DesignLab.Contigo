import { TestBed } from '@angular/core/testing';
import { SELECCION_EJEMPLO, SELECCION_VACIA } from '@features/monitor/data/exterior-catalogos.mock';
import { MonitorExteriorStore } from '@features/monitor/stores/monitor-exterior.store';
import { PERIODO } from '@features/monitor/utils/periodos';

function crear(): MonitorExteriorStore {
  TestBed.configureTestingModule({ providers: [MonitorExteriorStore] });
  return TestBed.inject(MonitorExteriorStore);
}

describe('MonitorExteriorStore', () => {
  it('arranca sin selección, en el año en curso y con «Selecciona y compara» desplegado', () => {
    const store = crear();
    expect(store.seleccion()).toEqual(SELECCION_VACIA);
    expect(store.activos()).toEqual([]);
    expect(store.periodo()).toBe(PERIODO.anioEnCurso);
    expect(store.panelAbierto()).toBe(true);
    expect(store.haySeleccion()).toBe(false);
    expect(store.conError()).toBe(false);
  });

  it('en escritorio cada clic grafica al momento, por grupos', () => {
    const store = crear();
    store.elegir({ indicadores: [{ tipo: 'divisa', clave: 'US$' }] });
    store.elegir({ portafolios: ['FPVSTGMOD'] });
    expect(store.activos().map((a) => a.clave)).toEqual(['FPVSTGMOD', 'US$']);
    expect(store.haySeleccion()).toBe(true);
  });

  it('en la modal de móvil los portafolios esperan a «Graficar selección»; la competencia no', () => {
    const store = crear();
    store.abrirComparadorMovil();
    store.elegir({ portafolios: ['FPVSTGMOD'] }, true);
    expect(store.seleccion().portafolios).toEqual(['FPVSTGMOD']);
    expect(store.activos()).toEqual([]);

    store.elegir({ referencias: [{ idCompania: '1', idPortafolio: 'AA01', tipo: 'VOLUNTARIO' }] }, true);
    expect(store.activos().map((a) => a.clave)).toEqual(['1_AA01']);

    store.graficarSeleccion();
    expect(store.activos().map((a) => a.clave)).toEqual(['FPVSTGMOD', '1_AA01']);
    expect(store.comparadorMovil()).toBe(false);
  });

  it('retira activos (con el plazo del CDT) y al quitar el último vuelve al año en curso', () => {
    const store = crear();
    store.configurar('ejemplo-cdt');
    expect(store.activos().some((a) => a.clave === 'FPVSTGCONS_90')).toBe(true);
    store.quitar('FPVSTGCONS_90');
    expect(store.seleccion().portafolios).toEqual(['FICEFECTIVO']);
    expect(store.activos().some((a) => a.clave.startsWith('FPVSTGCONS'))).toBe(false);

    store.restablecer();
    store.elegir({ mezclas: [1] });
    store.cambiarPeriodo(PERIODO.ultimoMes);
    store.quitar('CAUTA');
    expect(store.seleccion()).toEqual(SELECCION_VACIA);
    expect(store.periodo()).toBe(PERIODO.anioEnCurso);
  });

  it('con «Personalizado» sin fechas conserva los activos del periodo anterior', () => {
    const store = crear();
    store.elegir({ portafolios: ['FICEFECTIVO'] });
    store.cambiarPeriodo(PERIODO.ultimoMes);
    const puntosMes = store.activos()[0].puntos.length;

    store.cambiarPeriodo(PERIODO.personalizado);
    store.cambiarRango({ inicio: '2026-06-01', fin: '' });
    expect(store.activos()[0].puntos.length).toBe(puntosMes);

    store.cambiarRango({ inicio: '2026-06-01', fin: '2026-06-10' });
    expect(store.activos()[0].puntos[0].fechaIso).toBe('2026-06-01');
    expect(store.activos()[0].puntos.length).toBe(10);
  });

  it('aplica los estados de ejemplo de la URL', () => {
    const store = crear();
    store.configurar('ejemplo');
    expect(store.seleccion()).toEqual(SELECCION_EJEMPLO);
    expect(store.activos().length).toBe(6);
    store.configurar('error');
    expect(store.conError()).toBe(true);
    expect(store.activos()).toEqual([]);
    store.configurar(null);
    expect(store.conError()).toBe(false);
  });

  it('pliega el panel y abre y cierra el asistente', () => {
    const store = crear();
    store.alternarPanel();
    expect(store.panelAbierto()).toBe(false);
    store.abrirAsistente();
    expect(store.asistenteAbierto()).toBe(true);
    store.cerrarAsistente();
    expect(store.asistenteAbierto()).toBe(false);
  });

  it('el asistente queda «Escribiendo» y responde con el ejemplo fijo', () => {
    const store = crear();
    store.enviarAlAsistente('   ');
    expect(store.mensajes()).toEqual([]);

    store.enviarAlAsistente('Haz un análisis de la gráfica');
    expect(store.escribiendo()).toBe(true);
    store.enviarAlAsistente('Otro mensaje mientras escribe');
    expect(store.mensajes().length).toBe(1);

    store.responderAsistente();
    expect(store.escribiendo()).toBe(false);
    const [pregunta, respuesta] = store.mensajes();
    expect(pregunta).toEqual({ id: 1, remitente: 'usuario', texto: 'Haz un análisis de la gráfica' });
    expect(respuesta.remitente).toBe('asistente');
    expect(respuesta.texto).toContain('📝 Resumen:');

    store.responderAsistente();
    expect(store.mensajes().length).toBe(2);
  });
});
