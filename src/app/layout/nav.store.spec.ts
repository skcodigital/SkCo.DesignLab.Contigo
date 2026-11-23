import { TestBed } from '@angular/core/testing';
import { UiStore } from '@core/state/ui.store';
import { NavStore } from './nav.store';

describe('NavStore', () => {
  let nav: NavStore;
  let ui: UiStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [NavStore] });
    nav = TestBed.inject(NavStore);
    ui = TestBed.inject(UiStore);
  });

  it('abre y cierra una sección del drawer y refleja dr-open', () => {
    nav.alternarSeccion('f-com');
    expect(nav.seccion()).toBe('f-com');
    expect(ui.activo('dr-open')).toBe(true);
    nav.alternarSeccion('f-com');
    expect(nav.seccion()).toBeNull();
    expect(ui.activo('dr-open')).toBe(false);
  });

  it('cambiar de sección deja abierta solo la nueva', () => {
    nav.alternarSeccion('f-afil');
    nav.alternarSeccion('f-ope');
    expect(nav.seccion()).toBe('f-ope');
  });

  it('el menú móvil muestra el velo y cerrarTodo lo apaga', () => {
    nav.abrirMenuMovil();
    expect(nav.veloVisible()).toBe(true);
    nav.cerrarTodo();
    expect(nav.menuMovil()).toBe(false);
    expect(nav.veloVisible()).toBe(false);
  });
});
