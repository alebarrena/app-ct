import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  IonModal,
  IonButtons,
  IonImg,
  IonAvatar,
  IonText,
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { Dialog } from '@capacitor/dialog';
import { Inspection } from 'src/app/models/inspection/inspection';
import { ControlContainer } from '@angular/forms';
import { PhoneMaskDirective } from 'src/app/directives/phone-mask/phone-mask.directive';
import { DateValidator } from 'src/app/helpers/date-validator/date-validator';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';

@Component({
  selector: 'app-general-background',
  templateUrl: './general-background.component.html',
  styleUrls: ['./general-background.component.scss'],
  standalone: true,
  imports: [
    IonTextarea,
    IonText,
    IonAvatar,
    IonImg,
    IonButtons,
    IonModal,
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
    RouterModule,
    IonModal,
    IonDatetime,
    IonDatetimeButton,
    PhoneMaskDirective,
  ],
})
export class GeneralBackgroundComponent implements OnInit {
  @Input('inspection') inspection?: Inspection;
  @Input('formMain') formMain?: any;
  @Input('formGroup') form?: any;
  @ViewChild(IonModal) modal?: IonModal;
  @Output('onUpdated') onUpdated = new EventEmitter();
  @Output('nextSection') nextSection = new EventEmitter();
  @Output('onSelected') onSelected = new EventEmitter();
  current_date = new Date();
  limitDate = "";
  field?: string;
  date_event: any;
  id?: string;
  constructor(
    private controlContainer: ControlContainer,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.limitDate = `${this.current_date.getFullYear()}-${(this.current_date.getMonth()+1).toString().padStart(2,"0")}-${this.current_date.getDate().toString().padStart(2,"0")}`
    this.current_date = new Date(
      Date.parse(
        this.form.controls.detallesAsegurado.controls.fecha_inspeccion.value
      )
    );
    //console.log(this.form);
    setInterval(() => {
      //this.current_date = new Date();
    }, 1000);
    // this.form = <FormGroup>this.controlContainer.control;

    this.route.paramMap.subscribe((data: any) => {
      this.id = data.get('id')?.toString();
      this.onSelected.emit("")
    });
  }
  async editValue(key: any) {}

  datePick() {
    this.date_event = this.date_event.substring(0, 10);
  }
  cancel() {
    this.modal!.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal!.dismiss('', 'confirm');
  }

  onWillDismiss(event: Event) {}

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
  async onSubmit() {
    var dd = {
      ...this.form.value.detallesAsegurado,
      ...this.form.value.datosContacto,
      ...this.form.value.datosEntrevistado,
      ...this.form.value.datosSiniesto,
      ...this.form.value.datosComunidad
    };
    var d = await this.storage.update(
      'inspecciones_cabecera',
      `cod_inspeccion = '${this.id}'`,
      this.removeEmpty(dd)
    );

    const toast = await this.toastController.create({
      message: "Guardado con éxito",
      position: 'bottom',
      duration: 1000,
      cssClass: 'toast-success',
    });
    toast.present();
    this.nextSection.emit();
  }
  formatDate(date:Date){
    return `${date.getDate().toString().padStart(2,"0")}/${(date.getMonth()+1).toString().padStart(2,"0")}/${date.getFullYear()}`;
  }
  formatHours(date:Date){
    return `${date.getHours().toString().padStart(2,"0")}:${(date.getMinutes()).toString().padStart(2,"0")}`;
  }
}
