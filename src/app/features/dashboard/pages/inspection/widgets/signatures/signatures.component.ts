import { Component, Input, OnInit } from '@angular/core';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import {
  FileOpener,
  FileOpenerOptions,
} from '@capacitor-community/file-opener';
import {
  IonTextarea,
  IonProgressBar,
  IonFab,
  IonFabButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonCol,
  IonGrid,
  IonRow,
  IonLoading,
} from '@ionic/angular/standalone';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, formatCurrency } from '@angular/common';
import { Dialog } from '@capacitor/dialog';
import { ActionSheetController } from '@ionic/angular';
import { SignaturesDialogComponent } from 'src/app/features/dashboard/dialogs/signatures-dialog/signatures-dialog.component';
import * as pdfMakeMain from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Pdf } from 'src/app/helpers/pdf/pdf';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { ActivatedRoute } from '@angular/router';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import write_blob from 'capacitor-blob-writer';
import { LocalNotifications } from '@capacitor/local-notifications';
import { LoadingController } from '@ionic/angular';
import { DashboardService } from 'src/app/features/dashboard/services/dashboard.service';
import { Calculator } from 'src/app/helpers/calculator/calculator';


@Component({
  selector: 'app-signatures',
  templateUrl: './signatures.component.html',
  styleUrls: ['./signatures.component.scss'],
  standalone: true,
  imports: [
    IonLoading,
    IonRow,
    IonGrid,
    IonCol,
    CommonModule,
    IonTextarea,
    IonIcon,
    IonButton,
    IonProgressBar,
    IonFab,
    IonFabButton,
    IonLabel,
    IonSelect,
    IonSelectOption,
    FormsModule,
    TranslationPipe,
    ReactiveFormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    SignaturesDialogComponent,
  ],
})
export class SignaturesComponent implements OnInit {
  presentingElement: any = undefined;
  pdfObj: any = null;
  sign1: any;
  sign2: any;
  id?: string;
  sending: boolean = false;
  data: any;
  completed = false;
  synced = false;
  @Input('formGroup') formGroup: any;
  current_datetime = new Date();
  constructor(
    private actionSheetCtrl: ActionSheetController,
    private storage: StorageService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private dashboardService: DashboardService,
    private toastController: ToastController,
    public platform: Platform
  ) {
    this.route.paramMap.subscribe((data: any) => {
      this.id = data.get('id')?.toString();
      this.init();
    });
  }

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
  }
  async init() {
    var ds = await this.storage.select(
      `SELECT * FROM inspecciones WHERE cod_inspeccion = '${this.id!.toString()}'`
    );
    // No guardado
    this.data = ds[0];
    if (this.data.completed == 1) {
      this.completed = true;
    }
    if (this.data.sync > 0) {
      this.synced = true;
    }
    var d = await this.storage.select(
      `SELECT * FROM inspections_media_files WHERE inspection_id = '${this.id}' AND filename LIKE 'SIGN-INSPECTOR-%' `
    );
    if (d.length > 0) {
      const mimeType = 'image/png';
      this.sign1 = `data:${mimeType};base64,${d[0].base64}`;
    }
    var dd = await this.storage.select(
      `SELECT * FROM inspections_media_files WHERE inspection_id = '${this.id}' AND filename LIKE 'SIGN-ENTREVISTADO-%' `
    );
    if (dd.length > 0) {
      const mimeType = 'image/png';
      this.sign2 = `data:${mimeType};base64,${dd[0].base64}`;
    }
  }
  montoPartida(item: any, size: any) {
    return Math.round(this.calcTotal(item, size) * 100) / 100;
  }

  calcTotal(item: any, control: any) {
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
      this.calcPrecio(item) *
      parseFloat(item.cantidad!.toString()) *
      (1 + parseFloat(item.adicional!.toString()) / 100)
    );
  }
  calcPrecio(item: any) {
    var precio = 0;
    if (this.formGroup.value.formTipoInmueble.tipo_zona == 'urbana') {
      precio = item.precio_urbano;
    }
    if (this.formGroup.value.formTipoInmueble.tipo_zona == 'rural') {
      precio = item.precio_rural;
    }
    if (this.formGroup.value.formTipoInmueble.tipo_zona == 'especial') {
      precio = item.precio_especial;
    }
    return parseFloat(precio.toString());
  }

  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿La firma esta correcta?',
      buttons: [
        {
          text: 'Si',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };
  goTo(section: string) {
    if (section == 'formAntecedentesGenerales')
      window.location.hash = 'general-background';
  }
  format(date: any) {
    var data = new Date(Date.parse(date));
    return `${data.getDate().toString().padStart(2, '0')}-${(
      data.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${data.getFullYear()} ${data
      .getHours()
      .toString()
      .padStart(2, '0')}:${data
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${data.getSeconds()}`;
  }
  async upload() {
    this.sending = true;
    var invalids = []; 
    const controls = this.formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalids.push(name);
        console.log(controls[name].value);
      }
    }
    if (invalids.length > 0) {
      console.log(invalids[0]);
      this.goTo(invalids[0]);
      const toast = await this.toastController.create({
        message:
          'Para poder enviar la inspección, debe completar todos los datos obligatorios',
        position: 'bottom',
        duration: 1000,
        cssClass: 'toast-danger',
      });
      toast.present();
    } else {
      if (this.sign1 != null && this.sign2 != null) {
        this.storage.run(
          `UPDATE inspecciones SET completed = 1, updated_at = '${this.current_datetime.toISOString()}' WHERE cod_inspeccion = '${
            this.id
          }'`
        );
        var inspeccion = await this.storage.select(
          `SELECT * FROM inspecciones WHERE cod_inspeccion = '${this.id!.toString()}';`
        );
        var inspeccion_cabecera = await this.storage.select(
          `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${this.id!.toString()}';`
        );
        var inspeccion_contenidos = await this.storage.select(
          `SELECT * FROM inspecciones_contenidos WHERE inspection_id = '${this.id!.toString()}';`
        );
        var inspection_media_files = await this.storage.select(
          `SELECT * FROM inspections_media_files WHERE inspection_id = '${this.id!.toString()}';`
        );
        var inspection_danos = await this.storage.select(
          `SELECT * FROM inspections_danos WHERE inspection_id = '${this.id!.toString()}';`
        );
        var inspeccion_danos_materialidad = await this.storage.select(
          `SELECT * FROM inspecciones_danos_materialidad JOIN inspections_danos ON inspections_danos.id = inspecciones_danos_materialidad.inspection_dano_id WHERE inspections_danos.inspection_id = '${this.id!.toString()}';`
        );
        var inspeccion_terceros = await this.storage.select(
          `SELECT * FROM inspecciones_terceros WHERE inspection_id = '${this.id!.toString()}';`
        );
        //var inspeccion_terceros_sectores = await this.storage.select(`SELECT * FROM inspecciones_terceros_sectores WHERE inspection_id = '${inspeccion[0].id.toString()}';`);
        var inspeccion_habitantes = await this.storage.select(
          `SELECT * FROM inspecciones_habitantes WHERE inspection_id = '${this.id!.toString()}';`
        );
        var inspeccion_meta = await this.storage.select(
          `SELECT * FROM inspeccion_meta WHERE inspection_id = '${this.id!.toString()}';`
        );
        var causas = await this.storage.select(
          `SELECT * FROM causas WHERE id_causa = '${inspeccion_cabecera[0].causa}';`
        );

        var aseguradora = inspeccion_meta.filter(
          (item) => item.label == 'ASEGURADORA'
        );
        var aseguradoraSeleccionada = { id: 0, aseguradora: '' };
        if (aseguradora.length > 0) {
          aseguradoraSeleccionada = JSON.parse(aseguradora[0].data);
        }
        var _date;
        if(inspeccion_cabecera[0].fecha_inspeccion==null){
          _date = new Date(Date.now());
        }
        else{
          _date = (new Date(Date.parse(inspeccion_cabecera[0].fecha_inspeccion)));
        }
        
        var data = {
          cod: this.id!,
          data: {
            inspeccion: inspeccion[0],
            inspeccion_cabecera: {
              ...inspeccion_cabecera[0],  
              fecha_inspeccion: `${_date.getFullYear()}-${(_date.getMonth()+1).toString().padStart(2,'0')}-${_date.getDate().toString().padStart(2,'0')} ${_date.getHours().toString().padStart(2,'0')}:${_date.getMinutes().toString().padStart(2,'0')}:${_date.getSeconds().toString().padStart(2,'0')}`,
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
              causa: causas[0].causa,
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
                    JSON.parse(inspeccion_cabecera[0].seguridadvalor).join(
                      ','
                    ) +
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
                    JSON.parse(
                      inspeccion_cabecera[0].seguridadAlarmaValor
                    ).join(',') +
                    ')'
                  : '()',
              seguridadAlarmaValor:
                inspeccion_cabecera[0].seguridadAlarmaValor != null
                  ? JSON.stringify(
                      JSON.parse(
                        inspeccion_cabecera[0].seguridadAlarmaValor
                      ).map((item: any) => 1)
                    )
                  : '[]',
              muros_interiores_nomb:
                inspeccion_cabecera[0].muros_interiores_val != null
                  ? '(' +
                    JSON.parse(
                      inspeccion_cabecera[0].muros_interiores_val
                    ).join(',') +
                    ')'
                  : '()',
              muros_interiores_val:
                inspeccion_cabecera[0].muros_interiores_val != null
                  ? JSON.stringify(
                      JSON.parse(
                        inspeccion_cabecera[0].muros_interiores_val
                      ).map((item: any) => 1)
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
                    JSON.parse(inspeccion_cabecera[0].otras_inst_val).join(
                      ','
                    ) +
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
                      JSON.parse(
                        inspeccion_cabecera[0].terminacion_int_val
                      ).map((item: any) => 1)
                    )
                  : '[]',
              cielo_interiores_nomb:
                inspeccion_cabecera[0].cielo_interiores_val != null
                  ? '(' +
                    JSON.parse(
                      inspeccion_cabecera[0].cielo_interiores_val
                    ).join(',') +
                    ')'
                  : '()',
              cielo_interiores_val:
                inspeccion_cabecera[0].cielo_interiores_val != null
                  ? JSON.stringify(
                      JSON.parse(
                        inspeccion_cabecera[0].cielo_interiores_val
                      ).map((item: any) => 1)
                    )
                  : '[]',
              perimetrales_nomb:
                inspeccion_cabecera[0].muros_interiores_val != null
                  ? '(' +
                    JSON.parse(
                      inspeccion_cabecera[0].muros_interiores_val
                    ).join(',') +
                    ')'
                  : '()',
              perimetrales_val:
                inspeccion_cabecera[0].muros_interiores_val != null
                  ? JSON.stringify(
                      JSON.parse(
                        inspeccion_cabecera[0].muros_interiores_val
                      ).map((item: any) => 1)
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
                  if (
                    this.formGroup.value.formTipoInmueble.tipo_zona == 'urbana'
                  ) {
                    precio = its.precio_urbano;
                  }
                  if (
                    this.formGroup.value.formTipoInmueble.tipo_zona == 'rural'
                  ) {
                    precio = its.precio_rural;
                  }
                  if (
                    this.formGroup.value.formTipoInmueble.tipo_zona ==
                    'especial'
                  ) {
                    precio = its.precio_especial;
                  }
                  return {
                    categoria: item.nombre,
                    nombre: its.material,
                    superficie_total: its.cantidad,
                    superficie_afectada: 0,
                    unidad: its.unidad,
                    precio_unitario:
                      Math.round(parseFloat(precio.toString()) * 100) / 100,
                    adicional: its.adicional,
                    monto_partida: this.montoPartida(its, {
                      alto: item.alto,
                      ancho: item.ancho,
                      largo: item.largo,
                    }),
                  };
                })
              );
              return it;
            }),
            inspeccion_danos_materialidad,
            inspeccion_terceros,
            //inspeccion_terceros_sectores:[],
            inspeccion_habitantes,
            inspeccion_meta,
            created_at: inspeccion_cabecera[0].created_at,
            updated_at: new Date().toISOString(),
          },
        };
        if (this.data.sync == -1) {
          const loading_ = await this.loadingCtrl.create({
            message:
              'Enviando inspección. Este proceso puede tardar unos minutos, por favor no cierres la aplicación',
          });
          loading_.present();

          await this.storage.run(
            `UPDATE inspecciones SET sync = -1, updated_at = '${this.current_datetime.toISOString()}' WHERE cod_inspeccion = '${
              this.id
            }'`
          );
          this.dashboardService
            .syncInspection(inspeccion[0].cod_inspeccion)
            .subscribe(
              async (response) => {
                loading_.dismiss();
                
                await this.storage.run(
                  `UPDATE inspecciones SET sync = 1, updated_at = '${this.current_datetime.toISOString()}' WHERE cod_inspeccion = '${
                    this.id
                  }'`
                );
                this.synced = true;
                const toast = await this.toastController.create({
                  message: 'Guardado con éxito',
                  position: 'bottom',
                  duration: 1000,
                  cssClass: 'toast-success',
                });
                toast.present();

                var pdf = await this.generatePdf();
                const loading_1 = await this.loadingCtrl.create({
                  message: 'Enviando PDF',
                });
                loading_1.present();
                this.dashboardService
                  .sendPDF(inspeccion[0].cod_inspeccion, pdf)
                  .subscribe(
                    async (data) => {
                      loading_1.dismiss();
                      //Eliminar inspeccion en la bd local

                      await this.storage.run(
                        `UPDATE inspecciones SET sync = 2, updated_at = '${this.current_datetime.toISOString()}' WHERE cod_inspeccion = '${
                          this.id
                        }'`
                      );
                      const toast = await this.toastController.create({
                        message: 'Archivo PDF enviado',
                        position: 'bottom',
                        duration: 1000,
                        cssClass: 'toast-success',
                      });
                      toast.present();
                      window.location.href = '/inspections';
                    },
                    (error) => {
                      window.location.href = '/inspections';
                    }
                  );
              },
              async (error) => {
                const toast = await this.toastController.create({
                  message: 'Guardado, pero no es posible enviarlo',
                  position: 'bottom',
                  duration: 1000,
                  cssClass: 'toast-danger',
                });
                toast.present();
                loading_.dismiss();
                window.location.href = '/inspections';
              }
            );
        } else {
          const loading = await this.loadingCtrl.create({
            message: 'Enviando Información',
          });
          loading.present();
          this.dashboardService.saveInspection(data).subscribe(
            async (data) => {
              loading.dismiss();
              if (data.status == 200) {
                const loading_ = await this.loadingCtrl.create({
                  message:
                    'Enviando inspección. Este proceso puede tardar unos minutos, por favor no cierres la aplicación',
                });
                loading_.present();
                await this.storage.run(
                  `UPDATE inspecciones SET sync = -1, updated_at = '${this.current_datetime.toISOString()}' WHERE cod_inspeccion = '${
                    this.id
                  }'`
                );
                this.dashboardService
                  .syncInspection(inspeccion[0].cod_inspeccion)
                  .subscribe(
                    async (response) => {
                      loading_.dismiss();
                      if (response.status == 200) {
                        await this.storage.run(
                          `UPDATE inspecciones SET sync = 1, updated_at = '${this.current_datetime.toISOString()}' WHERE cod_inspeccion = '${
                            this.id
                          }'`
                        );
                        this.synced = true;
                        console.log(response);
                        loading_.dismiss();
                        const toast = await this.toastController.create({
                          message: 'Guardado con éxito',
                          position: 'bottom',
                          duration: 1000,
                          cssClass: 'toast-success',
                        });
                        toast.present();

                        const loading_pdf = await this.loadingCtrl.create({
                          message: 'Enviando PDF',
                        });
                        loading_pdf.present();
                        var pdf = await this.generatePdf();
                        this.dashboardService
                          .sendPDF(inspeccion[0].cod_inspeccion, pdf)
                          .subscribe(
                            async (data) => {
                              loading_pdf.dismiss();
                              //Eliminar inspeccion en la bd local

                              await this.storage.run(
                                `UPDATE inspecciones SET sync = 2, updated_at = '${this.current_datetime.toISOString()}' WHERE cod_inspeccion = '${
                                  this.id
                                }'`
                              );
                              const toast = await this.toastController.create({
                                message: 'Archivo PDF enviado',
                                position: 'bottom',
                                duration: 1000,
                                cssClass: 'toast-success',
                              });
                              toast.present();
                              window.location.href = '/inspections';
                            },
                            (error) => {
                              window.location.href = '/inspections';
                            }
                          );
                      } else {
                        const toast = await this.toastController.create({
                          message: 'No fue posible enviarlo al EPASS',
                          position: 'bottom',
                          duration: 1000,
                          cssClass: 'toast-danger',
                        });
                        toast.present();
                      }
                    },
                    async (error) => {
                      const toast = await this.toastController.create({
                        message:
                          'Guardado, pero no es posible enviarlo al EPASS',
                        position: 'bottom',
                        duration: 1000,
                        cssClass: 'toast-danger',
                      });
                      toast.present();
                      loading_.dismiss();
                      window.location.href = '/inspections';
                    }
                  );
              } else {
                const toast = await this.toastController.create({
                  message: 'Guardado, pero no es posible enviarlo',
                  position: 'bottom',
                  duration: 1000,
                  cssClass: 'toast-danger',
                });
                toast.present();
              }
            },
            async (error) => {
              loading.dismiss();
              const toast = await this.toastController.create({
                message:
                  'Guardado, pero no es posible enviarlo en este momento',
                position: 'bottom',
                duration: 1000,
                cssClass: 'toast-danger',
              });
              toast.present();
              window.location.href = '/inspections';
            }
          );
        }
      } else {
        const toast = await this.toastController.create({
          message: 'Debe existir ambas firmas',
          position: 'bottom',
          duration: 1000,
          cssClass: 'toast-danger',
        });
        toast.present();
      }
    }
    this.sending = false;
  }
  saveInspeccion() {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  sendInspeccion() {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  syncInspeccion() {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  formatCurrency(val: any) {
    if (isNaN(val)) return 0;
    return val.toLocaleString('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  async generatePdf() {
    return new Promise(async (resolve, reject) => {
      const pdfMake: any = pdfMakeMain;
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      var doc = await Pdf.generate(this.storage, this.id);

      this.pdfObj = pdfMake
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
  async download() {
    const pdfMake: any = pdfMakeMain;
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const loading = await this.loadingCtrl.create({
      message: 'Generando PDF',
    });

    loading.present();
    var images = await this.storage.select(
      `SELECT * FROM inspections_media_files WHERE inspection_id = '${this.id}' AND filename LIKE 'IMG-%' AND selected = 1 `
    );
    var doc = await Pdf.generate(this.storage, this.id);
    this.pdfObj = pdfMake.createPdf(
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
    );

    if (false) {
      this.pdfObj.download();
    } else {
      this.pdfObj.getBuffer(async (buffer: any) => {
        let utf8 = new Uint8Array(buffer);
        let binaryArray = utf8.buffer;
        var d = await Pdf.getFilesystemAccess();
        if (d) {
          var dd = await write_blob({
            path: `charlestaylor/documents/${this.id}.pdf`,
            directory: Directory.Data,
            blob: new Blob([buffer]),
            fast_mode: true,
            recursive: true,
            on_fallback(error) {
              alert(error);
            },
          })
            .then(async () => {
              const notifs = await LocalNotifications.schedule({
                notifications: [
                  {
                    title: 'Archivo generado con éxito',
                    body: `Inspeccion ${this.id}`,
                    id: 1,
                    schedule: { at: new Date(Date.now()) },
                    actionTypeId: '',
                    extra: null,
                  },
                ],
              });
              console.log('scheduled notifications', notifs);
              Filesystem.getUri({
                path: `charlestaylor/documents/${this.id}.pdf`,
                directory: Directory.Data,
              }).then(async ({ uri }) => {
                try {
                  const fileOpenerOptions: FileOpenerOptions = {
                    filePath: uri,
                    contentType: 'application/pdf',
                    openWithDefault: true,
                  };
                  await FileOpener.open(fileOpenerOptions);
                } catch (e) {
                  alert(e);
                }
              });

              loading.dismiss();
            })
            .catch((e) => {
              loading.dismiss();
            });
        }
      });
    }
  }
  async saveToDevice(data: any, savefile: any) {
    await Filesystem.writeFile({
      path: 'secrets/' + savefile,
      data: data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
  }
  async signed1(sign: any) {
    var base64 = sign.replace('data:image/png;base64,', '');
    const mimeType = 'image/png';
    this.sign1 = `data:${mimeType};base64,${base64}`;
    var filename = `SIGN-INSPECTOR-${Date.now()}.png`;
    await this.storage.run(
      `DELETE FROM inspections_media_files WHERE inspection_id = '${this.id}' AND filename LIKE 'SIGN-INSPECTOR-%' `
    );
    await this.storage.insert('inspections_media_files', {
      inspection_id: this.id,
      filename: filename,
      mime_type: mimeType,
      base64: base64,
    });
  }
  async signed2(sign: any) {
    var base64 = sign.replace('data:image/png;base64,', '');
    const mimeType = 'image/png';
    this.sign2 = `data:${mimeType};base64,${base64}`;
    var filename = `SIGN-ENTREVISTADO-${Date.now()}.png`;
    await this.storage.run(
      `DELETE FROM inspections_media_files WHERE inspection_id = '${this.id}' AND filename LIKE 'SIGN-ENTREVISTADO-%' `
    );
    await this.storage.insert('inspections_media_files', {
      inspection_id: this.id,
      filename: filename,
      mime_type: mimeType,
      base64: base64,
    });
    console.log(base64);
  }
}
