import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KpiResumenCard } from '@features/radiografia/components/con-pac/comun/kpi-resumen/kpi-resumen';
import { ProductosEmpresa } from '@features/radiografia/components/con-pac/comun/productos-empresa/productos-empresa';
import { RutaPenetracionCard } from '@features/radiografia/components/con-pac/comun/ruta-penetracion/ruta-penetracion';
import { GrupoProductos, KpiResumen, RutaPenetracion } from '@features/radiografia/interfaces/resumen';

/**
 * Contenido de la pestaña Resumen (con PAC): tarjetas, productos de la empresa y ruta de penetración.
 * Sin `ruta` (vista del asesor) la grilla va en una columna con los productos bloqueados.
 */
@Component({
  selector: 'nc-rx-resumen-panel',
  imports: [KpiResumenCard, ProductosEmpresa, RutaPenetracionCard],
  template: `
    <div class="kpis kpis--panel">
      @for (k of kpis(); track k.etiqueta) {
        <nc-rx-kpi-resumen [kpi]="k" />
      }
    </div>
    <div class="resumen-grid" [class.resumen-grid--fp]="!ruta()">
      <nc-rx-productos-empresa [grupos]="productos()" [idSeccion]="idProductos()" [bloqueados]="!ruta()" />
      @if (ruta(); as r) {
        <nc-rx-ruta-penetracion [ruta]="r" [sufijo]="sufijo()" />
      }
    </div>
  `,
  styleUrl: './resumen-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenPanel {
  readonly kpis = input.required<readonly KpiResumen[]>();
  readonly productos = input.required<readonly GrupoProductos[]>();
  readonly ruta = input<RutaPenetracion | null>(null);
  /** id de "Productos de la empresa" (destino de "Ver detalles del plan"). */
  readonly idProductos = input.required<string>();
  readonly sufijo = input('');
}
