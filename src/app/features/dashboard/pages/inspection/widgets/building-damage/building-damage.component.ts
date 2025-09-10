import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  IonTextarea,
  IonCard,
  IonItem,
  IonAccordionGroup,
  IonAccordion,
  IonGrid,
  IonRow,
  IonButton,
  IonIcon,
  IonList,
  IonLabel,
  IonInput,
  IonCol,
  IonFab,
  ModalController,
  IonFabButton,
} from '@ionic/angular/standalone';
import { IncrementalComponent } from '../../../../../../widgets/incremental/incremental.component';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ToastController } from '@ionic/angular';
import { ConfirmDialogComponent } from 'src/app/widgets/confirm-dialog/confirm-dialog.component';
import { ImageViewerComponent } from 'src/app/widgets/image-viewer/image-viewer.component';
import { Calculator } from 'src/app/helpers/calculator/calculator';
import { MaterialDialogComponent } from 'src/app/features/dashboard/dialogs/material-dialog/material-dialog.component';
import { DeleteDialogComponent } from 'src/app/features/dashboard/dialogs/delete-dialog/delete-dialog.component';
import { StateService } from 'src/app/state.service';

@Component({
  selector: 'app-building-damage',
  templateUrl: './building-damage.component.html',
  styleUrls: ['./building-damage.component.scss'],
  imports: [
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonInput,
    IonTextarea,
    IonIcon,
    CommonModule,
    IncrementalComponent,
    IncrementalComponent,
    IonCard,
    IonList,
    IonLabel,
    IonItem,
    FormsModule,
    ReactiveFormsModule,
    TranslationPipe,
    IonAccordionGroup,
    IonAccordion,
    IonFab,
    IonFabButton,
  ],
  standalone: true,
})
export class BuildingDamageComponent implements OnInit {
  @Input('formGroup') formGroup?: any;
  @Input('completed') completed?: any;
  @Output('onUpdated') onUpdated = new EventEmitter();
  results: any = [];
  id: any;
  open_piso = false;
  open_cielo = false;
  open_muros = false;
  materiales: any = [];
  current: any;
  control: any;
  totals: any = [];
  summary: boolean = true;
  damageForm: any = new FormGroup({
    id: new FormControl('', []),
    id_material: new FormControl('', [Validators.required]),
    id_tipo_material: new FormControl('', [Validators.required]),
    material: new FormControl('', [Validators.required]),
    precio_especial: new FormControl('', [Validators.required]),
    precio_rural: new FormControl('', [Validators.required]),
    precio_urbano: new FormControl('', [Validators.required]),
    sugerido: new FormControl('', []),
    tipo_material: new FormControl('', []),
    unidad: new FormControl('', []),
    cantidad: new FormControl(1, [Validators.required]),
    superficie: new FormControl(0, []),
    adicional: new FormControl('0', []),

    largo: new FormControl('', []),
    altura: new FormControl('', []),
    ancho: new FormControl('', []),
    dscto_pv: new FormControl('', []),
    descripcion: new FormControl('', []),
  });
  sectionSelected: any = null;
  @Input('images') images: any = [];
  @Output('onImageUpdate') onImageUpdate = new EventEmitter();
  @Output('onSelected') onSelected = new EventEmitter();

