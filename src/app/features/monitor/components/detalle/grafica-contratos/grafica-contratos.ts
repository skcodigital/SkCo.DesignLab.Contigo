import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { GraficaLineas, CargarDetallePunto } from '@features/monitor/components/comunes/grafica-lineas/grafica-lineas';
import { GraficaSinDatos } from '@features/monitor/components/comunes/grafica-sin-datos/grafica-sin-datos';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { ContratoGrafica } from '@features/monitor/interfaces/detalle';
import { armarGraficaContratos, contratoDecorativo } from '@features/monitor/utils/detalle-contratos';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';

/**
 * Gráfica de contratos del Monitor del cliente (`monitor-contigo`): «Comportamiento de los contratos» con los
 * contratos propios y lo agregado con «Comparar», normalizados a base 1.000 (o en tasa con un CDT aplicado).
 *
 * Sin productos (`sinProductos`: el cliente no tiene contratos ni hay nada comparado) pinta, como producción, una
 * serie decorativa detrás del aviso azul.
 */
@Component({
  selector: 'nc-mon-grafica-contratos',
  imports: [GraficaLineas, GraficaSinDatos],
  template: `
    @let d = datos();
    <div class="contenido">
      <nc-mon-grafica-lineas
        [etiquetas]="d.etiquetas"
        [series]="d.series"
        [yMin]="d.yMin"
        [yMax]="d.yMax"
        [detallePunto]="detallePunto()"
        [seriesContrato]="seriesContrato()"
        (quitarSerie)="quitarSerie.emit($event)"
        (seriesOcultas)="seriesOcultas.emit($event)"
      />
      @if (sinProductos()) {
        <nc-mon-grafica-sin-datos [mensaje]="mensajeSinProductos()" />
      }
    </div>
  `,
  // `.content.empty-without`: el aviso va en posición absoluta sobre la gráfica.
  styles: ':host { display: block; } .contenido { position: relative; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaContratos {
  /** Contratos propios (no removibles) y activos agregados con «Comparar» (removibles). */
  readonly contratos = input<readonly ContratoGrafica[]>([]);
  /** Con un CDT aplicado los contratos se grafican en tasa (puede haber negativos). */
  readonly modoTasa = input(false);
  readonly sinProductos = input(false);
  readonly mensajeSinProductos = input<string>(TEXTOS_DETALLE.contratos.sinProductos);
  /** Saldo y rendimiento de un día (ver `detallePuntoContratos`); sin esto no hay cuenta regresiva. */
  readonly detallePunto = input<CargarDetallePunto | null>(null);
  readonly hoy = input<Date>(new Date());

  /** Clave del activo comparado que se retiró desde la leyenda. */
  readonly quitarSerie = output<string>();
  /** Claves de las series ocultas desde la leyenda. */
  readonly seriesOcultas = output<string[]>();

  protected readonly datos = computed(() =>
    this.sinProductos()
      ? armarGraficaContratos([contratoDecorativo(this.hoy(), COLORES_GRAFICA.cliente[0])])
      : armarGraficaContratos(this.contratos(), this.modoTasa()),
  );

  /** Contratos propios con puntos: los únicos que piden el detalle del punto. */
  protected readonly seriesContrato = computed(() =>
    this.sinProductos() ? [] : this.contratos().filter((c) => !c.removible && c.puntos.length).map((c) => c.clave),
  );
}
