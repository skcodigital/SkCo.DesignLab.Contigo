import { TestBed } from '@angular/core/testing';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { fLarga } from '../../utils/formato';
import { textoCliente } from '../../utils/texto-cliente';
import { Resumen } from './resumen';

describe('Resumen · reunión de seguimiento', () => {
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

  it('primero fecha y hora, luego la herramienta; se confirma sin cerrar el acompañamiento, aunque salga y vuelva', () => {
    expect(pintar()).not.toContain('Reunión de seguimiento');
    store.fijarAgenda('fecha', '2026-11-28');
    expect(store.st().agenda?.hora).toBe('10:00');
    store.fijarAgenda('hora', '14:30');
    expect(pintar()).not.toContain('Reunión de seguimiento');
    store.registrarAgenda('teams');
    expect(pintar()).toContain('Por confirmar fecha y hora');
    store.responderAgenda(true);
    expect(store.st().cerrado).toBe(false);
    expect(pintar()).toContain(cuando + ' · Microsoft Teams');
    store.irEtapa(3);
    store.cerrarJourney(60);
    store.abrirMision();
    expect(pintar()).toContain(cuando + ' · Microsoft Teams');
    expect(textoCliente(store.st())).toContain('Reunión de seguimiento: ' + cuando);
    // Cambiar la hora después obliga a agendarla de nuevo
    store.fijarAgenda('hora', '15:00');
    expect(store.st().agenda?.estado).toBe('borrador');
  });

  it('si responde que no la agendó, no queda en el resumen', () => {
    store.fijarAgenda('fecha', '2026-11-28');
    store.registrarAgenda('google');
    store.responderAgenda(false);
    expect(pintar()).not.toContain('Reunión de seguimiento');
  });
});
