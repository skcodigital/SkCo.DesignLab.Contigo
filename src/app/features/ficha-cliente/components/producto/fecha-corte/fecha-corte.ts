import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DiaCalendario } from '@features/ficha-cliente/interfaces/composicion';
import { construirMes, formatoFechaCorta, primerDiaDelMes, sumarMeses } from '@features/ficha-cliente/utils/fechas';

/** Botón "Fecha de corte" con su calendario (solo días entre la fecha mínima con datos y hoy). */
@Component({
  selector: 'nc-fecha-corte',
  templateUrl: './fecha-corte.html',
  styleUrl: './fecha-corte.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'alClicDocumento($event)' },
})
export class FechaCorte {
  readonly seleccion = input.required<Date>();
  readonly texto = input.required<string>();
  readonly hoy = input.required<Date>();
  readonly minima = input.required<Date>();
  readonly elegir = output<Date>();
  /** El asesor abrió o cerró el calendario (cuenta como usar "Saldos a otras fechas"). */
  readonly alternado = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');
  private readonly grilla = viewChild<ElementRef<HTMLElement>>('dias');

  protected readonly abierto = signal(false);
  /** Mes que se está viendo en el calendario (al abrir, el de la fecha elegida). */
  private readonly vista = signal<Date | null>(null);

  protected readonly mes = computed(() =>
    construirMes(this.vista() ?? primerDiaDelMes(this.seleccion()), this.seleccion(), this.hoy(), this.minima()),
  );
  protected readonly vacios = computed(() => Array.from({ length: this.mes().vacios }, (_, i) => i));
  protected readonly minimaTexto = computed(() => formatoFechaCorta(this.minima()));

  /** Foco en el botón sin mover la página (lo usa el aviso de novedad). */
  enfocar(): void {
    this.boton().nativeElement.focus({ preventScroll: true });
  }

  protected alternar(): void {
    if (this.abierto()) this.cerrar(false);
    else this.abrir();
    this.alternado.emit();
  }

  protected navegar(meses: number): void {
    this.vista.set(sumarMeses(this.vista() ?? primerDiaDelMes(this.seleccion()), meses));
  }

  protected elegirDia(d: DiaCalendario): void {
    if (d.deshabilitado) return;
    this.elegir.emit(d.fecha);
    this.cerrar(true);
  }

  protected irAHoy(): void {
    this.elegir.emit(new Date(this.hoy()));
    this.cerrar(true);
  }

  protected alEscape(e: Event): void {
    e.preventDefault();
    this.cerrar(true);
  }

  protected alClicDocumento(e: MouseEvent): void {
    if (this.abierto() && e.target instanceof Node && !this.host.nativeElement.contains(e.target)) this.cerrar(false);
  }

  private abrir(): void {
    this.vista.set(primerDiaDelMes(this.seleccion()));
    this.abierto.set(true);
    // El foco va al día elegido (o al primer día disponible) para elegir con teclado.
    afterNextRender(
      () => {
        const grilla = this.grilla()?.nativeElement;
        const dia =
          grilla?.querySelector<HTMLButtonElement>('button[aria-selected="true"]') ??
          grilla?.querySelector<HTMLButtonElement>('button:not(:disabled)');
        dia?.focus();
      },
      { injector: this.injector },
    );
  }

  private cerrar(foco: boolean): void {
    this.abierto.set(false);
    if (foco) this.boton().nativeElement.focus();
  }
}
