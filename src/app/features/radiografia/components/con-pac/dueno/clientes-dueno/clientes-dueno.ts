import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClientesAmbitos } from '@features/radiografia/components/con-pac/clientes-comun/clientes-ambitos/clientes-ambitos';
import { Oportunidad } from '@features/radiografia/components/con-pac/clientes-comun/oportunidad/oportunidad';
import { OPORTUNIDAD_DUENO, OPORTUNIDAD_DUENO_ARIA } from '@features/radiografia/data/clientes.mock';

/** Pestaña Clientes · FP Asignado: su porción frente a la de otros asesores (agregada). */
@Component({
  selector: 'nc-rx-clientes-dueno',
  imports: [Oportunidad, ClientesAmbitos],
  templateUrl: './clientes-dueno.html',
  styleUrl: './clientes-dueno.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesDueno {
  protected readonly tramos = OPORTUNIDAD_DUENO;
  protected readonly aria = OPORTUNIDAD_DUENO_ARIA;
}
