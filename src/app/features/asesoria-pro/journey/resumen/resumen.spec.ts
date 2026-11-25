import { TestBed } from '@angular/core/testing';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { fLarga } from '../../utils/formato';
import { textoCliente } from '../../utils/texto-cliente';
import { Resumen } from './resumen';

describe('Resumen · llamada de seguimiento', () => {
  let store: ConversacionesStore;
  const cuando = fLarga(new Date(2026, 10, 28)) + ', 2:30 p. m.';

  const pintar = (): string => {
    const f = TestBed.createComponent(Resumen);
    f.detectChanges();
    return (f.nativeElement as HTMLElement).textContent ?? '';
  };

  beforeEach(() => {
    store = TestBed.inject(ConversacionesStore);
    store.abrirMision();
    store.definirMonto(150000000);
    store.elegirMotivo('liquidez');
    store.irEtapa(2);
    store.confirmarContrato();
    store.irEtapa(4);
    store.elegirDecision('pensara');
  });

  it('pide confirmar y registra fecha y hora sin cerrar el acompañamiento, aunque salga y vuelva', () => {
    expect(pintar()).not.toContain('Llamada de seguimiento');
    store.registrarAgenda('teams');
    expect(pintar()).toContain('Por confirmar fecha y hora');
    store.responderAgenda(true);
    expect(store.st().agenda?.hora).toBe('10:00');
    expect(pintar()).toContain('Por confirmar fecha y hora');
    store.fijarAgenda('fecha', '2026-11-28');
    store.fijarAgenda('hora', '14:30');
    expect(store.st().cerrado).toBe(false);
    expect(pintar()).toContain(cuando + ' · Microsoft Teams');
    store.irEtapa(3);
    store.cerrarJourney(60);
    store.abrirMision();
    expect(pintar()).toContain(cuando + ' · Microsoft Teams');
    expect(textoCliente(store.st())).toContain('Llamada de seguimiento: ' + cuando);
  });

  it('si responde que no la agendó, no queda en el resumen', () => {
    store.registrarAgenda('google');
    store.responderAgenda(false);
    expect(pintar()).not.toContain('Llamada de seguimiento');
  });
});
