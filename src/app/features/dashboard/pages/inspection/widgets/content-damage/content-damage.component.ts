import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonTextarea, IonProgressBar,IonFab,IonFabButton, IonLabel, IonSelect, IonSelectOption, IonHeader, IonToolbar, IonTitle, IonContent, IonSegmentButton, IonCardHeader, IonItem, IonSegment, IonCardContent, IonCardTitle, IonCard, IonApp, IonList, IonCheckbox, IonAccordionGroup, IonAccordion, IonCol, IonRow, IonGrid, IonSearchbar, IonInput, IonToggle } from '@ionic/angular/standalone';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { IncrementalComponent } from 'src/app/widgets/incremental/incremental.component';

import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { PhoneMaskDirective } from 'src/app/directives/phone-mask/phone-mask.directive';


@Component({
  selector: 'app-content-damage',
  templateUrl: './content-damage.component.html',
  styleUrls: ['./content-damage.component.scss'],
  imports: [PhoneMaskDirective,IonToggle, IonInput, IonSearchbar, IonGrid, IonRow, IonCol, IonAccordion, IonAccordionGroup, IonCheckbox, IonList, IonCard, IonCardTitle, IonCardContent, IonSegment, IonItem, IonCardHeader, IonSegmentButton, IonContent, IonTitle, IonToolbar, IonHeader, CommonModule, IonTextarea, IonIcon, IonButton, IonProgressBar,IonFab,IonFabButton,IonLabel,IonSelect,IonSelectOption,FormsModule,ReactiveFormsModule,TranslationPipe, IncrementalComponent],
  standalone: true,
})
export class ContentDamageComponent implements OnInit {
  @Input("id") id:any;
  @Input("formGroup") formGroup:any;
  @Output("onUpdated") onUpdated:any = new EventEmitter();
  documentos:any = [];
  companias:any = [];
  updated = true;
  contenidoFormGroup= new FormGroup( {
    producto: new FormControl("",[Validators.required]),
    marca: new FormControl("",[Validators.required]),
    modelo: new FormControl("",[]),
    cantidad: new FormControl("",[Validators.required,Validators.min(1)]),
  });

  tercerosFormGroup= new FormGroup( {
    nombre: new FormControl("",[Validators.required]),
    telefono: new FormControl("",[]),
    correo: new FormControl("",[]),
    direccion: new FormControl("",[Validators.required,Validators.min(1)]),
    observacion: new FormControl("",[Validators.required,Validators.min(1)]),
  });


  judicialesForm= new FormGroup( {
    unidad_policial: new FormControl("",[Validators.required]),
    n_parte: new FormControl("",[Validators.required]),
    cuerpo_bombero: new FormControl("",[Validators.required]),
    nombre_denunciante: new FormControl("",[Validators.required]),
  }); 


