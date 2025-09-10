import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  IonCol,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { Swiper } from 'swiper/types';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-inspection-modules',
  templateUrl: './inspection-modules.component.html',
  styleUrls: ['./inspection-modules.component.scss'],
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
    IonInput,
    RouterModule
  ],
})
export class InspectionModulesComponent  implements OnInit {
  @Input('swiper') swiper?:Swiper;
  @Input('formGroup') formGroup?:FormGroup;
  @Output() onSelected:any =  new EventEmitter<any>();
  @Output() onSelect:any =  new EventEmitter<any>();
  @Output() onInit:any =  new EventEmitter<any>();
  modules:any = [ ];
  constructor(
    private toastController: ToastController) {}
  checkIcon = true;
  ngOnInit() {
    this.onInit.emit('');
    this.modules =[
      {label:"Antecedentes Generales",tag:"mo_ag",name:"general-background",control:this.formGroup!.get('formAntecedentesGenerales')},
      {label:"Relato Asegurado",tag:"mo_ra",name:"insured-story",control:this.formGroup!.get('formRelatoAsegurado')},
      {label:"Tipo edificacion",tag:"ma_te",name:"building-type",control:this.formGroup!.get('formTipoInmueble')},
      {label:"Sectores Afectados",tag:"ma_sa",name:"affected-sectors",control:this.formGroup!.get('formSectoresAfectados')},
      {label:"Daños del Edificio",tag:"ma_de",name:"building-damage",control:this.formGroup!.get('formDanosDelEdificio')},
      {label:"Daños del Contenido",tag:"ma_dc",name:"content-damage",control:this.formGroup!.get('formDanosDelContenido')},
    ]
 
  }
  async goTo(key:string){
    var s = this.modules.map((item:any)=>item.name);
    if(s.indexOf(key)>0){
      this.onSelected.emit(key);
      /*if(this.modules[s.indexOf(key)-1].control.valid) this.onSelected.emit(key);
      else{
        const toast = await this.toastController.create({
          message: "Debes completar el paso anterior",
          position: 'bottom',
          duration: 1000,
          cssClass: "toast-danger",
        });
        toast.present();
      }*/
    }
    else{
      this.onSelected.emit(key);
    }
  }
  check(mod:any){
    if(mod.control.valid) return 3;
    if(mod.control.invalid) return 2;
    return 1;
  }
  checkStyle(mod:any){
    if(this.check(mod) == 1) return "trash"
    if(this.check(mod) == 2) return "pending"
    if(this.check(mod) == 3) return "check"
    return '--'
  }
  checkName(mod:any){
    if(this.check(mod) == 1) return 'alert-circle-sharp';
    if(this.check(mod) == 2) return 'remove-circle-sharp';
    if(this.check(mod) == 3) return 'checkmark-circle';
    return '--'
  }
}
