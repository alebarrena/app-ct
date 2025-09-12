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
    private loadingCtrl: LoadingController
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
              `UPDATE inspecciones_cabecera SET status = 'INVALID' WHERE cod_inspeccion = ${remove_inspections[i].cod_inspeccion}`
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
         var dd = await  this.dashboardService.desist(d[0].cod_inspeccion);
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
