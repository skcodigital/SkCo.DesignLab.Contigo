import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AvisoStore } from '@core/state/aviso.store';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { VistaMonitor } from '@features/monitor/interfaces/comunes';
import { DocumentoActivo, TipoDocumento } from '@features/monitor/interfaces/detalle';
import { desdeIso, NOMBRES_CALENDARIO } from '@features/monitor/utils/fechas';
import { capitalizar } from '@features/monitor/utils/formatos';

/** Tarjeta de un tipo de documento: el documento vigente (si hay) y su mes de corte. */
interface TarjetaDocumento {
  tipo: TipoDocumento;
  etiqueta: string;
  documento: DocumentoActivo | null;
  /** «Octubre 2026» (el prospecto no muestra fecha). */
  fecha: string;
}

const TIPOS: readonly TipoDocumento[] = ['ficha-tecnica', 'informe-mensual', 'prospecto'];

/**
 * Pestaña «Documentos» (`documents`): una tarjeta por tipo (ficha técnica, informe mensual y prospecto) con el mes
 * de corte y el botón de descarga del vigente. En el laboratorio no se descarga: se muestra el aviso.
 * `documentos = null` pinta el error del servicio.
 */
@Component({
  selector: 'nc-mon-documentos',
  imports: [ErrorServicio, Icono],
  templateUrl: './documentos.html',
  styleUrl: './documentos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Documentos {
  readonly documentos = input<readonly DocumentoActivo[] | null>([]);
  readonly esMovil = input(false);
  readonly vista = input<VistaMonitor>('cliente');

  private readonly avisos = inject(AvisoStore);

  protected readonly tarjetas = computed<TarjetaDocumento[]>(() =>
    TIPOS.map((tipo) => {
      const documento = this.documentos()?.find((d) => d.tipo === tipo) ?? null;
      return {
        tipo,
        etiqueta: TEXTOS_DETALLE.documentos[tipo],
        documento,
        fecha: documento && tipo !== 'prospecto' ? this.mesCorte(documento.fechaCorte) : '',
      };
    }),
  );

  protected descargar(): void {
    this.avisos.mostrar(TEXTOS.sinDescargas);
  }

  /** `date: 'MMMM yyyy' : 'es-CO' | capitalize`. */
  private mesCorte(iso: string): string {
    const fecha = desdeIso(iso);
    if (!fecha) {
      return '';
    }
    return capitalizar(`${NOMBRES_CALENDARIO['es-CO'].mesesLargos[fecha.getMonth()]} ${fecha.getFullYear()}`);
  }
}
