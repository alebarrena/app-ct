import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
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
  IonCol,
  IonFab,
  IonFabButton,
  ModalController,
} from '@ionic/angular/standalone';
import {
  homeOutline,
  folderOpenOutline,
  newspaperOutline,
  gitMergeOutline,
  personOutline,
  chevronForwardOutline,
  settingsOutline,
  chevronBackOutline,
  searchOutline,
  refreshOutline,
  documentOutline,
  trashOutline,
  documentTextOutline,
  add,
  cameraOutline,
  cameraSharp,
  imagesOutline,
  chevronBack,
  chevronForward,
} from 'ionicons/icons';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { DashboardService } from '../../services/dashboard.service';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { Inspection } from 'src/app/models/inspection/inspection';
import { of, switchMap, timeInterval } from 'rxjs';
import { InspectionModulesComponent } from './widgets/inspection-modules/inspection-modules.component';
import { GeneralBackgroundComponent } from './widgets/general-background/general-background.component';
import { A11y, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperOptions } from 'swiper/types';
import { InsuredStoryComponent } from './widgets/insured-story/insured-story.component';
import { BuildingTypeComponent } from './widgets/building-type/building-type.component';
import { ContentDamageComponent } from './widgets/content-damage/content-damage.component';
import { AffectedSectorsComponent } from './widgets/affected-sectors/affected-sectors.component';
import { ToastController } from '@ionic/angular';
import { BuildingDamageComponent } from './widgets/building-damage/building-damage.component';
import {
  Camera,
  CameraResultType,
  CameraSource,
  GalleryPhotos,
} from '@capacitor/camera';
import { ImageViewerComponent } from 'src/app/widgets/image-viewer/image-viewer.component';
import { PageLayoutComponent } from 'src/app/widgets/page-layout/page-layout.component';
import { Geolocation, Position } from '@capacitor/geolocation';
import { SignaturesComponent } from './widgets/signatures/signatures.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/widgets/confirm-dialog/confirm-dialog.component';
import { DocumentImagesComponent } from './widgets/document-images/document-images.component';
import { DateValidator } from 'src/app/helpers/date-validator/date-validator';
import { PhotoDialogComponent } from 'src/app/widgets/photo-dialog/photo-dialog.component';
import { StateService } from 'src/app/state.service';
import * as pdfMakeMain from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Pdf } from 'src/app/helpers/pdf/pdf';
import { LoadingController } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import write_blob from 'capacitor-blob-writer';
import {
  FileOpener,
  FileOpenerOptions,
} from '@capacitor-community/file-opener';
import { LocalNotifications } from '@capacitor/local-notifications';

export const lengthValidator: ValidatorFn = (
  FormArray: AbstractControl
): ValidationErrors | null => {
  console.log('SECTORES AFECTADOS ', FormArray.value);
  if (FormArray.value.length > 0) return null;
  return { lengthValidator: true };
};

export const danosValidator: ValidatorFn = (
  FormArray: any
): ValidationErrors | null => {
  var flag = true;
  if (FormArray.value.length > 0) {
    for (var i = 0; i < FormArray.controls.length; i++) {
      flag = flag && FormArray.controls[i].invalid;
      if (FormArray.controls[i].invalid) {
      }
    }
  }
  if (flag) {
    return { danosValidator: true };
  } else {
    return null;
  }
};

export const contenidoValidator: ValidatorFn = (
  FormArray: AbstractControl
): ValidationErrors | null => {
  if (false) {
    return null;
  }
  return { contenidoValidator: true };
};

