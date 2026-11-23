import { fmtAncho, limpiarLeyenda, tipLinea, tipRuta } from '@features/radiografia/utils/graficas-resumen';

describe('graficas-resumen', () => {
  it('limpia la leyenda: quita "(agregado)" y el conteo final', () => {
    expect(limpiarLeyenda('Otros asesores (agregado)')).toBe('Otros asesores');
    expect(limpiarLeyenda('Sin relación · 838')).toBe('Sin relación');
    expect(limpiarLeyenda(' FP Asignado ')).toBe('FP Asignado');
  });

  it('formatea el ancho con coma decimal', () => {
    expect(fmtAncho(13.7)).toBe('13,7%');
    expect(fmtAncho(100)).toBe('100%');
  });

  it('arma el tooltip de la ruta de penetración', () => {
    expect(tipRuta('Otros asesores (agregado)', 19.3)).toEqual({
      titulo: 'Clientes activos hoy',
      lineas: ['Otros asesores: 19,3%'],
    });
  });

  describe('tipLinea', () => {
    const aria = 'Total en la empresa: FP Asignado $36.550 M, Agencia Norte $3.690 M, otras agencias $21.340 M';

    it('toma la parte del FP Asignado', () => {
      expect(tipLinea('Total en la empresa', aria, 'dueno')).toEqual({
        titulo: 'Total en la empresa',
        lineas: ['FP Asignado $36.550 M'],
      });
    });

    it('para la agencia no confunde "otras agencias"', () => {
      expect(tipLinea('Total en la empresa', aria, 'agencia').lineas).toEqual(['Agencia Norte $3.690 M']);
    });

    it('capitaliza la parte de otras agencias y de otros asesores', () => {
      expect(tipLinea('Total en la empresa', aria, 'otras').lineas).toEqual(['Otras agencias $21.340 M']);
      expect(tipLinea('Cesantías', 'Cesantías: tú $450 M, otros asesores $1.680 M', 'dueno').lineas).toEqual([
        'Tú $450 M',
      ]);
      expect(tipLinea('Cesantías', 'Cesantías: tú $450 M, otros asesores $1.680 M', 'otras').lineas).toEqual([
        'Otros asesores $1.680 M',
      ]);
    });

    it('sin coincidencia deja la línea vacía (como el prototipo)', () => {
      expect(tipLinea('Cesantías', 'Cesantías: $8,2 M, 1 cliente', 'dueno').lineas).toEqual(['']);
    });
  });
});
