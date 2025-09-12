import { Injectable, OnInit } from '@angular/core';
import { Api } from 'src/app/helpers/api/api';
import { Calculator } from 'src/app/helpers/calculator/calculator';
import { SQLiteService } from 'src/app/helpers/database/sqlite.service';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import * as pdfMakeMain from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Pdf } from 'src/app/helpers/pdf/pdf';

@Injectable({
  providedIn: 'root',
})
export class DashboardService implements OnInit {
  isAppInit: boolean = false;
  platform!: string;

  constructor(private storage: StorageService) {}
  ngOnInit(): void {}
  logInspeccion(id: string, created_at: string) {
    return new Api().post('/inspection/logger', {
      headers: { 'Content-Type': 'application/json', accept: '*/*' },
      auth: true,
      data: { cod: id, created_at },
    });
  }
  inspectionList() {
    return new Api().get('/inspection/list', { auth: true });
  }
  ping() {
    return new Api().ping();
  }

  getInspections() {}
  saveInspection(data: any) {
    return new Api().post('/inspection/guardar', {
      headers: { 'Content-Type': 'application/json', accept: '*/*' },
      auth: true,
      data: data,
    });
  }
  syncInspection(cod_inspeccion: any) {
    return new Api().post('/inspection/sync', {
      headers: { 'Content-Type': 'application/json', accept: '*/*' },
      auth: true,
      data: { cod: cod_inspeccion },
    });
  }
  saveDanoInspection() {}
  sendPDF(cod: any, pdf: any) {
    return new Api().post('/inspection/send', {
      headers: { 'Content-Type': 'application/json', accept: '*/*' },
      auth: true,
      data: { cod, pdf },
    });
  }
  getPolizas(nro_carpeta: any) {
    return new Api().get('/inspection/' + nro_carpeta + '/polizas', {
      headers: { 'Content-Type': 'application/json', accept: '*/*' },
      auth: true,
    });
  }
  async generatePdf(cod_inspeccion: any) {
    return new Promise(async (resolve, reject) => {
      const pdfMake: any = pdfMakeMain;
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      var doc;
      var s = await this.storage.select(
        `SELECT id,status FROM inspecciones_cabecera WHERE cod_inspeccion = '${cod_inspeccion}'`
      );
      if (s[0].status != 'CANCELLED') {
        doc = await Pdf.generate(this.storage, cod_inspeccion);
      } else {
        doc = await Pdf.generateCancelled(this.storage, cod_inspeccion);
      }

      pdfMake
        .createPdf(
          doc,
          {},
          {
            Roboto: {
              normal: 'Roboto-Regular.ttf',
              bold: 'Roboto-Medium.ttf',
              italics: 'Roboto-Italic.ttf',
              bolditalics: 'Roboto-MediumItalic.ttf',
            },
          },
          pdfFonts.pdfMake.vfs
        )
        .getBase64((data: any) => {
          console.log(data);
          resolve(data);
        });
    });
  }