  products:any = []
  showCompanyList1: boolean = false;
  showCompanyList2: boolean = false;
  tercerosList: any[] = [];
  selectedSegment: string = 'contenidos';
  showForm1: boolean = false;
  showForm2: boolean = false;
  compania1Checked: boolean = false;
  compania2Checked: boolean = false;
  compania3Checked: boolean = false;
  companiaAChecked: boolean = false;
  companiaBChecked: boolean = false;
  companiaCChecked: boolean = false;
  tercero = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  };
  judicial = {
    unidadPolicial: '',
    nParte: '',
    cuerpoBombero: '',
    denunciante: ''
  };
  aseguradoraSeleccionada:any = {
    id:0,
    id_aseguradora:0,
    seguradora:"",
  };
  documentosSeleccionados:any = [];
  constructor(private storage:StorageService,private route:ActivatedRoute){}
  ngOnInit() {
    this.init();
  }

  async init(){
    this.formGroup.controls.formDanosDelContenido.setValue(1);
    var d = await this.storage.select("SELECT * FROM documentos");
    this.documentos = d;
    var d1 = await this.storage.select("SELECT * FROM aseguradoras");
    this.companias = d1;

    this.route.paramMap.subscribe(async (data: any) => {
      this.id = data.get('id')?.toString();
      this.refresh();
    });
  }
  onSegmentChanged(value: any) {
    this.selectedSegment = value;
  }
  async refresh(){

    this.tercerosList = await this.storage.select(`SELECT * FROM inspecciones_terceros WHERE inspection_id = '${this.id}'`);
    this.products = await this.storage.select(`SELECT * FROM inspecciones_contenidos  WHERE inspection_id = '${this.id}'`);
    this.showForm1 = this.tercerosList.length !=0;

    var judiciales = await this.storage.select(`SELECT * FROM inspeccion_meta  WHERE inspection_id = '${this.id}' AND label='JUDICIALES'`);
    if(judiciales.length>0){
      this.judicialesForm.patchValue(JSON.parse(judiciales[0].data))
      this.showForm2 = true;
    }
    var aseguradora = await this.storage.select(`SELECT * FROM inspeccion_meta  WHERE inspection_id = '${this.id}' AND label='ASEGURADORA'`);
    if(aseguradora.length>0){
      this.aseguradoraSeleccionada = JSON.parse(aseguradora[0].data)
    }
    var documentos = await this.storage.select(`SELECT * FROM inspeccion_meta  WHERE inspection_id = '${this.id}' AND label='DOCUMENTOS'`);
    if(documentos.length>0){
      this.documentosSeleccionados = JSON.parse(documentos[0].data)
    }
  }
  toggleForm1(event: any) {
    this.showForm1 = event.detail.checked;
    console.log('Show Form:', this.showForm1);
  }
  

  async toggleForm2(event: any) {
    this.showForm2 = event.detail.checked;
    if(!this.showForm2){
      await this.storage.run(`DELETE FROM inspeccion_meta WHERE inspection_id = '${this.id}' AND label='JUDICIALES'`);
    }
    console.log('Show Form:', this.showForm2);
  }
  


  onSubmit() {
    this.tercerosList.push({ ...this.tercero });
    this.tercero = {
      nombre: '',
      telefono: '',
      correo: '',
      direccion: ''
    };

    this.showForm1 = false;
  }


  toggleCompanyList1() {
    this.showCompanyList1 = !this.showCompanyList1;
  }

  toggleCompanyList2() {
    this.showCompanyList2 = !this.showCompanyList2;
  }

  async add(){
    this.updated =false;
    await this.storage.insert("inspecciones_contenidos",{
      inspection_id:this.id,
      nombre:this.contenidoFormGroup.controls.producto.value,
      marca_modelo:`${this.contenidoFormGroup.controls.marca.value} | ${this.contenidoFormGroup.controls.modelo.value}`,
      cantidad:this.contenidoFormGroup.controls.cantidad.value,
    })
    this.contenidoFormGroup.patchValue({
      producto: "",
      marca:"",
      modelo:"",
      cantidad: "",
    })
    this.refresh();
    setTimeout(()=>{
      this.updated =true;
    },10)
  }
  async addTercero(){
    this.updated =false;
    await this.storage.insert("inspecciones_terceros",{
      inspection_id:this.id,
      nombre:this.tercerosFormGroup.controls.nombre.value,
      telefono:this.tercerosFormGroup.controls.telefono.value,
      correo:this.tercerosFormGroup.controls.correo.value,
      direccion:this.tercerosFormGroup.controls.direccion.value,
      observacion:this.tercerosFormGroup.controls.observacion.value,
    })
    this.tercerosFormGroup.patchValue({
      nombre: "",
      correo:"",
      telefono:"",
      direccion: "",
      observacion: "",
    })
    this.refresh();
    setTimeout(()=>{
      this.updated =true;
    },10)
  }
  async removeProduct(id:number){
    await this.storage.run(`DELETE FROM inspecciones_contenidos  WHERE id = '${id}'`);
    this.refresh();
  }
  async removeTercero(id:number){
    console.log(id);
    await this.storage.run(`DELETE FROM inspecciones_terceros WHERE id = '${id}'`);
    console.log("ABC");
    this.refresh();
  }
  async guardarJudiciales(){
    await this.storage.run(`DELETE FROM inspeccion_meta WHERE inspection_id = '${this.id}' AND label='JUDICIALES'`);
    await this.storage.insert("inspeccion_meta",{
      inspection_id:this.id,
      label:'JUDICIALES',
      data:JSON.stringify(this.judicialesForm.value)
    });
  }
  async selectAseguradora(item:any){
    this.aseguradoraSeleccionada = item;
    await this.storage.run(`DELETE FROM inspeccion_meta WHERE inspection_id = '${this.id}' AND label='ASEGURADORA'`);
    if(item!=null){
      await this.storage.insert("inspeccion_meta",{
        inspection_id:this.id,
        label:'ASEGURADORA',
        data:JSON.stringify(item)
      });
    }
  }
  async selectDocumento(item:any){
    if(!this.checkDocumento(item)){
      this.documentosSeleccionados.push(item)
    }
    else{
      this.documentosSeleccionados =  this.documentosSeleccionados.filter((it:any)=>it.id != item.id);
    }
    await this.storage.run(`DELETE FROM inspeccion_meta WHERE inspection_id = '${this.id}' AND label='DOCUMENTOS'`);
    await this.storage.insert("inspeccion_meta",{
      inspection_id:this.id,
      label:'DOCUMENTOS',
      data:JSON.stringify(this.documentosSeleccionados)
    });
  }
  checkDocumento(item:any){
    return this.documentosSeleccionados.filter((it:any)=>it.id == item.id).length>0
  }
}

