import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonButton,
  IonIcon,
  IonItem,
  IonList,
  IonLabel,
  IonInput,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import * as pdfMakeMain from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { DashboardService } from '../../services/dashboard.service';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { Inspection } from 'src/app/models/inspection/inspection';
import { lastValueFrom, of, switchMap } from 'rxjs';
import { LayoutComponent } from 'src/app/widgets/layout/layout.component';
import { PageLayoutComponent } from 'src/app/widgets/page-layout/page-layout.component';
import { ViewWillEnter } from '@ionic/angular';
import { Calculator } from 'src/app/helpers/calculator/calculator';
import { LoadingController } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import write_blob from 'capacitor-blob-writer';
import {
  FileOpener,
  FileOpenerOptions,
} from '@capacitor-community/file-opener';
import { Pdf } from 'src/app/helpers/pdf/pdf';
import { IonSpinner } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-inspections',
  templateUrl: './inspections.page.html',
  styleUrls: ['./inspections.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonIcon,
    IonButton,
    IonRow,
    IonGrid,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslationPipe,
    IonLabel,
    CommonModule,
    IonInput,
    RouterModule,
    IonFab,
    IonFabButton,
    PageLayoutComponent,
    IonSpinner,
  ],
})
export class InspectionsPage implements OnInit, ViewWillEnter {
  async pingServer(timeout = 5000): Promise<boolean> {
    const controller = new AbortController();
    const signal = controller.signal;
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      await fetch(environment.api + '/health/status', {
        method: 'GET',
        signal,
      });
      clearTimeout(timer);
      return true;
    } catch (e) {
      clearTimeout(timer);
      return false;
    }
  }
  formSearch = new FormGroup({
    term: new FormControl('', []),
  });
  list: Inspection[] = [];
  filteredList: Inspection[] = [];
  status_filter = 'pendientes';
  type_filter = 'asignadas';
  usuario: any;
  pdfObj: any = null;
  current_date: Date = new Date(Date.now());
  loading = false;
  constructor(
    private dashboardService: DashboardService,
    private storage: StorageService,
    private router: Router,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastController: ToastController
  ) {}
  ionViewWillEnter(): void {
    this.init();
  }

  ngOnInit() {}
  async init() {
    this.usuario = localStorage.getItem('username');
    if (window.location.hash == '#pending') this.status_filter = 'pendientes';
    if (window.location.hash == '#finished') this.status_filter = 'finalizadas';

    var d = await this.storage.select('SELECT * FROM inspecciones');
    this.list = d;
    this.filteredList = this.list;
    //console.log('Conexión a internet:', hasInternet);
    const hasInternet = await this.pingServer();
    if (hasInternet) {
      this.refresh();
    }
  }
  onSubmit(event: any) {
    this.filteredList = this.list.filter((item) => {
      return item.cod_inspeccion
        ?.toUpperCase()
        ?.includes(event.target.value.toUpperCase());
    });
  }
  back() {
    this.router.navigateByUrl('/');
  }
  formatDate(da: any) {
    var date = new Date(Date.parse(da));
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  }
  async send() {
    var inspecciones_pendientes = this.list.filter(
      (item) => item.completed == 1 && item.sync != 2
    );
    /*console.log(
        'Inspecciones pendientes por sincronizar:',
        inspecciones_pendientes
      );*/

    /// Enviar inspecciones completadas no sincronizadas
    //console.log('Iniciando envío de inspecciones completadas...');
    var flag = false;
    for (var i = 0; i < inspecciones_pendientes.length; i++) {
      var inspeccion = inspecciones_pendientes[i];
      var d = await this.storage.select(
        `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${inspeccion.cod_inspeccion}'`
      );
      //console.log('Enviando inspección:', inspeccion.cod_inspeccion,d[0].status);
      if (inspeccion.status == 'INVALID') {
        console.log('Marcando inspección como inválida en servidor...');
      }
      if (d[0].status == 'CANCELLED') {
        var dd = await this.dashboardService.desist(d[0].cod_inspeccion);
      }
      if (d[0].status == 'ACTIVE') {
        //console.log("Envio de inspeccion");
        var ds = await this.dashboardService.send(inspeccion.cod_inspeccion);
      }
      flag = true;
    }
    if (flag) {
      setTimeout(async () => {
        //console.log('Actualizando lista tras sincronización...');
        if (window.location.hash == '#pending')
          this.status_filter = 'pendientes';
        if (window.location.hash == '#finished')
          this.status_filter = 'finalizadas';
        var d = await this.storage.select('SELECT * FROM inspecciones');
        this.list = d;
        this.filteredList = this.list;
        //console.log('Lista tras sincronización:', this.list);
      }, 300);
    }
  }

  calcTotal(formData: any, item: any, control: any) {
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
      this.calcPrecio(formData, item) *
      parseFloat(item.cantidad!.toString()) *
      (1 + parseFloat(item.adicional!.toString()) / 100)
    );
  }
  calcPrecio(formData: any, item: any) {
    var precio = 0;
    if (formData.formTipoInmueble.tipo_zona == 'urbana') {
      precio = item.precio_urbano;
    }
    if (formData.formTipoInmueble.tipo_zona == 'rural') {
      precio = item.precio_rural;
    }
    if (formData.formTipoInmueble.tipo_zona == 'especial') {
      precio = item.precio_especial;
    }
    return parseFloat(precio.toString());
  }
  montoPartida(formData: any, item: any, size: any) {
    return Math.round(this.calcTotal(formData, item, size) * 100) / 100;
  }

  async sendInspection(inspection: any) {
    const current_datetime = new Date(Date.now());
    this.storage.run(
      `UPDATE inspecciones SET completed = 1, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${
        inspection.cod_inspeccion
      }'`
    );
    var inspeccion = await this.storage.select(
      `SELECT * FROM inspecciones WHERE cod_inspeccion = '${inspection.cod_inspeccion!.toString()}';`
    );
    var inspeccion_cabecera = await this.storage.select(
      `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${inspection.cod_inspeccion!.toString()}';`
    );
    var inspeccion_contenidos = await this.storage.select(
      `SELECT * FROM inspecciones_contenidos WHERE inspection_id = '${inspection.cod_inspeccion!.toString()}';`
    );
    var inspection_media_files = await this.storage.select(
      `SELECT * FROM inspections_media_files WHERE inspection_id = '${inspection.cod_inspeccion!.toString()}';`
    );
    var inspection_danos = await this.storage.select(
      `SELECT * FROM inspections_danos WHERE inspection_id = '${inspection.cod_inspeccion!.toString()}';`
    );
    var inspeccion_danos_materialidad = await this.storage.select(
      `SELECT * FROM inspecciones_danos_materialidad JOIN inspections_danos ON inspections_danos.id = inspecciones_danos_materialidad.inspection_dano_id WHERE inspections_danos.inspection_id = '${inspection.cod_inspeccion!.toString()}';`
    );
    var inspeccion_terceros = await this.storage.select(
      `SELECT * FROM inspecciones_terceros WHERE inspection_id = '${inspection.cod_inspeccion!.toString()}';`
    );
    //var inspeccion_terceros_sectores = await this.storage.select(`SELECT * FROM inspecciones_terceros_sectores WHERE inspection_id = '${inspeccion[0].id.toString()}';`);
    var inspeccion_habitantes = await this.storage.select(
      `SELECT * FROM inspecciones_habitantes WHERE inspection_id = '${inspection.cod_inspeccion!.toString()}';`
    );
    var inspeccion_meta = await this.storage.select(
      `SELECT * FROM inspeccion_meta WHERE inspection_id = '${inspection.cod_inspeccion!.toString()}';`
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
    if (inspeccion_cabecera[0].fecha_inspeccion == null) {
      _date = new Date(Date.now());
    } else {
      _date = new Date(Date.parse(inspeccion_cabecera[0].fecha_inspeccion));
    }
    var ddl = inspeccion_cabecera[0];
    var formData = {
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
            : current_datetime.toISOString(),
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
    var data = {
      cod: inspection.cod_inspeccion!,
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
                JSON.parse(inspeccion_cabecera[0].cubierta_tech_val).join(',') +
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
          it.items = JSON.stringify(
            JSON.parse(it.items).map((its: any) => {
              var precio = 0;
              if (formData.formTipoInmueble.tipo_zona == 'urbana') {
                precio = its.precio_urbano;
              }
              if (formData.formTipoInmueble.tipo_zona == 'rural') {
                precio = its.precio_rural;
              }
              if (formData.formTipoInmueble.tipo_zona == 'especial') {
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
                monto_partida: this.montoPartida(formData, its, {
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
    console.log('Data a enviar:', data);
    if (true) {
      console.log('Enviar inspección al servidor');
      const loadingSave = await this.loadingCtrl.create({
        message: 'Guardando inspección en el servidor...',
        spinner: 'crescent',
      });
      await loadingSave.present();
      // Mensaje de enviando inspeccion
      this.dashboardService.saveInspection(data).subscribe(
        async (data) => {
          loadingSave.dismiss();
          console.log(data);
          if (data.status == 200) {
            const loadingSync = await this.loadingCtrl.create({
              message: 'Sincronizando inspección...',
              spinner: 'crescent',
            });
            await loadingSync.present();
            await this.storage.run(
              `UPDATE inspecciones SET sync = -1, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${
                inspection.cod_inspeccion
              }'`
            );
            this.dashboardService
              .syncInspection(inspeccion[0].cod_inspeccion)
              .subscribe(
                async (response) => {
                  loadingSync.dismiss();
                  if (response.status == 200) {
                    const loadingPDF = await this.loadingCtrl.create({
                      message: 'Enviando PDF...',
                      spinner: 'crescent',
                    });
                    await loadingPDF.present();

                    console.log(response);
                    // Mensaje de Guardado con exito
                    var pdf = await this.generatePdf(inspection);
                    await this.storage.run(
                      `UPDATE inspecciones SET sync = 1, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${
                        inspection.cod_inspeccion
                      }'`
                    );
                    this.dashboardService
                      .sendPDF(inspeccion[0].cod_inspeccion, pdf)
                      .subscribe(
                        async (data) => {
                          loadingPDF.dismiss();
                          //Eliminar inspeccion en la bd local

                          await this.storage.run(
                            `UPDATE inspecciones SET sync = 2, updated_at = '${current_datetime.toISOString()}' WHERE cod_inspeccion = '${
                              inspection.cod_inspeccion
                            }'`
                          );

                          // Mensaje de ENviado con exito

                          const toast = await this.toastController.create({
                            message: 'Inspección enviada con éxito',
                            duration: 1500,
                            cssClass: 'toast-danssuger',
                            position: 'bottom',
                          });

                          await toast.present();
                          this.refresh();
                        },
                        async (error) => {
                          loadingPDF.dismiss();

                          const toast = await this.toastController.create({
                            message: 'No es posible enviar el PDF',
                            duration: 1500,
                            cssClass: 'toast-danger',
                            position: 'bottom',
                          });

                          await toast.present();
                        }
                      );
                  } else {
                    // Mensaje de Guardado con exito, pero no es posible enviarlo
                  }
                },
                async (error) => {
                  loadingSync.dismiss();
                  const toast = await this.toastController.create({
                    message: 'No es posible enviarlo al servidor',
                    duration: 1500,
                    cssClass: 'toast-danger',
                    position: 'bottom',
                  });

                  await toast.present();
                  // Mensaje de Guardado con exito, pero no es posible enviarlo
                }
              );
          } else {
            // Mensaje de Guardado con exito, pero no es posible enviarlo
          }
        },
        async (error) => {
          loadingSave.dismiss();
          console.log(error);
          const toast = await this.toastController.create({
            message: 'No es posible conectar con el servidor',
            duration: 1500,
            cssClass: 'toast-danger',
            position: 'bottom',
          });

          await toast.present();
          // Mensaje de Guardado con exito, pero no es posible enviarlo
          //window.location.href = '/inspections';
        }
      );
    }
  }
  async refresh() {
    try {
      //console.log('Iniciando refresh...');
      this.loading = true;

      // Buscar las inspecciones completadas
      //console.log('Consultando inspecciones locales...');
      var d = await this.storage.select('SELECT * FROM inspecciones');
      this.list = d;
      //console.log(this.list);
      //console.log('Inspecciones locales:', this.list);

      //console.log('Consultando inspecciones del servidor...');
      var result: any = await new Promise((resolve, reject) => {
        //console.log('Llamando a dashboardService.inspectionList()');
        this.dashboardService.inspectionList().subscribe({
          next: (data) => resolve(data),
          error: (error) => resolve([]),
        });
      });
      var data = result.data.list;
      //console.log('Inspecciones servidor:', data);

      var remove_inspections = this.list.filter(
        (item) =>
          data.filter((it: any) => it.cod_inspeccion == item.cod_inspeccion)
            .length == 0
      );
      var add_inspections = data.filter(
        (item: any) =>
          this.list.filter(
            (it: any) => it.cod_inspeccion == item.cod_inspeccion
          ).length == 0
      );

      //console.log('Inspecciones a eliminar:', remove_inspections);
      //console.log('Inspecciones a agregar:', add_inspections);

      for (var i = 0; i < remove_inspections.length; i++) {
        //console.log('Consultando inspecciones cabecera...');
        var d = await this.storage.select(
          `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${remove_inspections[i].cod_inspeccion}'`
        );
        if (d.length == 0) {
          // console.log("Eliminando inspección definitivamente...");
          var ad = await this.storage.run(
            `DELETE FROM inspecciones WHERE cod_inspeccion = '${remove_inspections[i].cod_inspeccion}'`
          );
        } else {
          //console.log("Marcando inspección como inválida...",d[0]);
          if (d[0].status != 'ACTIVE') {
            //console.log("La inspección ya está marcada como inválida. No se realizan cambios.");
          } else {
            //console.log("Inspeccion activa");
          }
          var dk = await this.storage.select(
            `UPDATE inspecciones_cabecera SET status = 'INVALID' WHERE cod_inspeccion = '${remove_inspections[i].cod_inspeccion}'`
          );
        }
      }
      //console.log('Agregando nuevas inspecciones...');
      for (var i = 0; i < add_inspections.length; i++) {
        var item = add_inspections[i];
        //console.log('Agregando inspección:', item);
        try {
          var d1 = await this.storage.insert('inspecciones', item);
          //   console.log('Inspección guardada:', item.cod_inspeccion);
        } catch (e) {
          // console.log('Error al guardar inspección:', e);
        }
      }

      //console.log('Actualizando lista local...');
      var d = await this.storage.select('SELECT * FROM inspecciones');
      this.list = d;
      this.filteredList = this.list;
      //console.log('Lista actualizada:', this.list);

      if (this.status_filter == 'pendientes') {
        this.filteredList = this.list.filter((item) => item.completed == 0);
        //console.log('Filtrando pendientes:', this.filteredList);
      }
      if (this.status_filter == 'finalizadas') {
        this.filteredList = this.list.filter((item) => item.completed == 1);
        //console.log('Filtrando finalizadas:', this.filteredList);
      }
      if (this.status_filter == 'por-enviar') {
        this.filteredList = this.list.filter((item) => item.sync == 0);
        //console.log('Filtrando por enviar:', this.filteredList);
      }
    } catch (e) {
      // console.log('Error en el proceso de sincronización:', e);
    }
    this.loading = false;
    console.log('Refresh finalizado.');
  }
  async PDF(inspection: any) {
    return Pdf.generate(this.storage, inspection.cod_inspeccion);
  }
  async generatePdf(inspection: any) {
    return new Promise(async (resolve, reject) => {
      const pdfMake: any = pdfMakeMain;
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      var doc = await this.PDF(inspection);

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
          resolve(data);
        });
    });
  }
  toggleFilter(s: string) {
    this.status_filter = s;
    console.log(s);
    if (s == 'pendientes') {
      this.filteredList = this.list.filter(
        (item) => item.completed == 0 && item.sync == 0
      );
    }
    if (s == 'finalizadas') {
      this.filteredList = this.list.filter(
        (item) => item.completed == 1 && item.sync == 2
      );
    }
    if (s == 'por-enviar') {
      this.filteredList = this.list.filter(
        (item) => item.completed == 1 && item.sync != 2
      );
    }
  }
  selectType(s: string) {
    this.type_filter = s;
    if (s == 'sin-numero') {
      this.filteredList = this.list.filter((item) => item.nro_carpeta == '');
    } else {
      this.filteredList = this.list;
    }
  }

  async create() {
    this.type_filter = 'asignadas';
    this.filteredList = this.list;
    await this.storage.insert('inspecciones', {
      nro_carpeta: '',
      cod_inspeccion: this.usuario + '_' + Date.now(),
      id_accion: '',
      numSiniestro: '',
      codCompania: '',
      nomCompania: '',
      fechaSiniestro: '',
      codInspector: '',
      nomInspector: '',
      rutInspector: '',
      telInspector: '',
      celInspector: '',
      emailInspector: '',
      nomAsegurado: '',
      rutAsegurado: '',
      fonosegurado: '',
      celularsegurado: '',
      emailasegurado: '',
      lugar: '',
      nomContratante: '',
      rutContratante: '',
      fonoContratante: '',
      celularContratante: '',
      emailContratante: '',
      nomLiquidador: '',
      emailLiquidador: '',
      telLiquidador: '',
      celLiquidador: '',
      ciudad: '',
      comuna: '',
      direccion_siniestro: '',
      datos_siniestro: '',
      id_tiposiniestro: '',
      nomTipoSiniestro: '',
      causa: 'Sismo',
      nombre_Contacto: ' ',
      fono_Contacto: '',
      rut_Contacto: '',
      email_contacto: '',
      valor_moneda: '',
      corredor: '',
      emailCorredor: '',
      monto_Asegurado: '',
      deducible: '',
      moneda_Poliza: '',
    });
    this.refresh();
  }

  async download(inspection: any) {
    const pdfMake: any = pdfMakeMain;
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const loading = await this.loadingCtrl.create({
      message: 'Generando PDF',
    });

    loading.present();
    var images = await this.storage.select(
      `SELECT * FROM inspections_media_files WHERE inspection_id = '${inspection.id}' AND filename LIKE 'IMG-%' AND selected = 1 `
    );
    var doc = await Pdf.generate(this.storage, inspection.cod_inspeccion);
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
      //.download();
      .getBuffer(async (buffer: any) => {
        let utf8 = new Uint8Array(buffer);
        let binaryArray = utf8.buffer;
        var d = await Pdf.getFilesystemAccess();
        if (d) {
          var dd = await write_blob({
            path: `charlestaylor/documents/${inspection.id}.pdf`,
            directory: Directory.Data,
            blob: new Blob([buffer]),
            fast_mode: true,
            recursive: true,
            on_fallback(error) {
              alert(error);
            },
          })
            .then(async () => {
              Filesystem.getUri({
                path: `charlestaylor/documents/${inspection.id}.pdf`,
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
