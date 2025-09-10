export class Calculator {
  static calc():any{
    return {
      pisos:{
        m3:(alto: number, largo: number, ancho: number)=> {
          return largo * ancho * 0.8;
        },
        m2:(alto: number, largo: number, ancho: number)=> {
          return largo * ancho;
        },
        m:(alto: number, largo: number, ancho: number)=> {
          return (largo + ancho) * 2;
        }
      ,
      },
      cielo:{ 
        m3:(alto: number, largo: number, ancho: number)=> {
          return largo * ancho * 0.8;
        },
        m2:(alto: number, largo: number, ancho: number)=> {
          return largo * ancho;
        },
        m:(alto: number, largo: number, ancho: number)=> {
          return (largo + ancho) * 2;
        }
      },
      muros:{
        m3:(alto: number, largo: number, ancho: number) =>{
          return 1;
        },
        m2:(alto: number, largo: number, ancho: number) =>{
          return (largo * alto) * 2 + (alto * ancho * 2);
        },
        m:(alto: number, largo: number, ancho: number) =>{
          return 1;
        },
      },
      otros:{
        m3:(alto: number, largo: number, ancho: number) =>{
          return 1;
        },
        m2:(alto: number, largo: number, ancho: number) =>{
          return 1;
        },
        m:(alto: number, largo: number, ancho: number) =>{
          return 1;
        }
      }
    }
  }


  static calcOtrosM3() {
    return 1;
  }
  static calcOtrosM2() {
    return 1;
  }
  static calcOtrosM() {
    return 1;
  }




  static calcSuperficieBySize(item:any,size:any){
    var factor = 1;
    var largo = size.largo.toString();
    var alto = size.alto.toString();
    var ancho = size.ancho.toString();
    if (item.id_tipo_material == 1) {
      // Pisps
      if (item.unidad == 'm3')
        factor = Calculator.calc().pisos.m3(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
      if (item.unidad == 'm2')
        factor = Calculator.calc().pisos.m2(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
      if (item.unidad == 'm')
        factor = Calculator.calc().pisos.m(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
    }
    if (item.id_tipo_material == 2) {
      // Muros
      if (item.unidad == 'm3')
        factor = Calculator.calc().muros.m3(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
      if (item.unidad == 'm2')
        factor = Calculator.calc().muros.m2(
          parseFloat(alto),
          parseFloat(largo),
          parseFloat(ancho)
        );
      if (item.unidad == 'm')
        factor = Calculator.calc().muros.m(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
    }
    if (item.id_tipo_material == 3) {
      // Cielos
      if (item.unidad == 'm3')
        factor = Calculator.calc().cielo.m3(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
      if (item.unidad == 'm2')
        factor = Calculator.calc().cielo.m2(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
      if (item.unidad == 'm')
        factor = Calculator.calc().cielo.m(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
    }
    if (factor == 0) {
      if (item.unidad == 'm3')
        factor = Calculator.calc().otros.m3(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
      if (item.unidad == 'm2')
        factor = Calculator.calc().otros.m2(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
      if (item.unidad == 'm')
        factor = Calculator.calc().otros.m(
          null,
          parseFloat(largo),
          parseFloat(ancho)
        );
    }
    return factor;
  }

}
