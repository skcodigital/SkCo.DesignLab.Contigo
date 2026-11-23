import { TestBed } from '@angular/core/testing';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { AvisoStore } from './aviso.store';
import { MisionesStore, MotivoDescarte, textoMotivo } from './misiones.store';
import { SessionStore } from './session.store';
import { UiStore } from './ui.store';

describe('UiStore', () => {
  let ui: UiStore;
  beforeEach(() => (ui = TestBed.inject(UiStore)));

  it('activa, alterna y limpia modos', () => {
    ui.set('modo-mision', true);
    ui.toggle('saldos-recogidos');
    expect(ui.modoMision()).toBe(true);
    expect(ui.activo('saldos-recogidos')).toBe(true);
    ui.limpiar('modo-mision');
    expect([...ui.modos()]).toEqual(['modo-mision']);
  });

  it('no emite un set nuevo si el modo ya estaba así', () => {
    const antes = ui.modos();
    ui.set('jw-abierto', false);
    expect(ui.modos()).toBe(antes);
  });
});

describe('SessionStore', () => {
  beforeEach(() => sessionStorage.clear());

  it('entra, recuerda la vista y sale', () => {
    const s = TestBed.inject(SessionStore);
    s.entrar();
    s.recordarVista('ficha');
    expect(s.dentro()).toBe(true);
    expect(sessionStorage.getItem(STORAGE_KEYS.sesion)).toBe('1');
    expect(s.vistaGuardada()).toBe('ficha');
    s.salir();
    expect(s.dentro()).toBe(false);
    expect(s.vistaGuardada()).toBe('inicio');
  });

  it('ignora una vista guardada desconocida', () => {
    sessionStorage.setItem(STORAGE_KEYS.vista, 'recursos');
    expect(TestBed.inject(SessionStore).vistaGuardada()).toBe('inicio');
  });
});

describe('MisionesStore', () => {
  it('descarta y restaura una misión', () => {
    const m = TestBed.inject(MisionesStore);
    m.descartar('oscar', { motivo: MotivoDescarte.FalsaAlarma });
    expect(m.descartes()['oscar']?.motivo).toBe(MotivoDescarte.FalsaAlarma);
    m.restaurar('oscar');
    expect(m.descartes()['oscar']).toBeUndefined();
  });

  it('registra el progreso del journey', () => {
    const m = TestBed.inject(MisionesStore);
    m.registrarProgreso('oscar', 2);
    expect(m.progreso()['oscar']).toBe(2);
  });

  it('arma el texto del motivo', () => {
    expect(textoMotivo({ motivo: MotivoDescarte.YaAcompanado })).toBe('Ya realicé el acompañamiento antes');
    expect(textoMotivo({ motivo: MotivoDescarte.Otro, detalle: 'Cliente viajando' })).toBe('Cliente viajando');
  });
});

describe('AvisoStore', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('se cierra solo a los 4 s (6 s con Deshacer)', () => {
    const a = TestBed.inject(AvisoStore);
    a.mostrar('Hola');
    vi.advanceTimersByTime(3999);
    expect(a.actual()?.texto).toBe('Hola');
    vi.advanceTimersByTime(1);
    expect(a.actual()).toBeNull();

    a.mostrar('Con deshacer', () => undefined);
    vi.advanceTimersByTime(5999);
    expect(a.actual()).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(a.actual()).toBeNull();
  });

  it('Deshacer ejecuta la acción y cierra', () => {
    const a = TestBed.inject(AvisoStore);
    const deshacer = vi.fn();
    a.mostrar('Descartaste', deshacer);
    a.deshacer();
    expect(deshacer).toHaveBeenCalledOnce();
    expect(a.actual()).toBeNull();
  });
});
