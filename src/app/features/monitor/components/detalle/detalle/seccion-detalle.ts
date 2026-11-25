import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Desempeno } from '@features/monitor/components/detalle/desempeno/desempeno';
import { Documentos } from '@features/monitor/components/detalle/documentos/documentos';
import { Rebalanceos } from '@features/monitor/components/detalle/rebalanceos/rebalanceos';
import { TendenciaActivo } from '@features/monitor/components/detalle/tendencia-activo/tendencia-activo';
import { Tendencia } from '@features/monitor/components/detalle/tendencia/tendencia';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { RangoFechas, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { ActivoDetalle } from '@features/monitor/interfaces/detalle';

/** Sección que pinta cada pestaña del detalle. */
export type TipoSeccionDetalle = 'desempeno' | 'tendencia' | 'tendencia-activo' | 'rebalanceos' | 'documentos';

/** Contenido de la pestaña activa del detalle de un activo (`ngComponentOutlet` de producción). */
@Component({
  selector: 'nc-mon-seccion-detalle',
  imports: [Desempeno, Documentos, Rebalanceos, Tendencia, TendenciaActivo],
  template: `
    @let a = activo();
    @switch (seccion()) {
      @case ('desempeno') {
        <nc-mon-desempeno
          [periodos]="a.desempeno"
          [esMezcla]="a.tipo === 'mezcla'"
          [etiquetaActivo]="etiquetaActivo()"
          [conTir]="conTir()"
          [esMovil]="esMovil()"
          [vista]="vista()"
        />
      }
      @case ('tendencia') {
        @if (a.tendencia; as t) {
          <nc-mon-tendencia
            [tendencia]="t"
            [periodoInicial]="periodo()"
            [rangoInicial]="rango()"
            [hoy]="hoy()"
            [vista]="vista()"
            [esMovil]="esMovil()"
          />
        }
      }
      @case ('tendencia-activo') {
        <nc-mon-tendencia-activo [tendencia]="a.tendenciaActivo ?? vacia" [hoy]="hoy()" [vista]="vista()" />
      }
      @case ('rebalanceos') {
        <nc-mon-rebalanceos [rebalanceos]="a.rebalanceos ?? []" [vista]="vista()" />
      }
      @case ('documentos') {
        <nc-mon-documentos [documentos]="a.documentos === undefined ? [] : a.documentos" [esMovil]="esMovil()" [vista]="vista()" />
      }
    }
  `,
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionDetalle {
  readonly seccion = input.required<TipoSeccionDetalle>();
  readonly activo = input.required<ActivoDetalle>();
  readonly vista = input<VistaMonitor>('cliente');
  readonly ocultarTir = input(false);
  readonly periodo = input<number>(1);
  readonly rango = input<RangoFechas>({ inicio: '', fin: '' });
  readonly hoy = input<Date>(new Date());
  readonly esMovil = input(false);

  protected readonly vacia = { categorias: [], etiquetas: [], series: [] };

  protected readonly conTir = computed(() => this.vista() === 'cliente' && !this.ocultarTir());

  protected readonly etiquetaActivo = computed(() => {
    const tipo = this.activo().tipo;
    return tipo === 'mezcla' ? '' : TEXTOS_DETALLE.etiquetasActivo[tipo];
  });
}
