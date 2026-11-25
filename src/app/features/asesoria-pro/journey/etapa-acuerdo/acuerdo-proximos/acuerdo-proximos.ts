import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { AGENDA_NOM, TEXTOS } from '../../../constants/textos';
import { HerramientaAgenda, ProximoPaso } from '../../../interfaces/conversacion';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { HOY } from '../../../data/conversaciones.mock';
import { cuandoAgenda, detalleAgenda, icsSeguimiento, tituloAgenda, urlGoogle, urlTeams } from '../../../utils/agenda';
import { iso } from '../../../utils/formato';
import { textoCliente } from '../../../utils/texto-cliente';
import { soloLectura } from '../../../utils/validaciones';
import { descargarBlob } from '../../../utils/xlsx';

const COPIADO_MS = 1500;
/** Hora por defecto de la reunión de seguimiento. */
const HORA_DEFECTO = '10:00';

/** Próximos pasos y el resumen para el cliente (Decisiones). */
@Component({
  selector: 'nc-acuerdo-proximos',
  imports: [Icono],
  templateUrl: './acuerdo-proximos.html',
  styleUrl: './acuerdo-proximos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcuerdoProximos {
  private readonly store = inject(ConversacionesStore);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly resumen = computed(() => textoCliente(this.st()));
  protected readonly copiar = signal<string>(TEXTOS.copiar);

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected marcar(k: ProximoPaso, e: Event): void {
    this.store.marcarProximoPaso(k, (e.target as HTMLInputElement).checked);
  }

  // ---- Agendar la reunión de seguimiento: fecha y hora primero, luego la herramienta ----
  protected readonly nombre = AGENDA_NOM;
  protected readonly hoy = iso(HOY);
  protected readonly horaDefecto = HORA_DEFECTO;
  protected readonly cuando = cuandoAgenda;
  protected readonly ag = computed(() => this.st().agenda);
  /** Con fecha (la hora trae 10:00 por defecto) se habilitan las herramientas. */
  protected readonly listo = computed(() => !!this.ag()?.fecha);
  private readonly titulo = tituloAgenda();
  private readonly detalle = computed(() => detalleAgenda(this.st()));
  private readonly fh = computed(() => [this.ag()?.fecha ?? '', this.ag()?.hora || HORA_DEFECTO] as const);
  protected readonly urlGoogle = computed(() => urlGoogle(this.titulo, this.detalle(), ...this.fh()));
  protected readonly urlTeams = computed(() => urlTeams(this.titulo, this.detalle(), ...this.fh()));

  protected fijar(campo: 'fecha' | 'hora', e: Event): void {
    this.store.fijarAgenda(campo, (e.target as HTMLInputElement).value);
  }

  /** El enlace abre la herramienta en otra pestaña con la fecha y la hora; luego se pregunta si la agendó. */
  protected agendar(via: HerramientaAgenda, e: Event): void {
    if (!this.listo()) {
      e.preventDefault();
      return;
    }
    this.store.registrarAgenda(via);
  }

  /** «Otros» (móvil): descarga el evento (.ics) con la fecha y la hora para abrirlo en el calendario del celular. */
  protected agendarIos(): void {
    if (!this.listo()) return;
    const ics = icsSeguimiento(this.titulo, this.detalle(), ...this.fh());
    descargarBlob(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), 'seguimiento-planeacion-pro.ics');
    this.store.registrarAgenda('ios');
  }

  protected responder(si: boolean): void {
    this.store.responderAgenda(si);
  }

  protected notas(e: Event): void {
    this.store.anotarNotas((e.target as HTMLTextAreaElement).value);
  }

  protected async copiarResumen(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.resumen());
      this.copiar.set(TEXTOS.copiado);
    } catch {
      this.copiar.set(TEXTOS.noCopiado);
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copiar.set(TEXTOS.copiar), COPIADO_MS);
  }
}
