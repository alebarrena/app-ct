export class Currency {
  static formatCurrency(val: number) {
    return val.toLocaleString('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
