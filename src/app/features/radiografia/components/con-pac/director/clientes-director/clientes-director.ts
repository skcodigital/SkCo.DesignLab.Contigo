import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClientesAmbitos } from '@features/radiografia/components/con-pac/clientes-comun/clientes-ambitos/clientes-ambitos';
import { Oportunidad } from '@features/radiografia/components/con-pac/clientes-comun/oportunidad/oportunidad';
import { OPORTUNIDAD_DIRECTOR, OPORTUNIDAD_DIRECTOR_ARIA } from '@features/radiografia/data/clientes.mock';

/** Pestaña Clientes · director comercial (empresa con PAC). */
@Component({
  selector: 'nc-rx-clientes-director',
  imports: [Oportunidad, ClientesAmbitos],
  templateUrl: './clientes-director.html',
  styleUrl: './clientes-director.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesDirector {
  protected readonly tramos = OPORTUNIDAD_DIRECTOR;
  protected readonly aria = OPORTUNIDAD_DIRECTOR_ARIA;
}
