import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IonButton,IonLabel,IonItem,IonInput } from "@ionic/angular/standalone";
import { StorageService } from 'src/app/helpers/database/storage/storage.service';

@Component({
  selector: 'app-expense-dialog',
  templateUrl: './expense-dialog.component.html',
  styleUrls: ['./expense-dialog.component.scss'],
  standalone:true,
  imports: [FormsModule, ReactiveFormsModule, IonButton,IonLabel,IonItem,IonInput],
})
export class ExpenseDialogComponent  implements OnInit {

  gasto = {
    descripcion: '',
    categoria: '',
    monto: null,
    fecha: '',
    hora: '',
  };
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private dialogRef:MatDialogRef<ExpenseDialogComponent>,private storage:StorageService) {}

  ngOnInit() {
    if (this.data && this.data.gasto) {
      this.gasto = { ...this.data.gasto };
    }
  }
  guardar() {
    // Aquí puedes emitir el gasto o procesarlo
   // alert('Gasto guardado: ' + JSON.stringify(this.gasto));
    // Resetear el formulario si lo deseas
    this.gasto = {
      descripcion: '',
      categoria: '',
      monto: null,
      fecha: '',
      hora: '',
    };
  }

  cancelar() {
    // Cerrar el diálogo o limpiar el formulario
    this.gasto = {
      descripcion: '',
      categoria: '',
      monto: null,
      fecha: '',
      hora: '',
    };
  }



}
