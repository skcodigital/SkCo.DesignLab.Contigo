import { TestBed } from '@angular/core/testing';
import { MonitorClienteDatos } from '@features/monitor/stores/monitor-cliente-datos.store';
import { escenarioDesdeUrl, MonitorClienteStore } from '@features/monitor/stores/monitor-cliente.store';
import { SELECCION_VACIA } from '@features/monitor/utils/cliente-comparacion';
import { PERIODO_CLIENTE } from '@features/monitor/utils/cliente-periodos';

function crear(): { store: MonitorClienteStore; datos: MonitorClienteDatos } {
  TestBed.configureTestingModule({ providers: [MonitorClienteStore, MonitorClienteDatos] });
  return { store: TestBed.inject(MonitorClienteStore), datos: TestBed.inject(MonitorClienteDatos) };
}

describe('MonitorClienteStore', () => {
  it('abre en Contratos con el año en curso en las dos pestañas', () => {
    const { store, datos } = crear();
    expect(store.vista()).toBe('contratos');
    expect(store.periodoActual().periodo).toBe(PERIODO_CLIENTE.anioEnCurso);
    expect(store.insignia()).toBe('01/ene/2026 - 12/nov/2026');
    expect(store.etiquetaPeriodo()).toBe('Año en curso (YTD)');
    expect(store.titulo()).toBe('Indicadores por contrato');
    expect(datos.contratosGrafica().map((c) => c.clave)).toEqual(['Multifund 061', 'Efectivo 847']);
    expect(datos.filasContratos().length).toBe(2);
    expect(datos.tablaMezclas()).toBeNull();
    expect(datos.sinProductos()).toBe(false);
  });

  it('«Personalizado» conserva el rango hasta elegir fechas; «Desde el inicio» trae los rendimientos', () => {
    const { store, datos } = crear();
    store.elegirPeriodo(PERIODO_CLIENTE.personalizado);
    expect(store.periodoActual().rango).toEqual({ inicio: '2026-01-01', fin: '2026-11-12' });
    expect(store.insignia()).toBe('');
    store.elegirRango({ inicio: '', fin: '' });
    store.elegirRango({ inicio: '2026-06-01', fin: '2026-06-30' });
    expect(store.periodoActual().rango).toEqual({ inicio: '2026-06-01', fin: '2026-06-30' });
    expect(store.periodoActual().personalizado).toEqual({ inicio: '2026-06-01', fin: '2026-06-30' });

    store.elegirPeriodo(PERIODO_CLIENTE.desdeElInicio);
    expect(datos.tablaContratos().claves).toContain('rendimientos');
    expect(datos.casillasContratos().opciones.some((o) => o.valor === 'rendimientos')).toBe(true);
  });

  it('«Comparar»: el borrador se aplica con «Aplicar», se retira desde la leyenda y se borra', () => {
    const { store, datos } = crear();
    store.editarBorrador({ ...SELECCION_VACIA, portafolios: ['FPVSTGMOD'], mezclas: [3], cdt: ['30'] });
    expect(datos.contratosGrafica().length).toBe(2);
    store.aplicarComparacion();
    expect(store.modoTasa()).toBe(true);
    expect(datos.contratosGrafica().map((c) => c.nombreVisible ?? c.nombreProducto)).toEqual([
      'Multifund 061 · CDT A 30 días',
      'Efectivo 847 · CDT A 30 días',
      'FPV Strategist Moderado · CDT A 30 días',
      'Paciente · CDT A 30 días',
      'CDT A 30 días',
    ]);
    expect(datos.filasContratos().map((f) => f.clave)).toEqual(['Multifund 061', 'Efectivo 847', 'FPVSTGMOD_30']);
    expect(datos.tituloMezclas()).toBe('Mezcla Invest-ed e CDTs');
    expect(datos.hayCdtEnTabla()).toBe(true);

    store.retirarActivo('CDT-30');
    expect(store.modoTasa()).toBe(false);
    expect(store.borrador().cdt).toEqual([]);
    expect(datos.filasContratos().map((f) => f.clave)).toContain('FPVSTGMOD');

    store.borrarComparacion();
    expect(store.aplicada()).toEqual(SELECCION_VACIA);
    expect(datos.tablaMezclas()).toBeNull();
  });

  it('las series ocultas salen de las tablas pero no cambian la gráfica', () => {
    const { store, datos } = crear();
    const grafica = datos.contratosGrafica();
    store.ocultarSeries(['Multifund 061']);
    expect(datos.contratosGrafica()).toBe(grafica);
    expect(datos.filasContratos().map((f) => [f.clave, f.porcentaje])).toEqual([['Efectivo 847', '100.00']]);
  });

  it('Portafolios: cambiar de pestaña borra lo comparado; filtro, torta y comparación', () => {
    const { store, datos } = crear();
    store.editarBorrador({ ...SELECCION_VACIA, portafolios: ['FPVSTGMOD'] });
    store.aplicarComparacion();
    store.cambiarVista();
    expect(store.vista()).toBe('portafolios');
    expect(store.aplicada()).toEqual(SELECCION_VACIA);
    expect(store.titulo()).toBe('Indicadores por portafolio');
    expect(datos.filasPortafolios().length).toBe(7);
    expect(datos.tortaPortafolios().length).toBe(7);
    expect(datos.fechaCorte()).toBe('2026-11-12');

    store.filtrar(['F']);
    expect(datos.filasPortafolios().map((f) => f.id)).toEqual(['FICEFECTIVO']);
    expect(datos.datosGraficaPortafolios().series.length).toBe(1);

    store.editarBorrador({ ...SELECCION_VACIA, portafolios: ['FPVSTGMOD'], indicadores: ['COLCAP'] });
    store.aplicarComparacion();
    expect(datos.tablaCompararPortafolios()?.datos.length).toBe(1);
    expect(datos.tablaMezclas()?.datos.length).toBe(1);
    expect(datos.tituloMezclas()).toBe('Mezcla Invest-ed e Indicadores');
    // Con portafolios o indicadores agregados la gráfica repinta todo desde la mitad de la paleta.
    expect(datos.datosGraficaPortafolios().series[0].color).toBe(store.paleta[15]);
    expect(datos.tablaPortafolios().coloresPunto?.[0]).toBe(store.paleta[4]);
  });

  it('abre el detalle (con o sin TIR) y el visor de transacciones', () => {
    const { store } = crear();
    store.abrirDetallePortafolio('FICEFECTIVO 847');
    expect(store.detalle()?.ocultarTir).toBe(false);
    store.abrirDetalleComparado('PACIENTE_30');
    expect(store.detalle()).toMatchObject({ ocultarTir: true, activo: { tipo: 'mezcla' } });
    store.cerrarDetalle();
    expect(store.detalle()).toBeNull();
    store.abrirTransacciones('FICEFECTIVO 847');
    expect(store.transacciones()).toBe('FICEFECTIVO 847');
    store.cerrarTransacciones();
    expect(store.transacciones()).toBeNull();
  });

  it('escenarios del laboratorio: sin datos y error', () => {
    expect(escenarioDesdeUrl('error')).toBe('error');
    expect(escenarioDesdeUrl('otro')).toBe('normal');
    const { store, datos } = crear();
    store.definirEscenario('sin-datos');
    expect(datos.sinProductos()).toBe(true);
    expect(datos.mensajeSinProductos()).toContain('El cliente aún no tiene portafolios activos.');
    expect(datos.tortaContratos()).toEqual([]);
    store.cambiarVista();
    expect(datos.sinPortafolios()).toBe(true);
    expect(datos.fechaCorte()).toBeNull();
    store.definirEscenario('error');
    expect(store.conError()).toBe(true);
  });

  it('guarda las columnas de cada pestaña', () => {
    const { store, datos } = crear();
    store.guardarColumnas({ nombre: true, saldo: true });
    expect(store.columnas().contratos).toEqual({ nombre: true, saldo: true });
    expect(datos.tablaContratos().columnasVisibles).toEqual({ nombre: true, saldo: true });
    expect(store.columnas().portafolios).toBeNull();
  });
});
