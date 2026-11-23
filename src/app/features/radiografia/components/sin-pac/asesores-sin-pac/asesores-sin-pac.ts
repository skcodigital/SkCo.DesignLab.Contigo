import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { IconoSpView } from '@features/radiografia/components/sin-pac/icono-sp/icono-sp';
import { LECTURAS_AUTOMATICAS_VISIBLES } from '@features/radiografia/constants/ajustes';
import { ASESORES_SP, VINCULADOS_SP } from '@features/radiografia/data/sin-pac.mock';

/** Asesores en la empresa (sin FP Asignado): quién vinculó clientes y asesores con clientes en la empresa. */
@Component({
  selector: 'nc-rx-asesores-sin-pac',
  imports: [ChartTip, IconoSpView],
  templateUrl: './asesores-sin-pac.html',
  styleUrl: './asesores-sin-pac.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsesoresSinPac {
  protected readonly lecturas = LECTURAS_AUTOMATICAS_VISIBLES;
  protected readonly asesores = ASESORES_SP;
  protected readonly columnas = VINCULADOS_SP.map((c) => {
    const agencia = c.tramos.find((t) => t.gestion === 'agencia')?.valor ?? 0;
    const otras = c.tramos.find((t) => t.gestion === 'otras')?.valor ?? 0;
    return {
      ...c,
      aria: `${c.anio}: ${c.total} clientes nuevos. Tu agencia ${agencia}, otras agencias ${otras}.`,
      tramos: c.tramos.map((t) => ({ ...t, tip: { titulo: c.anio, lineas: [`${t.etiqueta}: ${t.valor}`] } })),
    };
  });
}
