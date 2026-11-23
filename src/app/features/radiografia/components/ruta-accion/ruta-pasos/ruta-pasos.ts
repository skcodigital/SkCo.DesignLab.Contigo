import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RUTA_ACCION_VISIBLE } from '@features/radiografia/constants/ajustes';
import { CHECK_INCLUIR_VISIBLE, TEXTOS_RUTA } from '@features/radiografia/constants/textos-ruta';
import { PASOS_RUTA, PasoRuta, QuienPaso } from '@features/radiografia/data/ruta-accion.mock';
import { ParteTexto } from '@features/radiografia/interfaces/radiografia';
import { MetaId } from '@features/radiografia/interfaces/ruta-accion';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { cumplimientoMeta, partesMetaCajita, textoAvanceMeta } from '@features/radiografia/utils/ruta-accion';

interface Cajita {
  readonly paso: PasoRuta;
  readonly desc: string;
  readonly quien: readonly QuienPaso[];
  /** Meta enviada en la ruta (recalculada) o la sugerida del diagnóstico. */
  readonly meta: readonly ParteTexto[];
  /** Cumplimiento (solo con la ruta creada y visible). */
  readonly seguimiento: { readonly pct: number; readonly avance: string } | null;
  readonly incluida: boolean;
}

/**
 * Cajitas de la Ruta comercial (diagnóstico por etapa con su meta). Con la ruta creada muestran la meta
 * enviada y su cumplimiento, y se ocultan las metas que no van en la ruta. Las usan director y FP Asignado.
 */
@Component({
  selector: 'nc-rx-ruta-pasos',
  templateUrl: './ruta-pasos.html',
  styleUrl: './ruta-pasos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutaPasos {
  readonly rol = input.required<'director' | 'dueno'>();

  protected readonly store = inject(RadiografiaStore);
  protected readonly checkVisible = CHECK_INCLUIR_VISIBLE;
  protected readonly etiquetaCumplimiento = TEXTOS_RUTA.cumplimiento;

  protected readonly cajitas = computed<readonly Cajita[]>(() => {
    const cfg = this.store.configRuta();
    const creada = this.store.rutaCreada();
    const ruta = this.store.ruta();
    const form = this.store.metasForm();
    const rol = this.rol();
    return PASOS_RUTA.flatMap((paso) => {
      const m = ruta.find((x) => x.id === paso.id);
      if (creada && !m) return [];
      return [
        {
          paso,
          desc: paso.desc[rol],
          quien: paso.quien[rol],
          meta: m ? partesMetaCajita(paso.id, m.valor, cfg) : paso.meta,
          seguimiento:
            RUTA_ACCION_VISIBLE && m
              ? { pct: cumplimientoMeta(paso.id, m.valor, cfg), avance: textoAvanceMeta(paso.id, m.valor, cfg) }
              : null,
          incluida: form.find((x) => x.id === paso.id)?.incluida ?? false,
        },
      ];
    });
  });

  protected incluir(id: MetaId, e: Event): void {
    const el = e.target;
    if (el instanceof HTMLInputElement) this.store.incluirMeta(id, el.checked);
  }
}
