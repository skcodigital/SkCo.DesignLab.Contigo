import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BarrasEdad } from '@features/radiografia/components/con-pac/clientes-comun/barras-edad/barras-edad';
import { DonaSegmentos } from '@features/radiografia/components/con-pac/clientes-comun/dona-segmentos/dona-segmentos';
import { Icono } from '@features/radiografia/components/con-pac/clientes-comun/icono/icono';
import { ParesClientes } from '@features/radiografia/components/con-pac/clientes-comun/pares-clientes/pares-clientes';
import { ProductosCliente } from '@features/radiografia/components/con-pac/clientes-comun/productos-cliente/productos-cliente';
import { TEXTOS_CLIENTES } from '@features/radiografia/constants/textos-clientes';
import {
  EDAD_FP,
  EVOLUCION_FP,
  PRODUCTOS_FP,
  SEGMENTOS_FP,
  TOTAL_FP,
} from '@features/radiografia/data/clientes.mock';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';

/** Pestaña "Tus clientes" · asesor (otro FP): solo sus 2 clientes en la empresa. */
@Component({
  selector: 'nc-rx-clientes-fp',
  imports: [ParesClientes, ProductosCliente, DonaSegmentos, BarrasEdad, Icono],
  templateUrl: './clientes-fp.html',
  styleUrl: './clientes-fp.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesFp {
  protected readonly store = inject(RadiografiaStore);
  protected readonly evolucion = EVOLUCION_FP;
  protected readonly productos = PRODUCTOS_FP;
  protected readonly segmentos = SEGMENTOS_FP;
  protected readonly edad = EDAD_FP;
  protected readonly total = TOTAL_FP;
  protected readonly aria1p = TEXTOS_CLIENTES.aria1p.fp;
}
