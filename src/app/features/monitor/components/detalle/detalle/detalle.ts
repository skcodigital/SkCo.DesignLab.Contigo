import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { injectMediaQuery } from '@core/utils/media-query';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { Modal, VarianteModal } from '@features/monitor/components/detalle/modal/modal';
import {
  TipoSeccionDetalle,
  SeccionDetalle,
} from '@features/monitor/components/detalle/detalle/seccion-detalle';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { NombreIcono, RangoFechas, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { ActivoDetalle } from '@features/monitor/interfaces/detalle';
import { PERIODO } from '@features/monitor/utils/periodos';

/** Pestaña del detalle (`TabConfig`). */
interface PestanaDetalle {
  clave: string;
  icono: NombreIcono;
  seccion: TipoSeccionDetalle;
  deshabilitada: boolean;
}

const P = TEXTOS_DETALLE.pestanas;

/**
 * Detalle de un activo (`details-portfolio`, abierto en una modal): título, pestañas Desempeño, Tendencia,
 * Rebalanceos (solo mezclas) y Documentos, y en móvil un menú de pestañas con «Volver».
 *
 * Se abre pintándolo (`@if (activo) { <nc-mon-detalle … (cerrar)="activo = null" /> }`) y avisa `cerrar` con la
 * «x», «Volver» desde el menú móvil, Escape o un clic fuera. Diferencias entre vistas (`vista`):
 * - cliente: modal de 1140px a pantalla completa en móvil, logo de la compañía junto al título y TIR en el
 *   desempeño (salvo `ocultarTir`, cuando el activo se está comparando);
 * - exterior: modal al 80 % del ancho (pantalla completa en móvil), sin logo ni TIR.
 * La tendencia de una mezcla arranca en `periodo`/`rango` (el cliente usa «Último mes»; el exterior, el periodo
 * de la comparación).
 */
@Component({
  selector: 'nc-mon-detalle',
  imports: [Icono, Modal, SeccionDetalle, Tooltip],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.vista-cliente]': "vista() === 'cliente'" },
})
export class Detalle {
  readonly activo = input.required<ActivoDetalle>();
  readonly vista = input<VistaMonitor>('cliente');
  /** Sin columna TIR (cliente): el activo se abrió desde la tabla de comparación. */
  readonly ocultarTir = input(false);
  /** Periodo inicial de la tendencia de una mezcla. */
  readonly periodo = input<number>(PERIODO.ultimoMes);
  readonly rango = input<RangoFechas>({ inicio: '', fin: '' });
  readonly hoy = input<Date>(new Date());

  readonly cerrar = output<void>();

  protected readonly esMovil = injectMediaQuery('(max-width: 767.98px)');
  protected readonly textoPronto = P.disponiblePronto;
  protected readonly prefijoMezcla = TEXTOS_DETALLE.mezclaInvested;

  protected readonly pestanaActiva = signal<string>(P.desempeno);
  /** Móvil: se entró a una pestaña desde el menú. */
  protected readonly enPestana = signal(false);

  protected readonly esMezcla = computed(() => this.activo().tipo === 'mezcla');

  protected readonly pestanas = computed<PestanaDetalle[]>(() => {
    const mezcla = this.esMezcla();
    const tipo = this.activo().tipo;
    return [
      { clave: P.desempeno, icono: 'buscar-mas', seccion: 'desempeno', deshabilitada: false },
      {
        clave: P.tendencia,
        icono: 'grafica-linea-sube',
        seccion: mezcla ? 'tendencia' : 'tendencia-activo',
        // Sin servicio de tendencia para los demás tipos: deshabilitada.
        deshabilitada: !mezcla,
      },
      ...(mezcla
        ? [{ clave: P.rebalanceos, icono: 'refrescar' as const, seccion: 'rebalanceos' as const, deshabilitada: true }]
        : []),
      // Solo los portafolios Skandia y las mezclas tienen documentos.
      { clave: P.documentos, icono: 'archivo', seccion: 'documentos', deshabilitada: tipo !== 'mezcla' && tipo !== 'portafolio' },
    ];
  });

  protected readonly seccionActiva = computed<TipoSeccionDetalle>(
    () => this.pestanas().find((p) => p.clave === this.pestanaActiva())?.seccion ?? 'desempeno',
  );

  protected readonly variante = computed<VarianteModal>(() => {
    if (this.vista() === 'cliente') {
      return 'contigo';
    }
    return this.esMovil() ? 'pantalla-completa' : 'xl';
  });

  protected elegirEnMovil(p: PestanaDetalle): void {
    if (p.deshabilitada) {
      return;
    }
    this.pestanaActiva.set(p.clave);
    this.enPestana.set(true);
  }

  protected volver(): void {
    if (this.enPestana()) {
      this.enPestana.set(false);
      return;
    }
    this.cerrar.emit();
  }
}
