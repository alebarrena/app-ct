import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {IonGrid,IonCol,IonRow,IonIcon,IonButton,IonInput} from '@ionic/angular/standalone';
import { Calculator } from 'src/app/helpers/calculator/calculator';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { IncrementalComponent } from 'src/app/widgets/incremental/incremental.component';

@Component({
  selector: 'app-material-dialog',
  templateUrl: './material-dialog.component.html',
  styleUrls: ['./material-dialog.component.scss'],
  imports:[CommonModule,FormsModule,ReactiveFormsModule,IonGrid,IonCol,IonRow,IonIcon,IonButton,TranslationPipe,IonInput,IncrementalComponent],
  standalone:true,
})
export class MaterialDialogComponent implements OnInit {
  materialForm = new FormGroup({
    adicional: new FormControl("",[]),
    altura: new FormControl("",[]),
    ancho: new FormControl("",[]),
    cantidad: new FormControl("",[]),
    dscto_pv: new FormControl("",[]),
    id: new FormControl("",[]),
    id_material: new FormControl("",[]),
    id_tipo_material: new FormControl("",[]),
    largo: new FormControl("",[]),
    material: new FormControl("",[]),
    precio_especial: new FormControl("",[]),
    precio_rural: new FormControl("",[]),
    precio_urbano: new FormControl("",[]),
    sugerido: new FormControl("",[]),
    tipo_material: new FormControl("",[]),
    unidad: new FormControl("",[]),
  });
  context:any;
  formGroup:any;
  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.materialForm = this.data.form;
    this.context = this.data.context;
    this.formGroup = this.data.formGroup;
   // console.log(this.material);
  }

  ngOnInit() {}
  calcPrecio() {
    var precio = 0;
    console.log(this.formGroup.value)
    if (this.formGroup.value.tipo_zona == 'urbana') {
      precio = parseFloat(this.materialForm.value.precio_urbano!.toString());
    }
    if (this.formGroup.value.tipo_zona == 'rural') {
      precio = parseFloat(this.materialForm.value.precio_rural!.toString());
    }
    if (this.formGroup.value.tipo_zona == 'especial') {
      precio = parseFloat(this.materialForm.value.precio_especial!.toString());
    }
    return Math.round((precio*100)/100);
  }
  calcTotal(item: any,control:any) {
    var factor = 0;
    if (item.id_tipo_material == 1) {
      // Pisps
      if(item.unidad =='m3') factor =  Calculator.calc().pisos.m3(null, parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
      if(item.unidad =='m2') factor = Calculator.calc().pisos.m2(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
      if(item.unidad =='m') factor = Calculator.calc().pisos.m(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
    }
    if (item.id_tipo_material == 2) {
      // Muros
      if(item.unidad =='m3') factor = Calculator.calc().muros.m3(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
      if(item.unidad =='m2') factor = Calculator.calc().muros.m2( parseFloat(control.value.alto.toString()),  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
      if(item.unidad =='m') factor = Calculator.calc().muros.m(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
    }
    if (item.id_tipo_material == 3) {
      // Cielos
      if(item.unidad =='m3') factor = Calculator.calc().cielo.m3(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
      if(item.unidad =='m2') factor = Calculator.calc().cielo.m2( null, parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
      if(item.unidad =='m') factor = Calculator.calc().cielo.m(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
    }
    if(factor==0){
      if(item.unidad =='m3') factor = Calculator.calc().otros.m3(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
      if(item.unidad =='m2') factor = Calculator.calc().otros.m2(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
      if(item.unidad =='m') factor = Calculator.calc().otros.m(null,  parseFloat(control.value.largo.toString()), parseFloat(control.value.ancho.toString()));
    }
    return Math.round((factor * this.calcPrecio() * parseFloat(this.materialForm.value.cantidad!.toString()) * (1 + (parseFloat(this.materialForm.value.adicional!.toString())/100)))*100)/100;
  }
}
