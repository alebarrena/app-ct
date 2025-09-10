import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-incremental',
  templateUrl: './incremental.component.html',
  styleUrls: ['./incremental.component.scss'],
  standalone:true,
  imports:[CommonModule,IonButton,IonInput,IonIcon]
})
export class IncrementalComponent  implements OnInit {
  value:number = 0;
  @Output('onUpdated') onUpdated = new EventEmitter();
  @Input('control') formControl?:any;
  @Input('initial') initial?:any;
  @Input('suffix') suffix:string = "";
  @Input('plusminus') plusminus:boolean = false;
  constructor() { }

  ngOnInit() {
    this.value = this.initial!=null?parseInt(this.initial.toString()):0;
  }
  plus(){
    this.value = parseInt(this.value.toString())+1;
    if(this.formControl!=null) this.formControl?.setValue(this.value.toString());
    this.onUpdated.emit(this.value.toString())
  }
  minus(){
    if(this.value>0) this.value = this.value-1;
    if(this.formControl!=null) this.formControl?.setValue(this.value.toString());
    this.onUpdated.emit(this.value.toString())
  }
}
