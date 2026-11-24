import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { TEXTOS } from '../../../constants/textos';
import { HOY } from '../../../data/conversaciones.mock';
import { ProximoPaso } from '../../../interfaces/conversacion';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { iso } from '../../../utils/formato';
import { textoCliente } from '../../../utils/texto-cliente';
import { soloLectura } from '../../../utils/validaciones';

const COPIADO_MS = 1500;

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
  protected readonly hoy = iso(HOY);
  protected readonly resumen = computed(() => textoCliente(this.st()));
  protected readonly copiar = signal<string>(TEXTOS.copiar);

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected marcar(k: ProximoPaso, e: Event): void {
    this.store.marcarProximoPaso(k, (e.target as HTMLInputElement).checked);
  }

  protected seguimiento(e: Event): void {
    this.store.definirSeguimiento((e.target as HTMLInputElement).value);
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