@Component({
  selector: 'app-inspection',
  templateUrl: './inspection.page.html',
  styleUrls: ['./inspection.page.scss'],
  standalone: true,
  imports: [
    IonCol,
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
    IonCol,
    InspectionModulesComponent,
    InsuredStoryComponent,
    BuildingTypeComponent,
    ContentDamageComponent,
    AffectedSectorsComponent,
    GeneralBackgroundComponent,
    BuildingDamageComponent,
    IonFab,
    IonFabButton,
    PageLayoutComponent,
    SignaturesComponent,
    ConfirmDialogComponent,
    DocumentImagesComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class InspectionPage implements OnInit, OnDestroy {
  id? = '';
  pdfObj: any = null;
  images: any = [];
  inspeccion: any;
  section: string = '';
  context: string = '';
  sync: boolean = false;
  synced: boolean = false;
  completed: boolean = false;
  inspection_status: string = 'ACTIVE';
  @ViewChild('swiperRef', { static: true })
  protected _swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  summary: boolean = false;
  page = 0;
  public config: SwiperOptions = {
    modules: [Navigation, Pagination, A11y, Mousewheel],
    spaceBetween: 0,
    navigation: false,
    injectStyles: [
      `:host {
    --swiper-pagination-top: 30px;
}
      :root {
        --swiper-pagination-bottom: auto;
    }
     .swiper-pagination-bullet {
    opacity: 1;
    transition: all 300ms;
    border-radius:5px;
    background-color:#E8E7EE;
}
 .swiper-pagination-bullet-active {
    background-color: #FF5E01;

}
    .swiper-horizontal>.swiper-pagination-bullets, .swiper-pagination-bullets.swiper-pagination-horizontal, .swiper-pagination-custom, .swiper-pagination-fraction{
      height:20px;
      pointer-events:none;
      margin-top: -30px;
    }
      .swiper-button-prev, .swiper-rtl .swiper-button-next {
    left: var(--swiper-navigation-sides-offset, 10px);
    right: auto;
    width: 10px;
    top: 10px;
}

.swiper-button-next, .swiper-rtl .swiper-button-prev {
    right: var(--swiper-navigation-sides-offset, 10px);
    left: auto;
    width: 10px;
    top: 10px;
}
      `,
    ],
    pagination: {
      clickable: false,
    },
    freeMode: false,
    centeredSlides: true,
    mousewheel: false,
    scrollbar: false,
    allowTouchMove: false,
    on: {
      init: function (swiper) {},
    },
  };
  formSearch = new FormGroup({
    term: new FormControl('', []),
  });

  current_date: Date = new Date(Date.now());
  pages = [
    'general-background',
    'insured-story',
    'building-type',
    'affected-sectors',
    'building-damage',
    'content-damage',
    'document-images',
    'signatures',
  ];
  sections = [
    { title: 'Módulos de la inspección', tag: 'mo_modulos' },
    { title: 'Antecedentes Generales', tag: 'mo_ag' },
    { title: 'Relato de asegurado', tag: 'mo_ra' },
    { title: 'Tipo de Edificación', tag: 'ma_te' },
    { title: 'Sectores Afectados', tag: 'ma_sa' },
    { title: 'Daños del Edificio', tag: 'ma_de' },
    { title: 'Daños de Contenidos', tag: 'ma_dc' },
    { title: 'Seleccion de Imagenes', tag: 'si_seleccion' },
    { title: 'Firma y envio a inspeccion', tag: 'ma_fe' },
  ];
  data?: Inspection;
  selected = false;
  current_datetime = new Date();
  form = new FormGroup({
    id_accion: new FormControl('', []), //--CREAR,ACTUALIZAR
    cod_inspeccion: new FormControl('', []), //cod_inspeccion
    latitud: new FormControl('', []), //// Capturar
    longitud: new FormControl('', []), // Capturar
    total_imagenes: new FormControl('', []),
    inspector_nombre: new FormControl('', []), //nomInspector
    inspector_email: new FormControl('', []), //emailInspector
    inspector_fono: new FormControl('', []), //telInspector
    liquidador_email: new FormControl('', []), //emailLiquidador
    liquidador_fono: new FormControl('', []), //telLiquidador
    //"total_documentos": new FormControl("",[]),
    formAntecedentesGenerales: new FormGroup({
      datos_siniestro: new FormControl('', []),
      numSiniestro: new FormControl('', []), // Capturar
      detallesAsegurado: new FormGroup({
        fecha_inspeccion: new FormControl('', [Validators.required]), // Capturar
        nro_carpeta: new FormControl('', [Validators.required]), // Capturar
        asegurado_nombre: new FormControl('', [Validators.required]), //nomAsegurado
        asegurado_email: new FormControl('', [
          Validators.required,
          Validators.email,
        ]), //emailasegurado
        asegurado_fono: new FormControl('', [
          Validators.required,
          //Validators.pattern(/^\+\d{3}\s\d{4}\s\d{4}$/),
        ]), //fonosegurado
        //corredor: new FormControl('', [Validators.required]), //rutAsegurado
        asegurado_rut: new FormControl('', [Validators.required]), //rutAsegurado
        asegurado_ciudad: new FormControl('', [Validators.required]), //ciudad
        asegurado_comuna: new FormControl('', [Validators.required]), //comuna
        asegurado_aseguradora: new FormControl('', [Validators.required]), //nomCompania
        nomLiquidador: new FormControl('', [Validators.required]), //nomLiquidador
      }),
      datosSiniesto: new FormGroup({
        nomTipoSiniestro: new FormControl('', [Validators.required]), //nomTipoSiniestro
        tipo_siniestro: new FormControl('', []), //id_tiposiniestro
        //ubicacion: new FormControl('', [Validators.required]),
        destino: new FormControl('0', [Validators.required]), //Destino del siniestro ---->AGREGAR
        fechaSiniestro: new FormControl('', [
          Validators.required,
          DateValidator.LessThanToday,
        ]), //fechaSiniestro + horaSiniestro
        direccion_siniestro: new FormControl('', [Validators.required]),
      }),
      datosContacto: new FormGroup({
        contacto_nombre: new FormControl('', [Validators.required]), //nombre_Contacto
        //"contacto_rut": new FormControl("",[]),
        contacto_fono: new FormControl('', [
          Validators.required,
          //Validators.pattern(/^\+\d{3}\s\d{4}\s\d{4}$/),
        ]), //fono_Contacto
        //"contacto_mail": new FormControl("",[]), email_contacto  ---> REVISAR ENVIO
      }),
      datosEntrevistado: new FormGroup({
        entrevistadoNombre: new FormControl('', [Validators.required]), // Ingresar
        entrevistadoRelacion: new FormControl('', [Validators.required]), // Ingresar
      }),
      datosComunidad: new FormGroup({
        admin_mayor_domo: new FormControl('', []), // Ingresar
        telefono_comunidad: new FormControl('', []), // Ingresar -> No existe en el formulario --> REVISAR ENVIO
        email_comunidad: new FormControl('', [Validators.email]), // Ingresar -
        observaciones: new FormControl('', []), // Ingresar
      }),
    }),
    formRelatoAsegurado: new FormGroup({
      causa: new FormControl('', [Validators.required]), // causa
      //relato_asegurado: new FormControl('', [Validators.required]), // causa
      Contratante_Hechos: new FormControl('', [Validators.required]), // causa
    }),
    formTipoInmueble: new FormGroup({
      tipo_zona: new FormControl('urbana', [Validators.required]),
      Tipo_Inmueble1: new FormControl('', [Validators.required]),
      antiguedad: new FormControl('', [Validators.required]), // --> NUEVO CAMPO
      //"Tipo_Inmueble2": new FormControl("",[]),
      unidades_total: new FormControl('', []), //Suma de habitaciones
      nro_subterraneos: new FormControl('', []),
      superficie: new FormControl('', [Validators.required]),
      tipo_inmueble: new FormControl('', []),
      tiene_alarma: new FormControl('', []),
      tipo_alarma: new FormControl('', []),
      seguridadCamara: new FormControl('', []),
      seguridadAlarmaFunciona: new FormControl('', []),
      rejas_perimetral: new FormControl('', []),
      guardia_seguridad: new FormControl('', []),
      reja_primer_piso: new FormControl('', []),
      reja_segundo_piso: new FormControl('', []),
      n_pisos: new FormControl('', [Validators.required]),
      niveles: new FormControl('', [Validators.required]), //
      habitable: new FormControl(0, []), //
      menores: new FormControl('', []), //
      edificacionHabitable: new FormControl('', []),
      Contratante_Observaciones: new FormControl('', []), //--> DESCRIPCION RIESGO DEL ASEGUIRADO
      habitantesFamilias: new FormControl('', [Validators.required]),
      seguridadNombre: new FormControl('', []),
      seguridadvalor: new FormControl('', []),
      seguridadAlarmaNombre: new FormControl('', []),
      seguridadAlarmaValor: new FormControl('', []),
      seguridadProteccionesNombre: new FormControl('', []),
      seguridadProteccionesValor: new FormControl('', []),
      perimetrales_nomb: new FormControl('', []),
      perimetrales_val: new FormControl('', []),
      muros_interiores_nomb: new FormControl('', []),
      muros_interiores_val: new FormControl('', []),
      cubierta_tech_nomb: new FormControl('', []),
      cubierta_tech_val: new FormControl('', []),
      pav_interiores_nomb: new FormControl('', []),
      pav_interiores_val: new FormControl('', []),
      cielo_interiores_nomb: new FormControl('', []),
      cielo_interiores_val: new FormControl('', []),
      terminacion_int_nomb: new FormControl('', []),
      terminacion_int_val: new FormControl('', []),
      otras_inst_nomb: new FormControl('', []),
      otras_inst_val: new FormControl('', []),
    }),
    formSectoresAfectados: new FormArray<any>(
      [
        /*new FormGroup({
        nombre: new FormControl('', []),
        siniestrado: new FormControl('', []),
        descripcion: new FormControl('', []),
        Materialidad: new FormArray([]),
      }),*/
      ],
      [lengthValidator]
    ),
    formDanosDelEdificio: new FormArray<any>([], [Validators.required]),
    formDanosDelContenido: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),
    //"ubicacion": new FormControl("",[]),
    //"destino": new FormControl("",[]),
    //"sw_terceros": new FormControl("",[]), ---> SI ESTA AFECTADO TERCEROS
    //"unidad_policial": new FormControl("",[]), --> REVISAR ENVIO
    //"numero_parte": new FormControl("",[]), --> REVISAR ENVIO

    //"otra_causa": new FormControl("",[]),
    //"otros": new FormControl("",[]),
    //"fiscalia": new FormControl("",[]),
    //"bomberos": new FormControl("",[]),
    //"labora_policial": new FormControl("",[]),
    //"pertenece_condomi": new FormControl("",[]),
    //"Contratante_Observaciones": new FormControl("",[]),
    //"Parte_Otros": new FormControl("",[]),
    //"Parte_Observaciones": new FormControl("",[]),
    //"sol_antecedentes_nomb": new FormControl("",[]),
    //"sol_antecedentes_val": new FormControl("",[]),
    /*DANOS "roboNombreDenunciante": new FormControl("",[]),
    "roboRutDenunciante": new FormControl("",[]),
    "roboNumeroConstancia": new FormControl("",[]),
    "roboFechaConstancia": new FormControl("",[]),
    "antecedentesRelacionHechos": new FormControl("",[]),
    "antecedentesReporteAlarma": new FormControl("",[]),
    "antecedentesDetalleRobados": new FormControl("",[]),
    "antecedentesCotizacionRobados": new FormControl("",[]),
    "antecedentesPresupuestoConstruccion": new FormControl("",[]),
    "antecedetesDeclaracionJurada": new FormControl("",[]),
    "edificacionPisosEdificio": new FormControl("",[]),
    "edificacionPisoDepto": new FormControl("",[]),
    
    */

    //"otroSeguroExiste": new FormControl("",[]),
    //"otroSeguroCia": new FormControl("",[]),
  });
  /*form = new FormGroup({
    formGeneralBackground : new FormGroup({}),
    formInsuredStory : new FormGroup({}),
    formBuildingType : new FormGroup({}),
    formContentDamage : new FormGroup({}),
    formAffectedSectors : new FormGroup({
      sector_main_habitacion:new FormControl("",[]),
      sector_main_bano:new FormControl("",[]),
      sector_main_cocina:new FormControl("",[]),
      sector_main_living:new FormControl("",[]),
      sector_main_comedor:new FormControl("",[]),
      sector_main_logia:new FormControl("",[]),
      sector_secondary_piscina:new FormControl("",[]),
      sector_secondary_quincho:new FormControl("",[]),
      sector_secondary_sala:new FormControl("",[]),
      sector_secondary_bodega:new FormControl("",[]),
      sector_secondary_terraza:new FormControl("",[]),
      sector_secondary_garage:new FormControl("",[]),
    })
  });*/
  constructor(
    private dashboardService: DashboardService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    public modalController: ModalController,
    private dialog: MatDialog,
    private stateService: StateService,
    private loadingCtrl: LoadingController
  ) {
    this.route.paramMap.subscribe((data) => {
      this.context = '';
    });
  }
  ngOnDestroy(): void {
    this.selected = false;
  }
  updateForm(event: Event) {
    //console.log(event);
  }
  ngOnInit() {
    this.stateService.currentSummary.subscribe((state) => {
      this.summary = state;
    });
    this.route.paramMap.subscribe((data: any) => {
      this.selected = false;
      this.id = data.get('id')?.toString();
    });
    window.onhashchange = () => {
      if (window.location.hash != null && window.location.hash != '') {
        //console.log(window.location.hash);
        this.onSelected(window.location.hash.replace('#', ''));
      } else {
        this.selected = false;
      }
    };

    this.init();
  }
  async init() {
    var dkl = await this.storage.select(
      `SELECT * FROM inspecciones WHERE cod_inspeccion = '${this.id!.toString()}'`
    );
    if (dkl.length > 0) {
      if (dkl[0].completed) {
        this.completed = true;
      }
      if (dkl[0].sync) {
        this.synced = true;
      }
    }
    var s = await this.storage.select(
      `SELECT id,status FROM inspecciones_cabecera WHERE cod_inspeccion = '${this.id!.toString()}'`
    );
    if (true) {
      const swiperEl = this._swiperRef!.nativeElement;
      Object.assign(swiperEl, this.config);

      swiperEl.initialize();

      if (this.swiper) this.swiper.currentBreakpoint = false; // Breakpoint fixes
      this.swiper = this._swiperRef!.nativeElement.swiper;

      this.swiper!.off('slideChange');
      this.swiper!.off('init');
      this.swiper!.on('slideChange', (swiper) => {
        // Any change subsciption you wish
        this.page = swiper.realIndex + 1;
      });

      this.selected = false;

      var d = await this.storage.select(
        `SELECT * FROM inspecciones WHERE cod_inspeccion = '${this.id!.toString()}'`
      );
      var dk = await this.storage.select(
        `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${this.id!.toString()}'`
      );
      // No guardado
      this.data = d[0];
      if (dk.length == 0) {
        var created_at = new Date().toISOString();
        var item = d[0];
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
          created_at: created_at,
          updated_at: created_at,
        };
        console.log(data);
        await this.storage.insert('inspecciones_cabecera', data);
        dk = await this.storage.select(
          `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${this.id!.toString()}'`
        );

        try {
          this.dashboardService
            .logInspeccion(this.id!, created_at)
            .subscribe((data) => {
              console.log(data);
            });
        } catch (e) {
          console.log(e);
        }
      }
      var ddl = dk[0];
      console.log(dk);
      var cd = new Date();
      var current_date = `${cd.getFullYear()}-${(cd.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${cd.getDate().toString().padStart(2, '0')} ${cd
        .getHours()
        .toString()
        .padStart(2, '0')}:${cd.getMinutes().toString().padStart(2, '0')}`;

      var d = await this.storage.select(
        `SELECT * FROM inspections_danos WHERE inspection_id = '${this.id}'`
      );
      var d1 = await this.storage.select(
        `SELECT * FROM inspections_danos WHERE inspection_id = '${this.id}'`
      );
      if (ddl.fechaSiniestro.includes('/')) {
        var fechaSiniestro = ddl.fechaSiniestro.split('/').reverse().join('-');
        ddl.fechaSiniestro = fechaSiniestro;
      }
      this.form.patchValue({
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
      });
      for (var i = 0; i < d.length; i++) {
        this.form.controls.formSectoresAfectados.push(
          new FormGroup({
            id: new FormControl(''),
            key: new FormControl(''),
            nombre: new FormControl('', []),
            items: new FormArray([], []),
            alto: new FormControl('', []),
            ancho: new FormControl('', []),
            largo: new FormControl('', []),
            dscto_pv: new FormControl('', []),
            descripcion: new FormControl('', []),
          })
        );
      }
      for (var i = 0; i < d1.length; i++) {
        this.form.controls.formDanosDelEdificio.push(
          new FormGroup({
            alto: new FormControl(d1[i].alto, [Validators.required]),
            ancho: new FormControl(d1[i].ancho, [Validators.required]),
            largo: new FormControl(d1[i].largo, [Validators.required]),
            descripcion: new FormControl(''),
            dscto_pv: new FormControl(d1[i].dscto_pv),
            id: new FormControl(d1[i].id, [Validators.required]),
            inspection_id: new FormControl(d1[i].inspection_id, [
              Validators.required,
            ]),
            items: new FormControl(d1[i].items, [Validators.required]),
            key: new FormControl(''),
            label: new FormControl('', []),
            nombre: new FormControl(d1[i].nombre, [Validators.required]),
            siniestrado: new FormControl(d1[i].siniestrado, []),
          })
        );
      }
      if (this.form.controls.formSectoresAfectados.valid) {
        this.form.controls.formDanosDelContenido.setValue(1);
      }
      //console.log(d)

      /*if (d != null) {
      this.data = d;
    }*/
      if (window.location.hash != null && window.location.hash != '') {
        //console.log(window.location.hash);
        this.onSelected(window.location.hash.replace('#', ''));
      }
      this.fetchImages();
    }

    if (s.length > 0) {
      this.inspection_status = s[0].status;

      if (s[0].status == 'CANCELLED') {
        this.section = this.inspection_status;
      }
    }

    try {
      Geolocation.getCurrentPosition().then((coordinates) => {
        if (this.form.value.latitud == null) {
          this.form.controls.latitud.setValue(
            coordinates.coords.latitude.toString()
          );
          this.form.controls.longitud.setValue(
            coordinates.coords.longitude.toString()
          );
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  async presentToast(msg: any, cl: any) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      duration: 1000,
      cssClass: cl,
    });
    toast.present();
  }
  onSubmit(event: Event) {}

  onSelected(event: any) {
    if (event != null) {
      this.selected = true;
    }
    window.location.hash = event;
    this.section = event;
    if (event == 'general-background') this.swiper!.slideTo(0);
    if (event == 'insured-story') this.swiper!.slideTo(1);
    if (event == 'building-type') this.swiper!.slideTo(2);
    if (event == 'affected-sectors') this.swiper!.slideTo(3);
    if (event == 'building-damage') this.swiper!.slideTo(4);
    if (event == 'content-damage') this.swiper!.slideTo(5);
    if (event == 'document-images') this.swiper!.slideTo(6);
    if (event == 'signatures') this.swiper!.slideTo(7);
  }

  back() {
    this.router.navigateByUrl('/');
  }
  backSection() {
    if (this.swiper!.realIndex == 0) {
      this.selected = false;
      window.location.hash = '';
      this.section = '';
    }
    if (this.swiper!.realIndex > 0)
      this.onSelected(this.pages[this.swiper!.realIndex - 1]);
  }
  removeEmpty(object: any) {
    var results: any = {};
    for (const key in object) {
      if (
        object[key] !== undefined &&
        object[key] !== null &&
        object[key] !== ''
      ) {
        results[key] = object[key];
      }
    }
    return results;
  }
  async nextSection() {
    Object.keys(this.form.controls).forEach((field) => {
      const control: any = this.form.get(field);
      if (control!.invalid) {
        console.error('Error en el campo:', field);
      }
    });
    var flag = false;
    if (true) {
      this.form.markAllAsTouched();
      if (this.pages[this.swiper!.realIndex] == 'general-background') {
        Object.keys(
          this.form.controls.formAntecedentesGenerales.controls
        ).forEach((field) => {
          const control: any =
            this.form.controls.formAntecedentesGenerales.get(field);
          if (control!.invalid) {
            // Mostrar el mensaje de error correspondiente
            if (control.controls != null) {
              Object.keys(control!.controls).forEach((fiedsld) => {
                const crl = control.get(fiedsld);
                if (crl!.invalid) {
                  // Mostrar el mensaje de error correspondiente
                  console.error('Error en el campo:', fiedsld);
                }
              });
            }
            console.error('Error en el campo:', field);
          }
        });
        if (this.form.controls.formAntecedentesGenerales.valid) {
          flag = true;
        } else {
          this.presentToast('Debes completar los datos', 'toast-danger');
        }
      }
      if (this.pages[this.swiper!.realIndex] == 'insured-story') {
        if (this.form.controls.formRelatoAsegurado.valid) {
          flag = true;
        } else {
          this.presentToast('Debes completar los datos', 'toast-danger');
        }
      }
      if (this.pages[this.swiper!.realIndex] == 'building-type') {
        Object.keys(this.form.controls.formTipoInmueble.controls).forEach(
          (field) => {
            const control: any = this.form.controls.formTipoInmueble.get(field);
            if (control!.invalid) {
              console.error('Error en el campo:', field);
            }
          }
        );
        if (this.form.controls.formTipoInmueble.valid) {
          flag = true;
        } else {
          this.presentToast('Debes completar los datos', 'toast-danger');
        }
      }
      if (this.pages[this.swiper!.realIndex] == 'affected-sectors') {
        var affe = await this.storage.select(
          `SELECT * FROM inspections_danos WHERE inspection_id = '${this.id}'`
        );
        if (affe.length > 0) {
          flag = true;
        } else {
          this.presentToast(
            'Debes seleccionar al menos un sector',
            'toast-danger'
          );
        }
      }
      if (this.pages[this.swiper!.realIndex] == 'building-damage') {
        console.log(this.form.controls.formDanosDelEdificio.value);
        flag = false;
        var bdd = await this.storage.select(
          `SELECT * FROM inspections_danos WHERE inspection_id = '${this.id}'`
        );
        if (bdd.length > 0) {
          var flag1 = false;
          for (var i = 0; i < bdd.length; i++) {
            flag1 = false;
            var dl =
              bdd[i].items != null && bdd[i].items != ''
                ? JSON.parse(bdd[i].items)
                : [];
            if (dl.length > 0) {
              flag1 = true;
            }
          }
          if (flag1) {
            flag = true;
          } else {
            this.presentToast(
              'Debes definir al menos un daño en cada sector seleccionado',
              'toast-danger'
            );
          }
        } else {
          this.presentToast('Debes definir al menos un sector', 'toast-danger');
        }
      }
      if (this.pages[this.swiper!.realIndex] == 'content-damage') {
        flag = true; //this.form.controls.formDanosDelEdificio.invalid;
      }
      if (this.pages[this.swiper!.realIndex] == 'document-images') {
        var ds = await this.storage.select(
          `SELECT * FROM inspections_media_files WHERE inspection_id = '${this.id}' AND filename LIKE 'IMG-%' AND selected = 1 `
        );

        var ds1 = await this.storage.select(
          `SELECT COUNT(*) as total FROM inspections_media_files WHERE inspection_id = '${this.id}' AND filename LIKE '%Fachada%' AND selected = 1 `
        );

        if (ds.length > 0 && ds1[0].total > 0) {
          flag = true;
        } else {
          this.presentToast(
            'Debes seleccionar al menos una imagen en cada sector declarado',
            'toast-danger'
          );
        }
      }
      if (flag) {
        for (
          var i = 0;
          i < this.form.controls.formSectoresAfectados.value.length;
          i++
        ) {
          var ddf: any = this.form.controls.formSectoresAfectados.value[i];
          var data = {
            ...this.form.controls.formSectoresAfectados.value[i],
            items:
              this.form.controls.formSectoresAfectados.value[i] != null
                ? JSON.stringify(
                    this.form.controls.formSectoresAfectados.value[i].items
                  )
                : null,
          };
          delete data['id'];
          if (
            this.form.controls.formSectoresAfectados.value[i] != null &&
            !this.completed
          ) {
            await this.storage.run(
              `UPDATE inspections_danos SET alto='${ddf.alto ?? 0}', ancho='${
                ddf.ancho ?? 0
              }', dscto_pv='${ddf.dscto_pv ?? 0}',largo='${
                ddf.largo ?? 0
              }' WHERE inspection_id = '${this.id}' AND key = '${
                ddf.key
              }' AND nombre = '${ddf.nombre}' `
            );
          }
        }
        var dd = {
          latitud: this.form.value.latitud,
          longitud: this.form.value.longitud,
          ...this.form.value.formAntecedentesGenerales?.detallesAsegurado,
          ...this.form.value.formAntecedentesGenerales?.datosContacto,
          ...this.form.value.formAntecedentesGenerales?.datosEntrevistado,
          ...this.form.value.formAntecedentesGenerales?.datosSiniesto,
          ...this.form.value.formAntecedentesGenerales?.datosComunidad,
          ...this.form.value.formRelatoAsegurado,
          ...this.form.value.formTipoInmueble,
        };

        console.log('ABC', {
          latitud: this.form.value.latitud,
          longitud: this.form.value.longitud,
          ...this.form.value.formAntecedentesGenerales?.detallesAsegurado,
          ...this.form.value.formAntecedentesGenerales?.datosContacto,
          ...this.form.value.formAntecedentesGenerales?.datosEntrevistado,
          ...this.form.value.formAntecedentesGenerales?.datosSiniesto,
          ...this.form.value.formAntecedentesGenerales?.datosComunidad,
          ...this.form.value.formRelatoAsegurado,
          ...this.form.value.formTipoInmueble,
        });
        if (!this.completed) {
          var d = await this.storage.update(
            'inspecciones_cabecera',
            `cod_inspeccion = '${this.id}'`,
            this.removeEmpty(dd)
          );
          this.presentToast(
            'Los cambios ha sido guardados exitosamente',
            'toast-success'
          );
        } else {
          /*this.presentToast(
            'La inspeccion ya ha sido enviada, no es posible guardar las modificaciones',
            'toast-danger'
          );*/
        }
        // console.log(d);
        if (this.swiper!.slides.length > this.swiper!.realIndex + 1)
          this.onSelected(this.pages[this.swiper!.realIndex + 1]);
        //this.swiper?.slideNext();
      }
    }
  }
  selectedImageContext(context: any) {
    this.context = context;
  }
  async generatePdf() {
    return new Promise(async (resolve, reject) => {
      const pdfMake: any = pdfMakeMain;
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      var doc = await Pdf.generateCancelled(this.storage, this.id);

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
    var doc = await Pdf.generateCancelled(this.storage, this.id);
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
  dialogDesestimiento() {
    var d = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar desestimiento',
        message: 'Confirma Desestimiento, esta accion no puede deshacerse',
        title_tag: 'de_titulo',
        message_tag: 'de_descripcion',
        success_button: 'de_si',
        cancel_button: 'de_no',
      },
    });
    d.afterClosed().subscribe(async (item) => {
      if (item) {
        this.dashboardService.desestimiento(this.id).then(async (data: any) => {
          if (data) {
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

            var _date;
            if (inspeccion_cabecera[0].fecha_inspeccion == null) {
              _date = new Date(Date.now());
            } else {
              _date = new Date(
                Date.parse(inspeccion_cabecera[0].fecha_inspeccion)
              );
            }

            var ds = await this.storage.select(
              `SELECT * FROM inspecciones WHERE cod_inspeccion = '${this.id!.toString()}'`
            );
            // No guardado
            if (ds[0].sync == -1) {
              const loading_ = await this.loadingCtrl.create({
                message: 'Enviando inspección desetimada.',
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
                      message: 'La inspeccion ha sido desestimada',
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

              var dka = {
                cod: this.id!,
                data: {
                  inspeccion: inspeccion[0],
                  inspeccion_cabecera: {
                    ...inspeccion_cabecera[0],
                    admin_mayor_domo: '',
                    antecedentesCotizacionRobados: '',
                    antecedentesDetalleRobados: '',
                    antecedentesPresupuestoConstruccion: '',
                    antecedentesRelacionHechos: '',
                    antecedentesReporteAlarma: '',
                    antecedetesDeclaracionJurada: '',
                    antiguedad: '',

                    fecha_inspeccion: `${_date.getFullYear()}-${(
                      _date.getMonth() + 1
                    )
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
                    numero_parte: inspeccion_cabecera[0].n_parte,
                    bomberos: inspeccion_cabecera[0].cuerpo_bombero,
                    causa: '',
                    tiene_alarma: '',
                    seguridadCamara: '0',
                    tipo_inmueble: inspeccion_cabecera[0].Tipo_Inmueble1,
                    menores: inspeccion_cabecera[0].menores,
                    guardia_seguridad: '0',
                    reja_primer_piso: '',
                    reja_segundo_piso: '',
                    seguridadNombre: inspeccion_cabecera[0].seguridadnombre,
                    seguridadnombre: '()',
                    seguridadvalor: '[]',
                    seguridadAlarmaNombre: '()',
                    seguridadAlarmaValor: '[]',
                    muros_interiores_nomb: '()',
                    muros_interiores_val: '[]',
                    seguridadProteccionesNombre: '()',
                    seguridadProteccionesValor: '[]',

                    cubierta_tech_nomb:
                      inspeccion_cabecera[0].cubierta_tech_val != null
                        ? '(' +
                          JSON.parse(
                            inspeccion_cabecera[0].cubierta_tech_val
                          ).join(',') +
                          ')'
                        : '()',
                    cubierta_tech_val:
                      inspeccion_cabecera[0].cubierta_tech_val != null
                        ? JSON.stringify(
                            JSON.parse(
                              inspeccion_cabecera[0].cubierta_tech_val
                            ).map((item: any) => 1)
                          )
                        : '[]',
                    otras_inst_nomb:
                      inspeccion_cabecera[0].otras_inst_val != null
                        ? '(' +
                          JSON.parse(
                            inspeccion_cabecera[0].otras_inst_val
                          ).join(',') +
                          ')'
                        : '()',
                    otras_inst_val:
                      inspeccion_cabecera[0].otras_inst_val != null
                        ? JSON.stringify(
                            JSON.parse(
                              inspeccion_cabecera[0].otras_inst_val
                            ).map((item: any) => 1)
                          )
                        : '[]',
                    pav_interiores_nomb:
                      inspeccion_cabecera[0].pav_interiores_val != null
                        ? '(' +
                          JSON.parse(
                            inspeccion_cabecera[0].pav_interiores_val
                          ).join(',') +
                          ')'
                        : '()',
                    pav_interiores_val:
                      inspeccion_cabecera[0].pav_interiores_val != null
                        ? JSON.stringify(
                            JSON.parse(
                              inspeccion_cabecera[0].pav_interiores_val
                            ).map((item: any) => 1)
                          )
                        : '[]',
                    terminacion_int_nomb:
                      inspeccion_cabecera[0].terminacion_int_val != null
                        ? '(' +
                          JSON.parse(
                            inspeccion_cabecera[0].terminacion_int_val
                          ).join(',') +
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
                  created_at: inspeccion_cabecera[0].created_at,
                  updated_at: new Date().toISOString(),
                },
              };

              this.dashboardService.saveInspection(dka).subscribe(
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
                                  const toast =
                                    await this.toastController.create({
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
            this.section = 'CANCELLED';
            this.inspection_status = 'CANCELLED';
            //this.init();
          }
        });
      } else {
      }
    });
  }
  dialogMedia() {
    var d = this.dialog.open(PhotoDialogComponent);
    d.afterClosed().subscribe((item) => {
      d.close();
      if (item == 'CAMERA') {
        this._takePhoto();
      }
      if (item == 'GALLERY') {
        this.takePhotos();
      }
    });
  }
  generateFromImage(
    img: any,
    MAX_WIDTH: number = 700,
    MAX_HEIGHT: number = 700,
    quality: number = 0.9
  ) {
    return new Promise((resolve, reject) => {
      var canvas: any = document.createElement('canvas');
      var image = new Image();
      image.onload = () => {
        var width = image.width;
        var height = image.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0, width, height);

        // IMPORTANT: 'jpeg' NOT 'jpg'
        var dataUrl = canvas.toDataURL('image/jpeg', quality);

        resolve(dataUrl);
      };
      image.src = img;
    });
  }

  async takePhotos() {
    const MAX_WIDTH = 100;
    const MAX_HEIGHT = 100;
    var images: GalleryPhotos = await Camera.pickImages({
      quality: 90,
    });
    for (var i = 0; i < images.photos.length; i++) {
      var image: any = await new Promise((resolve, _) => {
        fetch(images.photos[i].webPath!)
          .then((res) => res.blob())
          .then(async (blob) => {
            var image = new Image();
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
              var d: any = await this.generateFromImage(
                'data:image/' +
                  images.photos[i].format +
                  ';base64,' +
                  reader.result?.toString().split(',')[1]
              );
              resolve({
                base64String: d.split(',')[1],
                format: images.photos[i].format,
                thumbnail_media: d,
              });
            };
          });
      });
      var context = 'Fachada';
      if (this.context != '') {
        context = this.context;
      }
      var filename =
        `IMG-${context}-${this.images.length}-${Date.now()}.` + image.format;
      await this.storage.insert('inspections_media_files', {
        inspection_id: this.id,
        filename: filename,
        mime_type: `image/${image.format}`,
        base64: image.base64String,
        thumbnail_media: image.thumbnail_media,
      });
    }
    this.fetchImages();
  }
  async _takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      source: CameraSource.Camera,
      resultType: CameraResultType.Base64,
      promptLabelCancel: 'Cancelar',
      promptLabelHeader: 'Tomar foto',
      promptLabelPicture: 'Desde la camara',
      promptLabelPhoto: 'Desde la galeria',
    });
    var d: any = await this.generateFromImage(
      'data:image/' + image.format + ';base64,' + image.base64String
    );
    //console.log(image)
    var context = 'Fachada';
    if (this.context != '') {
      context = this.context;
    }
    var filename =
      `IMG-${context}-${this.images.length}-${Date.now()}.` + image.format;
    await this.storage.insert('inspections_media_files', {
      inspection_id: this.id,
      filename: filename,
      mime_type: `image/${image.format}`,
      base64: d.split(',')[1],
      thumbnail_media: d,
    });
    this.fetchImages();
    this.images.push({ ...image, name: 'IMAGEN-' + this.images.length });
  }
  async fetchImages() {
    var d = await this.storage.select(
      `SELECT * FROM inspections_media_files WHERE mime_type LIKE 'image/%' AND inspection_id = '${this.id}' AND filename LIKE 'IMG-%'`
    );
    this.images = d;
  }
  async removeImage(img: any) {
    var dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar imagen',
        title_tag: 'delete_image',
        message: '¿Deseas eliminar la imagen?',
        message_tag: 'delete_medssage_dialog',
      },
    });
    dialogRef.afterClosed().subscribe(async (action: any) => {
      if (action == true) {
        await this.storage.run(
          'DELETE FROM inspections_media_files WHERE id = ' + img.id
        );
      }
      this.fetchImages();
    });
  }
  async openImage(image: any) {
    const modal = await this.modalController.create({
      component: ImageViewerComponent,
      componentProps: {
        image: image,
      },
      cssClass: 'ion-img-viewer', // required
      keyboardClose: true,
      showBackdrop: true,
    });

    return await modal.present();
  }
  formatCurrency(val: any) {
    if (isNaN(parseFloat(val))) return '--';
    return parseFloat(val).toLocaleString('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  goToExpenses(): void {
    // TODO: Implement navigation or logic for "Gastos"
    this.router.navigate(['/inspection', this.id, 'expenses']);
  }
}