  sections = [
    {
      label: 'Pisos',
      id_tipo_material: 1,
      tag: 'bd_pisos',
      dano: '% de daño',
      tag_dano: 'db_dano_piso',
    },
    {
      label: 'Muros',
      tag: 'bd_muros',
      id_tipo_material: 2,
      dano: '% de daño',
      tag_dano: 'db_dano_muros',
    },
    {
      label: 'Cielo',
      tag: 'bd_cielo',
      id_tipo_material: 3,
      dano: '% de daño',
      tag_dano: 'db_dano_cielo',
    },
    {
      label: 'Otros',
      tag: 'bd_otros',
      id_tipo_material: 4,
      dano: '% de daño',
      tag_dano: 'db_dano_otros',
    },
  ];
  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private dialog: MatDialog,
    public modalController: ModalController,
    private stateService: StateService
  ) {
    this.stateService.currentSummary.subscribe((state) => {
      this.summary = state;
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((data: any) => {
      this.id = data.get('id')?.toString();
      this.init();
    });
  }

  async init() {
    var dk = await this.storage.select('SELECT * FROM materiales');
    this.materiales = dk;
    var dk2 = await this.storage.select('SELECT * FROM materialidades');
    var d = await this.storage.select(
      `SELECT * FROM inspections_danos WHERE inspection_id = '${this.id}'`
    );
    var types: any = {};
    this.formGroup.controls.formSectoresAfectados = new FormArray([]);
    for (var i = 0; i < d.length; i++) {
      types[d[i].nombre] =
        types[d[i].nombre] != null ? types[d[i].nombre] + 1 : 1;
      var dqe: any = new FormArray<any>([], [Validators.required]);
      var dl =
        d[i].items != null && d[i].items != '' ? JSON.parse(d[i].items) : [];
      for (var j = 0; j < dl.length; j++) {
        var ggp = new FormGroup({
          id: new FormControl('', []),
          id_material: new FormControl('', []),
          id_tipo_material: new FormControl('', []),
          material: new FormControl('', []),
          precio_especial: new FormControl('', []),
          precio_rural: new FormControl('', []),
          precio_urbano: new FormControl('', []),
          sugerido: new FormControl('', []),
          tipo_material: new FormControl('', []),
          unidad: new FormControl('', []),
          cantidad: new FormControl(1, []),
          adicional: new FormControl('0', []),

          descripcion: new FormControl('', []),
        });
        ggp.patchValue(dl[j]);
        dqe.push(ggp);
      }
      dqe.patchValue(dl);
      /*for(var j=0;j<dl.length;j++){
          var group = new FormGroup({},[])
          group.patchValue({
            id: '',
            id_material: '',
            id_tipo_material: '',
            material: '',
            precio_especial: '',
            precio_rural: '',
            precio_urbano: '', 
            sugerido: '',
            tipo_material: '',
            unidad: '',
          });
        }
        dqe.push(new FormGroup("",[]));*/
      this.formGroup.controls.formSectoresAfectados.push(
        new FormGroup({
          id: new FormControl(d[i].id),
          key: new FormControl(d[i].key),
          nombre: new FormControl(d[i].nombre || '', []),
          sugeridos_enabled: new FormControl(d[i].sugeridos_enabled, []),
          items: dqe,
          alto: new FormControl(d[i].alto, [Validators.required]),
          ancho: new FormControl(d[i].ancho, [Validators.required]),
          largo: new FormControl(d[i].largo, [Validators.required]),
          dscto_pv: new FormControl(d[i].dscto_pv, []),
          descripcion: new FormControl(d[i].descripcion, []),
        })
      );
      if (i == 0) {
        this.selectItem(
          this.formGroup.controls.formSectoresAfectados.controls[0],
          0
        );
      }
    }
  }
  async updateValues() {
    for (var i = 0; i < this.formGroup.controls.formSectoresAfectados.length; i++) {
      var sql = `UPDATE inspections_danos SET sugeridos_enabled='${
        this.control.value.sugeridos_enabled ?? '0'
      }', alto='${this.control.value.alto ?? 0}', ancho='${
        this.control.value.ancho ?? 0
      }', dscto_pv='${this.control.value.dscto_pv ?? 0}',largo='${
        this.control.value.largo ?? 0
      }', descripcion='${
        this.control.value.descripcion ?? ''
      }', items = '${JSON.stringify(
        this.control.controls.items.value
      )}' WHERE id = '${this.control.value.id}' `;
      console.log(sql)
      if (!this.completed) await this.storage.run(sql);
      this.damageForm.patchValue({
        id: '',
        id_material: '',
        id_tipo_material: '',
        material: '',
        precio_especial: '',
        precio_rural: '',
        precio_urbano: '',
        sugerido: '',
        tipo_material: '',
        superficie: '',
        unidad: '',
      });
      this.results = [];
      this.sectionSelected = null;
    }
    this.refresh();
  }
  async refresh() {
    var dk = await this.storage.select('SELECT * FROM materiales');
    this.materiales = dk;
    var dk2 = await this.storage.select('SELECT * FROM materialidades');
    var d = await this.storage.select(
      `SELECT * FROM inspections_danos WHERE inspection_id = '${this.id}'`
    );
    var types: any = {};
    this.formGroup.controls.formSectoresAfectados = new FormArray([]);
    this.formGroup.controls.formDanosDelEdificio = new FormArray([]);
    for (var i = 0; i < d.length; i++) {
      types[d[i].nombre] =
        types[d[i].nombre] != null ? types[d[i].nombre] + 1 : 1;
      var dqe: any = new FormArray<any>([], [Validators.required]);
      var dl =
        d[i].items != null && d[i].items != '' ? JSON.parse(d[i].items) : [];
      for (var j = 0; j < dl.length; j++) {
        var ggp = new FormGroup({
          id: new FormControl('', []),
          id_material: new FormControl('', []),
          id_tipo_material: new FormControl('', []),
          material: new FormControl('', []),
          precio_especial: new FormControl('', []),
          precio_rural: new FormControl('', []),
          precio_urbano: new FormControl('', []),
          sugerido: new FormControl('', []),
          tipo_material: new FormControl('', []),
          unidad: new FormControl('', []),
          cantidad: new FormControl(1, []),
          adicional: new FormControl('0', []),
          descripcion: new FormControl('', []),
        });
        ggp.patchValue(dl[j]);
        dqe.push(ggp);
      }
      dqe.patchValue(dl);
      this.formGroup.controls.formSectoresAfectados.push(
        new FormGroup({
          id: new FormControl(d[i].id),
          key: new FormControl(d[i].key),
          sugeridos_enabled: new FormControl(d[i].sugeridos_enabled),
          nombre: new FormControl(d[i].nombre || '', []),
          items: dqe,
          alto: new FormControl(d[i].alto, []),
          ancho: new FormControl(d[i].ancho, []),
          largo: new FormControl(d[i].largo, []),
          dscto_pv: new FormControl(d[i].dscto_pv, []),
          descripcion: new FormControl(d[i].descripcion, []),
        })
      );

      this.formGroup.controls.formDanosDelEdificio.push(
        new FormGroup({
          alto: new FormControl(d[i].alto, [Validators.required]),
          ancho: new FormControl(d[i].ancho, [Validators.required]),
          sugeridos_enabled: new FormControl(d[i].sugeridos_enabled),
          descripcion: new FormControl(''),
          dscto_pv: new FormControl(''),
          id: new FormControl(d[i].id, [Validators.required]),
          inspection_id: new FormControl(d[i].inspection_id, [
            Validators.required,
          ]),
          items: new FormControl(d[i].items, [Validators.required]),
          key: new FormControl(''),
          label: new FormControl('', []),
          largo: new FormControl(d[i].largo, [Validators.required]),
          nombre: new FormControl(d[i].nombre, [Validators.required]),
          siniestrado: new FormControl(d[i].siniestrado, []),
        })
      );
      this.onUpdated.emit();
    }
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
      this.onImageUpdate.emit();
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

  onChange(event: any) {
    this.results = this.materiales.filter(
      (item: any) =>
        item.material
          .toUpperCase()
          .includes(event.target.value.toUpperCase()) &&
        this.sectionSelected.id_tipo_material == item.id_tipo_material
    );
  }
  onSubmit(event: any) {}
  clearForm() {
    this.damageForm.patchValue({
      id: '',
      id_material: '',
      id_tipo_material: '',
      material: '',
      precio_especial: '',
      precio_rural: '',
      precio_urbano: '',
      sugerido: '',
      tipo_material: '',
      unidad: '',
    });
    this.results = [];
    this.sectionSelected = null;
  }

  icon(s: string) {
    if (s == 'Habitación') return 'bed-outline';
    if (s == 'Baños') return 'woman-outline';
    if (s == 'Cocina') return 'restaurant-outline';
    if (s == 'Living') return 'tv-outline';
    if (s == 'Comedor') return 'dining-table';
    if (s == 'Logia') return 'logia';
    if (s == 'Piscina') return 'waves';
    if (s == 'Quincho') return 'barbecue';
    if (s == 'Sala de estar') return 'game-controller-outline';
    if (s == 'Bodega') return 'box';
    if (s == 'Terraza') return 'terrace';
    if (s == 'Garage') return 'garage';
    if (s == 'Otros') return 'otros';
    if (s == 'Pasillo') return 'pasillo';
    return 'home-outline';
  }
  /*search = (term:string) =>{
    const resultados = this.results.filter((item:any) =>  item.material.toLowerCase().includes(term.toLowerCase()) );

    // Agrupar por tipo de producto
    const resultadosAgrupados = resultados.reduce((grupos:any, item:any) => {
        const grupo = grupos.get(item.id_tipo_materialidad) || new Map();
        grupo.set(item.materialidad, item);
        grupos.set(item.product_type, grupo);
        return grupos;
    }, new Map());

    return resultadosAgrupados;
}*/

  async selectItem(item: any, index: number) {
    this.control = item;
    this.current = item.value.nombre + '-' + index;
    this.summary = false;
    this.onSelected.emit(this.current + '_');

    this.toggleSummaryFalse();

    //var d = await this.storage.select(`SELECT * FROM inspecciones_danos_materialidad WHERE inspection_dano_id = '${this.id}'`);
  }
  async anadirSugeridos() {
    var mm = this.materiales.filter((item: any) => item.sugerido == 'S');
    this.control.controls.sugeridos_enabled.setValue('1');
    for (var i = 0; i < mm.length; i++) {
      var size = this.control.value;
      this.control.controls.items.push(
        new FormGroup({
          id: new FormControl(mm[i].id, []),
          id_material: new FormControl(mm[i].id_material, []),
          id_tipo_material: new FormControl(mm[i].id_tipo_material, []),
          material: new FormControl(mm[i].material, []),
          precio_especial: new FormControl(mm[i].precio_especial, []),
          precio_rural: new FormControl(mm[i].precio_rural, []),
          precio_urbano: new FormControl(mm[i].precio_urbano, []),
          sugerido: new FormControl(mm[i].sugerido, []),
          tipo_material: new FormControl(mm[i].tipo_material, []),
          unidad: new FormControl(mm[i].unidad, []),
          cantidad: new FormControl(this.calcSuperficie(mm[i], size), []),
          adicional: new FormControl('0', []),
        })
      );
      var sql = `UPDATE inspections_danos SET sugeridos_enabled='${
        this.control.value.sugeridos_enabled ?? '0'
      }', alto='${this.control.value.alto ?? 0}', ancho='${
        this.control.value.ancho ?? 0
      }', dscto_pv='${this.control.value.dscto_pv ?? 0}',largo='${
        this.control.value.largo ?? 0
      }', descripcion='${
        this.control.value.descripcion ?? ''
      }', items = '${JSON.stringify(
        this.control.controls.items.value
      )}' WHERE id = '${this.control.value.id}' `;
      console.log(sql)
      if (!this.completed) await this.storage.run(sql);
      this.damageForm.patchValue({
        id: '',
        id_material: '',
        id_tipo_material: '',
        material: '',
        precio_especial: '',
        precio_rural: '',
        precio_urbano: '',
        sugerido: '',
        tipo_material: '',
        superficie: '',
        unidad: '',
      });
      this.results = [];
      this.sectionSelected = null;
    }
    this.refresh();
  }
  async agregarCard(item: any) {
    if(item.id=='') return;
    var size = this.control.value;
    this.control.controls.items.push(
      new FormGroup({
        id: new FormControl(item.id, []),
        id_material: new FormControl(item.id_material, []),
        id_tipo_material: new FormControl(item.id_tipo_material, []),
        material: new FormControl(item.material, []),
        precio_especial: new FormControl(item.precio_especial, []),
        precio_rural: new FormControl(item.precio_rural, []),
        precio_urbano: new FormControl(item.precio_urbano, []),
        sugerido: new FormControl(item.sugerido, []),
        tipo_material: new FormControl(item.tipo_material, []),
        unidad: new FormControl(item.unidad, []),
        superficie: new FormControl(item.superficie, []),
        cantidad: new FormControl(this.calcSuperficie(item, size), []),
        adicional: new FormControl(item.adicional, []),
      })
    );
    var sql = `UPDATE inspections_danos SET alto='${
      this.control.value.alto ?? 0
    }', ancho='${this.control.value.ancho ?? 0}', dscto_pv='${
      this.control.value.dscto_pv ?? 0
    }',largo='${this.control.value.largo ?? 0}', descripcion='${
      this.control.value.descripcion ?? ''
    }', items = '${JSON.stringify(
      this.control.controls.items.value
    )}' WHERE id = '${this.control.value.id}' `;
    console.log(sql)
    if (!this.completed) await this.storage.run(sql);
    this.damageForm.patchValue({
      id: '',
      id_material: '',
      id_tipo_material: '',
      material: '',
      precio_especial: '',
      precio_rural: '',
      precio_urbano: '',
      sugerido: '',
      tipo_material: '',
      superficie: '',
      unidad: '',
    });
    this.results = [];
    this.sectionSelected = null;
    this.refresh();
  }
  editCard(index: any, item: any, control: any) {
    this.dialog.open(MaterialDialogComponent, {
      data: {
        form: item,
        context: control,
        formGroup: this.formGroup.controls.formTipoInmueble,
      },
    });
  }
  removeCard(index: any) {
    this.control.controls.damages.removeAt(index);
  }
  checkStatus() {
    var status = false;
    if (
      this.damageForm.controls.piso.value != '' &&
      this.damageForm.controls.piso_value != ''
    )
      status = true;
    if (
      this.damageForm.controls.muro.value != '' &&
      this.damageForm.controls.muro_value != ''
    )
      status = true;
    if (
      this.damageForm.controls.cielo.value != '' &&
      this.damageForm.controls.cielo_value != ''
    )
      status = true;
    return status;
  }
  filteredImages() {
    return this.images.filter((image: any) =>
      image.filename.includes(this.current)
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
    return Math.round(parseFloat(precio.toString())*100)/100;
  }
  calcSuperficie(item: any, size: any) {
    return Math.round(Calculator.calcSuperficieBySize(item, size)*100)/100;
  }
  calcTotal(item: any, control: any) {
    var factor = 0;
    var largo = control.value.largo ? control.value.largo.toString() : '0';
    var alto = control.value.alto ? control.value.alto : '0';
    var ancho = control.value.ancho ? control.value.ancho : '0';
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
    var cantidad = item.cantidad?item.cantidad!.toString():"0"
    var adicional = item.adicional?item.adicional!.toString():"0";
    return Math.round((
      this.calcPrecio(item) *
      parseFloat(cantidad) *
      (1 + parseFloat(adicional) / 100)
    )*100)/100;
  }
  count(label: string) {
    return '';
  }
  total(control: any) {
    var t = 0;
    for (var i = 0; i < control.controls.items.length; i++) {
      t += this.calcTotal(control.value.items[i], control);
    }
    return t;
  }
  selectMaterial(item: any) {
    this.damageForm.patchValue({
      ...item,
    });
  }
  selectSection(section: any) {
    this.clearForm();
    this.sectionSelected = section;
  }
  openDeleteItemDialog(index: any, item: any) {
    var dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { title: 'Eliminar Material' },
    });
    dialogRef.afterClosed().subscribe(async (data) => {
      if (data) {
        this.control.controls.items.removeAt(index);
        var sql = `UPDATE inspections_danos SET alto='${
          this.control.value.alto ?? 0
        }', ancho='${this.control.value.ancho ?? 0}', dscto_pv='${
          this.control.value.dscto_pv ?? 0
        }',largo='${this.control.value.largo ?? 0}', items = '${JSON.stringify(
          this.control.controls.items.value
        )}' WHERE id = '${this.control.value.id}' `;
        console.log(sql)
        if (!this.completed) await this.storage.run(sql);
        const toast = await this.toastController.create({
          message: 'Material eliminado con éxito',
          position: 'bottom',
          duration: 1000,
          cssClass: 'toast-success',
        });
        toast.present();
      }
    });
  }

  async removeItem(index: any, item: any) {
    this.control.controls.items.removeAt(index);
    var s = this.control.controls.items.value.length
      ? `'${JSON.stringify(this.control.controls.items.value)}'`
      : 'NULL';
    var sql = `UPDATE inspections_danos SET alto='${
      this.control.value.alto ?? 0
    }', ancho='${this.control.value.ancho ?? 0}', dscto_pv='${
      this.control.value.dscto_pv ?? 0
    }',largo='${this.control.value.largo ?? 0}', items = ${s} WHERE id = '${
      this.control.value.id
    }' `;
    console.log(sql)
    if (!this.completed) await this.storage.run(sql);
    this.refresh();
    const toast = await this.toastController.create({
      message: 'Material eliminado con éxito',
      position: 'bottom',
      duration: 1000,
      cssClass: 'toast-success',
    });
    toast.present();
  }
  async updateDescription() {
    var sql = `UPDATE inspections_danos SET descripcion='${
      this.control.value.descripcion ?? 0
    }' WHERE id = '${this.control.value.id}' `;
    if (!this.completed) await this.storage.run(sql);
  }
  formatCurrency(val: any) {
    return val.toLocaleString('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  totalAll() {
    var t = 0;
    var d = this.formGroup.controls.formDanosDelEdificio.controls;
    for (var i = 0; i < d.length; i++) {
      var dd = JSON.parse(d[i].value.items);
      if (dd != null) {
        for (var j = 0; j < dd.length; j++) {
          t += this.calcTotal(dd[j], d[i]);
        }
      }
    }
    return this.formatCurrency(parseFloat(t.toString()));
  }

  toggleSummary() {
    this.stateService.setSummary(!this.summary);
  }

  toggleSummaryFalse() {
    this.stateService.setSummary(false);
  }
}