  calcPrecio(item: any, tipo_zona: any) {
    var precio = 0;
    if (tipo_zona == 'urbana') {
      precio = item.precio_urbano;
    }
    if (tipo_zona == 'rural') {
      precio = item.precio_rural;
    }
    if (tipo_zona == 'especial') {
      precio = item.precio_especial;
    }
    return parseFloat(precio.toString());
  }
  calcTotal(item: any, control: any, tipo_zona: any) {
    var factor = 0;
    var largo = control.largo ? control.largo.toString() : '0';
    var alto = control.alto ? control.alto : '0';
    var ancho = control.ancho ? control.ancho : '0';
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
    return (
      this.calcPrecio(item, tipo_zona) *
      parseFloat(item.cantidad!.toString()) *
      (1 + parseFloat(item.adicional!.toString()) / 100)
    );
  }
  async desestimiento(cod_inspeccion: any) {
    var current_datetime = new Date();
    return new Promise(async (resolve, reject) => {
      await this.storage.run(
        `UPDATE inspecciones_cabecera SET status = 'CANCELLED', updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${cod_inspeccion}'`
      );
      resolve(true);
    });
  }
  async generateDesistPdf(inspeccion_cod: any) {
    return new Promise(async (resolve, reject) => {
      const pdfMake: any = pdfMakeMain;
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      var doc = await Pdf.generateCancelled(this.storage, inspeccion_cod);
      var pdfObj = pdfMake
        .createPdf(
          doc,
          {},
          {
            Roboto: {
              normal: 'Roboto-Regular.ttf',
              bold: 'Roboto-Medium.ttf',
              italics: 'Roboto-Italic.ttf',
              bolditalics: 'Roboto-MediumItalic.ttf',
            },
          },
          pdfFonts.pdfMake.vfs
        )
        .getBase64((data: any) => {
          console.log(data);
          resolve(data);
        });
    });
  }
  async desist(cod_inspeccion: string) {
    var inspeccions = await this.storage.select(
      `SELECT * FROM inspecciones WHERE cod_inspeccion = '${cod_inspeccion}'`
    );
    var inspeccion = inspeccions[0];
    var d = await this.storage.select(
      `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${cod_inspeccion}'`
    );
    return new Promise(async (resolve, reject) => {
      var _date;
      if (d[0].fecha_inspeccion == null) {
        _date = new Date(Date.now());
      } else {
        _date = new Date(Date.parse(d[0].fecha_inspeccion));
      }
      var ds = await this.storage.select(
        `SELECT * FROM inspecciones WHERE cod_inspeccion = '${inspeccion.cod_inspeccion}'`
      );
      console.log('Desistimiento de inspección');
      // No guardado
      if (ds[0].sync == -1) {
        await this.storage.run(
          `UPDATE inspecciones SET sync = -1 WHERE cod_inspeccion = '${inspeccion.cod_inspeccion}'`
        );
        this.syncInspection(inspeccion.cod_inspeccion).subscribe(
          async (response) => {
            await this.storage.run(
              `UPDATE inspecciones SET sync = 1 WHERE cod_inspeccion = '${inspeccion.cod_inspeccion}'`
            );
            var pdf = await this.generateDesistPdf(inspeccion.cod_inspeccion);
            this.sendPDF(inspeccion.cod_inspeccion, pdf).subscribe(
              async (data) => {
                //Eliminar inspeccion en la bd local
                await this.storage.run(
                  `UPDATE inspecciones SET sync = 2 WHERE cod_inspeccion = '${inspeccion.cod_inspeccion}'`
                );
              },
              (error) => {}
            );
          },
          async (error) => {}
        );
      } else {
        var dka = {
          cod: inspeccion.cod_inspeccion,
          data: {
            inspeccion: inspeccion,
            inspeccion_cabecera: {
              ...d[0],
              admin_mayor_domo: '',
              antecedentesCotizacionRobados: '',
              antecedentesDetalleRobados: '',
              antecedentesPresupuestoConstruccion: '',
              antecedentesRelacionHechos: '',
              antecedentesReporteAlarma: '',
              antecedetesDeclaracionJurada: '',
              antiguedad: '',

              fecha_inspeccion: `${_date.getFullYear()}-${(_date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${_date
                .getDate()
                .toString()
                .padStart(2, '0')} ${_date
                .getHours()
                .toString()
                .padStart(2, '0')}:${_date
                .getMinutes()
                .toString()
                .padStart(2, '0')}:${_date
                .getSeconds()
                .toString()
                .padStart(2, '0')}`,
              sw_terceros: ' ',
              otroSeguroExiste: '0',
              otroSeguroCia: '',
              total_imagenes: '0',
              total_documentos: '1',
              numero_parte: d[0].n_parte,
              bomberos: d[0].cuerpo_bombero,
              causa: '',
              tiene_alarma: '',
              seguridadCamara: '0',
              tipo_inmueble: d[0].Tipo_Inmueble1,
              menores: d[0].menores,
              guardia_seguridad: '0',
              reja_primer_piso: '',
              reja_segundo_piso: '',
              seguridadNombre: d[0].seguridadnombre,
              seguridadnombre: '()',
              seguridadvalor: '[]',
              seguridadAlarmaNombre: '()',
              seguridadAlarmaValor: '[]',
              muros_interiores_nomb: '()',
              muros_interiores_val: '[]',
              seguridadProteccionesNombre: '()',
              seguridadProteccionesValor: '[]',

              cubierta_tech_nomb:
                d[0].cubierta_tech_val != null
                  ? '(' + JSON.parse(d[0].cubierta_tech_val).join(',') + ')'
                  : '()',
              cubierta_tech_val:
                d[0].cubierta_tech_val != null
                  ? JSON.stringify(
                      JSON.parse(d[0].cubierta_tech_val).map((item: any) => 1)
                    )
                  : '[]',
              otras_inst_nomb:
                d[0].otras_inst_val != null
                  ? '(' + JSON.parse(d[0].otras_inst_val).join(',') + ')'
                  : '()',
              otras_inst_val:
                d[0].otras_inst_val != null
                  ? JSON.stringify(
                      JSON.parse(d[0].otras_inst_val).map((item: any) => 1)
                    )
                  : '[]',
              pav_interiores_nomb:
                d[0].pav_interiores_val != null
                  ? '(' + JSON.parse(d[0].pav_interiores_val).join(',') + ')'
                  : '()',
              pav_interiores_val:
                d[0].pav_interiores_val != null
                  ? JSON.stringify(
                      JSON.parse(d[0].pav_interiores_val).map((item: any) => 1)
                    )
                  : '[]',
              terminacion_int_nomb:
                d[0].terminacion_int_val != null
                  ? '(' + JSON.parse(d[0].terminacion_int_val).join(',') + ')'
                  : '()',
              terminacion_int_val:
                d[0].terminacion_int_val != null
                  ? JSON.stringify(
                      JSON.parse(d[0].terminacion_int_val).map((item: any) => 1)
                    )
                  : '[]',
              cielo_interiores_nomb:
                d[0].cielo_interiores_val != null
                  ? '(' + JSON.parse(d[0].cielo_interiores_val).join(',') + ')'
                  : '()',
              cielo_interiores_val:
                d[0].cielo_interiores_val != null
                  ? JSON.stringify(
                      JSON.parse(d[0].cielo_interiores_val).map(
                        (item: any) => 1
                      )
                    )
                  : '[]',
              perimetrales_nomb:
                d[0].muros_interiores_val != null
                  ? '(' + JSON.parse(d[0].muros_interiores_val).join(',') + ')'
                  : '()',
              perimetrales_val:
                d[0].muros_interiores_val != null
                  ? JSON.stringify(
                      JSON.parse(d[0].muros_interiores_val).map(
                        (item: any) => 1
                      )
                    )
                  : '[]',

              sol_antecedentes_nomb: '()',
              sol_antecedentes_val: '[]',
            },
            inspeccion_contenidos: [],
            inspection_media_files: [],
            inspection_danos: [],
            inspeccion_danos_materialidad: [],
            inspeccion_terceros: [],
            //inspeccion_terceros_sectores:[],
            inspeccion_habitantes: [],
            inspeccion_meta: [],
            created_at: d[0].created_at,
            updated_at: new Date().toISOString(),
          },
        };
        this.saveInspection(dka).subscribe(
          async (data) => {
            if (data.status == 200) {
              await this.storage.run(
                `UPDATE inspecciones SET sync = -1 WHERE cod_inspeccion = '${inspeccion.cod_inspeccion}'`
              );
              this.syncInspection(inspeccion.cod_inspeccion).subscribe(
                async (response) => {
                  if (response.status == 200) {
                    await this.storage.run(
                      `UPDATE inspecciones SET sync = 1 WHERE cod_inspeccion = '${inspeccion.cod_inspeccion}'`
                    );
                    var pdf = await this.generateDesistPdf(
                      inspeccion.cod_inspeccion
                    );
                    this.sendPDF(inspeccion.cod_inspeccion, pdf).subscribe(
                      async (data) => {
                        await this.storage.run(
                          `UPDATE inspecciones SET sync = 2 WHERE cod_inspeccion = '${inspeccion.cod_inspeccion}'`
                        );
                      },
                      (error) => {}
                    );
                  } else {
                  }
                },
                async (error) => {}
              );
            } else {
            }
          },
          async (error) => {}
        );
      }
      //this.init();
    });
  }
  async send(cod_inspeccion: any) {
    return new Promise(async (resolve, reject) => {
      var current_datetime = new Date();

      var inspeccion = await this.storage.select(
        `SELECT * FROM inspecciones WHERE cod_inspeccion = '${cod_inspeccion!.toString()}';`
      );
      var inspeccion_cabecera = await this.storage.select(
        `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${cod_inspeccion!.toString()}';`
      );
      var inspeccion_contenidos = await this.storage.select(
        `SELECT * FROM inspecciones_contenidos WHERE inspection_id = '${cod_inspeccion!.toString()}';`
      );
      var inspection_media_files = await this.storage.select(
        `SELECT * FROM inspections_media_files WHERE inspection_id = '${cod_inspeccion!.toString()}';`
      );
      var inspection_danos = await this.storage.select(
        `SELECT * FROM inspections_danos WHERE inspection_id = '${cod_inspeccion!.toString()}';`
      );
      var inspeccion_danos_materialidad = await this.storage.select(
        `SELECT * FROM inspecciones_danos_materialidad JOIN inspections_danos ON inspections_danos.id = inspecciones_danos_materialidad.inspection_dano_id WHERE inspections_danos.inspection_id = '${cod_inspeccion!.toString()}';`
      );
      var inspeccion_terceros = await this.storage.select(
        `SELECT * FROM inspecciones_terceros WHERE inspection_id = '${cod_inspeccion!.toString()}';`
      );
      //var inspeccion_terceros_sectores = await this.storage.select(`SELECT * FROM inspecciones_terceros_sectores WHERE inspection_id = '${inspeccion[0].id.toString()}';`);
      var inspeccion_habitantes = await this.storage.select(
        `SELECT * FROM inspecciones_habitantes WHERE inspection_id = '${cod_inspeccion!.toString()}';`
      );
      var inspeccion_meta = await this.storage.select(
        `SELECT * FROM inspeccion_meta WHERE inspection_id = '${cod_inspeccion!.toString()}';`
      );
      var causas = await this.storage.select(
        `SELECT * FROM causas WHERE id_causa = '${inspeccion_cabecera[0].causa}';`
      );
      var inspeccion_gastos = await this.storage.select(
        `SELECT * FROM inspeccion_expenses WHERE inspection_id = '${cod_inspeccion!.toString()}';`
      );

      this.storage.run(
        `UPDATE inspecciones SET completed = 1, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${cod_inspeccion}'`
      );

      var aseguradora = inspeccion_meta.filter(
        (item) => item.label == 'ASEGURADORA'
      );
      var aseguradoraSeleccionada = { id: 0, aseguradora: '' };
      if (aseguradora.length > 0) {
        aseguradoraSeleccionada = JSON.parse(aseguradora[0].data);
      }
      var _date;
      if (inspeccion_cabecera[0].fecha_inspeccion == null) {
        _date = new Date(Date.now());
      } else {
        _date = new Date(Date.parse(inspeccion_cabecera[0].fecha_inspeccion));
      }
      var data = {
        cod: cod_inspeccion!,
        data: {
          inspeccion: inspeccion[0],
          inspeccion_cabecera: {
            ...inspeccion_cabecera[0],
            fecha_inspeccion: `${_date.getFullYear()}-${(_date.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${_date
              .getDate()
              .toString()
              .padStart(2, '0')} ${_date
              .getHours()
              .toString()
              .padStart(2, '0')}:${_date
              .getMinutes()
              .toString()
              .padStart(2, '0')}:${_date
              .getSeconds()
              .toString()
              .padStart(2, '0')}`,
            sw_terceros: inspeccion_terceros.length > 0 ? '1' : ' ',
            otroSeguroExiste:
              aseguradora.length > 0 && aseguradoraSeleccionada.id != 0
                ? '1'
                : '0',
            otroSeguroCia:
              aseguradoraSeleccionada.id != 0
                ? aseguradoraSeleccionada.aseguradora
                : '',
            total_imagenes: inspection_media_files
              .filter((item) => item.filename.includes('IMG-'))
              .length.toString(),
            total_documentos: (inspection_media_files.length + 1).toString(),
            numero_parte: inspeccion_cabecera[0].n_parte,
            bomberos: inspeccion_cabecera[0].cuerpo_bombero,
            causa: causas.length == 0 ? '' : causas[0].causa,
            tiene_alarma: '',
            seguridadCamara:
              inspeccion_cabecera[0].seguridadvalor != '' &&
              inspeccion_cabecera[0].seguridadvalor != null
                ? JSON.parse(inspeccion_cabecera[0].seguridadvalor).filter(
                    (item: any) => item.includes('Cámara')
                  ).length > 0
                  ? '1'
                  : '0'
                : '0',
            tipo_inmueble: inspeccion_cabecera[0].Tipo_Inmueble1,
            menores: inspeccion_cabecera[0].menores,
            guardia_seguridad:
              inspeccion_cabecera[0].seguridadvalor != '' &&
              inspeccion_cabecera[0].seguridadvalor != null
                ? JSON.parse(inspeccion_cabecera[0].seguridadvalor).filter(
                    (item: any) => item.includes('Guardia')
                  ).length > 0
                  ? '1'
                  : '0'
                : '0',
            reja_primer_piso:
              inspeccion_cabecera[0].seguridadProteccionesValor != null
                ? JSON.parse(
                    inspeccion_cabecera[0].seguridadProteccionesValor
                  ).filter((item: any) =>
                    item.includes('Todas las Ventanas Primer Piso')
                  ).length > 0
                  ? '1'
                  : '0'
                : '',
            reja_segundo_piso:
              inspeccion_cabecera[0].seguridadProteccionesValor != null
                ? JSON.parse(
                    inspeccion_cabecera[0].seguridadProteccionesValor
                  ).filter((item: any) => item.includes('Todas las Ventanas'))
                    .length > 0
                  ? '1'
                  : '0'
                : '',
            seguridadNombre: inspeccion_cabecera[0].seguridadnombre,
            ...inspeccion_meta
              .filter((item) => item.label == 'JUDICIALES')
              .map((item) => ({ ...JSON.parse(item.data) }))[0],
            seguridadnombre:
              inspeccion_cabecera[0].seguridadvalor != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].seguridadvalor).join(',') +
                  ')'
                : '()',
            seguridadvalor:
              inspeccion_cabecera[0].seguridadvalor != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].seguridadvalor).map(
                      (item: any) => 1
                    )
                  )
                : '[]',
            seguridadAlarmaNombre:
              inspeccion_cabecera[0].seguridadAlarmaValor != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].seguridadAlarmaValor).join(
                    ','
                  ) +
                  ')'
                : '()',
            seguridadAlarmaValor:
              inspeccion_cabecera[0].seguridadAlarmaValor != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].seguridadAlarmaValor).map(
                      (item: any) => 1
                    )
                  )
                : '[]',
            muros_interiores_nomb:
              inspeccion_cabecera[0].muros_interiores_val != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].muros_interiores_val).join(
                    ','
                  ) +
                  ')'
                : '()',
            muros_interiores_val:
              inspeccion_cabecera[0].muros_interiores_val != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].muros_interiores_val).map(
                      (item: any) => 1
                    )
                  )
                : '[]',
            seguridadProteccionesNombre:
              inspeccion_cabecera[0].seguridadProteccionesValor != null
                ? '(' +
                  JSON.parse(
                    inspeccion_cabecera[0].seguridadProteccionesValor
                  ).join(',') +
                  ')'
                : '()',
            seguridadProteccionesValor:
              inspeccion_cabecera[0].seguridadProteccionesValor != null
                ? JSON.stringify(
                    JSON.parse(
                      inspeccion_cabecera[0].seguridadProteccionesValor
                    ).map((item: any) => 1)
                  )
                : '[]',

            cubierta_tech_nomb:
              inspeccion_cabecera[0].cubierta_tech_val != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].cubierta_tech_val).join(
                    ','
                  ) +
                  ')'
                : '()',
            cubierta_tech_val:
              inspeccion_cabecera[0].cubierta_tech_val != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].cubierta_tech_val).map(
                      (item: any) => 1
                    )
                  )
                : '[]',
            otras_inst_nomb:
              inspeccion_cabecera[0].otras_inst_val != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].otras_inst_val).join(',') +
                  ')'
                : '()',
            otras_inst_val:
              inspeccion_cabecera[0].otras_inst_val != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].otras_inst_val).map(
                      (item: any) => 1
                    )
                  )
                : '[]',
            pav_interiores_nomb:
              inspeccion_cabecera[0].pav_interiores_val != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].pav_interiores_val).join(
                    ','
                  ) +
                  ')'
                : '()',
            pav_interiores_val:
              inspeccion_cabecera[0].pav_interiores_val != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].pav_interiores_val).map(
                      (item: any) => 1
                    )
                  )
                : '[]',
            terminacion_int_nomb:
              inspeccion_cabecera[0].terminacion_int_val != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].terminacion_int_val).join(
                    ','
                  ) +
                  ')'
                : '()',
            terminacion_int_val:
              inspeccion_cabecera[0].terminacion_int_val != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].terminacion_int_val).map(
                      (item: any) => 1
                    )
                  )
                : '[]',
            cielo_interiores_nomb:
              inspeccion_cabecera[0].cielo_interiores_val != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].cielo_interiores_val).join(
                    ','
                  ) +
                  ')'
                : '()',
            cielo_interiores_val:
              inspeccion_cabecera[0].cielo_interiores_val != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].cielo_interiores_val).map(
                      (item: any) => 1
                    )
                  )
                : '[]',
            perimetrales_nomb:
              inspeccion_cabecera[0].muros_interiores_val != null
                ? '(' +
                  JSON.parse(inspeccion_cabecera[0].muros_interiores_val).join(
                    ','
                  ) +
                  ')'
                : '()',
            perimetrales_val:
              inspeccion_cabecera[0].muros_interiores_val != null
                ? JSON.stringify(
                    JSON.parse(inspeccion_cabecera[0].muros_interiores_val).map(
                      (item: any) => 1
                    )
                  )
                : '[]',

            sol_antecedentes_nomb:
              inspeccion_meta.filter((item) => item.label == 'DOCUMENTOS')
                .length > 0
                ? '(' +
                  JSON.parse(
                    inspeccion_meta.filter(
                      (item) => item.label == 'DOCUMENTOS'
                    )[0].data
                  )
                    .map((item: any) => item.documento)
                    .join(',') +
                  ')'
                : '()',
            sol_antecedentes_val:
              inspeccion_meta.filter((item) => item.label == 'DOCUMENTOS')
                .length > 0
                ? '[' +
                  JSON.parse(
                    inspeccion_meta.filter(
                      (item) => item.label == 'DOCUMENTOS'
                    )[0].data
                  )
                    .map((item: any) => 1)
                    .join(',') +
                  ']'
                : '[]',
          },
          inspeccion_contenidos,
          inspection_media_files,
          inspection_danos: inspection_danos.map((item) => {
            var it = item;
            console.log(it);
            it.items = JSON.stringify(
              JSON.parse(it.items).map((its: any) => {
                var precio = 0;
                if (inspeccion_cabecera[0].tipo_zona == 'urbana') {
                  precio = its.precio_urbano;
                }
                if (inspeccion_cabecera[0].tipo_zona == 'rural') {
                  precio = its.precio_rural;
                }
                if (inspeccion_cabecera[0].tipo_zona == 'especial') {
                  precio = its.precio_especial;
                }

                var tt =
                  Math.round(
                    this.calcTotal(
                      its,
                      {
                        alto: item.alto,
                        ancho: item.ancho,
                        largo: item.largo,
                      },
                      inspeccion_cabecera[0].tipo_zona
                    ) * 100
                  ) / 100;
                return {
                  categoria: item.nombre,
                  nombre: its.material,
                  superficie_total: its.cantidad,
                  superficie_afectada: 0,
                  unidad: its.unidad,
                  precio_unitario:
                    Math.round(parseFloat(precio.toString()) * 100) / 100,
                  adicional: its.adicional,
                  monto_partida: tt,
                };
              })
            );
            return it;
          }),
          inspeccion_danos_materialidad,
          inspeccion_terceros,
          //inspeccion_terceros_sectores:[],
          inspeccion_habitantes,
          inspeccion_gastos: inspeccion_gastos,
          inspeccion_meta,
          created_at: inspeccion_cabecera[0].created_at,
          updated_at: new Date().toISOString(),
        },
      };
      // Verificar si la inspección ya fue sincronizada
      // Si sync == 1 => ya fue sincronizada
      // Si sync == -1 => está en proceso de sincronización
      // Si sync == 0 => no ha sido sincronizada
      // Si sync == 2 => ya fue sincronizada y se envió el PDF
      console.log('Iniciando proceso de envío');
      console.log(inspeccion[0].sync);

      if (inspeccion[0].sync == -1) {
        await this.storage.run(
          `UPDATE inspecciones SET sync = -1, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${cod_inspeccion}'`
        );
        this.syncInspection(inspeccion[0].cod_inspeccion).subscribe(
          async (response) => {
            await this.storage.run(
              `UPDATE inspecciones SET sync = 1, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${cod_inspeccion}'`
            );
            var pdf = await this.generatePdf(inspeccion[0].cod_inspeccion);
            this.sendPDF(inspeccion[0].cod_inspeccion, pdf).subscribe(
              async (data) => {
                await this.storage.run(
                  `UPDATE inspecciones SET sync = 2, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${cod_inspeccion}'`
                );
                resolve(true);
              },
              (error) => {
                reject(false);
              }
            );
          },
          async (error) => {
            reject(false);
          }
        );
      } else {
        console.log('Enviando de nuevo la inspeccion');
        this.saveInspection(data).subscribe(
            async (data) => {
              if (data.status == 200) {
                console.log('Inspeccion enviada');
                await this.storage.run(
                  `UPDATE inspecciones SET sync = -1, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${cod_inspeccion}'`
                );
               this.syncInspection(inspeccion[0].cod_inspeccion).subscribe(
                    async (response) => {
                      console.log('Inspeccion sincronizada');
                      if (response.status == 200) {
                        await this.storage.run(
                          `UPDATE inspecciones SET sync = 1, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${cod_inspeccion}'`
                        );
                        console.log(response);

                        var pdf = await this.generatePdf(
                          inspeccion[0].cod_inspeccion
                        );
                        this.sendPDF(
                          inspeccion[0].cod_inspeccion,
                          pdf
                        ).subscribe(
                          async (data) => {
                            console.log('PDF enviado');

                            await this.storage.run(
                              `UPDATE inspecciones SET sync = 2, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${cod_inspeccion}'`
                            );
                            resolve(true);
                          },
                          (error) => {
                            reject(JSON.stringify(error));
                          }
                        );
                      } else {
                        reject('Error en la sincronización');
                      }
                    },
                    async (error) => {
                      reject(JSON.stringify(error));
                    }
                  );
              } else {
                console.log('Inspeccion enviada con error');
              }
            },
            async (error) => {
              reject(JSON.stringify(error));
            }
          );
      }
    });
  }
}
