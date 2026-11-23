import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from '@angular/core';
import { Dialogo } from '@features/radiografia/components/comunes/dialogo/dialogo';
import { TEXTOS_RUTA } from '@features/radiografia/constants/textos-ruta';
import { FP_ASIGNADO } from '@features/radiografia/data/ruta-accion.mock';
import { ConfigRuta, MetaId, Plazo } from '@features/radiografia/interfaces/ruta-accion';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { fmtNum } from '@features/radiografia/utils/formato';
import {
  destinatarioConfirmacion,
  destinatarioModal,
  textoCalcMeta,
  textoPlazo,
} from '@features/radiografia/utils/ruta-accion';

interface DefCampoMeta {
  readonly nombre: string;
  readonly detalle: (cfg: ConfigRuta) => string;
  readonly antes: string;
  readonly despues: string;
  readonly aria: string;
  readonly max: number | null;
}

/** Etiquetas y unidades de cada meta en la modal. */
const CAMPOS: Readonly<Record<MetaId, DefCampoMeta>> = {
  activar: {
    nombre: 'Activar',
    detalle: () => ' · clientes nuevos',
    antes: '+',
    despues: 'clientes',
    aria: 'Meta de clientes nuevos',
    max: null,
  },
  profundizar: {
    nombre: 'Profundizar',
    detalle: (c) => ` · cross-sell 2P+ (hoy ${c.baseProfundizar}%)`,
    antes: 'a',
    despues: '%',
    aria: 'Meta de cross-sell 2P+ en porcentaje',
    max: 100,
  },
  consolidar: {
    nombre: 'Consolidar',
    detalle: (c) => ` · share de FPOB (hoy ${c.baseConsolidar}%)`,
    antes: 'a',
    despues: '%',
    aria: 'Meta de share de FPOB en porcentaje',
    max: 100,
  },
  retener: {
    nombre: 'Retener',
    detalle: (c) => ` · neto anual de clientes (hoy ${c.retenerHoy})`,
    antes: '≥ +',
    despues: 'clientes',
    aria: 'Meta de neto anual de clientes',
    max: null,
  },
};

const PLAZOS: readonly { readonly valor: Plazo; readonly etiqueta: string }[] = [
  { valor: '', etiqueta: 'Sin plazo' },
  { valor: '15', etiqueta: '15 días' },
  { valor: '30', etiqueta: '30 días' },
  { valor: 'otro', etiqueta: 'Otro' },
];

/**
 * Modal "Crear Ruta de Acción": metas sugeridas que el director puede ajustar, plazo y mensaje.
 * Al enviar pasa a la confirmación; "Editar ruta" la abre con las metas actuales. Con y sin PAC.
 */
@Component({
  selector: 'nc-rx-crear-ruta-modal',
  imports: [Dialogo],
  templateUrl: './crear-ruta-modal.html',
  styleUrl: './crear-ruta-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearRutaModal {
  protected readonly store = inject(RadiografiaStore);
  private readonly injector = inject(Injector);
  private readonly sent = viewChild<ElementRef<HTMLElement>>('sent');
  private readonly dias = viewChild<ElementRef<HTMLInputElement>>('dias');

  protected readonly textos = TEXTOS_RUTA;
  protected readonly plazos = PLAZOS;
  /** Foco inicial: lo enviado si ya existe una ruta; si no, la primera meta editable. */
  protected readonly foco = this.store.enviada() ? '.sent' : '.goal-input:not([disabled])';

  protected readonly metas = computed(() => {
    const cfg = this.store.configRuta();
    return this.store.metasForm().map((m) => {
      const campo = CAMPOS[m.id];
      return {
        ...m,
        campo,
        detalle: campo.detalle(cfg),
        min: cfg.minimos[m.id],
        calc: textoCalcMeta(m.id, m.valor, cfg),
        editada: m.valor !== m.sugerida,
        sugeridaTxt: fmtNum(m.sugerida),
      };
    });
  });
  protected readonly empresa = computed(() => this.store.configRuta().empresa);
  /** A quién va la ruta en la descripción. */
  protected readonly destinatario = computed(() =>
    this.store.sinPac() ? destinatarioModal(this.store.fpAsignado()) : FP_ASIGNADO,
  );
  protected readonly confirmacion = computed(() =>
    this.store.sinPac()
      ? destinatarioConfirmacion(this.store.fpAsignado())
      : { quien: FP_ASIGNADO, resto: TEXTOS_RUTA.laRecibio },
  );
  protected readonly plazoTexto = computed(() => textoPlazo(this.store.enviada()?.plazo ?? 0));

  protected alIncluir(id: MetaId, e: Event): void {
    if (e.target instanceof HTMLInputElement) this.store.incluirMeta(id, e.target.checked);
  }

  protected alEscribir(id: MetaId, e: Event): void {
    if (e.target instanceof HTMLInputElement) this.store.cambiarValorMeta(id, Number(e.target.value));
  }

  protected usarSugerida(id: MetaId, input: HTMLInputElement): void {
    this.store.usarSugerida(id);
    input.focus();
  }

  /** Plazo: "Otro" muestra el campo para escribir los días. */
  protected alElegirPlazo(p: Plazo): void {
    this.store.cambiarPlazo(p);
    if (p === 'otro') afterNextRender(() => this.dias()?.nativeElement.focus(), { injector: this.injector });
  }

  protected alEscribirDias(e: Event): void {
    if (e.target instanceof HTMLInputElement) this.store.cambiarPlazoDias(Number(e.target.value));
  }

  protected alEscribirMensaje(e: Event): void {
    if (e.target instanceof HTMLTextAreaElement) this.store.cambiarMensaje(e.target.value);
  }

  /** Al enviar, la modal pasa a la confirmación con el resumen de lo enviado. */
  protected enviar(e: Event): void {
    e.preventDefault();
    this.store.enviarRuta();
    afterNextRender(() => this.sent()?.nativeElement.focus(), { injector: this.injector });
  }
}
