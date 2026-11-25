import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import { AvisoCliente } from '@features/monitor/components/cliente/aviso-cliente/aviso-cliente';
import { EncabezadoTabla } from '@features/monitor/components/cliente/encabezado-tabla/encabezado-tabla';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tabla } from '@features/monitor/components/comunes/tabla/tabla';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { VistaCliente } from '@features/monitor/interfaces/cliente';
import { EventoFila, GrupoCasillas, OpcionesTabla, ValoresCasillas } from '@features/monitor/interfaces/comunes';

/**
 * «Indicadores por contrato» o «Indicadores por portafolio»: encabezado con «Personaliza» y «Copiar tabla» y la
 * tabla. En Contratos lleva el aviso de la TIR en cero; en Portafolios, la leyenda de los grupos de columnas, las
 * 4 primeras columnas fijas al hacer scroll y la fecha de corte.
 */
@Component({
  selector: 'nc-mon-seccion-indicadores',
  imports: [AvisoCliente, EncabezadoTabla, Icono, Tabla],
  templateUrl: './seccion-indicadores.html',
  styleUrl: './seccion-indicadores.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.portafolios]': "vista() === 'portafolios'" },
})
export class SeccionIndicadores {
  readonly vista = input<VistaCliente>('contratos');
  readonly opciones = input.required<OpcionesTabla>();
  readonly titulo = input('');
  readonly etiquetaPeriodo = input('');
  readonly casillas = input.required<GrupoCasillas>();
  readonly columnas = input<ValoresCasillas | null>(null);
  readonly tirCero = input(false);
  /** Fecha de corte de los portafolios (ISO); `null` sin filas. */
  readonly fechaCorte = input<string | null>(null);

  readonly aplicarColumnas = output<ValoresCasillas>();
  readonly accionCelda = output<EventoFila>();
  readonly accionFila = output<EventoFila>();

  protected readonly avisoTir = TEXTOS_CLIENTE.tirCero;
  private readonly tabla = viewChild(Tabla);

  protected fechaVisible(iso: string): string {
    const [anio, mes, dia] = iso.slice(0, 10).split('-');
    return `${dia}/${mes}/${anio}`;
  }

  protected copiar(): void {
    this.tabla()?.copiarTabla();
  }
}
