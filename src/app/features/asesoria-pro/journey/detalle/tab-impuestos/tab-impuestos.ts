import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icono } from '../../../components/icono/icono';
import { TEXTOS_DETALLE } from '../../../constants/textos';
import { IMPUESTO_SIN_RETIRO } from '../../../data/contratos.mock';
import { MetodoImpuesto, RespuestaRx, SiNo } from '../../../interfaces/conversacion';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import {
  cajas,
  esp,
  impuesto,
  preguntasOk,
  prefEsRetiro,
  retiroPref,
  tarifaOk,
  tarifaTxt,
} from '../../../utils/calculos';
import { miles, pesos, soloDigitos } from '../../../utils/formato';
import { soloLectura } from '../../../utils/validaciones';

interface Pregunta {
  n: number;
  etiqueta: string;
  pregunta: string;
  valor: string;
}

interface Escenario {
  id: RespuestaRx;
  titulo: string;
  valor: number;
  etiqueta: string;
}

const METODOS: readonly (readonly [MetodoImpuesto, string])[] = [
  ['preguntas', 'Calcular con preguntas'],
  ['tarifa', 'Ingresar la tarifa del cliente'],
];

const BENEFICIOS: readonly (readonly [RespuestaRx, string, string])[] = [
  ['si', 'Sí, al tope', 'Ya llena el límite: el retiro entra completo a la base'],
  ['no', 'No', 'No aporta a pensión voluntaria ni AFC'],
  ['nosabe', 'No sabe', 'Calculamos los dos casos y mostramos el rango'],
];

const SI_NO: readonly (readonly [SiNo, string])[] = [['si', 'Sí'], ['no', 'No']];

/** Pestaña Impuestos: posible impuesto en la declaración con preguntas o con la tarifa del cliente. */
@Component({
  selector: 'nc-tab-impuestos',
  imports: [Icono],
  templateUrl: './tab-impuestos.html',
  styleUrl: './tab-impuestos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabImpuestos {
  protected readonly store = inject(ConversacionesStore);

  protected readonly pesos = pesos;
  protected readonly miles = miles;
  protected readonly metodos = METODOS;
  protected readonly beneficios = BENEFICIOS;
  protected readonly siNo = SI_NO;

  protected readonly st = this.store.st;
  protected readonly imp = computed(() => this.st().imp);
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly especial = computed(() => esp(this.st()));
  protected readonly k = computed(() => {
    const st = this.st();
    return prefEsRetiro(st) ? retiroPref(st) : cajas(st).k;
  });
  protected readonly im = computed(() => impuesto(this.st(), this.k()));
  protected readonly retiroTxt = computed(() => {
    const st = this.st();
    return prefEsRetiro(st) && st.pref !== 'retiro' ? TEXTOS_DETALLE.retiroTotal : TEXTOS_DETALLE.retiroPor(pesos(st.monto));
  });

  // ---- Tarifa ----
  protected readonly tarifaOk = computed(() => tarifaOk(this.st()));
  protected readonly tarifaValida = computed(() => this.tarifaOk() || this.imp().tarifa === '');
  protected readonly tarifaTxt = computed(() => tarifaTxt(this.st()));

  // ---- Preguntas ----
  protected readonly preguntasOk = computed(() => preguntasOk(this.st()));
  protected readonly preguntas = computed<Pregunta[]>(() => {
    const I = this.imp();
    return [
      { n: 1, etiqueta: 'Ingreso laboral mensual', pregunta: '¿Cuánto recibe al mes por su trabajo, más o menos?', valor: pesos(I.ingreso) },
      {
        n: 2, etiqueta: 'Beneficios al tope', pregunta: '¿Ya usa sus beneficios tributarios al tope (pensión voluntaria, AFC)?',
        valor: I.benef ? TEXTOS_DETALLE.beneficios[I.benef] : '',
      },
      {
        n: 3, etiqueta: 'Otros ingresos de capital', pregunta: '¿Tiene otros ingresos de capital este año (arriendos, intereses, dividendos)?',
        valor: I.otros ? pesos(I.otros) : TEXTOS_DETALLE.sinOtros,
      },
      { n: 4, etiqueta: 'Dependientes', pregunta: '¿Tiene personas a cargo (dependientes)?', valor: I.dep === 'si' ? 'Sí' : 'No' },
    ];
  });
  /** Valor destacado del resultado con preguntas. */
  protected readonly resultado = computed(() => {
    const st = this.st();
    const im = this.im();
    if (this.especial()) return pesos(0);
    if (st.rx === 'si' || st.rx === 'no') return pesos(st.rx === 'si' ? im.si : im.no);
    return im.no === im.si ? pesos(im.no) : TEXTOS_DETALLE.rango(pesos(Math.min(im.no, im.si)), pesos(Math.max(im.no, im.si)));
  });
  protected readonly escenarios = computed<Escenario[]>(() => {
    const im = this.im();
    const dos: Escenario[] = [
      { id: 'no', titulo: 'Si usted o su contador no usaron los aportes como renta exenta', valor: im.no, etiqueta: 'Impuesto sobre los rendimientos' },
      { id: 'si', titulo: 'Si usted o su contador sí usaron los aportes como renta exenta', valor: im.si, etiqueta: '' },
    ];
    return dos.sort((a, b) => a.valor - b.valor);
  });

  // ---- Diferencia con el impuesto del año ----
  protected readonly sinRetiro = IMPUESTO_SIN_RETIRO;
  protected readonly siRetira = computed(() => {
    const im = this.im();
    const sin = IMPUESTO_SIN_RETIRO;
    if (im.txt.startsWith('hasta')) return TEXTOS_DETALLE.hasta(pesos(sin + im.max));
    return im.min === im.max ? pesos(sin + im.max) : TEXTOS_DETALLE.rango(pesos(sin + im.min), pesos(sin + im.max));
  });
  protected readonly estimadoCon = computed(() =>
    this.preguntasOk() ? TEXTOS_DETALLE.estimadoRespuestas : TEXTOS_DETALLE.estimadoIbc,
  );

  protected claseEscenario(id: RespuestaRx): string {
    const rx = this.st().rx;
    return rx && rx !== 'nosabe' && rx !== id ? 'atenuado' : rx === id ? 'elegido' : '';
  }

  protected escribirIngreso(e: Event): void {
    const el = e.target as HTMLInputElement;
    const v = soloDigitos(el.value);
    this.store.escribirIngreso(v);
    el.value = miles(v);
  }

  protected escribirOtros(e: Event): void {
    const el = e.target as HTMLInputElement;
    const v = soloDigitos(el.value);
    this.store.escribirOtrosIngresos(v);
    el.value = miles(v);
  }

  protected escribirTarifa(e: Event): void {
    const el = e.target as HTMLInputElement;
    this.store.escribirTarifa(el.value);
    el.value = this.imp().tarifa;
  }
}
