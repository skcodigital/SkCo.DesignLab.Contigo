import { TestBed } from '@angular/core/testing';
import { MisionesStore } from '@core/state/misiones.store';
import { ConversacionesStore, estadoDe } from './conversaciones.store';

describe('ConversacionesStore', () => {
  let store: ConversacionesStore;
  let misiones: MisionesStore;

  beforeEach(() => {
    store = TestBed.inject(ConversacionesStore);
    misiones = TestBed.inject(MisionesStore);
  });

  it('arranca con la conversación anterior en el historial y sin misión', () => {
    expect(store.historial().length).toBe(1);
    expect(estadoDe(store.historial()[0])).toBe('finalizada');
    expect(store.mision()).toBeNull();
    expect(store.hayNuevas()).toBe(false);
  });

  it('al iniciar la misión queda en curso y registra el progreso para el dashboard', () => {
    store.abrirMision();
    expect(store.misionEnCurso()).toBe(true);
    expect(store.st().etapa).toBe(1);
    expect(misiones.progreso()['oscar']).toBe(0);
    // Volver a abrirla reutiliza la misma conversación
    store.abrirMision();
    expect(store.historial().length).toBe(2);
  });

  it('recorre Entender y Situación con los valores por defecto del prototipo', () => {
    store.abrirMision();
    store.definirMonto(150000000);
    expect(store.st().cuando).toBe('este-mes');
    store.elegirMotivo('liquidez');
    store.irEtapa(2);
    expect(store.st().ctMarc).toBe('ahorro');
    store.confirmarContrato();
    expect(store.st()).toMatchObject({ ctConf: 'ahorro', etapa: 3, visitadas: [1, 2, 3] });
  });

  it('con fecha propia el cuándo pasa a «en unos meses» con la fecha elegida', () => {
    store.abrirMision();
    store.abrirFecha();
    expect(store.st().eligeFecha).toBe(true);
    store.confirmarFecha('2027-02-15');
    expect(store.st()).toMatchObject({ cuando: 'en-meses', fecha: '2027-02-15', fechaTipo: 'fecha', eligeFecha: false });
  });

  it('«No lo repondría» quita el plazo y la preferencia de crédito', () => {
    store.abrirMision();
    store.elegirPlazo(3);
    store.elegirPreferencia('credito');
    expect(store.st().dec).toBe('credito');
    store.alternarNoRepone();
    expect(store.st()).toMatchObject({ noRepone: true, plazo: null, pref: null });
  });

  it('registrar el cierre exige el trámite y deja la misión gestionada en solo lectura', () => {
    store.abrirMision();
    store.definirMonto(150000000);
    store.elegirMotivo('liquidez');
    store.irEtapa(2);
    store.confirmarContrato();
    store.elegirPreferencia('retiro');
    store.responderRentaExenta('no');
    store.irEtapa(4);
    expect(store.registrarCierre()).toBe(false);
    expect(store.st().msg?.t).toContain('Elige cómo se tramita');
    store.elegirTramite('portal');
    expect(store.registrarCierre()).toBe(true);
    expect(store.gestionada()).toBe(true);
    expect(misiones.progreso()['oscar']).toBe(4);
    // En solo lectura no cambia la decisión
    store.elegirDecision('noretira');
    expect(store.st().dec).toBe('retiro');
  });

  it('fuera de alcance cierra la conversación sin completar el Acuerdo', () => {
    store.abrirCatalogo();
    store.elegirMotivo('rendimientos');
    store.cerrarFueraDeAlcance();
    expect(store.st()).toMatchObject({ cerrado: true, fuera: true, dec: 'fuera', estado: 'cerrada-seguimiento' });
  });

  it('suma los segundos al cerrar el journey y ordena el historial', () => {
    store.abrirCatalogo();
    store.cerrarJourney(125);
    expect(store.st().segundos).toBe(125);
    expect(estadoDe(store.historial()[0])).toBe('en-curso');
    expect(estadoDe(store.historial()[1])).toBe('finalizada');
  });
});
