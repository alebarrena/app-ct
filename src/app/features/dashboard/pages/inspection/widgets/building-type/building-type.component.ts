import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonIcon,IonButton,IonSegment,IonSegmentButton,IonLabel,IonGrid,IonRow,IonCol,IonInput,IonAccordion,IonAccordionGroup,IonItem,IonToggle, IonTextarea,IonRadioGroup,IonRadio} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { IncrementalComponent } from 'src/app/widgets/incremental/incremental.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';

import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';


@Component({
  selector: 'app-building-type',
  templateUrl: './building-type.component.html',
  styleUrls: ['./building-type.component.scss'],
  imports:[CommonModule,IonIcon,IonButton,IonSegment,IonSegmentButton,IonLabel,IonGrid,IonRow,IonCol,IonInput,IonAccordion,IonAccordionGroup,IonItem,IonToggle,TranslationPipe,IncrementalComponent,FormsModule,ReactiveFormsModule,IonTextarea,IonRadioGroup,IonRadio],
  standalone:true
})
export class BuildingTypeComponent  implements OnInit {
  @Input("formGroup") formGroup:any;
  zones:any = [];
  seguridad:any = [];
  initialize = false;
  constructor(private storage:StorageService) { }

  ngOnInit() {
    console.log(this.formGroup.value)
    this.init();
  }
 groupBy = (array:any, key:string) => {
    return array.reduce((acc:any, item:any) => {
      acc[item[key]] = acc[item[key]] || [];
      acc[item[key]].push(item);
      return acc;
    }, {});
  }
  removeDuplicates(arrayObjetos:any,key:string) {
    const nombresUnicos = new Set();
    const resultado:any = [];

    arrayObjetos.forEach((objeto:any) => {
        if (!nombresUnicos.has(objeto[key])) {
            nombresUnicos.add(objeto[key]);
            resultado.push(objeto);
        }
    });

    return resultado;
}
  async init(){
    try {
    var d = await this.storage.select('SELECT * FROM materialidades;');
    var groupedData = this.groupBy(d,'materialidad');
    const result = Object.keys(groupedData).map(key => ({
      key: key,
      label: groupedData[key][0]['valorformulario'],
      values: this.removeDuplicates( groupedData[key],'tipo_materialidad')
    }));
    console.log("MATERIALIDAD",result)
    this.zones = result;
    var d = await this.storage.select('SELECT * FROM seguridades;');
    var groupedData = this.groupBy(d,'seguridad');
    const dd = Object.keys(groupedData).map(key => ({
      key: key,
      label: groupedData[key][0]['valorformulario'],
      values: this.removeDuplicates( groupedData[key],'tipo_seguridad')
    }));
    this.seguridad = dd; 
    console.log("SEGURIDAD",this.seguridad)
    } catch (error) {
    }
    this.initialize = true;
  }
  async openCamera(){
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

  }
  async onSubmit(event:Event){

  }
  async openGallery(){
    const images = await Camera.pickImages({
      quality: 100
    });
    console.log(images)
  }
  handleType(type:string){
    this.formGroup.controls.Tipo_Inmueble1.setValue(type);
  }
  handleZone(zone:string,value:string){}
  checkZone(zone:string,value:string){
    return true;
  }
  handleSecurityZone(zone:string,value:string){}
  checkSecurityZone(zone:string,value:string){
    return true;
  }
  check(keyform:string,valuename:string,keyvalue:string,value:string){
    this.formGroup.controls[keyform].setValue(valuename)
    this.formGroup.controls[keyvalue].setValue(value)
  }
  val(a:any){
    if(a==null) return 0;
    var d = parseInt((a.toString()));
    if(isNaN(d)) return 0
    return d;
  }
  select(val:any){
    var d:any = [];
    if(this.formGroup.controls[val.valorformulario].value!=null){
      d = JSON.parse(this.formGroup.controls[val.valorformulario].value);
    }
    var dlk = d.filter((item:any)=>item == val.tipo_materialidad);
    if(dlk.length>0){
      d = d.filter((item:any)=>item != val.tipo_materialidad);
    }
    else{
      d.push(val.tipo_materialidad);
    }
    this.formGroup.controls[val.valorformulario].value = JSON.stringify(d);//val.tipo_materialidad
  }
  selectSeguridad(val:any){
    var d:any = [];
    if(this.formGroup.controls[val.valorformulario].value!=null){
      d = JSON.parse(this.formGroup.controls[val.valorformulario].value);
    }
    var dlk = d.filter((item:any)=>item == val.tipo_seguridad);
    if(dlk.length>0){
      d = d.filter((item:any)=>item != val.tipo_seguridad);
    }
    else{
      d.push(val.tipo_seguridad);
    }
    this.formGroup.controls[val.valorformulario].value = JSON.stringify(d);//val.tipo_materialidad
  }
}
