import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { PageLayoutComponent } from 'src/app/widgets/page-layout/page-layout.component';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseDialogComponent } from '../../dialogs/expense-dialog/expense-dialog.component';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonItem,
    IonList,
    IonButton,
    IonIcon,
    IonInput,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    PageLayoutComponent,
    TranslationPipe,
  ],
})
export class ExpensesPage implements OnInit {
  nuevoGasto = {
    descripcion: '',
    fecha: '',
    hora: '',
    monto: null,
    categoria: '',
  };
  filteredList: any;
  type_filter: any;

  gastosEjemplo = [
    {
      descripcion: 'Compra de materiales',
      fecha: '2025-08-01 10:30:00',
      monto: 120.50,
      categoria: 'Materiales',
    },
    {
      descripcion: 'Pago de servicios',
      fecha: '2025-08-03 15:45:00',
      monto: 80.00,
      categoria: 'Servicios',
    },
    {
      descripcion: 'Transporte',
      fecha: '2025-08-05 08:10:00',
      monto: 35.75,
      categoria: 'Transporte',
    },
  ];

  constructor(private dialog: MatDialog, private storage: StorageService) {}

  ngOnInit() {}

  onSubmit($event: Event) {
    // Aquí puedes implementar la lógica de búsqueda si lo deseas
  }

  agregarGasto() {
    this.dialog.open(ExpenseDialogComponent, {
      width: '400px',
      data: {
        nuevoGasto: this.nuevoGasto,
        gastosEjemplo: this.gastosEjemplo,
      },
    });
  }

  guardarGasto() {
    if (
      this.nuevoGasto.descripcion &&
      this.nuevoGasto.fecha &&
      this.nuevoGasto.hora &&
      this.nuevoGasto.monto &&
      this.nuevoGasto.categoria
    ) {
      const fechaCompleta = `${this.nuevoGasto.fecha} ${this.nuevoGasto.hora}`;
      this.gastosEjemplo.push({
        descripcion: this.nuevoGasto.descripcion,
        fecha: fechaCompleta,
        monto: this.nuevoGasto.monto,
        categoria: this.nuevoGasto.categoria,
      });
      this.nuevoGasto = {
        descripcion: '',
        fecha: '',
        hora: '',
        monto: null,
        categoria: '',
      };
      alert('Gasto agregado');
    } else {
      alert('Por favor, completa todos los campos');
    }
  }

  cancelarDialogo() {
    this.nuevoGasto = {
      descripcion: '',
      fecha: '',
      hora: '',
      monto: null,
      categoria: '',
    };
  }

  verDetalle(gasto: any) {
    this.dialog.open(ExpenseDialogComponent, {
      width: '400px',
      data: {
        gasto: gasto
      }
    });
  }

  getTotalGastos(){
    return this.gastosEjemplo.reduce((total, gasto) => total + gasto.monto, 0);
  }
}
