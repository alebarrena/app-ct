import { Filesystem } from '@capacitor/filesystem';
import { Calculator } from '../calculator/calculator';
import { Currency } from '../currency/currency';

export class Pdf {
  static async getFilesystemAccess(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const status = await Filesystem.checkPermissions();
      const state = status.publicStorage;

      if (state === 'granted') {
        return resolve(true);
      } else if (state === 'denied') {
        // You make want to redirect to the main app settings.
      } else {
        Filesystem.requestPermissions();
      }
      return resolve(false);
    });
  }

  static formatDate(date:any,hours:boolean){
    const fecha = date;
    let year, month, day, hour = 0, minute = 0, second = 0;
    if (fecha.includes(' ')) {
      // formato con hora: 'YYYY-MM-DD HH:mm:ss'
      const [fechaPart, horaPart] = fecha.split(' ');
      [year, month, day] = fechaPart.split('-').map(Number);
      const [h, m, s] = horaPart.split(':').map(Number);
      hour = h || 0;
      minute = m || 0;
      second = s || 0;
    } else {
      [year, month, day] = fecha.split('-').map(Number);
    }
    const d = new Date(year, month - 1, day, hour, minute, second);
    if(hours){
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    }
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  }
  
  static async generateCancelled(storage: any, inspection_id: any) {
    //console.log(imagesArray, imagesKeys);
    var d = await storage.select(
      `SELECT * FROM inspecciones WHERE cod_inspeccion = '${inspection_id!.toString()}'`
    );
    var dk = await storage.select(
      `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${inspection_id!.toString()}'`
    );
    // No guardado
    var data_dkl = d[0];
    //console.log(inspection_id, data_dkl);
    if (dk.length == 0) {
      var item = data_dkl;
      var data = {
        id_accion: item.id_accion,
        causa: item.causa,
        asegurado_ciudad: item.ciudad,
        antiguedad: item.antiguedad,
        cod_inspeccion: item.cod_inspeccion,
        ubicacion: item.ubicacion,
        asegurado_comuna: item.comuna,
        inspector_email: item.emailInspector,
        liquidador_email: item.emailLiquidador,
        contacto_mail: item.email_contacto,
        asegurado_email: item.emailasegurado,
        contacto_fono: item.fono_Contacto,
        asegurado_fono: item.fonosegurado,
        tipo_siniestro: item.id_tiposiniestro,
        direccion_siniestro: item.direccion_siniestro,
        asegurado_nombre: item.nomAsegurado,
        datos_siniestro: item.datos_siniestro,
        numSiniestro: item.numSiniestro,
        asegurado_aseguradora: item.nomCompania,
        inspector_nombre: item.nomInspector,
        nomLiquidador: item.nomLiquidador,
        contacto_nombre: item.nombre_Contacto,
        nro_carpeta: item.nro_carpeta,
        asegurado_rut: item.rutAsegurado,
        contacto_rut: item.rut_Contacto,
        inspector_fono: item.telInspector,
        liquidador_fono: item.telLiquidador,
        habitable: item.habitable,
        menores: item.menores,
        Contratante_Hechos: item.Contratante_Hechos,
        Contratante_Observaciones: item.Contratante_Observaciones,
        fechaSiniestro: item.fechaSiniestro,
        nomTipoSiniestro: item.nomTipoSiniestro,
        corredor: item.corredor,
      };
      await storage.insert('inspecciones_cabecera', data);
      dk = await storage.select(
        `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${inspection_id!.toString()}'`
      );
    }
    var ddl = dk[0];
    var cd = new Date();
    var current_date = `${cd.getFullYear()}-${(cd.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${cd.getDate().toString().padStart(2, '0')} ${cd
      .getHours()
      .toString()
      .padStart(2, '0')}:${cd.getMinutes().toString().padStart(2, '0')}`;

    var d = await storage.select(
      `SELECT * FROM inspections_danos WHERE inspection_id = '${inspection_id}'`
    );
    var d1 = await storage.select(
      `SELECT * FROM inspections_danos WHERE inspection_id = '${inspection_id}'`
    );
    if (ddl.fechaSiniestro.includes('/')) {
      var fechaSiniestro = ddl.fechaSiniestro.split('/').reverse().join('-');
      ddl.fechaSiniestro = fechaSiniestro;
    }
    var data_pdf: any = {
      id_accion: ddl.id_accion,
      cod_inspeccion: ddl.cod_inspeccion,
      latitud: ddl.latitud,
      longitud: ddl.longitud,
      total_imagenes: '',
      inspector_nombre: ddl.inspector_nombre,
      inspector_email: ddl.inspector_email,
      inspector_fono: ddl.inspector_fono,
      liquidador_email: ddl.liquidador_email,
      liquidador_fono: ddl.liquidador_fono,
      formAntecedentesGenerales: {
        datos_siniestro: ddl.datos_siniestro,
        numSiniestro: ddl.numSiniestro,
        detallesAsegurado: {
          fecha_inspeccion: ddl.fecha_inspeccion
            ? ddl.fecha_inspeccion
            : current_date,
          nro_carpeta: ddl.nro_carpeta,
          asegurado_nombre: ddl.asegurado_nombre,
          asegurado_email: ddl.asegurado_email,
          asegurado_fono: ddl.asegurado_fono,
          asegurado_rut: ddl.asegurado_rut,
          asegurado_ciudad: ddl.asegurado_ciudad,
          asegurado_comuna: ddl.asegurado_comuna,
          asegurado_aseguradora: ddl.asegurado_aseguradora,
          nomLiquidador: ddl.nomLiquidador,
          // corredor: ddl.corredor
        },
        datosSiniesto: {
          tipo_siniestro: ddl.tipo_siniestro,
          direccion_siniestro: ddl.direccion_siniestro,
          fechaSiniestro: ddl.fechaSiniestro,
          nomTipoSiniestro: ddl.nomTipoSiniestro,
        },
        datosContacto: {
          contacto_nombre: ddl.contacto_nombre,
          contacto_fono: ddl.contacto_fono,
        },
        datosEntrevistado: {
          entrevistadoNombre: ddl.entrevistadoNombre,
          entrevistadoRelacion: ddl.entrevistadoRelacion,
        },
        datosComunidad: {
          admin_mayor_domo: ddl.admin_mayor_domo,
          telefono_comunidad: ddl.telefono_comunidad,
          email_comunidad: ddl.email_comunidad,
          observaciones: ddl.observaciones,
        },
      },
      formRelatoAsegurado: {
        causa: ddl.causa,
        //elato_asegurado: ddl.relato_asegurado,
        Contratante_Hechos: ddl.Contratante_Hechos,
      },
      formTipoInmueble: {
        tipo_zona: ddl.tipo_zona ?? 'urbana',
        Tipo_Inmueble1: ddl.Tipo_Inmueble1,
        unidades_total: ddl.unidades_total,
        nro_subterraneos: ddl.nro_subterraneos,
        Contratante_Observaciones: ddl.Contratante_Observaciones,
        superficie: ddl.superficie,
        antiguedad: ddl.antiguedad,
        tipo_inmueble: ddl.tipo_inmueble,
        tiene_alarma: ddl.tiene_alarma,
        tipo_alarma: ddl.tipo_alarma,
        seguridadCamara: ddl.seguridadCamara,
        seguridadAlarmaFunciona: ddl.seguridadAlarmaFunciona,
        rejas_perimetral: ddl.rejas_perimetral,
        guardia_seguridad: ddl.guardia_seguridad,
        reja_primer_piso: ddl.reja_primer_piso,
        reja_segundo_piso: ddl.reja_segundo_piso,
        n_pisos: ddl.n_pisos,
        habitable: ddl.habitable,
        menores: ddl.menores,
        niveles: ddl.niveles,
        habitantesFamilias: ddl.habitantesFamilias,
        seguridadNombre: ddl.seguridadNombre,
        seguridadvalor: ddl.seguridadvalor,
        seguridadAlarmaNombre: ddl.seguridadAlarmaNombre,
        seguridadAlarmaValor: ddl.seguridadAlarmaValor,
        seguridadProteccionesNombre: ddl.seguridadProteccionesNombre,
        seguridadProteccionesValor: ddl.seguridadProteccionesValor,
        perimetrales_nomb: ddl.perimetrales_nomb,
        perimetrales_val: ddl.perimetrales_val,
        muros_interiores_nomb: ddl.muros_interiores_nomb,
        muros_interiores_val: ddl.muros_interiores_val,
        cubierta_tech_nomb: ddl.cubierta_tech_nomb,
        cubierta_tech_val: ddl.cubierta_tech_val,
        pav_interiores_nomb: ddl.pav_interiores_nomb,
        pav_interiores_val: ddl.pav_interiores_val,
        cielo_interiores_nomb: ddl.cielo_interiores_nomb,
        cielo_interiores_val: ddl.cielo_interiores_val,
        terminacion_int_nomb: ddl.terminacion_int_nomb,
        terminacion_int_val: ddl.terminacion_int_val,
        otras_inst_nomb: ddl.otras_inst_nomb,
        otras_inst_val: ddl.otras_inst_val,
      },
      formSectoresAfectados: [],
      formDanosDelEdificio: [],
      formDanosDelContenido: ddl.danos_contenido,
    };
    var logo = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAs8AAAFnCAYAAABZ1aSpAABVPklEQVR42u3dd3gc1fn28e9Kliz3ggs2LlQ3MNWY3iHU0AIhlASSkEAIJIGXkgqBEAgEAskP0gkQSgihhpjeey82xoCpBmPccMNNlnS/f5wZey0ke2e2yro/17WXV7Jm5pyzs7vPnDnnOWBmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmecmUuwBmVnydO3dm4cKFqbatqqpCUrmrYGZmVhGqyl0AMyusDh06IGmlRxQ4Z4A6oBewDrABMBwYGT02AoYC/YCuQAeApqamlfY1bNiw1GU799xzv1C2XB+nnXZauZvW2pm056ovNs3WbO55NlsD1NbWsnTp0uxfZQgB8GBCgDwc2BAYBPSN/q8zUANUAwIagCXAQmAu8CnwIfA28CbwHjADqI8Pst9++3HPPffkXM4oqFgLOCQ6fi4+B24D5mYy/siy0onO122BMUBTDptUAc8BL/hcNTMzq0AjR47M7u3KSOoraW9Jv5H0mKRpkuqVnyZJCyS9JelWST+StJWkztk9bd26dVtteaO/3VjS9ATHnyppmHvzrNSi8/XChO+Xs32umq3ZOpS7AGaW3BZbbMHL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mZkV15///Oe45/ncFL3OH0va2L3OZmZmZtYuRIFzP0kvpQier5XUwcGzmVUiD9swM7OCWm+99eKnOwEbJ9w8nijYMHjw4HJXxczMzMysuKJe5xpJN6TodX5W0lrudTazSuWeZzMzK4YRwK4ptrsTmP3rX/+63OU3MzMzMyuun/3sZ3HP81kpep2nShrtXmczMzMzaxeiwLl3lKc5qeuj4R7lroaZWas8bMPMzAqid+/e8dNtgc0Sbr4EuBVYljXh0MzMzMxszRT1OldL+nuKXufnJfVxr7OZVTr3PJuZWSFtAOyRYrs7gVmXXnppuctvZmZmZlZcxx13XNzzfIqkpoS9zp9I2sy9zmZmZmbWLkSBc3dJD6cYsnGjJwqaWVvhYRtmZpaXjh07xk/HRI8klhJNFBw2bFi5q2JmZmZmVlxRr3NG0v+l6HV+UVJf9zqbWVvhnmczMyuEocCXUmz3X2DmlVdeWe7ym5mZmZkV19577x33PB8vqTFhr/OnkjZ3r7OZmZmZtQtR4NxZ0rgUQzZuklTr4NnM2hIP2zAzs3xtDmyXcJt6wkTB+o033rjc5TczMzMzK6577rkn7nm+KEWv80uS+rvX2czMzMzahShwHihpQorg+ZeSuOqqq8pdDTMzMzOz4tpiiy3i4PloSfUJA+fpkrZ0r7OZmZmZtQtR4NxR0q0pep1vjrYtdzXMzBLzhEEzM0trE2DHhNvUA7cBSzfbbLNyl9/MzMzMrLiuvPLKuOf5nBS9zq9IWtu9zmZmZmbWLkSBcz+FpbWTOk8SN954Y7mrYWZmZmZWXEOGDImD50MlLUkYOM+QNMa9zmZmZmbWLkSBcwdJ16fodb7VEwXNrK3zhEEzM0tqBLBrwm2WEVYUXDpmzJhyl9/MzMzMrLjOPvvsuOf5zBS9zq9JGuBeZzMzMzNrF6LAubekp1MEz7+WxO23317uapiZ5SVT7gKYmVnbEPUabwlcBnQBculGzgALgVOBlzMZf+2YWdvmTzEzM8tJFDzXAnUJN20CFgFNDp7NzMzMrF0YPnx4PHQj1aNbt27lroKZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZtTP/Hwv75NJn/PinAAAAAElFTkSuQmCC`;
    return {
      pageMargins: [0, 0, 0, 0],
      content: [
        {
          style: 'header',
          table: {
            widths: [100, '*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: `${logo}`,
                  fillColor: '#3B3F51',
                  margin: [0, 0, 0, 0],
                  fit: [100, 50],
                },
                {
                  border: [false, false, false, false],
                  fillColor: '#3B3F51',
                  alignment: 'center',
                  color: '#FFFFFF',
                  fontSize: 16,
                  margin: [10, 15, 100, 10],
                  text: 'Acta de Inspección',
                },
              ],
            ],
          },
        },
        {
          style: 'header',
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  alignment: 'center',
                  color: '#000000',
                  fontSize: 20,
                  margin: [10, 10, 10, 10],
                  text: '#' + inspection_id,
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'], // Ancho igual para todas las columnas

            body: [
              [
                { text: '', style: 'tableHeader', bold: true },
                {
                  text: 'Monto Asegurado',
                  style: 'tableHeader',
                  bold: true,
                  alignment: 'center',
                  color: '#FF5E01',
                },
                {
                  text: 'Deducible',
                  style: 'tableHeader',
                  bold: true,
                  alignment: 'center',
                  color: '#FF5E01',
                },
                {
                  text: 'Cobertura',
                  style: 'tableHeader',
                  bold: true,
                  alignment: 'center',
                  color: '#FF5E01',
                },
                { text: '', style: 'tableHeader', bold: true },
              ],
              [
                { text: '' },
                {
                  text: Currency.formatCurrency(
                    parseFloat(data_dkl.monto_Asegurado)
                  ),
                  alignment: 'center',
                },
                {
                  text: Currency.formatCurrency(
                    parseFloat(data_dkl?.deducible)
                  ),
                  alignment: 'center',
                },
                {
                  text: data_dkl?.causa,
                  alignment: 'center',
                },
                { text: '' },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: '1. Antecedentes Generales',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Detalles del asegurado',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Carpeta', style: 'tableHeader', bold: true },
                { text: 'Siniestro', style: 'tableHeader', bold: true },
                { text: 'Compañía', style: 'tableHeader', bold: true },
                { text: 'Liquidador', style: 'tableHeader', bold: true },
              ],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .nro_carpeta,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.datosSiniesto
                    .nomTipoSiniestro,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_aseguradora,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .nomLiquidador,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                {
                  text: 'Código inspección',
                  style: 'tableHeader',
                  bold: true,
                },
                { text: 'Asegurado', style: 'tableHeader', bold: true },
                { text: 'Rut', style: 'tableHeader', bold: true },
                { text: 'Teléfono', style: 'tableHeader', bold: true },
              ],
              [
                {
                  text: inspection_id,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_nombre,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_rut,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_fono,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Correo', style: 'tableHeader', bold: true },
                { text: 'Ubicación', style: 'tableHeader', bold: true },
                {
                  text: 'Fecha de Inspección',
                  style: 'tableHeader',
                  bold: true,
                },
                {},
              ],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_email,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.datosSiniesto
                    .direccion_siniestro,
                  color: '#565176',
                },
                {
                  text: Pdf.formatDate(data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .fecha_inspeccion,true),
                  color: '#565176',
                },
                {},
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 50, 10, 50],
          table: {
            widths: ['*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: 'INSPECCION DESESTIMADA',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
      ],
      defaultStyle: {
        color: '#000',
      },
    };
  }
  static async generate(storage: any, inspection_id: any) {
    if (true) {
      var d = await storage.select(
        `SELECT * FROM inspecciones WHERE cod_inspeccion = '${inspection_id!.toString()}'`
      );
      var dk = await storage.select(
        `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${inspection_id!.toString()}'`
      );
      // No guardado
      var data_dkl = d[0];
      //console.log(inspection_id, data_dkl);
      if (dk.length == 0) {
        var item = data_dkl;
        var data = {
          id_accion: item.id_accion,
          causa: item.causa,
          asegurado_ciudad: item.ciudad,
          antiguedad: item.antiguedad,
          cod_inspeccion: item.cod_inspeccion,
          ubicacion: item.ubicacion,
          asegurado_comuna: item.comuna,
          inspector_email: item.emailInspector,
          liquidador_email: item.emailLiquidador,
          contacto_mail: item.email_contacto,
          asegurado_email: item.emailasegurado,
          contacto_fono: item.fono_Contacto,
          asegurado_fono: item.fonosegurado,
          tipo_siniestro: item.id_tiposiniestro,
          direccion_siniestro: item.direccion_siniestro,
          asegurado_nombre: item.nomAsegurado,
          datos_siniestro: item.datos_siniestro,
          numSiniestro: item.numSiniestro,
          asegurado_aseguradora: item.nomCompania,
          inspector_nombre: item.nomInspector,
          nomLiquidador: item.nomLiquidador,
          contacto_nombre: item.nombre_Contacto,
          nro_carpeta: item.nro_carpeta,
          asegurado_rut: item.rutAsegurado,
          contacto_rut: item.rut_Contacto,
          inspector_fono: item.telInspector,
          liquidador_fono: item.telLiquidador,
          habitable: item.habitable,
          menores: item.menores,
          Contratante_Hechos: item.Contratante_Hechos,
          Contratante_Observaciones: item.Contratante_Observaciones,
          fechaSiniestro: item.fechaSiniestro,
          nomTipoSiniestro: item.nomTipoSiniestro,
          corredor: item.corredor,
        };
        await storage.insert('inspecciones_cabecera', data);
        dk = await storage.select(
          `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${inspection_id!.toString()}'`
        );
      }
      var ddl = dk[0];
      var cd = new Date();
      var current_date = `${cd.getFullYear()}-${(cd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${cd.getDate().toString().padStart(2, '0')} ${cd
        .getHours()
        .toString()
        .padStart(2, '0')}:${cd.getMinutes().toString().padStart(2, '0')}`;

      var d = await storage.select(
        `SELECT * FROM inspections_danos WHERE inspection_id = '${inspection_id}'`
      );
      var d1 = await storage.select(
        `SELECT * FROM inspections_danos WHERE inspection_id = '${inspection_id}'`
      );
      if (ddl.fechaSiniestro.includes('/')) {
        var fechaSiniestro = ddl.fechaSiniestro.split('/').reverse().join('-');
        ddl.fechaSiniestro = fechaSiniestro;
      }
      var data_pdf: any = {
        id_accion: ddl.id_accion,
        cod_inspeccion: ddl.cod_inspeccion,
        latitud: ddl.latitud,
        longitud: ddl.longitud,
        total_imagenes: '',
        inspector_nombre: ddl.inspector_nombre,
        inspector_email: ddl.inspector_email,
        inspector_fono: ddl.inspector_fono,
        liquidador_email: ddl.liquidador_email,
        liquidador_fono: ddl.liquidador_fono,
        formAntecedentesGenerales: {
          datos_siniestro: ddl.datos_siniestro,
          numSiniestro: ddl.numSiniestro,
          detallesAsegurado: {
            fecha_inspeccion: ddl.fecha_inspeccion
              ? ddl.fecha_inspeccion
              : current_date,
            nro_carpeta: ddl.nro_carpeta,
            asegurado_nombre: ddl.asegurado_nombre,
            asegurado_email: ddl.asegurado_email,
            asegurado_fono: ddl.asegurado_fono,
            asegurado_rut: ddl.asegurado_rut,
            asegurado_ciudad: ddl.asegurado_ciudad,
            asegurado_comuna: ddl.asegurado_comuna,
            asegurado_aseguradora: ddl.asegurado_aseguradora,
            nomLiquidador: ddl.nomLiquidador,
            // corredor: ddl.corredor
          },
          datosSiniesto: {
            tipo_siniestro: ddl.tipo_siniestro,
            direccion_siniestro: ddl.direccion_siniestro,
            fechaSiniestro: ddl.fechaSiniestro,
            nomTipoSiniestro: ddl.nomTipoSiniestro,
          },
          datosContacto: {
            contacto_nombre: ddl.contacto_nombre,
            contacto_fono: ddl.contacto_fono,
          },
          datosEntrevistado: {
            entrevistadoNombre: ddl.entrevistadoNombre,
            entrevistadoRelacion: ddl.entrevistadoRelacion,
          },
          datosComunidad: {
            admin_mayor_domo: ddl.admin_mayor_domo,
            telefono_comunidad: ddl.telefono_comunidad,
            email_comunidad: ddl.email_comunidad,
            observaciones: ddl.observaciones,
          },
        },
        formRelatoAsegurado: {
          causa: ddl.causa,
          //elato_asegurado: ddl.relato_asegurado,
          Contratante_Hechos: ddl.Contratante_Hechos,
        },
        formTipoInmueble: {
          tipo_zona: ddl.tipo_zona ?? 'urbana',
          Tipo_Inmueble1: ddl.Tipo_Inmueble1,
          unidades_total: ddl.unidades_total,
          nro_subterraneos: ddl.nro_subterraneos,
          Contratante_Observaciones: ddl.Contratante_Observaciones,
          superficie: ddl.superficie,
          antiguedad: ddl.antiguedad,
          tipo_inmueble: ddl.tipo_inmueble,
          tiene_alarma: ddl.tiene_alarma,
          tipo_alarma: ddl.tipo_alarma,
          seguridadCamara: ddl.seguridadCamara,
          seguridadAlarmaFunciona: ddl.seguridadAlarmaFunciona,
          rejas_perimetral: ddl.rejas_perimetral,
          guardia_seguridad: ddl.guardia_seguridad,
          reja_primer_piso: ddl.reja_primer_piso,
          reja_segundo_piso: ddl.reja_segundo_piso,
          n_pisos: ddl.n_pisos,
          habitable: ddl.habitable,
          menores: ddl.menores,
          niveles: ddl.niveles,
          habitantesFamilias: ddl.habitantesFamilias,
          seguridadNombre: ddl.seguridadNombre,
          seguridadvalor: ddl.seguridadvalor,
          seguridadAlarmaNombre: ddl.seguridadAlarmaNombre,
          seguridadAlarmaValor: ddl.seguridadAlarmaValor,
          seguridadProteccionesNombre: ddl.seguridadProteccionesNombre,
          seguridadProteccionesValor: ddl.seguridadProteccionesValor,
          perimetrales_nomb: ddl.perimetrales_nomb,
          perimetrales_val: ddl.perimetrales_val,
          muros_interiores_nomb: ddl.muros_interiores_nomb,
          muros_interiores_val: ddl.muros_interiores_val,
          cubierta_tech_nomb: ddl.cubierta_tech_nomb,
          cubierta_tech_val: ddl.cubierta_tech_val,
          pav_interiores_nomb: ddl.pav_interiores_nomb,
          pav_interiores_val: ddl.pav_interiores_val,
          cielo_interiores_nomb: ddl.cielo_interiores_nomb,
          cielo_interiores_val: ddl.cielo_interiores_val,
          terminacion_int_nomb: ddl.terminacion_int_nomb,
          terminacion_int_val: ddl.terminacion_int_val,
          otras_inst_nomb: ddl.otras_inst_nomb,
          otras_inst_val: ddl.otras_inst_val,
        },
        formSectoresAfectados: [],
        formDanosDelEdificio: [],
        formDanosDelContenido: ddl.danos_contenido,
      };
      for (var i = 0; i < d.length; i++) {
        data_pdf.formSectoresAfectados.push({
          id: '',
          key: '',
          nombre: '',
          items: '',
          alto: '',
          ancho: '',
          largo: '',
          dscto_pv: '',
          descripcion: '',
        });
      }
      for (var i = 0; i < d1.length; i++) {
        data_pdf.formDanosDelEdificio.push({
          alto: d1[i].alto,
          ancho: d1[i].ancho,
          largo: d1[i].largo,
          descripcion: '',
          dscto_pv: '',
          id: d1[i].id,
          inspection_id: d1[i].inspection_id,
          items: d1[i].items,
          key: '',
          label: '',
          nombre: d1[i].nombre,
          siniestrado: d1[i].siniestrado,
        });
      }
    } else {
    }

    var images = await storage.select(
      `SELECT * FROM inspections_media_files WHERE inspection_id = '${inspection_id}' AND filename LIKE 'IMG-%' AND selected = 1 `
    );
    var sectores = await storage.select(
      `SELECT * FROM inspections_danos WHERE inspection_id = '${inspection_id}'`
    );
    //console.log(['TEST', sectores]);
    sectores = sectores.map((item: any) => {
      return { ...item, items: JSON.parse(item.items) };
    });
    var documentos = await storage.select(
      `SELECT * FROM inspeccion_meta  WHERE inspection_id = '${inspection_id}' AND label='DOCUMENTOS'`
    );
    var documentosSeleccionados: any = [];
    if (documentos.length > 0) {
      documentosSeleccionados = JSON.parse(documentos[0].data);
    }
    var judiciales = await storage.select(
      `SELECT * FROM inspeccion_meta  WHERE inspection_id = '${inspection_id}' AND label='JUDICIALES'`
    );
    var judicialesData = {
      unidad_policial: '',
      n_parte: '',
      cuerpo_bombero: '',
      nombre_denunciante: '',
    };
    if (judiciales.length > 0) {
      judicialesData = JSON.parse(judiciales[0].data);
    }
    var aseguradora = await storage.select(
      `SELECT * FROM inspeccion_meta  WHERE inspection_id = '${inspection_id}' AND label='ASEGURADORA'`
    );

    var aseguradoraSeleccionada = '';
    if (aseguradora.length > 0) {
      aseguradoraSeleccionada = JSON.parse(aseguradora[0].data).aseguradora;
    }

    var terceros = await storage.select(
      `SELECT * FROM inspecciones_terceros WHERE inspection_id = '${inspection_id}'`
    );
    var productosAfectados = await storage.select(
      `SELECT * FROM inspecciones_contenidos  WHERE inspection_id = '${inspection_id}'`
    );

    var dk = await storage.select(
      `SELECT * FROM inspections_danos WHERE inspection_id = '${inspection_id}'`
    );
    var sign1 = '';
    var sign2 = '';

    var d_sign1 = await storage.select(
      `SELECT * FROM inspections_media_files WHERE inspection_id = '${inspection_id}' AND filename LIKE 'SIGN-INSPECTOR-%' `
    );
    if (d_sign1.length > 0) {
      const mimeType = 'image/png';
      sign1 = `data:${mimeType};base64,${d_sign1[0].base64}`;
    }
    var d_sign2 = await storage.select(
      `SELECT * FROM inspections_media_files WHERE inspection_id = '${inspection_id}' AND filename LIKE 'SIGN-ENTREVISTADO-%' `
    );
    if (d_sign2.length > 0) {
      const mimeType = 'image/png';
      sign2 = `data:${mimeType};base64,${d_sign2[0].base64}`;
    }

    var main_sectors = [
      {
        icon: 'bed-outline',
        label: 'Habitación',
        tag: 'se_habitacion',
        value: 0,
      },
      { icon: 'woman-outline', label: 'Baños', tag: 'se_baños', value: 0 },
      {
        icon: 'restaurant-outline',
        label: 'Cocina',
        tag: 'se_cocina',
        value: 0,
      },
      { icon: 'tv-outline', label: 'Living', tag: 'se_living', value: 0 },
      { icon: 'dining-table', label: 'Comedor', tag: 'se_comedor', value: 0 },
      { icon: 'logia', label: 'Logia', tag: 'se_logia', value: 0 },
    ];
    var secondary_sectors = [
      { icon: 'waves', label: 'Piscina', tag: 'se_piscina', value: 0 },
      { icon: 'barbecue', label: 'Quincho', tag: 'se_quincho', value: 0 },
      {
        icon: 'game-controller-outline',
        label: 'Sala de estar',
        tag: 'se_sala',
        value: 0,
      },
      { icon: 'box', label: 'Bodega', tag: 'se_bodega', value: 0 },
      { icon: 'terrace', label: 'Terraza', tag: 'se_terraza', value: 0 },
      { icon: 'garage', label: 'Garage', tag: 'se_garage', value: 0 },
      { icon: 'otros', label: 'Otros', tag: 'se_otros', value: 0 },
    ];
    main_sectors = main_sectors.map((item: any) => {
      var k = dk.filter((it: any) => it.nombre == item.label);
      if (k.length > 0) {
        item = { ...item, value: k.length };
      }
      return item;
    });

    secondary_sectors = secondary_sectors.map((item: any) => {
      var k = dk.filter((it: any) => it.nombre == item.label);
      if (k.length > 0) {
        item = { ...item, value: k.length };
      }
      return item;
    });
    var sectores_danos: any = [];
    for (var i = 0; i < sectores.length; i++) {
      for (var j = 0; j < sectores[i].items.length; j++) {
        sectores_danos.push({
          nombre: sectores[i].nombre,
          alto: sectores[i].alto,
          ancho: sectores[i].ancho,
          largo: sectores[i].largo,
          key: sectores[i].key,
          material: sectores[i].items[j].material,
          cantidad: sectores[i].items[j].cantidad,
          tipo: sectores[i].items[j].tipo_material,
          unidad: sectores[i].items[j].unidad,
          superficie: sectores[i].items[j].cantidad,
        });
      }
    }
    //console.log(sectores_danos);
    var img_w = 180;
    var imagesKeys: any = {};
    var imagesArray: any = images;
    while (imagesArray.length > 0) {
      var name = `${imagesArray[0].filename.split('_')[0].split('-')[1]} ${
        parseInt(imagesArray[0].filename.split('_')[0].split('-')[2]) + 1
      }`;
      //console.log(name);
      if (imagesKeys[name] == null) {
        imagesKeys[name] = [];
      }
      if (imagesKeys[name].length == 0) {
        imagesKeys[name].push([]);
      } else {
        if (imagesKeys[name][imagesKeys[name].length - 1].length == 3) {
          imagesKeys[name].push([]);
        }
      }
      imagesKeys[name][imagesKeys[name].length - 1].push(imagesArray[0]);
      imagesArray.shift();
    }
    //console.log(imagesArray, imagesKeys);

    var logo = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAs8AAAFnCAYAAABZ1aSpAABVPklEQVR42u3dd3gc1fn28e9Kliz3ggs2LlQ3MNWY3iHU0AIhlASSkEAIJIGXkgqBEAgEAskP0gkQSgihhpjeey82xoCpBmPccMNNlnS/f5wZey0ke2e2yro/17WXV7Jm5pyzs7vPnDnnOWBmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmecmUuwBmVnydO3dm4cKFqbatqqpCUrmrYGZmVhGqyl0AMyusDh06IGmlRxQ4Z4A6oBewDrABMBwYGT02AoYC/YCuQAeApqamlfY1bNiw1GU799xzv1C2XB+nnXZauZvW2pm056ovNs3WbO55NlsD1NbWsnTp0uxfZQgB8GBCgDwc2BAYBPSN/q8zUANUAwIagCXAQmAu8CnwIfA28CbwHjADqI8Pst9++3HPPffkXM4oqFgLOCQ6fi4+B24D5mYy/siy0onO122BMUBTDptUAc8BL/hcNTMzq0AjR47M7u3KSOoraW9Jv5H0mKRpkuqVnyZJCyS9JelWST+StJWkztk9bd26dVtteaO/3VjS9ATHnyppmHvzrNSi8/XChO+Xs32umq3ZOpS7AGaW3BZbbMHL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mZkV15///Oe45/ncFL3OH0va2L3OZmZmZtYuRIFzP0kvpQier5XUwcGzmVUiD9swM7OCWm+99eKnOwEbJ9w8nijYMHjw4HJXxczMzMysuKJe5xpJN6TodX5W0lrudTazSuWeZzMzK4YRwK4ptrsTmP3rX/+63OU3MzMzMyuun/3sZ3HP81kpep2nShrtXmczMzMzaxeiwLl3lKc5qeuj4R7lroaZWas8bMPMzAqid+/e8dNtgc0Sbr4EuBVYljXh0MzMzMxszRT1OldL+nuKXufnJfVxr7OZVTr3PJuZWSFtAOyRYrs7gVmXXnppuctvZmZmZlZcxx13XNzzfIqkpoS9zp9I2sy9zmZmZmbWLkSBc3dJD6cYsnGjJwqaWVvhYRtmZpaXjh07xk/HRI8klhJNFBw2bFi5q2JmZmZmVlxRr3NG0v+l6HV+UVJf9zqbWVvhnmczMyuEocCXUmz3X2DmlVdeWe7ym5mZmZkV19577x33PB8vqTFhr/OnkjZ3r7OZmZmZtQtR4NxZ0rgUQzZuklTr4NnM2hIP2zAzs3xtDmyXcJt6wkTB+o033rjc5TczMzMzK6577rkn7nm+KEWv80uS+rvX2czMzMzahShwHihpQorg+ZeSuOqqq8pdDTMzMzOz4tpiiy3i4PloSfUJA+fpkrZ0r7OZmZmZtQtR4NxR0q0pep1vjrYtdzXMzBLzhEEzM0trE2DHhNvUA7cBSzfbbLNyl9/MzMzMrLiuvPLKuOf5nBS9zq9IWtu9zmZmZmbWLkSBcz+FpbWTOk8SN954Y7mrYWZmZmZWXEOGDImD50MlLUkYOM+QNMa9zmZmZmbWLkSBcwdJ16fodb7VEwXNrK3zhEEzM0tqBLBrwm2WEVYUXDpmzJhyl9/MzMzMrLjOPvvsuOf5zBS9zq9JGuBeZzMzMzNrF6LAubekp1MEz7+WxO23317uapiZ5SVT7gKYmVnbEPUabwlcBnQBculGzgALgVOBlzMZf+2YWdvmTzEzM8tJFDzXAnUJN20CFgFNDp7NzMzMrF0YPnx4PHQj1aNbt27lroKZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZtTP/Hwv75NJn/PinAAAAAElFTkSuQmCC`;

    var inspector = JSON.parse(localStorage.getItem('profile')!);
    var fachadaImgages = Object.keys(imagesKeys).filter((item) =>
      item.includes('Fachada')
    );
    var dd: any[] = [];
    for (var i = 0; i < fachadaImgages.length; i++) {
      dd = dd.concat(...imagesKeys[fachadaImgages[i]]);
    }
    return {
      pageMargins: [0, 0, 0, 0],
      content: [
        {
          style: 'header',
          table: {
            widths: [100, '*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: `${logo}`,
                  fillColor: '#3B3F51',
                  margin: [0, 0, 0, 0],
                  fit: [100, 50],
                },
                {
                  border: [false, false, false, false],
                  fillColor: '#3B3F51',
                  alignment: 'center',
                  color: '#FFFFFF',
                  fontSize: 16,
                  margin: [10, 15, 100, 10],
                  text: 'Acta de Inspección',
                },
              ],
            ],
          },
        },
        {
          style: 'header',
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  alignment: 'center',
                  color: '#000000',
                  fontSize: 20,
                  margin: [10, 10, 10, 10],
                  text: '#' + inspection_id,
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'], // Ancho igual para todas las columnas

            body: [
              [
                { text: '', style: 'tableHeader', bold: true },
                {
                  text: 'Monto Asegurado',
                  style: 'tableHeader',
                  bold: true,
                  alignment: 'center',
                  color: '#FF5E01',
                },
                {
                  text: 'Deducible',
                  style: 'tableHeader',
                  bold: true,
                  alignment: 'center',
                  color: '#FF5E01',
                },
                {
                  text: 'Cobertura',
                  style: 'tableHeader',
                  bold: true,
                  alignment: 'center',
                  color: '#FF5E01',
                },
                { text: '', style: 'tableHeader', bold: true },
              ],
              [
                { text: '' },
                {
                  text: Currency.formatCurrency(
                    parseFloat(data_dkl.monto_Asegurado)
                  ),
                  alignment: 'center',
                },
                {
                  text: Currency.formatCurrency(
                    parseFloat(data_dkl?.deducible)
                  ),
                  alignment: 'center',
                },
                {
                  text: data_dkl?.causa,
                  alignment: 'center',
                },
                { text: '' },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: '1. Antecedentes Generales',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Detalles del asegurado',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Carpeta', style: 'tableHeader', bold: true },
                { text: 'Siniestro', style: 'tableHeader', bold: true },
                { text: 'Compañía', style: 'tableHeader', bold: true },
                { text: 'Liquidador', style: 'tableHeader', bold: true },
              ],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .nro_carpeta,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.datosSiniesto
                    .nomTipoSiniestro,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_aseguradora,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .nomLiquidador,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                {
                  text: 'Código inspección',
                  style: 'tableHeader',
                  bold: true,
                },
                { text: 'Asegurado', style: 'tableHeader', bold: true },
                { text: 'Rut', style: 'tableHeader', bold: true },
                { text: 'Teléfono', style: 'tableHeader', bold: true },
              ],
              [
                {
                  text: inspection_id,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_nombre,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_rut,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_fono,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Correo', style: 'tableHeader', bold: true },
                { text: 'Ubicación', style: 'tableHeader', bold: true },
                {
                  text: 'Fecha de Inspección',
                  style: 'tableHeader',
                  bold: true,
                },
                {},
              ],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_email,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.datosSiniesto
                    .direccion_siniestro,
                  color: '#565176',
                },
                {
                  text: Pdf.formatDate(data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .fecha_inspeccion,true),
                  color: '#565176',
                },
                {},
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Datos del Siniestro',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Tipo siniestro', style: 'tableHeader', bold: true },
                { text: 'Siniestro', style: 'tableHeader', bold: true },
                { text: 'Fecha Siniestro', style: 'tableHeader', bold: true },
                { text: 'Ciudad', style: 'tableHeader', bold: true },
                { text: 'Comuna', style: 'tableHeader', bold: true },
              ],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.datosSiniesto
                    .nomTipoSiniestro,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.numSiniestro,
                  color: '#565176',
                },
                {
                  text: Pdf.formatDate(data_pdf.formAntecedentesGenerales.datosSiniesto
                    .fechaSiniestro,false),
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_ciudad,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.detallesAsegurado
                    .asegurado_comuna,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [{ text: 'Dirección', style: 'tableHeader', bold: true }],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.datosSiniesto
                    .direccion_siniestro,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Datos del contacto',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Nombre', style: 'tableHeader', bold: true },
                { text: 'Teléfono', style: 'tableHeader', bold: true },
              ],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.datosContacto
                    .contacto_nombre,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.datosContacto
                    .contacto_fono,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Datos del entrevistado',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Nombre', style: 'tableHeader', bold: true },
                {
                  text: 'Relación con asegurado',
                  style: 'tableHeader',
                  bold: true,
                },
              ],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.datosEntrevistado
                    .entrevistadoNombre,
                  color: '#565176',
                },
                {
                  text: data_pdf.formAntecedentesGenerales.datosEntrevistado
                    .entrevistadoRelacion,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Datos del inspector',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Nombre', style: 'tableHeader', bold: true },
                {
                  text: 'Email',
                  style: 'tableHeader',
                  bold: true,
                },
                {
                  text: 'Telefono',
                  style: 'tableHeader',
                  bold: true,
                },
              ],
              [
                {
                  text: inspector.nomInspector,
                  color: '#565176',
                },
                {
                  text: inspector.emailInspector,
                  color: '#565176',
                },
                {
                  text: inspector.telInspector,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          text: '',
          fit: [100, 100],
          pageBreak: 'after',
        },
        {
          style: 'header',
          table: {
            widths: [100, '*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: `${logo}`,
                  fillColor: '#3B3F51',
                  margin: [0, 0, 0, 0],
                  fit: [100, 50],
                },
                {
                  border: [false, false, false, false],
                  fillColor: '#3B3F51',
                  alignment: 'center',
                  color: '#FFFFFF',
                  fontSize: 16,
                  margin: [10, 15, 100, 10],
                  text: 'Acta de Inspección',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: '2. Relato del asegurado',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Detalles',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  text: 'Relato de los hechos',
                  style: 'tableHeader',
                  bold: true,
                },
              ],
              [
                {
                  text: data_pdf.formRelatoAsegurado.Contratante_Hechos,
                  color: '#565176',
                  noWrap: false,
                },
              ],
              /*[
                {
                  text: 'Observaciones',
                  style: 'tableHeader',
                  bold: true,
                },
              ],
              [
                {
                  text: data_pdf.formAntecedentesGenerales.datosComunidad
                    .observaciones,
                  color: '#565176',
                },
              ],*/
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          text: '',
          fit: [100, 100],
          pageBreak: 'after',
        },
        {
          style: 'header',
          table: {
            widths: [100, '*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: `${logo}`,
                  fillColor: '#3B3F51',
                  margin: [0, 0, 0, 0],
                  fit: [100, 50],
                },
                {
                  border: [false, false, false, false],
                  fillColor: '#3B3F51',
                  alignment: 'center',
                  color: '#FFFFFF',
                  fontSize: 16,
                  margin: [10, 15, 100, 10],
                  text: 'Acta de Inspección',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: '3. Tipo edificación',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Detalles de la edificación',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Edificación', style: 'tableHeader', bold: true },
                { text: 'Superficie', style: 'tableHeader', bold: true },
                { text: 'Habitantes', style: 'tableHeader', bold: true },
                { text: 'Niveles', style: 'tableHeader', bold: true },
                { text: 'Pisos', style: 'tableHeader', bold: true },
              ],
              [
                {
                  text: data_pdf.formTipoInmueble.Tipo_Inmueble1,
                  color: '#565176',
                },
                {
                  text: data_pdf.formTipoInmueble.superficie + 'm²',
                  color: '#565176',
                },
                {
                  text: data_pdf.formTipoInmueble.habitantesFamilias,
                  color: '#565176',
                },
                {
                  text: data_pdf.formTipoInmueble.niveles,
                  color: '#565176',
                },
                {
                  text: data_pdf.formTipoInmueble.n_pisos,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Subterráneos', style: 'tableHeader', bold: true },
                { text: 'Habitable', style: 'tableHeader', bold: true },
                { text: 'Antigüedad', style: 'tableHeader', bold: true },
                {},
              ],
              [
                {
                  text: data_pdf.formTipoInmueble.nro_subterraneos,
                  color: '#565176',
                },
                {
                  text:
                    data_pdf.formTipoInmueble.habitable == '1' ? 'SI' : 'NO',
                  color: '#565176',
                },
                {
                  text:
                    data_pdf.formTipoInmueble.antiguedad,
                  color: '#565176',
                },
                {},
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [
                {
                  text: 'Descripción del riesgo',
                  style: 'tableHeader',
                  bold: true,
                },
              ],
              [
                {
                  text: data_pdf.formTipoInmueble.Contratante_Observaciones,
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Materialidad',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 10, 20, 10],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [{ text: 'Muros', style: 'tableHeader', bold: true }],
              [
                {
                  text:
                    data_pdf.formTipoInmueble.muros_interiores_val != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.muros_interiores_val
                        ).join(', ')
                      : '--',

                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 10],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [{ text: 'Cubierta', style: 'tableHeader', bold: true }],
              [
                {
                  text:
                    data_pdf.formTipoInmueble.cubierta_tech_val != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.cubierta_tech_val
                        ).join(', ')
                      : '--',

                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 10],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [{ text: 'Pavimentos', style: 'tableHeader', bold: true }],
              [
                {
                  text:
                    data_pdf.formTipoInmueble.pav_interiores_val != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.pav_interiores_val
                        ).join(', ')
                      : '--',

                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 10],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [{ text: 'Cielos', style: 'tableHeader', bold: true }],
              [
                {
                  text:
                    data_pdf.formTipoInmueble.cielo_interiores_val != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.cielo_interiores_val
                        ).join(', ')
                      : '--',
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 10],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [{ text: 'Terminaciones', style: 'tableHeader', bold: true }],
              [
                {
                  text:
                    data_pdf.formTipoInmueble.terminacion_int_val != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.terminacion_int_val
                        ).join(', ')
                      : '--',
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 10],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [{ text: 'Otras', style: 'tableHeader', bold: true }],
              [
                {
                  text:
                    data_pdf.formTipoInmueble.otras_inst_val != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.otras_inst_val
                        ).join(', ')
                      : '--',
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Medidas de seguridad',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Seguridad', style: 'tableHeader', bold: true },
                { text: 'Alarmas', style: 'tableHeader', bold: true },
                {
                  text: 'Protecciones metálicas',
                  style: 'tableHeader',
                  bold: true,
                },
              ],

              [
                {
                  text:
                    data_pdf.formTipoInmueble.seguridadvalor != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.seguridadvalor
                        ).join(', ')
                      : '--',
                  color: '#565176',
                },
                {
                  text:
                    data_pdf.formTipoInmueble.seguridadAlarmaValor != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.seguridadAlarmaValor
                        ).join(', ')
                      : '--',
                  color: '#565176',
                },
                {
                  text:
                    data_pdf.formTipoInmueble.seguridadProteccionesValor != null
                      ? JSON.parse(
                          data_pdf.formTipoInmueble.seguridadProteccionesValor
                        ).join(', ')
                      : '--',
                  color: '#565176',
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          text: '',
          fit: [100, 100],
          pageBreak: 'after',
        },
        {
          style: 'header',
          table: {
            widths: [100, '*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: `${logo}`,
                  fillColor: '#3B3F51',
                  margin: [0, 0, 0, 0],
                  fit: [100, 50],
                },
                {
                  border: [false, false, false, false],
                  fillColor: '#3B3F51',
                  alignment: 'center',
                  color: '#FFFFFF',
                  fontSize: 16,
                  margin: [10, 15, 100, 10],
                  text: 'Acta de Inspección',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: '4. Sectores afectados',
                },
              ],
            ],
          },
        },

        {
          style: 'subheader',
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: [
              ...main_sectors
                .filter((item) => item.value != 0)
                .map((item: any) => {
                  return '*';
                }),
            ], // Ancho igual para todas las columnas
            body: [
              [
                ...main_sectors
                  .filter((item) => item.value != 0)
                  .map((item: any) => {
                    return {
                      text: item.label,
                      style: 'tableHeader',
                      bold: true,
                    };
                  }),
                /*{ text: 'Habitación', style: 'tableHeader', bold: true },
                { text: 'Baños', style: 'tableHeader', bold: true },
                { text: 'Cocina', style: 'tableHeader', bold: true },
                { text: 'Living', style: 'tableHeader', bold: true },
                { text: 'Comedor', style: 'tableHeader', bold: true },
                { text: 'Logia', style: 'tableHeader', bold: true },*/
              ],
              [
                ...main_sectors
                  .filter((item) => item.value != 0)
                  .map((item: any) => {
                    return {
                      text: item.value,
                      color: '#565176',
                    };
                  }),
                /*{
                  text: main_sectors.filter(
                    (item) => item.tag == 'se_habitacion'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: main_sectors.filter((item) => item.tag == 'se_baños')[0]
                    .value,
                  color: '#565176',
                },
                {
                  text: main_sectors.filter(
                    (item) => item.tag == 'se_cocina'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: main_sectors.filter(
                    (item) => item.tag == 'se_living'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: main_sectors.filter(
                    (item) => item.tag == 'se_comedor'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: main_sectors.filter((item) => item.tag == 'se_logia')[0]
                    .value,
                  color: '#565176',
                },*/
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 10, 20, 0],
          table: {
            headerRows: 1,
            widths: [
              ...secondary_sectors
                .filter((item) => item.value != 0)
                .map((item: any) => {
                  return '*';
                }),
            ], // Ancho igual para todas las columnas
            body: [
              [
                ...secondary_sectors
                  .filter((item) => item.value != 0)
                  .map((item: any) => {
                    return {
                      text: item.label,
                      style: 'tableHeader',
                      bold: true,
                    };
                  }),
                /*{ text: 'Piscina', style: 'tableHeader', bold: true },
                { text: 'Quincho', style: 'tableHeader', bold: true },
                { text: 'Sala de estar', style: 'tableHeader', bold: true },
                { text: 'Bodega', style: 'tableHeader', bold: true },
                { text: 'Terraza', style: 'tableHeader', bold: true },
                { text: 'Garage', style: 'tableHeader', bold: true },
                { text: 'Otros', style: 'tableHeader', bold: true },*/
              ],
              [
                ...secondary_sectors
                  .filter((item) => item.value != 0)
                  .map((item: any) => {
                    return {
                      text: item.value,
                      color: '#565176',
                    };
                  }),
                /*{
                  text: secondary_sectors.filter(
                    (item) => item.tag == 'se_piscina'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: secondary_sectors.filter(
                    (item) => item.tag == 'se_quincho'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: secondary_sectors.filter(
                    (item) => item.tag == 'se_sala'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: secondary_sectors.filter(
                    (item) => item.tag == 'se_bodega'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: secondary_sectors.filter(
                    (item) => item.tag == 'se_terraza'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: secondary_sectors.filter(
                    (item) => item.tag == 'se_garage'
                  )[0].value,
                  color: '#565176',
                },
                {
                  text: secondary_sectors.filter(
                    (item) => item.tag == 'se_otros'
                  )[0].value,
                  color: '#565176',
                },*/
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },

        {
          style: 'subheader',
          margin: [20, 20, 20, 20],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              ...dk.map((item: any, index: any) => {
                return [
                  {
                    text: `#${index + 1}: ${item.nombre}`,
                    style: 'tableHeader',
                    bold: true,
                  },
                  {
                    text: `Alto: ${item.alto} m`,
                    color: '#565176',
                  },
                  {
                    text: `Ancho: ${item.ancho} m`,
                    color: '#565176',
                  },
                  {
                    text: `Largo: ${item.largo} m`,
                    color: '#565176',
                  },
                ];
              }),
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          text: '',
          fit: [100, 100],
          pageBreak: 'after',
        },
        ...sectores.map((sector: any, index: number) => {
          var sec = [];
          var perPage = 25;
          var pages = Math.ceil(sector.items.length / perPage);
          for (var i = 0; i < pages; i++) {
            sec.push(sector.items.slice(i * 25, (i + 1) * 25));
          }

          return [
            ...sec.map((item: any,inde:any) => {
              return [
                {
                  style: 'header',
                  table: {
                    widths: [100, '*'],
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          image: `${logo}`,
                          fillColor: '#3B3F51',
                          margin: [0, 0, 0, 0],
                          fit: [100, 50],
                        },
                        {
                          border: [false, false, false, false],
                          fillColor: '#3B3F51',
                          alignment: 'center',
                          color: '#FFFFFF',
                          fontSize: 16,
                          margin: [10, 15, 100, 10],
                          text: 'Acta de Inspección',
                        },
                      ],
                    ],
                  },
                },
                {
                  style: 'subheader',
                  margin: [10, 5, 10, 5],
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#FFF2EB',
                          color: '#403C58',
                          alignment: 'center',
                          fontSize: 20,
                          bold: true,
                          text: '5. Daños del edificio',
                        },
                      ],
                    ],
                  },
                },
                {
                  style: 'subheader',
                  margin: [20, 20, 20, 0],
                  table: {
                    headerRows: 1,
                    widths: [100, 50, '*', 100, 100], // Ancho igual para todas las columnas
                    body: [
                      [
                        { text: 'Lugar', style: 'tableHeader', bold: true },
                        { text: 'Tipo', style: 'tableHeader', bold: true },
                        { text: 'Nombre', style: 'tableHeader', bold: true },
                        { text: '% Daño', style: 'tableHeader', bold: true },
                        {
                          text: 'Superficie',
                          style: 'tableHeader',
                          bold: true,
                        },
                      ],
                      ...item.map((item: any) => {
                        //console.log(item)
                        return [
                          {
                            text: sector.nombre + ` ${index + 1}`,
                            color: '#565176',
                          },
                          { text: item.tipo_material, color: '#565176' },
                          { text: item.material, color: '#565176' },
                          {
                            text:
                              item.superficie != '' &&
                              item.superficie != null &&
                              item.superficie > 0
                                ? item.superficie + " m"
                                : '-',
                            color: '#565176',
                          },
                          {
                            text:
                              Math.round(item.cantidad * 100) / 100 +
                              ' ' +
                              item.unidad, //'m²'
                            color: '#565176',
                          },
                        ];
                      }),
                      // Agrega más filas aquí con el mismo formato
                    ],
                  },
                  layout: 'noBorders', // Elimina los bordes de la tabla
                },
                (inde < sec.length - 1)?{
                  text: '',
                  fit: [100, 100],
                  pageBreak: 'after',
                }:{}
              ];
            }),

            {
              style: 'subheader',
              margin: [10, 5, 10, 5],
              table: {
                widths: '*',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      fontSize: 10,
                      bold: true,
                      text: `Descripcion de ${sector.nombre} ${index + 1}`,
                    },
                  ],
                ],
              },
            },
            {
              style: 'subheader',
              margin: [10, 5, 10, 5],
              table: {
                widths: '*',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      fontSize: 12,
                      text: sector.descripcion,
                    },
                  ],
                ],
              },
            },
            index < sectores.length - 1
              ? {
                  text: '',
                  fit: [100, 100],
                  pageBreak: 'after',
                }
              : {},
          ];
        }),
        {
          text: '',
          fit: [100, 100],
          pageBreak: 'after',
        },
        {
          style: 'header',
          table: {
            widths: [100, '*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: `${logo}`,
                  fillColor: '#3B3F51',
                  margin: [0, 0, 0, 0],
                  fit: [100, 50],
                },
                {
                  border: [false, false, false, false],
                  fillColor: '#3B3F51',
                  alignment: 'center',
                  color: '#FFFFFF',
                  fontSize: 16,
                  margin: [10, 15, 100, 10],
                  text: 'Acta de Inspección',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: '6. Daños de contenido',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Contenido',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Producto', style: 'tableHeader', bold: true },
                { text: 'Marca-Modelo', style: 'tableHeader', bold: true },
                { text: 'Cantidad', style: 'tableHeader', bold: true },
              ],
              ...productosAfectados.map((item: any) => {
                return [
                  { text: item.nombre, color: '#565176' },
                  {
                    text: item.marca_modelo.split('|').join(' - '),
                    color: '#565176',
                  },
                  { text: item.cantidad, color: '#565176' },
                ];
              }),
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Terceros afectados',
                },
              ],
            ],
          },
        },
        ...terceros.map((item: any) => {
          return [
            {
              margin: [20, 0, 20, 0],
              table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
                body: [
                  [
                    {
                      text: 'Nombre Apellido',
                      style: 'tableHeader',
                      bold: true,
                    },
                    { text: 'Teléfono', style: 'tableHeader', bold: true }
                  ],
                  [
                    { text: item.nombre, color: '#565176' },
                    { text: (item.telefono!='')?item.telefono:"-", color: '#565176' }
                  ],
                  // Agrega más filas aquí con el mismo formato
                ],
              },
              layout: 'noBorders', // Elimina los bordes de la tabla
            },
            {
              margin: [20, 0, 20, 0],
              table: {
                headerRows: 1,
                widths: ['*'], // Ancho igual para todas las columnas
                body: [
                  [
                    { text: 'Correo', style: 'tableHeader', bold: true },
                  ],
                  [
                    { text: (item.correo!='')?item.correo:"-", color: '#565176' }
                  ],
                  // Agrega más filas aquí con el mismo formato
                ],
              },
              layout: 'noBorders', // Elimina los bordes de la tabla
            },
            {
              margin: [20, 0, 20, 0],
              table: {
                headerRows: 1,
                widths: ['*'], // Ancho igual para todas las columnas
                body: [
                  [
                    { text: 'Dirección', style: 'tableHeader', bold: true },
                  ],
                  [
                    { text: item.direccion, color: '#565176' },
                  ],
                  // Agrega más filas aquí con el mismo formato
                ],
              },
              layout: 'noBorders', // Elimina los bordes de la tabla
            },
            {
              margin: [20, 0, 20, 0],
              table: {
                headerRows: 1,
                widths: ['*'], // Ancho igual para todas las columnas
                body: [
                  [{ text: 'Observacion', style: 'tableHeader', bold: true }],
                  [
                    {
                      text:
                        item.observacion != null
                          ? item.observacion
                          : ' --  Sin Observacion --',
                      color: '#565176',
                    },
                  ],
                  // Agrega más filas aquí con el mismo formato
                ],
              },
              layout: 'noBorders', // Elimina los bordes de la tabla
            },
          ];
        }),

        {
          text: '',
          fit: [100, 100],
          pageBreak: 'after',
        },
        {
          style: 'header',
          table: {
            widths: [100, '*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: `${logo}`,
                  fillColor: '#3B3F51',
                  margin: [0, 0, 0, 0],
                  fit: [100, 50],
                },
                {
                  border: [false, false, false, false],
                  fillColor: '#3B3F51',
                  alignment: 'center',
                  color: '#FFFFFF',
                  fontSize: 16,
                  margin: [10, 15, 100, 10],
                  text: 'Acta de Inspección',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: '7. Otros documentos',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Documentos judiciales',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'], // Ancho igual para todas las columnas
            body: [
              [
                { text: 'Unidad policial', style: 'tableHeader', bold: true },
                { text: 'N° parte', style: 'tableHeader', bold: true },
                {
                  text: 'Cuerpo de bombero',
                  style: 'tableHeader',
                  bold: true,
                },
                {
                  text: 'Nombre denunciante',
                  style: 'tableHeader',
                  bold: true,
                },
              ],
              [
                { text: judicialesData.unidad_policial, color: '#565176' },
                { text: judicialesData.n_parte, color: '#565176' },
                { text: judicialesData.cuerpo_bombero, color: '#565176' },
                { text: judicialesData.nombre_denunciante, color: '#565176' },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: '*',
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#F3F3F7',
                  color: '#403C58',
                  alignment: 'start',
                  margin: [10, 5, 10, 5],
                  fontSize: 12,
                  bold: true,
                  text: 'Otros documentos comprometidos',
                },
              ],
            ],
          },
        },
        {
          margin: [20, 0, 20, 0],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [{ text: 'Compañía', style: 'tableHeader', bold: true }],
              [{ text: aseguradoraSeleccionada, color: '#565176' }],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },

        documentosSeleccionados.length > 0
          ? {}
          : {
              style: 'subheader',
              margin: [10, 5, 10, 5],
              table: {
                widths: '*',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#F3F3F7',
                      color: '#403C58',
                      alignment: 'center',
                      margin: [10, 5, 10, 5],
                      fontSize: 12,
                      bold: true,
                      text: 'Sin Documentos requeridos',
                    },
                  ],
                ],
              },
            },
        documentosSeleccionados.length > 0 ? {} : {},
        documentosSeleccionados.length > 0
          ? {
              style: 'subheader',
              margin: [10, 5, 10, 5],
              table: {
                widths: '*',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#F3F3F7',
                      color: '#403C58',
                      alignment: 'start',
                      margin: [10, 5, 10, 5],
                      fontSize: 12,
                      bold: true,
                      text: 'Documentos requeridos',
                    },
                  ],
                ],
              },
            }
          : {},
        documentosSeleccionados.length > 0
          ? {
              margin: [20, 0, 20, 0],
              table: {
                widths: ['*'],
                body: [
                  ...documentosSeleccionados.map((item: any, index: number) => {
                    return [
                      {
                        text: `Nro ${index + 1}:${item.documento}`,
                        color: '#565176',
                      },
                    ];
                  }),
                ],
              },
              layout: 'noBorders', // Elimina los bordes de la tabla
            }
          : {},
        {
          text: '',
          fit: [100, 100],
          pageBreak: 'after',
        },
        [
          {
            style: 'header',
            table: {
              widths: [100, '*'],
              body: [
                [
                  {
                    border: [false, false, false, false],
                    image: `${logo}`,
                    fillColor: '#3B3F51',
                    margin: [0, 0, 0, 0],
                    fit: [100, 50],
                  },
                  {
                    border: [false, false, false, false],
                    fillColor: '#3B3F51',
                    alignment: 'center',
                    color: '#FFFFFF',
                    fontSize: 16,
                    margin: [10, 15, 100, 10],
                    text: 'Acta de Inspección',
                  },
                ],
              ],
            },
          },
          {
            style: 'subheader',
            margin: [10, 5, 10, 5],
            table: {
              widths: '*',
              body: [
                [
                  {
                    border: [false, false, false, false],
                    fillColor: '#FFF2EB',
                    color: '#403C58',
                    alignment: 'center',
                    fontSize: 20,
                    bold: true,
                    text: '8. Imágenes',
                  },
                ],
              ],
            },
          },
          {
            margin: [20, 0, 10, 0],
            table: {
              headerRows: 1,
              widths: ['*'],
              body: [
                [
                  {
                    text: 'Fachada',
                    alignment: 'start',
                    bold: true,
                    margin: [0, 0, 0, 10],
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
          {
            margin: [20, 0, 20, 0],
            table: {
              headerRows: 1,
              widths: [img_w, img_w, img_w],
              heights: [img_w, img_w],
              body: [
                [
                  ...dd.map((item: any, index: any) => {
                    return {
                      image: `data:${item.mime_type};base64,${item.base64}`,
                      margin: [0, 0, 0, 0],
                      align: 'center',
                      valign: 'center',
                      width: img_w,
                      height: img_w,
                      fit: [img_w, img_w],
                    };
                  }),
                ],
              ],
            },
            layout: 'noBorders', // Elimina los bordes de la tabla
          },
        ],
        ...Object.keys(imagesKeys)
          .filter((item: any) => !item.includes('Fachada'))
          .map((item: any, ind: any) => {
            console.log(imagesKeys[item]);
            var skipPage = (ind + 2) % 2 == 0;
            var nextSkipPage = (ind + 3) % 2 == 0 && ind > 0;
            return [
              nextSkipPage
                ? {
                    style: 'header',
                    table: {
                      widths: [100, '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            image: `${logo}`,
                            fillColor: '#3B3F51',
                            margin: [0, 0, 0, 0],
                            fit: [100, 50],
                          },
                          {
                            border: [false, false, false, false],
                            fillColor: '#3B3F51',
                            alignment: 'center',
                            color: '#FFFFFF',
                            fontSize: 16,
                            margin: [10, 15, 100, 10],
                            text: 'Acta de Inspección',
                          },
                        ],
                      ],
                    },
                  }
                : {},
              nextSkipPage
                ? {
                    style: 'subheader',
                    margin: [10, 5, 10, 5],
                    table: {
                      widths: '*',
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            fillColor: '#FFF2EB',
                            color: '#403C58',
                            alignment: 'center',
                            fontSize: 20,
                            bold: true,
                            text: '8. Imágenes',
                          },
                        ],
                      ],
                    },
                  }
                : {},
              {
                margin: [20, 0, 10, 0],
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: `${item.split(' ')[0]}`,
                        alignment: 'start',
                        bold: true,
                        margin: [0, 0, 0, 10],
                      },
                    ],
                  ],
                },
                layout: 'noBorders',
              },
              {
                margin: [20, 0, 20, 0],
                table: {
                  headerRows: 1,
                  widths: [img_w, img_w, img_w],
                  heights: [img_w, img_w],
                  body: [
                    [1, 2, 3].map((abc, indq) => {
                      var c = imagesKeys[item][0][indq];
                      return c != null
                        ? {
                            image: `data:${c.mime_type};base64,${c.base64}`,
                            margin: [0, 0, 0, 0],
                            align: 'center',
                            valign: 'center',
                            width: img_w,
                            height: img_w,
                            fit: [img_w, img_w],
                          }
                        : {};
                    }),
                  ],
                },
                layout: 'noBorders', // Elimina los bordes de la tabla
              },
              skipPage && ind < Object.keys(imagesKeys)
          .filter((item: any) => !item.includes('Fachada')).length -1
                ? {
                    text: '',
                    fit: [100, 100],
                    pageBreak: 'after',
                  }
                : {},
            ];
            /*return [
            ...imagesKeys[item].map((it: any, index: any) => {
              if (count > 3) {
                count = 0;
              } else {
                count += 1;
              }
              //console.log([index,ind,count])
              var skipPage = count > 2;
              var titlePage = count > 2;
              console.log(imagesKeys[item]);
              return [
                titlePage
                  ? {
                      style: 'header',
                      table: {
                        widths: [100, '*'],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              image: `${logo}`,
                              fillColor: '#3B3F51',
                              margin: [0, 0, 0, 0],
                              fit: [100, 50],
                            },
                            {
                              border: [false, false, false, false],
                              fillColor: '#3B3F51',
                              alignment: 'center',
                              color: '#FFFFFF',
                              fontSize: 16,
                              margin: [10, 15, 100, 10],
                              text: 'Acta de Inspección',
                            },
                          ],
                        ],
                      },
                    }
                  : {},
                false
                  ? {
                      style: 'header',
                      table: {
                        widths: ['*'],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              text: ``,
                              margin: [0, 30, 0, 30],
                            },
                          ],
                        ],
                      },
                    }
                  : {},
                titlePage
                  ? {
                      style: 'subheader',
                      margin: [10, 5, 10, 5],
                      table: {
                        widths: '*',
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              fillColor: '#FFF2EB',
                              color: '#403C58',
                              alignment: 'center',
                              fontSize: 20,
                              bold: true,
                              text: '8. Imágenes',
                            },
                          ],
                        ],
                      },
                    }
                  : {},
                ind == 0
                  ? {
                      margin: [20, 0, 10, 0],
                      table: {
                        headerRows: 1,
                        widths: ['*'],
                        body: [
                          [
                            {
                              text: item.split(' ')[0],
                              alignment: 'start',
                              bold: true,
                              margin: [0, 0, 0, 10],
                            },
                          ],
                        ],
                      },
                      layout: 'noBorders',
                    }
                  : {},
                {
                  margin: [20, 0, 20, 0],
                  table: {
                    headerRows: 1,
                    widths: [img_w, img_w, img_w],
                    heights: [img_w, img_w],
                    body: [
                      [
                        ...imagesKeys[item].map((it: any, index: any) => {
                          console.log(it);
                          return {
                            text: `data:${it.mime_type};base64,${it.base64}`,
                            margin: [0, 0, 0, 0],
                            align: 'center',
                            valign: 'center',
                            width: img_w,
                            height: img_w,
                            fit: [img_w, img_w],
                          };
                        }),
                      ],
                    ],
                  },
                  layout: 'noBorders', // Elimina los bordes de la tabla
                },
                skipPage
                  ? {
                      text: '',
                      fit: [100, 100],
                      pageBreak: 'after',
                    }
                  : {},
              ];
            }),
          ];*/
          }),
        //console.log([index,ind,count])

        /*...images.map((image: any) => {
          return {
            margin: [20, 0, 20, 0],
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                [
                  {
                    image: `data:${image.mime_type};base64,${image.base64}`,
                    margin: [0, 0, 0, 0],
                    fit: [200, 200],
                  },
                ],
              ],
            },
            layout: 'noBorders', // Elimina los bordes de la tabla
          };
        }),*/

        { text: ' ', margin: [0, 20] },

        {
          text: '',
          fit: [100, 100],
          pageBreak: 'after',
        },
        {
          style: 'header',
          table: {
            widths: [100, '*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: `${logo}`,
                  fillColor: '#3B3F51',
                  margin: [0, 0, 0, 0],
                  fit: [100, 50],
                },
                {
                  border: [false, false, false, false],
                  fillColor: '#3B3F51',
                  alignment: 'center',
                  color: '#FFFFFF',
                  fontSize: 16,
                  margin: [10, 15, 100, 10],
                  text: 'Acta de Inspección',
                },
              ],
            ],
          },
        },
        {
          style: 'subheader',
          margin: [10, 5, 10, 5],
          table: {
            widths: ['*'],
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: '#FFF2EB',
                  color: '#403C58',
                  alignment: 'center',
                  fontSize: 20,
                  bold: true,
                  text: '9. Firmas',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text: 'Firma Inspector',
                  alignment: 'center',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
                {
                  text: 'Firma Entrevistado',
                  alignment: 'center',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              [
                {
                  image: sign1,
                  margin: [0, 0, 0, 0],
                  fit: [150, 150],
                  alignment: 'center',
                },
                {
                  image: sign2,
                  margin: [0, 0, 0, 0],
                  fit: [150, 150],
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
        {
          margin: [20, 20, 20, 20],
          table: {
            headerRows: 1,
            widths: ['*'], // Ancho igual para todas las columnas
            body: [
              [
                {
                  text: 'Nuestra empresa, Charles Taylor, ha sido asignada para realizar el proceso de liquidación de su siniestro. Dicho proceso, consiste en investigar la ocurrencia del siniestro, determinar si éste encuentra o no amparo por la póliza denunciada y establecer el monto de las pérdidas. Hecho lo anterior, emitiremos un Informe de Liquidación, en el que nos pronunciaremos sobre cada uno de los aspectos antes señalado.',
                  alignment: 'justify',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              [
                {
                  text: 'En este contexto, le informamos lo siguiente:',
                  alignment: 'justify',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              [
                {
                  text: '1. Su inmueble ha sido visitado por un inspector de nuestra empresa a fin de constatar los daños producto del siniestro denunciado por UD., levantando un registro escrito y fotográfico que será utilizado por el Liquidador para efectuar los análisis que correspondan para efectuar su proceso de liquidación.',
                  alignment: 'justify',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              [
                {
                  text: 'Tenga presente que el inspector que visitó el lugar de los hechos tiene cómo únicas funciones la de tomar registro de la declaración del Asegurado o de quien éste designe y de constatar el daño sufrido a raíz del siniestro. En ningún caso realizará evaluación alguna de pérdidas o de la cobertura de la póliza siniestrada.',
                  alignment: 'justify',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              [
                {
                  text: '2. La inspección realizada no garantiza que vuestro siniestro esté amparado por la póliza siniestrada, ya que ello depende de las condiciones de su contrato de seguros, lo que es materia del análisis del liquidador del caso.',
                  alignment: 'justify',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              [
                {
                  text: '3. Quien analizará su caso es el liquidador indicado en la “Información Adicional” de esta misma acta, donde también encontrará sus datos de contacto.',
                  alignment: 'justify',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              [
                {
                  text: '4. Con el fin de orientarlo, en este acto el inspector que ha levantado esta acta le entregará un Resumen del Proceso de Liquidación, con el que Ud. podrá conocer próximas etapas del proceso de liquidación.',
                  alignment: 'justify',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              [
                {
                  text: '5. Asimismo, para mayor información de vuestro caso, puede consultar nuestra página www.fgrchile.cl, en la sección “Seguimiento Siniestro”, accediendo en su RUT y el número de carpeta indicado en esta Acta.',
                  alignment: 'justify',
                  bold: true,
                  margin: [0, 0, 0, 10],
                },
              ],
              // Agrega más filas aquí con el mismo formato
            ],
          },
          layout: 'noBorders', // Elimina los bordes de la tabla
        },
      ],
      defaultStyle: {
        color: '#000',
      },
    };
  }
}
