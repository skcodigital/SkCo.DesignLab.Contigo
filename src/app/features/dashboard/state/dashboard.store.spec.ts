import { TestBed } from '@angular/core/testing';
import { MisionesStore, MotivoDescarte } from '@core/state/misiones.store';
import { TEXTOS } from '../constants/textos';
import { INDICADORES_BASE } from '../data/logros.mock';
import { DashboardStore } from './dashboard.store';
import { PlaneacionStore } from './planeacion.store';

describe('DashboardStore', () => {
  let store: DashboardStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DashboardStore] });
    store = TestBed.inject(DashboardStore);
  });

  it('arranca en octubre 2026 con los valores base', () => {
    expect(store.mes()).toEqual({ anio: 2026, mes: 9 });
    expect(store.asesor()).toBeNull();
    expect(store.indicadores()).toBe(INDICADORES_BASE);
    expect(store.actualizacion()).toBe(0);
  });

  it('elegir mes o asesor recalcula los indicadores', () => {
    store.elegirMes({ anio: 2025, mes: 3 });
    expect(store.actualizacion()).toBe(1);
    expect(store.indicadores()).not.toBe(INDICADORES_BASE);
    expect(store.indicadores()[0].etiqueta).toBe('Venta neta');
    store.elegirAsesor(2);
    expect(store.asesor()).toBe(2);
    expect(store.actualizacion()).toBe(2);
  });
});

describe('PlaneacionStore', () => {
  let dash: DashboardStore;
  let misiones: MisionesStore;
  let store: PlaneacionStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DashboardStore, PlaneacionStore] });
    dash = TestBed.inject(DashboardStore);
    misiones = TestBed.inject(MisionesStore);
    store = TestBed.inject(PlaneacionStore);
  });

  it('muestra las misiones propias con Óscar destacado', () => {
    expect(store.lectura()).toBe(false);
    expect(store.pendientes().length).toBe(4);
    expect(store.destacada()?.id).toBe('oscar');
    expect(store.quien()).toBe(TEXTOS.planeacion.quienPropio);
  });

  it('refleja los descartes compartidos (también los de la ficha) y los deshace', () => {
    store.seleccionar(2);
    misiones.descartar('mejia', { motivo: MotivoDescarte.NoRelevante });
    expect(store.pendientes().map((m) => m.id)).toEqual(['oscar', 'pardo', 'torres']);
    store.descartar('torres', { motivo: MotivoDescarte.Otro, detalle: 'x' });
    expect(store.destacada()?.id).toBe('pardo'); // la lista se acortó: queda en la última
    store.restaurar('mejia');
    expect(store.destacada()?.id).toBe('mejia');
    expect(misiones.descartes()).toEqual({ torres: { motivo: MotivoDescarte.Otro, detalle: 'x' } });
  });

  it('sin pendientes muestra el texto de semana completada', () => {
    (['oscar', 'pardo', 'mejia', 'torres'] as const).forEach((id) =>
      misiones.descartar(id, { motivo: MotivoDescarte.FalsaAlarma }),
    );
    expect(store.destacada()).toBeNull();
    expect(store.textoVacio()).toBe(TEXTOS.planeacion.vacioCompletasPropio);
  });

  it('otro asesor: solo lectura, sus misiones y la destacada vuelve a la primera', () => {
    store.seleccionar(1);
    dash.elegirAsesor(0);
    expect(store.lectura()).toBe(true);
    expect(store.indiceDestacada()).toBe(0);
    expect(store.pendientes()[0].id).toBe('x0');
    expect(store.quien()).toBe('Misiones de Juan Camilo esta semana');
    expect(store.textoVacio()).toBe(TEXTOS.planeacion.vacioCompletasAsesor);
  });
});
