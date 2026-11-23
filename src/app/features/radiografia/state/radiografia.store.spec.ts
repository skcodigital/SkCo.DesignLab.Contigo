import { TestBed } from '@angular/core/testing';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';

describe('RadiografiaStore', () => {
  let store: RadiografiaStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RadiografiaStore] });
    store = TestBed.inject(RadiografiaStore);
  });

  it('arranca en director, con PAC y en Resumen', () => {
    expect(store.vista()).toBe('director');
    expect(store.plan()).toBe('con');
    expect(store.tab()).toBe('resumen');
    expect(store.tabsVisibles()).toEqual(['resumen', 'dueno', 'clientes', 'relacion', 'plan', 'ruta']);
  });

  it('las pestañas dependen de la vista', () => {
    store.configurar('con', 'dueno', null);
    expect(store.tabsVisibles()).toEqual(['resumen', 'clientes', 'relacion', 'plan', 'ruta']);
    store.configurar('con', 'fp', null);
    expect(store.tabsVisibles()).toEqual(['resumen', 'clientes', 'relacion', 'plan']);
  });

  it('una pestaña que la vista no ve cae en Resumen', () => {
    store.configurar('con', 'fp', 'ruta');
    expect(store.tab()).toBe('resumen');
    store.configurar('con', 'director', 'ruta');
    expect(store.tab()).toBe('ruta');
  });

  it('sin PAC siempre entra como director', () => {
    store.configurar('sin', 'fp', 'clientes');
    expect(store.vista()).toBe('director');
    expect(store.sinPac()).toBe(true);
    expect(store.tab()).toBe('clientes');
    expect(store.nombreTab()).toBe('Clientes');
  });

  it('irAProductos lleva al Resumen y deja el pedido pendiente', () => {
    store.seleccionarTab('plan');
    store.irAProductos();
    expect(store.tab()).toBe('resumen');
    expect(store.productosPedidos()).toBe(true);
    store.productosMostrados();
    expect(store.productosPedidos()).toBe(false);
  });

  it('enviar la ruta arma la confirmación y el seguimiento', () => {
    store.incluirMeta('retener', false);
    store.cambiarValorMeta('activar', 200);
    store.cambiarPlazo('15');
    store.enviarRuta();
    const env = store.enviada()!;
    expect(env.editada).toBe(false);
    expect(env.plazo).toBe(15);
    expect(env.metas.map((m) => m.id)).toEqual(['activar', 'profundizar', 'consolidar']);
    expect(env.metas[0]).toEqual({ id: 'activar', texto: 'Activar: +200 clientes nuevos', editada: true });
    expect(store.ruta().map((m) => m.estado)).toEqual(['curso', 'curso', 'curso']);
    expect(store.rutaEnviada()).toBe(true);
    expect(store.rutaMod()?.quien).toBe('director');
  });

  it('editar la ruta conserva el estado de las metas', () => {
    store.enviarRuta();
    store.marcarLograda('activar');
    store.abrirEditarRuta();
    expect(store.enviada()).toBeNull();
    expect(store.editandoRuta()).toBe(true);
    store.enviarRuta();
    expect(store.enviada()?.editada).toBe(true);
    expect(store.ruta().find((m) => m.id === 'activar')?.estado).toBe('lograda');
  });

  it('descartar una meta la saca de la ruta y la desmarca en la modal', () => {
    store.enviarRuta();
    store.pedirDescarte('consolidar');
    expect(store.metaDescartando()?.id).toBe('consolidar');
    store.confirmarDescarte();
    expect(store.ruta().some((m) => m.id === 'consolidar')).toBe(false);
    expect(store.metasForm().find((m) => m.id === 'consolidar')?.incluida).toBe(false);
    expect(store.metaDescartando()).toBeNull();
  });

  it('guardar una meta actualiza la ruta y la modal', () => {
    store.enviarRuta();
    store.abrirEditarMeta('profundizar');
    store.guardarMeta(60);
    expect(store.ruta().find((m) => m.id === 'profundizar')?.valor).toBe(60);
    expect(store.metasForm().find((m) => m.id === 'profundizar')?.valor).toBe(60);
    expect(store.metaEditando()).toBeNull();
  });

  it('sin PAC: la ruta solo se envía (sin seguimiento) y el cambio de empresa la reinicia', () => {
    store.configurar('sin', 'director', null);
    expect(store.metasForm().find((m) => m.id === 'activar')?.sugerida).toBe(7);
    store.enviarRuta();
    expect(store.enviada()).not.toBeNull();
    expect(store.ruta()).toEqual([]);
    store.asignarFp('Felipe Arango Mejía');
    store.configurar('con', 'director', null);
    expect(store.enviada()).toBeNull();
    expect(store.fpAsignado()).toBeNull();
  });
});
